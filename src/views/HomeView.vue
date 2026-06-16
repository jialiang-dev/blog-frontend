<template>
  <div class="home">
    <!-- 背景光晕 — 直接 DOM 操作，不走 Vue 响应式 -->
    <div id="glow" class="glow"></div>

    <!-- 左侧 -->
    <section class="left fade-in">
      <div class="status">
        <span class="dot"></span>
        <span>ONLINE</span>
      </div>

      <h1>Alvin Shan</h1>

      <p class="role">
        Developer / Photographer / Observer
      </p>

      <p class="intro">
        记录市场、城市、摄影与生活。
      </p>

      <div class="links">
        <a href="#" @click.prevent="copyWechat" title="点击复制微信号">WeChat</a>
        <a href="mailto:shanjialiang2001@gmail.com">Email</a>
      </div>
    </section>

    <!-- 右侧 -->
    <section class="right fade-in-delay">
      <RouterLink
        to="/essays"
        class="nav-card"
      >
        <span class="index">01</span>

        <div class="content">
          <h2>随笔</h2>
          <p>记录一些胡思乱想</p>
        </div>

        <span class="arrow">↗</span>
      </RouterLink>

      <RouterLink
        to="/Photography"
        class="nav-card"
      >
        <span class="index">02</span>

        <div class="content">
          <h2>摄影</h2>
          <p>城市、街道与光影</p>
        </div>

        <span class="arrow">↗</span>
      </RouterLink>

      <RouterLink
        to="/Finance"
        class="nav-card"
      >
        <span class="index">03</span>

        <div class="content">
          <h2>股票</h2>
          <p>市场、风险与机会</p>
        </div>

        <span class="arrow">↗</span>
      </RouterLink>
    </section>

    <!-- 底部 -->
    <footer class="footer">
      <span>{{ footerText }}</span>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useHead } from '@unhead/vue'

useHead({
  title: 'Alvin Shan - 技术、市场与摄影',
  meta: [
    { name: 'description', content: 'Alvin Shan 的个人博客，记录技术沉淀、股票市场观察、城市摄影与生活随想。' },
    { property: 'og:title', content: 'Alvin Shan - 技术、市场与摄影' },
    { property: 'og:description', content: 'Alvin Shan 的个人博客，记录技术沉淀、股票市场观察、城市摄影与生活随想。' },
    { property: 'og:url', content: 'https://jialiang.dev/' },
    { name: 'twitter:title', content: 'Alvin Shan - 技术、市场与摄影' },
    { name: 'twitter:description', content: 'Alvin Shan 的个人博客，记录技术沉淀、股票市场观察、城市摄影与生活随想。' },
  ],
})

const footerMessages = [
  "欢迎浏览。"
];

const footerText = ref("");

// ── 光晕：绕过 Vue 响应式，直接操作 DOM，用 transform 走 GPU 合成层 ──
let glowEl = null;
let rafId = null;
let targetX = window.innerWidth / 2;
let targetY = window.innerHeight / 2;
let currentX = targetX;
let currentY = targetY;

function updateGlow() {
  if (!glowEl) return
  currentX += (targetX - currentX) * 0.08;
  currentY += (targetY - currentY) * 0.08;
  glowEl.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
  // 页面不可见时暂停 RAF，切回来自动恢复
  if (document.hidden) { rafId = null; return }
  rafId = requestAnimationFrame(updateGlow);
}

function resumeGlow() {
  if (!rafId && glowEl) rafId = requestAnimationFrame(updateGlow);
}

function handleMouseMove(e) {
  targetX = e.clientX;
  targetY = e.clientY;
}

function copyWechat() {
  navigator.clipboard.writeText('12133386767').then(() => {
    alert('微信号已复制：12133386767')
  }).catch(() => {
    prompt('微信号：', '12133386767')
  })
}

onMounted(() => {
  glowEl = document.getElementById('glow');
  rafId = requestAnimationFrame(updateGlow);
  window.addEventListener('mousemove', handleMouseMove, { passive: true });
  document.addEventListener('visibilitychange', resumeGlow);
  footerText.value =
    footerMessages[
      Math.floor(Math.random() * footerMessages.length)
    ];
});

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId);
  window.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('visibilitychange', resumeGlow);
});
</script>

<style scoped>
.home {
  position: relative;

  width: 100%;
  min-height: 100vh;

  padding: 0 10%;

  display: flex;
  justify-content: space-between;
  align-items: center;

  overflow: hidden;

  background: var(--bg-primary);

  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "PingFang SC",
    sans-serif;

  color: var(--text-primary);
}

/* 背景光晕 — 纯 GPU 合成层（不用 filter，无 Paint 开销） */
.glow {
  position: absolute;
  top: 0;
  left: 0;

  width: 800px;
  height: 800px;

  background: radial-gradient(
    circle at center,
    rgba(5, 162, 241, 0.10) 0%,
    rgba(50, 150, 238, 0.05) 15%,
    rgba(80, 180, 250, 0.025) 30%,
    rgba(100, 200, 255, 0.008) 50%,
    transparent 70%
  );

  pointer-events: none;
  contain: layout style paint;
  z-index: 0;
}

/* 暗色模式：去掉光晕 */
html.dark .glow {
  display: none;
}

/* 左右布局 */
.left,
.right {
  position: relative;
  z-index: 2;
}

.left {
  width: 42%;
}

.right {
  width: 40%;

  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 状态 */
.status {
  display: flex;
  align-items: center;
  gap: 10px;

  margin-bottom: 28px;

  font-size: 12px;
  letter-spacing: 0.2em;

  color: var(--text-muted);
}

.dot {
  width: 8px;
  height: 8px;

  border-radius: 50%;

  background: #7c9c92;

  box-shadow: 0 0 10px rgba(124, 156, 146, 0.7);
}

/* 标题 */
h1 {
  font-size: 72px;
  font-weight: 700;

  letter-spacing: 0.06em;

  margin-bottom: 20px;

  line-height: 1.1;
}

.role {
  font-size: 16px;
  color: var(--text-muted);

  margin-bottom: 36px;

  letter-spacing: 0.08em;
}

.intro {
  width: 80%;

  font-size: 17px;
  line-height: 1.9;

  color: var(--text-secondary);

  margin-bottom: 40px;
}

/* links */
.links {
  display: flex;
  gap: 24px;
}

.links a {
  position: relative;

  text-decoration: none;
  color: var(--text-heading);

  font-size: 15px;

  transition: color 0.3s ease;
}

.links a::after {
  content: "";

  position: absolute;
  left: 0;
  bottom: -4px;

  width: 0%;
  height: 1px;

  background: var(--text-heading);

  transition: width 0.3s ease;
}

.links a:hover::after {
  width: 100%;
}

/* 卡片 */
.nav-card {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 28px 30px;

  border-radius: 28px;

  text-decoration: none;
  color: inherit;

  background: var(--bg-overlay);
  border: 1px solid var(--border-card-alt);

  /* 用伪元素模拟阴影，hover 时只改 opacity（GPU），避免 box-shadow 触发 Paint */
  transition: transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1),
              background 0.35s ease;

  overflow: hidden;
  will-change: transform;
}

/* 阴影用伪元素 + opacity 过渡，零 Paint */
.nav-card::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 28px;
  box-shadow: 0 10px 40px var(--shadow-card-hover);
  opacity: 0;
  transition: opacity 0.35s ease;
  pointer-events: none;
  z-index: -1;
}

.nav-card::before {
  content: "";

  position: absolute;
  inset: 0;

  background: linear-gradient(
    135deg,
    rgba(255,255,255,0.3),
    transparent
  );

  opacity: 0;

  transition: opacity 0.35s ease;
}

.nav-card:hover {
  transform: translateY(-6px) scale(1.01);
  background: var(--bg-card-hover);
}

.nav-card:hover::before {
  opacity: 1;
}

.nav-card:hover::after {
  opacity: 1;
}

.index {
  font-size: 13px;

  letter-spacing: 0.2em;

  color: var(--text-light);

  margin-right: 24px;
}

.content {
  flex: 1;
}

.content h2 {
  font-size: 28px;

  margin-bottom: 8px;

  font-weight: 600;
}

.content p {
  color: var(--text-muted);

  font-size: 15px;
}

.arrow {
  font-size: 22px;

  color: var(--text-light);

  transition: transform 0.35s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.nav-card:hover .arrow {
  transform: translate(4px, -4px);
}

/* footer */
.footer {
  position: absolute;

  bottom: 36px;
  right: 10%;

  font-size: 13px;

  color: var(--text-light);

  letter-spacing: 0.08em;

  z-index: 2;
}

/* 动画 */
.fade-in {
  animation: fadeIn 1s ease forwards;
}

.fade-in-delay {
  animation: fadeIn 1.4s ease forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(18px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式 */
@media (max-width: 900px) {
  .home {
    flex-direction: column;

    justify-content: center;

    padding: 80px 8%;
  }

  .left,
  .right {
    width: 100%;
  }

  .left {
    margin-bottom: 60px;
  }

  h1 {
    font-size: 52px;
  }

  .intro {
    width: 100%;
  }

  .footer {
    left: 8%;
    right: auto;
  }
}
</style>