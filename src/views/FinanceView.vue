<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import api from '../api.js'

// ═══════════════════════════════════════════
// 颜色
// ═══════════════════════════════════════════
const NOTE_COLORS = [
  { value: 'slate',  label: '默认', bg: '#f1f5f9', bar: '#94a3b8' },
  { value: 'blue',   label: '分析', bg: '#eff6ff', bar: '#3b82f6' },
  { value: 'amber',  label: '关注', bg: '#fffbeb', bar: '#f59e0b' },
  { value: 'green',  label: '看好', bg: '#ecfdf5', bar: '#10b981' },
  { value: 'red',    label: '谨慎', bg: '#fef2f2', bar: '#ef4444' },
]

// ═══════════════════════════════════════════
// 自选股
// ═══════════════════════════════════════════
const WATCHLIST = [
  { code: 'sz002595', name: '豪迈科技', sinaCode: 'sz002595' },
  { code: 'sh600885', name: '宏发股份', sinaCode: 'sh600885' },
  { code: 'sh600598', name: '北大荒',   sinaCode: 'sh600598' },
  { code: 'sh601179', name: '中国西电', sinaCode: 'sh601179' },
  { code: 'sh601288', name: '农业银行', sinaCode: 'sh601288' },
  { code: 'gb_dram',  name: 'DRAM',     sinaCode: 'gb_dram' },
  { code: 'gb_msft',  name: '微软',     sinaCode: 'gb_msft' },
  { code: 'gb_pg',    name: '宝洁',     sinaCode: 'gb_pg' },
]

// 每 5 秒从后端获取个股实时行情
let stockTimer = null
async function fetchStockQuotes() {
  const codes = WATCHLIST.map(s => s.sinaCode).join(',')
  try {
    const { data } = await api.get(`/api/finance/stock-quotes?codes=${codes}`)
    if (data.code === 200 && data.data.length) {
      data.data.forEach(item => {
        if (stockData[item.code]) {
          stockData[item.code] = {
            stockCode: item.code, stockName: item.name,
            currentPrice: item.price,
            change: 0,
            changePercent: item.change,
          }
        }
      })
    }
  } catch {}
}

const stockData = reactive({})

// 初始化占位数据
WATCHLIST.forEach(s => {
  stockData[s.code] = { stockCode: s.code, stockName: s.name, currentPrice: 0, change: 0, changePercent: 0 }
})

// ═══════════════════════════════════════════
// 大盘指数（新浪财经实时数据）
// ═══════════════════════════════════════════
const indexData = reactive([])

function fmtPrice(v) {
  if (v >= 10000) return v.toLocaleString('en-US', { maximumFractionDigits: 2 })
  return Number(v).toFixed(2)
}

// 每 5 秒从后端获取实时指数（后端代理新浪财经 API）
let idxTimer = null
async function fetchIndices() {
  try {
    const { data } = await api.get('/api/finance/indices')
    if (data.code === 200 && data.data.length) {
      indexData.splice(0, indexData.length, ...data.data)
    }
  } catch { /* 后端不可用时保持上次数据 */ }
}

// ═══════════════════════════════════════════
// 财经资讯
// ═══════════════════════════════════════════
const newsItems = ref([])
async function fetchNews() {
  try {
    const { data } = await api.get('/api/finance/news')
    if (data.code === 200) newsItems.value = data.data
  } catch { /* 后端不可用 */ }
}

function fmtNewsTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${mm}-${dd} ${hh}:${min}`
}

// ═══════════════════════════════════════════
// 投资箴言
// ═══════════════════════════════════════════
const wisdomQuotes = [
  { text: '不要亏钱。', author: '沃伦·巴菲特' },
  // { text: '别人贪婪时我恐惧，别人恐惧时我贪婪。', author: '沃伦·巴菲特' },
  // { text: '市场短期是投票机，长期是称重机。', author: '本杰明·格雷厄姆' },
  // { text: '投资的本质是对未来的预测。', author: '查理·芒格' },
  // { text: '风险来自于你不知道自己在做什么。', author: '沃伦·巴菲特' },
  // { text: '复利是世界第八大奇迹。', author: '爱因斯坦（传）' },
  // { text: '在别人都绝望的时候买入，在别人都狂热的时候卖出。', author: '约翰·邓普顿' },
  // { text: '股票是最好的长期资产。', author: '杰里米·西格尔' },
]
const wisdomIdx = ref(0)
let wisdomTimer = null
function startWisdomRotation() {
  wisdomIdx.value = Math.floor(Math.random() * wisdomQuotes.length)
  wisdomTimer = setInterval(() => {
    wisdomIdx.value = (wisdomIdx.value + 1) % wisdomQuotes.length
  }, 3 * 60 * 60 * 1000) // 3 小时
}

// ═══════════════════════════════════════════
// 便利贴
// ═══════════════════════════════════════════
const NOTES_STORAGE_KEY = 'market-notes-local'

function loadLocalNotes() {
  try {
    return JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY) || '[]')
  } catch { return [] }
}

function saveLocalNotes(localNotes) {
  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(localNotes))
}

const notes = ref([])
const API = '/api/market-notes'

function isServerId(id) {
  // 服务端返回的是数字 ID，本地新建的是 'new-...' 字符串
  return typeof id === 'number' || (typeof id === 'string' && /^\d+$/.test(id))
}

async function fetchNotes() {
  const localNotes = loadLocalNotes()

  try {
    const { data } = await api.get(API)
    if (data.code === 200) {
      const serverNotes = data.data
      const serverIds = new Set(serverNotes.map(n => String(n.id)))

      // 把本地编辑过的服务端笔记 PUT 回去
      for (const ln of localNotes) {
        if (isServerId(ln.id) && serverIds.has(String(ln.id))) {
          // 本地有更新版本 → PUT 到服务端
          try {
            await api.put(`${API}/${ln.id}`, {
              title: ln.title, content: ln.content, assetCode: ln.assetCode, color: ln.color
            })
            // PUT 成功，标记为已同步，用服务端数据替代
            ln.synced = true
          } catch { /* 网络不通，保留在本地 */ }
        }
      }

      // 把纯本地笔记（new-xxx）POST 到服务端
      for (const ln of localNotes) {
        if (!isServerId(ln.id)) {
          try {
            const { data: res } = await api.post(API, {
              title: ln.title, content: ln.content, assetCode: ln.assetCode, color: ln.color
            })
            if (res.code === 200) {
              ln.id = res.data.id
              ln.createdAt = res.data.createdAt
              ln.updatedAt = res.data.updatedAt
              ln.synced = true
            }
          } catch { /* 网络不通 */ }
        }
      }

      saveLocalNotes(localNotes.filter(n => !n.synced))

      // 合并：本地未同步的 + 服务端数据
      const syncedIds = new Set(localNotes.filter(n => n.synced).map(n => String(n.id)))
      const pending = localNotes.filter(n => !n.synced)
      // 用服务端数据替换已同步的本地笔记
      const merged = serverNotes.map(sn => {
        const local = localNotes.find(ln => String(ln.id) === String(sn.id) && ln.synced)
        return local ? { ...sn, title: local.title, content: local.content, assetCode: local.assetCode, color: local.color } : sn
      })
      notes.value = [...pending, ...merged]
      return
    }
  } catch (e) {
    console.warn('后端不可用，使用本地数据', e)
  }
  notes.value = localNotes
}

function addNote() {
  notes.value.unshift({
    id: 'new-' + Date.now(),
    title: '', content: '', assetCode: '', color: 'slate',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    _new: true,
  })
}

async function saveNote(note) {
  if (!note.title?.trim() && !note.content?.trim()) {
    notes.value = notes.value.filter(n => n.id !== note.id)
    removeLocalNote(note.id)
    return
  }
  const payload = { title: note.title, content: note.content, assetCode: note.assetCode, color: note.color }
  try {
    if (note._new) {
      const { data } = await api.post(API, payload)
      if (data.code === 200) {
        Object.assign(note, data.data, { _new: false, _editing: false })
        return
      }
    } else {
      await api.put(`${API}/${note.id}`, payload)
      note._editing = false
      return
    }
  } catch (e) {
    console.warn('保存到服务端失败，暂存本地', e)
  }
  // 网络不通 — 存到 localStorage
  note._new = false
  note._editing = false
  note.updatedAt = new Date().toISOString()
  upsertLocalNote(note)
}

function upsertLocalNote(note) {
  const local = loadLocalNotes()
  const idx = local.findIndex(n => n.id === note.id)
  const plain = { id: note.id, title: note.title, content: note.content, assetCode: note.assetCode, color: note.color, createdAt: note.createdAt, updatedAt: note.updatedAt }
  if (idx >= 0) local[idx] = plain
  else local.unshift(plain)
  saveLocalNotes(local)
}

function removeLocalNote(id) {
  saveLocalNotes(loadLocalNotes().filter(n => n.id !== id))
}

async function deleteNote(note) {
  try {
    await api.delete(`${API}/${note.id}`)
  } catch {}
  notes.value = notes.value.filter(n => n.id !== note.id)
  removeLocalNote(note.id)
}

function setNoteColor(note, color) {
  note.color = color
  if (!note._new) saveNote(note)
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins} 分钟前`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} 小时前`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days} 天前`
  return `${Math.floor(days / 30)} 个月前`
}

// ═══════════════════════════════════════════
// 生命周期
// ═══════════════════════════════════════════
// 页面不可见时彻底停掉轮询和动画，切回来再恢复
function startStockPoll() {
  fetchStockQuotes()
  stockTimer = setInterval(fetchStockQuotes, 5000)
}
function startIndexPoll() {
  fetchIndices()
  idxTimer = setInterval(fetchIndices, 5000)
}
function stopAllPolls() {
  if (stockTimer) { clearInterval(stockTimer); stockTimer = null }
  if (idxTimer) { clearInterval(idxTimer); idxTimer = null }
}

// 暂停/恢复 ticker 滚动动画
const tickerEl = ref(null)
function pauseTicker(pause) {
  const el = tickerEl.value
  if (el) el.style.animationPlayState = pause ? 'paused' : 'running'
}

function onVisibilityChange() {
  if (document.hidden) {
    stopAllPolls()
    pauseTicker(true)
  } else {
    startStockPoll()
    startIndexPoll()
    pauseTicker(false)
  }
}

onMounted(() => {
  startStockPoll()
  startIndexPoll()
  startWisdomRotation()
  fetchNotes()
  fetchNews()
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onUnmounted(() => {
  stopAllPolls()
  clearInterval(wisdomTimer); wisdomTimer = null
  document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<template>
  <div class="finance-page">

    <!-- 顶栏 -->
    <header class="topbar">
      <router-link to="/" class="back-link">← 返回</router-link>
      <span class="page-label">Market</span>
    </header>

    <!-- ══════ 大盘观察 ══════ -->
    <section class="section">
      <h2 class="section-title">大盘观察</h2>

      <!-- 指数滚动条 -->
      <div class="index-ticker">
        <div ref="tickerEl" class="index-ticker-inner">
          <span v-for="idx in indexData" :key="idx.name" class="idx-item">
            <span class="idx-name">{{ idx.name }}</span>
            <span class="idx-price">{{ fmtPrice(idx.price) }}</span>
            <span class="idx-change" :class="idx.change >= 0 ? 'up' : 'down'">
              {{ idx.change >= 0 ? '+' : '' }}{{ idx.change }}%
            </span>
          </span>
          <span v-for="idx in indexData" :key="'d-'+idx.name" class="idx-item">
            <span class="idx-name">{{ idx.name }}</span>
            <span class="idx-price">{{ fmtPrice(idx.price) }}</span>
            <span class="idx-change" :class="idx.change >= 0 ? 'up' : 'down'">
              {{ idx.change >= 0 ? '+' : '' }}{{ idx.change }}%
            </span>
          </span>
        </div>
      </div>

    </section>

    <!-- ══════ 投资箴言 ══════ -->
    <section class="section wisdom-section">
      <div class="wisdom-block">
        <p class="wisdom-text">{{ wisdomQuotes[wisdomIdx].text }}</p>
        <p class="wisdom-author">— {{ wisdomQuotes[wisdomIdx].author }}</p>
      </div>
    </section>

    <!-- ══════ 自选股卡片 ══════ -->
    <section class="section">
      <h2 class="section-title">自选股</h2>
      <p class="section-desc">实时行情 · 新浪财经数据</p>

      <div class="stock-cards">
        <div v-for="s in WATCHLIST" :key="s.code" class="stock-card">
          <div class="sc-top">
            <div class="sc-info">
              <span class="sc-name">{{ stockData[s.code]?.stockName || s.name }}</span>
              <span class="sc-code">{{ s.code.replace(/^(sz|sh)/, '').replace(/^gb_/, '').toUpperCase() }}</span>
            </div>
            <div class="sc-price-block">
              <span class="sc-price">{{ (stockData[s.code]?.currentPrice || 0).toFixed(2) }}</span>
              <span class="sc-change" :class="(stockData[s.code]?.changePercent || 0) >= 0 ? 'up' : 'down'">
                {{ (stockData[s.code]?.changePercent || 0) >= 0 ? '+' : '' }}{{ (stockData[s.code]?.changePercent || 0).toFixed(2) }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════ 便利贴 ══════ -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">快评 · 便利贴</h2>
        <button class="btn-add" @click="addNote">+ 新建</button>
      </div>

      <div class="notes-grid" v-if="notes.length">
        <div
          v-for="note in notes" :key="note.id"
          class="note-card"
          :style="{ '--note-bg': NOTE_COLORS.find(c => c.value === note.color)?.bg || '#f1f5f9',
                   '--note-bar': NOTE_COLORS.find(c => c.value === note.color)?.bar || '#94a3b8' }"
        >
          <div class="note-bar" />
          <div class="note-body">
            <template v-if="note._editing || note._new">
              <input v-model="note.title" class="note-input-title" placeholder="标题（可选）" @keydown.enter="saveNote(note)" />
              <input v-model="note.assetCode" class="note-input-code" placeholder="资产代码（如 IXIC、600519）" @keydown.enter="saveNote(note)" />
              <textarea v-model="note.content" class="note-textarea" placeholder="写点什么..." rows="3" @keydown.escape="note._editing=false; note._new&&deleteNote(note)" />
              <div class="note-actions">
                <div class="note-colors">
                  <button v-for="c in NOTE_COLORS" :key="c.value"
                    class="color-dot" :class="{ active: note.color === c.value }"
                    :style="{ background: c.bar }" :title="c.label"
                    @click="setNoteColor(note, c.value)" />
                </div>
                <div class="note-action-btns">
                  <button class="note-btn-cancel" @click="note._new ? deleteNote(note) : (note._editing = false)">取消</button>
                  <button class="note-btn-save" @click="saveNote(note)">保存</button>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="note-top">
                <span v-if="note.assetCode" class="note-asset">{{ note.assetCode }}</span>
                <button class="note-delete" @click="deleteNote(note)" title="删除">×</button>
              </div>
              <div v-if="note.title" class="note-title-display">{{ note.title }}</div>
              <div class="note-content-display" @click="note._editing = true">{{ note.content || '点击编辑...' }}</div>
              <div class="note-time">{{ timeAgo(note.updatedAt) }}</div>
            </template>
          </div>
        </div>
      </div>
      <div v-else class="notes-empty" @click="addNote">
        还没有快评。点击这里创建第一条。
      </div>
    </section>

    <!-- ══════ 财经资讯 ══════ -->
    <section class="section">
      <h2 class="section-title">财经资讯</h2>
      <p class="section-desc">华尔街见闻 · 每 30 分钟更新</p>
      <div class="news-list" v-if="newsItems.length">
        <a v-for="n in newsItems" :key="n.id"
           :href="n.url" target="_blank" class="news-row"
        >
          <span class="news-source">{{ n.source }}</span>
          <span class="news-title">{{ n.title }}</span>
          <span class="news-time">{{ fmtNewsTime(n.publishedAt) }}</span>
        </a>
      </div>
      <div v-else class="notes-empty">暂无资讯，等待后端抓取...</div>
    </section>

    <footer class="page-footer">
      <router-link to="/">← 返回首页</router-link>
      <span class="footer-note">数据延迟约 2 秒 · 仅供个人参考</span>
    </footer>
  </div>
</template>

<style scoped>

html.dark .note-card {
  --note-bg: var(--bg-card);
}

/* ═══════════════════════════════════════════
   页面基调 — 比摄影/随笔略深，沉稳
   ═══════════════════════════════════════════ */
.finance-page {
  min-height: 100vh;
  background: var(--bg-secondary);
  color: var(--text-heading);
  font-family: "PingFang SC", -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ── 顶栏 ── */
.topbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  padding: 18px 28px;
  display: flex; align-items: center; justify-content: space-between;
}
.back-link {
  font-size: 0.88rem; color: var(--text-muted);
  text-decoration: none; transition: color 0.2s;
}
.back-link:hover { color: var(--text-primary); }
.page-label {
  font-size: 0.72rem; font-weight: 650;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--text-light);
}

/* ── 分区 ── */
.section {
  max-width: 1100px; margin: 0 auto;
  padding: 0 28px 60px;
}
.section:first-of-type { padding-top: 90px; }
.section-title {
  font-size: 1.4rem; font-weight: 700;
  letter-spacing: -0.01em;
  margin: 0 0 8px; color: var(--text-heading);
}
.section-desc {
  font-size: 0.85rem; color: var(--text-light);
  margin: 0 0 24px;
}
.section-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 4px;
}

/* ── 大盘：指数滚动条 ── */
.index-ticker {
  background: var(--bg-ticker); border-radius: 12px;
  padding: 10px 0; margin-bottom: 20px;
  overflow: hidden;
  position: relative;
}
.index-ticker-inner {
  display: flex;
  width: max-content;
  animation: ticker-scroll 50s linear infinite;
  will-change: transform;
  contain: layout style paint;
}
.idx-item {
  display: inline-flex; align-items: baseline; gap: 8px;
  padding: 0 24px; white-space: nowrap;
  border-right: 1px solid rgba(255,255,255,0.08);
}
.idx-name {
  font-size: 0.8rem; font-weight: 600;
  color: rgba(255,255,255,0.5);
  letter-spacing: 0.03em;
}
.idx-price {
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 0.88rem; font-weight: 600;
  color: rgba(255,255,255,0.85);
}
.idx-change {
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 0.82rem; font-weight: 650;
}
.idx-change.up { color: var(--accent-red); }
.idx-change.down { color: var(--accent-green); }

@keyframes ticker-scroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

/* ── 投资箴言 ── */
.wisdom-section {
  text-align: center;
  padding-top: 60px; padding-bottom: 60px;
}
.wisdom-block {
  max-width: 540px; margin: 0 auto;
  padding: 40px 32px;
}
.wisdom-text {
  font-family: "Noto Serif SC", "Source Han Serif SC", Georgia, "Times New Roman", serif;
  font-size: 1.35rem; line-height: 1.9;
  color: var(--text-heading); margin: 0 0 18px;
  font-style: italic; letter-spacing: 0.02em;
}
.wisdom-author {
  font-size: 0.85rem; color: var(--text-light);
  margin: 0; letter-spacing: 0.04em;
}

/* ── 股票卡片 ── */
.stock-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px; margin-top: 12px;
}
.stock-card {
  background: var(--bg-card); border-radius: 14px;
  border: 1px solid var(--border-card);
  padding: 18px 20px 12px;
}
.sc-top {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 8px;
}
.sc-info { display: flex; flex-direction: column; gap: 2px; }
.sc-name { font-size: 0.92rem; font-weight: 650; color: var(--text-heading); }
.sc-code {
  font-family: "JetBrains Mono", monospace;
  font-size: 0.73rem; color: var(--text-light);
}
.sc-price-block { text-align: right; }
.sc-price {
  font-family: "JetBrains Mono", monospace;
  font-size: 1rem; font-weight: 650; color: var(--text-heading);
  display: block;
}
.sc-change {
  font-family: "JetBrains Mono", monospace;
  font-size: 0.82rem; font-weight: 600;
}
.sc-change.up { color: var(--accent-red); }
.sc-change.down { color: var(--accent-green); }

/* ── 便利贴 ── */
.btn-add {
  background: none; border: 1px solid var(--border-light);
  color: var(--text-muted); font-size: 0.82rem;
  padding: 6px 16px; border-radius: 8px;
  cursor: pointer; transition: all 0.2s;
}
.btn-add:hover { border-color: var(--text-light); color: var(--text-heading); }

.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px; margin-top: 16px;
}

.note-card {
  background: var(--note-bg, #f1f5f9);
  border-radius: 12px;
  border: 1px solid var(--border-card);
  display: flex; overflow: hidden;
  transition: box-shadow 0.2s, transform 0.2s;
}
.note-card:hover { box-shadow: 0 2px 12px var(--shadow-card); }
.note-bar {
  width: 4px; flex-shrink: 0;
  background: var(--note-bar, #94a3b8);
  border-radius: 2px 0 0 2px;
}
.note-body { flex: 1; padding: 14px 16px; min-width: 0; }

/* 展示态 */
.note-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.note-asset {
  font-size: 0.68rem; font-weight: 650; letter-spacing: 0.06em;
  color: var(--text-muted); background: rgba(0,0,0,0.06);
  padding: 2px 8px; border-radius: 4px;
}
.note-delete {
  background: none; border: none; color: var(--text-light);
  font-size: 1rem; cursor: pointer; padding: 0 2px; line-height: 1;
  opacity: 0; transition: opacity 0.2s;
}
.note-card:hover .note-delete { opacity: 1; }
.note-title-display {
  font-size: 0.9rem; font-weight: 650; color: var(--text-heading);
  margin-bottom: 4px;
}
.note-content-display {
  font-size: 0.87rem; line-height: 1.6; color: var(--text-secondary);
  cursor: text; white-space: pre-wrap;
}
.note-time {
  font-size: 0.7rem; color: var(--text-light);
  margin-top: 8px; letter-spacing: 0.03em;
}

/* 编辑态 */
.note-input-title {
  width: 100%; border: none; background: transparent;
  font-size: 0.9rem; font-weight: 650; color: var(--text-heading);
  outline: none; padding: 0; margin-bottom: 4px;
}
.note-input-code {
  width: 100%; border: none; background: transparent;
  font-size: 0.75rem; color: var(--text-muted); outline: none;
  padding: 0; margin-bottom: 6px;
  font-family: "JetBrains Mono", monospace;
}
.note-textarea {
  width: 100%; border: none; background: transparent;
  font-size: 0.87rem; line-height: 1.6; color: var(--text-secondary);
  outline: none; resize: none; padding: 0;
  font-family: inherit;
}
.note-actions {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 10px; gap: 8px;
}
.note-colors { display: flex; gap: 6px; }
.color-dot {
  width: 16px; height: 16px; border-radius: 50%;
  border: 2px solid transparent; cursor: pointer;
  transition: transform 0.15s;
}
.color-dot:hover { transform: scale(1.2); }
.color-dot.active { border-color: var(--text-heading); transform: scale(1.15); }
.note-action-btns { display: flex; gap: 6px; }
.note-btn-cancel {
  font-size: 0.78rem; color: var(--text-light);
  background: none; border: none; cursor: pointer; padding: 4px 8px;
}
.note-btn-save {
  font-size: 0.78rem; font-weight: 600; color: var(--bg-primary);
  background: var(--bg-ticker); border: none;
  padding: 4px 14px; border-radius: 6px; cursor: pointer;
}

.notes-empty {
  margin-top: 16px; padding: 48px;
  text-align: center; color: var(--text-light); font-size: 0.9rem;
  border: 2px dashed var(--border-light); border-radius: 14px;
  cursor: pointer; transition: border-color 0.2s;
}
.notes-empty:hover { border-color: var(--text-light); }

/* ── 财经资讯 ── */
.news-list {
  background: var(--bg-card); border-radius: 14px;
  border: 1px solid var(--border-card);
  overflow-y: auto;
  max-height: 440px;  /* 约 10 条可见，其余滚动 */
  scrollbar-width: thin;
  scrollbar-color: var(--border-light) transparent;
}
.news-row {
  display: grid;
  grid-template-columns: 90px 1fr 80px;
  align-items: center; gap: 12px;
  padding: 12px 20px;
  text-decoration: none;
  border-bottom: 1px solid var(--border-primary);
  transition: background 0.15s;
}
.news-row:last-child { border-bottom: none; }
.news-row:hover { background: var(--bg-news-hover); }
.news-source {
  font-size: 0.72rem; font-weight: 650;
  color: var(--text-light); letter-spacing: 0.04em;
  text-transform: uppercase; white-space: nowrap;
}
.news-title {
  font-size: 0.88rem; color: var(--text-secondary);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.news-row:hover .news-title { color: var(--link); }
.news-time {
  font-size: 0.75rem; color: var(--text-light);
  text-align: right; white-space: nowrap;
}


/* ── 页脚 ── */
.page-footer {
  max-width: 1100px; margin: 0 auto;
  padding: 32px 28px 60px;
  display: flex; justify-content: space-between; align-items: center;
  border-top: 1px solid var(--border-light);
}
.page-footer a { font-size: 0.85rem; color: var(--text-muted); text-decoration: none; }
.page-footer a:hover { color: var(--text-heading); }
.footer-note { font-size: 0.78rem; color: var(--text-light); }

/* ── 响应式 ── */
@media (max-width: 768px) {
  .topbar { padding: 14px 18px; }
  .section { padding: 0 18px 40px; }
  .section:first-of-type { padding-top: 80px; }
  .notes-grid { grid-template-columns: 1fr; }
  .stock-cards { grid-template-columns: 1fr; }
  .page-footer { flex-direction: column; gap: 8px; text-align: center; }
}
</style>
