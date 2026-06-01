<script setup>
import { onMounted } from 'vue'
import { usePosts } from '../composables/usePosts.js'
import EssayCard from '../components/EssayCard.vue'

const { posts, loading, reload } = usePosts()

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
}

.header { margin-bottom: 48px; }
.back {
  font-size: 0.85rem;
  color: #a8a29e;
  text-decoration: none;
  transition: color 0.2s;
}
.back:hover { color: #292524; }

.page-title {
  font-size: 2.2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 16px 0 8px;
  color: #1c1917;
}
.page-desc {
  font-size: 0.95rem;
  color: #78716c;
  margin: 0;
}

.list { margin-bottom: 48px; }

.loading, .empty {
  text-align: center;
  color: #a8a29e;
  padding: 60px 0;
  font-size: 0.92rem;
  line-height: 1.8;
}
.empty code {
  background: #f5f5f4;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.88em;
}

.home-link {
  display: block;
  text-align: center;
  font-size: 0.85rem;
  color: #a8a29e;
  text-decoration: none;
  transition: color 0.2s;
}
.home-link:hover { color: #292524; }
</style>
