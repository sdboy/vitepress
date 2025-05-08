---
lang: zh-CN
title: GitLab
titleTemplate: 在Docker容器中安装GitLab
description: 在Docker容器中安装GitLab
head:
  - - meta
    - name: description
      content: 在Docker容器中安装GitLab
  - - meta
    - name: keywords
      content: git gitlab docker SEO
layout: doc
navbar: true
sidebar: true
aside: true
outline: deep
lastUpdated: Date
footer: true
---
# 1 在Docker容器中安装GitLab

本地环境：
|Arch|系统|Docker版本|Gitlab版本|
|:---:|:---:|:---:|:---:|
|x86_64|ubuntu 22.04|26.1.3|gitlab-ce:17.10|

## 配置SSH端口

GitLab默认使用端口 `22` 通过SSH与Git交互。如果宿主机要使用端口`22`作为SSH，请跳过本节。

使用不同的SSH端口，可以选择以下方案：<br>
- 更改宿主服务器的SSH端口为其他。这样SSH克隆URL就不需要加端口号了：
  ```sh
  $ ssh://git@gitlab.example.com/user/project.git
  ```

- 安装后[更改GitLab Shell SSH端口](https://docs.gitlab.com/17.10/install/docker/configuration/#expose-gitlab-on-different-ports)。这样SSH克隆URL就会包含配置的端口号：
  ```sh
  ssh://git@gitlab.example.com:<portNumber>/user/project.git
  ```

当GitLab使用`22`作为SSH端口，需要更改服务器的SSH端口：<br>
- 编辑`/etc/ssh/sshd_config`文件，并更改`Port`选项。
  ```sh
  $ sudo vi /etc/ssh/sshd_config
  Port 2222 # [!code focus]
  ```

- 更改完成后，重启SSH服务：
  ```sh
  $ sudo systemctl restart ssh
  ```

- 验证是否可以通过SSH连接。打开一个新的终端会话，使用新端口SSH连接服务器。

## 创建一个目录用于volume

创建一个目录用于存放配置、数据、日志等文件。这个目录可以在用户 `home` 下（例如`~/gitlab-docker`），或者在 `/srv` 下（例如`/srv/gitlab`）。

1. 创建目录
   ```sh
   $ sudo mkdir -p /srv/gitlab
   ```

2. 如果使用 `root` 以外的用户运行 Docker，请为该用户授予新目录的适当权限。
   ```sh
   ```
3. 配置一个新的环境变量 `$GITLAB_HOME`指向你创建的目录。
   ```sh
   $ echo "export GITLAB_HOME=/srv/gitlab" >> ~/.bashrc
   $ source ~/.bashrc
   ```

GitLab容器使用宿主机挂载卷来存储持久数据：
|本地位置|容器位置|用途|
|:---:|:---:|:---:|
|`$GITLAB_HOME/config`|`/etc/gitlab`|GitLab配置文件|
|`$GITLAB_HOME/logs`|`/var/log/gitlab`|GitLab日志|
|`$GITLAB_HOME/data`|`/var/opt/gitlab`|GitLab数据|
> [!TIP]
> 手动创建目录，并授予适当的权限。

## 安装

### Docker Compose安装

有了Docker Compose，你就可以配置、安装和升级基于Docker的GitLab：

1. 确保[Docker Compose](https://docs.docker.com/compose/install/linux/)已安装。

2. 创建`docker-compose.yml`文件。
   ```yaml
   version: '3.6'
   services:
     gitlab:
       image: gitlab/gitlab-ce:<version>-ce.0
       container_name: gitlab
       restart: always
       hostname: 'gitlab.example.com'
       environment:
         GITLAB_OMNIBUS_CONFIG: |
           # Add any other gitlab.rb configuration here, each on its own line
           external_url 'https://gitlab.example.com'
       ports:
         - '80:80'
         - '443:443'
         - '22:22'
       volumes:
         - '$GITLAB_HOME/config:/etc/gitlab'
         - '$GITLAB_HOME/logs:/var/log/gitlab'
         - '$GITLAB_HOME/data:/var/opt/gitlab'
       shm_size: '256m'
   ```

   > [!TIP]
   > 阅读[预配置Docker容器](https://docs.gitlab.com/17.10/install/docker/configuration/#pre-configure-docker-container)部分，了解 `GITLAB_OMNIBUS_CONFIG` 变量如何工作。

   下面是另一个使用自定义 HTTP 和 SSH 端口运行 GitLab 的 `docker-compose.yml` 示例。请注意，`GITLAB_OMNIBUS_CONFIG` 变量与端口部分相匹配：
   ```yaml
   version: '3.6'
   services:
     gitlab:
       image: gitlab/gitlab-ce:<version>-ce.0
       container_name: gitlab
       restart: always
       hostname: 'gitlab.example.com'
       environment:
         GITLAB_OMNIBUS_CONFIG: |
           external_url 'http://gitlab.example.com:8929'
           gitlab_rails['gitlab_shell_ssh_port'] = 2424
       ports:
         - '8929:8929'
         - '443:443'
         - '2424:22'
       volumes:
         - '$GITLAB_HOME/config:/etc/gitlab'
         - '$GITLAB_HOME/logs:/var/log/gitlab'
         - '$GITLAB_HOME/data:/var/opt/gitlab'
       shm_size: '256m'
   ```

3. 在与 `docker-compose.yml` 相同的目录下，启动 GitLab：
   ```sh
   docker compose up -d
   ```

4. 访问 GitLab URL，使用用户名`root`和以下命令中的密码登录：
   ```sh
   $ sudo docker exec -it gitlab grep 'Password:' /etc/gitlab/initial_root_password
   ```

### Docker Engine安装

1. 如果已经设置了`GITLAB_HOME`环镜变量，请根据需要调整目录，然后运行镜像：<br>
   - 如果没有开启SELinux：
     ```sh
     sudo docker run --detach \
       --hostname gitlab.example.com \
       --env GITLAB_OMNIBUS_CONFIG="external_url 'http://gitlab.example.com'" \
       --publish 443:443 --publish 80:80 --publish 22:22 \
       --name gitlab \
       --restart always \
       --volume $GITLAB_HOME/config:/etc/gitlab \
       --volume $GITLAB_HOME/logs:/var/log/gitlab \
       --volume $GITLAB_HOME/data:/var/opt/gitlab \
       --shm-size 256m \
       gitlab/gitlab-ce:<version>-ce.0
     ```
     该命令下载并启动GitLab容器，并发布访问 SSH、HTTP 和 HTTPS [所需的端口](https://docs.docker.com/engine/network/#published-ports)。所有 GitLab 数据都存储在 `$GITLAB_HOME` 的子目录中。容器会在系统重启后自动重启。

   - 如果开启了SELinux：
     ```sh
     sudo docker run --detach \
       --hostname gitlab.example.com \
       --env GITLAB_OMNIBUS_CONFIG="external_url 'http://gitlab.example.com'" \
       --publish 443:443 --publish 80:80 --publish 22:22 \
       --name gitlab \
       --restart always \
       --volume $GITLAB_HOME/config:/etc/gitlab:Z \
       --volume $GITLAB_HOME/logs:/var/log/gitlab:Z \
       --volume $GITLAB_HOME/data:/var/opt/gitlab:Z \
       --shm-size 256m \
       gitlab/gitlab-ce:<version>-ce.0
     ```
     该命令可确保 Docker 进程有足够的权限在挂载的卷中创建配置文件。

2. 如果使用[Kerberos集成]()，还必须发布 Kerberos 端口（例如：`--publish 8443:8443`）。否则将无法使用 Kerberos 进行 Git 操作。初始化过程可能需要很长时间。你可以用：
   ```sh
   sudo docker logs -f gitlab
   ```
   启动容器后，您可以访问`gitlab.example.com`。Docker容器可能需要一段时间才能开始响应查询。

3. 访问 GitLab URL，使用用户名`root`和以下命令中的密码登录：
   ```sh
   $ sudo docker exec -it gitlab grep 'Password:' /etc/gitlab/initial_root_password
   ```
   > [!WARNING]
   > 24 小时后首次重启容器时，密码文件会被自动删除。

   # 参考
   [Install GitLab in a Docker container](https://docs.gitlab.com/17.10/install/docker/installation/)
