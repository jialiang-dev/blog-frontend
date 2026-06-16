<script setup>
import { onMounted } from 'vue'
import { useHead } from '@unhead/vue'
import { usePosts } from '../composables/usePosts.js'
import EssayCard from '../components/EssayCard.vue'

const { posts, loading, reload } = usePosts()

useHead({
  title: '随笔 - Alvin Shan',
  meta: [
    { name: 'description', content: 'Alvin Shan 的技术沉淀、股票市场观察与生活随想。' },
    { property: 'og:title', content: '随笔 - Alvin Shan' },
    { property: 'og:description', content: 'Alvin Shan 的技术沉淀、股票市场观察与生活随想。' },
    { property: 'og:url', content: 'https://jialiang.dev/essays' },
    { name: 'twitter:title', content: '随笔 - Alvin Shan' },
    { name: 'twitter:description', content: 'Alvin Shan 的技术沉淀、股票市场观察与生活随想。' },
  ],
})

onMounted(() => {
  if (!posts.value.length) reload()
})
</script>

<template>
  <div class="page">
    <header class="header">
      <router-link to="/" class="back">← 返回</router-link>
      <h1 class="page-title">随笔</h1>
      <p class="page-desc">技术沉淀、市场观察与生活随想。</p>
    </header>

    <main class="list">
      <div v-if="loading" class="loading">加载中...</div>
      <template v-else>
        <EssayCard v-for="(post, i) in posts" :key="post.slug" :post="post" :index="i" />
        <div v-if="posts.length === 0" class="empty">
          还没有文章。<br />在 <code>content/posts/</code> 下创建一个 <code>.md</code> 文件吧。
        </div>
      </template>
    </main>

    <router-link to="/" class="home-link">返回首页</router-link>
  </div>
</template>

<style scoped>
.page {
  max-width: 680px;
  margin: 0 auto;
  padding: 100px 24px 80px;
  min-height: 100vh;
  font-family: "PingFang SC", -apple-system, sans-serif;
  background: var(--bg-primary);
}

.header { margin-bottom: 48px; }
.back {
  font-size: 0.85rem;
  color: var(--text-light);
  text-decoration: none;
  transition: color 0.2s;
}
.back:hover { color: #292524; }

.page-title {
  font-size: 2.2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 16px 0 8px;
  color: var(--text-heading);
}
.page-desc {
  font-size: 0.95rem;
  color: var(--text-muted);
  margin: 0;
}

.list { margin-bottom: 48px; }

.loading, .empty {
  text-align: center;
  color: var(--text-light);
  padding: 60px 0;
  font-size: 0.92rem;
  line-height: 1.8;
}
.empty code {
  background: var(--bg-code-inline);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.88em;
}

.home-link {
  display: block;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-light);
  text-decoration: none;
  transition: color 0.2s;
}
.home-link:hover { color: #292524; }
</style>
