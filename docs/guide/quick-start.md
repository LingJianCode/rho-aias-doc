# 快速开始

本指南将帮助你快速部署和运行 rho-aias。

## 环境要求

| 项目 | 最低要求 |
|------|---------|
| 操作系统 | Linux Kernel 5.4+（推荐 5.10+） |
| Go 版本 | 1.21+ |
| eBPF 工具 | clang, llvm, libbpf |
| 硬件 | 支持 XDP 的网卡 |

## 安装步骤

### 1. 克隆项目

```bash
git clone https://cnb.cool/MakeCNBGreatAgain/rho-aias.git
cd rho-aias
```

### 2. 编译 eBPF 程序

```bash
# 安装依赖
make deps

# 编译 eBPF 内核程序
make xdp
```

### 3. 编译管理程序

```bash
# 编译 rho-aias manager
make build
```

### 4. 配置

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
  mode: "native"          # XDP 模式: native, skb, hw

# 认证配置
auth:
  jwt_secret: "your-secret-key"
  api_keys:
    - "your-api-key"
```

### 5. 运行

```bash
# 启动服务
sudo ./rho-aias -config config.yaml
```

服务启动后，你可以通过 API 或 CLI 进行规则管理。

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
