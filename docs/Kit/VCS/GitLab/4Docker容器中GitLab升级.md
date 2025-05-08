---
lang: zh-CN
title: GitLab
titleTemplate: Docker容器中GitLab升级
description: Docker容器中GitLab升级
head:
  - - meta
    - name: description
      content: Docker容器中GitLab升级
  - - meta
    - name: keywords
      content: git gitlab docker upgrade SEO
layout: doc
navbar: true
sidebar: true
aside: true
outline: deep
lastUpdated: Date
footer: true
---
# 4 Docker容器中GitLab升级

## 用Docker Engine升级

## 用Docker compose升级

升级使用 [Docker Compose 安装](https://docs.gitlab.com/17.10/install/docker/installation/#install-gitlab-by-using-docker-compose)的 GitLab 实例：

1. 备份。至少要备份数据库和 GitLab 秘密文件。

2. 编辑 `docker-compose.yml` 文件更改 `image` 标签以使用最新的 GitLab 版本。

3. 下载最新版本并升级 GitLab 实例：
   ```sh
   $ docker compose pull
   $ docker compose up -d
   ```

## 转换Community Edition 到 Enterprise Edition

You can convert an existing GitLab Community Edition (CE) container for Docker to a GitLab Enterprise Edition (EE) container using the same approach as upgrading the version.

We recommend you convert from the same version of CE to EE (for example, CE 14.1 to EE 14.1). However, this is not required. Any standard upgrade (for example, CE 14.0 to EE 14.1) should work. The following steps assume that you are converting to the same version.

1. Take a backup. At minimum, back up the database and the GitLab secrets file.

2. Stop the current CE container, and remove or rename it.

3. To create a new container with GitLab EE, replace `ce` with `ee` in your docker run command or `docker-compose.yml` file. Reuse the CE container name, port mappings, file mappings, and version.

## 降级

还原会用旧状态覆盖所有较新的 GitLab 数据库内容。只有在必要时才建议降级。例如，如果升级后测试发现问题无法快速解决。

> [!WARNING]
> 您必须至少有一个与您要降级到的版本和版本完全相同的数据库备份。需要备份才能恢复升级过程中的模式更改（迁移）。

升级后立即降级 GitLab：
1. 按照升级程序，[指定一个更早的版本](https://docs.gitlab.com/17.10/install/docker/installation/#find-the-gitlab-version-and-edition-to-use)比已安装版本。

2. 恢复升级前的[数据库备份](https://docs.gitlab.com/17.10/install/docker/backup/#create-a-database-backup)。
   按照 [Docker 镜像的还原步骤操作](https://docs.gitlab.com/17.10/administration/backup_restore/restore_gitlab/#restore-for-docker-image-and-gitlab-helm-chart-installations)，包括停止 Puma 和 Sidekiq。只有数据库必须还原，因此在 `gitlab-backup restore` 命令行参数中添加 `SKIP=artifacts,repositories,registry,uploads,builds,pages,lfs,packages,terraform_state`。

# 参考
[Upgrade](https://docs.gitlab.com/17.10/install/docker/upgrade/)