# nfxvault 数据库（PostgreSQL）

结构与 **Pqttec-Backend** 的 `databases/` 对齐：Atlas 管理 schema 与迁移，模板生成 Go 模型等。

## Schema 概览

| Schema    | 说明 |
| --------- | ---- |
| `auth`    | 从 Pqttec 复制：Users、Roles、UserAvatars、InviteCodes 及视图 |
| `asset`   | 二进制元数据：`Images` / `Files` / `Videos` 及各自活跃视图 |
| `content` | 见下表：4 张主体 + **`Timelines`（时间本体）** + 4 张 `xxxx_images` + 4 张 `xxxx_times`（与 asset **同构**：必填 `timeline_id` → `Timelines`）+ `Milestones` |

### `content` 表清单（共 14 张表）

**主体（4）**

| 表名 |
|------|
| `Projects` |
| `Articles` |
| `Lifes` |
| `Achievements` |

**时间本体（1）— 类比 `asset.Images` 存栅格元数据，`Timelines` 存一条时间点的 `occurred_at` / `label` / `body` 等**

| 表名 |
|------|
| `Timelines` |

**图片关联 `xxxx_images`（4），字段形态对齐 Pqttec `ArticleImages`：`parent_id` + `image_id`（必填）+ `sort_order`**

| 表名 |
|------|
| `ProjectImages` |
| `ArticleImages` |
| `LifeImages` |
| `AchievementImages` |

**时间关联 `xxxx_times`（4）— 与 `xxxx_images` 同一套 junction 形状：`parent_id` + **`timeline_id`（必填，FK → `Timelines`）** + `sort_order`；不在 junction 上重复存 `occurred_at`**

| 表名 |
|------|
| `ProjectTimes` |
| `ArticleTimes` |
| `LifeTimes` |
| `AchievementTimes` |

**其它（1）**

| 表名 |
|------|
| `Milestones`（`milestone_parent_type` 枚举 + 可选 `reference_id`） |

### `content` 通用约定

- **`visibility`**：`BOOLEAN NOT NULL DEFAULT TRUE`，每张 `content` 表都有，用于前台是否展示；**不做软删除**，已去掉全部 **`deleted_at`**。
- **删除 `Timelines`**：`ProjectTimes` / `ArticleTimes` / `LifeTimes` / `AchievementTimes` 上均为 **`timeline_id` … `ON DELETE CASCADE`**，删一条时间本体会自动删掉所有指向它的 junction 行。

### `content.milestone_parent_type`

对应你说的 **Project / Article / Lifes / Achievement / Other**，库中为枚举小写：`project` | `article` | `lifes` | `achievement` | `other`（`lifes` 对应表 `Lifes`）。  
`reference_id`：可指向上述四类里某一行的 `id`，也可为空（例如 `other`）；不做跨表多态外键，由应用校验。

## 搜索读模型支撑列与表（search read-model）

OpenSearch 是从 PG 派生、可重建的搜索读模型（详见 `infrastructure/dev/README.md`）。DB 侧提供两类支撑物：

- **`search_version BIGINT NOT NULL DEFAULT 0`**：加在 `auth."UserProfiles"` 与 8 张 `content` 事件表（`ActivityEvents` … `TrafficEvents`）。每次可搜索变更在同一事务内自增，作为 OpenSearch 的 `version_type=external` 外部版本，拒绝乱序/过期写入。
- **`SearchOutbox`（事务性发件箱）**：`auth` 与 `content` 各一张，镜像 `communication.realtime_outbox` 形态（`aggregate_type` / `aggregate_id` / `op`(upsert·delete) / `aggregate_version` / `status` / `attempts` / `next_attempt_at` / 时间戳 + pending 部分索引）。状态枚举为 per-schema 的 `search_outbox_status`。写路径在事务内插入一行，relay 轮询后投递到 Kafka。

改这些请改 `databases/src/**` 源 SQL 后跑 Atlas pipeline 重新生成模型（勿手改 `*_dbgen.go`）。

## 目录结构

```
databases/
├── atlas.hcl
├── README.md
├── src/
│   ├── main.sql
│   ├── extensions/
│   └── schemas/
│       ├── auth/
│       ├── asset/
│       └── content/
├── templates/
├── scripts/
└── migrations/
    ├── development/   # atlas env "dev"
    └── secure/        # atlas env "secure"
```

## 环境变量

`run_atlas_pipeline.sh` 需要：`POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_HOST` / `POSTGRES_PORT`、单一 `POSTGRES_DB`（按 `ENV` 取 `.env`→`nfxvault_dev` 或 `.secure.env`→`nfxvault_secure`）、`POSTGRES_DB_SHADOW`、`POSTGRES_SSLMODE`、`ATLAS_CONFIG_PATH`（例如 `file://databases/atlas.hcl`）。Taskfile 会从所选 env 文件桥接 `POSTGRESQL_*` → `POSTGRES_*`。

## 首次生成迁移

在配置好 Postgres 与 env 后：

```bash
cd nfxvault/databases
atlas migrate diff --env dev
atlas migrate apply --env dev
```

根目录 `run_atlas_pipeline.sh` 在接入 **Taskfile**（`task atlas:gen`）后即可跑通全流程；当前仓库若尚未添加 Task，可先只用 Atlas CLI 做 diff/apply。
