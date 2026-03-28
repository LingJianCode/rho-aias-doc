# API 参考

rho-aias 提供完整的 RESTful API 接口用于规则管理、状态查询和系统配置。

## 基础信息

- **Base URL**: `http://<host>:<port>/api`
- **认证方式**: Bearer Token (JWT) 或 API Key
- **Content-Type**: `application/json`

## 认证方式

### JWT Token 认证

在请求头中添加 `Authorization` 字段：

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  http://localhost:8081/api/rules
```

### API Key 认证

在请求头中添加 `X-API-Key` 字段：

```bash
curl -H "X-API-Key: your-api-key" \
  http://localhost:8081/api/rules
```

---

## 认证 API

### 获取验证码

```bash
GET /api/auth/captcha
```

响应：

```json
{
  "captcha_id": "xxx-xxx-xxx",
  "image": "data:image/png;base64,..."
}
```

### 用户登录

```bash
POST /api/auth/login
```

请求体：

```json
{
  "username": "admin",
  "password": "admin123",
  "captcha_id": "xxx-xxx-xxx",
  "captcha_answer": "abcd"
}
```

响应：

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  },
  "expires_at": "2026-03-29T00:00:00Z"
}
```

### 刷新 Token

```bash
POST /api/auth/refresh
```

### 登出

```bash
POST /api/auth/logout
```

### 获取当前用户信息

```bash
GET /api/auth/me
```

### 修改密码

```bash
PUT /api/auth/password
```

请求体：

```json
{
  "old_password": "oldpass",
  "new_password": "newpass"
}
```

---

## 黑名单管理 API

### 添加黑名单规则

```bash
POST /api/manual/blacklist/rules
```

请求体：

```json
{
  "value": "192.168.1.100"
}
```

支持格式：
- IPv4: `192.168.1.100`
- IPv6: `2001:db8::1`
- CIDR: `192.168.1.0/24`、`2001:db8::/32`

响应：

```json
{
  "message": "ok"
}
```

### 删除黑名单规则

```bash
DELETE /api/manual/blacklist/rules
```

请求体：

```json
{
  "value": "192.168.1.100"
}
```

---

## 白名单管理 API

### 添加白名单规则

```bash
POST /api/manual/whitelist/rules
```

请求体：

```json
{
  "value": "10.0.0.1"
}
```

### 删除白名单规则

```bash
DELETE /api/manual/whitelist/rules
```

请求体：

```json
{
  "value": "10.0.0.1"
}
```

### 查询白名单规则列表

```bash
GET /api/manual/whitelist/rules
```

响应：

```json
{
  "rules": [
    {
      "value": "10.0.0.1",
      "added_at": "2026-03-28T10:00:00Z"
    }
  ],
  "total": 1
}
```

---

## 规则查询 API

### 查询当前所有规则

```bash
GET /api/rules
```

响应：

```json
{
  "rules": [
    {
      "ip": "192.168.1.100",
      "source_mask": 1,
      "sources": ["manual"]
    }
  ],
  "total": 1
}
```

---

## 威胁情报 API

### 获取情报源状态

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
      "next_update": "2026-03-29T01:00:00Z"
    },
    "spamhaus": {
      "enabled": true,
      "rule_count": 1500,
      "last_update": "2026-03-28T02:00:00Z"
    }
  }
}
```

### 触发情报更新

```bash
POST /api/intel/update
```

---

## 地域封禁 API

### 获取地域封禁状态

```bash
GET /api/geoblocking/status
```

响应：

```json
{
  "enabled": true,
  "mode": "whitelist",
  "allowed_countries": ["CN"],
  "rule_count": 50000,
  "last_update": "2026-03-28T03:00:00Z"
}
```

### 触发地域数据更新

```bash
POST /api/geoblocking/update
```

### 更新地域封禁配置

```bash
POST /api/geoblocking/config
```

请求体：

```json
{
  "mode": "whitelist",
  "allowed_countries": ["CN", "US"]
}
```

---

## 阻断日志 API

### 查询阻断记录

```bash
GET /api/blocklog/records
```

查询参数：

| 参数 | 类型 | 说明 |
|------|------|------|
| `start` | string | 开始时间（RFC3339） |
| `end` | string | 结束时间（RFC3339） |
| `src_ip` | string | 源 IP 过滤 |
| `limit` | int | 返回条数限制 |

响应：

```json
{
  "records": [
    {
      "src_ip": "192.168.1.100",
      "dst_ip": "10.0.0.1",
      "match_type": "ip",
      "rule_source": "manual",
      "country_code": "US",
      "packet_size": 64,
      "timestamp": "2026-03-28T10:00:00Z"
    }
  ],
  "total": 100
}
```

### 获取阻断统计

```bash
GET /api/blocklog/stats
```

响应：

```json
{
  "total_blocked": 10000,
  "by_source": {
    "manual": 100,
    "intel": 5000,
    "geo": 3000,
    "waf": 1500,
    "anomaly": 400
  },
  "by_country": {
    "US": 3000,
    "CN": 500,
    "RU": 2000
  }
}
```

### 获取被阻断的 IP 列表

```bash
GET /api/blocklog/blocked-ips
```

### 获取被阻断的国家列表

```bash
GET /api/blocklog/blocked-countries
```

### 清除阻断记录

```bash
DELETE /api/blocklog/records
```

---

## 封禁记录 API

### 查询封禁记录

```bash
GET /api/ban-records
```

查询参数：

| 参数 | 类型 | 说明 |
|------|------|------|
| `ip` | string | IP 过滤 |
| `source` | string | 来源过滤：`waf`, `anomaly` |
| `active` | bool | 是否仅查询活跃封禁 |
| `page` | int | 页码 |
| `page_size` | int | 每页条数 |

响应：

```json
{
  "records": [
    {
      "id": 1,
      "ip": "192.168.1.100",
      "source": "waf",
      "reason": "SQL Injection attempt",
      "duration": 3600,
      "expired": false,
      "created_at": "2026-03-28T10:00:00Z",
      "expires_at": "2026-03-28T11:00:00Z"
    }
  ],
  "total": 50
}
```

### 获取封禁统计

```bash
GET /api/ban-records/stats
```

### 查询单条封禁记录

```bash
GET /api/ban-records/:id
```

---

## 数据源状态 API

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
      "rule_count": 230000
    },
    {
      "type": "intel",
      "id": "spamhaus",
      "enabled": true,
      "last_update": "2026-03-28T02:00:00Z",
      "rule_count": 1500
    },
    {
      "type": "geo",
      "id": "maxmind",
      "enabled": true,
      "last_update": "2026-03-28T03:00:00Z",
      "rule_count": 50000
    }
  ]
}
```

### 获取指定类型数据源状态

```bash
GET /api/sources/:type/status
```

### 获取指定数据源状态

```bash
GET /api/sources/:type/:id/status
```

### 手动触发数据源更新

```bash
POST /api/sources/:type/:id/refresh
```

---

## XDP 事件 API

### 获取事件上报状态

```bash
GET /api/xdp/events/status
```

响应：

```json
{
  "enabled": true,
  "sample_rate": 100
}
```

### 配置事件上报

```bash
POST /api/xdp/events/config
```

请求体：

```json
{
  "enabled": true,
  "sample_rate": 100
}
```

---

## 用户管理 API

需要 `admin:*` 权限。

### 创建用户

```bash
POST /api/users
```

请求体：

```json
{
  "username": "operator",
  "password": "password123",
  "role": "operator"
}
```

### 列出用户

```bash
GET /api/users
```

### 获取用户详情

```bash
GET /api/users/:id
```

### 更新用户

```bash
PUT /api/users/:id
```

### 删除用户

```bash
DELETE /api/users/:id
```

---

## API Key 管理 API

需要 `api_key:manage` 权限。

### 创建 API Key

```bash
POST /api/api-keys
```

请求体：

```json
{
  "name": "Automation Key",
  "permissions": ["firewall:read", "firewall:write"]
}
```

响应：

```json
{
  "id": 1,
  "name": "Automation Key",
  "key": "sk_live_xxx...",
  "permissions": ["firewall:read", "firewall:write"],
  "created_at": "2026-03-28T10:00:00Z"
}
```

::: warning 注意
创建后请立即保存 API Key，系统不会再次显示完整密钥。
:::

### 列出 API Keys

```bash
GET /api/api-keys
```

### 吊销 API Key

```bash
DELETE /api/api-keys/:id
```

---

## 审计日志 API

需要 `admin:*` 权限。

### 列出审计日志

```bash
GET /api/audit/logs
```

查询参数：

| 参数 | 类型 | 说明 |
|------|------|------|
| `user_id` | int | 用户 ID 过滤 |
| `action` | string | 操作类型过滤 |
| `start` | string | 开始时间 |
| `end` | string | 结束时间 |
| `page` | int | 页码 |
| `page_size` | int | 每页条数 |

### 获取单条审计日志

```bash
GET /api/audit/logs/:id
```

### 清理旧审计日志

```bash
POST /api/audit/clean
```

请求体：

```json
{
  "before": "2026-01-01T00:00:00Z"
}
```

---

## 权限说明

| 权限 | 说明 |
|------|------|
| `*` | 全部权限 |
| `firewall:read` | 读取防火墙规则 |
| `firewall:write` | 修改防火墙规则 |
| `intel:read` | 读取威胁情报状态 |
| `intel:write` | 触发威胁情报更新 |
| `geo:read` | 读取地域封禁状态 |
| `geo:write` | 修改地域封禁配置 |
| `blocklog:read` | 读取阻断日志 |
| `blocklog:clear` | 清除阻断日志 |
| `source:read` | 读取数据源状态 |
| `source:write` | 触发数据源更新 |
| `ban_record:read` | 读取封禁记录 |
| `api_key:manage` | 管理 API Key |
| `admin:*` | 管理员权限（用户管理、审计日志） |

---

## 错误响应

所有错误响应格式：

```json
{
  "error": "错误描述信息"
}
```

常见 HTTP 状态码：

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 参数错误 |
| 401 | 未认证或 Token 无效 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
