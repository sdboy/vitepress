---
lang: zh-CN
title: Docker
titleTemplate: Docker Compose 中使用环境变量替换键（Key）和值（Value）
description: Docker Compose 中使用环境变量替换键（Key）和值（Value）
head:
  - - meta
    - name: description
      content: Docker Compose 中使用环境变量替换键（Key）和值（Value）
  - - meta
    - name: keywords
      content: docker compose key value environment
layout: doc
navbar: true
sidebar: true
aside: true
outline: deep
lastUpdated: Date
footer: true
---
# Docker Compose 中使用环境变量替换键（Key）和值（Value）

这是一个非常关键的 Docker Compose 规则限制。

## 核心结论
**Docker Compose 不支持在 YAML 的“键（Key）”中使用变量替换 (`${VAR}`)，只支持在“值（Value）”中使用。**

*   **键 (Key)**：例如 `services` 下的服务名、`networks` 下的网络名、`volumes` 下的卷名。
*   **值 (Value)**：例如 `image`、`container_name`、`environment`、以及 `networks` 内部的 `name` 字段。

---

## 为什么第一种写法没问题？
```yaml
networks:
  network-production:  # ✅ 这是一个静态的字符串键 (Key)
    external: true
    name: ${NETWORK_NAME} # ✅ 这是一个值 (Value)，支持变量替换
```
*   **解析过程**：Docker Compose 读取 YAML 时，首先识别出有一个网络键叫 `network-production`。然后它解析该键下的内容，发现 `name` 字段的值是 `${NETWORK_NAME}`，于是去 `.env` 里查找并替换成实际名称（例如 `my-prod-net`）。
*   **结果**：内部 ID 是 `network-production`，实际 Docker 网络名是 `my-prod-net`。

### 为什么第二种写法报错？
```yaml
networks:
  network-${ENV}:      # ❌ 这是一个动态的键 (Key)，不支持变量替换
    external: true
    name: ${NETWORK_NAME}
```
*   **解析过程**：Docker Compose 解析 YAML 结构时，**不会**对冒号左边的键进行变量替换。它字面意义上寻找一个叫 `network-${ENV}` 的网络键。
*   **报错原因**：
    1.  Compose 无法识别 `network-${ENV}` 为有效的网络定义键。
    2.  当你的 `services` 部分尝试引用这个网络时（例如 `networks: - network-${ENV}`），Compose 发现找不到这个键定义的网络，因此报错 `refers to undefined network`。
    3.  即使没有服务引用，Compose 校验器也会因为键名包含非法字符或未解析变量而报错 `invalid compose project`。

---

## 解决方案

#### 方案 1：使用静态键 + 动态 `name`（推荐 ✅）
这是 Docker Compose 设计的标准用法。**内部键名保持固定，外部实际名称通过 `name` 字段动态化。**

```yaml
services:
  web:
    image: nginx
    networks:
      - app_net  # 引用固定的内部键名

networks:
  app_net:       # ✅ 键名固定，不要带变量
    external: true
    name: ${NETWORK_NAME} # ✅ 这里用变量决定实际的 Docker 网络名
```
*   **优点**：兼容性好，所有 Compose 版本都支持，结构清晰。
*   **效果**：无论 `ENV` 是什么，YAML 结构不变，只是连接的底层 Docker 网络名称变了。

### 方案 2：使用 `envsubst` 预处理（不推荐，除非必须）
如果你**极其特殊**的场景下，必须让键名本身也变化（例如为了生成完全不同的 YAML 结构），你需要先在 Shell 层替换变量，再传给 Docker。

```bash
# 1. 使用 envsubst 将 YAML 中的 ${VAR} 全部替换为实际值
envsubst < docker-compose.yml > docker-compose.resolved.yml

# 2. 使用生成的文件启动
docker compose -f docker-compose.resolved.yml up -d
```
*   **注意**：`envsubst` 会替换文件中**所有**的 `${VAR}`，包括那些你不想替换的地方（比如脚本里的变量），需要小心使用。
*   **缺点**：增加了部署步骤，调试困难，失去了 Compose 原生管理变量的能力。

---

## 总结：Docker Compose 变量替换规则表

| 位置 | 示例 | 支持 `${VAR}` 吗？ | 说明 |
| :--- | :--- | :---: | :--- |
| **顶级键名** | `services:` 下的 `web:` | ❌ **不支持** | 服务名必须固定 |
| **顶级键名** | `networks:` 下的 `mynet:` | ❌ **不支持** | 网络键名必须固定 |
| **顶级键名** | `volumes:` 下的 `data:` | ❌ **不支持** | 卷键名必须固定 |
| **属性值** | `image: ${IMG}` | ✅ **支持** | 镜像名可变 |
| **属性值** | `container_name: ${NAME}` | ✅ **支持** | 容器名可变 |
| **属性值** | `networks.name: ${NET}` | ✅ **支持** | **实际网络名可变** |
| **属性值** | `environment: - KEY=${VAL}` | ✅ **支持** | 环境变量值可变 |
| **列表项** | `networks: - ${NET}` | ⚠️ **部分支持** | 通常建议引用固定键名 |

## 建议
请坚持使用 **方案 1**。
将 `networks` 的键名视为**代码内部的逻辑 ID**（应该稳定不变），将 `name` 字段视为**基础设施的实际名称**（可以随环境变化）。这样你的 `docker-compose.yml` 可以在开发、测试、生产环境中复用，只需配合不同的 `.env` 文件即可。
