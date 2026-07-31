<template>
  <CaseStudyPage v-bind="{ ...caseData, ...caseEnhancements }" />
</template>

<script setup>
import { computed } from 'vue'
import CaseStudyPage from '../components/CaseStudyPage.vue'
import { useLocale } from '../composables/useLocale'

const { isChinese } = useLocale()

const caseData = computed(() => isChinese.value
  ? {
      variant: 'xiaomi',
      eyebrow: '02 / 全生态数字体验',
      title: '小米全生态体验',
      description: '以 Xiaomi 17 Ultra 为入口，重新组织手机、HyperOS、汽车与家庭设备，让“人车家”从一句口号变成可以顺着浏览、顺着使用的连续体验。',
      tags: ['XIAOMI', 'HYPEROS 3', 'HUMAN × CAR × HOME', 'RESPONSIVE'],
      previewLabel: 'XIAOMI / 全生态交互预览',
      // Keep a versioned URL so an old cached static preview cannot keep the
      // previous portfolio page after the Xiaomi project is refreshed.
      iframeSrc: '/vivo/index.html?xiaomi=1',
      iframeTitle: '小米手机、HyperOS、汽车与全生态响应式体验页',
      statement: '手机是入口，生态才是完整的体验。',
      details: [
        { title: '旗舰手机矩阵', text: '以 Xiaomi 17 Ultra 与 Xiaomi 17 为当前旗舰锚点，同时展示 MIX 形态探索、Redmi 性能入口与未发布机型观察。' },
        { title: 'HyperOS 3 当前层', text: '聚焦 HyperConnect、HyperAI 与跨设备状态流动；具体功能随地区、设备与软件版本变化。' },
        { title: 'HyperOS 4 未来观察', text: '单独标记为未发布概念区，不虚构官方时间表或规格，只讨论更自然的设备代理与空间界面方向。' },
        { title: '小米汽车与家庭', text: '将 SU7、YU7、Pad、Watch 与 AIoT 放在同一张场景地图里，说明设备之间为什么要少做一次设置。' }
      ],
      nextEyebrow: '下一个项目 / 03',
      nextTitle: '海外品牌实验',
      nextTo: '/foreign-case'
    }
  : {
      variant: 'xiaomi',
      eyebrow: '02 / HUMAN × CAR × HOME',
      title: 'Xiaomi Ecosystem Study',
      description: 'A product-led study of Xiaomi 17 Ultra, HyperOS, Xiaomi EV, and the devices around them—designed as one continuous ecosystem experience.',
      tags: ['XIAOMI', 'HYPEROS 3', 'HUMAN × CAR × HOME', 'RESPONSIVE'],
      previewLabel: 'XIAOMI / ECOSYSTEM INTERACTIVE PREVIEW',
      iframeSrc: '/vivo/index.html?xiaomi=1',
      iframeTitle: 'Xiaomi phone, HyperOS, EV, and ecosystem responsive experience',
      statement: 'The phone is the entry. The ecosystem is the experience.',
      details: [
        { title: 'Flagship spectrum', text: 'Xiaomi 17 Ultra and Xiaomi 17 anchor the current range, with MIX form-factor experiments, Redmi performance tiers, and an explicitly unannounced future watch.' },
        { title: 'HyperOS 3 now', text: 'The current layer focuses on HyperConnect, HyperAI, and fluid device state. Exact availability varies by region, device, and software version.' },
        { title: 'HyperOS 4 future watch', text: 'Kept separate as a concept section. No unofficial release date or feature list is presented as fact.' },
        { title: 'Car and home', text: 'SU7, YU7, Pad, Watch, and AIoT become a single scenario map—less setup, more continuity.' }
      ],
      nextEyebrow: 'NEXT PROJECT / 03',
      nextTitle: 'Global Brand Experiment',
      nextTo: '/foreign-case'
    })

const caseEnhancements = computed(() => isChinese.value
  ? {
      overview: { label: '项目概览 / 小米人车家体验研究' },
      metrics: [
        { value: '05', label: '手机与形态入口' },
        { value: '03', label: 'HyperOS 版本视角' },
        { value: '02', label: '小米汽车产品线' },
        { value: '01', label: '全生态场景地图' }
      ],
      challenge: {
        eyebrow: 'ECOSYSTEM BRIEF',
        title: '把“设备目录”改写成“生活路线”。',
        text: '小米的产品跨度很大：手机、系统、汽车、平板、穿戴与家居各有自己的语言。这个项目的重点不是把它们堆在一页，而是找到一个人真正会走过的顺序，从一张照片、一次通勤、到回家后的自动联动。',
        points: ['用 Xiaomi 17 Ultra 作为第一入口，再展开手机矩阵', '将 HyperOS 3 的已确认能力与 HyperOS 4 的未来观察分开', '用 SU7、YU7 与家庭设备说明“人车家”如何落地']
      },
      principlesLabel: 'DESIGN PRINCIPLES',
      principlesTitle: '一张地图，比一张清单更接近生态。',
      principles: [
        { title: 'Start with a device', text: '从一台真实产品开始，让技术叙事先拥有触感，再把用户带到更大的系统。' },
        { title: 'Separate certainty', text: '当前功能、已发布产品与未来概念各自拥有清晰标签，避免把想象写成规格。' },
        { title: 'Show the handoff', text: '每个章节都回答“下一步会发生什么”：从手机到车，再从车回到家。' }
      ],
      processLabel: 'RESEARCH PROCESS',
      processTitle: '先核对事实，再设计连接。',
      process: [
        { phase: '01 / SOURCE', title: '整理官方产品与系统信息', text: '以 Xiaomi、HyperOS 官方页面为主，记录 Xiaomi 17、17 Ultra、SU7、YU7 与 HyperOS 3 的公开信息，并把未确认内容单独隔离。' },
        { phase: '02 / SCENARIO', title: '把产品线翻译成使用场景', text: '从拍摄、移动办公、通勤、回家四种动作出发，决定哪些设备需要同时出现，哪些信息应该后退。' },
        { phase: '03 / INTERACTION', title: '让页面像生态一样流动', text: '用版本切换、环形生态地图、卡片视差与循环视口动画，把产品之间的关系变成可浏览的反馈。' }
      ]
    }
  : {
      overview: { label: 'PROJECT SNAPSHOT / XIAOMI ECOSYSTEM STUDY' },
      metrics: [
        { value: '05', label: 'Phone and form-factor entries' },
        { value: '03', label: 'HyperOS viewpoints' },
        { value: '02', label: 'Xiaomi EV nameplates' },
        { value: '01', label: 'Ecosystem scenario map' }
      ],
      challenge: {
        eyebrow: 'ECOSYSTEM BRIEF',
        title: 'Turn a device catalog into a life route.',
        text: 'Xiaomi spans phones, software, cars, tablets, wearables, and the home. This project is not a pile of product cards. It follows a real sequence: a photo, a commute, a handoff, and the moment you arrive home.',
        points: ['Start with Xiaomi 17 Ultra, then open the wider phone spectrum', 'Separate confirmed HyperOS 3 from the unannounced HyperOS 4 watch', 'Use SU7, YU7, and home devices to make human × car × home tangible']
      },
      principlesLabel: 'DESIGN PRINCIPLES',
      principlesTitle: 'A map is closer to an ecosystem than a list.',
      principles: [
        { title: 'Start with a device', text: 'Begin with a real product, so the system story has a tactile anchor before it expands.' },
        { title: 'Separate certainty', text: 'Current features, released products, and future concepts carry different labels instead of blending into one promise.' },
        { title: 'Show the handoff', text: 'Each chapter answers what happens next—from phone to car, then from car back home.' }
      ],
      processLabel: 'RESEARCH PROCESS',
      processTitle: 'Verify first. Connect second.',
      process: [
        { phase: '01 / SOURCE', title: 'Gather official product and OS material', text: 'Use Xiaomi and HyperOS official pages as the source of truth for Xiaomi 17, 17 Ultra, SU7, YU7, and HyperOS 3; isolate anything unconfirmed.' },
        { phase: '02 / SCENARIO', title: 'Translate product lines into actions', text: 'Start from shooting, moving, commuting, and arriving home to decide which devices should appear together.' },
        { phase: '03 / INTERACTION', title: 'Make the page flow like the ecosystem', text: 'Version tabs, an orbital map, card depth, and replayable reveals turn relationships into visible feedback.' }
      ]
    })
</script>
