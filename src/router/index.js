import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/essays', name: 'essays', component: () => import('../views/EssaysView.vue') },
  { path: '/essays/:slug', name: 'article', component: () => import('../views/ArticleView.vue') },
  { path: '/photography', name: 'photography', component: () => import('../views/PhotographyView.vue') },
  { path: '/photography/:id', name: 'photo-detail', component: () => import('../views/PhotoDetailView.vue') },
  { path: '/finance', name: 'finance', component: () => import('../views/FinanceView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
