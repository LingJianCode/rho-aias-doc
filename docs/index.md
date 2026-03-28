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
    details: 基于 eBPF XDP 程序实现 L3 层数据包拦截，支持 IPv4/IPv6 精确匹配和 CIDR 范围匹配，性能远超传统 iptables，单核可处理数百万 PPS。
  - icon: 📋
    title: 多源规则管理
    details: 支持手动规则、IPSum/Spamhaus 威胁情报订阅、GeoIP 地域封禁、WAF 联动、异常检测等多源规则，通过位掩码实现多源聚合。
  - icon: 🔗
    title: WAF 联动
    details: 监控 Caddy + Coraza WAF 日志和 Rate Limit 日志，自动提取恶意 IP 并联动防火墙进行封禁/清理，形成完整防护闭环。
  - icon: 📊
    title: DDoS 异常检测
    details: 基于 3σ 统计基线自动识别 SYN Flood、UDP Flood、ICMP Flood、ACK Flood 等攻击流量，实时告警并自动响应封禁。
  - icon: 🌍
    title: 地域封禁
    details: 集成 MaxMind GeoIP 数据库，支持白名单/黑名单两种模式，按国家/地区自动封禁或放行流量，灵活应对地域性攻击。
  - icon: 🔐
    title: 安全认证授权
    details: 内置 JWT/API Key/Casbin RBAC 认证体系，支持验证码防暴力破解，RESTful API 接口支持细粒度权限控制，保障管理安全。
  - icon: 📝
    title: 阻断日志
    details: 实时记录 XDP 层拦截事件，支持内存缓存快速查询和文件持久化，提供多维度统计分析，便于攻击溯源和趋势分析。
  - icon: ⚡
    title: 高性能低延迟
    details: XDP 程序在网卡驱动层执行，数据包在进入内核协议栈前即被处理，实现极低延迟和高吞吐量，CPU 开销极小。
  - icon: 🔄
    title: 持久化与离线支持
    details: 规则自动持久化到本地，支持离线启动。威胁情报和 GeoIP 数据本地缓存，无需每次启动都下载。
---
