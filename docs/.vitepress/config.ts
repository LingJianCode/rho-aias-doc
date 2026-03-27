import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'rho-aias',
  description: '基于 eBPF/XDP 的高性能网络防火墙系统',

  vite: {
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: [
        '.cnb.run'
      ]
    }
  },

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#0f0f1a' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:title', content: 'rho-aias' }],
    ['meta', { name: 'og:description', content: '基于 eBPF/XDP 的高性能网络防火墙系统' }],
    ['meta', { name: 'og:image', content: '/favicon.svg' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
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
            { text: 'WAF 集成', link: '/guide/waf' },
            { text: '异常检测', link: '/guide/detection' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://cnb.cool/MakeCNBGreatAgain/rho-aias.git' }
    ],

    footer: {
      message: '基于 eBPF/XDP 技术构建',
      copyright: '© 2025 rho-aias Contributors'
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
