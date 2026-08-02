const modelId = document.body.dataset.model

const models = {
  'xiaomi-17-ultra': {
    index: '01 / CURRENT FLAGSHIP',
    title: 'Xiaomi 17 <span>Ultra</span>',
    tag: '在售 · 旗舰影像',
    lead: '把拍摄当作第一入口：更大的传感器、长焦与影像套装服务于同一件事——在远近光线都复杂的真实场景里，留下可用的画面。',
    image: '/xiaomi/img/xiaomi-17-ultra-hero.webp',
    art: 'photo',
    artLabel: '200MP',
    artSub: 'LEICA TELEPHOTO',
    artBg: '#e7ece7',
    artInk: '#214535',
    section: '影像不是参数堆叠，<br /><em>而是一条看得见的路径。</em>',
    sectionText: '从随手拍到远摄细节，17 Ultra 用旗舰影像配置承接从取景到成片的每一步。以下数据来自小米全球官网，实际配置以当地产品页为准。',
    specs: [['200MP', 'LEICA TELEPHOTO'], ['1 INCH', 'MAIN CAMERA'], ['6000mAh', 'TYPICAL BATTERY'], ['90W / 50W', 'WIRED / WIRELESS']],
    scenarios: [['01 / SEE', '先构图，再放大', '影像系统把广角、主摄与长焦放在同一拍摄判断里。'], ['02 / KEEP', '把作品带着走', '从相册到平板或电脑，内容成为跨设备继续处理的对象。'], ['03 / SHARE', '发出去之前再看一眼', '在更大的屏幕上回看细节，让手机拍摄延续为轻量创作。']],
    source: 'https://www.mi.com/global/product/xiaomi-17-ultra/',
    sourceText: '小米官网 · Xiaomi 17 Ultra'
  },
  'xiaomi-17': {
    index: '02 / COMPACT FLAGSHIP',
    title: 'Xiaomi <span>17</span>',
    tag: '在售 · 数字旗舰',
    lead: '把旗舰能力压缩回更适合单手使用的尺寸。小米 17 的价值不在于缩小，而在于让影像、性能与跨端协作无需因体积而妥协。',
    image: '/xiaomi/img/xiaomi-17-product.png',
    art: 'product',
    artLabel: '6.3″',
    artSub: 'COMPACT FORM',
    artBg: '#1f443b',
    artInk: '#d6f6e3',
    section: '小一点的尺寸，<br /><em>完整的旗舰动作。</em>',
    sectionText: '小米官网将 Xiaomi 17 定位为紧凑旗舰：更便于随身，但依然围绕徕卡影像、高性能平台与 HyperOS 的连续协作展开。',
    specs: [['6.3″', 'COMPACT DISPLAY'], ['6330mAh', 'TYPICAL BATTERY'], ['100W', 'WIRED CHARGING'], ['50W', 'WIRELESS CHARGING']],
    scenarios: [['01 / CARRY', '每天都愿意带上', '尺寸先解决握持与随身，旗舰体验才有进入日常的机会。'], ['02 / SWITCH', '从手机接到另一块屏', '任务和内容跨设备延续，而不是重新开始。'], ['03 / RETURN', '回到主设备', '通知、照片与待办在一个系统语境里再次收束。']],
    source: 'https://www.mi.com/global/product/xiaomi-17/',
    sourceText: '小米官网 · Xiaomi 17'
  },
  mix: {
    index: '03 / FORM FACTOR LAB',
    title: 'MIX <span>系列</span>',
    tag: '产品形态 · 探索线',
    lead: 'MIX 的意义不是多一种折叠方式，而是持续问一个问题：当屏幕能展开、翻转或隐藏时，哪些界面和动作也应该随之改变？',
    art: 'mix',
    artLabel: 'FORM',
    artSub: 'IN MOTION',
    artBg: '#d7bfaa',
    artInk: '#503524',
    section: '形态改变后，<br /><em>界面不能原地不动。</em>',
    sectionText: '本页将 MIX 作为形态研究分类，而不是特定未确认型号的规格页。它关注展开、分屏、跨端接力和不同尺寸之间的内容组织。',
    specs: [['FLIP', 'FOLDABLE ENTRY'], ['FOLD', 'EXPANDED CANVAS'], ['DUAL', 'MULTI-SURFACE'], ['FLOW', 'CONTEXT HANDOFF']],
    scenarios: [['01 / OPEN', '多一块可工作的画布', '展开后的价值不是更大，而是能同时看见更多关系。'], ['02 / SHIFT', '姿态改变，操作也应改变', '折叠角度、握持方式与界面密度一起被重新考虑。'], ['03 / CONNECT', '屏幕之间不是孤岛', '手机、平板与电脑共同承接同一组任务状态。']],
    source: 'https://www.mi.com/global/',
    sourceText: '小米官网 · 产品与生态入口'
  },
  redmi: {
    index: '04 / PERFORMANCE FOR ALL',
    title: 'Redmi <span>K / Note</span>',
    tag: '在售 · 性能普及',
    lead: '性能不应只属于最高价位。Redmi 的意义是把续航、屏幕、影像或游戏性能中的某一个关键体验，交给更大的用户群。',
    image: '/xiaomi/img/redmi-note-15-pro.png',
    art: 'product',
    artLabel: '200MP',
    artSub: 'NOTE 15 PRO+ 5G',
    artBg: '#2b211b',
    artInk: '#ffe8ca',
    section: '一条更宽的入口，<br /><em>让性能走进更多日常。</em>',
    sectionText: 'K 与 Note 在不同市场会有不同的型号和配置。本页强调的是 Redmi 在小米生态中的角色：以更广的覆盖，让系统和服务有更多开始的地方。',
    specs: [['K', 'PERFORMANCE LAYER'], ['NOTE', 'EVERYDAY CAMERA'], ['WIDE', 'PRICE ACCESS'], ['HYPEROS', 'SHARED SYSTEM']],
    scenarios: [['01 / PLAY', '性能先给回应', '高刷新、芯片与散热对应的是游戏、影像和日常切换的即时反馈。'], ['02 / LAST', '电量要覆盖整天', '长续航让设备成为稳定入口，而不只是短时间的高性能。'], ['03 / JOIN', '进入同一套协作', '不论价位，跨设备连接和内容流动仍然属于完整体验的一部分。']],
    source: 'https://www.mi.com/global/',
    sourceText: '小米官网 · Redmi 产品入口'
  },
  'future-watch': {
    index: '05 / FUTURE WATCH',
    title: '下一代影像<br /><span>旗舰观察</span>',
    tag: '未发布 · 个人概念观察',
    lead: '这不是官方产品或预告。它只记录几个值得继续留意的方向：更远的焦段、更轻的机身、更快的端侧智能，以及它们如何改变人车家之间的内容流动。',
    art: 'future',
    artLabel: 'UNANNOUNCED',
    artSub: 'WATCH THE SIGNAL',
    artBg: '#181a1d',
    artInk: '#ff9a5c',
    section: '没有确认的信息，<br /><em>只保留为问题。</em>',
    sectionText: '未来产品与 HyperOS 4 的信息需要以小米正式发布为准。此处不使用未证实的型号、日期或规格，而是把设计问题保持开放。',
    specs: [['?', 'MODEL NAME'], ['?', 'RELEASE TIME'], ['?', 'FEATURE LIST'], ['OPEN', 'DESIGN QUESTIONS']],
    scenarios: [['01 / ASK', '更远，究竟解决什么', '焦段增长应服务于真实拍摄距离，而不是单独追逐数字。'], ['02 / CONNECT', 'AI 怎样少打扰一点', '下一代智能体验更值得关注的，是在恰当时机出现后立即退场。'], ['03 / VERIFY', '等待官方答案', '发布时间、机型清单和功能规格，都只在正式信息确认后写入。']],
    source: '',
    sourceText: ''
  }
}

const model = models[modelId] || models['xiaomi-17-ultra']
const logo = (extra = '') => `<svg class="xiaomi-logo ${extra}" viewBox="0 0 112 112" aria-hidden="true"><g fill="#ff6900"><path d="M100.326,11.702 C89.76,1.176 74.566,0 56,0 C37.41,0 22.194,1.19 11.632,11.744 C1.072,22.294 0,37.486 0,56.054 C0,74.626 1.072,89.822 11.636,100.376 C22.198,110.932 37.412,112 56,112 C74.588,112 89.8,110.932 100.362,100.376 C110.926,89.82 112,74.626 112,56.054 C112,37.462 110.914,22.254 100.326,11.702 L100.326,11.702 Z"></path></g><g fill="#fff"><path d="M57.8054292,26.743366 L57.931608,26.8782679 L81.3680343,53.7784796 C82.7703315,55.3874915 81.6885448,57.872013 79.5991142,57.9952335 L79.4364262,58 L76,58 L76,71.3345882 C76,75.0164706 72.9809524,78 69.2552381,78 L42.7447619,78 C39.0190476,78 36,75.0164706 36,71.3345882 L36,58 L32.5635738,58 C30.4234399,58 29.2530924,55.5557037 30.5289714,53.903922 L30.6319657,53.7784796 L54.068392,26.8782679 C55.0457355,25.754085 56.766743,25.7091177 57.8054292,26.743366 Z M59.2999404,54 L52.6952892,54 C51.2597451,54 50.0896172,55.1942589 50.0049103,56.6981405 L50,56.872989 L50,63.127011 C50,64.6534011 51.1169596,65.9041929 52.530874,65.9947504 L52.6952892,66 L59.2999404,66 C60.7354844,66 61.910036,64.8057411 61.9950706,63.3018595 L62,63.127011 L62,56.872989 C62,55.2878916 60.7906977,54 59.2999404,54 Z"></path></g></svg>`

const art = model.image
  ? `<img src="${model.image}" alt="${model.title.replace(/<[^>]+>/g, '')} 产品视觉" />`
  : ''

document.title = `${model.title.replace(/<[^>]+>/g, '')} / Xiaomi Ecosystem Study`
document.getElementById('model-app').innerHTML = `
  <div class="detail-shell" style="--art-bg:${model.artBg};--art-label:${model.artInk}">
    <header class="detail-nav">
      <a class="detail-brand" href="/xiaomi/index.html#phones" aria-label="返回小米全生态首页">${logo()}<span>XIAOMI / PHONE SPECTRUM</span></a>
      <a class="detail-back" href="/xiaomi/index.html#phones"><span>←</span> 返回机型矩阵</a>
    </header>
    <main>
      <section class="detail-hero" data-loop-reveal>
        <div><p class="detail-eyebrow">${model.index}</p><h1>${model.title}</h1><p class="detail-summary">${model.lead}</p><span class="detail-chip">${model.tag}</span></div>
        <div class="detail-art detail-art--${model.art}"><span class="detail-index">XIAOMI / PHONE DETAIL</span>${art}<div class="detail-art-label"><strong>${model.artLabel}</strong><small>${model.artSub}</small></div></div>
      </section>
      <div class="signal-tape"><span>PHONE AS AN ENTRY</span><i></i><span>STATE FLOWS ACROSS DEVICES</span><i></i><span>HUMAN × CAR × HOME</span><i></i><span>02 / 05</span></div>
      <section class="detail-section" data-loop-reveal>
        <div class="detail-section-head"><div><p class="detail-eyebrow">PRODUCT LENS</p><h2>${model.section}</h2></div><p>${model.sectionText}</p></div>
        <div class="detail-specs">${model.specs.map(([value, label]) => `<article class="detail-spec" data-loop-reveal><span class="spec-label">${label}</span><strong>${value}</strong></article>`).join('')}</div>
      </section>
      <section class="detail-section" data-loop-reveal>
        <div class="detail-section-head"><div><p class="detail-eyebrow">SCENARIO ROUTE</p><h2>不是一台设备，<br /><em>而是下一个动作。</em></h2></div><p>每个分类都在生态中承担不同位置。重点不是拥有更多页面，而是在切换场景时少一次重新设置。</p></div>
        <div class="detail-scenarios">${model.scenarios.map(([index, title, text]) => `<article class="detail-scenario"><b>${index}</b><h3>${title}</h3><p>${text}</p></article>`).join('')}</div>
        ${model.source ? `<p class="source-note">产品与系统信息参照 <a href="${model.source}" target="_blank" rel="noreferrer">${model.sourceText} ↗</a>。实际配置、地区可用性与软件功能以官方页面为准。</p>` : '<p class="source-note source-note--future">本页为概念观察，不代表小米官方发布、路线图或规格说明。</p>'}
      </section>
    </main>
    <footer class="detail-footer"><div>${logo()}<span>小米全生态体验项目 / 2026</span></div><a class="detail-back" href="/xiaomi/index.html#phones">回到机型矩阵 <span>↑</span></a></footer>
  </div>`

const targets = document.querySelectorAll('[data-loop-reveal]')
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (reducedMotion || !('IntersectionObserver' in window)) {
  targets.forEach((target) => target.classList.add('is-visible'))
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle('is-visible', entry.isIntersecting))
  }, { threshold: 0.16, rootMargin: '0px 0px -7% 0px' })
  targets.forEach((target) => observer.observe(target))
}
