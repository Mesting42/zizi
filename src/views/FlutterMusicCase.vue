<template>
  <div
    ref="caseRoot"
    class="flutter-music-case"
    :class="{ 'is-english': !isChinese }"
  >
    <div ref="sideSignalFields" class="fm-side-signal-fields" aria-hidden="true">
      <div class="fm-signal-field fm-signal-field--left">
        <span class="fm-signal-halo"></span>
        <span class="fm-signal-grid"></span>
        <span class="fm-signal-orbit fm-signal-orbit--outer"></span>
        <span class="fm-signal-orbit fm-signal-orbit--inner"></span>
        <span class="fm-signal-path fm-signal-path--a"></span>
        <span class="fm-signal-path fm-signal-path--b"></span>
        <span class="fm-signal-rail fm-signal-rail--a"></span>
        <span class="fm-signal-rail fm-signal-rail--b"></span>
        <span class="fm-signal-rail fm-signal-rail--c"></span>
        <small class="fm-signal-label">NATIVE / SIGNAL 01</small>
        <i v-for="node in 5" :key="`left-${node}`" class="fm-signal-node"></i>
      </div>
      <div class="fm-signal-field fm-signal-field--right">
        <span class="fm-signal-halo"></span>
        <span class="fm-signal-grid"></span>
        <span class="fm-signal-orbit fm-signal-orbit--outer"></span>
        <span class="fm-signal-orbit fm-signal-orbit--inner"></span>
        <span class="fm-signal-path fm-signal-path--a"></span>
        <span class="fm-signal-path fm-signal-path--b"></span>
        <span class="fm-signal-rail fm-signal-rail--a"></span>
        <span class="fm-signal-rail fm-signal-rail--b"></span>
        <span class="fm-signal-rail fm-signal-rail--c"></span>
        <small class="fm-signal-label">MUSIC / SYSTEM 02</small>
        <i v-for="node in 5" :key="`right-${node}`" class="fm-signal-node"></i>
      </div>
    </div>

    <PortfolioHeader />

    <main>
      <header class="fm-hero fm-reveal">
        <div class="fm-hero-copy">
          <p class="fm-kicker">{{ caseCopy.heroEyebrow }} · 2026</p>
          <h1>Mesting<br><span>Music</span></h1>
          <p class="fm-hero-lead">{{ caseCopy.heroLead }}</p>
          <div class="fm-hero-actions">
            <a
              class="fm-button fm-button-primary"
              href="https://github.com/Mesting42/mesting-music-flutter/releases/download/flutter-music-v1.0.37/Mesting-Music-Flutter-v1.0.37.apk"
              target="_blank"
              rel="noreferrer"
            >
              {{ caseCopy.download }} <span>↓</span>
            </a>
            <a
              class="fm-button fm-button-secondary"
              href="https://github.com/Mesting42/mesting-music-flutter"
              target="_blank"
              rel="noreferrer"
            >
              {{ caseCopy.sourceCode }} ↗
            </a>
            <a class="fm-button fm-button-secondary" href="#capabilities">{{ caseCopy.exploreFeatures }}</a>
          </div>
        </div>

        <div class="fm-hero-aside">
          <p>{{ caseCopy.snapshot }}</p>
          <dl>
            <div><dt>Flutter</dt><dd>{{ caseCopy.nativeAndroid }}</dd></div>
            <div><dt>25</dt><dd>{{ caseCopy.visualThemes }}</dd></div>
            <div><dt>1.0.37</dt><dd>{{ caseCopy.currentRelease }}</dd></div>
            <div><dt>1.0.38</dt><dd>{{ caseCopy.javaBackendTest }}</dd></div>
          </dl>
        </div>
      </header>

      <section
        class="fm-product-stage fm-reveal"
        :aria-label="caseCopy.applicationInterface"
        @pointermove="handleStagePointer"
        @pointerleave="resetStagePointer"
      >
        <div class="fm-stage-orbit fm-stage-orbit-a" aria-hidden="true"></div>
        <div class="fm-stage-orbit fm-stage-orbit-b" aria-hidden="true"></div>
        <div class="fm-stage-word" aria-hidden="true">MESTING</div>

        <div class="fm-stage-copy">
          <div class="fm-stage-brand">
            <img src="/generated/flutter-music/brand-lockup.webp" alt="Mesting Music" decoding="async">
          </div>
          <p>{{ caseCopy.makeListeningPersonal }}</p>
          <h2>
            <span v-for="line in caseCopy.stageTitle" :key="line">{{ line }}</span>
          </h2>
          <div class="fm-stage-tags" :aria-label="caseCopy.coreCapabilities">
            <span v-for="tag in caseCopy.stageTags" :key="tag">{{ tag }}</span>
          </div>
        </div>

        <div class="fm-phone-wrap">
          <div class="fm-phone" aria-label="Flutter recommendation screen">
            <div class="fm-phone-speaker" aria-hidden="true"></div>
            <img
              src="/generated/flutter-music/recommendation.webp"
              alt="Mesting Music recommendation screen with personal mixes, daily picks, and mood-based listening"
              decoding="async"
            >
          </div>
          <span class="fm-phone-note fm-phone-note-a">{{ caseCopy.nativeDiscovery }} <b>01</b></span>
          <span class="fm-phone-note fm-phone-note-b">{{ caseCopy.capsulePlayer }} <b>02</b></span>
        </div>
      </section>

      <section class="fm-manifesto fm-reveal">
        <p class="fm-kicker">{{ caseCopy.ideaEyebrow }}</p>
        <div>
          <h2>{{ caseCopy.ideaTitle[0] }}<br><span>{{ caseCopy.ideaTitle[1] }}</span></h2>
          <p>{{ caseCopy.ideaText }}</p>
        </div>
      </section>

      <section id="capabilities" class="fm-capabilities" aria-labelledby="fm-capabilities-title">
        <header class="fm-section-heading fm-reveal">
          <p class="fm-kicker">{{ caseCopy.realScreens }} / {{ featureCount }} {{ caseCopy.functions }}</p>
          <h2 id="fm-capabilities-title">{{ caseCopy.capabilitiesTitle[0] }}<br><span>{{ caseCopy.capabilitiesTitle[1] }}</span></h2>
        </header>

        <div class="fm-feature-stories">
          <article
            v-for="(group, index) in featureGroups"
            :key="group.eyebrow"
            class="fm-feature-story fm-reveal"
            :class="{ 'is-reversed': index % 2 === 1 }"
          >
            <div class="fm-feature-copy">
              <span>{{ String(index + 1).padStart(2, '0') }}</span>
              <p>{{ group.eyebrow }} / {{ group.items.length }} {{ caseCopy.capabilities }}</p>
              <h3 :aria-label="group.title">
                <span
                  v-for="line in featureTitleLines[group.eyebrow]"
                  :key="line"
                  aria-hidden="true"
                >
                  {{ line }}
                </span>
              </h3>
              <strong>{{ group.summary }}</strong>
              <ul>
                <li v-for="item in group.items.slice(0, 4)" :key="item">{{ item }}</li>
              </ul>
            </div>
            <div
              class="fm-feature-gallery"
              :data-count="featureVisuals[group.eyebrow].length"
              :style="{ '--shot-count': featureVisuals[group.eyebrow].length }"
            >
              <figure
                v-for="(shot, shotIndex) in featureVisuals[group.eyebrow]"
                :key="shot.src"
                class="fm-device-card"
                :style="{
                  '--device-tilt': `${shotIndex % 2 === 0 ? -1.6 : 1.6}deg`,
                  '--device-mobile-tilt': `${shotIndex % 2 === 0 ? -0.65 : 0.65}deg`,
                  '--device-order': shotIndex,
                  '--screen-scroll-offset': shot.scrollOffset || '-35%',
                  '--screen-scroll-duration': shot.scrollDuration || '11s',
                  '--screen-scroll-delay': `${0.7 + shotIndex * 0.16}s`
                }"
              >
                <div class="fm-device-shell">
                  <span class="fm-device-speaker" aria-hidden="true"></span>
                  <div
                    class="fm-device-screen"
                    :class="{ 'fm-device-screen--scroll-preview': shot.scrollPreview }"
                  >
                    <img
                      :src="shot.src"
                      :alt="shot.alt"
                      :loading="index === 0 ? 'eager' : 'lazy'"
                      :fetchpriority="index === 0 ? 'high' : 'low'"
                      decoding="async"
                    >
                  </div>
                </div>
                <figcaption>{{ shot.caption }}</figcaption>
              </figure>
            </div>
          </article>
        </div>
      </section>

      <section class="fm-next fm-reveal">
        <div class="fm-next-copy">
          <div class="fm-next-heading">
            <p class="fm-kicker">{{ caseCopy.continueExploring }}</p>
            <span class="fm-next-sequence" aria-hidden="true">01 <i></i> 02</span>
          </div>
          <h2>
            <span v-for="line in caseCopy.nextTitleLines" :key="line">{{ line }}</span>
          </h2>
          <p class="fm-next-description">{{ caseCopy.nextDescription }}</p>
          <div class="fm-next-actions">
            <router-link to="/music">{{ caseCopy.enterMusic }} <span>↗</span></router-link>
            <p><b>Flutter App</b><i>→</i><b>Web Sound Space</b></p>
          </div>
        </div>

        <div class="fm-next-portal" aria-hidden="true">
          <div class="fm-next-portal-frame">
            <img src="/generated/flutter-music/midnight-launch.webp" alt="" loading="lazy" decoding="async">
            <span class="fm-next-portal-dot"></span>
            <div class="fm-next-portal-copy">
              <small>NOW OPEN / 02</small>
              <strong>Mesting Music</strong>
              <span>LISTEN ON THE WEB</span>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="fm-footer fm-reveal">
      <router-link :to="projectReturnTarget">{{ caseCopy.backToProjects }} <span>↖</span></router-link>
      <div>
        <router-link to="/">{{ caseCopy.home }}</router-link>
        <router-link to="/articles">{{ caseCopy.thinking }}</router-link>
        <router-link to="/music">{{ caseCopy.music }}</router-link>
        <a href="mailto:mesting042@gmail.com">{{ caseCopy.contact }}</a>
      </div>
      <span>{{ caseCopy.spaceName }} / 2026</span>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { gsap } from 'gsap'
import { useRoute } from 'vue-router'
import PortfolioHeader from '../components/PortfolioHeader.vue'
import { useLocale } from '../composables/useLocale'

const caseRoot = ref(null)
const sideSignalFields = ref(null)
const { isChinese } = useLocale()
const route = useRoute()
let revealObserver = null
let sideSignalMedia = null

const caseCopy = computed(() => isChinese.value
  ? {
      heroEyebrow: '01 / 原生音乐产品',
      heroLead: '一款从网页体验持续生长为 Flutter 原生应用、再迁移到 Java 21、Spring Boot 与 MySQL 服务端的音乐产品。播放、视觉装扮、跨设备资料与社交关系，被放进同一个会呼吸的声音空间。',
      download: '下载 Android 版',
      sourceCode: '查看客户端源码',
      exploreFeatures: '查看完整功能',
      snapshot: '产品概览',
      nativeAndroid: '原生 Android',
      visualThemes: '套视觉主题',
      javaBackendTest: 'Java 后端测试版 · build 39',
      currentRelease: '公开稳定版 · build 38',
      applicationInterface: 'Mesting Music 应用界面',
      makeListeningPersonal: '让聆听更私人',
      stageTitle: ['不止播放一首歌，', '也记录每一种', '听歌状态。'],
      coreCapabilities: '核心能力',
      stageTags: ['个性推荐', '同步歌词', 'Java 服务', '一起听'],
      nativeDiscovery: '原生推荐流',
      capsulePlayer: '胶囊播放器',
      ideaEyebrow: '产品想法 / 从聆听到连接',
      ideaTitle: ['让音乐先理解此刻，', '再连接此刻的人。'],
      ideaText: '项目最初只是网页里的音乐模块，后来逐步重构成独立的 Flutter Android 应用；账号、同步与社交服务又从 CloudBase 主后端迁移到 Java 21、Spring Boot 4.1 和 MySQL 8。产品没有停留在“能播放”，工程也没有停留在“能调用接口”，而是持续建立可恢复、可校验的完整体验。',
      realScreens: '真实产品界面',
      functions: '项功能',
      capabilitiesTitle: ['每一项能力，', '都由真实界面说明。'],
      capabilities: '项能力',
      continueExploring: '继续探索',
      nextTitle: '进入与它相连的网页声音空间。',
      nextTitleLines: ['进入与你相连的', '网页声音空间。'],
      nextDescription: '从原生播放、收藏与发现，继续走进为桌面浏览而设计的声音空间。',
      enterMusic: '进入声音空间',
      backToProjects: '返回作品',
      home: '首页',
      thinking: '文章',
      music: '音乐',
      contact: '联系',
      spaceName: 'Mesting 个人数字空间'
    }
  : {
      heroEyebrow: '01 / NATIVE MUSIC PRODUCT',
      heroLead: 'A music product that grew from the web into a native Flutter application, then moved its service backend to Java 21, Spring Boot, and MySQL. Playback, visual identity, cross-device data, and social connection now live in one coherent sound space.',
      download: 'Download for Android',
      sourceCode: 'View Client Source',
      exploreFeatures: 'Explore All Features',
      snapshot: 'PRODUCT SNAPSHOT',
      nativeAndroid: 'Native Android',
      visualThemes: 'Visual themes',
      javaBackendTest: 'Java backend test · build 39',
      currentRelease: 'Public stable · build 38',
      applicationInterface: 'Mesting Music application interface',
      makeListeningPersonal: 'MAKE LISTENING PERSONAL',
      stageTitle: ['More than playing', 'a song. Every', 'listening mood', 'becomes part of', 'the story.'],
      coreCapabilities: 'Core capabilities',
      stageTags: ['Personal Discovery', 'Synced Lyrics', 'Java Services', 'Listen Together'],
      nativeDiscovery: 'Native discovery',
      capsulePlayer: 'Capsule player',
      ideaEyebrow: 'PRODUCT IDEA / FROM LISTENING TO CONNECTION',
      ideaTitle: ['Let music understand the moment,', 'then connect the people inside it.'],
      ideaText: 'The project began as a web music module and became an independent Flutter Android application. Accounts, synchronization, and social data then moved from a CloudBase-primary backend to Java 21, Spring Boot 4.1, and MySQL 8. The product goes beyond playback, while the engineering work goes beyond merely making an endpoint respond.',
      realScreens: 'REAL PRODUCT SCREENS',
      functions: 'FUNCTIONS',
      capabilitiesTitle: ['Every capability,', 'explained through a real interface.'],
      capabilities: 'CAPABILITIES',
      continueExploring: 'CONTINUE EXPLORING',
      nextTitle: 'Explore its companion web sound space.',
      nextTitleLines: ['Continue into its', 'companion sound space.'],
      nextDescription: 'Let the native listening flow continue in a web space made for slower browsing, saved ideas, and sound.',
      enterMusic: 'Enter the Music Space',
      backToProjects: 'Back to Projects',
      home: 'Home',
      thinking: 'Thinking',
      music: 'Music',
      contact: 'Contact',
      spaceName: 'Mesting Personal Space'
    })

const projectReturnTarget = computed(() => {
  const fromProject = route.query.fromProject
  const projectAnchor = typeof fromProject === 'string' && /^project-[a-z0-9-]+$/.test(fromProject)
    ? fromProject
    : 'projects'

  return { path: '/', hash: `#${projectAnchor}` }
})

const featureVisuals = {
  DISCOVER: [
    {
      src: '/generated/flutter-music/optimized-screens/discover.webp',
      alt: 'Mesting Music discovery screen with featured playlists, popular tracks, and curated collections',
      caption: 'Music Discovery / Playlists and popular releases'
    },
    {
      src: '/generated/flutter-music/optimized-screens/mood-status.webp',
      alt: 'Mesting Music mood panel for finding music by feeling and context',
      caption: 'Mood Discovery / Let the moment choose what plays next'
    }
  ],
  PLAY: [
    {
      src: '/generated/flutter-music/optimized-screens/player-liquid.webp',
      alt: 'Mesting Music Liquid Spectrum player with reactive visuals, shared listening, and full playback controls',
      caption: 'Liquid Spectrum / Reactive full-screen player'
    },
    {
      src: '/generated/flutter-music/optimized-screens/playlist-detail.webp',
      alt: 'Mesting Music personal playlist with play-all, add-track, and management controls',
      caption: 'Personal Playlist / Play, add, and manage'
    }
  ],
  COLLECT: [
    {
      src: '/generated/flutter-music/optimized-screens/favorites.webp',
      alt: 'Mesting Music favorites screen showing saved tracks and current playback',
      caption: 'Favorites / A personal archive of loved sounds'
    },
    {
      src: '/generated/flutter-music/optimized-screens/history-ranking.webp',
      alt: 'Mesting Music listening ranking based on completed plays',
      caption: 'Listening Ranking / Preference measured through plays'
    },
    {
      src: '/generated/flutter-music/optimized-screens/history-recent.webp',
      alt: 'Mesting Music recent history with tracks and playback times',
      caption: 'Recently Played / Return to anything you heard'
    }
  ],
  DRESS: [
    {
      src: '/generated/flutter-music/optimized-screens/dress-system.webp',
      alt: 'Mesting Music appearance settings with brand kits, player styles, progress characters, and motion effects',
      caption: 'Complete Styling System / Brand, player, and character',
      scrollPreview: true,
      scrollOffset: '-35%',
      scrollDuration: '12s'
    },
    {
      src: '/generated/flutter-music/optimized-screens/theme-shinchan.webp',
      alt: 'Mesting Music Crayon Shin-chan theme and custom background',
      caption: 'Crayon Shin-chan / Scene-based themes',
      scrollPreview: true,
      scrollOffset: '-13%'
    },
    {
      src: '/generated/flutter-music/optimized-screens/theme-kuromi.webp',
      alt: 'Mesting Music Kuromi static and animated themes',
      caption: 'Kuromi / Static and animated themes'
    },
    {
      src: '/generated/flutter-music/optimized-screens/theme-kitty.webp',
      alt: 'Mesting Music Hello Kitty static and animated themes',
      caption: 'Hello Kitty / Sweet visual collection'
    }
  ],
  CONNECT: [
    {
      src: '/generated/flutter-music/optimized-screens/friends.webp',
      alt: 'Mesting Music friends screen with following, followers, and mutual connections',
      caption: 'Connections / Following, followers, and mutuals'
    },
    {
      src: '/generated/flutter-music/optimized-screens/chat.webp',
      alt: 'Mesting Music chat with image, video, and voice messages',
      caption: 'Music Social / Text, images, video, and voice'
    }
  ],
  SYSTEM: [
    {
      src: '/generated/flutter-music/optimized-screens/profile-home.webp',
      alt: 'Mesting Music personal space combining playlists, listening history, connections, and themes',
      caption: 'Personal Music Space / Profile and content overview'
    },
    {
      src: '/generated/flutter-music/optimized-screens/profile-edit.webp',
      alt: 'Mesting Music profile editor for avatar, background, nickname, and personal information',
      caption: 'Account Profile / Consistent across the experience',
      scrollPreview: true,
      scrollOffset: '-18%'
    }
  ]
}

const featureTitleLinesEn = {
  DISCOVER: ['Discovery &', 'Recommendation'],
  PLAY: ['Playback', 'System'],
  COLLECT: ['Favorites &', 'Archive'],
  DRESS: ['Themes &', 'Player Styles'],
  CONNECT: ['Accounts &', 'Friends Together'],
  SYSTEM: ['Java Services &', 'Native Android']
}

const featureGroupsEn = [
  {
    eyebrow: 'DISCOVER',
    title: 'Discovery & Recommendation',
    summary: 'Fresh playable content shaped by time, context, and real listening behavior.',
    items: ['Personalized home feed and time-aware prompts', 'Daily picks and a private mix for today', 'Horizontally browsable discovery playlists', 'Listening modes for commuting, relaxing, focusing, and sleep', 'Online search, query suggestions, and trending terms', 'Dynamic personal radio with continuous playback', 'Combined discovery for local and online music']
  },
  {
    eyebrow: 'PLAY',
    title: 'Complete Playback System',
    summary: 'From the first tap to background continuation, every playback path stays consistent and controllable.',
    items: ['Capsule player with shared-element entry into the record view', 'Previous, next, shuffle, and repeat modes', 'Global queue with source-aware library continuation', 'Automatic track changes and intelligent prefetching', 'Synced lyrics with an immersive lyric view and sung-line fading', 'Notification controls with synchronized favorite state', 'Background playback, lock-screen controls, and volume fade on pause', 'Continuous title marquee and swipe-based track switching']
  },
  {
    eyebrow: 'COLLECT',
    title: 'Favorites & Listening Archive',
    summary: 'Favorites, playlists, and listening history become a personal archive that keeps growing.',
    items: ['Global synchronization for favorites and saved states', 'Create, edit, and manage personal playlists', 'Add tracks to playlists directly from Favorites', 'Playlist details, play-all, and per-track actions', 'Listening footprint, recent history, and ranking', 'Cloud recovery for play counts, history, and playlist covers']
  },
  {
    eyebrow: 'DRESS',
    title: 'Themes & Player Identity',
    summary: 'The visuals can change with the mood without interrupting familiar playback behavior.',
    items: ['25 static and animated visual themes', 'Classic light, dark, and system-following modes', 'Player stages including Luminous Vinyl, Orbital Pulse, and Liquid Spectrum', 'Character-driven progress indicators and themed playlists', 'Custom image backgrounds', 'Custom muted-video backgrounds', 'Launch screen synchronized with the saved theme']
  },
  {
    eyebrow: 'CONNECT',
    title: 'Accounts, Friends & Listening Together',
    summary: 'Music extends beyond a private collection into real relationships and shared playback.',
    items: ['Registration and sign-in with email or phone number', 'Avatar, nickname, bio, age, and zodiac profile data', 'Following, followers, mutuals, and block lists', 'User search, public profiles, and personal notes', 'Private text, emoji, image, video, and voice messages', 'Unread badges and Android notifications', 'Invite mutual friends into a shared listening room', 'Synchronized playback, progress, and track state']
  },
  {
    eyebrow: 'SYSTEM',
    title: 'Java Services & Native Android',
    summary: 'A local-first Flutter client now connects to an independently versioned service platform without surrendering playback continuity.',
    items: ['Java 21 and Spring Boot 4.1 compatibility API', 'Spring Security, JWT, email and phone account recovery', 'MySQL 8 relational data with versioned Flyway migrations', 'Verified migration of accounts, playlists, messages, and playback history', 'Nginx and systemd deployment on a Tencent Cloud CVM test environment', 'Android sharing, notifications, gestures, and lifecycle recovery', 'CloudBase retained only for transitional update-manifest and APK hosting']
  }
]

const featureTitleLinesZh = {
  DISCOVER: ['推荐与', '发现'],
  PLAY: ['完整播放', '系统'],
  COLLECT: ['收藏与', '音乐档案'],
  DRESS: ['主题与', '播放器装扮'],
  CONNECT: ['账号、好友', '与一起听'],
  SYSTEM: ['Java 服务平台', '与 Android 原生']
}

const featureGroupsZh = [
  {
    eyebrow: 'DISCOVER',
    title: '推荐与发现',
    summary: '根据时间、场景和真实播放行为，持续提供新鲜且可播放的内容。',
    items: ['个性推荐首页与趣味时段短句', '每日推荐与今日私人混合', '发现音乐横向歌单流', '通勤、放松、专注、入睡场景入口', '在线搜索、输入联想与热搜词', '动态私人电台连续播放', '本地音乐与在线音乐混合发现']
  },
  {
    eyebrow: 'PLAY',
    title: '完整播放系统',
    summary: '从点击到后台续播，每一条播放路径都保持一致、可控。',
    items: ['胶囊播放器与共享元素进入唱片页', '上一首、下一首、随机与循环模式', '全局队列与来源感知的曲库续播', '自动切歌与智能预取', '同步歌词、沉浸歌词与已唱行淡出', '通知栏控制与收藏状态同步', '后台播放、锁屏控制与暂停渐弱', '长标题走马灯与左右滑动切歌']
  },
  {
    eyebrow: 'COLLECT',
    title: '收藏与音乐档案',
    summary: '喜欢、歌单和听歌记录不只是临时状态，而是可持续积累的个人档案。',
    items: ['喜欢与收藏状态全局同步', '创建、编辑与管理个人歌单', '从喜欢列表快速加入歌单', '歌单详情、播放全部与单曲操作', '听歌足迹、最近播放与排行', '播放次数、历史记录与歌单封面云恢复']
  },
  {
    eyebrow: 'DRESS',
    title: '主题与播放器装扮',
    summary: '视觉可以随心情变化，但不会打断熟悉的播放操作。',
    items: ['25 套静态与动态主题', '经典浅色、深色与跟随系统模式', '流光唱片、星环脉冲与液态光谱播放器', '角色进度条与主题歌单', '自定义图片背景', '自定义静音循环视频背景', '启动页与已保存主题同步']
  },
  {
    eyebrow: 'CONNECT',
    title: '账号、好友与一起听',
    summary: '把音乐从私人收藏延伸到真实关系与共同播放。',
    items: ['邮箱与手机号注册登录', '头像、昵称、简介、年龄和星座资料', '关注、粉丝、互相关注与黑名单', '用户搜索、个人主页与备注名', '私聊文字、表情、图片、视频与语音', '未读徽标与 Android 通知', '邀请互关好友进入一起听房间', '播放、进度与曲目状态同步']
  },
  {
    eyebrow: 'SYSTEM',
    title: 'Java 服务平台与 Android 原生能力',
    summary: '本地优先的 Flutter 客户端连接可独立演进的服务平台，同时保留连续播放与原生系统体验。',
    items: ['Java 21 与 Spring Boot 4.1 兼容 API', 'Spring Security、JWT 与邮箱/手机号账号恢复', 'MySQL 8 关系数据与 Flyway 版本化迁移', '账号、歌单、私信与播放历史迁移核验', 'Nginx、systemd 与腾讯云 CVM 测试部署', 'Android 分享、通知、手势与生命周期恢复', 'CloudBase 仅保留过渡期更新清单和 APK 托管']
  }
]

const featureTitleLines = computed(() => isChinese.value ? featureTitleLinesZh : featureTitleLinesEn)
const featureGroups = computed(() => isChinese.value ? featureGroupsZh : featureGroupsEn)
const featureCount = computed(() => featureGroups.value.reduce((total, group) => total + group.items.length, 0))

const handleStagePointer = (event) => {
  if (!event.currentTarget || window.matchMedia('(pointer: coarse)').matches) return
  const bounds = event.currentTarget.getBoundingClientRect()
  const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2
  const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2
  event.currentTarget.style.setProperty('--stage-x', `${x * 9}px`)
  event.currentTarget.style.setProperty('--stage-y', `${y * 7}px`)
}

const resetStagePointer = (event) => {
  event.currentTarget?.style.setProperty('--stage-x', '0px')
  event.currentTarget?.style.setProperty('--stage-y', '0px')
}

const setupSideSignalMotion = () => {
  if (!sideSignalFields.value) return

  sideSignalMedia = gsap.matchMedia()
  sideSignalMedia.add({
    desktop: '(min-width: 1500px)',
    reducedMotion: '(prefers-reduced-motion: reduce)'
  }, context => {
    if (!context.conditions.desktop || context.conditions.reducedMotion) return undefined

    const scope = sideSignalFields.value
    const leftNodes = gsap.utils.toArray('.fm-signal-field--left .fm-signal-node', scope)
    const rightNodes = gsap.utils.toArray('.fm-signal-field--right .fm-signal-node', scope)
    const orbits = gsap.utils.toArray('.fm-signal-orbit--outer', scope)
    const innerOrbits = gsap.utils.toArray('.fm-signal-orbit--inner', scope)
    const paths = gsap.utils.toArray('.fm-signal-path', scope)
    const halos = gsap.utils.toArray('.fm-signal-halo', scope)
    const rails = gsap.utils.toArray('.fm-signal-rail', scope)
    const labels = gsap.utils.toArray('.fm-signal-label', scope)
    const fields = gsap.utils.toArray('.fm-signal-field', scope)

    const intro = gsap.timeline({ defaults: { ease: 'power2.out' } })
    intro
      .fromTo(fields, { autoAlpha: 0 }, { autoAlpha: 1, duration: .5, stagger: .08 }, 0)
      .fromTo(halos, { autoAlpha: 0, scale: .8 }, { autoAlpha: 1, scale: 1, duration: .9, stagger: .1 }, .06)
      .fromTo([...orbits, ...innerOrbits], { autoAlpha: 0, scale: .84 }, { autoAlpha: 1, scale: 1, duration: .82, stagger: .06 }, .12)
      .fromTo(paths, { autoAlpha: 0, xPercent: -12 }, { autoAlpha: 1, xPercent: 0, duration: .7, stagger: .08 }, .18)
      .fromTo(rails, { autoAlpha: 0, yPercent: 18 }, { autoAlpha: 1, yPercent: 0, duration: .7, stagger: .06 }, .22)
      .fromTo([...leftNodes, ...rightNodes], { autoAlpha: 0, scale: .45 }, { autoAlpha: 1, scale: 1, duration: .45, stagger: .05 }, .32)
      .fromTo(labels, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: .42, stagger: .06 }, .42)

    const drift = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut' } })
    drift
      .to(leftNodes, { x: 7, y: -10, duration: 9.5, stagger: .3 }, 0)
      .to(rightNodes, { x: -7, y: 9, duration: 10.5, stagger: .28 }, .5)
      .to(paths, { y: -7, duration: 12, stagger: .4 }, 0)

    const rotation = gsap.to(orbits, {
      rotation: 360,
      duration: 70,
      repeat: -1,
      ease: 'none',
      transformOrigin: '50% 50%'
    })
    const counterRotation = gsap.to(innerOrbits, {
      rotation: -360,
      duration: 54,
      repeat: -1,
      ease: 'none',
      transformOrigin: '50% 50%'
    })
    const pulse = gsap.to([...leftNodes, ...rightNodes], {
      opacity: .82,
      scale: 1.22,
      duration: 4.4,
      stagger: .24,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })
    const haloPulse = gsap.to(halos, {
      scale: 1.05,
      opacity: .56,
      duration: 8.2,
      stagger: .6,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })
    const railDrift = gsap.to(rails, {
      yPercent: -10,
      duration: 10.8,
      stagger: .2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })
    return () => {
      intro.kill()
      drift.kill()
      rotation.kill()
      counterRotation.kill()
      pulse.kill()
      haloPulse.kill()
      railDrift.kill()
    }
  })
}

onMounted(() => {
  setupSideSignalMotion()
  const nodes = caseRoot.value?.querySelectorAll('.fm-reveal')
  if (!nodes?.length || !('IntersectionObserver' in window)) {
    nodes?.forEach(node => node.classList.add('is-visible'))
    return
  }

  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const shouldReveal = entry.isIntersecting && entry.intersectionRatio >= 0.08
      if (entry.target.classList.contains('fm-feature-story')) {
        entry.target.classList.toggle('is-preview-active', entry.isIntersecting)
      }
      // A section is deliberately reset after it leaves the viewport. This
      // lets the same entrance play again when readers reverse direction,
      // instead of making the first downward pass the only animated one.
      entry.target.classList.toggle('is-visible', shouldReveal)
    })
  }, { threshold: [0, 0.08, 0.2], rootMargin: '0px 0px -6% 0px' })

  nodes.forEach(node => revealObserver.observe(node))
})

onUnmounted(() => {
  revealObserver?.disconnect()
  sideSignalMedia?.revert()
})
</script>

<style>
@import '../css/FlutterMusicCase.css';
</style>
