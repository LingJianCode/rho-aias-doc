---
layout: home

hero:
  name: rho-aias
  text: 基于eBPF/XDP的高性能网络防火墙
  tagline: 在网络驱动层（L3）拦截和过滤数据包，比传统 netfilter/iptables 拥有更优的性能表现
  actions:
    - theme: brand
      text: Get Started
      link: /guide/
    - theme: alt
      text: CNB
      link: https://cnb.cool/MakeCNBGreatAgain/rho-aias.git

features:
  - icon: 🛡️
    title: XDP 包过滤
    details: 基于 eBPF XDP 程序实现 L3 层数据包拦截，支持 IPv4/IPv6 精确匹配和 CIDR 范围匹配，性能远超传统 iptables。
  - icon: 📋
    title: 多源规则管理
    details: 支持手动规则、IPSum/Spamhaus 威胁情报订阅、GeoIP 地域封禁等多源规则，统一管理灵活配置。
  - icon: 🔗
    title: WAF 联动
    details: 监控 Caddy + Coraza WAF 日志，自动提取恶意 IP 并联动防火墙进行封禁/清理，形成完整防护闭环。
  - icon: 📊
    title: DDoS 异常检测
    details: 基于 3σ 统计基线自动识别 SYN Flood、UDP Flood、ICMP Flood、ACK Flood 等攻击流量，实时告警并自动响应。
  - icon: 🌍
    title: 地域封禁
    details: 集成 MaxMind GeoIP 数据库，支持按国家/地区自动封禁或放行流量，灵活应对地域性攻击。
  - icon: 🔐
    title: 安全认证授权
    details: 内置 JWT/API Key/Casbin RBAC 认证体系，RESTful API 接口支持细粒度权限控制，保障管理安全。
---
