import DefaultTheme from 'vitepress/theme'
import './style.css'

export default DefaultTheme

// Hero 区域彗星扫描线和红色亮点效果
if (typeof window !== 'undefined') {
  let initialized = false
  let container: HTMLDivElement | null = null

  function createCometEffect(hero: Element) {
    // 清理旧效果
    document.querySelectorAll('.hero-comet-container').forEach(el => el.remove())

    // 创建容器
    container = document.createElement('div')
    container.className = 'hero-comet-container'
    hero.appendChild(container)

    // 创建彗星（只有一条渐变线）
    const comet = document.createElement('div')
    comet.className = 'hero-comet'
    container.appendChild(comet)

    initialized = true

    // 启动亮点生成
    scheduleSparks()
  }

  function scheduleSparks() {
    // 每轮生成 5-10 个亮点
    const sparkCount = 5 + Math.floor(Math.random() * 6)

    for (let i = 0; i < sparkCount; i++) {
      setTimeout(() => {
        createSpark()
      }, Math.random() * 5000)
    }

    // 每 5 秒一轮
    setTimeout(scheduleSparks, 5000)
  }

  function createSpark() {
    if (!container) return

    const spark = document.createElement('div')
    spark.className = 'hero-spark'
    spark.style.left = `${Math.random() * 100}%`
    spark.style.top = `${Math.random() * 100}%`
    container.appendChild(spark)

    // 1.2秒后移除
    setTimeout(() => spark.remove(), 1200)
  }

  function init() {
    const hero = document.querySelector('.VPHero')
    if (hero && !initialized) {
      createCometEffect(hero)
    }
  }

  window.addEventListener('load', init)

  window.addEventListener('hashchange', () => {
    initialized = false
    document.querySelectorAll('.hero-comet-container').forEach(el => el.remove())
    setTimeout(init, 100)
  })
}
