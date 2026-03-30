import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid({
  title: 'rho-aias',
  description: '基于 eBPF/XDP 的高性能网络防火墙系统',

  // 允许主题切换,默认深色模式
  appearance: 'dark',

  // Mermaid 配置
  mermaid: {
    startOnLoad: false,
    theme: 'default'
  },

  vite: {
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: [
        '.cnb.run'
      ]
    },
    build: {
      minify: 'esbuild'
    },
    esbuild: {
      drop: ['console', 'debugger'],
      legalComments: 'none'
    }
  },

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#0a0a0f' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:title', content: 'rho-aias' }],
    ['meta', { name: 'og:description', content: '基于 eBPF/XDP 的高性能网络防火墙系统' }],
    ['meta', { name: 'og:image', content: '/favicon.svg' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:site', content: '@rho-aias' }],
  ],

  themeConfig: {
    logo: '/favicon.svg',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Docs', link: '/guide/' },
      {
        text: 'CNB',
        link: 'https://cnb.cool/MakeCNBGreatAgain/rho-aias.git'
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '简介', link: '/guide/' },
            { text: '快速开始', link: '/guide/quick-start' },
            { text: '配置说明', link: '/guide/configuration' },
          ]
        },
        {
          text: '深入',
          items: [
            { text: '架构概览', link: '/guide/architecture' },
            { text: 'API 参考', link: '/guide/api' },
            { text: '认证授权', link: '/guide/auth' },
            { text: 'WAF 集成', link: '/guide/waf' },
            { text: '异常检测', link: '/guide/detection' },
            { text: 'SSH 防爆破', link: '/guide/failguard' },
            { text: '阻断日志', link: '/guide/blocklog' },
            { text: '数据源管理', link: '/guide/source' },
          ]
        }
      ]
    },

    socialLinks: [
      {
        icon: {
          svg: '<svg viewBox="0 0 320 320" fill="none"><path d="M228.906 40.2412C229.882 37.5108 228.906 34.3903 226.759 32.44C219.342 26.004 200.799 12.3519 173.082 10.4016C141.852 8.06121 122.528 16.4475 112.769 22.6885C108.474 25.4189 108.279 31.4649 112.183 34.3903L191.625 96.2149C198.652 101.676 208.997 98.5553 211.729 90.169L228.711 40.2412H228.906Z" fill="currentColor"/><path d="M32.9381 223.564C29.6199 225.71 28.2536 229.805 29.2295 233.511C32.1573 244.432 41.3312 266.861 66.9009 287.534C92.4706 308.012 122.725 310.353 135.607 309.963C139.511 309.963 142.829 307.427 144 303.722L194.945 142.627C198.653 130.925 185.576 121.173 175.426 127.999L32.9381 223.564Z" fill="currentColor"/><path d="M70.2169 53.4955C67.6794 52.5203 64.9468 52.7153 62.6045 53.8855C53.2355 58.9563 29.032 74.7538 16.54 107.324C6.78054 132.288 10.0987 159.982 12.8314 173.439C13.6121 177.925 18.2967 180.46 22.5908 178.705L175.424 119.026C186.354 114.735 186.354 99.3276 175.424 95.0369L70.2169 53.4955Z" fill="currentColor"/><path d="M297.03 168.968C301.519 171.893 307.57 169.358 308.351 164.092C310.303 150.05 312.06 125.866 304.057 107.338C293.321 82.9591 274.974 67.7468 266.19 61.7008C263.458 59.7505 259.749 59.9456 257.212 62.2859L218.564 96.4162C212.318 102.072 212.904 112.019 219.931 116.699L297.03 168.968Z" fill="currentColor"/><path d="M189.089 299.428C188.699 303.914 192.603 307.814 197.092 307.229C211.731 305.669 241.79 299.818 264.237 278.365C286.098 257.496 293.32 232.728 295.272 222.781C295.858 220.051 295.272 217.32 293.515 215.175L225.98 131.897C218.758 122.925 204.119 127.411 203.143 138.918L189.089 299.233V299.428Z" fill="currentColor"/></svg>'
        },
        link: 'https://cnb.cool/MakeCNBGreatAgain/rho-aias.git'
      }
    ],

    footer: {
      message: '基于 eBPF/XDP 技术构建',
      copyright: `Copyright © 2026-${new Date().getFullYear()} 备案号：<a href="https://beian.miit.gov.cn/" target="_blank">****</a>`
    },

    search: {
      provider: 'local'
    },

    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    returnToTopLabel: '回到顶部',
    outline: {
      label: '页面导航'
    },
    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },
    lastUpdated: {
      text: '最后更新于'
    }
  }
})
