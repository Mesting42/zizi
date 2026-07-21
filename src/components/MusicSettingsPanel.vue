<template>
  <Teleport to="body">
    <Transition name="music-settings-fade">
      <div v-if="visible" class="music-settings-overlay" @click.self="closePanel">
        <section :class="['music-settings-panel', `active-ip-${activeIp}`, `active-preset-${settings.preset}`]" role="dialog" aria-modal="true" aria-labelledby="music-settings-title">
          <button class="music-settings-close music-settings-close-fixed" type="button" aria-label="关闭音乐设置" @click="closePanel">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true">
              <path d="m7 7 10 10M17 7 7 17" />
            </svg>
          </button>
          <div class="music-settings-scroll">
          <header class="music-settings-header">
            <div>
              <span class="music-settings-kicker">MUSIC SPACE</span>
              <h2 id="music-settings-title">音乐设置</h2>
              <p>换一张背景，或者让喜欢的视频在音乐首页静音循环。</p>
            </div>
          </header>

          <div class="music-settings-preview" :class="[`is-${settings.mediaKind || 'default'}`, `preset-${settings.preset}`]">
            <div class="music-settings-preview-art">
              <span>{{ activeIpMeta.symbol }}</span>
              <strong>{{ modeLabel }}</strong>
            </div>
            <div class="music-settings-preview-meta">
              <span>{{ previewDescription }}</span>
              <button v-if="hasCustomMedia && settings.mode === 'default'" type="button" @click="useCustomBackground">
                重新使用
              </button>
            </div>
          </div>

          <div class="music-settings-section">
            <div class="music-settings-section-title">
              <strong>主题背景</strong>
              <span>先选 IP，再选择静态或动态场景</span>
            </div>
            <nav class="music-ip-tabs" aria-label="音乐主题 IP 分类">
              <button
                v-for="ip in MUSIC_IPS"
                :key="ip.id"
                type="button"
                :class="[`is-${ip.id}`, { active: activeIp === ip.id }]"
                :aria-pressed="activeIp === ip.id"
                @click="selectThemeIp(ip.id)"
              >
                <span class="music-ip-tab-avatar" aria-hidden="true">
                  <img :src="ip.avatar" :alt="`${ip.name}角色`" loading="lazy" decoding="async" />
                </span>
                <span><strong>{{ ip.name }}</strong><small>{{ ip.eyebrow }}</small></span>
              </button>
            </nav>
            <div class="music-preset-groups">
              <section v-for="group in presetGroups" :key="group.id" class="music-preset-group">
                <header class="music-preset-group-header">
                  <span>
                    <i :class="{ moving: group.id === 'motion' }"></i>
                    {{ group.name }}
                  </span>
                  <small>{{ group.description }} · {{ group.presets.length }} 套</small>
                </header>
                <div class="music-preset-grid">
                  <button
                    v-for="preset in group.presets"
                    :key="preset.id"
                    class="music-preset-card"
                    :class="[`is-${preset.id}`, { active: settings.mode === 'default' && settings.preset === preset.id }]"
                    type="button"
                    @click="selectPreset(preset.id)"
                  >
                    <span class="music-preset-check">✓</span>
                    <span v-if="preset.type === 'motion'" class="music-preset-motion-badge">
                      <i></i>动态
                    </span>
                    <strong>{{ preset.name }}</strong>
                    <small>{{ preset.caption }}</small>
                  </button>
                </div>
              </section>
            </div>
          </div>

          <div class="music-settings-section">
            <div class="music-settings-section-title">
              <strong>自定义主题</strong>
              <span>背景、进度条与角色可自由搭配；文件只保存在你的浏览器里</span>
            </div>
            <div class="music-settings-actions">
              <button type="button" :class="{ active: settings.mode === 'default' }" @click="useDefaultBackground">
                <span class="action-icon">↺</span>
                恢复主题
              </button>
              <label class="music-upload-action">
                <span class="action-icon">▧</span>
                选择图片
                <input type="file" accept="image/*" @change="event => selectFile(event, 'image')" />
              </label>
              <label class="music-upload-action">
                <span class="action-icon">▶</span>
                选择视频
                <input type="file" accept="video/mp4,video/webm,video/ogg,video/*" @change="event => selectFile(event, 'video')" />
              </label>
            </div>
            <p v-if="statusMessage" class="music-settings-status" :class="{ error: hasError }">{{ statusMessage }}</p>
          </div>

          <div class="music-settings-section music-custom-theme-options">
            <div class="music-settings-section-title">
              <strong>进度条样式</strong>
              <span>不改变背景，单独选择进度条的配色与质感</span>
            </div>
            <div class="music-theme-choice-grid" aria-label="进度条样式">
              <button type="button" :class="{ active: settings.progressStyle === 'theme' }" @click="settings.progressStyle = 'theme'">
                <i class="theme-choice-dot is-theme"></i><span>跟随主题</span>
              </button>
              <button type="button" :class="{ active: settings.progressStyle === 'classic' }" @click="settings.progressStyle = 'classic'">
                <i class="theme-choice-dot is-classic"></i><span>经典</span>
              </button>
              <button type="button" :class="{ active: settings.progressStyle === 'shinchan' }" @click="settings.progressStyle = 'shinchan'">
                <img class="theme-choice-avatar is-shinchan" src="/images/ip-themes/shinchan-progress-head.png" alt="" /><span>小新</span>
              </button>
              <button type="button" :class="{ active: settings.progressStyle === 'hello-kitty' }" @click="settings.progressStyle = 'hello-kitty'">
                <img class="theme-choice-avatar is-hello-kitty" src="/images/ip-themes/hello-kitty-progress-head.png" alt="" /><span>Hello Kitty</span>
              </button>
              <button type="button" :class="{ active: settings.progressStyle === 'kuromi' }" @click="settings.progressStyle = 'kuromi'">
                <img class="theme-choice-avatar is-kuromi" src="/images/ip-themes/kuromi-progress-head.png" alt="" /><span>库洛米</span>
              </button>
            </div>

            <div class="music-settings-section-title music-character-choice-title">
              <strong>跟随进度条的角色</strong>
              <span>可以与当前背景和进度条样式任意搭配</span>
            </div>
            <div class="music-theme-choice-grid" aria-label="进度条角色">
              <button type="button" :class="{ active: settings.progressCharacter === 'theme' }" @click="settings.progressCharacter = 'theme'">
                <i class="theme-choice-character is-theme">随</i><span>跟随主题</span>
              </button>
              <button type="button" :class="{ active: settings.progressCharacter === 'classic' }" @click="settings.progressCharacter = 'classic'">
                <i class="theme-choice-character is-classic"></i><span>经典圆点</span>
              </button>
              <button type="button" :class="{ active: settings.progressCharacter === 'shinchan' }" @click="settings.progressCharacter = 'shinchan'">
                <img class="theme-choice-avatar is-shinchan" src="/images/ip-themes/shinchan-progress-head.png" alt="" /><span>蜡笔小新</span>
              </button>
              <button type="button" :class="{ active: settings.progressCharacter === 'hello-kitty' }" @click="settings.progressCharacter = 'hello-kitty'">
                <img class="theme-choice-avatar is-hello-kitty" src="/images/ip-themes/hello-kitty-progress-head.png" alt="" /><span>Hello Kitty</span>
              </button>
              <button type="button" :class="{ active: settings.progressCharacter === 'kuromi' }" @click="settings.progressCharacter = 'kuromi'">
                <img class="theme-choice-avatar is-kuromi" src="/images/ip-themes/kuromi-progress-head.png" alt="" /><span>库洛米</span>
              </button>
            </div>
          </div>

          <div class="music-settings-section music-settings-controls">
            <div v-if="isClassicTheme" class="music-settings-section-title">
              <strong>界面配色</strong>
              <span>视频上传后会按画面明暗自动适配，也可手动切换</span>
            </div>
            <div v-if="isClassicTheme" class="music-theme-choice-grid music-appearance-choice-grid" aria-label="界面配色">
              <button type="button" :class="{ active: settings.customAppearance === 'auto' }" @click="settings.customAppearance = 'auto'">
                <i class="theme-choice-character is-theme">自</i><span>自动适配</span>
              </button>
              <button type="button" :class="{ active: settings.customAppearance === 'sunny' }" @click="settings.customAppearance = 'sunny'">
                <i class="theme-choice-character is-sunny">☀</i><span>阳光模式</span>
              </button>
              <button type="button" :class="{ active: settings.customAppearance === 'dark' }" @click="settings.customAppearance = 'dark'">
                <i class="theme-choice-character is-night">☾</i><span>暗色模式</span>
              </button>
            </div>
            <label class="music-setting-row">
              <span>
                <strong>背景显示强度</strong>
                <small>内容看不清时可以调低一点</small>
              </span>
              <span class="music-range-wrap">
                <input v-model.number="settings.intensity" type="range" min="20" max="85" step="1" />
                <em>{{ settings.intensity }}%</em>
              </span>
            </label>

            <label v-if="!isClassicTheme" class="music-setting-row">
              <span>
                <strong>IP 角色装饰</strong>
                <small>根据当前主题显示对应角色、贴纸与场景元素</small>
              </span>
              <span class="music-switch">
                <input v-model="settings.showShinchan" type="checkbox" />
                <i></i>
              </span>
            </label>
          </div>

          <footer class="music-settings-footer">
            <button v-if="hasCustomMedia" class="music-settings-reset" type="button" @click="removeCustomBackground">
              删除自定义背景
            </button>
            <span>视频会自动静音，不会盖住正在播放的音乐。</span>
          </footer>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useMusicBackground } from '../composables/useMusicBackground'
import { MUSIC_IPS, MUSIC_THEME_PRESETS, getMusicIp, getMusicThemeIp } from '../config/musicThemeCatalog'

const props = defineProps({
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])

const {
  settings,
  hasCustomMedia,
  setCustomBackground,
  useDefaultBackground,
  usePresetBackground,
  useCustomBackground,
  clearCustomBackground
} = useMusicBackground()

const statusMessage = ref('')
const hasError = ref(false)

const backgroundPresets = MUSIC_THEME_PRESETS
const activeIp = ref(getMusicThemeIp(settings.preset))
const isClassicTheme = computed(() => settings.mode === 'custom' || settings.preset === 'classic')

const presetGroups = computed(() => [
  {
    id: 'static',
    name: '静态主题',
    description: '安静耐看的固定画面',
    presets: backgroundPresets.filter(preset => preset.ip === activeIp.value && preset.type === 'static')
  },
  {
    id: 'motion',
    name: '动态主题',
    description: '角色与场景持续运动',
    presets: backgroundPresets.filter(preset => preset.ip === activeIp.value && preset.type === 'motion')
  }
].filter(group => group.presets.length))

const activePreset = computed(() => (
  backgroundPresets.find(preset => preset.id === settings.preset) || backgroundPresets[0]
))
const activeIpMeta = computed(() => getMusicIp(activePreset.value.ip))

const modeLabel = computed(() => {
  if (settings.mode !== 'custom') return activePreset.value.name
  return settings.mediaKind === 'video' ? '自定义视频' : '自定义图片'
})

// 本地文件名属于设备信息，不作为音乐设置界面的展示文案。
const previewDescription = computed(() => {
  if (settings.mode !== 'custom') return activePreset.value.description
  return settings.mediaKind === 'video' ? '已应用本地视频背景' : '已应用本地图片背景'
})

let themeSwitchTimer = 0

const playThemeSwitchTransition = () => {
  if (themeSwitchTimer) window.clearTimeout(themeSwitchTimer)

  document.body.classList.remove('music-theme-switching')
  void document.body.offsetWidth
  document.body.classList.add('music-theme-switching')

  themeSwitchTimer = window.setTimeout(() => {
    document.body.classList.remove('music-theme-switching')
    themeSwitchTimer = 0
  }, 560)
}

const selectPreset = (preset) => {
  document.body.classList.remove('dark-mode', 'theme-transitioning')
  playThemeSwitchTransition()
  usePresetBackground(preset)
  hasError.value = false
  statusMessage.value = `已切换为「${activePreset.value.name}」`
}

const selectThemeIp = (ipId) => {
  activeIp.value = ipId

  // 经典分类只有这一套主题，点分类时直接完成切换，不再要求重复点卡片。
  if (ipId === 'classic') selectPreset('classic')
}

watch(() => settings.preset, (preset) => {
  activeIp.value = getMusicThemeIp(preset)
})

watch(() => props.visible, (visible) => {
  if (visible) activeIp.value = getMusicThemeIp(settings.preset)
})

const closePanel = () => emit('close')

const selectFile = async (event, expectedKind) => {
  const input = event.target
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  hasError.value = false
  statusMessage.value = '正在保存背景...'
  try {
    const kind = await setCustomBackground(file)
    if (kind !== expectedKind) {
      statusMessage.value = kind === 'video' ? '已识别为视频背景' : '已识别为图片背景'
    } else {
      statusMessage.value = kind === 'video' ? '视频背景已生效' : '图片背景已生效'
    }
  } catch (error) {
    hasError.value = true
    statusMessage.value = error?.message || '背景保存失败，请换一个文件重试'
  }
}

const removeCustomBackground = async () => {
  await clearCustomBackground()
  hasError.value = false
  statusMessage.value = '已恢复默认背景'
}

const onKeydown = (event) => {
  if (props.visible && event.key === 'Escape') closePanel()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  if (themeSwitchTimer) window.clearTimeout(themeSwitchTimer)
  document.body.classList.remove('music-theme-switching')
})
</script>

<style scoped>
.music-settings-overlay {
  position: fixed;
  inset: 0;
  z-index: 12000;
  display: grid;
  place-items: center;
  padding: 1rem;
  background-color: rgba(15, 23, 42, 0.38);
  /*
   * Keep the first frame compositor-friendly. Fading a full-screen backdrop
   * blur together with the dialog makes some Android WebViews briefly expose
   * a bright offscreen texture while the layer is being promoted.
   */
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  isolation: isolate;
  contain: layout paint style;
}

.music-settings-panel {
  position: relative;
  width: min(680px, 100%);
  max-height: min(820px, calc(100vh - 2rem));
  overflow: hidden;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 28px;
  color: #24314a;
  background:
    radial-gradient(circle at 92% 4%, rgba(255, 226, 87, 0.25), transparent 32%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.94), rgba(246, 247, 255, 0.9));
  box-shadow: 0 30px 90px rgba(45, 57, 92, 0.24);
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  will-change: transform;
}

.music-settings-scroll {
  max-height: calc(min(820px, 100vh - 2rem) - 2px);
  overflow-y: auto;
  padding: 1.5rem;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.music-settings-scroll::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

.music-settings-header {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 1.25rem;
  padding-right: 3.6rem;
}

.music-settings-kicker {
  color: #ff5b6e;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.music-settings-header h2 {
  margin: 0.2rem 0 0.35rem;
  font-size: clamp(1.65rem, 4vw, 2.2rem);
}

.music-settings-header p {
  margin: 0;
  color: #7b879e;
  line-height: 1.7;
}

.music-settings-close {
  position: absolute;
  z-index: 3;
  top: 1.5rem;
  right: 1.5rem;
  flex: 0 0 auto;
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  padding: 0;
  line-height: 0;
  border: 0;
  border-radius: 50%;
  color: #5f6b82;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 8px 24px rgba(70, 81, 115, 0.12);
  cursor: pointer;
}

.music-settings-close svg {
  display: block;
  width: 20px;
  height: 20px;
  flex: 0 0 auto;
}

.music-settings-preview {
  overflow: hidden;
  margin-bottom: 1.3rem;
  border-radius: 22px;
  background: linear-gradient(125deg, #ffe36b, #ff8fa2 47%, #82d8ff);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.52);
}

.music-settings-preview.preset-family-picnic { background: linear-gradient(125deg, #d8f2bb, #91cf9a 50%, #bce4f4); }
.music-settings-preview.preset-sunset-road { background: linear-gradient(125deg, #ffd28a, #ff9c91 52%, #d9a9cc); }
.music-settings-preview.preset-starry-radio { background: linear-gradient(125deg, #273b68, #3c3d75 52%, #203b5e); }
.music-settings-preview.preset-crayon-room { background: linear-gradient(125deg, #fff0bb, #ffd2c2 52%, #d9eac8); }
.music-settings-preview.preset-rainy-day { background: linear-gradient(125deg, #d9edf7, #a9cadf 52%, #b9bcd8); }
.music-settings-preview.preset-midnight-cinema { background: linear-gradient(125deg, #17181d, #3a2027 52%, #171a1f); }
.music-settings-preview.preset-motion-walk { background: linear-gradient(125deg, #fff0a6, #aee1ff 54%, #bde5ad); }
.music-settings-preview.preset-motion-rain { background: linear-gradient(125deg, #d7e8ef, #8fb5ca 54%, #a8afc4); }
.music-settings-preview.preset-motion-parade { background: linear-gradient(125deg, #ffe5a0, #ffb2a4 52%, #bbddba); }
.music-settings-preview.preset-hello-kitty-garden { background: linear-gradient(125deg, #fff8ed, #ffc7d5 52%, #d4efe6); }
.music-settings-preview.preset-hello-kitty-midnight { background: linear-gradient(125deg, #1b090e, #6f1a31 52%, #d1a65d); }
.music-settings-preview.preset-hello-kitty-dream { background: linear-gradient(125deg, #d7eeff, #ead6ff 52%, #ffd5df); }
.music-settings-preview.preset-kuromi-neon { background: linear-gradient(125deg, #24182f, #70427d 52%, #df70ae); }
.music-settings-preview.preset-kuromi-midnight { background: linear-gradient(125deg, #050407, #211229 52%, #e73e94); }
.music-settings-preview.preset-kuromi-night-flight { background: linear-gradient(125deg, #17152f, #4b367d 52%, #9c5597); }

.music-settings-preview-art {
  position: relative;
  min-height: 132px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1.25rem;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.08)),
    url('/images/shinchan-playlists/cover-09.jpg') center / cover no-repeat;
}

.music-settings-preview-art > * {
  position: relative;
  z-index: 2;
}

.music-settings-preview.preset-kasukabe-sky .music-settings-preview-art::after,
.music-settings-preview.preset-family-picnic .music-settings-preview-art::after,
.music-settings-preview.preset-sunset-road .music-settings-preview-art::after,
.music-settings-preview.preset-starry-radio .music-settings-preview-art::after,
.music-settings-preview.preset-crayon-room .music-settings-preview-art::after,
.music-settings-preview.preset-rainy-day .music-settings-preview-art::after,
.music-settings-preview.preset-midnight-cinema .music-settings-preview-art::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.music-settings-preview.preset-kasukabe-sky .music-settings-preview-art::after {
  background:
    radial-gradient(ellipse at 84% 116%, transparent 0 32%, rgba(238, 98, 113, .34) 33% 37%, rgba(246, 184, 66, .32) 38% 42%, rgba(85, 176, 204, .3) 43% 47%, transparent 48%),
    radial-gradient(circle at 76% 16%, rgba(255, 229, 102, .52) 0 11%, transparent 12%);
}

.music-settings-preview.preset-family-picnic .music-settings-preview-art::after {
  right: 52%;
  top: 42%;
  background:
    repeating-linear-gradient(0deg, transparent 0 17px, rgba(215, 78, 72, .15) 18px 25px),
    repeating-linear-gradient(90deg, transparent 0 17px, rgba(215, 78, 72, .15) 18px 25px),
    rgba(255, 248, 217, .22);
  transform: rotate(-5deg);
}

.music-settings-preview.preset-sunset-road .music-settings-preview-art::after {
  background:
    linear-gradient(171deg, transparent 0 26%, rgba(68, 53, 70, .28) 27% 28%, transparent 29%),
    linear-gradient(8deg, transparent 0 56%, rgba(82, 61, 74, .22) 57% 58%, transparent 59%),
    radial-gradient(circle at 82% 20%, rgba(255, 226, 137, .6) 0 10%, transparent 11%);
}

.music-settings-preview.preset-starry-radio .music-settings-preview-art::after {
  background:
    radial-gradient(circle at 72% 20%, rgba(255, 230, 166, .7) 0 3px, transparent 4px),
    radial-gradient(circle at 87% 38%, rgba(190, 217, 255, .65) 0 2px, transparent 3px),
    radial-gradient(circle at 63% 60%, rgba(190, 217, 255, .5) 0 2px, transparent 3px),
    repeating-linear-gradient(90deg, transparent 0 8px, rgba(120, 182, 226, .18) 9px 11px);
}

.music-settings-preview.preset-crayon-room .music-settings-preview-art::after {
  inset: 8px 48% 8px 54%;
  border: 2px dashed rgba(232, 93, 91, .34);
  border-radius: 8px 16px 9px 12px;
  background:
    radial-gradient(circle at 74% 22%, transparent 0 12px, rgba(245, 182, 49, .5) 13px 16px, transparent 17px),
    repeating-linear-gradient(0deg, transparent 0 14px, rgba(88, 151, 184, .18) 15px 16px),
    rgba(255, 251, 224, .58);
  box-shadow: 6px 7px 0 rgba(92, 166, 184, .12);
  transform: rotate(-2deg);
}

.music-settings-preview.preset-rainy-day .music-settings-preview-art::after {
  background:
    linear-gradient(90deg, transparent 48.7%, rgba(224, 239, 247, .42) 49% 51%, transparent 51.3%),
    linear-gradient(0deg, transparent 48%, rgba(224, 239, 247, .38) 49% 52%, transparent 53%),
    repeating-linear-gradient(110deg, transparent 0 27px, rgba(82, 146, 181, .22) 28px 31px, transparent 32px 54px);
}

.music-settings-preview.preset-midnight-cinema .music-settings-preview-art::after {
  inset: auto 0 7px;
  height: 27px;
  border-top: 1px solid rgba(239, 201, 137, .18);
  border-bottom: 1px solid rgba(239, 201, 137, .18);
  background: repeating-linear-gradient(90deg, rgba(8, 9, 12, .72) 0 9px, rgba(235, 197, 132, .24) 10px 20px, rgba(8, 9, 12, .72) 21px 31px);
}

.music-settings-preview.preset-family-picnic .music-settings-preview-art {
  background-image: linear-gradient(90deg, rgba(246, 255, 235, 0.8), rgba(255, 255, 255, 0.06)), url('/images/shinchan-playlists/cover-03.jpg');
}

.music-settings-preview.preset-sunset-road .music-settings-preview-art {
  background-image: linear-gradient(90deg, rgba(255, 239, 210, 0.82), rgba(255, 255, 255, 0.05)), url('/images/shinchan-playlists/cover-15.jpg');
}

.music-settings-preview.preset-starry-radio .music-settings-preview-art {
  color: #f8fbff;
  background-image: linear-gradient(90deg, rgba(12, 24, 50, 0.86), rgba(17, 27, 54, 0.12)), url('/images/shinchan-playlists/cover-10.jpg');
}

.music-settings-preview.preset-crayon-room .music-settings-preview-art {
  background-image: linear-gradient(90deg, rgba(255, 245, 218, 0.82), rgba(255, 255, 255, 0.06)), url('/images/shinchan-playlists/cover-07.jpg');
}

.music-settings-preview.preset-rainy-day .music-settings-preview-art {
  color: #eef8ff;
  background-image: linear-gradient(90deg, rgba(25, 55, 76, 0.82), rgba(20, 42, 62, 0.08)), url('/images/shinchan-playlists/cover-01.jpg');
}

.music-settings-preview.preset-midnight-cinema .music-settings-preview-art {
  color: #fff7e7;
  background-image: linear-gradient(90deg, rgba(9, 10, 14, 0.94), rgba(62, 24, 31, 0.28)), url('/images/shinchan-playlists/cover-02.jpg');
}

.music-settings-preview.preset-motion-walk .music-settings-preview-art {
  background-image: linear-gradient(90deg, rgba(255, 249, 213, 0.84), rgba(255, 255, 255, 0.06)), url('/images/shinchan-playlists/cover-09.jpg');
  animation: music-settings-preview-pan 8s ease-in-out infinite alternate;
}

.music-settings-preview.preset-motion-rain .music-settings-preview-art {
  color: #eef8ff;
  background-image: linear-gradient(90deg, rgba(27, 55, 70, 0.8), rgba(36, 65, 82, 0.08)), url('/images/music-themes/motion-rain-scene.png');
  animation: music-settings-preview-rain 3.6s ease-in-out infinite alternate;
}

.music-settings-preview.preset-motion-parade .music-settings-preview-art {
  background-image: linear-gradient(90deg, rgba(255, 242, 204, 0.82), rgba(255, 255, 255, 0.04)), url('/images/music-themes/motion-parade-scene.png');
  animation: music-settings-preview-pan 7s ease-in-out infinite alternate-reverse;
}

.music-settings-preview.preset-hello-kitty-garden .music-settings-preview-art,
.music-settings-preview.preset-hello-kitty-midnight .music-settings-preview-art,
.music-settings-preview.preset-hello-kitty-dream .music-settings-preview-art,
.music-settings-preview.preset-kuromi-neon .music-settings-preview-art,
.music-settings-preview.preset-kuromi-midnight .music-settings-preview-art,
.music-settings-preview.preset-kuromi-night-flight .music-settings-preview-art {
  background-image: linear-gradient(90deg, rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.08)), var(--ip-preview-art);
  background-size: cover, auto 124%;
  background-position: center, 88% 24%;
  background-repeat: no-repeat;
}

.music-settings-preview.preset-hello-kitty-garden .music-settings-preview-art { --ip-preview-art: url('/images/ip-themes/hello-kitty-main.png'); }
.music-settings-preview.preset-hello-kitty-midnight .music-settings-preview-art {
  --ip-preview-art: url('/images/ip-themes/hello-kitty-friends.png');
  color: #f7ddb0;
  background-image: linear-gradient(90deg, rgba(31, 7, 14, 0.96), rgba(103, 21, 44, 0.28)), var(--ip-preview-art);
}
.music-settings-preview.preset-hello-kitty-dream .music-settings-preview-art {
  --ip-preview-art: url('/images/ip-themes/hello-kitty-angel.png');
  animation: music-ip-preview-pan 7s ease-in-out infinite alternate;
}
.music-settings-preview.preset-kuromi-neon .music-settings-preview-art {
  --ip-preview-art: url('/images/ip-themes/kuromi-main.png');
  color: #fff4fb;
  background-image: linear-gradient(90deg, rgba(31, 20, 43, 0.92), rgba(74, 34, 83, 0.12)), var(--ip-preview-art);
}
.music-settings-preview.preset-kuromi-midnight .music-settings-preview-art {
  --ip-preview-art: url('/images/music-themes/kuromi-midnight-stage.png');
  color: #ffe7f5;
  background-image: linear-gradient(90deg, rgba(5, 4, 8, 0.97), rgba(81, 17, 58, 0.26)), var(--ip-preview-art);
}
.music-settings-preview.preset-kuromi-night-flight .music-settings-preview-art {
  --ip-preview-art: url('/images/ip-themes/kuromi-melody.png');
  color: #fff4fb;
  background-image: linear-gradient(90deg, rgba(24, 19, 48, 0.93), rgba(80, 43, 104, 0.12)), var(--ip-preview-art);
  animation: music-ip-preview-pan 6s ease-in-out infinite alternate-reverse;
}

@keyframes music-ip-preview-pan {
  from { background-position: center, 82% 20%; }
  to { background-position: center, 92% 30%; }
}

@keyframes music-settings-preview-pan {
  from { background-position: 44% center; }
  to { background-position: 58% center; }
}

@keyframes music-settings-preview-rain {
  from { filter: brightness(0.92) saturate(0.9); }
  to { filter: brightness(1.04) saturate(1.02); }
}

.music-settings-preview-art span {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  opacity: 0.68;
}

.music-settings-preview-art strong {
  width: fit-content;
  margin-top: 0.2rem;
  font-size: 1.55rem;
}

.music-settings-preview-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.8rem 1.1rem;
  color: #566078;
  background: rgba(255, 255, 255, 0.62);
  font-size: 0.84rem;
}

.music-settings-preview-meta span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.music-settings-preview-meta button {
  border: 0;
  color: #ff4d64;
  background: none;
  font-weight: 700;
  cursor: pointer;
}

.music-settings-section {
  padding: 1.15rem 0;
  border-top: 1px solid rgba(122, 133, 162, 0.14);
}

.music-settings-section-title {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.85rem;
}

.music-settings-section-title span {
  color: #96a0b4;
  font-size: 0.78rem;
}

.music-ip-tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
  margin-bottom: 1.15rem;
  padding: 0.42rem;
  border: 1px solid rgba(122, 133, 162, 0.12);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.5);
}

.music-ip-tabs button {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.68rem 0.72rem;
  border: 1px solid transparent;
  border-radius: 15px;
  color: #5c667b;
  background: transparent;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: transform 180ms ease, background 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.music-ip-tabs button:hover { transform: translateY(-2px); }
.music-ip-tabs button.active {
  color: #293249;
  border-color: rgba(255, 255, 255, 0.84);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 9px 22px rgba(59, 67, 91, 0.1);
}
.music-ip-tabs button.is-hello-kitty.active { color: #b33855; background: #fff4f6; }
.music-ip-tabs button.is-kuromi.active { color: #583867; background: #f8f0fb; }
.music-ip-tabs button > span:last-child { min-width: 0; display: grid; gap: 0.08rem; }
.music-ip-tabs strong { overflow: hidden; font-size: 0.78rem; text-overflow: ellipsis; white-space: nowrap; }
.music-ip-tabs small { overflow: hidden; color: #9aa3b5; font-size: 0.55rem; letter-spacing: 0.06em; text-overflow: ellipsis; white-space: nowrap; }

.music-ip-tab-avatar {
  position: relative;
  flex: 0 0 auto;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.86);
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 7px 16px rgba(58, 64, 84, 0.1);
}

.music-ip-tab-avatar img {
  width: 88%;
  height: 88%;
  display: block;
  object-fit: contain;
  object-position: center;
  filter: drop-shadow(0 3px 4px rgba(45, 39, 54, 0.12));
}

.is-shinchan .music-ip-tab-avatar {
  background: linear-gradient(145deg, #fff9cf, #ffe8d1);
}

.is-classic .music-ip-tab-avatar {
  color: #356487;
  background: linear-gradient(145deg, #ffffff, #dceefa);
}

.is-classic .music-ip-tab-avatar img {
  display: none;
}

.is-classic .music-ip-tab-avatar::before {
  content: '♫';
  font-size: 1.25rem;
  font-weight: 800;
}

.is-shinchan .music-ip-tab-avatar img {
  width: 94%;
  max-width: none;
  height: 94%;
  transform: none;
}

.is-hello-kitty .music-ip-tab-avatar {
  background: linear-gradient(145deg, #fffaf5, #ffe4ec);
}

.is-kuromi .music-ip-tab-avatar {
  background: linear-gradient(145deg, #fbf4ff, #e7d6f0);
}

.is-kuromi .music-ip-tab-avatar img {
  width: 96%;
  height: 96%;
}

.music-preset-groups {
  display: grid;
  gap: 1.15rem;
}

.music-preset-group {
  display: grid;
  gap: 0.7rem;
}

.music-preset-group + .music-preset-group {
  padding-top: 1rem;
  border-top: 1px dashed rgba(122, 133, 162, 0.2);
}

.music-preset-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  color: #536078;
}

.music-preset-group-header > span {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.82rem;
  font-weight: 800;
}

.music-preset-group-header > span > i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d3a04d;
}

.music-preset-group-header > span > i.moving {
  background: #e95d64;
  box-shadow: 0 0 0 5px rgba(233, 93, 100, 0.1);
  animation: music-motion-dot 1.35s ease-in-out infinite;
}

.music-preset-group-header small {
  color: #98a1b3;
  font-size: 0.7rem;
}

@keyframes music-motion-dot {
  0%, 100% { transform: scale(0.78); opacity: 0.55; }
  50% { transform: scale(1.12); opacity: 1; }
}

.music-preset-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.music-preset-card {
  position: relative;
  min-height: 112px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 0.18rem;
  padding: 0.85rem;
  border: 2px solid transparent;
  border-radius: 18px;
  color: #27324a;
  background-position: center;
  background-size: cover;
  box-shadow: inset 0 -54px 38px rgba(255, 255, 255, 0.76), 0 8px 20px rgba(51, 65, 91, 0.08);
  text-align: left;
  cursor: pointer;
  transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.music-preset-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 24%, rgba(255, 255, 255, 0.2) 55%, rgba(255, 255, 255, 0.92));
}

.music-preset-card > * {
  position: relative;
  z-index: 1;
}

.music-preset-card strong { font-size: 0.9rem; }
.music-preset-card small { color: #707c91; font-size: 0.7rem; }

.music-preset-motion-badge {
  position: absolute;
  top: 0.62rem;
  left: 0.62rem;
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  padding: 0.18rem 0.42rem;
  border-radius: 999px;
  color: #713039;
  background: rgba(255, 244, 223, 0.86);
  font-size: 0.62rem;
  font-weight: 800;
  box-shadow: 0 4px 14px rgba(79, 49, 38, 0.1);
}

.music-preset-motion-badge i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #e95d64;
  animation: music-motion-dot 1.1s ease-in-out infinite;
}

.music-preset-card:hover {
  transform: translateY(-3px);
  box-shadow: inset 0 -54px 38px rgba(255, 255, 255, 0.78), 0 14px 30px rgba(51, 65, 91, 0.14);
}

.music-preset-card.active {
  border-color: #ff6074;
  box-shadow: inset 0 -54px 38px rgba(255, 255, 255, 0.8), 0 12px 28px rgba(255, 96, 116, 0.18);
}

.music-preset-check {
  position: absolute;
  top: 0.55rem;
  right: 0.55rem;
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #fff;
  background: #ff6074;
  opacity: 0;
  transform: scale(0.7);
  transition: opacity 160ms ease, transform 160ms ease;
}

.music-preset-card.active .music-preset-check { opacity: 1; transform: scale(1); }

.music-preset-card.is-classic {
  color: #20344d;
  border-color: rgba(106, 143, 180, 0.38);
  background:
    radial-gradient(circle at 18% 12%, rgba(255, 255, 255, 0.98) 0 4%, transparent 18%),
    radial-gradient(circle at 80% 14%, rgba(166, 207, 237, 0.62), transparent 34%),
    linear-gradient(135deg, #edf7ff 0%, #dcecf9 47%, #fff6df 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.92),
    0 9px 22px rgba(71, 108, 145, 0.16);
}

.music-preset-card.is-classic::before {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.02) 18%, rgba(240, 248, 255, 0.18) 51%, rgba(255, 255, 255, 0.92) 100%),
    repeating-linear-gradient(104deg, transparent 0 15px, rgba(82, 122, 158, 0.08) 16px 17px, transparent 18px 30px);
}

.music-preset-card.is-classic::after {
  content: '♫';
  position: absolute;
  top: 0.75rem;
  right: 0.78rem;
  z-index: 0;
  display: grid;
  width: 3.4rem;
  height: 3.4rem;
  place-items: center;
  border: 4px solid rgba(248, 252, 255, 0.8);
  border-radius: 50%;
  background:
    radial-gradient(circle at center, #eef8ff 0 12%, #7598b9 13% 17%, transparent 18% 28%, rgba(29, 57, 88, 0.92) 29% 33%, rgba(40, 69, 101, 0.96) 34% 49%, rgba(22, 47, 76, 0.98) 50% 100%);
  box-shadow:
    0 7px 15px rgba(42, 78, 114, 0.2),
    inset 0 0 0 1px rgba(255, 255, 255, 0.26);
  color: #dff0ff;
  font-size: 1.15rem;
  font-weight: 800;
  line-height: 1;
  transform: rotate(-12deg);
}

.music-preset-card.is-classic:hover::after,
.music-preset-card.is-classic.active::after {
  animation: music-classic-record-spin 5s linear infinite;
}

.music-preset-card.is-kasukabe-sky {
  background-image: linear-gradient(135deg, rgba(255, 229, 112, 0.76), rgba(255, 142, 159, 0.58) 48%, rgba(119, 205, 246, 0.72)), url('/images/progress-shinchan-opt.webp');
  background-size: cover, 78px auto;
  background-position: center, 88% 18%;
  background-repeat: no-repeat;
}

.music-preset-card.is-family-picnic {
  background-image: linear-gradient(145deg, rgba(206, 243, 179, 0.32), rgba(120, 198, 133, 0.24)), url('/images/shinchan-playlists/cover-03.jpg');
}

.music-preset-card.is-sunset-road {
  background-image: linear-gradient(145deg, rgba(255, 190, 105, 0.24), rgba(247, 112, 140, 0.24)), url('/images/shinchan-playlists/cover-15.jpg');
}

.music-preset-card.is-starry-radio {
  color: #eef4ff;
  background-image: linear-gradient(145deg, rgba(20, 33, 70, 0.3), rgba(42, 45, 99, 0.28)), url('/images/shinchan-playlists/cover-10.jpg');
  box-shadow: inset 0 -58px 42px rgba(13, 25, 53, 0.82), 0 8px 20px rgba(30, 39, 74, 0.16);
}

.music-preset-card.is-starry-radio::before {
  background: linear-gradient(180deg, transparent 20%, rgba(16, 27, 58, 0.24) 52%, rgba(13, 25, 53, 0.94));
}

.music-preset-card.is-starry-radio small { color: #b9c7e2; }

.music-preset-card.is-crayon-room {
  background-image: linear-gradient(145deg, rgba(255, 244, 208, 0.3), rgba(255, 197, 178, 0.25)), url('/images/shinchan-playlists/cover-07.jpg');
}

.music-preset-card.is-rainy-day {
  background-image: linear-gradient(145deg, rgba(180, 224, 244, 0.28), rgba(112, 160, 207, 0.2)), url('/images/shinchan-playlists/cover-01.jpg');
}

.music-preset-card.is-midnight-cinema {
  color: #fff6e2;
  background-image: linear-gradient(145deg, rgba(15, 16, 21, 0.32), rgba(91, 31, 42, 0.34)), url('/images/shinchan-playlists/cover-02.jpg');
  box-shadow: inset 0 -58px 42px rgba(10, 11, 15, 0.92), 0 8px 20px rgba(21, 16, 18, 0.2);
}

.music-preset-card.is-midnight-cinema::before {
  background: linear-gradient(180deg, transparent 18%, rgba(75, 28, 37, 0.2) 52%, rgba(9, 10, 14, 0.97));
}

.music-preset-card.is-midnight-cinema small { color: #d8c9b0; }

.music-preset-card.is-motion-walk {
  background-image: linear-gradient(145deg, rgba(255, 238, 159, 0.18), rgba(127, 202, 239, 0.2)), url('/images/shinchan-playlists/cover-09.jpg');
  animation: music-card-pan 7s ease-in-out infinite alternate;
}

.music-preset-card.is-motion-rain {
  background-image: linear-gradient(145deg, rgba(80, 129, 157, 0.2), rgba(67, 84, 111, 0.28)), url('/images/music-themes/motion-rain-scene.png');
  animation: music-card-rain 3.4s ease-in-out infinite alternate;
}

.music-preset-card.is-motion-parade {
  background-image: linear-gradient(145deg, rgba(255, 203, 111, 0.16), rgba(236, 111, 102, 0.18)), url('/images/music-themes/motion-parade-scene.png');
  animation: music-card-pan 6s ease-in-out infinite alternate-reverse;
}

.music-preset-card.is-kasukabe-sky::after,
.music-preset-card.is-family-picnic::after,
.music-preset-card.is-sunset-road::after,
.music-preset-card.is-starry-radio::after,
.music-preset-card.is-crayon-room::after,
.music-preset-card.is-rainy-day::after,
.music-preset-card.is-midnight-cinema::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.music-preset-card.is-kasukabe-sky::after {
  background:
    radial-gradient(ellipse at 9% 108%, transparent 0 29%, rgba(240, 93, 113, .4) 30% 34%, rgba(247, 183, 67, .38) 35% 39%, rgba(83, 178, 207, .34) 40% 44%, transparent 45%),
    radial-gradient(circle at 78% 17%, rgba(255, 232, 116, .58) 0 11%, transparent 12%);
}

.music-preset-card.is-family-picnic::after {
  inset: 43% 44% -8% -8%;
  background:
    repeating-linear-gradient(0deg, transparent 0 14px, rgba(205, 77, 70, .18) 15px 21px),
    repeating-linear-gradient(90deg, transparent 0 14px, rgba(205, 77, 70, .18) 15px 21px),
    rgba(255, 246, 209, .34);
  transform: rotate(-5deg);
}

.music-preset-card.is-sunset-road::after {
  background:
    linear-gradient(170deg, transparent 0 25%, rgba(68, 50, 67, .28) 26% 28%, transparent 29%),
    linear-gradient(8deg, transparent 0 55%, rgba(68, 50, 67, .2) 56% 58%, transparent 59%),
    radial-gradient(circle at 81% 18%, rgba(255, 231, 151, .62) 0 10%, transparent 11%);
}

.music-preset-card.is-starry-radio::after {
  background:
    radial-gradient(circle at 80% 17%, rgba(255, 227, 157, .78) 0 3px, transparent 4px),
    radial-gradient(circle at 64% 33%, rgba(193, 219, 255, .72) 0 2px, transparent 3px),
    radial-gradient(circle at 91% 48%, rgba(193, 219, 255, .58) 0 2px, transparent 3px),
    repeating-linear-gradient(90deg, transparent 0 8px, rgba(112, 178, 226, .14) 9px 11px);
}

.music-preset-card.is-crayon-room::after {
  inset: 7px 42% 26px 51%;
  border: 2px dashed rgba(230, 87, 88, .42);
  border-radius: 7px 13px 8px 11px;
  background:
    radial-gradient(circle at 72% 20%, transparent 0 9px, rgba(243, 174, 42, .54) 10px 13px, transparent 14px),
    repeating-linear-gradient(0deg, transparent 0 11px, rgba(83, 148, 183, .2) 12px 13px),
    rgba(255, 251, 222, .67);
  box-shadow: 5px 6px 0 rgba(87, 159, 180, .15);
  transform: rotate(-3deg);
}

.music-preset-card.is-rainy-day::after {
  background:
    linear-gradient(90deg, transparent 48%, rgba(232, 244, 249, .44) 49% 51%, transparent 52%),
    linear-gradient(0deg, transparent 47%, rgba(232, 244, 249, .4) 48% 52%, transparent 53%),
    repeating-linear-gradient(109deg, transparent 0 22px, rgba(67, 132, 170, .25) 23px 26px, transparent 27px 46px);
}

.music-preset-card.is-midnight-cinema::after {
  inset: auto 0 5px;
  height: 24px;
  border-top: 1px solid rgba(239, 201, 137, .2);
  border-bottom: 1px solid rgba(239, 201, 137, .2);
  background: repeating-linear-gradient(90deg, rgba(7, 8, 11, .74) 0 8px, rgba(235, 197, 132, .25) 9px 18px, rgba(7, 8, 11, .74) 19px 28px);
}

.music-preset-card.is-hello-kitty-garden {
  background-image: linear-gradient(145deg, rgba(255, 250, 241, 0.72), rgba(255, 181, 200, 0.34)), url('/images/ip-themes/hello-kitty-main.png');
  background-size: cover, auto 108%;
  background-position: center, 88% 30%;
  background-repeat: no-repeat;
}

.music-preset-card.is-hello-kitty-midnight {
  color: #ffe9c3;
  background-image: linear-gradient(145deg, rgba(20, 5, 10, 0.28), rgba(112, 19, 47, 0.34)), url('/images/ip-themes/hello-kitty-friends.png');
  box-shadow: inset 0 -58px 42px rgba(34, 7, 16, 0.93), 0 8px 20px rgba(77, 15, 31, 0.22);
}
.music-preset-card.is-hello-kitty-midnight::before { background: linear-gradient(180deg, transparent 18%, rgba(99, 18, 41, 0.2) 52%, rgba(27, 6, 13, 0.97)); }
.music-preset-card.is-hello-kitty-midnight small { color: #dcbf91; }

.music-preset-card.is-hello-kitty-dream {
  background-image: linear-gradient(145deg, rgba(207, 235, 255, 0.66), rgba(240, 199, 255, 0.34)), url('/images/ip-themes/hello-kitty-angel.png');
  background-size: cover, auto 104%;
  background-position: center, 84% 28%;
  background-repeat: no-repeat;
  animation: music-ip-card-pan 7s ease-in-out infinite alternate;
}

.music-preset-card.is-kuromi-neon,
.music-preset-card.is-kuromi-midnight,
.music-preset-card.is-kuromi-night-flight {
  color: #fff5fb;
  box-shadow: inset 0 -58px 42px rgba(25, 16, 35, 0.88), 0 8px 20px rgba(43, 24, 57, 0.2);
}
.music-preset-card.is-kuromi-neon {
  background-image: linear-gradient(145deg, rgba(27,15,39,.5), rgba(118,46,105,.24)), url('/images/ip-themes/kuromi-main.png');
  background-size: cover, auto 114%;
  background-position: center, 86% 22%;
  background-repeat: no-repeat;
}
.music-preset-card.is-kuromi-midnight { background-image: linear-gradient(145deg, rgba(0,0,0,.22), rgba(231,62,148,.16)), url('/images/music-themes/kuromi-midnight-stage.png'); }
.music-preset-card.is-kuromi-night-flight {
  background-image: linear-gradient(145deg, rgba(21,18,50,.54), rgba(105,63,137,.28)), url('/images/ip-themes/kuromi-melody.png');
  background-size: cover, auto 116%;
  background-position: center, 78% 28%;
  background-repeat: no-repeat;
  animation: music-ip-card-pan 6s ease-in-out infinite alternate-reverse;
}

@keyframes music-ip-card-pan {
  from { background-position: center, 80% 22%; }
  to { background-position: center, 91% 31%; }
}
.music-preset-card.is-kuromi-neon::before,
.music-preset-card.is-kuromi-midnight::before,
.music-preset-card.is-kuromi-night-flight::before { background: linear-gradient(180deg, transparent 20%, rgba(33, 22, 44, 0.22) 52%, rgba(24, 16, 34, 0.95)); }
.music-preset-card.is-kuromi-neon small,
.music-preset-card.is-kuromi-midnight small,
.music-preset-card.is-kuromi-night-flight small { color: #e0c4e4; }

@keyframes music-card-pan {
  from { background-position: 43% center; }
  to { background-position: 58% center; }
}

@keyframes music-card-rain {
  from { background-position: center 43%; filter: brightness(0.9); }
  to { background-position: center 57%; filter: brightness(1.03); }
}

@keyframes music-classic-record-spin {
  to { transform: rotate(348deg); }
}

.music-settings-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.7rem;
}

.music-custom-theme-options {
  display: grid;
  gap: 0.78rem;
}

.music-character-choice-title {
  margin-top: 0.5rem;
}

.music-theme-choice-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.62rem;
}

.music-appearance-choice-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.music-theme-choice-grid button {
  min-height: 48px;
  display: flex;
  align-items: center;
  gap: 0.54rem;
  padding: 0.55rem 0.7rem;
  border: 1px solid rgba(109, 40, 217, 0.13);
  border-radius: 14px;
  color: #59657d;
  background: rgba(255, 255, 255, 0.62);
  font: inherit;
  font-size: 0.8rem;
  text-align: left;
  cursor: pointer;
  transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
}

.music-theme-choice-grid button:hover,
.music-theme-choice-grid button.active {
  transform: translateY(-1px);
  border-color: rgba(255, 91, 110, 0.62);
  background: rgba(255, 248, 249, 0.94);
  box-shadow: 0 8px 20px rgba(255, 91, 110, 0.12);
}

.theme-choice-dot,
.theme-choice-character {
  width: 22px;
  height: 22px;
  flex: 0 0 22px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #fff;
  font-size: 0.65rem;
  font-style: normal;
  font-weight: 800;
  box-shadow: inset 0 0 0 3px rgba(255, 255, 255, 0.33), 0 3px 7px rgba(27, 34, 53, 0.16);
}

.theme-choice-avatar {
  width: 25px;
  height: 25px;
  flex: 0 0 25px;
  display: block;
  padding: 1px;
  border-radius: 50%;
  object-fit: contain;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 3px 8px rgba(27, 34, 53, 0.16), inset 0 0 0 1px rgba(255, 255, 255, 0.8);
}

.theme-choice-avatar.is-shinchan { background: #ffe2bd; }
.theme-choice-avatar.is-hello-kitty { background: #fff1f4; }
.theme-choice-avatar.is-kuromi { background: #f1d9ed; }

.theme-choice-dot.is-classic,
.theme-choice-character.is-classic { background: linear-gradient(135deg, #314055, #111923); }
.theme-choice-dot.is-theme,
.theme-choice-character.is-theme { background: linear-gradient(135deg, #6d5eea, #48b5e7); }
.theme-choice-character.is-sunny { background: linear-gradient(135deg, #ffbf45, #ff7c55); }
.theme-choice-character.is-night { background: linear-gradient(135deg, #3f466d, #23293e); }
.theme-choice-dot.is-shinchan,
.theme-choice-character.is-shinchan { background: linear-gradient(135deg, #ff9a4c, #ed4756); }
.theme-choice-dot.is-hello-kitty,
.theme-choice-character.is-hello-kitty { background: linear-gradient(135deg, #ff8ba4, #c93663); }
.theme-choice-dot.is-kuromi,
.theme-choice-character.is-kuromi { background: linear-gradient(135deg, #6f416c, #e55096); }

.music-settings-actions button,
.music-upload-action {
  min-height: 78px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  border: 1px solid rgba(109, 40, 217, 0.12);
  border-radius: 17px;
  color: #59657d;
  background: rgba(255, 255, 255, 0.66);
  font: inherit;
  font-size: 0.86rem;
  cursor: pointer;
  transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.music-settings-actions button:hover,
.music-upload-action:hover,
.music-settings-actions button.active {
  transform: translateY(-2px);
  border-color: rgba(255, 91, 110, 0.48);
  box-shadow: 0 10px 24px rgba(255, 91, 110, 0.12);
}

.music-upload-action input { display: none; }
.action-icon { font-size: 1.15rem; color: #ff5b6e; }

.music-settings-status {
  margin: 0.75rem 0 0;
  color: #3ba36b;
  font-size: 0.8rem;
}

.music-settings-status.error { color: #e34d5d; }

.music-setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 0;
}

.music-setting-row > span:first-child {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.music-setting-row small {
  color: #929db1;
  line-height: 1.5;
}

.music-range-wrap {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.music-range-wrap input { accent-color: #ff5b6e; }
.music-range-wrap em { min-width: 42px; color: #ff5b6e; font-style: normal; font-weight: 700; }

.music-switch { position: relative; flex: 0 0 auto; }
.music-switch input { position: absolute; opacity: 0; }
.music-switch i {
  display: block;
  width: 50px;
  height: 28px;
  padding: 3px;
  border-radius: 999px;
  background: #cbd2df;
  cursor: pointer;
  transition: background 180ms ease;
}
.music-switch i::after {
  content: '';
  display: block;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 3px 9px rgba(42, 52, 78, 0.2);
  transition: transform 180ms ease;
}
.music-switch input:checked + i { background: #ff5b6e; }
.music-switch input:checked + i::after { transform: translateX(22px); }

.music-settings-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1rem;
  color: #98a2b6;
  font-size: 0.76rem;
}

.music-settings-reset {
  border: 0;
  color: #d84859;
  background: none;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.music-settings-fade-enter-active,
.music-settings-fade-leave-active { transition: background-color 180ms ease; }
.music-settings-fade-enter-active .music-settings-panel,
.music-settings-fade-leave-active .music-settings-panel { transition: transform 220ms cubic-bezier(.22, .72, .24, 1); }
.music-settings-fade-enter-from,
.music-settings-fade-leave-to { background-color: rgba(15, 23, 42, 0); }
.music-settings-fade-enter-from .music-settings-panel,
.music-settings-fade-leave-to .music-settings-panel { transform: translate3d(0, 18px, 0); }

body:is(.dark-mode, .music-theme-dark) .music-settings-panel {
  color: #eef2ff;
  border-color: rgba(255, 255, 255, 0.14);
  background:
    radial-gradient(circle at 92% 4%, rgba(255, 226, 87, 0.12), transparent 32%),
    linear-gradient(145deg, rgba(21, 28, 48, 0.97), rgba(31, 25, 52, 0.96));
}

body:is(.dark-mode, .music-theme-dark) .music-settings-header p,
body:is(.dark-mode, .music-theme-dark) .music-settings-preview-meta,
body:is(.dark-mode, .music-theme-dark) .music-settings-actions button,
body:is(.dark-mode, .music-theme-dark) .music-upload-action { color: #bac2d4; }

body:is(.dark-mode, .music-theme-dark) .music-settings-actions button,
body:is(.dark-mode, .music-theme-dark) .music-upload-action,
body:is(.dark-mode, .music-theme-dark) .music-settings-close { background: rgba(255, 255, 255, 0.07); }

body:is(.dark-mode, .music-theme-dark) .music-preset-card:not(.is-starry-radio):not(.is-midnight-cinema):not(.is-hello-kitty-midnight):not(.is-kuromi-midnight) {
  color: #202b40;
}

body.music-theme-dark .music-settings-panel {
  color: #fff6e7;
  border-color: rgba(255, 214, 151, 0.14);
  background:
    radial-gradient(circle at 92% 4%, rgba(224, 153, 72, 0.12), transparent 34%),
    linear-gradient(145deg, rgba(17, 18, 22, 0.98), rgba(43, 27, 31, 0.97));
}

/* The settings surface previews each IP's own visual system instead of one shared gradient shell. */
.music-settings-panel.active-ip-hello-kitty {
  color: #5d2634;
  border-radius: 18px 42px 18px 42px;
  border-color: rgba(195, 53, 82, 0.18);
  background:
    radial-gradient(circle, rgba(210, 52, 82, 0.08) 1px, transparent 1.5px) 18px 18px / 28px 28px,
    linear-gradient(145deg, rgba(255, 253, 247, 0.99), rgba(255, 239, 242, 0.98));
}
.music-settings-panel.active-ip-hello-kitty .music-settings-kicker { color:#c52e4e; font-family:Georgia,'Noto Serif SC',serif; }
.music-settings-panel.active-ip-hello-kitty .music-ip-tabs { border-radius:10px 26px 10px 26px; border:1px solid rgba(199,52,82,.13); background:rgba(255,250,244,.78); }
.music-settings-panel.active-ip-hello-kitty .music-preset-card { border-radius:9px 26px 9px 26px; }
.music-settings-panel.active-ip-hello-kitty .music-preset-card.active { border-color:#c93452; box-shadow:inset 0 -54px 38px rgba(255,248,239,.82),0 12px 28px rgba(180,42,70,.16); }

.music-settings-panel.active-ip-kuromi {
  color:#f7eafa;
  border-radius:8px 34px 8px 34px;
  border-color:rgba(238,77,158,.36);
  background:
    linear-gradient(135deg, transparent 0 47%, rgba(235,72,157,.07) 48% 50%, transparent 51%) 0 0 / 64px 64px,
    linear-gradient(145deg, rgba(19,13,24,.99), rgba(45,25,52,.98));
  box-shadow:14px 14px 0 rgba(211,64,144,.08),0 28px 90px rgba(17,8,22,.36);
}
.music-settings-panel.active-ip-kuromi .music-settings-kicker { color:#f257a7; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; }
.music-settings-panel.active-ip-kuromi .music-settings-header h2 {
  color:#fff3fb;
  text-shadow:0 0 22px rgba(240,82,170,.2);
}
.music-settings-panel.active-ip-kuromi .music-settings-header p,
.music-settings-panel.active-ip-kuromi .music-settings-section-title span,
.music-settings-panel.active-ip-kuromi .music-setting-row small,
.music-settings-panel.active-ip-kuromi .music-settings-preview-meta { color:#cbb6d1; }
.music-settings-panel.active-ip-kuromi .music-ip-tabs { border-radius:4px 22px 4px 22px; border:1px solid rgba(239,79,163,.28); background:rgba(8,6,11,.46); }
.music-settings-panel.active-ip-kuromi .music-ip-tabs button { color:#d8c9dd; }
.music-settings-panel.active-ip-kuromi .music-ip-tabs button.is-kuromi.active {
  color:#fff1fa;
  border-color:rgba(248,102,185,.34);
  background:linear-gradient(145deg,rgba(83,30,91,.92),rgba(42,16,53,.96));
  box-shadow:0 9px 22px rgba(9,3,14,.28),inset 0 1px 0 rgba(255,255,255,.08);
}
.music-settings-panel.active-ip-kuromi .music-ip-tabs button.is-kuromi.active small { color:#d9bddf; }
.music-settings-panel.active-ip-kuromi .music-preset-card { border-radius:5px 22px 5px 22px; }
.music-settings-panel.active-ip-kuromi .music-settings-section { border-color:rgba(242,92,171,.18); }
.music-settings-panel.active-ip-kuromi .music-settings-close,
.music-settings-panel.active-ip-kuromi .music-settings-actions button,
.music-settings-panel.active-ip-kuromi .music-upload-action { color:#f5e7f8; border-color:rgba(242,89,170,.22); background:rgba(255,255,255,.065); }
.music-settings-panel.active-ip-kuromi .music-settings-close {
  color:#ffdff2;
  border:1px solid rgba(244,91,175,.3);
  background:rgba(43,18,52,.84);
  box-shadow:0 8px 24px rgba(3,0,8,.28),inset 0 1px rgba(255,255,255,.08);
}
.music-settings-panel.active-ip-kuromi .music-settings-close:hover {
  color:#fff;
  background:rgba(122,34,105,.76);
}

body.music-theme-dark .music-settings-panel.active-ip-hello-kitty {
  color:#f8e5cc;
  border-color:rgba(223,176,96,.26);
  background:
    radial-gradient(circle, rgba(226,177,91,.07) 1px, transparent 1.5px) 18px 18px / 30px 30px,
    linear-gradient(145deg, rgba(26,7,13,.99), rgba(71,17,32,.98));
}
body.music-theme-dark .music-settings-panel.active-ip-hello-kitty .music-settings-header p,
body.music-theme-dark .music-settings-panel.active-ip-hello-kitty .music-settings-section-title span { color:#d8bfa6; }
body.music-theme-dark .music-settings-panel.active-ip-kuromi { background:linear-gradient(145deg,#050407,#1a0d20 56%,#09050c); }

/* Settings is part of the selected scene, not a shared white dialog. */
.music-settings-panel.active-preset-kasukabe-sky,
.music-settings-panel.active-preset-motion-walk {
  color: #263f58;
  border-color: rgba(93, 174, 210, .28);
  background:
    radial-gradient(circle at 89% 6%, rgba(255, 218, 106, .42), transparent 28%),
    radial-gradient(circle at 8% 92%, rgba(117, 210, 235, .22), transparent 35%),
    linear-gradient(145deg, rgba(244, 252, 255, .98), rgba(222, 244, 249, .96));
}

.music-settings-panel.active-preset-family-picnic {
  color: #304b3b;
  border-color: rgba(110, 177, 119, .28);
  background:
    radial-gradient(ellipse at 18% 2%, rgba(255, 234, 137, .32), transparent 30%),
    radial-gradient(ellipse at 78% 100%, rgba(115, 189, 125, .2), transparent 38%),
    linear-gradient(145deg, rgba(250, 255, 239, .98), rgba(229, 246, 224, .97));
}

.music-settings-panel.active-preset-sunset-road,
.music-settings-panel.active-preset-motion-parade {
  color: #5a3a3a;
  border-color: rgba(236, 128, 109, .28);
  background:
    radial-gradient(circle at 89% 4%, rgba(255, 213, 126, .4), transparent 31%),
    radial-gradient(circle at 9% 94%, rgba(255, 153, 159, .2), transparent 36%),
    linear-gradient(145deg, rgba(255, 247, 231, .98), rgba(255, 229, 224, .97));
}

.music-settings-panel.active-preset-crayon-room {
  color: #514333;
  border-color: rgba(211, 163, 87, .25);
  background:
    repeating-linear-gradient(10deg, transparent 0 38px, rgba(191, 136, 62, .035) 39px 41px),
    radial-gradient(circle at 90% 5%, rgba(255, 214, 142, .38), transparent 30%),
    linear-gradient(145deg, rgba(255, 251, 232, .98), rgba(249, 237, 209, .97));
}

.music-settings-panel.active-preset-rainy-day,
.music-settings-panel.active-preset-motion-rain {
  color: #29485a;
  border-color: rgba(100, 166, 198, .3);
  background:
    repeating-linear-gradient(112deg, transparent 0 42px, rgba(79, 145, 182, .06) 43px 45px, transparent 46px 82px),
    radial-gradient(circle at 86% 5%, rgba(173, 217, 235, .45), transparent 31%),
    linear-gradient(145deg, rgba(236, 248, 252, .98), rgba(204, 227, 239, .97));
}

.music-settings-panel.active-preset-starry-radio {
  color: #eff5ff;
  border-color: rgba(124, 161, 235, .28);
  background:
    radial-gradient(circle at 88% 7%, rgba(130, 163, 255, .2), transparent 28%),
    radial-gradient(circle at 10% 88%, rgba(114, 83, 204, .16), transparent 34%),
    linear-gradient(145deg, rgba(10, 24, 54, .99), rgba(22, 35, 79, .98));
}

.music-settings-panel.active-preset-midnight-cinema {
  color: #fff0d9;
  border-color: rgba(240, 194, 117, .28);
  background:
    repeating-linear-gradient(-8deg, transparent 0 42px, rgba(231, 174, 91, .035) 43px 45px),
    radial-gradient(circle at 87% 6%, rgba(222, 157, 72, .18), transparent 31%),
    linear-gradient(145deg, rgba(17, 17, 20, .99), rgba(61, 38, 34, .98) 55%, rgba(15, 18, 23, .99));
}

.music-settings-panel.active-preset-hello-kitty-dream {
  color: #55364e;
  border-color: rgba(218, 125, 181, .26);
  background:
    radial-gradient(circle at 88% 7%, rgba(255, 200, 222, .46), transparent 29%),
    radial-gradient(circle at 8% 94%, rgba(171, 210, 255, .25), transparent 34%),
    linear-gradient(145deg, rgba(255, 251, 253, .99), rgba(239, 238, 255, .98));
}

.music-settings-panel.active-preset-hello-kitty-midnight {
  color: #fbe6c8;
  border-color: rgba(226, 174, 95, .28);
  background:
    repeating-linear-gradient(90deg, rgba(255, 237, 205, .025) 0 1px, transparent 1px 48px),
    radial-gradient(circle at 88% 7%, rgba(220, 171, 93, .17), transparent 29%),
    linear-gradient(145deg, rgba(30, 7, 14, .99), rgba(84, 18, 38, .98) 56%, rgba(22, 7, 13, .99));
}

.music-settings-panel.active-preset-kuromi-neon,
.music-settings-panel.active-preset-kuromi-midnight,
.music-settings-panel.active-preset-kuromi-night-flight {
  color: #f9eafb;
  border-color: rgba(245, 79, 168, .32);
  background:
    linear-gradient(135deg, transparent 0 47%, rgba(242, 73, 163, .08) 48% 50%, transparent 51%) 0 0 / 64px 64px,
    radial-gradient(circle at 88% 7%, rgba(241, 65, 159, .18), transparent 29%),
    linear-gradient(145deg, rgba(12, 7, 18, .99), rgba(49, 23, 61, .98));
}
.music-settings-panel.active-preset-kuromi-midnight { background: linear-gradient(135deg, transparent 0 47%, rgba(242, 73, 163, .1) 48% 50%, transparent 51%) 0 0 / 64px 64px, linear-gradient(145deg, #050407, #1c0d22 56%, #08050b); }
.music-settings-panel.active-preset-kuromi-night-flight { border-color: rgba(181, 128, 255, .34); background: radial-gradient(circle at 88% 8%, rgba(202, 141, 255, .18), transparent 30%), linear-gradient(145deg, #14112c, #39265f 56%, #17112f); }

.music-settings-panel:is(.active-preset-starry-radio, .active-preset-midnight-cinema, .active-preset-hello-kitty-midnight, .active-preset-kuromi-neon, .active-preset-kuromi-midnight, .active-preset-kuromi-night-flight) .music-settings-header p,
.music-settings-panel:is(.active-preset-starry-radio, .active-preset-midnight-cinema, .active-preset-hello-kitty-midnight, .active-preset-kuromi-neon, .active-preset-kuromi-midnight, .active-preset-kuromi-night-flight) .music-settings-section-title span,
.music-settings-panel:is(.active-preset-starry-radio, .active-preset-midnight-cinema, .active-preset-hello-kitty-midnight, .active-preset-kuromi-neon, .active-preset-kuromi-midnight, .active-preset-kuromi-night-flight) .music-setting-row small,
.music-settings-panel:is(.active-preset-starry-radio, .active-preset-midnight-cinema, .active-preset-hello-kitty-midnight, .active-preset-kuromi-neon, .active-preset-kuromi-midnight, .active-preset-kuromi-night-flight) .music-settings-footer,
.music-settings-panel:is(.active-preset-starry-radio, .active-preset-midnight-cinema, .active-preset-hello-kitty-midnight, .active-preset-kuromi-neon, .active-preset-kuromi-midnight, .active-preset-kuromi-night-flight) .music-preset-group-header small { color: rgba(237, 224, 237, .67); }

.music-settings-panel:is(.active-preset-starry-radio, .active-preset-midnight-cinema, .active-preset-hello-kitty-midnight, .active-preset-kuromi-neon, .active-preset-kuromi-midnight, .active-preset-kuromi-night-flight) .music-settings-section,
.music-settings-panel:is(.active-preset-starry-radio, .active-preset-midnight-cinema, .active-preset-hello-kitty-midnight, .active-preset-kuromi-neon, .active-preset-kuromi-midnight, .active-preset-kuromi-night-flight) .music-preset-group + .music-preset-group { border-color: rgba(255, 255, 255, .12); }

.music-settings-panel:is(.active-preset-starry-radio, .active-preset-midnight-cinema, .active-preset-hello-kitty-midnight, .active-preset-kuromi-neon, .active-preset-kuromi-midnight, .active-preset-kuromi-night-flight) .music-ip-tabs,
.music-settings-panel:is(.active-preset-starry-radio, .active-preset-midnight-cinema, .active-preset-hello-kitty-midnight, .active-preset-kuromi-neon, .active-preset-kuromi-midnight, .active-preset-kuromi-night-flight) .music-settings-actions button,
.music-settings-panel:is(.active-preset-starry-radio, .active-preset-midnight-cinema, .active-preset-hello-kitty-midnight, .active-preset-kuromi-neon, .active-preset-kuromi-midnight, .active-preset-kuromi-night-flight) .music-upload-action,
.music-settings-panel:is(.active-preset-starry-radio, .active-preset-midnight-cinema, .active-preset-hello-kitty-midnight, .active-preset-kuromi-neon, .active-preset-kuromi-midnight, .active-preset-kuromi-night-flight) .music-settings-close { border-color: rgba(255, 255, 255, .13); color: #fff3ee; background: rgba(255, 255, 255, .075); }

.music-settings-panel.active-preset-midnight-cinema .music-settings-kicker,
.music-settings-panel.active-preset-hello-kitty-midnight .music-settings-kicker { color: #f0be70; }
.music-settings-panel:is(.active-preset-kuromi-neon, .active-preset-kuromi-midnight, .active-preset-kuromi-night-flight) .music-settings-kicker { color: #fa72bd; }
.music-settings-panel.active-preset-starry-radio .music-settings-kicker { color: #9bbcff; }

/* Keep the three dedicated night themes above the shared dark-mode fallback. */
body.music-theme-dark .music-settings-panel.active-preset-midnight-cinema {
  color: #fff0d9 !important;
  border-color: rgba(240, 194, 117, .28) !important;
  background:
    repeating-linear-gradient(-8deg, transparent 0 42px, rgba(231, 174, 91, .035) 43px 45px),
    radial-gradient(circle at 87% 6%, rgba(222, 157, 72, .18), transparent 31%),
    linear-gradient(145deg, rgba(17, 17, 20, .99), rgba(61, 38, 34, .98) 55%, rgba(15, 18, 23, .99)) !important;
}

body.music-theme-dark .music-settings-panel.active-preset-hello-kitty-midnight {
  color: #fbe6c8 !important;
  border-color: rgba(226, 174, 95, .28) !important;
  background:
    repeating-linear-gradient(90deg, rgba(255, 237, 205, .025) 0 1px, transparent 1px 48px),
    radial-gradient(circle at 88% 7%, rgba(220, 171, 93, .17), transparent 29%),
    linear-gradient(145deg, rgba(30, 7, 14, .99), rgba(84, 18, 38, .98) 56%, rgba(22, 7, 13, .99)) !important;
}

body.music-theme-dark .music-settings-panel.active-preset-kuromi-midnight {
  color: #f9eafb !important;
  border-color: rgba(245, 79, 168, .32) !important;
  background:
    linear-gradient(135deg, transparent 0 47%, rgba(242, 73, 163, .1) 48% 50%, transparent 51%) 0 0 / 64px 64px,
    radial-gradient(circle at 88% 7%, rgba(241, 65, 159, .18), transparent 29%),
    linear-gradient(145deg, #050407, #1c0d22 56%, #08050b) !important;
}

/* Classic dark mode uses a restrained blue-black selector tray.  The former
   light tab block made the theme chooser look detached from the classic
   player surface. */
body.music-ip-classic.music-appearance-dark .music-settings-panel.active-ip-classic .music-ip-tabs {
  border-color: rgba(173, 207, 235, .16);
  background:
    linear-gradient(145deg, rgba(18, 28, 42, .9), rgba(35, 49, 66, .82));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .045), 0 10px 24px rgba(1, 7, 16, .16);
}

body.music-ip-classic.music-appearance-dark .music-settings-panel.active-ip-classic .music-ip-tabs button {
  color: rgba(221, 233, 245, .78);
}

body.music-ip-classic.music-appearance-dark .music-settings-panel.active-ip-classic .music-ip-tabs button small {
  color: rgba(176, 199, 220, .58);
}

body.music-ip-classic.music-appearance-dark .music-settings-panel.active-ip-classic .music-ip-tabs button:hover {
  background: rgba(145, 184, 215, .1);
}

body.music-ip-classic.music-appearance-dark .music-settings-panel.active-ip-classic .music-ip-tabs button.active {
  color: #f4f9ff;
  border-color: rgba(184, 219, 244, .26);
  background: linear-gradient(145deg, rgba(86, 119, 147, .64), rgba(48, 69, 91, .82));
  box-shadow: 0 8px 18px rgba(2, 8, 18, .26), inset 0 1px 0 rgba(255, 255, 255, .11);
}

body.music-ip-classic.music-appearance-dark .music-settings-panel.active-ip-classic .music-ip-tab-avatar {
  border-color: rgba(205, 226, 241, .18);
  background: linear-gradient(145deg, #263849, #172431);
  box-shadow: 0 6px 14px rgba(1, 7, 16, .24);
}

body.music-ip-classic.music-appearance-dark .music-settings-panel.active-ip-classic .is-classic .music-ip-tab-avatar {
  color: #cae8ff;
  background: linear-gradient(145deg, #425f79, #22364a);
}

@media (max-width: 640px) {
  .music-settings-panel { border-radius: 22px; }
  .music-settings-scroll { padding: 1.1rem; }
  .music-settings-close { top: 1.1rem; right: 1.1rem; }
  .music-settings-header { padding-right: 3.25rem; }
  .music-preset-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .music-settings-actions { grid-template-columns: 1fr; }
  .music-settings-actions button,
  .music-upload-action { min-height: 58px; flex-direction: row; }
  .music-settings-section-title,
  .music-setting-row,
  .music-settings-footer { align-items: flex-start; flex-direction: column; }
  .music-range-wrap { width: 100%; }
  .music-range-wrap input { flex: 1; }
  .music-ip-tabs { grid-template-columns: 1fr; }
  .music-ip-tabs button { min-height: 52px; }
}

/* New IP scene cards: a pastry studio / ribbon cinema / arcade / library each get a different visual cue. */
.music-settings-preview.preset-hello-kitty-patisserie { background: linear-gradient(125deg, #fff4df, #ffb8c5 50%, #d7efd2); }
.music-settings-preview.preset-hello-kitty-candy-carousel { background: linear-gradient(125deg, #f8d8e5, #f3d5bd 52%, #bbc9ef); }
.music-settings-preview.preset-hello-kitty-ribbon-cinema { background: linear-gradient(125deg, #3e1020, #ca6573 50%, #ffc99c); }
.music-settings-preview.preset-hello-kitty-sakura-breeze { background: linear-gradient(125deg, #fff9f7, #f8c8dd 50%, #c9e8ee); }
.music-settings-preview.preset-kuromi-arcade-noir { background: linear-gradient(125deg, #0d091b, #54206b 50%, #f05cab); }
.music-settings-preview.preset-kuromi-vinyl-rush { background: linear-gradient(125deg, #170a22, #52245e 53%, #d96cae); }
.music-settings-preview.preset-kuromi-violet-library { background: linear-gradient(125deg, #171126, #59406f 50%, #9e78bf); }
.music-settings-preview.preset-kuromi-sticker-storm { background: linear-gradient(125deg, #25112f, #8b286f 50%, #f572bd); }

.music-settings-preview.preset-hello-kitty-patisserie .music-settings-preview-art {
  background-image: linear-gradient(90deg, rgba(255, 251, 239, .86), rgba(255, 255, 255, .04)), url('/images/music-themes/kitty-strawberry-patisserie.png');
  animation: music-settings-preview-pan 9s ease-in-out infinite alternate;
}
.music-settings-preview.preset-hello-kitty-candy-carousel .music-settings-preview-art { background-image: linear-gradient(90deg, rgba(255, 246, 249, .92), rgba(255, 255, 255, .04)), url('/images/music-themes/kitty-carousel-sunrise.png'); animation: music-settings-preview-pan 9s ease-in-out infinite alternate; }
.music-settings-preview.preset-hello-kitty-ribbon-cinema .music-settings-preview-art { color: #fff2da; background-image: linear-gradient(90deg, rgba(51, 11, 24, .94), rgba(197, 89, 103, .13)), url('/images/music-themes/kitty-ribbon-cinema.png'); }
.music-settings-preview.preset-hello-kitty-sakura-breeze .music-settings-preview-art { background-image: linear-gradient(90deg, rgba(255, 250, 248, .88), rgba(255, 206, 222, .08)), url('/images/music-themes/kitty-sakura-letter.png'); animation: music-ip-preview-pan 7s ease-in-out infinite alternate; }
.music-settings-preview.preset-kuromi-arcade-noir .music-settings-preview-art { color: #fff2fb; background-image: linear-gradient(90deg, rgba(11, 7, 25, .94), rgba(78, 20, 92, .14)), url('/images/music-themes/kuromi-arcade-noir.png'); animation: music-settings-preview-pan 8s ease-in-out infinite alternate; }
.music-settings-preview.preset-kuromi-vinyl-rush .music-settings-preview-art { color: #fff0fb; background-image: linear-gradient(90deg, rgba(22, 7, 30, .96), rgba(116, 35, 119, .12)), url('/images/music-themes/kuromi-vinyl-night.png'); animation: music-settings-preview-pan 8s ease-in-out infinite alternate; }
.music-settings-preview.preset-kuromi-violet-library .music-settings-preview-art { color: #f8f0ff; background-image: linear-gradient(90deg, rgba(20, 13, 36, .93), rgba(93, 62, 126, .13)), url('/images/music-themes/kuromi-violet-library.png'); }
.music-settings-preview.preset-kuromi-sticker-storm .music-settings-preview-art { color: #fff1fb; background-image: linear-gradient(90deg, rgba(35, 12, 45, .92), rgba(161, 45, 123, .14)), url('/images/music-themes/kuromi-sticker-storm.png'); animation: music-ip-preview-pan 5.5s ease-in-out infinite alternate-reverse; }

.music-preset-card:is(.is-hello-kitty-patisserie, .is-hello-kitty-ribbon-cinema, .is-hello-kitty-sakura-breeze, .is-hello-kitty-candy-carousel) { color: #642a39; }
.music-preset-card.is-hello-kitty-patisserie { background-image: linear-gradient(145deg, rgba(255, 250, 239, .42), rgba(255, 178, 189, .13)), url('/images/music-themes/kitty-strawberry-patisserie.png'); animation: music-card-pan 8s ease-in-out infinite alternate; }
.music-preset-card.is-hello-kitty-ribbon-cinema { color: #fff0dc; background-image: linear-gradient(145deg, rgba(43, 7, 20, .36), rgba(205, 91, 100, .16)), url('/images/music-themes/kitty-ribbon-cinema.png'); box-shadow: inset 0 -58px 42px rgba(51, 10, 25, .9), 0 8px 20px rgba(103, 28, 51, .22); }
.music-preset-card.is-hello-kitty-ribbon-cinema::before { background: linear-gradient(180deg, transparent 18%, rgba(107, 28, 45, .2) 52%, rgba(50, 9, 24, .96)); }
.music-preset-card.is-hello-kitty-ribbon-cinema small { color: #f2c7bb; }
.music-preset-card.is-hello-kitty-sakura-breeze { background-image: linear-gradient(145deg, rgba(255, 249, 250, .68), rgba(249, 184, 211, .2)), url('/images/music-themes/kitty-sakura-letter.png'); background-size: cover, auto 108%; background-position: center, 84% 28%; background-repeat: no-repeat; animation: music-ip-card-pan 6s ease-in-out infinite alternate; }
.music-preset-card.is-hello-kitty-candy-carousel { color: #71384f; background-image: linear-gradient(145deg, rgba(255, 247, 249, .54), rgba(229, 142, 173, .16)), url('/images/music-themes/kitty-carousel-sunrise.png'); animation: music-card-pan 6s ease-in-out infinite alternate-reverse; }
.music-preset-card.is-hello-kitty-candy-carousel small { color: #a37186; }
.music-preset-card:is(.is-kuromi-arcade-noir, .is-kuromi-violet-library, .is-kuromi-sticker-storm, .is-kuromi-vinyl-rush) { color: #fff4fc; box-shadow: inset 0 -58px 42px rgba(19, 9, 30, .9), 0 8px 20px rgba(38, 12, 57, .24); }
.music-preset-card.is-kuromi-arcade-noir { background-image: linear-gradient(145deg, rgba(12, 7, 28, .34), rgba(217, 62, 174, .14)), url('/images/music-themes/kuromi-arcade-noir.png'); }
.music-preset-card.is-kuromi-violet-library { background-image: linear-gradient(145deg, rgba(16, 11, 31, .52), rgba(118, 91, 159, .18)), url('/images/music-themes/kuromi-violet-library.png'); background-size: cover, auto 114%; background-position: center, 78% 28%; background-repeat: no-repeat; }
.music-preset-card.is-kuromi-sticker-storm { background-image: linear-gradient(145deg, rgba(37, 10, 49, .5), rgba(236, 75, 174, .18)), url('/images/music-themes/kuromi-sticker-storm.png'); background-size: cover, auto 112%; background-position: center, 88% 24%; background-repeat: no-repeat; animation: music-ip-card-pan 5.5s ease-in-out infinite alternate-reverse; }
.music-preset-card.is-kuromi-vinyl-rush { color: #fff0fb; background-image: linear-gradient(145deg, rgba(22, 7, 30, .52), rgba(185, 63, 154, .17)), url('/images/music-themes/kuromi-vinyl-night.png'); animation: music-card-pan 5.8s ease-in-out infinite alternate; }
.music-preset-card.is-kuromi-vinyl-rush small { color: #d6b4d3; }
.music-preset-card:is(.is-kuromi-arcade-noir, .is-kuromi-violet-library, .is-kuromi-sticker-storm, .is-kuromi-vinyl-rush)::before { background: linear-gradient(180deg, transparent 18%, rgba(48, 20, 65, .2) 52%, rgba(19, 9, 30, .97)); }
.music-preset-card:is(.is-kuromi-arcade-noir, .is-kuromi-violet-library, .is-kuromi-sticker-storm, .is-kuromi-vinyl-rush) small { color: #e2c9ee; }
</style>
