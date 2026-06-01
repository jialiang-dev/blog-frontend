import { ref, computed } from 'vue'

/**
 * 解析 markdown 文件的 frontmatter（手写，零依赖）
 * 格式: ---\nkey: value\n---\n\ncontent
 */
function parseFrontmatter(raw) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/)
  if (!match) {
    return { meta: {}, content: raw }
  }
  const metaBlock = match[1]
  const content = match[2]
  const meta = {}
  for (const line of metaBlock.split('\n')) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue
    const key = line.slice(0, colonIdx).trim()
    let value = line.slice(colonIdx + 1).trim()
    // 去掉引号
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    // 数组: [a, b, c]
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean)
    } else {
      meta[key] = value
    }
  }
  return { meta, content }
}

// Vite glob: 静态导入所有 .md 文件
const modules = import.meta.glob('/content/posts/*.md', { query: '?raw', import: 'default' })

// 缓存解析结果
const postsCache = ref(null)

export function usePosts() {
  const posts = ref([])
  const loading = ref(true)

  async function load() {
    if (postsCache.value) {
      posts.value = postsCache.value
      loading.value = false
      return
    }
    const results = []
    for (const [path, loader] of Object.entries(modules)) {
      const raw = await loader()
      const slug = path.split('/').pop().replace('.md', '')
      const { meta, content } = parseFrontmatter(raw)
      results.push({
        slug,
        title: meta.title || slug,
        date: meta.date || '',
        summary: meta.summary || '',
        tags: meta.tags || [],
        content,
      })
    }
    // 按日期降序
    results.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    postsCache.value = results
    posts.value = results
    loading.value = false
  }

  function getBySlug(slug) {
    return posts.value.find(p => p.slug === slug) || null
  }

  // 初始加载
  load()

  return { posts, loading, getBySlug, reload: load }
}
