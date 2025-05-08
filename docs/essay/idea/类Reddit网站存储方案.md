---
lang: zh-CN
title: Idea
titleTemplate: 类Reddit 网站存储方案
description: 类Reddit 网站存储方案
head:
  - - meta
    - name: description
      content: hello
  - - meta
    - name: keywords
      content: 类Reddit 网站存储方案
layout: doc
navbar: true
sidebar: true
aside: true
outline: deep
lastUpdated: Date
footer: true
---
# 类Reddit 网站存储方案

针对类似 Reddit 的高并发、分布式、内容多样化的社交平台，存储方案需兼顾 **多业务模型的扩展性、实时交互性能与全局一致性**。以下是按业务模块分层存储的策略，并结合实际技术选型说明：

---

### **1. 用户系统（Profile & Authentication）**
**业务核心**：用户注册、登录、个人资料管理
**数据模型**：Key-Value + Relationship
**存储方案**：
- **主数据库**：
  ```sql
  CREATE TABLE users (
      user_id        SERIAL PRIMARY KEY,
      username       VARCHAR(128) UNIQUE,
      email          VARCHAR(255) UNIQUE,
      password_hash  TEXT NOT NULL,  -- 哈希+salt加密存储
      birthday       DATE,
      created_at     TIMESTAMP DEFAULT NOW(),
      last_login     TIMESTAMP
  );
  ```
  使用 PostgreSQL（保证 ACID）或 MySQL + Vitess（分布式）。

- **注意**：
  - 用户会话用 Redis 存储，加速登录/登出
  - 敏感信息（如邮箱）可采用 **透明加密** 或 **混淆存储**
  - 用户黑名单或特别设置（如屏蔽标签）采用 Redis 集合结构存储

---

### **2. 帖子系统（Posts & Comments）**
**业务核心**：内容发布、嵌套评论、树状结构
**数据模型**：层次化（树状）+ 时序数据
**存储方案**：

#### 2.1 关系型存储（结构化部分）
```sql
-- 帖子存储
CREATE TABLE posts (
    post_id        SERIAL PRIMARY KEY,
    user_id        INTEGER,
    subreddit_id   INTEGER,
    post_type      VARCHAR(20),   -- image/link/text/poll
    title          VARCHAR(300),
    content        TEXT,
    url            TEXT,          -- 用于 link post
    vote_score     INTEGER DEFAULT 0,  -- 缓存近期分数
    comments_count INTEGER DEFAULT 0,
    created_at     TIMESTAMP DEFAULT NOW(),
    pinned         BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id)    REFERENCES users(user_id),
    FOREIGN KEY (subreddit_id) REFERENCES subreddits(subreddit_id)
);

-- 评论系统（支持嵌套）
CREATE TABLE comments (
    comment_id     SERIAL PRIMARY KEY,
    post_id        INTEGER,
    parent_id      INTEGER,       -- 自外键，-1 表示顶级评论
    user_id        INTEGER,
    content        TEXT,
    vote_score     INTEGER DEFAULT 0,
    depth          HSTORE,        -- 记录层级路径（如 tree:level）
    is_deleted     BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (post_id) REFERENCES posts(post_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 帖子-社区关联（多对多，应对推荐设计）
CREATE TABLE post_subreddit_relations (
    post_id       INTEGER,
    subreddit_id  INTEGER,
    PRIMARY KEY (post_id, subreddit_id)
);
```

#### 2.2 优化方案：
- **分库分表**：
  - 按 `subreddit_id` 水平分库（如每个子社区一个数据库）
  - 或使用 **按时间分区**（如每个月一个分区），以加速查询热帖排行
- **树结构扩展**：
  评论深度超限时（如超过 5 层），可拆分第二个表 `deep_comments` 存储深层评论，与表 `comments` 分离查询路径
- **CLOB优化**：
  对 `content` 长文本采用压缩编码（如 GZIP）减少 I/O

---

### **3. 投票系统（Votes & Reputation）**
**业务核心**：用户对帖子/评论的上/下票、排行榜
**数据模型**：高频写操作、快速聚合
**存储方案**：

#### 3.1 NoSQL 选型建议（Cassandra/DynamoDB）
```sql
-- Cassandra 建模（用户单点写压力高场景）
CREATE TABLE votes (
    vote_id UUID PRIMARY KEY,
    object_type TEXT, -- 'post'/'comment'
    object_id INT,
    user_id INT,
    vote_type INT, -- 1 = upvote, -1 = downvote
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- 按 object_id 构建聚合表
CREATE MATERIALIZED VIEW vote_summary AS
    SELECT object_id, SUM(vote_type) as total_score
    FROM votes
    GROUP BY object_id;
```

#### 3.2 若保留关系型存储：
- 对 `vote_score` 字段使用 **单独的投票表（post_votes/comment_votes）**
- 为帖子实时展示分数，通过 `Redis` 缓存热点数据：
  ```bash
  MemoryDB kv:post:123:score -> 2189
  ```

#### 3.3 一致性保障：
- 使用 Kafka 或 Debezium 将 Cassandra 主动更新同步回关系数据库，保证排名数据一致性
- 采用 Leslie Lamport 的 **逻辑时钟（Logical Clock）** 解决跨数据库时间戳一致性问题

---

### **4. 子社区系统（Subreddits & Following）**
**业务核心**：管理 subreddit、用户订阅关系
**数据模型**：巨大 node 上的多对多关系
**存储方案**：

#### 4.1 关系数据库管理主数据
```sql
CREATE TABLE subreddits (
    subreddit_id SERIAL PRIMARY KEY,
    name         VARCHAR(100) UNIQUE,
    created_at   TIMESTAMP DEFAULT NOW(),
    description  TEXT
);

-- 用户订阅 subreddit（关系型）
CREATE TABLE user_subscriptions (
    user_id      INTEGER,
    subreddit_id INTEGER,
    PRIMARY KEY (user_id, subreddit_id)
);
```

#### 4.2 高频订阅操作可使用 Redis 集合（Set）：
```bash
Set key: user:123:subreddits -> {1, 12, 34}
```

#### 4.3 缓存热度社区：
- 使用 Redis 持有近期 24H 内热度最高的 subreddit 列表

---

### **5. 消息与通知系统**
**业务核心**：私信、系统通知（如帖子回复、点赞提醒）
**数据模型**：轻量级消息 + 配套事件推送
**存储方案**：

#### 5.1 微服务风格架构 + 多种存储组合
| 消息类 | 存储系统 | 用例 |
|-------|---------|-----|
| 私信     | PostgreSQL + 全文索引 | 基于房间（如 user:room=123:456）分库、可搜索历史会话 |
| 通知     | MongoDB | 结构灵活、适合嵌套推送时间条及状态   |
| 事件日志 | Apache Kafka + Hive | 长期留存（385TB 写入容量/天）|

#### 5.2 MongoDB 示例结构：
```json
{
    "notification_id": "abc123",
    "user_id": "7890",
    "source": "YOUR_POST_COMMENTED",
    "target_id": "post12345",
    "context": {
        "comment_id": "1245", ...
    },
    "is_read": false
}
```

---

### **6. 媒体存储与静态内容**
**业务核心**：图片、视频等资源高效分发
**存储方案**：

| 类型  | 推荐技术        | 说明                          |
|-------|-----------------|------------------------------|
| 图文上传 | AWS S3 + CloudFront | 默认使用压缩算法，如 webp/jpg |
| 音视频 | Google Cloud Storage + CDN | 使用 HLS（Http Live Streaming）分发大文件 |
| 缩略图 | Redis-LFS        | 缓存高频访问，降低 IO 压力    |

#### 图像压缩策略：
- 原始图 → S3
- 压缩图（webp/jpg） → Redis key-chain 缓存生成
```bash
S3 path: s3.amazonaws.com/reddit/${post_id}-${timestamp}-${mediaid}.jpg

Redis key: media:${post_id}:${size_ratio} -> <Compressed Thumbnail Bytes>
```

---

### **7. 全文检索系统**
**业务核心**：用户搜索帖子、热门内容匹配
**存储方案**：

#### Cinder 存储架构（Reddit 实际采用过）
- 将帖子 `title` 和 `content` 异步写入 Elasticsearch
- 分词策略：
  ```json
  {
    "analysis": {
      "analyzer": {
        "custom_reddit": {
        "type": "custom",
        "char_filter": [ "html_strip" ],
        "tokenizer": "standard",
        "filter": [ "lowercase", "asciifolding" ]
       }
    }
  }
  ```
- 查询优化：
  ```json
  POST /posts/_search
  {
    "query": {
      "match": { 
        "title": "性能优化",
        "analyzer": "custom_reddit"
      }
    }
  }
  ```

#### 搜索性能建议：
- 搜索索引与主库分离，避免 I/O 冲突
- 使用 _感知模型识别敏感内容，在索引前过滤

---

### **8. 时序型业务如“用户行为分析”**
**业务核心**：记录点击、页面停留时间、内容推送链等
**推荐存储**：
- **InfluxDB**（TSDB）
  ```sql
  CREATE DATABASE analytics;

  INSERT INTO analytics.activity 
  (user_id, post_id, event_type, timestamp)
  VALUES (1029, 4213, "click", now());
  ```

- 若以摊销处理：
  - HDFS + Hive（数据仓库）
  - Apache Hudi（增量处理，Deltastream）

---

### **九、数据一致性保障**
1. **ACID 与 BASE 的结合使用**：
   - 核心操作（注册、投票计数）使用 PostgreSQL 保障 SQL 强一致性
   - 状态性操作（如 flag 用户/帖子 inactivity 标志）使用 Cassandra eventual consistency

2. **全球分布场景下的 CAP 权衡**：
   - 使用 CRDT（Conflict-free Replicated Data Type）处理并发 upvotes
   - 若选 Paxos 一致性建议 ZooKeeper 管理副本

3. **防止数据腐条化（Data Aging）**：
   - 使用物化视图或定期任务维护冗余字段（如 vote_score）
   - 通过 ProxySQL 实现读写代理，确保线性一致性偏移

---

### 🔍 **推荐架构图（分层存储）**

```plaintext
+-----------------+   +-----------------+   +------------------+
|    Redis       |<->| PostgreSQL主库  |<=>| Kafka CDC +        |
| (缓存+临时JSON)|   | (用户帖子管 理) |    | Elasticsearch      |
+-----------------+   | subreddits等逻辑 |   +------------------+
                     | ... 划分完成    |
                     +-----------------+
                         | (主)
                         v
                  +-----------------------+
                  | 分布式 NoSQL（如Cassandra）|
                  | 处理 vote, session,   |
                  | 通知数据一致性       |
                  +-----------------------+
                        /        \
                       v          v
               +-----------------+------------------------------+
               |                时序中心（InfluxDB、时间拉链Hive）|
               +-------------------------------------------------+
                                 |
                           +--------------------+
                           |  媒介存储（S3或云） |
                           +--------------------+
```

通过优化数据路由与分布，该方案容错、轻扩展，适应 Reddit 级别并发需求。是否需要更详细垂直拆解或某业务模块的高并发写入细节？