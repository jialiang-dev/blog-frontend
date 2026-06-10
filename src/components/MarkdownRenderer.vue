<script setup>
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import json from 'highlight.js/lib/languages/json'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'
import sql from 'highlight.js/lib/languages/sql'
import markdown from 'highlight.js/lib/languages/markdown'
import plaintext from 'highlight.js/lib/languages/plaintext'
import katex from 'katex'

// 注册常用语言
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('py', python)
hljs.registerLanguage('java', java)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('sh', bash)
hljs.registerLanguage('shell', bash)
hljs.registerLanguage('css', css)
hljs.registerLanguage('json', json)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('yml', yaml)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('md', markdown)
hljs.registerLanguage('plaintext', plaintext)
hljs.registerLanguage('text', plaintext)

// 样式：自定义代码块配色 + katex 排版（不再引入 highlight.js 主题）
import 'katex/dist/katex.min.css'
import '../styles/article.css'

const props = defineProps({
  content: { type: String, required: true },
})

// ── markdown-it 实例 ──
const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: false,
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch { /* fall through */ }
    }
    return hljs.highlight(code, { language: 'plaintext' }).value
  },
})

// ── KaTeX 插件（行内 $...$ 和块级 $$...$$）──
// 行内
md.use((mdInstance) => {
  const defaultRender = mdInstance.renderer.rules.code_inline || ((tokens, idx, opts, _, self) =>
    `<code>${mdInstance.utils.escapeHtml(tokens[idx].content)}</code>`)

  mdInstance.renderer.rules.code_inline = (tokens, idx, opts, env, self) => {
    const text = tokens[idx].content
    // $ ... $ 行内公式
    if (text.startsWith('$') && text.endsWith('$') && text.length > 2) {
      const formula = text.slice(1, -1)
      try {
        return katex.renderToString(formula, { throwOnError: false, displayMode: false })
      } catch { return defaultRender(tokens, idx, opts, env, self) }
    }
    return defaultRender(tokens, idx, opts, env, self)
  }
})

// 块级公式 $$...$$
const defaultBlockRender = md.renderer.rules.fence || ((tokens, idx, opts, _, self) =>
  `<pre><code>${md.utils.escapeHtml(tokens[idx].content)}</code></pre>`)

md.renderer.rules.fence = (tokens, idx, opts, env, self) => {
  const token = tokens[idx]
  if (token.info === 'math' || token.info === 'katex') {
    try {
      return katex.renderToString(token.content, { throwOnError: false, displayMode: true })
    } catch { return defaultBlockRender(tokens, idx, opts, env, self) }
  }
  return defaultBlockRender(tokens, idx, opts, env, self)
}

// ── 自定义段落渲染：单独一行 $...$ 也视为块级公式 ──
const defaultP = md.renderer.rules.paragraph_open || ((tokens, idx) =>
  `<${tokens[idx].tag}>`)

md.renderer.rules.paragraph_open = (tokens, idx, opts, env, self) => {
  const contentToken = tokens[idx + 1]
  if (contentToken && contentToken.type === 'inline' && contentToken.children?.length === 3) {
    const [c0, c1, c2] = contentToken.children
    if (c0?.type === 'text' && c1?.type === 'math_inline' && c2?.type === 'text' &&
        !c0.content.trim() && !c2.content.trim()) {
      // 这个段落其实是单独的行内公式，跳过 <p> 包装
      return ''
    }
  }
  return defaultP(tokens, idx, opts, env, self)
}
md.renderer.rules.paragraph_close = () => ''
</script>

<template>
  <div class="prose" v-html="md.render(content)" />
</template>
