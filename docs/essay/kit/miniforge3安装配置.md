---
lang: zh-CN
title: Kit
titleTemplate: miniforge3安装配置
description: miniforge3安装配置
head:
  - - meta
    - name: description
      content: hello
  - - meta
    - name: keywords
      content: miniforge3 安装 配置 conda
layout: doc
navbar: true
sidebar: true
aside: true
outline: deep
lastUpdated: Date
footer: true
---
# miniforge3安装配置

依赖环境，在基本环境中使用 Python 3.12 (*) 的最新安装程序：
| OS      | Architecture                  | Minimum Version | File                            |
| ------- | ----------------------------- | --------------- | ------------------------------- |
| Linux   | x86_64 (amd64)                | glibc >= 2.17   | `Miniforge3-Linux-x86_64.sh`    |
| Linux   | aarch64 (arm64) `(**)`        | glibc >= 2.17   | `Miniforge3-Linux-aarch64.sh`   |
| Linux   | ppc64le (POWER8/9)            | glibc >= 2.17   | `Miniforge3-Linux-ppc64le.sh`   |
| macOS   | x86_64                        | macOS >= 10.13  | `Miniforge3-MacOSX-x86_64.sh`   |
| macOS   | arm64 (Apple Silicon) `(***)` | macOS >= 11.0   | `Miniforge3-MacOSX-arm64.sh`    |
| Windows | x86_64                        | Windows >= 7    | `Miniforge3-Windows-x86_64.exe` |

## miniforge3安装

如果您希望以更自动化的方式通过命令行下载相应的安装程序，您可以使用类似以下的命令，对于Linux用以下命令：
```sh
wget -O Miniforge3.sh "https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-$(uname)-$(uname -m).sh"
```

> [!TIP]
> 如果无法下载或速度慢，可以将`https://github.com/conda-forge/miniforge/releases/latest/download/`替换为`https://mirrors.tuna.tsinghua.edu.cn/anaconda/miniconda/`，用清华镜像源。

这将为当前架构下载相应的安装程序，文件名为 `Miniforge3.sh`。在批处理模式下使用命令 `-b` flash 运行 shell 脚本：
```sh
bash Miniforge3.sh -b -p "${HOME}/conda"
```
`-p` 为前缀选项。将在`"${HOME}/conda "`下创建一个目录。

然后创建 conda 路径并激活 conda。运行以下命令
```sh
source "${HOME}/conda/etc/profile.d/conda.sh"
# For mamba support also run the following command
source "${HOME}/conda/etc/profile.d/mamba.sh"
```
> [!NOTE]
> 每次进入新的 shell 环境时都需要运行以上命令。

运行以下命令验证安装：
```sh
$ conda --version
conda 25.3.0
```

更新conda
```sh
$ conda update -n base -c conda-forge conda
```

## miniforge3卸载

卸载 Miniforge 意味着删除安装过程中创建的文件。您通常需要删除

1. Miniforge 对您的 shell rc 文件所做的任何修改：
   ```sh
   # Use this first command to see what rc files will be updated
   conda init --reverse --dry-run
   # Use this next command to take action on the rc files listed above
   conda init --reverse
   # Temporarily IGNORE the shell message
   #       'For changes to take effect, close and re-open your current shell.',
   # and CLOSE THE SHELL ONLY AFTER the 3rd step below is completed.
   ```

2. 删除安装 Miniforge 基本环境的文件夹和所有子文件夹：
   ```sh
   CONDA_BASE_ENVIRONMENT=$(conda info --base)
   echo The next command will delete all files in ${CONDA_BASE_ENVIRONMENT}
   # Warning, the rm command below is irreversible!
   # check the output of the echo command above
   # To make sure you are deleting the correct directory
   rm -rf ${CONDA_BASE_ENVIRONMENT}
   ```

3. 留下的任何全局 conda 配置文件。
   ```sh
   echo ${HOME}/.condarc will be removed if it exists
   rm -f "${HOME}/.condarc"
   echo ${HOME}/.conda and underlying files will be removed if they exist.
   rm -fr ${HOME}/.conda
   ```

## conda简单配置

更换清华源

用以下命令创建一个`.condarc`文件：
```sh
conda config --set show_channel_urls yes
```

编辑`.condarc`文件，配置仓库：
```sh
channels:
  - defaults
show_channel_urls: true
default_channels:
  - https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/main
  - https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/r
  - https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/msys2
custom_channels:
  conda-forge: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
  pytorch: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
  bioconda: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
```

> [!TIP]
> `https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud` 是清华提供的免费仓库。

使用下列命令清除索引缓存，并安装常用包测试一下。
```sh
conda clean -i
conda create -n myenv numpy
```

# 参考
[Miniforge](https://github.com/conda-forge/miniforge/blob/main/README.md)
[Anaconda 软件仓库](https://mirrors.tuna.tsinghua.edu.cn/help/anaconda/)