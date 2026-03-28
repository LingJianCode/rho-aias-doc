import DefaultTheme from 'vitepress/theme'
import { onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import { useRoute } from 'vitepress'
import './style.css'

// Hero 区域彗星扫描线和红色亮点效果
let initialized = false
let container: HTMLDivElement | null = null
let sparkTimers: ReturnType<typeof setTimeout>[] = []

function cleanup() {
  // 清理所有定时器
  sparkTimers.forEach(t => clearTimeout(t))
  sparkTimers = []
  // 清理 DOM
  document.querySelectorAll('.hero-comet-container').forEach(el => el.remove())
  container = null
  initialized = false
}

function createCometEffect(hero: Element) {
  // 清理旧效果
  cleanup()

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
    const timer = setTimeout(() => {
      createSpark()
    }, Math.random() * 5000)
    sparkTimers.push(timer)
  }

  // 每 5 秒一轮
  const nextTimer = setTimeout(scheduleSparks, 5000)
  sparkTimers.push(nextTimer)
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

function initCometEffect() {
  const hero = document.querySelector('.VPHero')
  if (hero) {
    createCometEffect(hero)
  }
}

export default {
  extends: DefaultTheme,
  setup() {
    const route = useRoute()

    onMounted(() => {
      // 使用 nextTick 确保 Vue 渲染完成后再初始化
      nextTick(() => initCometEffect())
    })

    // 监听路由变化，SPA 导航时重新初始化
    watch(() => route.path, () => {
      nextTick(() => initCometEffect())
    })

    // 组件卸载时清理资源
    onBeforeUnmount(() => {
      cleanup()
    })
  }
}
