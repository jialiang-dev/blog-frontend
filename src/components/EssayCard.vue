<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  post: { type: Object, required: true },
  index: { type: Number, default: 0 },
})

const router = useRouter()

function go() {
  router.push(`/essays/${props.post.slug}`)
}

// 格式化日期
function fmt(date) {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()} · ${String(d.getMonth() + 1).padStart(2, '0')} · ${String(d.getDate()).padStart(2, '0')}`
}
</script>

<template>
  <article class="card" :style="{ animationDelay: index * 0.08 + 's' }" @click="go">
    <time class="card-date">{{ fmt(post.date) }}</time>
    <h2 class="card-title">{{ post.title }}</h2>
    <p class="card-summary">{{ post.summary }}</p>
    <div class="card-footer">
      <span v-for="t in post.tags" :key="t" class="card-tag">{{ t }}</span>
      <span class="card-arrow">→</span>
    </div>
  </article>
</template>

<style scoped>
.card {
  padding: 28px 0;
  cursor: pointer;
  border-bottom: 1px solid #e7e5e4;
  animation: fade-up 0.5s ease both;
  transition: padding-left 0.3s ease;
}
.card:hover {
  padding-left: 16px;
}
.card:last-child {
  border-bottom: none;
}

.card-date {
  display: block;
  font-size: 0.78rem;
  color: #a8a29e;
  letter-spacing: 0.04em;
  margin-bottom: 8px;
  font-family: "JetBrains Mono", "Fira Code", monospace;
}

.card-title {
  font-family: "PingFang SC", -apple-system, sans-serif;
  font-size: 1.3rem;
  font-weight: 650;
  letter-spacing: -0.01em;
  margin: 0 0 8px;
  color: #1c1917;
  transition: color 0.2s;
}
.card:hover .card-title { color: #2563eb; }

.card-summary {
  font-size: 0.92rem;
  line-height: 1.65;
  color: #78716c;
  margin: 0 0 12px;
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 8px;
}
.card-tag {
  font-size: 0.7rem;
  font-weight: 550;
  color: #78716c;
  background: #f5f5f4;
  padding: 3px 10px;
  border-radius: 6px;
  letter-spacing: 0.03em;
}
.card-arrow {
  margin-left: auto;
  font-size: 0.9rem;
  color: #d6d3d1;
  transition: transform 0.25s ease, color 0.2s;
}
.card:hover .card-arrow {
  transform: translateX(4px);
  color: #2563eb;
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
