# 数据源管理

rho-aias 支持多种规则来源，包括威胁情报订阅、地域封禁数据库等，通过统一的接口管理所有数据源。

## 概述

```
┌─────────────────────────────────────────────────────────────┐
│                      数据源管理器                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ 威胁情报    │  │ 地域封禁    │  │ 手动规则    │         │
│  │  (Intel)    │  │  (Geo)      │  │  (Manual)   │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                 │
│         ▼                ▼                ▼                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Cron 调度器                       │   │
│  │         (定时更新 / 手动触发)                        │   │
│  └─────────────────────────────────────────────────────┘   │
│         │                │                │                 │
│         ▼                ▼                ▼                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  IPSum      │  │  MaxMind    │  │  本地缓存   │         │
│  │  Spamhaus   │  │  GeoIP DB   │  │  (持久化)   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   XDP eBPF Map  │
                    │   (规则写入)    │
                    └─────────────────┘
```

---

## 威胁情报

威胁情报源提供已知的恶意 IP/CIDR 列表，自动订阅更新。

### 配置

```yaml
intel:
  enabled: true
  auto_refresh_on_start: true    # 启动时自动刷新
  persistence_dir: ./data/intel  # 持久化目录
  batch_size: 1000               # 批量写入大小
  sources:
    ipsum:
      enabled: true
      periodic: true             # 周期性更新
      schedule: "0 1 * * *"      # 每天凌晨 1 点
      url: https://example.com/ipsum.txt
      format: ipsum
    spamhaus:
      enabled: true
      periodic: true
      schedule: "0 2 * * *"      # 每天凌晨 2 点
      url: https://www.spamhaus.org/drop/drop.txt
      format: spamhaus
```

### 支持的情报源

| 名称 | 格式 | 说明 | 规则数量 |
|------|------|------|---------|
| IPSum | `ipsum` | 聚合多个威胁情报源 | ~23 万条 |
| Spamhaus DROP | `spamhaus` | 垃圾邮件黑名单 | ~1500 条 |

### 数据格式

#### IPSum 格式

```
# 注释行
1.2.3.4  500
5.6.7.8  300
```

每行格式：`IP [置信度]`

#### Spamhaus DROP 格式

```
; 注释行
1.0.0.0/24 ; SBL12345
2.0.0.0/8 ; SBL67890
```

每行格式：`CIDR ; 备注`

### API 接口

#### 获取情报源状态

```bash
GET /api/intel/status
```

响应：

```json
{
  "enabled": true,
  "sources": {
    "ipsum": {
      "enabled": true,
      "rule_count": 230000,
      "last_update": "2026-03-28T01:00:00Z",
      "next_update": "2026-03-29T01:00:00Z",
      "status": "active"
    },
    "spamhaus": {
      "enabled": true,
      "rule_count": 1500,
      "last_update": "2026-03-28T02:00:00Z",
      "status": "active"
    }
  },
  "total_rules": 231500
}
```

#### 手动触发更新

```bash
POST /api/intel/update
```

---

## 地域封禁

基于 MaxMind GeoIP 数据库实现国家/地区级别的访问控制。

### 配置

```yaml
geo_blocking:
  enabled: true
  auto_refresh_on_start: true
  mode: whitelist              # whitelist 或 blacklist
  allowed_countries:
    - CN                       # 中国
    - US                       # 美国
  allow_private_networks: true # 允许私有网段
  persistence_dir: ./data/geo
  batch_size: 1000
  sources:
    maxmind:
      enabled: true
      periodic: true
      schedule: "0 3 * * *"    # 每天凌晨 3 点
      url: https://example.com/GeoLite2-Country.mmdb
      format: maxmind-db
```

### 工作模式

#### 白名单模式 (whitelist)

仅允许指定国家的流量：

```yaml
geo_blocking:
  mode: whitelist
  allowed_countries:
    - CN    # 仅允许中国
```

#### 黑名单模式 (blacklist)

封禁指定国家的流量：

```yaml
geo_blocking:
  mode: blacklist
  allowed_countries:   # 此处实际为封禁列表
    - KP    # 封禁朝鲜
    - IR    # 封禁伊朗
```

### 私有网络绕过

```yaml
geo_blocking:
  allow_private_networks: true
```

启用后，以下网段将绕过地域检查：

- `10.0.0.0/8`
- `172.16.0.0/12`
- `192.168.0.0/16`
- `127.0.0.0/8`
- `169.254.0.0/16`
- IPv6 私有地址

### API 接口

#### 获取地域封禁状态

```bash
GET /api/geoblocking/status
```

响应：

```json
{
  "enabled": true,
  "mode": "whitelist",
  "allowed_countries": ["CN", "US"],
  "allow_private_networks": true,
  "rule_count": 50000,
  "last_update": "2026-03-28T03:00:00Z",
  "source": {
    "name": "maxmind",
    "status": "active"
  }
}
```

#### 手动触发更新

```bash
POST /api/geoblocking/update
```

#### 更新配置

```bash
POST /api/geoblocking/config
```

请求体：

```json
{
  "mode": "whitelist",
  "allowed_countries": ["CN", "US", "JP"]
}
```

---

## 统一数据源 API

### 获取所有数据源状态

```bash
GET /api/sources/status
```

响应：

```json
{
  "sources": [
    {
      "type": "intel",
      "id": "ipsum",
      "enabled": true,
      "last_update": "2026-03-28T01:00:00Z",
      "rule_count": 230000,
      "status": "active"
    },
    {
      "type": "intel",
      "id": "spamhaus",
      "enabled": true,
      "last_update": "2026-03-28T02:00:00Z",
      "rule_count": 1500,
      "status": "active"
    },
    {
      "type": "geo",
      "id": "maxmind",
      "enabled": true,
      "last_update": "2026-03-28T03:00:00Z",
      "rule_count": 50000,
      "status": "active"
    }
  ]
}
```

### 获取指定类型数据源

```bash
GET /api/sources/:type/status
```

- `:type` = `intel` 或 `geo`

### 获取指定数据源

```bash
GET /api/sources/:type/:id/status
```

示例：

```bash
GET /api/sources/intel/ipsum/status
```

### 手动触发刷新

```bash
POST /api/sources/:type/:id/refresh
```

示例：

```bash
curl -X POST -H "Authorization: Bearer <token>" \
  http://localhost:8081/api/sources/intel/ipsum/refresh
```

---

## 持久化机制

### 离线启动支持

数据源支持本地持久化，实现离线启动：

```
首次启动 → 下载数据 → 写入 eBPF Map → 持久化到本地
    │
    ▼
下次启动 → 加载本地缓存 → 写入 eBPF Map → (可选) 后台更新
```

### 持久化目录结构

```
./data/
├── intel/
│   ├── ipsum.json        # IPSum 缓存
│   └── spamhaus.json     # Spamhaus 缓存
├── geo/
│   ├── maxmind.json      # GeoIP 规则缓存
│   └── GeoLite2-Country.mmdb  # MMDB 文件
└── manual/
    ├── rules.json        # 黑名单规则
    └── whitelist.json    # 白名单规则
```

---

## 规则来源位掩码

多源规则通过位掩码实现聚合管理：

| 来源 | 位掩码 | 十六进制 |
|------|--------|---------|
| 手动规则 | `00001` | `0x01` |
| 威胁情报 | `00010` | `0x02` |
| 地域封禁 | `00100` | `0x04` |
| WAF 联动 | `01000` | `0x08` |
| 异常检测 | `10000` | `0x10` |

### 聚合示例

某 IP 同时被威胁情报和 WAF 封禁：

```
source_mask = 0x02 | 0x08 = 0x0A (二进制 01010)
```

### 解除封禁逻辑

```
删除来源 A → 移除位掩码 A → 检查是否为 0
                    │
                    ├─ 为 0 → 完全删除规则
                    │
                    └─ 不为 0 → 保留规则（其他来源仍有效）
```

---

## 最佳实践

### 1. 更新时间错开

避免多个数据源同时更新：

```yaml
intel:
  sources:
    ipsum:
      schedule: "0 1 * * *"    # 凌晨 1 点
    spamhaus:
      schedule: "0 2 * * *"    # 凌晨 2 点

geo_blocking:
  sources:
    maxmind:
      schedule: "0 3 * * *"    # 凌晨 3 点
```

### 2. 离线环境部署

在内网环境部署时，可将数据文件托管到内部服务器：

```yaml
intel:
  sources:
    ipsum:
      url: http://internal-server/ipsum.txt
```

### 3. 监控数据源状态

定期检查更新状态和规则数量：

```bash
# 定时任务检查
curl -s http://localhost:8081/api/sources/status | jq '.sources[] | select(.status != "active")'
```

### 4. 测试新数据源

添加新数据源前建议：

1. 先在测试环境验证格式兼容性
2. 检查规则数量是否合理
3. 观察对性能的影响

### 5. 数据源优先级

规则生效优先级（从高到低）：

1. **白名单** - 最高优先级，直接放行
2. **黑名单** - 各种来源的封禁规则
3. **地域封禁** - 国家级别过滤
4. **默认放行** - 未匹配任何规则
