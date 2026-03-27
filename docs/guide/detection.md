# 异常检测

rho-aias 内置了基于统计基线的异常流量检测系统，能够自动识别 DDoS 攻击并触发响应措施。

## 检测原理

rho-aias 使用 **3σ（三倍标准差）** 统计方法建立流量基线，实时监控网络流量偏离正常范围的情况：

```
流量 (PPS)
    │
    │              ╭── 上限阈值 (μ + 3σ)
    │            ╱     ╳ ← 异常流量检测
    │          ╱
    │        ╱
    │ ─────╱─────────── 平均值 (μ)
    │      ╲
    │        ╲
    │          ╲
    │            ╲   ╳ ← 异常流量检测
    │              ╰── 下限阈值 (μ - 3σ)
    │
    └────────────────────────── 时间
```

- **μ（均值）**：历史时间窗口内的平均流量
- **σ（标准差）**：流量的波动程度
- 当实时流量超过 `μ + 3σ` 时判定为异常

## 支持的攻击类型

| 攻击类型 | 检测方式 | 说明 |
|---------|---------|------|
| SYN Flood | SYN 包速率 | 大量半开连接耗尽服务器资源 |
| UDP Flood | UDP 包速率 | 大量 UDP 包淹没带宽 |
| ICMP Flood | ICMP 包速率 | 利用 ICMP 协议进行流量攻击 |
| ACK Flood | ACK 包速率 | 发送大量 ACK 包干扰连接 |

## 配置

在 `config.yaml` 中配置 DDoS 检测：

```yaml
ddos:
  enabled: true

  # 基线配置
  baseline:
    window: 60            # 滑动窗口大小（秒）
    history: 300          # 历史数据保留时间（秒）
    sigma_factor: 3       # σ 倍数（默认 3）

  # 攻击类型检测
  attacks:
    syn_flood:
      enabled: true
      threshold: 10000    # 静态阈值（PPS），超过则直接触发
      auto_ban: true      # 是否自动封禁
      ban_duration: 600   # 自动封禁时长（秒）
    udp_flood:
      enabled: true
      threshold: 50000
      auto_ban: true
      ban_duration: 600
    icmp_flood:
      enabled: true
      threshold: 5000
      auto_ban: true
      ban_duration: 600
    ack_flood:
      enabled: true
      threshold: 8000
      auto_ban: true
      ban_duration: 600
```

### 参数说明

| 参数 | 说明 | 推荐值 |
|------|------|--------|
| `baseline.window` | 滑动窗口大小，用于计算实时流量 | 60 秒 |
| `baseline.history` | 历史数据保留时长，用于计算基线 | 300 秒 |
| `baseline.sigma_factor` | σ 倍数，越高越宽松 | 3 |
| `attacks.*.threshold` | 静态阈值（PPS），超过直接触发告警 | 视业务而定 |
| `attacks.*.auto_ban` | 是否自动封禁攻击源 IP | 按需开启 |
| `attacks.*.ban_duration` | 自动封禁时长 | 600 秒 |

## 工作流程

```
  数据包流入
      │
      ▼
┌─────────────┐
│  包分类计数   │ ── 按 SYN/UDP/ICMP/ACK 分类统计
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  滑动窗口    │ ── 计算 window 内的各类包速率
└──────┬──────┘
       │
       ▼
┌─────────────────────┐     超过阈值
│  异常判断            │ ─────────────────▶ ┌──────────┐
│  (阈值 + 3σ 基线)    │                    │ 触发告警  │
└─────────────────────┘                    └────┬─────┘
       │ 正常                                   │
       ▼                                  auto_ban?
┌─────────────┐                              │
│  更新基线    │◀────────── 是 ──────────────┘
└─────────────┘
       │
       ▼
  继续监控
```

## 查看 DDoS 检测状态

### 获取当前状态

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8080/api/v1/ddos/status
```

响应示例：

```json
{
  "code": 0,
  "data": {
    "enabled": true,
    "current_pps": {
      "total": 25000,
      "syn": 15000,
      "udp": 8000,
      "icmp": 500,
      "ack": 1500
    },
    "baseline": {
      "total_mean": 12000,
      "total_sigma": 3000,
      "upper_threshold": 21000
    },
    "alerts": [
      {
        "type": "syn_flood",
        "detected_at": "2025-01-01T12:00:00Z",
        "current_pps": 15000,
        "threshold_pps": 21000
      }
    ],
    "auto_banned": 3
  }
}
```

### 查看告警历史

```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8080/api/v1/ddos/alerts?limit=20"
```

### 手动解除封禁

```bash
curl -X DELETE -H "Authorization: Bearer <token>" \
  http://localhost:8080/api/v1/rules/{rule-id}
```

## 最佳实践

::: tip 建议
1. **先观察再开启自动封禁**：建议先手动运行检测系统，观察基线数据后再开启 `auto_ban`
2. **合理设置阈值**：根据实际业务流量调整 `threshold`，避免误判
3. **定期检查告警**：关注告警历史，及时发现攻击趋势
4. **配合 WAF 使用**：结合 WAF 联动实现 L3 + L7 双层防护
:::
