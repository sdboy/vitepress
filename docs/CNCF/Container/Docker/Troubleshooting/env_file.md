---
lang: zh-CN
title: Docker
titleTemplate: --env-file 和 env_file 的区别
description: --env-file 和 env_file 的区别
head:
  - - meta
    - name: description
      content: --env-file 和 env_file 的区别
  - - meta
    - name: keywords
      content: --env-file env_file docker compose .env
layout: doc
navbar: true
sidebar: true
aside: true
outline: deep
lastUpdated: Date
footer: true
---
# `--env-file` 和 `env_file` 的区别

这是关于 Docker Compose 中 **`--env-file` (CLI 参数)** 和 **`env_file` (YAML 配置)** 的深度对比总结。理解它们的区别是解决环境变量问题的关键。

## 1. 核心区别一览表

| 特性 | `--env-file` (CLI 参数) | `env_file` (YAML 配置) |
| :--- | :--- | :--- |
| **全称** | `docker compose --env-file <path>` | `services.service_name.env_file` |
| **执行阶段** | **解析阶段 (Parse Time)** <br>在 Docker Compose 读取 yml 之前 | **运行阶段 (Runtime)** <br>在 Docker 创建容器时 |
| **执行者** | Docker Compose **客户端 (CLI)** | Docker **引擎 (Engine)** |
| **主要用途** | **替换 YAML 中的变量** <br>例如：`${PROJECT_HOME}`, `${TAG}` | **注入容器内部环境变量** <br>例如：程序读取的 `DB_PASSWORD` |
| **作用范围** | **全局** <br>影响整个 Compose 项目的所有服务 | **局部** <br>默认仅影响当前服务 (V2.20+ 支持全局) |
| **默认行为** | **自动加载 `.env`** <br>如果不指定，CLI 默认只读 `.env` | **无默认** <br>必须显式在 yml 中写出文件名 |
| **文件位置** | 相对于 **运行命令的目录** | 相对于 **docker-compose.yml 所在目录** |

---

## 2. 生效时间与流程图解

为了更直观，我们可以把 `docker compose up` 的过程分为两步：

```mermaid
graph TD
    A[开始执行 docker compose up] --> B{阶段一：CLI 解析}
    B -->|读取 --env-file 或 .env | C[替换 docker-compose.yml 中的 ${VAR}]
    C --> D{阶段二：创建容器}
    D -->|读取 YAML 中的 env_file | E[将变量注入容器内部 ENV]
    E --> F[容器启动，应用程序运行]
```

*   **`--env-file`** 作用于 **阶段一**。如果这一步没读到变量，YAML 里的 `${VAR}` 就会保持原样（导致路径错误或报错）。
*   **`env_file`** 作用于 **阶段二**。如果这一步没配置，容器内部就读取不到变量（导致程序报错）。

---

## 3. 优先级规则 (Priority)

这是最容易混淆的地方，分为 **变量替换优先级** 和 **容器环境变量优先级**。

### A. YAML 变量替换优先级 (`${VAR}`)
当 Docker Compose 尝试替换 `docker-compose.yml` 中的 `${VAR}` 时，优先级如下：

1.  **当前 Shell 环境变量** (最高优先级)
    *   例如：你在终端执行了 `export PROJECT_HOME=/tmp`
2.  **`--env-file` 指定的文件**
    *   例如：`docker compose --env-file .env.prod ...`
3.  **默认的 `.env` 文件**
    *   仅当未指定 `--env-file` 时，CLI 才会自动找 `.env`
4.  **YAML 中的默认值**
    *   例如：`${PROJECT_HOME:-/default/path}`

> **结论**：如果你想用 `.env.prod` 替换 YAML 变量，必须用 `--env-file .env.prod` 或者导出到 Shell，**光在 YAML 里写 `env_file` 是没用的**。

### B. 容器内部环境变量优先级 (Container ENV)
当容器启动，程序读取 `os.getenv()` 时，优先级如下：

1.  **`docker compose run -e`** (命令行临时覆盖)
2.  **YAML 中的 `environment` 字段**
    *   例如：`environment: - DB_PASS=123`
3.  **YAML 中的 `env_file` 字段**
    *   例如：`env_file: - .env.prod` (后加载的覆盖先加载的)
4.  **Dockerfile 中的 `ENV` 指令** (最低优先级)

> **结论**：`env_file` 的优先级低于 `environment`。如果你同时在两者里定义了同一个变量，`environment` 胜出。

---

## 4. 常见场景与最佳实践

### 场景 1：多环境部署 (开发/测试/生产)
**目标**：同一套 `docker-compose.yml`，通过不同文件控制路径和密码。

*   **做法**：
    1.  准备 `.env.dev` 和 `.env.prod`。
    2.  YAML 中变量使用 `${VAR}` 语法。
    3.  YAML 中 `env_file` 也使用变量引用（高级用法）或固定指向。
    4.  **启动命令区分**：
        ```bash
        # 开发环境
        docker compose --env-file .env.dev up -d
        
        # 生产环境
        docker compose --env-file .env.prod up -d
        ```

### 场景 2：敏感信息隔离
**目标**：`.env` 文件提交到 git，但密码不提交。

*   **做法**：
    1.  `.env` 存放非敏感配置（如 `PROJECT_HOME`），提交到 git。
    2.  `.env.secret` 存放密码，加入 `.gitignore`。
    3.  YAML 中：
        ```yaml
        services:
          db:
            environment:
              - DB_PASSWORD=${DB_PASSWORD} # 从 CLI 解析阶段获取
            # 或者
            env_file:
              - .env.secret # 从运行阶段获取
        ```
    4.  启动时：`docker compose --env-file .env.secret up -d`

### 场景 3：默认值兜底
**目标**：如果没有配置文件，也能启动。

*   **做法**：在 YAML 中使用默认值语法。
    ```yaml
    volumes:
      - ${PROJECT_HOME:-/var/www/html}:/app
    ```
    如果 `.env` 或 `--env-file` 里没定义 `PROJECT_HOME`，则使用 `/var/www/html`。

---

## 5. 避坑指南 (Checklist)

1.  **文件名陷阱**：
    *   ❌ 以为 `env_file: .env.prod` 能让 YAML 里的 `${VAR}` 生效。
    *   ✅ 必须用 `--env-file .env.prod` 才能让 YAML 里的 `${VAR}` 生效。
2.  **路径陷阱**：
    *   `--env-file` 路径相对于 **当前终端所在目录**。
    *   `env_file` (YAML) 路径相对于 **docker-compose.yml 所在目录**。
3.  **格式陷阱**：
    *   环境变量文件里**不要**写 `export`。
    *   **不要** 在等号周围加空格 (`KEY=VALUE` 对，`KEY = VALUE` 错)。
    *   值如果包含特殊字符，建议加引号 (`KEY="VALUE"`).
4.  **缓存陷阱**：
    *   修改了 `.env` 文件后，`docker compose up` 不会自动重载配置。
    *   ✅ 建议先运行 `docker compose config` 确认变量已替换，再 `up -d`。
    *   ✅ 如果容器已存在，可能需要 `docker compose down` 再 `up` 才能生效某些配置。

## 一句话总结
*   **`--env-file`** 是给 **Docker Compose 工具** 看的，用来**生成**最终的配置文件（替换 `${}`）。
*   **`env_file`** 是给 **容器里的程序** 看的，用来**运行**时读取配置。
*   **`.env`** 是唯一一个不用写参数就能被 **Docker Compose 工具** 自动识别的文件。