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
# 2 Docker容器中GitLab配置

该容器使用 Linux 官方软件包，因此可以使用唯一的配置文件 `/etc/gitlab/gitlab.rb` 来配置实例。

## 编辑配置文件

要访问 GitLab 配置文件，可以在运行容器的上下文中启动 shell 会话。

1. 开启会话
   ```sh
   $ sudo docker exec -it gitlab /bin/bash
   ```
   或者，也可以直接用编辑器打开 `/etc/gitlab/gitlab.rb`：
   ```sh
   $ sudo docker exec -it gitlab vi /etc/gitlab/gitlab.rb
   ```
2. 编辑`/etc/gitlab/gitlab.rb`，更新下面字段：
   - 将`external_url`字段设置为 GitLab 实例的有效 URL。
   - 要接收来自GitLab的邮件，请配置[SMTP设置](https://docs.gitlab.com/omnibus/settings/smtp/)。GitLab Docker镜像没有预装SMTP服务器。
   - 如果需要，请[启用HTTPS](https://docs.gitlab.com/omnibus/settings/ssl/)。

3. 保存并退出编辑器，重新启动容器使配置生效：
   ```sh
   $ sudo docker restart gitlab
   ```

   每次启动容器时，GitLab 都会重新配置自己。有关 GitLab 的更多配置选项，请参阅[配置文档](https://docs.gitlab.com/omnibus/settings/configuration.html)。

## 预配置容器

通过在 Docker run 命令中添加环境变量 `GITLAB_OMNIBUS_CONFIG`，可以预先配置 GitLab Docker 镜像。这个变量可以包含任何 `gitlab.rb` 设置，并在加载容器的 `gitlab.rb` 文件之前进行评估。通过这一行为，你可以配置外部 GitLab URL、数据库配置或 [Linux 软件包模板](https://gitlab.com/gitlab-org/omnibus-gitlab/blob/master/files/gitlab-config-template/gitlab.rb.template)中的任何其他选项。`GITLAB_OMNIBUS_CONFIG` 中包含的设置不会写入 `gitlab.rb` 配置文件，而是在加载时进行评估。要提供多个设置，请用冒号 (`;`) 分隔。

下面的示例设置了外部 URL，启用了 LFS，并以 Prometheus 所需的[最小shm大小](https://docs.gitlab.com/17.10/install/docker/troubleshooting/#devshm-mount-not-having-enough-space-in-docker-container)启动了容器：
```sh
sudo docker run --detach \
  --hostname gitlab.example.com \
  --env GITLAB_OMNIBUS_CONFIG="external_url 'http://gitlab.example.com'; gitlab_rails['lfs_enabled'] = true;" \
  --publish 443:443 --publish 80:80 --publish 22:22 \
  --name gitlab \
  --restart always \
  --volume $GITLAB_HOME/config:/etc/gitlab \
  --volume $GITLAB_HOME/logs:/var/log/gitlab \
  --volume $GITLAB_HOME/data:/var/opt/gitlab \
  --shm-size 256m \
  gitlab/gitlab-ee:<version>-ee.0
```

每次执行 `docker run` 命令时，都需要提供 `GITLAB_OMNIBUS_CONFIG` 选项。`GITLAB_OMNIBUS_CONFIG` 的内容在后续运行中不会被保留。

## 在公网IP上运行GitLab

你可以修改 `--publish` 标记，让 Docker 使用你的 IP 地址，并将所有流量转发到 GitLab 容器。

暴露GitLab在IP `198.51.100.1`：
```sh
sudo docker run --detach \
  --hostname gitlab.example.com \
  --env GITLAB_OMNIBUS_CONFIG="external_url 'http://gitlab.example.com'" \
  --publish 198.51.100.1:443:443 \
  --publish 198.51.100.1:80:80 \
  --publish 198.51.100.1:22:22 \
  --name gitlab \
  --restart always \
  --volume $GITLAB_HOME/config:/etc/gitlab \
  --volume $GITLAB_HOME/logs:/var/log/gitlab \
  --volume $GITLAB_HOME/data:/var/opt/gitlab \
  --shm-size 256m \
  gitlab/gitlab-ee:<version>-ee.0
  ```

然后你就可以在`http://198.51.100.1/`和`https://198.51.100.1/`上访问GitLab了。

## 更改GitLab暴露端口

GitLab 占用容器内的[特定端口](https://docs.gitlab.com/17.10/administration/package_information/defaults/)。

如果想使用与默认端口 `80`（HTTP）、`443`（HTTPS）或 `22`（SSH）不同的主机端口，则需要在 `docker run` 命令中添加单独的 `--publish` 指令。

例如，在主机的 `8929` 端口上公开网络接口，在 `2424` 端口上公开 SSH 服务：
1. 使用下面的命令：
   ```sh
   sudo docker run --detach \
     --hostname gitlab.example.com \
     --env GITLAB_OMNIBUS_CONFIG="external_url 'http://gitlab.example.com:8929'; gitlab_rails['gitlab_shell_ssh_port'] = 2424" \
     --publish 8929:8929 --publish 2424:22 \
     --name gitlab \
     --restart always \
     --volume $GITLAB_HOME/config:/etc/gitlab \
     --volume $GITLAB_HOME/logs:/var/log/gitlab \
     --volume $GITLAB_HOME/data:/var/opt/gitlab \
     --shm-size 256m \
     gitlab/gitlab-ee:<version>-ee.0
    ```

    > [!NOTE]
    > 发布端口的格式是 `hostPort:containerPort`。请阅读 Docker 文档中有关[公开传入端口](https://docs.docker.com/network/#published-ports)的更多信息。
  
2. 进入运行中的容器：
   ```sh
   $ sudo docker exec -it gitlab /bin/bash
   ```

3. 编辑 `/etc/gitlab/gitlab.rb` 文件，设置 `external_url`：
   ```ruby
   # For HTTP
   external_url "http://gitlab.example.com:8929"

   or

   # For HTTPS (notice the https)
   external_url "https://gitlab.example.com:8929"
   ```

   该 URL 中指定的端口必须与 Docker 向主机发布的端口一致。此外，如果`nginx['listen_port']`中没有明确设置 NGINX 的监听端口，则会使用 `external_url` 代替。更多信息，请参阅 [NGINX 文档](https://docs.gitlab.com/omnibus/settings/nginx.html)。

4. 设置SSH端口：
   ```ruby
   gitlab_rails['gitlab_shell_ssh_port'] = 2424
   ```

5. 最后，重新配置 GitLab：
   ```sh
   $ sudo gitlab-ctl reconfigure
   ```

   按照上面的示例，你的网络浏览器就能访问 `<hostIP>:8929` 上的 GitLab 实例，并通过 SSH 向 `2424` 端口推送。

   你可以在 [Docker compose](https://docs.gitlab.com/17.10/install/docker/installation/#install-gitlab-by-using-docker-compose) 部分看到使用不同端口的 `docker-compose.yml` 示例。

## 配置多数据库连接

从 GitLab 16.0 开始，GitLab 默认使用两个指向同一个 PostgreSQL 数据库的数据库连接。

如果出于任何原因，您希望切换回单一数据库连接：
- 编辑容器中的 `/etc/gitlab/gitlab.rb`文件：
  ```sh
  $ sudo docker exec -it gitlab vi /etc/gitlab/gitlab.rb
  ```

- 添加以下内容：
  ```ruby
  gitlab_rails['databases']['ci']['enable'] = false
  ```

- 重启GitLab容器：
  ```sh
  $ sudo docker restart gitlab
  ```

# 参考
[Configure GitLab running in a Docker container](https://docs.gitlab.com/17.10/install/docker/configuration/#configure-multiple-database-connections)