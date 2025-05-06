---
lang: zh-CN
title: Git
titleTemplate: 修改远程仓库地址
description: 修改远程仓库地址
head:
  - - meta
    - name: description
      content: 修改远程仓库地址
  - - meta
    - name: keywords
      content: git repo 仓库 SEO
layout: doc
navbar: true
sidebar: true
aside: true
outline: deep
lastUpdated: Date
footer: true
order: 2
---
# Git修改远程仓库地址

## 查看Git远程仓库源地址

在使用Git进行版本控制时，查看远程仓库的源地址是一个常见的需求。以下是几种查看远程仓库源地址的方法：
- 使用`git remote -v`命令<br>
  最简单的方法是使用 git remote -v 命令。这个命令会列出所有远程仓库的详细信息，包括名称和URL地址。例如：
  ```sh
  $ git remote -v
  ```

  输出结果：
  ```sh
  origin  https://github.com/username/repo.git (fetch)
  origin  https://github.com/username/repo.git (push)
  ```
  > [!TIP]
  > origin 是默认的远程仓库名称，可以根据实际情况修改。


- 使用 `git remote show origin` 命令<br>
  另一种方法是使用 `git remote show origin` 命令，这个命令会显示远程仓库的更多详细信息，包括URL地址。例如：
  ```sh
  $ git remote show origin
  ```

  输出结果：
  ```sh
  * remote origin
    Fetch URL: https://github.com/username/repo.git
    Push  URL: https://github.com/username/repo.git
    HEAD branch: main
    Remote branches:
      main tracked
    Local ref configured for 'git push':
      main pushes to main (up to date)
  ```
  > [!NOTE]
  > 输出结果可能有所不同

## 修改远程仓库地址
在使用Git进行版本控制时，有时需要更换远程仓库的地址。以下是三种常见的方法来更换Git远程仓库地址：
- 使用`git remote set-url`命令<br>
  ```sh
  $ git remote set-url origin https://github.com/new-username/new-repo.git # 新地址
  ```

- 删除远程仓库后重新添加<br>
  删除现有的远程仓库
  ```sh
  $ git remote remove origin
  ```

  添加新的远程仓库
  ```sh
  $ git remote add origin https://github.com/new-username/new-repo.git # 新地址
  ```

- 修改 `.git` 文件夹中的 `config` 文件<br>
  ① 打开项目根目录下的 `.git` 文件夹。<br>
  ② 找到并编辑 `config` 文件，将 `[remote "origin"]` 部分的 `url` 修改为新的远程仓库地址：
  ```sh
  [core]
    repositoryformatversion = 0
    filemode = false
    bare = false
    logallrefupdates = true
    symlinks = false
    ignorecase = true
  [remote "origin"]
    url = https://github.com/username/repo.git # [!code focus]
    fetch = +refs/heads/*:refs/remotes/origin/*
  ```
     