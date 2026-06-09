<script setup>
import { useDarkMode } from './composables/useDarkMode.js'
import DarkModeToggle from './components/DarkModeToggle.vue'

useDarkMode()
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <transition name="fade" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
  <DarkModeToggle />
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
