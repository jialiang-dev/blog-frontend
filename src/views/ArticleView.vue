<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'
import { usePosts } from '../composables/usePosts.js'
import MarkdownRenderer from '../components/MarkdownRenderer.vue'

const route = useRoute()
const router = useRouter()
const { getBySlug } = usePosts()

const post = computed(() => getBySlug(route.params.slug))

const title = computed(() => post.value ? `${post.value.title} - Alvin Shan` : '文章不存在 - Alvin Shan')
const description = computed(() => post.value?.summary || 'Alvin Shan 的个人博客随笔')
const url = computed(() => `https://jialiang.dev/essays/${route.params.slug}`)
const ldJson = computed(() => post.value ? JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  'headline': post.value.title,
  'description': post.value.summary,
  'datePublished': post.value.date,
  'author': { '@type': 'Person', 'name': 'Alvin Shan' },
  'url': url.value,
}) : '')

useHead({
  title,
  meta: [
    { name: 'description', content: description },
    { property: 'og:type', content: 'article' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
  ],
})

function fmt(date) {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`
}
</script>

<template>
  <div class="page">
    <!-- 不存在 -->
    <div v-if="!post" class="not-found">
      <h2>文章不存在</h2>
      <p>没有找到这篇随笔。</p>
      <router-link to="/essays">← 返回随笔列表</router-link>
    </div>

    <!-- 文章 -->
    <template v-else>
      <!-- JSON-LD 结构化数据（模板直出，不经过 unhead） -->
      <component :is="'script'" type="application/ld+json" v-if="ldJson">{{ ldJson }}</component>
      <header class="article-header">
        <router-link to="/essays" class="back">← 随笔</router-link>
        <h1 class="article-title">{{ post.title }}</h1>
        <div class="article-meta">
          <time>{{ fmt(post.date) }}</time>
          <span v-for="t in post.tags" :key="t" class="article-tag">{{ t }}</span>
        </div>
      </header>

      <MarkdownRenderer :content="post.content" />

      <footer class="article-footer">
        <router-link to="/essays" class="footer-back">← 返回随笔列表</router-link>
      </footer>
    </template>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding: 100px 24px 80px;
  background: var(--bg-primary);
}

/* ── header ── */
.article-header {
  max-width: 680px;
  margin: 0 auto 48px;
}
.back {
  font-size: 0.85rem;
  color: var(--text-light);
  text-decoration: none;
  transition: color 0.2s;
}
.back:hover { color: var(--text-heading); }

.article-title {
  font-family: "PingFang SC", -apple-system, sans-serif;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 16px 0 12px;
  color: var(--text-heading);
  line-height: 1.25;
}
.article-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 0.88rem;
  color: var(--text-light);
}
.article-tag {
  font-size: 0.72rem;
  font-weight: 550;
  color: var(--text-muted);
  background: var(--bg-code-inline);
  padding: 2px 10px;
  border-radius: 6px;
  letter-spacing: 0.03em;
}

/* ── footer ── */
.article-footer {
  max-width: 680px;
  margin: 64px auto 0;
  padding-top: 32px;
  border-top: 1px solid #e7e5e4;
}
.footer-back {
  font-size: 0.9rem;
  color: var(--text-light);
  text-decoration: none;
  transition: color 0.2s;
}
.footer-back:hover { color: var(--text-heading); }

/* ── not found ── */
.not-found {
  max-width: 400px;
  margin: 120px auto;
  text-align: center;
  color: var(--text-muted);
}
.not-found h2 { color: var(--text-heading); margin-bottom: 8px; }
.not-found a { color: #2563eb; text-decoration: none; }
</style>
