---
lang: zh-CN
title: Embedded Linux
titleTemplate: Linux 启动流程
description: Linux 启动流程
head:
  - - meta
    - name: description
      content: Linux 启动流程
  - - meta
    - name: keywords
      content: Embdedded Linux Boot 启动流程
layout: doc
navbar: true
sidebar: true
aside: true
outline: deep
lastUpdated: Date
footer: true
---
# Linux启动流程

Linux 系统从按下电源键到完全启动完成，涉及硬件初始化、固件引导、操作系统加载、内核初始化以及用户空间服务启动等多个阶段。以下是详细流程，适用于典型的 x86 架构嵌入式或通用 Linux 系统（以 BIOS/UEFI + GRUB + Linux 内核 + systemd 为例）：

---

## 一、硬件上电与固件阶段（Pre-OS）

1. **电源上电与硬件复位**
   - 按下电源键后，电源管理单元（PMU）向主板供电。
   - CPU 复位，从预定义地址（如 0xFFFFFFF0）开始执行指令。

2. **固件执行（BIOS 或 UEFI）**
   - **BIOS（传统）**：
     - 执行加电自检（POST, Power-On Self Test），检测关键硬件（CPU、内存、显卡等）。
     - 枚举并初始化基本外设（如串口、USB 控制器）。
     - 读取 CMOS 设置，确定启动设备顺序。
     - 从启动设备（如硬盘、SD 卡、eMMC、网络）读取 **MBR（主引导记录）** 的前 512 字节。
   - **UEFI（现代）**：
     - 初始化 UEFI 驱动，支持更多硬件和文件系统（如 FAT32）。
     - 从 EFI 系统分区（ESP）加载 **.efi** 格式的引导程序（如 `grubx64.efi`）。
     - 支持安全启动（Secure Boot）等安全机制。

---

## 二、引导加载程序阶段（Bootloader）

3. **加载第一阶段 Bootloader**
   - 在 BIOS 模式下，MBR 中的 446 字节代码（即 Stage 1 bootloader）被执行。
   - 该代码通常不足以加载完整内核，因此会加载 **第二阶段引导程序**（如 GRUB2 的 `core.img`）。

4. **GRUB2（或 U-Boot，在嵌入式系统中更常见）**
   - **GRUB2（x86 PC）**：
     - 加载配置文件（如 `/boot/grub/grub.cfg`）。
     - 显示启动菜单（可选）。
     - 加载 **Linux 内核镜像**（如 `vmlinuz`）和 **初始内存盘**（`initramfs` 或 `initrd`）到内存。
   - **U-Boot（嵌入式 ARM/MIPS 等）**：
     - 从 Flash、SD、eMMC 或网络（TFTP/NFS）加载内核和设备树（Device Tree Blob, `.dtb`）。
     - 设置启动参数（bootargs），如 `console=ttyS0,115200 root=/dev/mmcblk0p2`。

---

## 三、Linux 内核启动阶段

5. **内核解压与初始化（`head.S` → `start_kernel()`）**
   - 内核镜像通常是压缩的（如 `zImage` 或 `bzImage`），首先自解压。
   - 跳转到 `start_kernel()`（位于 `init/main.c`），开始 C 语言初始化。

6. **关键内核子系统初始化**
   - 设置中断描述符表（IDT）、页表（启用 MMU）、调度器、内存管理（slab/zoned buddy）、RCU。
   - 初始化控制台（console）驱动，允许内核打印日志。
   - 挂载 **根文件系统**：
     - 若使用 `initramfs`：将其作为临时根文件系统（tmpfs），执行其中的 `/init` 脚本。
     - `/init` 脚本负责加载必要驱动（如 SATA、NVMe、ext4 模块），然后 `switch_root` 切换到真正的根文件系统（如 `/dev/sda2`）。
     - 若无 `initramfs`，内核直接挂载 `root=` 指定的设备（需内置对应驱动）。

7. **启动用户空间第一个进程**
   - 内核调用 `run_init_process()`，尝试执行以下之一：
     - `/sbin/init`
     - `/etc/init`
     - `/bin/init`
     - `/bin/sh`（若前几个都失败）
   - 此进程 PID = 1，成为所有用户进程的祖先。

---

## 四、用户空间初始化（Init System）

8. **Init 系统启动（现代多为 systemd）**
   - **systemd（主流发行版）**：
     - 解析 `/etc/systemd/system/default.target`（通常链接到 `graphical.target` 或 `multi-user.target`）。
     - 并行启动依赖的服务（`.service` 单元），如：
       - `udev`：设备管理
       - `networkd` / `NetworkManager`：网络配置
       - `getty@tty1.service`：登录终端
       - `dbus`：进程间通信
     - 执行 `sysinit.target` → `basic.target` → `multi-user.target` 等阶段。
   - **SysV init（传统）**：
     - 读取 `/etc/inittab`，进入指定运行级别（如 3 或 5）。
     - 顺序执行 `/etc/rc.d/rc3.d/` 下的启动脚本（S 开头）。

9. **系统启动完成**
   - 登录提示符出现（文本或图形界面）。
   - 所有关键服务运行正常。
   - 用户可登录并执行命令。

---

## 补充说明（嵌入式场景）

- **无硬盘系统**：根文件系统可能位于 RAM（initramfs）、MTD Flash（JFFS2/UBIFS）或通过 NFS 挂载。
- **无 initramfs**：需将所有必要驱动编译进内核（`CONFIG_XXX=y` 而非 `=m`）。
- **设备树（Device Tree）**：ARM 等架构依赖 `.dtb` 文件描述硬件，由 Bootloader（如 U-Boot）传递给内核。
- **启动时间优化**：可通过裁剪内核、并行初始化、使用 `systemd-analyze` 分析瓶颈。

---

## 总结流程图（简化）

```text
电源上电
   ↓
BIOS/UEFI（POST + 启动设备选择）
   ↓
Bootloader（GRUB2 / U-Boot）
   ↓
加载 vmlinuz + initramfs + dtb（嵌入式）
   ↓
Linux 内核初始化（MMU、调度器、驱动）
   ↓
挂载根文件系统（通过 initramfs 或直接）
   ↓
启动 /sbin/init（PID=1）
   ↓
systemd 启动目标（target）和服务
   ↓
登录界面 / shell 提示符 → 启动完成
```

### 启动流程图
```mermaid
---
title: 启动流程图
---
flowchart TD
  A[按下电源键] --> B[硬件上电 & CPU复位]
  B --> C{固件类型?}
  C -->|BIOS| D1[执行POST<br>检测CPU/内存/外设]
  C -->|UEFI| D2[初始化UEFI驱动<br>加载ESP中的.efi程序]
  D1 --> E["读取MBR (512字节)"]
  D2 --> F["直接加载Bootloader (如grubx64.efi)"]
  E --> G[加载Bootloader Stage 1]
  G --> H["加载Bootloader Stage 2 (如GRUB2 / core.img)"]
  F --> H
  H --> I{Bootloader类型?}
  I -->|x86 PC| J1[加载vmlinuz + initramfs<br>从/boot/grub/grub.cfg]
  I -->|"嵌入式 (ARM等)" | J2[加载zImage/uImage + initramfs + .dtb<br>通过U-Boot设置bootargs]
  J1 --> K
  J2 --> K
  K[跳转至Linux内核入口] --> L[内核自解压]
  L --> M["start_kernel() - C初始化"]
  M --> N[初始化子系统:<br>中断、MMU、调度器、内存管理]
  N --> O["初始化控制台 (console)"]
  O --> P{是否使用initramfs?}
  P -->|是| Q[挂载tmpfs作为临时根<br>执行/init脚本]
  P -->|否| R[直接挂载root=指定设备]
  Q --> S["加载必要驱动模块<br>(如ext4, mmc, SATA)"]
  S --> T[switch_root 切换到真实根文件系统]
  R --> T
  T --> U["执行 /sbin/init (PID=1)"]
  U --> V{Init系统类型?}
  V -->|systemd| W1[解析default.target<br>并行启动服务:<br>- udev<br>- getty<br>- network<br>- dbus]
  V -->|SysV init| W2[读取/etc/inittab<br>按运行级别顺序启动rc脚本]
  W1 --> X
  W2 --> X
  X[启动完成:<br>登录提示符/图形界面] --> Y[用户可交互]
  
```

### 时序图
```mermaid
---
title: 启动时序图
---
sequenceDiagram
  participant Hardware as 硬件 (CPU/PMU)
  participant Firmware as 固件 (BIOS/UEFI 或 BootROM)
  participant Bootloader as Bootloader (U-Boot / GRUB)
  participant Kernel as Linux 内核
  participant Init as Init 进程 (systemd / init)
  participant User as 用户空间

  Hardware->>Firmware: 上电，CPU复位至固件入口
  activate Firmware
  Firmware->>Firmware: 执行 POST / 初始化基本外设
  Firmware->>Bootloader: 加载并跳转到 Bootloader
  deactivate Firmware

  activate Bootloader
  Bootloader->>Bootloader: 初始化DRAM、串口、存储控制器
  Bootloader->>Bootloader: 加载内核镜像 (zImage)、initramfs、设备树(.dtb)
  Bootloader->>Kernel: 跳转至内核入口，传递dtb地址和bootargs
  deactivate Bootloader

  activate Kernel
  Kernel->>Kernel: 自解压内核
  Kernel->>Kernel: start_kernel() — 初始化调度器/MMU/中断等
  Kernel->>Kernel: 挂载 initramfs（如存在）作为临时根
  Kernel->>Kernel: 执行 /init（来自initramfs）
  Kernel->>Kernel: 加载必要驱动模块（e.g., mmc, ext4）
  Kernel->>Kernel: switch_root 到真实根文件系统
  Kernel->>Init: exec /sbin/init（PID=1）
  deactivate Kernel

  activate Init
  Init->>Init: 初始化用户空间（systemd: 加载target/服务）
  Init->>User: 启动 getty / display-manager
  deactivate Init

  activate User
  User-->>User: 显示登录提示符或图形界面
  note right of User: 系统启动完成
  deactivate User
```
> [!NOTE]
> - **参与者（Participants）** 按启动顺序排列，体现控制权转移。
> - **`activate` / `deactivate`** 表示各组件的活跃生命周期。
> - **嵌入式特色**：明确包含 **设备树（.dtb）** 和 **initramfs** 的加载与使用，这是嵌入式 Linux 的关键环节。
> - **通用性保留**：若为 x86 系统，可将 `Bootloader` 视为 GRUB，`Firmware` 为 BIOS/UEFI，流程依然成立。
> - **关键动作**：如 `switch_root`、`exec /sbin/init`、`传递 bootargs` 等，均为启动链中的技术锚点。

### 纯嵌入式linux启动流程

纯嵌入式linux启动流程如下：
```mermaid
---
title: 纯嵌入式linux启动流程
---
flowchart TD
  A[按下电源键] --> B[硬件上电，CPU复位]
  B --> C[执行片上BootROM代码]
  C --> D["BootROM加载SPL<br>(Secondary Program Loader)<br>到内部SRAM"]
  D --> E[SPL初始化DDR、时钟、基本外设]
  E --> F[SPL加载完整U-Boot<br>到DDR内存]
  F --> G[U-Boot启动]
  G --> H["初始化外设:<br>- 串口(UART)<br>- 存储(eMMC/SD/NAND/SPI-NOR)<br>- 网络(可选)"]
  H --> I["加载启动组件到内存:<br>- Linux内核(zImage/uImage)<br>- 设备树(.dtb)<br>- initramfs(可选)"]
  I --> J{是否使用initramfs?}
  J -->|是| K[设置bootargs:<br>console=ttyS0,... root=/dev/ram0<br>initrd=...]
  J -->|否| L[设置bootargs:<br>console=ttyS0,...<br>root=/dev/mmcblk0p2 或 root=/dev/mtdblock2<br>或 root=/dev/nfs ip=dhcp]
  K --> M
  L --> M
  M["U-Boot跳转至内核入口<br>传递设备树地址(r2寄存器)"]
  M --> N[Linux内核自解压]
  N --> O["start_kernel() 初始化:<br>- MMU<br>- 调度器<br>- 内存管理<br>- 控制台驱动"]
  O --> P{是否存在initramfs?}
  P -->|是| Q["挂载initramfs为临时根文件系统<br>(tmpfs)"]
  P -->|否| R[尝试直接挂载bootargs中指定的root设备]
  Q --> S[执行 /init 脚本]
  S --> T["加载必要内核模块:<br>- 存储驱动 (e.g., dw_mmc)<br>- 文件系统 (e.g., ext4, ubifs, jffs2)"]
  T --> U[使用switch_root切换到真实根文件系统]
  R --> V{挂载成功?}
  V -->|否| W[Kernel panic: Unable to mount root fs]
  V -->|是| X[继续启动]
  U --> X
  X --> Y["exec /sbin/init (PID=1)"]
  Y --> Z{Init系统类型?}
  Z -->|systemd| AA[启动multi-user.target等服务]
  Z -->|BusyBox init| AB[解析/etc/inittab<br>启动syslogd, getty等]
  Z -->|"无init(仅shell)"| AC[直接启动/bin/sh]
  AA --> AD
  AB --> AD
  AC --> AD
  AD[系统启动完成:<br>串口/网络/图形界面可用] --> AE[用户可交互]
```

🔍 关键嵌入式特性说明：

| 组件 | 说明 |
|------|------|
| **BootROM + SPL** | 常见于 SoC（如 TI AM335x, NXP i.MX6/8, Allwinner），因 DDR 尚未初始化，需先运行小段代码（SPL）加载完整 U-Boot |
| **设备树 (.dtb)** | ARM 架构必需，描述硬件拓扑，由 U-Boot 传递给内核（通过 r2 寄存器） |
| **根文件系统位置** | 可为：<br>• eMMC/SD (`/dev/mmcblk0p2`)<br>• MTD Flash (`/dev/mtdblock2`, UBIFS/JFFS2)<br>• NFS（开发常用）<br>• initramfs（全内存系统） |
| **init 系统** | 嵌入式常用 BusyBox init（轻量），高端产品可能用 systemd |
| **无 initramfs 场景** | 要求所有根文件系统驱动必须编译进内核（`CONFIG_XXX=y`） |