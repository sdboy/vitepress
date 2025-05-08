---
lang: zh-CN
title: GitLab
titleTemplate: Docker容器中GitLab备份
description: Docker容器中GitLab备份
head:
  - - meta
    - name: description
      content: 在Docker容器中安装GitLab
  - - meta
    - name: keywords
      content: git gitlab docker backup SEO
layout: doc
navbar: true
sidebar: true
aside: true
outline: deep
lastUpdated: Date
footer: true
---
# 3 Docker容器中GitLab备份

你可以创建GItLab备份用下面的命令：
```sh
$ docker exec -t <container name> gitlab-backup create
```

更多信息，请参阅[备份和还原 GitLab](https://docs.gitlab.com/17.10/administration/backup_restore/)。

> [!NOTE]
> 如果 GitLab 配置完全由 `GITLAB_OMNIBUS_CONFIG` 环境变量提供（通过使用 "[预配置 Docker 容器](https://docs.gitlab.com/17.10/install/docker/configuration/#pre-configure-docker-container) "步骤），配置设置不会存储在 `gitlab.rb` 文件中，因此无需备份 `gitlab.rb` 文件。

> [!WARNING]
> 为了避免从备份中恢复 GitLab 时的[复杂步骤]()，还应遵循[备份 GitLab 秘密文件]()中的说明。秘密文件存储在容器内的 `/etc/gitlab/gitlab-secrets.json` 文件或[宿主机]上的 `$GITLAB_HOME/config/gitlab-secrets.json` 文件中。

## 备份 GitLab 数据库

升级 GitLab 之前，请创建一个纯数据库备份。如果在 GitLab 升级过程中遇到问题，可以恢复数据库备份来回滚升级。要创建数据库备份，请运行此命令：
```shell
$ docker exec -t <container name> gitlab-backup create SKIP=artifacts,repositories,registry,uploads,builds,pages,lfs,packages,terraform_state
```

备份会被写入 `/var/opt/gitlab/backups`，它应该位于 [Docker 挂载的卷](https://docs.gitlab.com/17.10/install/docker/installation/#create-a-directory-for-the-volumes)上。

有关使用备份回滚升级的更多信息，请参阅[降级 GitLab](https://docs.gitlab.com/17.10/install/docker/upgrade/#downgrade-gitlab)。

# 参考
[Back up GitLab running in a Docker container](https://docs.gitlab.com/17.10/install/docker/backup/)