import { ref, onMounted, onUnmounted } from 'vue'

const STORAGE_KEY = 'blog-dark-mode'

function getInitialValue() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored !== null) return stored === 'true'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

const isDark = ref(getInitialValue())

function apply(isDarkValue) {
  document.documentElement.classList.toggle('dark', isDarkValue)
}

function toggle() {
  isDark.value = !isDark.value
  apply(isDark.value)
  localStorage.setItem(STORAGE_KEY, isDark.value)
}

let mq = null
function handleChange(e) {
  // 只在用户没有手动设置过的时候跟随系统
  if (localStorage.getItem(STORAGE_KEY) === null) {
    isDark.value = e.matches
    apply(isDark.value)
  }
}

export function useDarkMode() {
  onMounted(() => {
    apply(isDark.value)
    mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', handleChange)
  })

  onUnmounted(() => {
    if (mq) mq.removeEventListener('change', handleChange)
  })

  return { isDark, toggle }
}
