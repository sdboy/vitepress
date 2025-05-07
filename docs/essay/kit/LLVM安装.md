---
lang: zh-CN
title: Kit
titleTemplate: LLVM安装
description: LLVM安装
head:
  - - meta
    - name: description
      content: hello
  - - meta
    - name: keywords
      content: LLVM 安装 ubuntu SEO
layout: doc
navbar: true
sidebar: true
aside: true
outline: deep
lastUpdated: Date
footer: true
---
# LLVM安装

树莓派4B，Ubuntu24.04 LTS安装LLVM19。

## 安装环境

|Architectures|系统版本|LLVM版本|
|:---:|:---:|:---:|
|arm64|Ubuntu24.04|19.1.1|

## 安装过程

可以通过编译源码安装，也可以通过apt安装。

> [!TIP]
> 官方也提供[RPM安装方法](https://copr.fedorainfracloud.org/coprs/g/fedora-llvm-team/llvm-snapshots/)

### 编译源码安装

由于编译源码需要时间，而且对硬件要求比较高，所以这里就不详细写了，可以参考[LLVM官网](https://llvm.org/docs/GettingStarted.html#getting-the-source-code-and-building-llvm)。

### apt安装

安装过程参考[LLVM官方说明](https://apt.llvm.org/)。我们可以从LLVM官方镜像安装，但是国内速度比较慢，可以更换为[国内镜像源](https://mirrors.tuna.tsinghua.edu.cn/llvm-apt/)；我们也可以从Ubuntu官方源安装；

- LLVM官方镜像安装<br>
  安装最新stable版：
  ```sh
  $ bash -c "$(wget -O - https://apt.llvm.org/llvm.sh)"
  ```

  安装指定版本：
  ```sh
  $ wget https://apt.llvm.org/llvm.sh
  $ chmod +x llvm.sh
  $ sudo ./llvm.sh <version number>
  ```
  > [!WARNING]
  > 注意修改 `<version number>` 为对应版本号。
  > 如果要通过国内镜像源安装，可以将 `apt.llvm.org` 换为 `mirrors.tuna.tsinghua.edu.cn/llvm-apt` 。

- 使用Ubuntu官方源安装<br>
  通过`apt search llvm`命令搜索llvm包，找到对应的版本号，然后安装。
  通过查询知llvm-19为最新稳定版，这里安装llvm-19，LLVM官方提供了佷多软件包，各自有不同的功能，按需选择自己需要的软件，这里全部安装。
  ```sh
  $ sudo apt install libllvm-19-ocaml-dev libllvm19 \
  llvm-19 llvm-19-dev llvm-19-doc llvm-19-examples llvm-19-runtime \
  clang-19 clang-tools-19 clang-19-doc libclang-common-19-dev \
  libclang-19-dev libclang1-19 clang-format-19 python3-clang-19 \
  clangd-19 clang-tidy-19 libclang-rt-19-dev libpolly-19-dev \
  libfuzzer-19-dev lldb-19 lld-19 libc++-19-dev libc++abi-19-dev \
  libomp-19-dev libclc-19-dev libunwind-19-dev libmlir-19-dev \
  mlir-19-tools libbolt-19-dev bolt-19 flang-19 \
  libclang-rt-19-dev-wasm32 libclang-rt-19-dev-wasm64 \
  libc++-19-dev-wasm32 libc++abi-19-dev-wasm32 \
  libclang-rt-19-dev-wasm32 libclang-rt-19-dev-wasm64
  ```
  
  安装完成后，可以通过以下命令验证安装是否成功：
  ```sh
  $ clang-19 --version
  Ubuntu clang version 19.1.1 (1ubuntu1~24.04.2)
  Target: aarch64-unknown-linux-gnu
  Thread model: posix
  InstalledDir: /usr/lib/llvm-19/bin
  ```

