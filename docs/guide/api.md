# API 参考

rho-aias 提供完整的 RESTful API 接口用于规则管理、状态查询和系统配置。

## 基础信息

- **Base URL**: `http://<host>:<port>/api/v1`
- **认证方式**: Bearer Token (JWT) 或 API Key
- **Content-Type**: `application/json`

## 认证

### 获取 Token

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your-password"}'
```

响应：

```json
{
  "code": 0,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expire_at": 1700000000
  }
}
```

### 使用 API Key

在请求头中添加：

```bash
curl -H "X-API-Key: your-api-key" http://localhost:8080/api/v1/rules
```

## 规则管理

### 获取规则列表

```bash
GET /api/v1/rules
```

查询参数：

| 参数 | 类型 | 说明 |
|------|------|------|
| `type` | string | 规则类型：`manual`, `threat_intel`, `geoip`, `waf`, `ddos` |
| `action` | string | 动作：`allow`, `block` |
| `page` | int | 页码 |
| `page_size` | int | 每页条数 |

响应：

```json
{
  "code": 0,
  "data": {
    "total": 42,
    "rules": [
      {
        "id": "rule-001",
        "type": "manual",
        "action": "block",
        "ip": "192.168.1.100",
        "cidr": "",
        "reason": "恶意扫描",
        "created_at": "2025-01-01T00:00:00Z",
        "expire_at": "2025-01-02T00:00:00Z"
      }
    ]
  }
}
```

### 添加规则

```bash
POST /api/v1/rules
```

请求体：

```json
{
  "action": "block",
  "ip": "10.0.0.1",
  "cidr": "10.0.0.0/24",
  "reason": "手动封禁",
  "duration": 3600
}
```

### 删除规则

```bash
DELETE /api/v1/rules/{id}
```

### 批量导入规则

```bash
POST /api/v1/rules/import
```

请求体：

```json
{
  "rules": [
    {"action": "block", "ip": "10.0.0.1", "reason": "批量导入"},
    {"action": "block", "cidr": "172.16.0.0/12", "reason": "批量导入"}
  ]
}
```

## 状态查询

### 健康检查

```bash
GET /api/v1/health
```

### XDP 状态

```bash
GET /api/v1/status/xdp
```

响应：

```json
{
  "code": 0,
  "data": {
    "interface": "eth0",
    "mode": "native",
    "loaded": true,
    "rule_count": 128,
    "packets_processed": 15000000,
    "packets_dropped": 3200
  }
}
```

### 流量统计

```bash
GET /api/v1/stats/traffic?window=60
```

## DDoS 检测

### 获取检测状态

```bash
GET /api/v1/ddos/status
```

### 获取基线数据

```bash
GET /api/v1/ddos/baseline
```

### 触发告警历史

```bash
GET /api/v1/ddos/alerts
```

## 错误码

| HTTP 状态码 | 错误码 | 说明 |
|------------|--------|------|
| 200 | 0 | 成功 |
| 400 | 1001 | 参数错误 |
| 401 | 1002 | 未授权 |
| 403 | 1003 | 权限不足 |
| 404 | 1004 | 资源不存在 |
| 500 | 2001 | 内部错误 |
