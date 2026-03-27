
### 📁 项目结构

```
rho-aias-doc/
├── package.json
├── .gitignore
└── docs/
    ├── .vitepress/
    │   ├── config.ts          # VitePress 完整配置
    │   └── theme/
    │       ├── index.ts       # 自定义主题入口
    │       └── style.css      # 极简技术风格样式
    ├── public/
    │   └── favicon.svg        # 网站图标
    ├── index.md               # Landing Page 首页
    └── guide/
        ├── index.md           # 简介
        ├── quick-start.md     # 快速开始
        ├── configuration.md   # 配置说明
        ├── api.md             # API 参考
        ├── architecture.md    # 架构概览
        ├── waf.md             # WAF 集成
        └── detection.md       # 异常检测
```

### 🎨 Landing Page
- 顶部导航栏：rho-aias / Home / Docs / CNB
- Hero 区域：渐变标题 + 项目描述 + Get Started / CNB 按钮
- 6 个 Feature 卡片：XDP 包过滤、多源规则、WAF 联动、DDoS 检测、地域封禁、认证授权
- 卡片悬停动效（边框变色 + 上浮阴影）

### 📖 文档页面（7 篇）
- **简介**：项目介绍、核心优势、功能概览、架构图、适用场景
- **快速开始**：环境要求、安装步骤、配置示例、验证方法
- **配置说明**：完整 YAML 配置参考、XDP 模式选择、环境变量
- **API 参考**：认证、规则 CRUD、状态查询、DDoS API、错误码
- **架构概览**：分层架构图、数据流、核心组件、eBPF Map 结构
- **WAF 集成**：Caddy+Coraza 联动、工作原理、配置参数、手动管理
- **异常检测**：3σ 基线原理、攻击类型识别、DDoS 检测配置、最佳实践

### 🎯 样式特性
- 参考 pigsty.cc 极简技术风格
- 深色/浅色模式切换
- 响应式设计（移动端/平板/桌面）
- 自定义渐变色品牌色（#e94560 → #0f3460）
- 卡片布局悬停动效
- 本地搜索支持
- SEO meta 标签配置

### 🚀 使用方式

```bash
npm install
npm run dev      # 本地开发预览
npm run build    # 构建
npm run preview  # 预览构建结果
```

### 说明

[docker-static-website]https://github.com/lipanski/docker-static-website