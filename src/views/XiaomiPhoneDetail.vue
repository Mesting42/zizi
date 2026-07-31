<template>
  <div class="xiaomi-phone-page" :style="{ '--accent': product.accent, '--art-bg': product.artBg, '--art-ink': product.artInk }">
    <header class="xiaomi-phone-nav">
      <a class="xiaomi-phone-brand" :href="matrixHref" aria-label="返回小米全生态机型矩阵">
        <img src="/vivo/img/xiaomi-official-logo.svg" alt="Xiaomi" />
        <span>XIAOMI / PHONE SPECTRUM</span>
      </a>
      <a class="xiaomi-phone-back" :href="matrixHref"><span>←</span> 返回机型矩阵</a>
    </header>

    <main>
      <section class="xiaomi-phone-hero" data-cycle>
        <div class="xiaomi-phone-hero-copy">
          <p class="xiaomi-phone-eyebrow">{{ product.index }}</p>
          <h1 v-html="product.title"></h1>
          <p class="xiaomi-phone-lede">{{ product.lede }}</p>
          <span class="xiaomi-phone-status">{{ product.status }}</span>
        </div>
        <div :class="['xiaomi-phone-art', `xiaomi-phone-art--${product.artType}`]">
          <span class="xiaomi-phone-art-index">XIAOMI / PHONE DETAIL</span>
          <img v-if="product.image" :src="product.image" :alt="`${product.plainTitle} 产品视觉`" />
          <div class="xiaomi-phone-art-label"><strong>{{ product.artLabel }}</strong><small>{{ product.artSub }}</small></div>
        </div>
      </section>

      <div class="xiaomi-phone-tape"><span>PHONE AS AN ENTRY</span><i></i><span>STATE FLOWS ACROSS DEVICES</span><i></i><span>HUMAN × CAR × HOME</span></div>

      <section class="xiaomi-phone-block" data-cycle>
        <div class="xiaomi-phone-block-head">
          <div><p class="xiaomi-phone-eyebrow">PRODUCT LENS</p><h2 v-html="product.section"></h2></div>
          <p>{{ product.sectionText }}</p>
        </div>
        <div class="xiaomi-phone-specs">
          <article v-for="spec in product.specs" :key="spec.label" data-cycle><span>{{ spec.label }}</span><strong>{{ spec.value }}</strong></article>
        </div>
      </section>

      <section class="xiaomi-phone-block" data-cycle>
        <div class="xiaomi-phone-block-head">
          <div><p class="xiaomi-phone-eyebrow">SCENARIO ROUTE</p><h2>不是一台设备，<br /><em>而是下一个动作。</em></h2></div>
          <p>每个分类都在生态中承担不同位置。重点不是拥有更多页面，而是在切换场景时少一次重新设置。</p>
        </div>
        <div class="xiaomi-phone-scenarios">
          <article v-for="scenario in product.scenarios" :key="scenario.index"><b>{{ scenario.index }}</b><h3>{{ scenario.title }}</h3><p>{{ scenario.text }}</p></article>
        </div>
        <p v-if="product.source" class="xiaomi-phone-source">产品与系统信息参照 <a :href="product.source" target="_blank" rel="noreferrer">{{ product.sourceLabel }} ↗</a>。实际配置、地区可用性与软件功能以官方页面为准。</p>
        <p v-else class="xiaomi-phone-source xiaomi-phone-source--future">本页为概念观察，不代表小米官方发布、路线图或规格说明。</p>
      </section>
    </main>

    <footer class="xiaomi-phone-footer"><div><img src="/vivo/img/xiaomi-official-logo.svg" alt="Xiaomi" /><span>小米全生态体验项目 / 2026</span></div><a class="xiaomi-phone-back" :href="matrixHref">回到机型矩阵 <span>↑</span></a></footer>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const products = {
  'xiaomi-17-ultra': { index: '01 / CURRENT FLAGSHIP', title: 'Xiaomi 17 <span>Ultra</span>', plainTitle: 'Xiaomi 17 Ultra', status: '在售 · 旗舰影像', lede: '把拍摄当作第一入口：更大的传感器、长焦与影像套装服务于同一件事——在远近光线都复杂的真实场景里，留下可用的画面。', image: '/vivo/img/xiaomi-17-ultra-hero.webp', artType: 'photo', artLabel: '200MP', artSub: 'LEICA TELEPHOTO', artBg: '#e7ece7', artInk: '#214535', accent: '#ff6900', section: '影像不是参数堆叠，<br /><em>而是一条看得见的路径。</em>', sectionText: '从随手拍到远摄细节，17 Ultra 用旗舰影像配置承接从取景到成片的每一步。以下数据来自小米全球官网，实际配置以当地产品页为准。', specs: [{ value: '200MP', label: 'LEICA TELEPHOTO' }, { value: '1 INCH', label: 'MAIN CAMERA' }, { value: '6000mAh', label: 'TYPICAL BATTERY' }, { value: '90W / 50W', label: 'WIRED / WIRELESS' }], scenarios: [{ index: '01 / SEE', title: '先构图，再放大', text: '影像系统把广角、主摄与长焦放在同一拍摄判断里。' }, { index: '02 / KEEP', title: '把作品带着走', text: '从相册到平板或电脑，内容成为跨设备继续处理的对象。' }, { index: '03 / SHARE', title: '发出去之前再看一眼', text: '在更大的屏幕上回看细节，让手机拍摄延续为轻量创作。' }], source: 'https://www.mi.com/global/product/xiaomi-17-ultra/', sourceLabel: '小米官网 · Xiaomi 17 Ultra' },
  'xiaomi-17': { index: '02 / COMPACT FLAGSHIP', title: 'Xiaomi <span>17</span>', plainTitle: 'Xiaomi 17', status: '在售 · 数字旗舰', lede: '把旗舰能力压缩回更适合单手使用的尺寸。小米 17 的价值不在于缩小，而在于让影像、性能与跨端协作无需因体积而妥协。', image: '/vivo/img/xiaomi-17-product.png', artType: 'product', artLabel: '6.3″', artSub: 'COMPACT FORM', artBg: '#1f443b', artInk: '#d6f6e3', accent: '#7b9dff', section: '小一点的尺寸，<br /><em>完整的旗舰动作。</em>', sectionText: '小米官网将 Xiaomi 17 定位为紧凑旗舰：更便于随身，但依然围绕徕卡影像、高性能平台与 HyperOS 的连续协作展开。', specs: [{ value: '6.3″', label: 'COMPACT DISPLAY' }, { value: '6330mAh', label: 'TYPICAL BATTERY' }, { value: '100W', label: 'WIRED CHARGING' }, { value: '50W', label: 'WIRELESS CHARGING' }], scenarios: [{ index: '01 / CARRY', title: '每天都愿意带上', text: '尺寸先解决握持与随身，旗舰体验才有进入日常的机会。' }, { index: '02 / SWITCH', title: '从手机接到另一块屏', text: '任务和内容跨设备延续，而不是重新开始。' }, { index: '03 / RETURN', title: '回到主设备', text: '通知、照片与待办在一个系统语境里再次收束。' }], source: 'https://www.mi.com/global/product/xiaomi-17/', sourceLabel: '小米官网 · Xiaomi 17' },
  mix: { index: '03 / FORM FACTOR LAB', title: 'MIX <span>系列</span>', plainTitle: 'MIX 系列', status: '产品形态 · 探索线', lede: 'MIX 的意义不是多一种折叠方式，而是持续问一个问题：当屏幕能展开、翻转或隐藏时，哪些界面和动作也应该随之改变？', artType: 'mix', artLabel: 'FORM', artSub: 'IN MOTION', artBg: '#d7bfaa', artInk: '#503524', accent: '#ff9b66', section: '形态改变后，<br /><em>界面不能原地不动。</em>', sectionText: '本页将 MIX 作为形态研究分类，而不是特定未确认型号的规格页。它关注展开、分屏、跨端接力和不同尺寸之间的内容组织。', specs: [{ value: 'FLIP', label: 'FOLDABLE ENTRY' }, { value: 'FOLD', label: 'EXPANDED CANVAS' }, { value: 'DUAL', label: 'MULTI-SURFACE' }, { value: 'FLOW', label: 'CONTEXT HANDOFF' }], scenarios: [{ index: '01 / OPEN', title: '多一块可工作的画布', text: '展开后的价值不是更大，而是能同时看见更多关系。' }, { index: '02 / SHIFT', title: '姿态改变，操作也应改变', text: '折叠角度、握持方式与界面密度一起被重新考虑。' }, { index: '03 / CONNECT', title: '屏幕之间不是孤岛', text: '手机、平板与电脑共同承接同一组任务状态。' }], source: 'https://www.mi.com/global/', sourceLabel: '小米官网 · 产品与生态入口' },
  redmi: { index: '04 / PERFORMANCE FOR ALL', title: 'Redmi <span>K / Note</span>', plainTitle: 'Redmi K / Note', status: '在售 · 性能普及', lede: '性能不应只属于最高价位。Redmi 的意义是把续航、屏幕、影像或游戏性能中的某一个关键体验，交给更大的用户群。', image: '/vivo/img/redmi-note-15-pro.png', artType: 'product', artLabel: '200MP', artSub: 'NOTE 15 PRO+ 5G', artBg: '#2b211b', artInk: '#ffe8ca', accent: '#c6e86b', section: '一条更宽的入口，<br /><em>让性能走进更多日常。</em>', sectionText: 'K 与 Note 在不同市场会有不同的型号和配置。本页强调的是 Redmi 在小米生态中的角色：以更广的覆盖，让系统和服务有更多开始的地方。', specs: [{ value: 'K', label: 'PERFORMANCE LAYER' }, { value: 'NOTE', label: 'EVERYDAY CAMERA' }, { value: 'WIDE', label: 'PRICE ACCESS' }, { value: 'HYPEROS', label: 'SHARED SYSTEM' }], scenarios: [{ index: '01 / PLAY', title: '性能先给回应', text: '高刷新、芯片与散热对应的是游戏、影像和日常切换的即时反馈。' }, { index: '02 / LAST', title: '电量要覆盖整天', text: '长续航让设备成为稳定入口，而不只是短时间的高性能。' }, { index: '03 / JOIN', title: '进入同一套协作', text: '不论价位，跨设备连接和内容流动仍然属于完整体验的一部分。' }], source: 'https://www.mi.com/global/', sourceLabel: '小米官网 · Redmi 产品入口' },
  'future-watch': { index: '05 / FUTURE WATCH', title: '下一代影像<br /><span>旗舰观察</span>', plainTitle: '下一代影像旗舰观察', status: '未发布 · 个人概念观察', lede: '这不是官方产品或预告。它只记录几个值得继续留意的方向：更远的焦段、更轻的机身、更快的端侧智能，以及它们如何改变人车家之间的内容流动。', artType: 'future', artLabel: 'UNANNOUNCED', artSub: 'WATCH THE SIGNAL', artBg: '#181a1d', artInk: '#ff9a5c', accent: '#ff6900', section: '没有确认的信息，<br /><em>只保留为问题。</em>', sectionText: '未来产品与 HyperOS 4 的信息需要以小米正式发布为准。此处不使用未证实的型号、日期或规格，而是把设计问题保持开放。', specs: [{ value: '?', label: 'MODEL NAME' }, { value: '?', label: 'RELEASE TIME' }, { value: '?', label: 'FEATURE LIST' }, { value: 'OPEN', label: 'DESIGN QUESTIONS' }], scenarios: [{ index: '01 / ASK', title: '更远，究竟解决什么', text: '焦段增长应服务于真实拍摄距离，而不是单独追逐数字。' }, { index: '02 / CONNECT', title: 'AI 怎样少打扰一点', text: '下一代智能体验更值得关注的，是在恰当时机出现后立即退场。' }, { index: '03 / VERIFY', title: '等待官方答案', text: '发布时间、机型清单和功能规格，都只在正式信息确认后写入。' }], source: '', sourceLabel: '' }
}

const product = computed(() => {
  const base = products[route.params.model] || products['xiaomi-17-ultra']
  if (route.params.model === 'mix') {
    return {
      ...base,
      image: '/vivo/img/xiaomi-mix-flip.png',
      artType: 'mix-photo',
      artLabel: 'MIX FLIP',
      artSub: '4.01" / 6.86" DISPLAYS',
      sectionText: '以真实在售的 Xiaomi MIX Flip 为入口：外屏负责快速处理，内屏负责完整展开，折叠结构让同一部手机拥有两种工作姿态。',
      specs: [{ value: '4.01" / 6.86"', label: 'OUTER / INNER DISPLAY' }, { value: '4780mAh', label: 'XIAOMI SURGE BATTERY' }, { value: '67W', label: 'HYPERCHARGE' }, { value: '50MP', label: 'LEICA MAIN CAMERA' }],
      source: 'https://www.mi.com/global/product/xiaomi-mix-flip/',
      sourceLabel: '小米官网 · Xiaomi MIX Flip'
    }
  }
  if (route.params.model === 'redmi') {
    return {
      ...base,
      artType: 'redmi-photo',
      artLabel: '200MP',
      artSub: 'REDMI NOTE 15 PRO',
      sectionText: '以真实在售的 REDMI Note 15 Pro 为入口：200MP 主摄、6500mAh 电池与耐用结构，把可靠的日常性能带进更广的价格带。',
      specs: [{ value: '6.77"', label: 'FHD+ AMOLED DISPLAY' }, { value: '6500mAh', label: 'SILICON-CARBON BATTERY' }, { value: '45W', label: 'TURBO CHARGING' }, { value: '200MP', label: 'MAIN CAMERA' }],
      source: 'https://www.mi.com/global/product/redmi-note-15-pro/',
      sourceLabel: '小米官网 · REDMI Note 15 Pro'
    }
  }
  return base
})
const matrixHref = computed(() => route.query.fromPreview === '1'
  ? '/vivo/index.html?xiaomi=1#phones'
  : '/xiaomi-case#phones')
let observer

onMounted(async () => {
  document.body.classList.add('xiaomi-phone-detail-route')
  await nextTick()
  const targets = document.querySelectorAll('.xiaomi-phone-page [data-cycle]')
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    targets.forEach((target) => target.classList.add('is-visible'))
    return
  }
  observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.target.classList.toggle('is-visible', entry.isIntersecting)), { threshold: 0.16, rootMargin: '0px 0px -8% 0px' })
  targets.forEach((target) => observer.observe(target))
})

onBeforeUnmount(() => {
  observer?.disconnect()
  document.body.classList.remove('xiaomi-phone-detail-route')
})
</script>

<style>
@import '../css/XiaomiPhoneDetail.css';
</style>
