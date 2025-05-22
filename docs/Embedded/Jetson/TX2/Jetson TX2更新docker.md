---
lang: zh-CN
title: Jetson
titleTemplate: Jetson TX2更新docker
description: Jetson TX2更新docker
head:
  - - meta
    - name: description
      content: Jetson TX2更新docker
  - - meta
    - name: keywords
      content: jetson TX2 docker
layout: doc
navbar: true
sidebar: true
aside: true
outline: deep
lastUpdated: Date
footer: true
---
# Jetson TX2更新docker

在尝试从二进制文件安装 Docker 之前，请确保您的主机满足先决条件：
- 64 位 CPU
- 3.10或更高版本的内核
- `iptables` 版本大于等于 1.4.0
- `git` 版本大于等于 1.7
- `ps` 可执行文件，通常由 `procps` 或类似软件包提供。
- [XZ Utils](https://tukaani.org/xz/) 版本大于等于4.9
- [正确挂载](https://github.com/tianon/cgroupfs-mount/blob/master/cgroupfs-mount)的 `cgroupfs` 层次结构；单一、全面的 `cgroup` 挂载点是不够的。请参阅 Github 问题 [#2683](https://github.com/moby/moby/issues/2683)、[#3485](https://github.com/moby/moby/issues/3485) 和 [#4568](https://github.com/moby/moby/issues/4568)）。
## 删除自带的docker

停止Docker服务
```bash
$ sudo systemctl stop docker
$ sudo systemctl stop docker.socket
```

删除Docker
```bash
$ sudo apt-get purge containerd docker.io nvidia-docker2 runc
```

移动Docker数据目录，到备份目录下
```bash
$ mkdir ~/docker_backup
$ sudo mv /var/lib/docker ~/docker-backup/docker
$ sudo mv /var/lib/containerd ~/docker-backup/containerd
$ sudo mv /etc/docker ~/docker-backup/docker_etc
$ sudo mv /run/containerd ~/docker-backup/containerd_run
$ sudo mv /var/run/docker.sock ~/docker-backup/
```

## 安装docker

1. 安装依赖包
   ```bash
   $ sudo apt-get update
   $ sudo apt-get install -y \
   apt-transport-https \
   ca-certificates \
   curl \
   gnupg-agent \
   software-properties-common
  ```

2. 下载二进制安装包
   ```bash
   $ mkdir ~/docker-bin
   $ cd ~/docker-bin
   $ curl -O https://download.docker.com/linux/static/stable/aarch64/docker-28.1.1.tgz
   ```

3. 解压二进制安装包
   ```bash
   $ tar -xzvf docker-28.1.1.tgz
   ```

4. 移动二进制文件
   ```bash
   $ sudo cp ~/docker-bin/docker/* /usr/bin/
   ```

5. 配置Docker
   
   创建`containerd.service`文件
   ```bash
   $ sudo vi /etc/systemd/system/containerd.service
   # Copyright The containerd Authors.
   #
   # Licensed under the Apache License, Version 2.0 (the "License");
   # you may not use this file except in compliance with the License.
   # You may obtain a copy of the License at
   #
   #     http://www.apache.org/licenses/LICENSE-2.0
   #
   # Unless required by applicable law or agreed to in writing, software
   # distributed under the License is distributed on an "AS IS" BASIS,
   # WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   # See the License for the specific language governing permissions and
   # limitations under the License.

   [Unit]
   Description=containerd container runtime
   Documentation=https://containerd.io
   After=network.target local-fs.target dbus.service

   [Service]
   #uncomment to enable the experimental sbservice (sandboxed) version of containerd/cri integration
   #Environment="ENABLE_CRI_SANDBOXES=sandboxed"
   ExecStartPre=-/sbin/modprobe overlay
   ExecStart=/usr/bin/containerd

   Type=notify
   Delegate=yes
   KillMode=process
   Restart=always
   RestartSec=5
   # Having non-zero Limit*s causes performance problems due to accounting overhead
   # in the kernel. We recommend using cgroups to do container-local accounting.
   LimitNPROC=infinity
   LimitCORE=infinity
   LimitNOFILE=infinity
   # Comment TasksMax if your systemd version does not supports it.
   # Only systemd 226 and above support this version.
   TasksMax=infinity
   OOMScoreAdjust=-999

   [Install]
   WantedBy=multi-user.target
   ```

   开启 `containerd` 服务：
   ```bash
   $ sudo systemctl enable --now containerd.service
   ```
   验证 `containerd` 服务：
   ```bash
   $ sudo systemctl status containerd
   ● containerd.service - containerd container runtime
     Loaded: loaded (/etc/systemd/system/containerd.service; enabled; vendor preset: enabled)
     Active: active (running) since Thu 2025-05-22 21:42:50 CST; 3min 48s ago
       Docs: https://containerd.io
   Main PID: 11896 (containerd)
       Tasks: 12
     CGroup: /system.slice/containerd.service
             └─11896 /usr/bin/containerd
   ```

   取消屏蔽，否则后面可能报错 `Failed to enable unit: Unit file /etc/systemd/system/docker.service is masked.`：
   ```bash
   $ sudo systemctl unmask docker.socket
   $ sudo systemctl unmask docker.service
   ```

   创建 `docker.service` 文件：
   ```bash
   $ sudo vi /etc/systemd/system/docker.service
   [Unit]
   Description=Docker Application Container Engine
   Documentation=https://docs.docker.com
   After=network-online.target nss-lookup.target docker.socket firewalld.service containerd.service time-set.target
   Wants=network-online.target containerd.service
   Requires=docker.socket

   [Service]
   Type=notify
   # the default is not to use systemd for cgroups because the delegate issues still
   # exists and systemd currently does not support the cgroup feature set required
   # for containers run by docker
   ExecStart=/usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock
   ExecReload=/bin/kill -s HUP $MAINPID
   TimeoutStartSec=0
   RestartSec=2
   Restart=always

   # Note that StartLimit* options were moved from "Service" to "Unit" in systemd 229.
   # Both the old, and new location are accepted by systemd 229 and up, so using the old location
   # to make them work for either version of systemd.
   StartLimitBurst=3

   # Note that StartLimitInterval was renamed to StartLimitIntervalSec in systemd 230.
   # Both the old, and new name are accepted by systemd 230 and up, so using the old name to make
   # this option work for either version of systemd.
   StartLimitInterval=60s

   # Having non-zero Limit*s causes performance problems due to accounting overhead
   # in the kernel. We recommend using cgroups to do container-local accounting.
   LimitNPROC=infinity
   LimitCORE=infinity

   # Comment TasksMax if your systemd version does not support it.
   # Only systemd 226 and above support this option.
   TasksMax=infinity

   # set delegate yes so that systemd does not reset the cgroups of docker containers
   Delegate=yes

   # kill only the docker process, not all processes in the cgroup
   KillMode=process
   OOMScoreAdjust=-500

   [Install]
   WantedBy=multi-user.target
   ```

   创建 `docker.socket` 文件：
   ```bash
   $ sudo vi /etc/systemd/system/docker.socket
   [Unit]
   Description=Docker Socket for the API

   [Socket]
   # If /var/run is not implemented as a symlink to /run, you may need to
   # specify ListenStream=/var/run/docker.sock instead.
   ListenStream=/var/run/docker.sock
   SocketMode=0660
   SocketUser=root
   SocketGroup=docker

   [Install]
   WantedBy=sockets.target
   ```

   启动docker：
   ```bash
   $ sudo systemctl enable --now docker.socket  && systemctl enable --now docker.service
   ```

   如果服务启动失败，请重启系统：
   ```bash
   $ sudo reboot now -h
   ```

   验证docker是否安装成功：
   ```bash
   $ docker version
   Client:
     Version:           28.1.1
     API version:       1.49
     Go version:        go1.23.8
     Git commit:        4eba377
     Built:             Fri Apr 18 09:50:50 2025
     OS/Arch:           linux/arm64
     Context:           default

     Server: Docker Engine - Community
     Engine:
       Version:          28.1.1
       API version:      1.49 (minimum version 1.24)
       Go version:       go1.23.8
       Git commit:       01f442b
       Built:            Fri Apr 18 09:51:55 2025
       OS/Arch:          linux/arm64
       Experimental:     false
     containerd:
       Version:          v1.7.27
       GitCommit:        05044ec0a9a75232cad458027ca83437aae3f4da
     runc:
       Version:          1.2.6
       GitCommit:        v1.2.6-0-ge89a299
     docker-init:
       Version:          0.19.0
       GitCommit:        de40ad0
   ```

5. 恢复docker配置文件
   ```bash
   $ sudo mkdir -p /etc/docker
   $ sudo cp ~/docker-backup/docker_etc/* /etc/docker/
   $ sudo systemctl restart docker
   ```
   如果需要使用其他选项启动守护进程，请相应修改上述命令，或创建并编辑 /etc/docker/daemon.json 文件，添加自定义配置选项。

6. 拉取镜像测试
   ```bash
   $ docker pull docker.mybacc.com/coredns/coredns:latest
   latest: Pulling from coredns/coredns
   2ae251fec02f: Pull complete 
   2e4cf50eeb92: Pull complete 
   4e9f20d26c87: Pull complete 
   0f8b424aa0b9: Pull complete 
   d557676654e5: Pull complete 
   d82bc7a76a83: Pull complete 
   d858cbc252ad: Pull complete 
   1069fc2daed1: Pull complete 
   b40161cd83fc: Pull complete 
   3f4e2c586348: Pull complete 
   80a8c047508a: Pull complete 
   504a5b8caa12: Pull complete 
   1891dde4e3c6: Pull complete 
   Digest: sha256:e8c262566636e6bc340ece6473b0eed193cad045384401529721ddbe6463d31c
   Status: Downloaded newer image for docker.mybacc.com/coredns/coredns:latest
   docker.mybacc.com/coredns/coredns:latest
   ```

## 安装nvidia-container-toolkit等

```bash
$ sudo apt-get install  nvidia-container-toolkit
$ sudo apt-get install nvidia-container-csv-cuda
$ sudo apt-get install nvidia-container-csv-cudnn
$ sudo apt-get install nvidia-container-csv-tensorrt
```

## 安装Docker Compose插件

1. 下载Docker Compose CLI插件：
   ```bash
   DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
   mkdir -p $DOCKER_CONFIG/cli-plugins
   curl -SL https://github.com/docker/compose/releases/download/v2.36.1/docker-compose-linux-aarch64 -o $DOCKER_CONFIG/cli-plugins/docker-compose
   ```
   此命令为 `$HOME` 目录下的活动用户下载并安装最新版本的 Docker Compose。

   - 如果要为此电脑上的所有用户安装 Docker Compose，请将 `~/.docker/cli-plugins` 替换为 `/usr/local/lib/docker/cli-plugins`
   - 如果想要指定不同的版本，请将 `v2.36.1` 替换为所需的版本号。
   - 如果你的系统架构是 `x86_64`，请将 `aarch64` 替换为 `x86_64`。

2. 对二进制文件应用可执行权限：
   ```bash
   $ chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose
   ```

   如果你是为所有用户安装：
   ```bash
   $ sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
   ```

3. 测试安装：
   ```bash
   $ docker compose version
   Docker Compose version v2.36.1
   ```

## 安装Docker buildx插件

1. 下载Docker buildx插件二进制文件
   ```bash
   $ curl -SL https://github.com/docker/buildx/releases/download/v0.24.0/buildx-v0.24.0.linux-arm64 -o $HOME/.docker/cli-plugins/docker-buildx
   ```

2. 对二进制文件应用可执行权限：
   ```bash
   $ chmod +x $HOME/.docker/cli-plugins/docker-buildx
   ```

3. 测试安装：
   ```bash
   $ docker buildx version
   github.com/docker/buildx v0.24.0 d0e5e86c8b88ae4865040bc96917c338f4dd673c
   ```

