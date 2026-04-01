---
title: 认证授权
description: rho-aias 认证授权体系：支持 JWT Token、API Key 和 Casbin RBAC 三种认证方式，实现细粒度的 API 权限控制。
---

# 认证授权

rho-aias 内置了完整的认证授权体系，支持 JWT Token、API Key 和 Casbin RBAC 权限控制。

## 概述

```mermaid
flowchart TB
    A[请求入口<br/>JWT / API Key] --> B[Auth Middleware]
    B --> C[JWT 验证]
    B --> D[API Key 验证]
    B --> E[验证码校验]
    C & D & E --> F[Casbin Middleware<br/>基于角色的访问控制]
    F --> G{用户/角色 + 资源 + 操作}
    G -->|允许| H[访问成功]
    G -->|拒绝| I[访问拒绝]
```

## 启用认证

在 `config.yml` 中配置：

```yaml
auth:
  enabled: true
  jwt_secret: ""              # 建议从环境变量读取
  jwt_issuer: "rho-aias"
  token_duration: 1440        # Token 有效期（分钟）
  database_path: "./data/auth.db"
  captcha_enabled: true       # 启用验证码
  captcha_duration: 5         # 验证码有效期（分钟）
```

::: warning 安全警告
生产环境必须设置强 JWT 密钥！推荐通过环境变量传入：

```bash
export JWT_SECRET="your-strong-random-secret-key-at-least-32-chars"
```
:::

---

## 登录流程

### 1. 获取验证码

```bash
curl http://localhost:8081/api/auth/captcha
```

响应：

```json
{
  "captcha_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "image": "data:image/png;base64,iVBORw0KGgo..."
}
```

### 2. 提交登录

```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "captcha_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "captcha_answer": "ABCD"
  }'
```

响应：

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "created_at": "2026-03-28T00:00:00Z"
  },
  "expires_at": "2026-03-29T00:00:00Z"
}
```

### 3. 使用 Token 访问 API

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  http://localhost:8081/api/rules
```

---

## 默认账户

首次启动时，系统会自动创建默认管理员账户：

| 字段 | 值 |
|------|------|
| 用户名 | `admin` |
| 密码 | `admin123` |
| 角色 | `admin` |

::: danger 重要
首次登录后请立即修改默认密码！
:::

### 修改密码

```bash
curl -X PUT http://localhost:8081/api/auth/password \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "old_password": "admin123",
    "new_password": "NewStrongPassword123"
  }'
```

---

## API Key 认证

API Key 适用于服务间调用、自动化脚本等场景。

### 预定义 API Key

在配置文件中预定义：

```yaml
auth:
  api_keys:
    - name: "Master Admin Key"
      key: "${MASTER_API_KEY}"    # 从环境变量读取
      permissions: ["*"]          # 全部权限

    - name: "Read-only Key"
      key: "sk_live_your-read-key"
      permissions:
        - "firewall:read"
        - "intel:read"
        - "geo:read"
        - "blocklog:read"
```

### 动态创建 API Key

通过 API 创建（需要 `api_key:manage` 权限）：

```bash
curl -X POST http://localhost:8081/api/api-keys \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Automation Key",
    "permissions": ["firewall:read", "firewall:write"]
  }'
```

响应：

```json
{
  "id": 1,
  "name": "Automation Key",
  "key": "sk_live_abc123def456...",
  "permissions": ["firewall:read", "firewall:write"],
  "created_at": "2026-03-28T10:00:00Z"
}
```

::: warning 注意
创建后请立即保存 API Key，系统不会再次显示完整密钥。
:::

### 使用 API Key

```bash
curl -H "X-API-Key: sk_live_abc123def456..." \
  http://localhost:8081/api/rules
```

---

## 权限控制 (RBAC)

rho-aias 使用 Casbin 实现基于角色的访问控制（RBAC）。

### 内置角色

| 角色 | 权限范围 |
|------|---------|
| `admin` | 全部权限，包括用户管理、审计日志 |
| `operator` | 防火墙操作权限，可读写规则 |
| `viewer` | 只读权限，仅可查看状态和规则 |

### 权限列表

| 权限 | 说明 | 适用角色 |
|------|------|---------|
| `*` | 全部权限 | admin |
| `firewall:read` | 读取防火墙规则 | admin, operator, viewer |
| `firewall:write` | 修改防火墙规则（黑名单/白名单） | admin, operator |
| `intel:read` | 读取威胁情报状态 | admin, operator, viewer |
| `intel:write` | 触发威胁情报更新 | admin, operator |
| `geo:read` | 读取地域封禁状态 | admin, operator, viewer |
| `geo:write` | 修改地域封禁配置 | admin, operator |
| `blocklog:read` | 读取阻断日志 | admin, operator, viewer |
| `blocklog:clear` | 清除阻断日志 | admin |
| `source:read` | 读取数据源状态 | admin, operator, viewer |
| `source:write` | 触发数据源更新 | admin, operator |
| `ban_record:read` | 读取封禁记录 | admin, operator, viewer |
| `api_key:manage` | 管理 API Key | admin |
| `admin:*` | 管理员权限（用户管理、审计日志） | admin |

### 权限检查流程

```mermaid
flowchart LR
    A[请求] --> B[Auth Middleware<br/>验证身份]
    B --> C[Casbin Middleware<br/>检查权限]
    C --> D[用户角色]
    C --> E[API Key]
    D --> F[检查角色权限]
    E --> G[检查 Key 权限]
```

---

## 用户管理

需要 `admin:*` 权限。

### 创建用户

```bash
curl -X POST http://localhost:8081/api/users \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "operator1",
    "password": "SecurePass123",
    "role": "operator"
  }'
```

### 列出用户

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8081/api/users
```

### 更新用户

```bash
curl -X PUT http://localhost:8081/api/users/2 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "viewer"
  }'
```

### 删除用户

```bash
curl -X DELETE -H "Authorization: Bearer <token>" \
  http://localhost:8081/api/users/2
```

---

## 审计日志

系统会记录所有敏感操作，需要 `admin:*` 权限查看。

### 查询审计日志

```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8081/api/audit/logs?page=1&page_size=20"
```

响应：

```json
{
  "logs": [
    {
      "id": 1,
      "user_id": 1,
      "username": "admin",
      "action": "create_user",
      "resource": "user:operator1",
      "ip": "192.168.1.100",
      "user_agent": "curl/7.68.0",
      "created_at": "2026-03-28T10:00:00Z"
    }
  ],
  "total": 100
}
```

### 记录的操作类型

| 操作 | 说明 |
|------|------|
| `login` | 用户登录 |
| `logout` | 用户登出 |
| `create_user` | 创建用户 |
| `update_user` | 更新用户 |
| `delete_user` | 删除用户 |
| `create_api_key` | 创建 API Key |
| `revoke_api_key` | 吊销 API Key |
| `add_rule` | 添加规则 |
| `delete_rule` | 删除规则 |
| `update_config` | 更新配置 |

---

## 安全建议

### 1. JWT 密钥

使用强随机密钥（至少 32 字符）：

```bash
# 生成随机密钥
openssl rand -hex 32

# 设置环境变量
export JWT_SECRET="生成的随机密钥"
```

### 2. 密码策略

- 最小长度 6 字符
- 建议包含大小写字母、数字和特殊字符
- 定期更换密码

### 3. HTTPS

生产环境必须使用 HTTPS：

- 使用反向代理（Nginx、Caddy）配置 TLS
- 或直接在应用层配置 TLS

### 4. Token 存储

客户端应安全存储 Token：

- 避免存储在 localStorage（XSS 风险）
- 推荐使用 HttpOnly Cookie 或安全存储方案

### 5. API Key 管理

- 为不同用途创建独立的 API Key
- 定期轮换 API Key
- 及时吊销不再使用的 Key

### 6. 禁用认证的风险

当 `auth.enabled: false` 时：

```
[Security] Authentication is DISABLED - all APIs are publicly accessible without any protection!
```

::: danger 危险
生产环境切勿禁用认证！所有 API 将完全暴露。
:::
