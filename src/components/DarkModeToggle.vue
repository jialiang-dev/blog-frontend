<script setup>
import { useDarkMode } from '../composables/useDarkMode.js'

const { isDark, toggle } = useDarkMode()
</script>

<template>
  <Teleport to="body">
    <button
      class="dark-toggle"
      :title="isDark ? '切换亮色模式' : '切换夜间模式'"
      @click="toggle"
    >
      <span class="icon" :class="{ hide: isDark }">🌙</span>
      <span class="icon" :class="{ hide: !isDark }">☀️</span>
    </button>
  </Teleport>
</template>

<style scoped>
.dark-toggle {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 9999;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--border-primary);
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: background 0.3s, border-color 0.3s, box-shadow 0.3s, transform 0.2s;
}

.dark-toggle:hover {
  transform: scale(1.08);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.icon {
  position: absolute;
  transition: opacity 0.25s, transform 0.25s;
}

.icon.hide {
  opacity: 0;
  transform: rotate(90deg) scale(0.6);
}

@media (max-width: 640px) {
  .dark-toggle {
    bottom: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
}
</style>
