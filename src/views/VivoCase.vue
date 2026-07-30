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
      eyebrow: '02 / 数字体验',
      title: 'Vivo 概念重构',
      description: '将品牌叙事、产品信息与响应式交互重新组织成一条更清晰、更有节奏的浏览路径。',
      tags: ['HTML5', 'CSS3', '响应式', 'FLEXBOX'],
      previewLabel: 'VIVO / 交互预览',
      iframeSrc: '/vivo/index.html',
      iframeTitle: 'Vivo 响应式网站案例',
      statement: '让产品成为视觉焦点，也让每一次交互自然展开。',
      details: [
        { title: '响应式体验', text: '针对桌面、平板与手机重新安排信息层级，让每种尺寸都保留完整、舒适的阅读节奏。' },
        { title: '视觉叙事', text: '以大幅产品图像带领页面，通过克制的色彩与充分留白强化品牌的科技气质。' },
        { title: '交互节奏', text: '轻量转场、轮播与清晰反馈串联各个区域，避免浏览过程突然中断。' },
        { title: '实现方式', text: '使用语义化 HTML、Flexbox、媒体查询与 CSS 动效，在不引入重型依赖的前提下保持流畅。' }
      ],
      nextEyebrow: '下一个项目 / 03',
      nextTitle: '海外品牌实验',
      nextTo: '/foreign-case'
    }
  : {
      eyebrow: '02 / DIGITAL EXPERIENCE',
      title: 'Vivo Concept Rebuild',
      description: 'Brand storytelling, product information, and responsive interaction reorganized into a clearer, more rhythmic browsing path.',
      tags: ['HTML5', 'CSS3', 'RESPONSIVE', 'FLEXBOX'],
      previewLabel: 'VIVO / INTERACTIVE PREVIEW',
      iframeSrc: '/vivo/index.html',
      iframeTitle: 'Vivo responsive website case study',
      statement: 'Make the product the visual focus, and let every interaction unfold naturally.',
      details: [
        { title: 'Responsive Experience', text: 'Information hierarchy is rearranged for desktop, tablet, and mobile so every size preserves a complete, comfortable reading rhythm.' },
        { title: 'Visual Storytelling', text: 'Large product imagery leads the page, while restrained color and generous space strengthen the brand’s technical character.' },
        { title: 'Interaction Rhythm', text: 'Lightweight transitions, carousels, and clear feedback connect each section without making the browsing experience feel abrupt.' },
        { title: 'Implementation', text: 'Built with semantic HTML, Flexbox, media queries, and CSS motion to remain fluid without heavy dependencies.' }
      ],
      nextEyebrow: 'NEXT PROJECT / 03',
      nextTitle: 'Global Brand Experiment',
      nextTo: '/foreign-case'
    })
</script>
