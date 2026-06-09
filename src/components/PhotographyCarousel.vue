<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    required: true
  },
  interval: {
    type: Number,
    default: 4000
  }
})

const currentIndex = ref(0)
let timer = null

function goTo(index) {
  currentIndex.value = index
  resetTimer()
}

function prev() {
  currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length
  resetTimer()
}

function next() {
  currentIndex.value = (currentIndex.value + 1) % props.images.length
  resetTimer()
}

function resetTimer() {
  clearInterval(timer)
  timer = setInterval(next, props.interval)
}

function pause() {
  clearInterval(timer)
}

function resume() {
  timer = setInterval(next, props.interval)
}

onMounted(() => {
  timer = setInterval(next, props.interval)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<template>
  <div
    class="relative overflow-hidden rounded-3xl bg-white dark:bg-stone-800 shadow-sm group"
    @mouseenter="pause"
    @mouseleave="resume"
  >
    <div class="relative aspect-[16/9] md:aspect-[21/9] bg-slate-200 dark:bg-stone-700 overflow-hidden">
      <Transition name=fade mode="out-in">
        <img
          :key="currentIndex"
          :src="images[currentIndex].url"
          :alt="images[currentIndex].title || '摄影作品'"
          class="absolute inset-0 w-full h-full object-cover"
        />
      </Transition>

      <button
        @click="prev"
        class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white dark:bg-stone-700 dark:hover:bg-stone-600 text-slate-700 dark:text-stone-300 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:scale-110"
        aria-label="上一张"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
      </button>

      <button
        @click="next"
        class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white dark:bg-stone-700 dark:hover:bg-stone-600 text-slate-700 dark:text-stone-300 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:scale-110"
        aria-label="下一张"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
      </button>

      <div class="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs font-mono">
        {{ currentIndex + 1 }} / {{ images.length }}
      </div>
    </div>

    <div class="px-6 py-4 flex items-center justify-between">
      <div>
        <h3 class="font-bold text-lg">📷 摄影作品</h3>
        <p v-if="images[currentIndex].title" class="text-sm text-slate-500 dark:text-stone-400 mt-0.5">{{ images[currentIndex].title }}</p>
      </div>
      <div class="flex gap-2">
        <button
          v-for="(_, index) in images"
          :key="index"
          @click="goTo(index)"
          class="w-2.5 h-2.5 rounded-full transition-all duration-300"
          :class="index === currentIndex ? 'bg-blue-600 scale-125' : 'bg-slate-300 hover:bg-slate-400 dark:bg-stone-600 dark:hover:bg-stone-500'"
          :aria-label="`第 ${index + 1} 张`"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
