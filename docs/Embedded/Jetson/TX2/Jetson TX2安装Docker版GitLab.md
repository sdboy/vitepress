---
lang: zh-CN
title: Jetson
titleTemplate: Jetson TX2安装Docker版GitLab
description: Jetson TX2安装Docker版GitLab
head:
  - - meta
    - name: description
      content: Jetson TX2安装Docker版GitLab
  - - meta
    - name: keywords
      content: Jetson TX2 安装 Docker GitLab CE
layout: doc
navbar: true
sidebar: true
aside: true
outline: deep
lastUpdated: Date
footer: true
---
# Jetson TX2安装Docker版GitLab

> [!TIP]
> 进行安装前，需要先[更新Docker](./Jetson%20TX2更新docker.md)

## 使用Dockerfile构建Arm64 Docker镜像

由于GitLab官方并没有提供Arm64版本的Docker镜像，所以需要自己构建。
项目地址：`https://github.com/zengxs/gitlab-arm64.git`

如果在国内，需要先手下载你要安装gitlab对应版的deb包，deb包下载目录：`https://packages.gitlab.com/app/gitlab/gitlab-ce`。本教程使用的是 `https://packages.gitlab.com/gitlab/gitlab-ce/packages/ubuntu/noble/gitlab-ce_18.0.1-ce.0_arm64.deb/download.deb`。

把deb包放到文件服务器中，确保Jetsom TX2能正常下载。

### 克隆项目到本地

创建一个文件夹，并进入：
```bash
$ mkdir ~/workspace
$ cd workspace

```bash
$ git clone https://github.com/zengxs/gitlab-arm64.git
$ cd gitlab-arm64
```

编辑`download-package`文件：
```bash
$ vi assets/download-package 
```

在 `echo "Downloading package as artifact - ${DOWNLOAD_URL}"` 前添加`DOWNLOAD_URL`，其值为你文件服务器上的gitlab文件地址：
```sh
#!/bin/bash

DOWNLOAD_URL=http://192.168.1.3/gitlab-ce_17.11.3-ce.0_arm64.deb # [!foucus code]
echo "Downloading package as artifact - ${DOWNLOAD_URL}"
wget --quiet --header "JOB-TOKEN: ${CI_JOB_TOKEN}" ${DOWNLOAD_URL} -O /tmp/gitlab.deb

results=$?
if [ ${results} -ne 0 ]; then
    >&2 echo "There was an error downloading ${DOWNLOAD_URL}. Please check the output for more information"
    exit ${results}
fi
```

### 开始构建

```bash
$ docker build . -t gitlab-ce:18.0.1-ce.0 --build-arg RELEASE_PACKAGE=gitlab-ce --build-arg RELEASE_VERSION=18.0.1-ce.0
```
> [!NOTE]
> 注意修改命令中的`-t`、`RELEASE_PACKAGE`和`RELEASE_VERSION`对应的参数。如果要构建ee版本，还需要将`ee`改为`ce`。企业需要的硬件资源太高，所以这里只构建ce版本。

完成构建后，查看：
```bash
$ docker images
REPOSITORY     TAG            IMAGE ID       CREATED       SIZE
gitlab-ce      18.0.1-ce.0    33a108fb5779   1 hours ago   3.64GB
```

> [!NOTE]
> 构建完成后，还可以使用上传到镜像仓库中，以便后续使用。

## 启动GitLab容器

详细参见：[Docker容器中安装GitLab](../../../Kit/VCS/GitLab/1Docker容器中安装GitLab.md)

创建文件夹：
```bash
$ mkdir /srv/gitlab/config
$ mkdir /srv/gitlab/logs
$ mkdir /srv/gitlab/data
```

创建文件夹并进入：
```bash
$ mkdir ~/workspace/gitlab-compose
$ cd ~/workspace/gitlab-compose
```

创建docker-compose.yml文件：
```bash
$ cat > docker-compose.yml << EOF
version: '3.6'
services:
  gitlab:
    image: gitlab-ce:18.0.1-ce.0
    container_name: gitlab
    restart: unless-stopped
    hostname: 'gitlab'
    environment:
      TZ: 'Asia/Shanghai'
      GITLAB_OMNIBUS_CONFIG: |
        external_url 'http://192.168.1.5:8929'
        gitlab_rails['gitlab_shell_ssh_port'] = 2424
    ports:
      - '8929:8929'
      - '2424:22'
    volumes:
      - '/srv/gitlab/config:/etc/gitlab'
      - '/srv/gitlab/logs:/var/log/gitlab'
      - '/srv/gitlab/data:/var/opt/gitlab'
    shm_size: '256m'
EOF
```
> [!NOTE]
> 注意修改成自己需要的配置

启动容器：
```bash
$ docker-compose up -d
```

查看运行状态：
```bash
$ docker-compose ps
NAME      IMAGE                   COMMAND                  SERVICE   CREATED    STATUS                  PORTS
gitlab    gitlab-ce:18.0.1-ce.0   "/assets/init-contai…"   gitlab    1 hours ago   Up 1 hours (healthy)   80/tcp, 443/tcp, 0.0.0.0:8929->8929/tcp, [::]:8929->8929/tcp, 0.0.0.0:2424->22/tcp, [::]:2424->22/tcp
```

等到STATUS对应的状态由staring变为healthy，则表示安装成功。否则重新启动容器，直到运行成功。
> [!WARNING]
> 多次启动不成功，请查看日志。

## 访问GitLab

在浏览器中打开http://192.168.1.5:8929，即可访问GitLab。用户名密码为`root`，密码获取方式：
```bash
sudo docker exec -it gitlab grep 'Password:' /etc/gitlab/initial_root_password
```

如果登录失败，处理见[这里](#root密码错误)。

## 优化GitLab性能

- 通过puma 优化性能<br>
  详细配置见[这里](https://docs.gitlab.com/administration/operations/puma/)。

  进入GitLab容器：
  ```bash
  $ sudo docker exec -it gitlab bash
  ```

  编辑`/etc/gitlab/gitlab.rb`文件：
  ```bash
  root@gitlab:# vi /etc/gitlab/gitlab.rb
  ```

  修改下面的选项对应的值：
  ```ruby
  puma['per_worker_max_memory_mb'] = 1024 # 1GB
  gitlab_rails['env'] = {
   'GITLAB_RAILS_RACK_TIMEOUT' => 600
  }
  puma['enable'] = true
  puma['worker_processes'] = 1
  puma['worker_timeout'] = 60
  puma['min_threads'] = 2
  puma['max_threads'] = 2
  ```

  重新启动GitLab服务：
  ```bash
  root@gitlab:# sudo gitlab-ctl reconfigure
  ```

- 禁用service ping<br>
  详细配置见[这里](https://docs.gitlab.com/administration/settings/usage_statistics/#enable-or-disable-service-ping)
  进入GitLab容器：
  ```bash
  $ sudo docker exec -it gitlab bash
  ```

  编辑`/etc/gitlab/gitlab.rb`文件：
  ```bash
  root@gitlab:# vi /etc/gitlab/gitlab.rb
  ```

  修改配置：
  ```ruby
  gitlab_rails['usage_ping_enabled'] = false
  ```

  重新启动GitLab服务：
  ```bash
  root@gitlab:# sudo gitlab-ctl reconfigure
  ```

## 问题处理

### `root`密码错误

- 进入 Docker 容器
  ```bash
  $ sudo docker exec -it gitlab bash
  ```

- 连接到 GitLab 数据库
  ```bash
  root@gitlab:/# gitlab-rails console -e production
  ```

- 查找用户并重置密码
  ```bash
  root@gitlab:/# user = User.find_by_username 'root'
  root@gitlab:/# user.password = '新密码'
  root@gitlab:/# user.password_confirmation = '新密码'
  root@gitlab:/# user.save!
  ```

- 退出控制台并重启 GitLab
  ```bash
  root@gitlab:/# exit
  root@gitlab:/# gitlab-ctl restart
  ```

### 登录报`422`

首先确认登录用户名密码正确

- 清理浏览器缓存或用新的浏览器登录
- 同步本地电脑时间和服务器时间为授时服务器时间

