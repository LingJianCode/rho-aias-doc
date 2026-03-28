# 配置说明

rho-aias 的所有配置通过 YAML 文件管理，默认配置文件为 `config.yml`。

## 完整配置示例

```yaml
server:
  port: 8081                    # API 服务端口

# 日志配置
log:
  level: info                   # 日志级别: debug/info/warn/error
  format: console               # 输出格式: console/json
  output_dir: ./logs            # 日志目录
  max_age_days: 30              # 日志保留天数
  rotation_hours: 1             # 按小时分割

# eBPF/XDP 配置
ebpf:
  interface_name: ens33         # 绑定的网卡名称

# 威胁情报配置
intel:
  enabled: false
  auto_refresh_on_start: true   # 启动时自动刷新
  persistence_dir: ./data/intel
  batch_size: 1000
  sources:
    ipsum:
      enabled: true
      periodic: true            # 是否开启周期性更新
      schedule: "0 1 * * *"     # 每天凌晨 1 点更新
      url: http://localhost/ipsum.txt
      format: ipsum
    spamhaus:
      enabled: true
      periodic: true
      schedule: "0 2 * * *"     # 每天凌晨 2 点更新
      url: http://localhost/drop.txt
      format: spamhaus

# 地域封禁配置
geo_blocking:
  enabled: false
  auto_refresh_on_start: true
  mode: whitelist               # whitelist 或 blacklist
  allowed_countries:
    - CN                        # 中国
  allow_private_networks: true  # 允许私有网段绕过地域检查
  persistence_dir: ./data/geo
  batch_size: 1000
  sources:
    maxmind:
      enabled: true
      periodic: true
      schedule: "0 3 * * *"     # 每天凌晨 3 点更新
      url: http://localhost/GeoLite2-Country.mmdb
      format: maxmind-db

# 手动规则持久化
manual:
  enabled: true
  persistence_dir: ./data/manual
  auto_load: true               # 启动时自动加载

# 认证配置
auth:
  enabled: false
  jwt_secret: ""                # 建议从环境变量 JWT_SECRET 读取
  jwt_issuer: "rho-aias"
  token_duration: 1440          # Token 有效期（分钟），默认 24 小时
  database_path: "./data/auth.db"
  captcha_enabled: true
  captcha_duration: 5           # 验证码有效期（分钟）
  api_keys: []                  # 预定义 API Key

# 阻断日志配置
blocklog:
  enabled: true
  log_dir: "./logs/blocklog"
  memory_cache_size: 10000      # 内存缓存大小
  buffer_size: 1000             # 异步写入缓冲区
  flush_interval: 5             # 刷盘间隔（秒）

# WAF 联动配置
waf:
  enabled: true
  waf_log_path: /caddy-logs/waf_audit.log
  rate_limit_log_path: /caddy-logs/rate_limit.log
  ban_duration: 3600            # 封禁时长（秒）

# 异常检测配置
anomaly_detection:
  enabled: true
  sample_rate: 1                # 采样率（1 表示 100%）
  check_interval: 1             # 检测间隔（秒）
  min_packets: 50               # 最小包数
  cleanup_interval: 300         # 清理间隔（秒）
  block_duration: 60            # 临时封禁时长（秒）
  ports:                        # 检测端口（为空则全部）
    - 80
    - 443
    - 8080
    - 53
  baseline:
    min_sample_count: 10
    sigma_multiplier: 3.0
    min_threshold: 100
    max_age: 1800
  attacks:
    syn_flood:
      enabled: true
      ratio_threshold: 0.5      # SYN 包占比阈值
      min_packets: 100
      block_duration: 60
    udp_flood:
      enabled: true
      ratio_threshold: 0.8
      min_packets: 100
      block_duration: 60
    icmp_flood:
      enabled: true
      ratio_threshold: 0.5
      min_packets: 100
      block_duration: 60
    ack_flood:
      enabled: true
      ratio_threshold: 0.8
      min_packets: 100
      block_duration: 60
```

---

## 配置模块详解

### 服务配置 (server)

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `port` | int | 8081 | API 服务监听端口 |

### 日志配置 (log)

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `level` | string | info | 日志级别：debug/info/warn/error |
| `format` | string | console | 输出格式：console/json |
| `output_dir` | string | ./logs | 日志文件目录 |
| `max_age_days` | int | 30 | 日志保留天数 |
| `rotation_hours` | int | 1 | 日志分割周期（小时） |

### eBPF 配置 (ebpf)

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `interface_name` | string | - | XDP 绑定的网卡名称（必填） |

### 威胁情报配置 (intel)

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | bool | false | 是否启用威胁情报 |
| `auto_refresh_on_start` | bool | true | 启动时自动刷新 |
| `persistence_dir` | string | ./data/intel | 持久化目录 |
| `batch_size` | int | 1000 | 批量更新大小 |

#### 情报源配置 (intel.sources)

每个情报源支持以下参数：

| 参数 | 类型 | 说明 |
|------|------|------|
| `enabled` | bool | 是否启用此情报源 |
| `periodic` | bool | 是否启用周期性更新（默认 true） |
| `schedule` | string | Cron 表达式，如 `0 1 * * *` 表示每天凌晨 1 点 |
| `url` | string | 数据源 URL |
| `format` | string | 格式类型：`ipsum`、`spamhaus` |

### 地域封禁配置 (geo_blocking)

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | bool | false | 是否启用地域封禁 |
| `auto_refresh_on_start` | bool | true | 启动时自动刷新 |
| `mode` | string | whitelist | 模式：`whitelist`（白名单）或 `blacklist`（黑名单） |
| `allowed_countries` | []string | - | 允许/封禁的国家代码列表（ISO 3166-1 alpha-2） |
| `allow_private_networks` | bool | true | 允许私有网段绕过地域检查 |
| `persistence_dir` | string | ./data/geo | 持久化目录 |
| `batch_size` | int | 1000 | 批量更新大小 |

#### GeoIP 数据源配置 (geo_blocking.sources)

| 参数 | 类型 | 说明 |
|------|------|------|
| `enabled` | bool | 是否启用 |
| `periodic` | bool | 是否周期性更新 |
| `schedule` | string | Cron 表达式 |
| `url` | string | MMDB 文件 URL |
| `format` | string | 格式：`maxmind-db` |

### 手动规则配置 (manual)

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | bool | true | 是否启用手动规则持久化 |
| `persistence_dir` | string | ./data/manual | 持久化目录 |
| `auto_load` | bool | true | 启动时自动加载已保存的规则 |

### 认证配置 (auth)

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | bool | false | 是否启用认证 |
| `jwt_secret` | string | - | JWT 密钥（建议从环境变量 `JWT_SECRET` 读取） |
| `jwt_issuer` | string | rho-aias | JWT 签发者 |
| `token_duration` | int | 1440 | Token 有效期（分钟） |
| `database_path` | string | ./data/auth.db | SQLite 数据库路径 |
| `captcha_enabled` | bool | true | 是否启用验证码 |
| `captcha_duration` | int | 5 | 验证码有效期（分钟） |
| `api_keys` | []APIKeyConfig | - | 预定义的 API Key 列表 |

#### API Key 配置

```yaml
auth:
  api_keys:
    - name: "Master Admin Key"
      key: "${MASTER_API_KEY}"    # 支持环境变量
      permissions: ["*"]          # 全部权限
    - name: "Read-only Key"
      key: "sk_live_your-key"
      permissions:
        - "firewall:read"
        - "intel:read"
        - "geo:read"
        - "blocklog:read"
```

### 阻断日志配置 (blocklog)

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | bool | true | 是否启用文件持久化 |
| `log_dir` | string | ./logs/blocklog | 日志目录 |
| `memory_cache_size` | int | 10000 | 内存缓存大小（用于实时查询） |
| `buffer_size` | int | 1000 | 异步写入缓冲区大小 |
| `flush_interval` | int | 5 | 刷盘间隔（秒） |

### WAF 联动配置 (waf)

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | bool | false | 是否启用 WAF 日志监控 |
| `waf_log_path` | string | /logs/waf_audit.log | WAF 审计日志路径 |
| `rate_limit_log_path` | string | /logs/rate_limit.log | Rate Limit 日志路径 |
| `ban_duration` | int | 3600 | 封禁时长（秒） |

### 异常检测配置 (anomaly_detection)

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | bool | false | 是否启用异常检测 |
| `sample_rate` | int | 1 | 采样率（1=100%，100=1%） |
| `check_interval` | int | 1 | 检测间隔（秒） |
| `min_packets` | int | 50 | 最小包数阈值 |
| `cleanup_interval` | int | 300 | 清理过期数据间隔（秒） |
| `block_duration` | int | 60 | 临时封禁时长（秒） |
| `ports` | []int | - | 检测端口列表（为空则检测所有端口） |

#### 3σ 基线配置 (anomaly_detection.baseline)

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `min_sample_count` | int | 10 | 最小样本数 |
| `sigma_multiplier` | float | 3.0 | σ 倍数（3σ 原则） |
| `min_threshold` | int | 100 | 最小 PPS 阈值 |
| `max_age` | int | 1800 | 基线最大年龄（秒） |

#### 攻击类型配置 (anomaly_detection.attacks)

每种攻击类型支持：

| 参数 | 类型 | 说明 |
|------|------|------|
| `enabled` | bool | 是否启用此类型检测 |
| `ratio_threshold` | float | 协议包占比阈值（0.0-1.0） |
| `min_packets` | int | 触发检测的最小包数 |
| `block_duration` | int | 封禁时长（秒） |

支持的攻击类型：`syn_flood`、`udp_flood`、`icmp_flood`、`ack_flood`

---

## 环境变量

支持在配置文件中使用 `${VAR_NAME}` 语法引用环境变量：

```yaml
auth:
  jwt_secret: "${JWT_SECRET}"
  api_keys:
    - name: "Master Key"
      key: "${MASTER_API_KEY}"
      permissions: ["*"]
```

启动前设置环境变量：

```bash
export JWT_SECRET="your-strong-secret-key"
export MASTER_API_KEY="sk_live_your-master-key"
```

---

## 规则来源位掩码

rho-aias 使用位掩码标记规则来源，支持多源聚合：

| 来源 | 位掩码 | 说明 |
|------|--------|------|
| 手动规则 | `0x01` | 通过 API 手动添加 |
| 威胁情报 | `0x02` | IPSum、Spamhaus 等 |
| 地域封禁 | `0x04` | GeoIP 黑名单 |
| WAF 联动 | `0x08` | WAF 自动封禁 |
| 异常检测 | `0x10` | DDoS 检测自动封禁 |

当同一 IP 被多个来源标记时，位掩码会合并，删除时会检查是否还有其他来源。

---

## Cron 表达式说明

配置中的 `schedule` 字段使用标准 Cron 表达式：

```
┌───────────── 分钟 (0 - 59)
│ ┌───────────── 小时 (0 - 23)
│ │ ┌───────────── 日期 (1 - 31)
│ │ │ ┌───────────── 月份 (1 - 12)
│ │ │ │ ┌───────────── 星期几 (0 - 6，0 为周日)
│ │ │ │ │
* * * * *
```

常用示例：

| 表达式 | 说明 |
|--------|------|
| `0 1 * * *` | 每天凌晨 1 点 |
| `0 */6 * * *` | 每 6 小时 |
| `0 0 * * 0` | 每周日午夜 |
| `0 0 1 * *` | 每月 1 日午夜 |
