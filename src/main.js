import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createUnhead } from '@unhead/vue'
import router from './router'
import './style.css'
import App from './App.vue'

const app = createApp(App)
const head = createUnhead()

app.use(createPinia())
app.use(router)
app.use(head)
app.mount('#app')
