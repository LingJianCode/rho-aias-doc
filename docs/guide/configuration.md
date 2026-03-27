# 配置说明

rho-aias 的所有配置通过 YAML 文件管理，默认配置文件为 `config.yaml`。

## 配置结构

```yaml
# 服务配置
server:
  host: "0.0.0.0"        # 监听地址
  port: 8080             # 监听端口
  mode: "release"        # 运行模式: debug, release

# eBPF/XDP 配置
xdp:
  interface: "eth0"      # 绑定网卡名称
  mode: "native"         # XDP 挂载模式
  # XDP 模式说明:
  # - native: 最优性能，需要网卡支持
  # - skb: 兼容性好，性能略低
  # - hw: 硬件卸载，需要特定网卡

# 规则配置
rules:
  # 手动规则文件路径
  manual_path: "./rules/manual.json"
  # 规则更新间隔（秒）
  sync_interval: 300

# 威胁情报配置
threat_intel:
  enabled: true
  sources:
    - name: "ipsum"
      url: "https://raw.githubusercontent.com/stamparm/ipsum/master/feeds/ipsum.txt"
      interval: 3600       # 更新间隔（秒）
    - name: "spamhaus"
      url: "https://www.spamhaus.org/drop/drop.txt"
      interval: 3600

# GeoIP 配置
geoip:
  enabled: true
  database: "./data/GeoLite2-Country.mmdb"
  # 封禁国家代码 (ISO 3166-1 alpha-2)
  block_countries: []
  # 放行国家代码
  allow_countries: []

# WAF 联动配置
waf:
  enabled: false
  log_path: "/var/log/caddy/access.log"
  ban_threshold: 10       # 触发封禁的请求次数
  ban_duration: 3600      # 封禁时长（秒）

# DDoS 检测配置
ddos:
  enabled: true
  # 基线配置
  baseline:
    window: 60            # 统计窗口（秒）
    history: 300          # 历史数据量（秒）
    sigma_factor: 3       # σ 因子（默认 3）
  # 攻击类型检测
  attacks:
    syn_flood:
      enabled: true
      threshold: 10000    # SYN 包/秒阈值
    udp_flood:
      enabled: true
      threshold: 50000    # UDP 包/秒阈值
    icmp_flood:
      enabled: true
      threshold: 5000     # ICMP 包/秒阈值
    ack_flood:
      enabled: true
      threshold: 8000     # ACK 包/秒阈值

# 认证配置
auth:
  jwt_secret: "change-me-to-random-string"
  token_expire: 86400     # Token 过期时间（秒）
  api_keys:
    - "your-api-key-here"

# 日志配置
log:
  level: "info"           # debug, info, warn, error
  output: "stdout"        # stdout, file
  file_path: "./logs/rho-aias.log"
```

## XDP 模式选择

| 模式 | 性能 | 兼容性 | 说明 |
|------|------|--------|------|
| `native` | ⭐⭐⭐ | 需要网卡支持 | 最佳性能，推荐使用 |
| `skb` | ⭐⭐ | 所有网卡 | 无需特殊硬件支持 |
| `hw` | ⭐⭐⭐ | 需要特定网卡 | 在网卡硬件中执行 |

## 环境变量

除了配置文件外，也可以通过环境变量覆盖配置：

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `RHO_AIAS_CONFIG` | 配置文件路径 | `./config.yaml` |
| `RHO_AIAS_HOST` | 监听地址 | `0.0.0.0` |
| `RHO_AIAS_PORT` | 监听端口 | `8080` |
| `RHO_AIAS_LOG_LEVEL` | 日志级别 | `info` |
| `RHO_AIAS_XDP_IFACE` | XDP 绑定网卡 | `eth0` |
