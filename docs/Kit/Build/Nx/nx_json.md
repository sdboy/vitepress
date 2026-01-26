---
lang: zh-CN
title: Nx
titleTemplate: nx.json文件详情
description: nx.json文件详情
head:
  - - meta
    - name: description
      content: nx.json文件详情
  - - meta
    - name: keywords
      content: nx json config
layout: doc
navbar: true
sidebar: true
aside: true
outline: deep
lastUpdated: Date
footer: true
---

# `nx.json` 文件详情

## 插件

Nx插件能提升用户使用各类工具与Nx协同工作的体验。插件的核心功能在于：它们能[根据工具的配置自动调整Nx执行任务的方式](https://nx.dev/docs/concepts/inferred-tasks)。为使插件能为Nx配置任务，需将其注册到 `plugins` 数组中。若插件无配置选项，可直接以字符串形式列出；否则应以对象形式列出，该对象需包含 `plugin` 属性与 `options` 属性。

每个插件的行为各不相同，因此请查阅插件自身的文档以了解其功能。您可浏览[插件注册表](https://nx.dev/docs/plugin-registry)查看可用插件。

::: code-group

```json [nx.json]
{
  "plugins": [
    "@my-org/graph-plugin",
    {
      "plugin": "@nx/eslint/plugin",
      "options": {
        "targetName": "lint"
      }
    }
  ]
}
```

:::

### 将插件限定于特定项目

插件通过配置文件推断项目任务。您可以在插件配置对象中使用 `include` 和 `exclude` 属性，指定哪些配置文件将被Nx插件处理。

::: code-group

```json [nx.json]
{
  "plugins": [
    {
      "plugin": "@nx/jest/plugin",
      "include": ["packages/**/*"], // 包括所有 packages 文件夹下的项目
      "exclude": ["**/*-e2e/**/*"], // 排除所有在 *-e2e 文件夹下的项目
    },
  ],
}
```

:::

`include` 和 `exclude` 属性均为文件通配符模式，用于包含或排除插件正在解析的配置文件。在给定示例中，`@nx/jest/plugin` 插件仅会为满足以下条件的项目推断任务：其 `jest.config.ts` 文件路径匹配 `packages/**/*` 通配符模式，但不匹配 `**/*-e2e/**/*` 通配符模式。

## 任务选项

以下属性会影响 Nx 执行任务的方式，可在 `nx.json` 的根目录下进行设置。

| 属性 | 描述 |
| :-- | :-- |
| `parallel` | 定义并行运行的目标的最大数量 |
| `captureStderr` | 定义缓存是否捕获标准错误输出（`stderr`）或仅捕获标准输出（`stdout`） |
| `skipNxCache` | 定义是否应跳过Nx缓存（默认为 `false`） |
| `cacheDirectory` | 定义本地缓存的存储位置（默认为 `.nx/cache`） |
| `encryptionKey` | （仅限使用"`nx-cloud`"时）定义加密密钥以支持云缓存的端到端加密。您也可通过环境变量 `NX_CLOUD_ENCRYPTION_KEY` 提供密钥，该变量值即为加密密钥。Nx Cloud任务运行器会规范密钥长度，因此任何长度的密钥均可接受。 |
| `selectivelyHashTsConfig` | 仅对 `tsconfig.base.json` 中活动项目的路径映射进行哈希处理（例如，添加/移除项目不会影响现有项目的哈希值）（默认为 `false`） |

您可以在 `nx.json` 中配置并行处理，也可以在终端中设置 `--parallel` 标志：`nx run-many -t test --parallel=5`

## Default Base

告知Nx在计算受影响项目时应使用哪个基准分支。

- 默认情况下，Nx使用 `main` 分支作为基准分支。

> [!TIP]
> `git init` 命令用于在当前目录中初始化一个新的 Git 仓库。通过指定 `-b` 参数，可以直接设置默认分支名称为 `main`。
>
> ```bash
> git init -b main
> ```
>
> 如果仓库已经初始化为其他分支（如 `master`），可以通过以下命令重命名分支：
>
> ```bash
> git branch -m master main
> ```
>
> 全局设置默认分支为 `main`：
>
> ```bash
> git config --global init.defaultBranch main
> ```
>
> 这样，无需每次手动指定，所有新仓库都会以 `main` 为默认分支。

## Target Defaults

目标默认值为在工作区中为特定目标设置常用选项提供了途径。在构建项目配置时，我们会将其与该映射中的最多1个默认值进行合并。对于给定目标，我们会检查其名称和执行器，然后在目标默认值中查找键值匹配以下任一条件的配置：

- `${executor}`

- `${targetName}` （如果配置指定了执行器，则该执行器也需与目标的执行器相匹配）

此外，如果上述两种情况均未匹配成功，我们将通过通配符模式查找其他可能匹配目标名称的键。例如，目标默认值中类似 `e2e-ci--**/**` 的键将匹配由任务原子化器插件创建的所有目标。

匹配执行器的目标默认值优先于匹配目标名称的默认值。若为特定目标找到默认值，则将其作为该目标配置的基础。

> [!CAUTION]
> 当使用目标名称作为目标默认值的键(`key`)时，请确保所有同名目标使用相同的执行器，或者确保您设置的目标默认值对所有目标都合理，无论它们使用何种执行器。在目标默认值中设置的任何内容也会覆盖[插件推断出的任务](https://nx.dev/docs/concepts/inferred-tasks)配置。

以下是一些常见场景。

### 输入 & 命名输入

在 `nx.json` 中定义的命名输入将与[项目级配置](https://nx.dev/docs/reference/project-configuration)中定义的命名输入合并。换言之，每个项目都拥有一组命名输入，其定义方式如下：`{...namedInputsFromNxJson, ...namedInputsFromProjectsProjectJson}`。

您还可以定义和重新定义命名输入。这实现了关键用例之一，您的 `nx.json` 文件可定义如下内容（适用于每个项目）：

::: code-group

```json [nx.json]
{
  "targetDefaults": {
    "test": {
      "inputs": ["default", "^production"]
    }
  }
}
```

:::

项目可以定义其生产（`production`）输入，而无需重新定义测试（`test`）目标的输入。

::: code-group

```json [project.json]
{
  "namedInputs": {
    "production": ["default", "!{projectRoot}/**/*.test.js"]
  }
}
```

:::

在此情况下，Nx将为每个项目使用正确的生产（`production`）投入。

[输入和命名输入](https://nx.dev/docs/reference/inputs)

[配置任务缓存的输入](https://nx.dev/docs/guides/tasks--caching/configure-inputs)

### 任务管道

目标可以依赖于其他目标。常见场景是需要先构建项目的依赖项，再构建该项目本身。通过 `project.json` 中的 `dependsOn` 属性，可为单个目标定义依赖项列表。

通常需要为仓库中的每个项目重复配置相同的 `dependsOn` 设置，此时在 `nx.json` 中定义 `targetDefaults` 就显得尤为实用。

::: code-group

```json [nx.json]
{
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"]
    }
  }
}
```

:::

上述配置等同于在每个项目的每个构建（`build `）目标中添加 `{"dependsOn": ["^build"]}`。

[项目配置参考](https://nx.dev/docs/reference/project-configuration#dependson)

[什么是任务管道](https://nx.dev/docs/concepts/task-pipeline-configuration)

### 输出

另一个可配置的目标默认值是输出（`outputs`）：

::: code-group

```json [nx.json]
{
  "targetDefaults": {
    "build": {
      "outputs": ["{projectRoot}/custom-dist"]
    }
  }
}
```

:::

在目标默认值中定义任何选项或配置时，可使用 `{workspaceRoot}` 和 `{projectRoot}` 令牌。这对于定义值为路径的选项非常有用。

::: code-group

```json [nx.json]
{
  "targetDefaults": {
    "@nx/js:tsc": {
      "options": {
        "main": "{projectRoot}/src/index.ts"
      },
      "configurations": {
        "prod": {
          "tsconfig": "{projectRoot}/tsconfig.prod.json"
        }
      },
      "inputs": ["prod"],
      "outputs": ["{workspaceRoot}/{projectRoot}"]
    },
    "build": {
      "inputs": ["prod"],
      "outputs": ["{workspaceRoot}/{projectRoot}"],
      "cache": true
    }
  }
}
```

:::

#### 目标默认优先级

请注意，输入和输出在 `@nx/js:tsc` 和构建（`build`）默认配置中均有指定。这是必需的，因为在读取目标默认值时，Nx 只会检查一个键。如果存在基于所用执行器的默认配置，则优先读取该配置；否则，Nx 将回退到基于目标名称的配置。例如，当构建（`build`）目标配置使用 `@nx/js:tsc` 执行器时，执行 `nx build project` 命令将读取 `targetDefaults[@nx/js:tsc]` 中的选项。除非执行器不匹配，否则不会读取构建（`build`）目标默认配置中的任何设置。

[配置任务缓存的输入](https://nx.dev/docs/guides/tasks--caching/configure-outputs)

### 缓存

在 Nx 17 及更高版本中，缓存配置通过在目标配置中指定 `"cache": true` 实现。这将告知 Nx 可以缓存特定目标的执行结果。例如，若某个目标用于运行测试，可在测试目标的默认配置中设置 `"cache": true`，Nx 便会缓存测试运行的结果。

::: code-group

```json [nx.json]
{
  "targetDefaults": {
    "test": {
      "cache": true
    }
  }
}
```

:::

> [!CAUTION]
> 按项目缓存 + 分发
>
> 若您启用了分布式任务执行，但为某个目标禁用了缓存功能，则无法对该目标使用分布式任务执行。这是因为分布式任务执行要求缓存功能处于启用状态。这意味着：当您尝试启用Nx Agents运行时，您禁用了缓存功能的目标及其所有依赖目标都将导致管道运行失败。

### 执行器/命令选项

您可以为目标的执行器配置特定选项。例如，如果您的仓库中有项目使用 `@nx/js:tsc` 执行器，则可以按如下方式提供一些默认选项：

::: code-group

```json [nx.json]
{
  "targetDefaults": {
    "@nx/js:tsc": {
      "options": {
        "generateExportsField": true
      }
    }
  }
}
```

:::

您还可以为[推断出的目标](https://nx.dev/docs/concepts/inferred-tasks)或目标使用 `nx:run-commands` 执行器的目标运行命令提供默认值。例如，如果您的仓库中有项目所有构建（`build`）目标都运行相同的 `vite build` 命令，则可以按如下方式提供一些默认选项：

::: code-group

```json [nx.json]
{
  "targetDefaults": {
    "build": {
      "options": {
        "assetsInlineLimit": 2048,
        "assetsDir": "static/assets"
      }
    }
  }
}
```

:::

> [!CAUTION]
> 若多个同名目标运行不同命令（或使用不同执行器），请勿在 `targetDefaults` 中设置选项。不同命令会接受不同选项，而目标默认值将应用于所有同名目标，无论其运行何种命令。若为其在 `targetDefaults` 中提供选项，那些不支持这些选项的命令可能会抛出错误。

有关如何向底层命令传递参数的更多详细信息，请参阅[向命令传递参数](https://nx.dev/docs/guides/tasks--caching/pass-args-to-commands)示例。

### Task Atomizer 配置

Task Atomizer插件会创建多个具有相似模式的目标。例如，`@nx/cypress` 插件会创建一个顶级 `e2e-ci` 目标，并为每个测试文件创建类似 `e2e-ci--test/my/test.spec.ts` 的目标。为避免为每个目标单独编写默认目标，您可以在 `target default` 键中使用通配符模式。

::: code-group

```json [nx.json]
{
  "targetDefaults": {
    "e2e-ci--**/**": {
      "options": {
        "headless": true
      }
    }
  }
}
```

:::

> [!TIP]
> 模式匹配
>
> Nx使用通配符模式匹配目标名称。这意味着上述 `**/**` 模式是必需的，因为测试可能嵌套在目录中，导致目标名称包含 `/`。若目标名称不含 `/`，可使用更简洁的模式，例如 `e2e-ci-*`。

## Release

`nx.json` 中的 `release` 属性用于配置 `nx release` 命令。该属性为可选项，因为 `nx release` 即使在零配置状态下也能运行，但当存在该属性时，它将用于配置发布流程中的版本控制、变更日志和发布阶段。

有关 nx 版本发布的更多信息，请参阅[管理版本发布](https://nx.dev/docs/features/manage-releases)。

有关 `"release"` 版本的完整配置选项列表，请参阅此处：<https://github.com/nrwl/nx/blob/master/packages/nx/src/config/nx-json.ts>，具体位于 `NxReleaseConfiguration` 部分。

### 项目

若需限制 `nx release` 命令的目标项目，可通过 `nx.json` 文件中的 `projects` 属性实现。该属性支持字符串或字符串数组形式，字符串内容可以是项目名称、通配符模式、目录路径、标签引用，或任何符合 `--projects` 过滤器规范的值（该规范亦适用于 `nx run` 等其他命令）。

::: code-group

```json [nx.json]
{
  "release": {
    // Here we are configuring nx release to target all projects
    // except the one called "ignore-me"
    "projects": ["*", "!ignore-me"],
  },
}
```

:::

### 项目关系

`projectsRelationship` 属性用于告知 Nx 是否应独立发布项目或统一发布。默认情况下，Nx 会将所有项目同步发布，这相当于设置 `"projectRelationships": "fixed"`。若需独立发布项目，可将 `"projectsRelationship"` 设为 `"independent"`。

::: code-group

```json [nx.json]
{
  "release": {
    // Here we are configuring nx release to release projects
    // independently, as opposed to the default of "fixed"
    "projectsRelationship": "independent",
  },
}
```

:::

### 发布标签

`releaseTag` 属性控制 Git 标签的解析与生成方式。默认情况下，标签遵循语义化版本规范并据此进行验证。

> [!IMPORTANT]
> 发布标签配置现采用嵌套的 `releaseTag` 对象。旧式扁平属性（如 `releaseTagPattern` 等）已弃用，但在 Nx 23 版本之前仍可正常使用。
>
> Nx 22+: `releaseTag.pattern`, `releaseTag.requireSemver`, `releaseTag.strictPreid`
>
> Nx < 22: `releaseTagPattern`, `releaseTagPatternRequireSemver`, `releaseTagPatternStrictPreid`

#### 配置选项

| 属性 | 类型 | 默认值 | 描述 |
| :-- | :-- | :-- | :-- |
| `pattern` | `string` | v{版本号} 用于固定版本，{项目名称}@{版本号} 用于独立版本 | 要使用的Git标签模式。支持插值`{version}`、`{projectName}` 和 `{releaseGroupName}`。 |
| `requireSemver` | `boolean` | `false` | 是否要求所有标签都符合语义化版本控制规范 |
| `strictPreid` | `boolean` | `false` 表示独立发布组，`true` 表示固定发布组 | 是否确保预发布ID在所有包中保持一致 |
| `preferDockerVersion` | `boolean` | `false` | 是否在Git标签中优先使用Docker兼容的版本格式 |
| `checkAllBranchesWhen` | `string` | `undefined` | 从Git标签解析当前版本时需检查的分支 |

#### 标签模式语法

标签模式支持插入以下值：

- `{version}` - 当前发布的版本号

- `{projectName}` - 正在发布的项目名称（独立发布时）

- `{releaseGroupName}` - 正在发布的发布组名称（使用发布组时）

示例模式及其结果：

- `v{version}` → `v1.0.0`（固定版本的默认模式）
- `{projectName}@{version}` → `my-lib@1.0.0`（独立版本的默认模式）

- `{releaseGroupName}/{projectName}/{version}` → `backend/api/1.0.0`

- `release/{version}` → `release/1.0.0`

#### 配置示例

::: code-group

```json [Nx 22+ nx.json]
{
  "release": {
    "releaseTag": {
      "pattern": "{releaseGroupName}-v{version}",
      "requireSemver": true,
      "strictPreid": true,
      "preferDockerVersion": false,
      "checkAllBranchesWhen": "main",
    },
  },
}
```

```json [Nx &lt; 22 nx.json]
{
  "release": {
    "releaseTagPattern": "{releaseGroupName}-v{version}",
    "releaseTagPatternRequireSemver": true,
    "releaseTagPatternStrictPreid": true,
    "releaseTagPatternPreferDockerVersion": false,
    "releaseTagPatternCheckAllBranchesWhen": "main",
  },
}
```

:::

### 版本

版本（`version`）属性用于配置发布流程中的版本控制阶段。它用于确定项目的下一个版本，并更新所有依赖这些项目的项目以使用新版本。

> [!IMPORTANT]
> Nx v22 中的重大变更
>
> 在 Nx v22 中，旧版版本控制机制已被完全移除。该机制自 Nx 21 起即已弃用。Nx v21 提供了自动迁移功能，运行 `nx migrate` 命令时会将配置更新为新格式。
>
> 针对 Nx 22，此自动迁移功能已重新添加，允许通过运行 `nx migrate` 命令更新配置。

在后台，特定于生态系统的版本（`version`）逻辑由 `VersionActions` 实现驱动。Nx 会为您预先配置最广泛适用的 `VersionActions` 实现，即由 `@nx/js` 插件提供的 `@nx/js/src/release/version-actions`。

> [!IMPORTANT]
> 程序化API（Nx 22+）
>
> 对于高级使用场景，`ReleaseClient` 程序化 API 允许您通过自定义脚本触发发布操作。在 Nx 22 及更高版本中，使用该 API 时可选择完全忽略 `nx.json` 发布配置文件，这对于仅处理仓库子集的临时脚本尤为实用。

因此，核心版本选项直接位于版本属性的顶级（截至Nx v21），而生态系统特定选项可通过 `versionActionsOptions` 访问：

::: code-group

```json [nx.json]
{
  "release": {
    "version": {
      // Core options
      "conventionalCommits": true,
      "manifestRootsToUpdate": ["dist/packages/{projectName}"],
      // Ecosystem-specific options
      "versionActionsOptions": {
        "skipLockFileUpdate": true,
      },
    },
  },
}
```

:::

在 Nx 22 中的一些重大变化：

- `preserveMatchingDependencyRanges` 现默认为 `true`（此前为 `false`）

  - 当设置为 `true` 时，若依赖项版本范围已满足新发布的版本要求，则保留该范围

  - 示例：若发布 `1.2.0` 版本，且某个依赖项的范围为 `^1.0.0`，则该范围保持为 `^1.0.0` 而不会更新为 `1.2.0`

  - 若需所有依赖项使用精确版本，请显式设置为 `false`

- `updateDependents` 现默认值为 `"always"`（此前为 `"auto"`）

  - `"always"`：无论过滤器选择如何，在图中所有位置更新依赖项

  - `"auto"`：仅在选定项目或发布组内更新依赖项

  - `"never"`：永不更新依赖项

- `releaseTag*` 属性（如 `releaseTagPattern` 和 `releaseTagPatternStrictPreid`）已合并为单个 `releaseTag` 对象。(`releaseTagPattern` -> `releaseTag.pattern`, `releaseTagPatternStrictPreid` -> `releaseTag.strictPreid`)

- `releaseTag.strictPreid` 现默认为 `true`

- 修复发布组发布标签模式，现默认为 `{releaseGroupName}-v{version}`

### Changelog

`changelog` 属性用于配置发布流程中的变更日志阶段。它用于为项目生成变更日志，并将其提交至存储库。

可生成的变更日志有两种类型：

- 工作区变更日志：包含工作区内所有项目变更的日志。当独立发布项目时不适用此类型。

- 项目变更日志：包含特定项目所有变更的日志。

`changelog` 属性用于配置这两个变更日志。

#### 工作区变更日志

`changelog.workspaceChangelog` 属性用于配置工作区变更日志。该属性用于确定是否生成工作区变更日志以及生成方式。

::: code-group

```json [nx.json]
{
  "release": {
    "changelog": {
      // This disables the workspace changelog
      "workspaceChangelog": false,
    },
  },
}
```

:::

::: code-group

```json [nx.json]
{
  "release": {
    "changelog": {
      "workspaceChangelog": {
        // This will create a GitHub release containing the workspace
        // changelog contents
        "createRelease": "github",
        // This will disable creating a workspace CHANGELOG.md file
        "file": false,
      },
    },
  },
}
```

:::

#### 项目变更日志

`changelog.projectChangelogs` 属性用于配置项目变更日志。该属性决定项目变更日志是否生成以及生成方式。

::: code-group

```json [nx.json]
{
  "release": {
    "changelog": {
      // This enables project changelogs with the default options
      "projectChangelogs": true,
    },
  },
}
```

:::

::: code-group

```json [nx.json]
{
  "release": {
    "changelog": {
      "projectChangelogs": {
        // This will create one GitHub release per project containing
        // the project changelog contents
        "createRelease": "github",
        // This will disable creating any project level CHANGELOG.md
        // files
        "file": false,
      },
    },
  },
}
```

:::

#### 替换现有内容 $\colorbox{green}{Nx v22+}$

默认情况下，变更日志条目会追加到现有变更日志文件的末尾。若要完全替换整个变更日志文件的内容，请使用 `replaceExistingContents` 选项：

::: code-group

```json [nx.json]
{
  "release": {
    "changelog": {
      "workspaceChangelog": {
        // Replaces the entire CHANGELOG.md file with the new content
        "replaceExistingContents": true,
      },
    },
  },
}
```

:::

此选项同时适用于工作区变更日志和项目变更日志。当您希望从头开始重新生成完整的变更日志，而非维护累积历史记录时，该功能将非常实用。

### Git

`git` 属性用于配置作为发布流程一部分执行的自动化 git 操作。

::: code-group

```json [nx.json]
{
  "release": {
    "git": {
      // This will enable committing any changes (e.g. package.json
      // updates, CHANGELOG.md files) to git
      "commit": true,
      // This will enable create a git for the overall release, or
      // one tag per project for independent project releases
      "tag": false,
    },
  },
}
```

:::

## Sync

这些是 [nx sync](https://nx.dev/docs/reference/nx-commands#nx-sync) 命令的全局配置选项。`nx sync` 命令会运行所有全局和任务特定的[同步生成器](https://nx.dev/docs/concepts/sync-generators)，以确保您的文件处于正确状态，从而能够运行任务或启动 CI 流程。

::: code-group

```json [nx.json]
{
  "sync": {
    "applyChanges": true,
    "globalGenerators": ["my-plugin:my-sync-generator"],
    "generatorOptions": {
      "my-plugin:my-sync-generator": {
        "verbose": true,
      },
    },
    "disabledTaskSyncGenerators": ["other-plugin:problematic-generator"],
  },
}
```

:::

| 属性 | 说明 |
| :-- | :-- |
| `applyChanges` | 是否在运行任务时自动应用任务同步生成器的更改。若未设置，将提示用户确认。若设置为 `true`，则不提示用户并直接应用更改。若设置为 `false`，则不提示用户且不应用更改。 |
| `globalGenerators` | 仅在执行 `nx sync` 命令时运行的同步生成器。这些生成器不与特定任务相关联。 |
| `generatorOptions` | 传递给同步生成器的选项 |
| `disabledTaskSyncGenerators` | 全局禁用特定任务同步生成器 |

## Generators

默认生成器选项可在 `nx.json` 中配置。例如，以下配置指示 Nx 在使用 `@nx/js` 插件创建新库时始终传递 `--buildable=true` 参数。

::: code-group

```json [nx.json]
{
  "generators": {
    "@nx/js:library": {
      "buildable": true
    }
  }
}
```

:::

## Extends

某些预设使用 `extends` 属性，将部分默认选项隐藏在单独的 `json` 文件中。`extends` 属性指定的 `json` 文件位于 `node_modules` 文件夹内。Nx 预设文件由 [`nx` 包](https://github.com/nrwl/nx/tree/master/packages/nx/presets)提供。

## Nx Cloud

## Max Cache Size

在 `nx.json` 文件中，`maxCacheSize` 属性允许您设置本地缓存的大小限制。若未设置该值，Nx 将默认采用缓存存储磁盘容量的 `10%` 作为最大缓存大小，上限为 `10GB`。这意味着若磁盘容量为 `100GB`，则最大缓存大小为 `10GB`。当缓存超过指定大小时，Nx会移除最近最少使用的缓存条目，直至总大小降至指定限制的 `90%` 以下。

您也可通过环境变量 `NX_MAX_CACHE_SIZE` 覆盖此值，该变量采用相同单位且优先级高于 `nx.json` 中的 `maxCacheSize` 选项。

若将 `maxCacheSize` 设为 `0`，即可禁用此行为。

`maxCacheSize` 的有效值可以以字节（bytes）、千字节 (KB)、兆字节 (MB) 或千兆字节 (GB) 为单位指定。例如，以下任何值都是有效的：

| 值 | 说明 |
| :-- | :-- |
| `819200` | 819200字节 |
| `100MB` | 100兆字节 |
| `1GB` | 1千兆字节 |
| `0` | 本地缓存大小无限制（禁用缓存大小限制） |

::: code-group

```json [nx.json]
{
  "maxCacheSize": "0" // No limit on the local cache size
}
```

:::

::: code-group

```json [nx.json]
{
  "maxCacheSize": "10GB" // Set the maximum cache size to 10 gigabytes
}
```

:::

无论 `maxCacheSize` 设置为何值，Nx都会清除过去7天内未被访问的缓存条目。

## TUI

`nx.json` 配置文件中的 `tui` 属性用于配置[终端用户界面](https://nx.dev/docs/guides/tasks--caching/terminal-ui)。它允许您启用或禁用 TUI 并配置其行为。

::: code-group

```json [nx.json]
{
  "tui": {
    // Enable the Nx TUI
    "enabled": true,
    // Automatically exit the TUI when completed
    // Use a number to specify the seconds to keep the TUI open for after completion
    "autoExit": true
  }
}
```

:::

## Conformance

`nx.json` 中的符合性（`conformance`）属性用于配置 [Nx 符合性](https://nx.dev/docs/enterprise/conformance)的使用方式。

::: code-group

```json [nx.json]
{
  "conformance": {
    "outputPath": "dist/conformance-result.json",
    "rules": [
      {
        "rule": "@nx/conformance/enforce-module-boundaries",
        "status": "evaluated",
        "explanation": "This rule ensures proper module boundaries are maintained across the workspace",
      },
      {
        "rule": "./tools/local-conformance-rules/check-project.ts",
        "projects": ["*"],
        "options": {
          "strictMode": true,
        },
      },
      {
        "rule": "nx-cloud://my-custom-rule",
        "projects": [
          "frontend-*",
          {
            "matcher": "backend-legacy",
            "explanation": "Legacy backend project is exempt until migration is complete",
          },
        ],
        "status": "enforced",
      },
    ],
  },
}
```

:::

### 配置选项

| 属性 | 类型 | 说明 |
| :-- | :-- | :-- |
| `outputPath` | `string \| false` | 可选路径，用于写入符合性测试结果。默认值为`"dist/conformance-result.json"`。设置为 `false` 可禁用向文件写入结果的功能。 |
| `rules` | `Array<RuleConfig>` | 适用于您工作区的合规规则列表。 |

### 规则配置

规则数组中的每条规则可具有以下属性：

| 属性 | 类型 | 必填 | 说明 |
| :-- | :-- | :-- | :-- |
| `rule` | `string` | Yes | 本地规则实现的相对路径、node_module路径，或Nx Cloud Enterprise的nx-cloud规则ID（例如 `"nx-cloud://my-rule"`）。 |
| `options` | `Record<string, unknown>` | No | 规则特定的配置选项。可用选项取决于所使用的具体规则。 |
| `projects` | `Array<string \| { matcher: string; explanation: string }>` | No | 需应用该规则的项目。详见下文[项目](#项目conformance)部分。 |
| `explanation` | `string` | No | 可选说明，用于向同事解释为何启用此规则以及其对工作区的重要性。 |
| `status` | `"enforced" \| "evaluated" \| "disabled"` | No | 覆盖规则的默认状态（默认为"强制执行（`enforced`）"）。若设置为"评估（`evaluated`）"，则违规情况会被报告但不会导致失败。若设置为"禁用（`disabled`）"，则完全不评估该规则。 |

### 项目conformance

若需限制符合性规则的适用范围，可使用 `projects` 属性。该属性接受字符串数组，内容可包含项目名称、通配符模式、目录路径、标签引用，或任何符合 `--projects` 过滤器规范的值（该过滤器亦适用于 `nx run` 等其他命令）。

默认情况下，该属性默认值为 `["*"]`（所有项目）。

您还可使用包含匹配器（`matcher`）和说明（`explanation`）属性的对象，来记录特定项目被包含或排除在规则之外的原因。

```json
{
  "rule": "my-rule",
  // Here we are configuring the rule to apply to all frontend projects
  // except the one called "frontend-legacy"
  "projects": ["frontend-*", "!frontend-legacy"],
}
```

```json
{
  "rule": "my-rule",
  "projects": [
    "frontend-*",
    {
      "matcher": "!frontend-legacy",
      "explanation": "Exempt until migration to new architecture is complete",
    },
  ],
}
```

### 规则状态值

- 强制执行 `enforced`（默认）：规则违反将导致符合性检查失败（退出代码 `1`）

- 评估模式 `evaluated`：规则违反会被报告但不导致失败（退出代码 `0`）

- 禁用`disabled`：规则完全不被评估

## 案例

基于xx框架，xx插件

## 参考

[Nx Configuration](https://nx.dev/docs/reference/nx-json)