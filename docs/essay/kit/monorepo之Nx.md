---
lang: zh-CN
title: Kit
titleTemplate: Nx+pnpm搭建Monorepo项目
description: Nx+pnpm搭建Monorepo项目
head:
  - - meta
    - name: description
      content: hello
  - - meta
    - name: keywords
      content: Nx pnpm monorepo SEO
layout: doc
navbar: true
sidebar: true
aside: true
outline: deep
lastUpdated: Date
footer: true
---
# Nx+pnpm搭建Monorepo项目

前置条件：
- 完成全局安装Nx
- 安装pnpm

## 创建Nx workspace

创建Nx workspace，也提供了用其他包管理器创建Nx workspace的方法：
::: code-group

```sh [pnpm]
$ npx create-nx-workspace@latest --pm pnpm
```

```sh [npm]
$ npx create-nx-workspace@latest
```

```sh [yarn]
$ npx create-nx-workspace@latest --pm yarn
```

```sh [bun]
$ bunx create-nx-workspace@latest --pm bun
```

:::

根据提示进行选择：
```sh
√ Where would you like to create your workspace? · nxexample
√ Which stack do you want to use? · node
√ What framework should be used? · none
√ Application name · example
√ Would you like to generate a Dockerfile? [https://docs.docker.com/] · No
√ Which unit test runner would you like to use? · none
√ Would you like to use ESLint? · Yes
√ Would you like to use Prettier for code formatting? · Yes
√ Which CI provider would you like to use? · skip
√ Would you like remote caching to make your build faster? · skip

 NX   Creating your v21.0.3 workspace.

√ Installing dependencies with pnpm
√ Successfully created the workspace: nxexample.
```

生成工作空间目录结构：<br>
```
nxexample
├── apps
|  ├── example
|  |  ├── eslint.config.mjs
|  |  ├── package.json
|  |  ├── src
|  |  |  ├── assets
|  |  |  └── main.ts
|  |  ├── tsconfig.app.json
|  |  └── tsconfig.json
|  └── example-e2e
|     ├── eslint.config.mjs
|     ├── jest.config.ts
|     ├── package.json
|     ├── src
|     |  ├── example
|     |  └── test-setup.ts
|     └── tsconfig.json
├── eslint.config.mjs
├── nx.json
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── README.md
├── tsconfig.base.json
└── tsconfig.json
```

**Options**
|选项|类型|描述|
|:---|:---|:---|
| `--allPrompts`, `--a` | `boolean` | Show all prompts. (Default: `false`) |
| `--appName` | `string` | The name of the app when using a monorepo with certain stacks. |
| `--bundler` | `string` | Bundler to be used to build the app. |
| `--commit.email` | `string` | E-mail of the committer. |
| `--commit.message` | `string` | Commit message. (Default: `Initial commit`) |
| `--commit.name` | `string` | Name of the committer. |
| `--defaultBase` | `string` | Default base to use for new projects. (Default: `main`) |
| `--docker` | `boolean` | Generate a Dockerfile for the Node API. |
| `--e2eTestRunner` | `playwright`, `cypress`, `none` | Test runner to use for end to end (E2E) tests. |
| `--formatter` | `string` | Code formatter to use. |
| `--framework` | `string` | Framework option to be used with certain stacks. |
| `--help` | `boolean` | Show help. |
| `--interactive` | `boolean` | Enable interactive mode with presets. (Default: `true`) |
| `--name` | `string`  | Workspace name (e.g. org name). |
| `--nextAppDir` | `boolean` | Enable the App Router for Next.js. |
| `--nextSrcDir` | `boolean` | Generate a 'src/' directory for Next.js. |
| `--nxCloud`, `--ci` | `github`, `gitlab`, `azure`, `bitbucket-pipelines`, `circleci`, `skip`, `yes` | Which CI provider would you like to use? |
| `--packageManager`, `--pm` | `bun`, `npm`, `pnpm`, `yarn` | Package manager to use. (Default: `npm`) |
| `--prefix` | `string` | Prefix to use for Angular component and directive selectors. |
| `--preset` | `string` | Customizes the initial content of your workspace. Default presets include: ["apps", "npm", "ts", "web-components", "angular-monorepo", "angular-standalone", "react-monorepo", "react-standalone", "vue-monorepo", "vue-standalone", "nuxt", "nuxt-standalone", "next", "nextjs-standalone", "react-native", "expo", "nest", "express", "react", "vue", "angular", "node-standalone", "node-monorepo", "ts-standalone"]. To build your own see [https://nx.dev/extending-nx/recipes/create-preset](https://nx.dev/extending-nx/recipes/create-preset). |
| `--routing` | `boolean` | Add a routing setup for an Angular or React app. (Default: `true`) |
| `--skipGit`, `--g` | `boolean` | Skip initializing a git repository. (Default: `false`) |
| `--ssr` | `boolean` | Enable Server-Side Rendering (SSR) and Static Site Generation (SSG/Prerendering) for the Angular application. |
| `--standaloneApi` | `boolean` | Use Standalone Components if generating an Angular app. (Default: `true`)  |
| `--style` | `string` | Stylesheet type to be used with certain stacks. |
| `--unitTestRunner` | `jest`, `vitest`, `none` | Test runner to use for unit tests. |
| `--useGitHub` | `boolean` | Will you be using GitHub as your git hosting provider? (Default: `false`) |
| `--useProjectJson` | `boolean` | Use a 'project.json' file for the Nx configuration instead of a 'package.json' file. This defaults to 'true' when '--no-workspaces' is used. Otherwise, it defaults to 'false'. |
| `--useReactRouter` | `boolean` | Generate a Server-Side Rendered (SSR) React app using React Router. |
| `--version` | `boolean` | Show version number.  |
| `--workspaces` | `boolean` | Use package manager workspaces. (Default: `true`) |
| `--workspaceType` | `integrated`, `package-based`, `standalone` | The type of workspace to create.|


> [!TIP]
> 关于 `create-nx-workspace [name] [options]` 的参数说明，可以查看 [Options](https://nx.dev/nx-api/nx/documents/create-nx-workspace)

## 安装插件

安装插件并初始化：
```sh
$ nx add <packageSpecifier>
```
> [!NOTE]
> 如果全局安装了 `nx` 以直接使用 `nx` 调用命令，否则使用 `npx nx`、`yarn nx` 或 `pnpm nx`。

使用示例，安装 `21.0.3` 版 `@nx/react` 软件包并运行其 `@nx/react:init` 生成器：
```sh
$ nx add @nx/react@21.0.3
```

输出：
```sh
√ Installing @nx/react@21.0.3...

 NX  Generating @nx/react:init

UPDATE package.json
UPDATE nx.json
Scope: all 3 workspace projects
 WARN  2 deprecated subdependencies found: glob@7.2.3, inflight@1.0.6
Packages: +10
++++++++++
Progress: resolved 937, reused 864, downloaded 3, added 10, done

dependencies:
+ react 19.0.0 (19.1.0 is available)
+ react-dom 19.0.0 (19.1.0 is available)

╭ Warning ───────────────────────────────────────────────────────────────────────────────────╮
│                                                                                            │
│   Ignored build scripts: esbuild.                                                          │
│   Run "pnpm approve-builds" to pick which dependencies should be allowed to run scripts.   │
│                                                                                            │
╰────────────────────────────────────────────────────────────────────────────────────────────╯

Done in 14.1s using pnpm v10.10.0
√ Initializing @nx/react...
```

**Options**
|选项|类型|描述|
|:---|:---|:---|
|`--help`|`boolean`|显示帮助信息。|
|`--packageSpecifier`|`string`|要安装和初始化的软件包名称和可选版本（例如 `@nx/react` 或 `@nx/react@latest`）。如果未指定版本，Nx 核心插件将安装与 `nx` 软件包相同的版本，其他软件包则安装最新版本。|
|`--updatePackageScripts`|`boolean`|使用推断目标更新 `package.json` 脚本。当软件包是核心 Nx 插件时，默认为 `true`。|
|`--verbose`|`boolean`|打印命令的附加信息（如堆栈跟踪）。|
|`--version`|`boolean`|显示版本信息。|

> [!TIP]
> 关于 `add <packageSpecifier>` 的参数说明，可以查看 [Options](https://nx.dev/nx-api/nx/documents/add)

## 创建应用

运行生成器，根据集合中的生成器创建和/或修改文件。
```sh
$ nx generate <collection:generator>
# 或
$ nx g <generator>
```
> [!NOTE]
> 如果全局安装了 `nx` 以直接使用 `nx` 调用命令，否则使用 `npx nx`、`yarn nx` 或 `pnpm nx`。

### 示例

生成一个新的React应用：
```sh
$ nx g @nx/react:app my-app
```

完成后工作空间目录结构：
```sh {20-44}
nxexample 
├── apps
|  ├── example
|  |  ├── eslint.config.mjs
|  |  ├── package.json
|  |  ├── src
|  |  |  ├── assets
|  |  |  └── main.ts
|  |  ├── tsconfig.app.json
|  |  └── tsconfig.json
|  └── example-e2e
|     ├── eslint.config.mjs
|     ├── jest.config.ts
|     ├── package.json
|     ├── src
|     |  ├── example
|     |  └── test-setup.ts
|     └── tsconfig.json
├── eslint.config.mjs
├── my-app
|  ├── eslint.config.mjs
|  ├── index.html
|  ├── package.json
|  ├── public
|  |  └── favicon.ico
|  ├── src
|  |  ├── app
|  |  |  ├── app.module.scss
|  |  |  ├── app.tsx
|  |  |  └── nx-welcome.tsx
|  |  ├── assets
|  |  ├── main.tsx
|  |  └── styles.scss
|  ├── tsconfig.app.json
|  ├── tsconfig.json
|  ├── tsconfig.spec.json
|  └── vite.config.ts
├── my-app-e2e
|  ├── eslint.config.mjs
|  ├── package.json
|  ├── playwright.config.ts
|  ├── src
|  |  └── example.spec.ts
|  └── tsconfig.json
├── nx.json
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── README.md
├── tsconfig.base.json
├── tsconfig.json
└── vitest.workspace.ts

```

生成一个新的React库：
```sh
$ nx generate @nx/react:library libs/mylibrary
```

完成后工作空间目录结构：
```sh {20-31}
nxexample
├── apps
|  ├── example
|  |  ├── eslint.config.mjs
|  |  ├── package.json
|  |  ├── src
|  |  |  ├── assets
|  |  |  └── main.ts
|  |  ├── tsconfig.app.json
|  |  └── tsconfig.json
|  └── example-e2e
|     ├── eslint.config.mjs
|     ├── jest.config.ts
|     ├── package.json
|     ├── src
|     |  ├── example
|     |  └── test-setup.ts
|     └── tsconfig.json
├── eslint.config.mjs
├── libs
|  └── mylibrary
|     ├── eslint.config.mjs
|     ├── package.json
|     ├── README.md
|     ├── src
|     |  ├── index.ts
|     |  └── lib
|     ├── tsconfig.json
|     ├── tsconfig.lib.json
|     ├── tsconfig.spec.json
|     └── vite.config.ts
├── my-app
|  ├── eslint.config.mjs
|  ├── index.html
|  ├── package.json
|  ├── public
|  |  └── favicon.ico
|  ├── src
|  |  ├── app
|  |  |  ├── app.module.scss
|  |  |  ├── app.tsx
|  |  |  └── nx-welcome.tsx
|  |  ├── assets
|  |  ├── main.tsx
|  |  └── styles.scss
|  ├── tsconfig.app.json
|  ├── tsconfig.json
|  ├── tsconfig.spec.json
|  └── vite.config.ts
├── my-app-e2e
|  ├── eslint.config.mjs
|  ├── package.json
|  ├── playwright.config.ts
|  ├── src
|  |  └── example.spec.ts
|  └── tsconfig.json
├── nx.json
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── README.md
├── tsconfig.base.json
├── tsconfig.json
└── vitest.workspace.ts
```

## 运行项目

### `run`

运行项目的目标（例如，`nx run myapp:serve:production`）。

也可以使用后缀符号运行目标：（例如，`nx serve myapp --configuration=production`）

使用 `--skip-nx-cache` 选项可以跳过 Nx 缓存的使用。

使用方法：
```sh
$ nx run [project][:target][:configuration] [_..]
```

**Options**
|选项|类型|描述|
|:---|:---|:---|
| `--batch`| `boolean` | Run task(s) in batches for executors which support batches. (Default: `false`)|
| `--configuration`, `--c` | `string` | This is the configuration to use when performing tasks on projects.|
| `--exclude` | `string` | Exclude certain projects from being processed. |
| `--excludeTaskDependencies` | `boolean` | Skips running dependent tasks first. (Default: `false`) |
| `--graph` | `string` | Show the task graph of the command. Pass a file path to save the graph data instead of viewing it in the browser. Pass "stdout" to print the results to the terminal. |
| `--nxBail` | `boolean` | Stop command execution after the first failed task. (Default: `false`) |
| `--nxIgnoreCycles` | `boolean` | Ignore cycles in the task graph. (Default: `false`) |
| `--outputStyle` | `tui`, `dynamic`, `dynamic-legacy`, `static`, `stream`, `stream-without-prefixes` | Defines how Nx emits outputs tasks logs. **tui**: enables the Nx Terminal UI, recommended for local development environments. **dynamic-legacy**: use dynamic-legacy output life cycle, previous content is overwritten or modified as new outputs are added, display minimal logs by default, always show errors. This output format is recommended for local development environments where tui is not supported. **static**: uses static output life cycle, no previous content is rewritten or modified as new outputs are added. This output format is recommened for CI environments. **stream**: nx by default logs output to an internal output stream, enable this option to stream logs to stdout / stderr. **stream-without-prefixes**: nx prefixes the project name the target is running on, use this option remove the project name prefix from output. |
| `--parallel` | `string` | Max number of parallel processes [default is 3]. |
| `--project` | `string`  | Target project. |
| `--runner` | `string` | This is the name of the tasks runner configured in nx.json. |
| `--skipNxCache`, `--disableNxCache` | `boolean` | Rerun the tasks even when the results are available in the cache. (Default: `false`) |
| `--skipRemoteCache`, `--disableRemoteCache` | `boolean` | Disables the remote cache. (Default: `false`) |
| `--skipSync` | `boolean` | Skips running the sync generators associated with the tasks. (Default: `false`) |
| `--tuiAutoExit` | `string` | Whether or not to exit the TUI automatically after all tasks finish, and after how long. If set to `true`, the TUI will exit immediately. If set to `false` the TUI will not automatically exit. If set to a number, an interruptible countdown popup will be shown for that many seconds before the TUI exits. |
|`--verbose`|`boolean`|打印命令的附加信息（如堆栈跟踪）。|
|`--version`|`boolean`|显示版本信息。|

#### 示例

运行 `myapp` 项目的目标构建：
```shell
$ nx run myapp:build
```

以生产配置运行 `myapp` 项目的目标构建：
```shell
$ nx run myapp:build:production
```

预览 Nx 将在 webview 中运行的任务图：
```shell
$ nx run myapp:build --graph
```

将任务图保存到文件中：
```shell
$ nx run myapp:build --graph=output.json
```

打印任务图保存到控制台：
```shell
$ nx run myapp:build --graph=stdout
```

为 `myapp` 项目运行名为 `build:test` 的目标。注意目标名称周围的引号，以防 "test "被视为配置：
```shell
$ nx run myapp:"build:test"
```

### `run-many`

为多个列出的项目运行目标。

使用方法：
```sh
$ nx run-many
```

**Options**
|选项|类型|描述|
|:---|:---|:---|
| `--all` | `boolean` | [deprecated] `run-many` runs all targets on all projects in the workspace if no projects are provided. This option is no longer required. (Default: `true`) |
| `--batch` | `boolean` | Run task(s) in batches for executors which support batches. (Default: `false`) |
| `--configuration`, `--c` | `string` | This is the configuration to use when performing tasks on projects. |
| `--exclude` | `string` | Exclude certain projects from being processed. |
| `--excludeTaskDependencies` | `boolean` | Skips running dependent tasks first. (Default: `false`) |
| `--graph` | `string` | Show the task graph of the command. Pass a file path to save the graph data instead of viewing it in the browser. Pass "stdout" to print the results to the terminal. |
| `--help` | `boolean` | Show help. |
| `--nxBail` | `boolean` | Stop command execution after the first failed task. (Default: `false`) |
| `--nxIgnoreCycles` | `boolean` | Ignore cycles in the task graph. (Default: `false`)  | `dynamic-legacy`, `dynamic`, `tui`, `static`, `stream`, `stream-without-prefixes` | Defines how Nx emits outputs tasks logs. **tui**: enables the Nx Terminal UI, recommended for local development environments. **dynamic-legacy**: use dynamic-legacy output life cycle, previous content is overwritten or modified as new outputs are added, display minimal logs by default, always show errors. This output format is recommended for local development environments where tui is not supported. **static**: uses static output life cycle, no previous content is rewritten or modified as new outputs are added. This output format is recommened for CI environments. **stream**: nx by default logs output to an internal output stream, enable this option to stream logs to stdout / stderr. **stream-without-prefixes**: nx prefixes the project name the target is running on, use this option remove the project name prefix from output. |
| `--parallel` | `string` | Max number of parallel processes [default is 3]. |
| `--projects`, `--p` | `string`  | Projects to run. (comma/space delimited project names and/or patterns). |
| `--runner` | `string` | This is the name of the tasks runner configured in nx.json. |
| `--skipNxCache`, `--disableNxCache` | `boolean` | Rerun the tasks even when the results are available in the cache. (Default: `false`) |
| `--skipRemoteCache`, `--disableRemoteCache` | `boolean` | Disables the remote cache. (Default: `false`) |
| `--skipSync` | `boolean` | Skips running the sync generators associated with the tasks. (Default: `false`) |
| `--targets`, `--target`, `--t` | `string` | Tasks to run for affected projects. |
| `--tuiAutoExit` | `string` | Whether or not to exit the TUI automatically after all tasks finish, and after how long. If set to `true`, the TUI will exit immediately. If set to `false` the TUI will not automatically exit. If set to a number, an interruptible countdown popup will be shown for that many seconds before the TUI exits. |
|`--verbose`|`boolean`|打印命令的附加信息（如堆栈跟踪）。|
|`--version`|`boolean`|显示版本信息。|

#### 示例

测试所有项目：
```shell
$ nx run-many -t test
```

并行测试 `proj1` 和 `proj2`：
```shell
$ nx run-many -t test -p proj1 proj2
```

使用 5 个 workers 并行测试 `proj1` 和 `proj2`：
```shell
$ nx run-many -t test -p proj1 proj2 --parallel=5
```

依次测试 `proj1` 和 `proj2`：
```shell
$ nx run-many -t test -p proj1 proj2 --parallel=false
```

测试除 `excluded-app` 以外所有以 `*-app` 结尾的项目。注意：您的 `shell` 可能要求您转义 `*` 就像这样 `\*`:
```shell
$ nx run-many -t test --projects=*-app --exclude excluded-app
```

测试所有标签以 `api-` 开头的项目。注意：您的 shell 可能要求您像这样转义 `*` 就像这样 `\*`:
```shell
$ nx run-many -t test --projects=tag:api-*
```

测试所有带有 `type:ui` 标记的项目：
```shell
$ nx run-many -t test --projects=tag:type:ui
```

测试所有带有 `type:ui` 或者 `type:feature` 标记的项目：
```shell
$ nx run-many -t test --projects=tag:type:feature,tag:type:ui
```

运行所有项目的 `lint`、测试和构建目标。需要 Nx v15.4 以上版本：
```shell
$ nx run-many --targets=lint,test,build
```

预览 Nx 将在 webview 中运行的任务图：
```shell
$ nx run-many -t=build --graph
```

将任务图保存到文件中：
```shell
$ nx run-many -t=build --graph=output.json
```

打印任务图保存到控制台：
```shell
$ nx run-many -t=build --graph=stdout
```
