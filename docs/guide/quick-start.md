---
title: 快速开始
description: rho-aias 快速部署指南：涵盖环境要求检查、Docker 安装、YAML 配置和运行验证，帮助你快速搭建高性能网络防火墙系统。
---

# 快速开始

本指南将帮助你快速部署和运行 rho-aias。

## 环境要求

| 项目 | 最低要求 |
|------|---------|
| 操作系统 | Linux Kernel 5.8+（推荐 6.1+） |
| Go | 1.25+（仅源码编译需要） |
| Docker | 20.10+ |
| Docker Compose | v2.0+ |
| 硬件 | 支持 XDP 的网卡 |

::: tip 内核版本检查
```bash
# 检查内核版本
uname -r

# 检查 XDP 支持
bpftool feature probe | grep xdp
```
:::

---

## 安装步骤

### 方式一：使用预构建镜像（推荐）

1. **克隆项目**

```bash
git clone https://cnb.cool/MakeCNBGreatAgain/rho-aias.git
cd rho-aias
```

2. **创建配置文件**

```bash
# 直接编辑 config.yml
```

最小配置示例：

```yaml
server:
  port: 8081

ebpf:
  interface_name: eth0      # 修改为你的网卡名称

log:
  level: info
  format: console
  output_dir: ./logs
```

3. **启动服务**

```bash
docker compose up -d

# 查看日志
docker compose logs -f rho-aias
```

### 方式二：从源码构建

1. **安装依赖**

```bash
# 设置 Go 代理
go env -w GO111MODULE=on
go env -w GOPROXY=https://goproxy.cn,direct

# 安装 eBPF 开发工具
apt update
apt install bpftool libbpf-dev llvm clang libelf-dev gcc-multilib build-essential
```

2. **克隆并编译**

```bash
git clone https://cnb.cool/MakeCNBGreatAgain/rho-aias.git
cd rho-aias

# 编译
go build -o rho-aias .

# 或使用 Docker 构建
docker compose -f docker-compose-build-run.yml up -d --build
```

3. **运行**

```bash
# 需要 root 或 CAP_BPF 权限
sudo ./rho-aias --config config.yml
```

---

## 验证安装

### 1. 检查 XDP 程序

```bash
# 查看网卡是否加载 XDP
ip link show eth0 | grep xdp

# 输出示例：
# xdpgeneric/xdp1 id 123
```

### 2. 检查 API 服务

```bash
# 健康检查（未启用认证时）
curl http://localhost:8081/api/rules

# 查看数据源状态
curl http://localhost:8081/api/sources/status
```

### 3. 测试封禁功能

```bash
# 添加封禁规则
curl -X POST http://localhost:8081/api/manual/blacklist/rules \
  -H "Content-Type: application/json" \
  -d '{"value": "1.2.3.4"}'

# 查看规则
curl http://localhost:8081/api/rules

# 删除规则
curl -X DELETE http://localhost:8081/api/manual/blacklist/rules \
  -H "Content-Type: application/json" \
  -d '{"value": "1.2.3.4"}'
```

---

## 启用认证（生产环境必需）

### 1. 修改配置

```yaml
auth:
  enabled: true
  jwt_secret: ""           # 从环境变量读取
  token_duration: 1440
  captcha_enabled: true
```

### 2. 设置环境变量

```bash
export JWT_SECRET="your-strong-secret-key-at-least-32-characters"
```

### 3. 重启服务

```bash
docker compose restart rho-aias
```

### 4. 登录获取 Token

```bash
# 获取验证码
curl http://localhost:8081/api/auth/captcha

# 登录（默认账户：admin / admin123）
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "captcha_id": "<captcha_id>",
    "captcha_answer": "<answer>"
  }'
```

::: danger 安全警告
首次登录后请立即修改默认密码！
:::

---

## 启用威胁情报

```yaml
intel:
  enabled: true
  auto_refresh_on_start: true
  persistence_dir: ./data/intel
  sources:
    ipsum:
      enabled: true
      periodic: true
      schedule: "0 1 * * *"
      url: https://raw.githubusercontent.com/stamparm/ipsum/master/ipsum.txt
      format: ipsum
```

---

## 启用地域封禁

```yaml
geo_blocking:
  enabled: true
  mode: whitelist          # 白名单模式
  allowed_countries:
    - CN                   # 仅允许中国
  allow_private_networks: true
  sources:
    maxmind:
      enabled: true
      periodic: true
      schedule: "0 3 * * *"
      url: https://github.com/P3TERX/GeoLite.mmdb/releases/download/2026.01.10/GeoLite2-Country.mmdb
      format: maxmind-db
```

---

## 启用 WAF 联动

需要配合 Caddy + Coraza WAF 使用：

```yaml
waf:
  enabled: true
  waf_log_path: /caddy-logs/waf_audit.log
  rate_limit_log_path: /caddy-logs/rate_limit.log
  ban_duration: 3600       # 封禁 1 小时
```

Docker Compose 配置：

```yaml
services:
  caddy:
    image: docker.cnb.cool/makecnbgreatagain/rho-aias/rho-aias-caddy:latest
    network_mode: host
    volumes:
      - ./caddy/Caddyfile:/etc/caddy/Caddyfile:ro
      - ./logs/caddy:/logs

  rho-aias:
    image: docker.cnb.cool/makecnbgreatagain/rho-aias/rho-aias:latest
    network_mode: host
    cap_add:
      - CAP_BPF
      - CAP_PERFMON
      - CAP_NET_ADMIN
      - CAP_NET_RAW
    volumes:
      - ./config.yml:/app/config/config.yml:ro
      - ./logs/caddy:/caddy-logs:ro  # 共享 WAF 日志
```

---

## 启用异常检测

```yaml
anomaly_detection:
  enabled: true
  sample_rate: 1           # 100% 采样
  check_interval: 1        # 每秒检测
  block_duration: 60       # 封禁 60 秒
  ports:
    - 80
    - 443
  attacks:
    syn_flood:
      enabled: true
      ratio_threshold: 0.5
    udp_flood:
      enabled: true
      ratio_threshold: 0.8
```

---

## 常见问题

### XDP 加载失败

```
Error: failed to attach XDP program: operation not permitted
```

**解决方案**：
- 确保使用 root 权限或添加必要的 capabilities
- 检查内核版本是否支持 XDP

### 网卡名称错误

```
Error: interface eth0 not found
```

**解决方案**：
```bash
# 查看可用网卡
ip link show

# 修改 config.yml 中的 interface_name
```

### 认证失败

```
{"error": "invalid captcha"}
```

**解决方案**：
- 确保验证码在有效期内（默认 5 分钟）
- 检查验证码 ID 和答案是否匹配

---

## 下一步

- 阅读 [配置说明](/guide/configuration) 了解完整的配置选项
- 阅读 [API 参考](/guide/api) 了解可用的 API 接口
- 阅读 [认证授权](/guide/auth) 了解权限管理
- 阅读 [WAF 集成](/guide/waf) 了解如何与 WAF 联动
- 阅读 [异常检测](/guide/detection) 了解 DDoS 防护
