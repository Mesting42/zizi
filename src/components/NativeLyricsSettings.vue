<template>
  <template v-if="isNativeApp">
    <button
      v-if="showTrigger"
      class="native-lyrics-settings-trigger"
      :class="{ 'is-locked': preferences.locked }"
      type="button"
      :aria-label="preferences.locked ? '桌面歌词已锁定，打开设置' : '打开桌面歌词设置'"
      @click.stop="showSettings = true"
    >
      <span aria-hidden="true">{{ preferences.locked ? '🔒' : 'Aa' }}</span>
    </button>

    <Teleport to="body">
      <Transition name="native-lyrics-settings">
        <div
          v-if="showSettings"
          class="native-lyrics-settings-layer"
          @click.self="showSettings = false"
        >
          <section class="native-lyrics-settings-sheet" aria-label="桌面歌词设置">
            <header>
              <div>
                <strong>桌面歌词</strong>
                <span>样式修改会立即生效</span>
              </div>
              <button type="button" aria-label="关闭设置" @click="showSettings = false">×</button>
            </header>

            <div class="native-lyrics-preview" :style="previewStyle">
              {{ previewLine }}
            </div>

            <div class="native-lyrics-setting">
              <div class="native-lyrics-setting-label">
                <span>字体大小</span>
                <strong>{{ preferences.size }}px</strong>
              </div>
              <input
                v-model.number="preferences.size"
                type="range"
                min="16"
                max="36"
                step="1"
                aria-label="桌面歌词字体大小"
              >
            </div>

            <div class="native-lyrics-setting">
              <div class="native-lyrics-setting-label">
                <span>字体颜色</span>
              </div>
              <div class="native-lyrics-color-options">
                <button
                  v-for="color in colorOptions"
                  :key="color"
                  type="button"
                  :class="{ active: preferences.color === color }"
                  :style="{ backgroundColor: color }"
                  :aria-label="`使用颜色 ${color}`"
                  @click="preferences.color = color"
                ></button>
                <button
                  class="native-lyrics-custom-color"
                  type="button"
                  aria-label="打开自定义歌词颜色"
                  @click="openCustomColorEditor"
                >
                  <span>+</span>
                </button>
              </div>
            </div>

            <label class="native-lyrics-lock-row">
              <span>
                <strong>锁定桌面歌词</strong>
                <small>锁定后防止误拖，并允许点击穿透</small>
              </span>
              <input v-model="preferences.locked" type="checkbox">
              <i aria-hidden="true"></i>
            </label>

            <button class="native-lyrics-reset" type="button" @click="resetPreferences">
              恢复默认样式
            </button>
          </section>

          <Transition name="native-lyrics-color-editor">
            <div
              v-if="showCustomColor"
              class="native-lyrics-color-editor-layer"
              @click.self="showCustomColor = false"
            >
              <section class="native-lyrics-color-editor" aria-label="自定义歌词颜色">
                <header>
                  <div>
                    <strong>自定义颜色</strong>
                    <span>拖动滑杆，实时预览效果</span>
                  </div>
                  <button type="button" aria-label="关闭自定义颜色" @click="showCustomColor = false">×</button>
                </header>

                <div class="native-lyrics-custom-preview">
                  <i :style="{ backgroundColor: customColorHex }"></i>
                  <div>
                    <strong :style="{ color: customColorHex }">{{ previewLine }}</strong>
                    <span>{{ customColorHex }}</span>
                  </div>
                </div>

                <label class="native-lyrics-color-slider is-hue">
                  <span>色相 <em>{{ customColor.hue }}°</em></span>
                  <input v-model.number="customColor.hue" type="range" min="0" max="360" step="1">
                </label>

                <label class="native-lyrics-color-slider is-saturation" :style="customSliderStyle">
                  <span>鲜艳度 <em>{{ customColor.saturation }}%</em></span>
                  <input v-model.number="customColor.saturation" type="range" min="0" max="100" step="1">
                </label>

                <label class="native-lyrics-color-slider is-lightness" :style="customSliderStyle">
                  <span>明亮度 <em>{{ customColor.lightness }}%</em></span>
                  <input v-model.number="customColor.lightness" type="range" min="18" max="92" step="1">
                </label>

                <footer>
                  <button type="button" @click="showCustomColor = false">取消</button>
                  <button type="button" class="primary" :style="{ '--chosen-color': customColorHex }" @click="applyCustomColor">
                    使用这个颜色
                  </button>
                </footer>
              </section>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </template>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { Capacitor } from '@capacitor/core'
import { usePlayer } from '../composables/usePlayer'
import {
  DEFAULT_NATIVE_LYRICS_PREFERENCES,
  applyNativeLyricsPreferences,
  loadNativeLyricsPreferences,
  saveNativeLyricsPreferences
} from '../utils/nativeLyricsOverlay'

const props = defineProps({
  showTrigger: {
    type: Boolean,
    default: true
  },
  listenForNativeOpen: {
    type: Boolean,
    default: false
  }
})

const isNativeApp = Capacitor.isNativePlatform()
const showSettings = ref(false)
const showCustomColor = ref(false)
const preferences = reactive(loadNativeLyricsPreferences())
const customColor = reactive({ hue: 195, saturation: 72, lightness: 66 })
const colorOptions = ['#FFFFFF', '#FFD45C', '#FF7FA0', '#70E2FF', '#8CFFB5', '#C9A7FF']
const { parsedLyrics, currentLyricIndex } = usePlayer()

const clampColorChannel = (value, min = 0, max = 255) => Math.min(max, Math.max(min, value))

const componentToHex = (value) => clampColorChannel(Math.round(value)).toString(16).padStart(2, '0')

const hslToHex = (hue, saturation, lightness) => {
  const h = ((Number(hue) % 360) + 360) % 360
  const s = clampColorChannel(Number(saturation), 0, 100) / 100
  const l = clampColorChannel(Number(lightness), 0, 100) / 100
  const chroma = (1 - Math.abs(2 * l - 1)) * s
  const section = h / 60
  const secondary = chroma * (1 - Math.abs((section % 2) - 1))
  const offset = l - chroma / 2
  let red = 0
  let green = 0
  let blue = 0

  if (section < 1) [red, green, blue] = [chroma, secondary, 0]
  else if (section < 2) [red, green, blue] = [secondary, chroma, 0]
  else if (section < 3) [red, green, blue] = [0, chroma, secondary]
  else if (section < 4) [red, green, blue] = [0, secondary, chroma]
  else if (section < 5) [red, green, blue] = [secondary, 0, chroma]
  else [red, green, blue] = [chroma, 0, secondary]

  return `#${componentToHex((red + offset) * 255)}${componentToHex((green + offset) * 255)}${componentToHex((blue + offset) * 255)}`.toUpperCase()
}

const hexToHsl = (hex) => {
  const normalized = String(hex || '').replace('#', '')
  const red = Number.parseInt(normalized.slice(0, 2), 16) / 255
  const green = Number.parseInt(normalized.slice(2, 4), 16) / 255
  const blue = Number.parseInt(normalized.slice(4, 6), 16) / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const delta = max - min
  const lightness = (max + min) / 2
  let hue = 0

  if (delta) {
    if (max === red) hue = 60 * (((green - blue) / delta) % 6)
    else if (max === green) hue = 60 * ((blue - red) / delta + 2)
    else hue = 60 * ((red - green) / delta + 4)
  }

  const saturation = delta ? delta / (1 - Math.abs(2 * lightness - 1)) : 0
  return {
    hue: Math.round((hue + 360) % 360),
    saturation: Math.round(saturation * 100),
    lightness: Math.round(lightness * 100)
  }
}

const previewLine = computed(() => (
  parsedLyrics.value[currentLyricIndex.value]?.text
  || parsedLyrics.value[0]?.text
  || '让音乐停留在桌面'
))

const previewStyle = computed(() => ({
  color: preferences.color,
  fontSize: `${preferences.size}px`
}))

const customColorHex = computed(() => hslToHex(
  customColor.hue,
  customColor.saturation,
  customColor.lightness
))

const customSliderStyle = computed(() => ({
  '--custom-hue-color': `hsl(${customColor.hue} 100% 50%)`,
  '--custom-color': customColorHex.value
}))

const resetPreferences = () => {
  Object.assign(preferences, DEFAULT_NATIVE_LYRICS_PREFERENCES)
}

const openCustomColorEditor = () => {
  Object.assign(customColor, hexToHsl(preferences.color))
  showCustomColor.value = true
}

const applyCustomColor = () => {
  preferences.color = customColorHex.value
  showCustomColor.value = false
}

const openSettingsFromDesktopLyrics = () => {
  showSettings.value = true
}

const syncDesktopLyricsLock = (event) => {
  preferences.locked = Boolean(event.detail?.locked)
}

const syncDesktopLyricsAppearance = (event) => {
  const detail = event.detail || {}
  if (/^#[0-9a-f]{6}$/i.test(detail.color || '')) preferences.color = detail.color.toUpperCase()
  if (Number.isFinite(Number(detail.size))) preferences.size = Number(detail.size)
  preferences.locked = Boolean(detail.locked)
}

onMounted(() => {
  if (!props.listenForNativeOpen) return
  window.addEventListener('mesting:open-native-lyrics-settings', openSettingsFromDesktopLyrics)
  window.addEventListener('mesting:lyrics-overlay-lock-changed', syncDesktopLyricsLock)
  window.addEventListener('mesting:lyrics-overlay-appearance-changed', syncDesktopLyricsAppearance)
})

onUnmounted(() => {
  if (!props.listenForNativeOpen) return
  window.removeEventListener('mesting:open-native-lyrics-settings', openSettingsFromDesktopLyrics)
  window.removeEventListener('mesting:lyrics-overlay-lock-changed', syncDesktopLyricsLock)
  window.removeEventListener('mesting:lyrics-overlay-appearance-changed', syncDesktopLyricsAppearance)
})

watch(showSettings, (visible) => {
  if (!visible) showCustomColor.value = false
})

watch(
  preferences,
  (nextPreferences) => {
    const normalized = saveNativeLyricsPreferences(nextPreferences)
    applyNativeLyricsPreferences(normalized)
  },
  { deep: true, immediate: true }
)
</script>

<style scoped>
.native-lyrics-settings-trigger {
  display: inline-grid;
  width: 34px;
  height: 34px;
  min-width: 34px;
  padding: 0;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, .14);
  border-radius: 50%;
  color: rgba(255, 244, 248, .82);
  background: rgba(255, 255, 255, .08);
  font-size: 11px;
  font-weight: 800;
}

.native-lyrics-settings-trigger.is-locked {
  color: #ffd45c;
  background: rgba(255, 212, 92, .14);
}

.native-lyrics-settings-layer {
  position: fixed;
  inset: 0;
  z-index: 20050;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 16px;
  padding-bottom: max(16px, env(safe-area-inset-bottom, 0px));
  background: rgba(7, 8, 12, .48);
}

.native-lyrics-settings-sheet {
  width: min(460px, 100%);
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, .12);
  border-radius: 24px;
  color: #f8f5f7;
  background: #211b22;
  box-shadow: 0 26px 70px rgba(0, 0, 0, .42);
}

.native-lyrics-settings-sheet header,
.native-lyrics-setting-label,
.native-lyrics-lock-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.native-lyrics-settings-sheet header div {
  display: grid;
  gap: 3px;
}

.native-lyrics-settings-sheet header strong {
  font-size: 18px;
}

.native-lyrics-settings-sheet header span,
.native-lyrics-lock-row small {
  color: rgba(255, 255, 255, .5);
  font-size: 12px;
}

.native-lyrics-settings-sheet header > button {
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 50%;
  color: rgba(255, 255, 255, .72);
  background: rgba(255, 255, 255, .08);
  font-size: 22px;
}

.native-lyrics-preview {
  min-height: 74px;
  margin: 18px 0;
  padding: 16px 10px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border-radius: 16px;
  text-align: center;
  font-weight: 750;
  text-shadow: 0 2px 5px rgba(0, 0, 0, .9);
  background:
    linear-gradient(45deg, #373238 25%, transparent 25% 75%, #373238 75%),
    linear-gradient(45deg, #373238 25%, #29252a 25% 75%, #373238 75%);
  background-position: 0 0, 8px 8px;
  background-size: 16px 16px;
}

.native-lyrics-setting {
  margin-top: 16px;
}

.native-lyrics-setting-label {
  margin-bottom: 10px;
  font-size: 14px;
}

.native-lyrics-setting-label strong {
  color: #ff89a5;
  font-size: 12px;
}

.native-lyrics-setting input[type='range'] {
  width: 100%;
  accent-color: #ff668a;
}

.native-lyrics-color-options {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.native-lyrics-color-options > button,
.native-lyrics-custom-color {
  width: 28px;
  height: 28px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 50%;
}

.native-lyrics-color-options > button.active {
  border-color: #211b22;
  box-shadow: 0 0 0 2px #fff;
}

.native-lyrics-custom-color {
  position: relative;
  display: grid;
  overflow: hidden;
  place-items: center;
  color: #fff;
  background: conic-gradient(#ff627f, #ffd45c, #72e5ff, #a789ff, #ff627f);
}

.native-lyrics-custom-color input {
  position: absolute;
  inset: 0;
  opacity: 0;
}

.native-lyrics-custom-color span {
  position: relative;
  font-size: 18px;
  text-shadow: 0 1px 3px #000;
}

.native-lyrics-color-editor-layer {
  position: fixed;
  inset: 0;
  z-index: 20060;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 16px;
  padding-bottom: max(16px, env(safe-area-inset-bottom, 0px));
  background: rgba(4, 5, 9, .66);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.native-lyrics-color-editor {
  width: min(430px, 100%);
  padding: 18px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, .13);
  border-radius: 26px;
  color: #f8f5f7;
  background:
    radial-gradient(circle at 88% 0%, rgba(112, 226, 255, .13), transparent 30%),
    radial-gradient(circle at 8% 8%, rgba(255, 102, 138, .12), transparent 28%),
    #211b22;
  box-shadow:
    0 28px 80px rgba(0, 0, 0, .56),
    inset 0 1px 0 rgba(255, 255, 255, .07);
}

.native-lyrics-color-editor header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.native-lyrics-color-editor header > div {
  display: grid;
  gap: 3px;
}

.native-lyrics-color-editor header strong {
  font-size: 18px;
}

.native-lyrics-color-editor header span {
  color: rgba(255, 255, 255, .5);
  font-size: 12px;
}

.native-lyrics-color-editor header > button {
  display: grid;
  width: 36px;
  height: 36px;
  padding: 0;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, .08);
  border-radius: 50%;
  color: rgba(255, 255, 255, .72);
  background: rgba(255, 255, 255, .08);
  font-size: 22px;
}

.native-lyrics-custom-preview {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  align-items: center;
  gap: 13px;
  min-height: 82px;
  margin: 18px 0 16px;
  padding: 12px 14px;
  border: 1px solid rgba(255, 255, 255, .08);
  border-radius: 18px;
  background:
    linear-gradient(45deg, rgba(255, 255, 255, .045) 25%, transparent 25% 75%, rgba(255, 255, 255, .045) 75%),
    linear-gradient(45deg, rgba(255, 255, 255, .045) 25%, rgba(6, 7, 12, .58) 25% 75%, rgba(255, 255, 255, .045) 75%);
  background-position: 0 0, 8px 8px;
  background-size: 16px 16px;
}

.native-lyrics-custom-preview > i {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(255, 255, 255, .8);
  border-radius: 16px;
  box-shadow: 0 8px 22px rgba(0, 0, 0, .28);
}

.native-lyrics-custom-preview > div {
  display: grid;
  min-width: 0;
  gap: 5px;
}

.native-lyrics-custom-preview strong {
  overflow: hidden;
  font-size: 16px;
  line-height: 1.3;
  text-overflow: ellipsis;
  text-shadow: 0 2px 5px rgba(0, 0, 0, .9);
  white-space: nowrap;
}

.native-lyrics-custom-preview span {
  color: rgba(255, 255, 255, .52);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .06em;
}

.native-lyrics-color-slider {
  display: grid;
  gap: 8px;
  margin-top: 14px;
}

.native-lyrics-color-slider > span {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: rgba(255, 255, 255, .82);
  font-size: 13px;
}

.native-lyrics-color-slider em {
  color: rgba(255, 255, 255, .5);
  font-size: 11px;
  font-style: normal;
  font-variant-numeric: tabular-nums;
}

.native-lyrics-color-slider input[type='range'] {
  width: 100%;
  height: 20px;
  margin: 0;
  appearance: none;
  -webkit-appearance: none;
  border: 0;
  outline: 0;
  background: transparent;
}

.native-lyrics-color-slider input[type='range']::-webkit-slider-runnable-track {
  height: 8px;
  border: 1px solid rgba(255, 255, 255, .16);
  border-radius: 999px;
  background: var(--slider-track);
}

.native-lyrics-color-slider input[type='range']::-webkit-slider-thumb {
  width: 22px;
  height: 22px;
  margin-top: -8px;
  appearance: none;
  -webkit-appearance: none;
  border: 3px solid #fff;
  border-radius: 50%;
  background: var(--custom-color, #ff668a);
  box-shadow: 0 4px 12px rgba(0, 0, 0, .36);
}

.native-lyrics-color-slider.is-hue {
  --slider-track: linear-gradient(90deg, #ff4d4d, #fff04d, #59ff68, #55f5ff, #5b69ff, #d65bff, #ff4d72);
}

.native-lyrics-color-slider.is-saturation {
  --slider-track: linear-gradient(90deg, #a9a9ad, var(--custom-hue-color));
}

.native-lyrics-color-slider.is-lightness {
  --slider-track: linear-gradient(90deg, #111, var(--custom-hue-color), #fff);
}

.native-lyrics-color-editor footer {
  display: grid;
  grid-template-columns: .8fr 1.2fr;
  gap: 10px;
  margin-top: 20px;
}

.native-lyrics-color-editor footer button {
  min-height: 44px;
  border: 1px solid rgba(255, 255, 255, .09);
  border-radius: 15px;
  color: rgba(255, 255, 255, .72);
  background: rgba(255, 255, 255, .07);
  font-weight: 750;
}

.native-lyrics-color-editor footer button.primary {
  border-color: color-mix(in srgb, var(--chosen-color) 58%, white 18%);
  color: #fff;
  background: linear-gradient(135deg, color-mix(in srgb, var(--chosen-color) 76%, #222), var(--chosen-color));
  box-shadow: 0 10px 24px color-mix(in srgb, var(--chosen-color) 28%, transparent);
  text-shadow: 0 1px 3px rgba(0, 0, 0, .34);
}

.native-lyrics-lock-row {
  position: relative;
  gap: 18px;
  margin-top: 20px;
  padding: 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, .055);
}

.native-lyrics-lock-row > span {
  display: grid;
  gap: 4px;
}

.native-lyrics-lock-row input {
  position: absolute;
  opacity: 0;
}

.native-lyrics-lock-row i {
  position: relative;
  width: 46px;
  height: 26px;
  flex: 0 0 auto;
  border-radius: 99px;
  background: rgba(255, 255, 255, .16);
  transition: background .2s ease;
}

.native-lyrics-lock-row i::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  transition: transform .22s cubic-bezier(.2, .8, .2, 1);
}

.native-lyrics-lock-row input:checked + i {
  background: #ff668a;
}

.native-lyrics-lock-row input:checked + i::after {
  transform: translateX(20px);
}

.native-lyrics-reset {
  width: 100%;
  margin-top: 14px;
  padding: 11px;
  border: 0;
  border-radius: 14px;
  color: rgba(255, 255, 255, .7);
  background: rgba(255, 255, 255, .07);
}

.native-lyrics-settings-enter-active,
.native-lyrics-settings-leave-active {
  transition: opacity .2s ease;
}

.native-lyrics-settings-enter-active .native-lyrics-settings-sheet,
.native-lyrics-settings-leave-active .native-lyrics-settings-sheet {
  transition: transform .28s cubic-bezier(.2, .8, .2, 1);
}

.native-lyrics-settings-enter-from,
.native-lyrics-settings-leave-to {
  opacity: 0;
}

.native-lyrics-settings-enter-from .native-lyrics-settings-sheet,
.native-lyrics-settings-leave-to .native-lyrics-settings-sheet {
  transform: translateY(24px);
}

.native-lyrics-color-editor-enter-active,
.native-lyrics-color-editor-leave-active {
  transition: opacity .2s ease;
}

.native-lyrics-color-editor-enter-active .native-lyrics-color-editor,
.native-lyrics-color-editor-leave-active .native-lyrics-color-editor {
  transition: transform .28s cubic-bezier(.2, .8, .2, 1);
}

.native-lyrics-color-editor-enter-from,
.native-lyrics-color-editor-leave-to {
  opacity: 0;
}

.native-lyrics-color-editor-enter-from .native-lyrics-color-editor,
.native-lyrics-color-editor-leave-to .native-lyrics-color-editor {
  transform: translateY(24px) scale(.98);
}
</style>
