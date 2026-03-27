# WAF 集成

rho-aias 可以与 Caddy + Coraza WAF 联动，通过监控 WAF 日志自动识别恶意 IP 并将其加入防火墙封禁列表。

## 工作原理

```
┌──────────────┐    恶意请求     ┌──────────────┐    WAF 日志     ┌──────────────┐
│   攻击者      │ ──────────────▶ │  Caddy WAF   │ ──────────────▶ │ rho-aias     │
│              │                │  (Coraza)    │                │ WAF Monitor  │
└──────────────┘                └──────────────┘                └──────┬───────┘
                                                                       │
                                                                       │ 提取恶意 IP
                                                                       ▼
                                                               ┌──────────────┐
                                                               │ 规则引擎     │
                                                               │ 自动添加封禁  │
                                                               └──────┬───────┘
                                                                       │
                                                                       ▼
                                                               ┌──────────────┐
                                                               │ XDP 程序    │
                                                               │ IP 加入封禁  │
                                                               └──────────────┘
```

## 前置条件

- 已部署 Caddy Web 服务器
- 已安装 Coraza WAF 插件
- Caddy 配置了访问日志输出

## 配置 WAF 联动

### 1. Caddy 配置

确保 Caddy 配置了 access log：

```
{
    admin off
    log {
        output file /var/log/caddy/access.log {
            roll_size 100mb
            roll_keep 5
        }
        format json
    }
}

example.com {
    encode gzip
    coraza_waf {
        load_owasp_crs
    }
    reverse_proxy localhost:8080
}
```

### 2. rho-aias 配置

在 `config.yaml` 中启用 WAF 联动：

```yaml
waf:
  enabled: true
  log_path: "/var/log/caddy/access.log"
  # 触发自动封禁的规则匹配次数阈值
  ban_threshold: 10
  # 封禁持续时间（秒）
  ban_duration: 3600
  # WAF 状态码匹配（触发封禁的 HTTP 状态码）
  status_codes:
    - 403    # Forbidden
    - 429    # Too Many Requests
  # WAF 规则 ID 匹配（可选）
  rule_ids: []
  # 清理时间窗口（秒）
  clean_window: 600
```

### 3. 参数说明

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `enabled` | 是否启用 WAF 联动 | `false` |
| `log_path` | Caddy 访问日志路径 | - |
| `ban_threshold` | 触发封禁的请求次数 | `10` |
| `ban_duration` | 封禁时长（秒） | `3600` |
| `status_codes` | 触发封禁的 HTTP 状态码 | `[403, 429]` |
| `rule_ids` | 指定 WAF 规则 ID（空则不匹配） | `[]` |
| `clean_window` | 清理窗口，超过此时间的自动封禁记录将被清理 | `600` |

## 工作流程

1. **日志监控**：rho-aias 实时监控 Caddy 访问日志文件
2. **恶意识别**：当检测到指定 HTTP 状态码（如 403）的请求时，记录源 IP
3. **阈值判断**：在时间窗口内，某 IP 的恶意请求数超过 `ban_threshold` 时触发封禁
4. **自动封禁**：将该 IP 通过 eBPF 程序加入封禁列表，持续 `ban_duration` 秒
5. **自动清理**：封禁到期后自动从列表中移除

## 手动管理 WAF 规则

### 查看当前 WAF 封禁列表

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8080/api/v1/rules?type=waf
```

### 手动清理 WAF 封禁

```bash
curl -X DELETE -H "Authorization: Bearer <token>" \
  http://localhost:8080/api/v1/rules/{rule-id}
```

### 调整封禁时长

```bash
curl -X PUT -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"duration": 7200}' \
  http://localhost:8080/api/v1/rules/{rule-id}
```

## 注意事项

- 确保 rho-aias 进程对日志文件有读取权限
- 日志文件格式需要是 JSON 格式
- WAF 联动产生的规则会自动标记 `type: waf`
- 避免将 `ban_threshold` 设得太低，以免误封正常用户
