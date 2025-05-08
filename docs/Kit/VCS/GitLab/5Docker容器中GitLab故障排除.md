---
lang: zh-CN
title: GitLab
titleTemplate: Docker容器中GitLab故障排除
description: Docker容器中GitLab故障排除
head:
  - - meta
    - name: description
      content: Docker容器中GitLab故障排除
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
# 5 Docker容器中GitLab故障排除

## Diagnose potential problems

查看容器日志：
```sh
$ sudo docker logs gitlab
```

进入运行中的容器：
```sh
$ sudo docker exec -it gitlab /bin/bash
```

## 500 Internal Error

重启容器：
```sh
$ sudo docker restart gitlab
```

## Permission problems

从较旧的 GitLab Docker 镜像升级时，可能会遇到权限问题。当先前镜像中的用户权限未能正确保留时，就会出现这种情况。有一个脚本可以修复所有文件的权限。

要修复你的容器，请执行 `update-permissions` 脚本，然后重启容器：

```sh
$ sudo docker exec gitlab update-permissions
$ sudo docker restart gitlab
```

## Error executing action run on resource `ruby_block`

This error occurs when using Docker Toolbox with Oracle VirtualBox on Windows or Mac, and making use of Docker volumes:
```
Error executing action run on resource ruby_block[directory resource: /data/GitLab]
```

The `/c/Users` volume is mounted as a VirtualBox Shared Folder, and does not support all POSIX file system features. The directory ownership and permissions cannot be changed without remounting, and GitLab fails.

Switch to using the native Docker install for your platform, instead of using Docker Toolbox.

If you cannot use the native Docker install (Windows 10 Home Edition, or Windows 7/8), an alternative solution is to set up NFS mounts instead of VirtualBox shares for the Docker Toolbox Boot2docker.

## Linux ACL issues

If you are using file ACLs on the Docker host, the docker group requires full access to the volumes in order for GitLab to work:

```sh
getfacl $GITLAB_HOME

# file: $GITLAB_HOME
# owner: XXXX
# group: XXXX
user::rwx
group::rwx
group:docker:rwx
mask::rwx
default:user::rwx
default:group::rwx
default:group:docker:rwx
default:mask::rwx
default:other::r-x
```

If these values are not correct, set them with:
```sh
$ sudo setfacl -mR default:group:docker:rwx $GITLAB_HOME
```

## `/dev/shm` mount not having enough space in Docker container

GitLab comes with a Prometheus metrics endpoint at `/-/metrics` to expose statistics about the health and performance of GitLab. The files required for this are written to a temporary file system (like `/run` or `/dev/shm`).

By default, Docker allocates 64 MB to the shared memory directory (mounted at `/dev/shm`). This is insufficient to hold all the Prometheus metrics related files generated, and will generate error logs like the following:

```
writing value to /dev/shm/gitlab/sidekiq/gauge_all_sidekiq_0-1.db failed with unmapped file
writing value to /dev/shm/gitlab/sidekiq/gauge_all_sidekiq_0-1.db failed with unmapped file
writing value to /dev/shm/gitlab/sidekiq/gauge_all_sidekiq_0-1.db failed with unmapped file
writing value to /dev/shm/gitlab/sidekiq/histogram_sidekiq_0-0.db failed with unmapped file
writing value to /dev/shm/gitlab/sidekiq/histogram_sidekiq_0-0.db failed with unmapped file
writing value to /dev/shm/gitlab/sidekiq/histogram_sidekiq_0-0.db failed with unmapped file
writing value to /dev/shm/gitlab/sidekiq/histogram_sidekiq_0-0.db failed with unmapped file
```

While you can turn off the Prometheus Metrics in the Admin area, the recommended solution to fix this problem is to install with shared memory set to at least 256 MB. If you use `docker run`, you can pass the flag `--shm-size 256m`. If you use a `docker-compose.yml` file, you can set the shm_size key.

## Docker containers exhausts space due to the `json-file`

Docker uses the json-file default logging driver, which performs no log rotation by default. As a result of this lack of rotation, log files stored by the json-file driver can consume a significant amount of disk space for containers that generate a lot of output. This can lead to disk space exhaustion. To address this, use journald as the logging driver when available, or another supported driver with native rotation support.

## Buffer overflow error when starting Docker

If you receive this buffer overflow error, you should purge old log files in `/var/log/gitlab`:
```
buffer overflow detected : terminated
xargs: tail: terminated by signal 6
```

Removing old log files helps fix the error, and ensures a clean startup of the instance.

## ThreadError can’t create Thread Operation not permitted

```
can't create Thread: Operation not permitted
```

This error occurs when running a container built with newer glibc versions on a host that doesn’t support the clone3 function. In GitLab 16.0 and later, the container image includes the Ubuntu 22.04 Linux package, which is built with newer glibc versions.

This problem does not occur in newer container runtime tools like Docker 20.10.10.

To resolve this issue, update Docker to version 20.10.10 or later.

# 参考
[Troubleshooting GitLab running in a Docker container](https://docs.gitlab.com/17.10/install/docker/troubleshooting/)