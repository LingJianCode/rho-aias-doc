# 快速开始

本指南将帮助你快速部署和运行 rho-aias。

## 环境要求

| 项目 | 最低要求 |
|------|---------|
| 操作系统 | Linux Kernel 5.4+（推荐 6.1） |
| Docker | 20.10+ |
| Docker Compose | v2.0+ |
| 硬件 | 支持 XDP 的网卡 |

## 安装步骤

### 1. 克隆项目

```bash
git clone https://cnb.cool/MakeCNBGreatAgain/rho-aias.git
cd rho-aias
```

### 2. 创建配置文件

复制并编辑配置文件：

```bash
cp config.example.yaml config.yaml
```

基本配置示例：

```yaml
# 服务配置
server:
  host: "0.0.0.0"
  port: 8080

# eBPF/XDP 配置
xdp:
  interface: "eth0"      # 绑定的网卡

# 认证配置
auth:
  jwt_secret: "your-secret-key"
  api_keys:
    - "your-api-key"
```

### 3. 创建 Docker Compose 文件

创建 `docker-compose.yml` 文件：

```yaml
services:
  caddy:
    image: docker.cnb.cool/makecnbgreatagain/rho-aias/rho-aias-caddy:latest
    container_name: caddy
    environment:
      - TZ=Asia/Shanghai
    restart: unless-stopped
    network_mode: host
    user: root

    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE

    security_opt:
      - no-new-privileges:true


    tmpfs:
      - /tmp

    volumes:
      - ./caddy/Caddyfile:/etc/caddy/Caddyfile:ro
      - ./caddy/config:/root/.config
      - ./caddy/data:/root/.local/share/caddy
      - ./logs/caddy:/logs

  rho-aias:
    image: docker.cnb.cool/makecnbgreatagain/rho-aias/rho-aias:latest
    container_name: rho-aias
    environment:
      - TZ=Asia/Shanghai
    privileged: false
    cap_drop:
      - ALL
    cap_add:
      - CAP_BPF
      - CAP_PERFMON
      - CAP_NET_ADMIN
      - CAP_NET_RAW
    network_mode: host
    volumes:
      - ./config.yml:/app/config/config.yml:ro
      - ./logs/rho-aias:/app/logs
      - ./data:/app/data
      - ./logs/caddy:/caddy-logs:ro
    command: ["--config", "/app/config/config.yml"]
    restart: unless-stopped
```

### 4. 启动服务

```bash
# 启动服务
docker compose up -d

# 查看日志
docker compose logs -f
```

## 验证安装

```bash
# 检查 XDP 程序是否已加载
ip link show eth0 | grep xdp

# 查看 API 状态
curl http://localhost:8080/api/v1/health
```

## 下一步

- 阅读 [配置说明](/guide/configuration) 了解完整的配置选项
- 阅读 [API 参考](/guide/api) 了解可用的 API 接口
- 阅读 [WAF 集成](/guide/waf) 了解如何与 WAF 联动
