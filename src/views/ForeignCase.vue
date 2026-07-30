<template>
  <CaseStudyPage v-bind="caseData" />
</template>

<script setup>
import { computed } from 'vue'
import CaseStudyPage from '../components/CaseStudyPage.vue'
import { useLocale } from '../composables/useLocale'

const { isChinese } = useLocale()
const caseData = computed(() => isChinese.value
  ? {
      eyebrow: '03 / 海外落地页',
      title: '海外品牌实验',
      description: '面向不同文化语境的用户，用更直接、更有辨识度的语言承载复杂内容，同时保持轻盈。',
      tags: ['HTML5', 'CSS3', '响应式', 'FLEXBOX', 'GRID'],
      previewLabel: '海外落地页 / 交互预览',
      iframeSrc: '/foreign/index.html',
      iframeTitle: '海外品牌响应式网站案例',
      statement: '跨越语言与设备，让内容在每一种语境中都保持清晰。',
      details: [
        { title: '跨设备布局', text: '灵活网格将课程、教程与直播内容组织成自然的信息流，从桌面到手机都易于浏览。' },
        { title: '信息层级', text: '清晰的标题、卡片与导航减少操作阻力，让用户快速抵达真正关心的内容。' },
        { title: '品牌表达', text: '现代而克制的配色、轻微转场与有节奏的图像，形成更具国际感的视觉语气。' },
        { title: '适用场景', text: '适合在线教育、课程展示与学习资源平台，也为后续扩展为完整内容产品保留空间。' }
      ],
      nextEyebrow: '返回 / 02',
      nextTitle: 'Vivo 概念重构',
      nextTo: '/vivo-case'
    }
  : {
      eyebrow: '03 / GLOBAL LANDING',
      title: 'Global Brand Experiment',
      description: 'A more direct and recognizable language for audiences across different cultural contexts, keeping complex content light.',
      tags: ['HTML5', 'CSS3', 'RESPONSIVE', 'FLEXBOX', 'GRID'],
      previewLabel: 'GLOBAL LANDING / INTERACTIVE PREVIEW',
      iframeSrc: '/foreign/index.html',
      iframeTitle: 'Global brand responsive website case study',
      statement: 'Across languages and devices, the content remains clear in every context.',
      details: [
        { title: 'Cross-Device Layout', text: 'Flexible grids organize courses, tutorials, and live content into a natural flow from desktop to mobile.' },
        { title: 'Information Hierarchy', text: 'Clear headings, cards, and navigation reduce friction so users can quickly reach what matters to them.' },
        { title: 'Brand Expression', text: 'A modern restrained palette, subtle transitions, and paced imagery create an internationally minded visual tone.' },
        { title: 'Use Cases', text: 'Designed for online education, course showcases, and learning-resource platforms, with room to grow into a complete content product.' }
      ],
      nextEyebrow: 'BACK TO / 02',
      nextTitle: 'Vivo Concept Rebuild',
      nextTo: '/vivo-case'
    })
</script>
