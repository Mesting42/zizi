<template>
  <Teleport to="body">
    <Transition name="player-mode-toast">
      <div
        v-if="visible"
        class="player-mode-toast"
        :class="`is-${mode}`"
        role="status"
        aria-live="polite"
      >
        <span class="player-mode-toast-icon" aria-hidden="true">{{ modeIcon }}</span>
        <span>{{ modeLabel }}</span>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

const MODE_LABELS = {
  list: '顺序播放',
  single: '单曲循环',
  random: '随机播放'
}

const MODE_ICONS = {
  list: '↻',
  single: '1',
  random: '⤨'
}

const visible = ref(false)
const mode = ref('list')
let dismissTimer = 0

const modeLabel = computed(() => MODE_LABELS[mode.value] || '播放模式')
const modeIcon = computed(() => MODE_ICONS[mode.value] || '↻')

const showModeToast = (event) => {
  const nextMode = event.detail?.mode
  if (!MODE_LABELS[nextMode]) return

  mode.value = nextMode
  visible.value = false
  if (dismissTimer) window.clearTimeout(dismissTimer)

  requestAnimationFrame(() => {
    visible.value = true
    dismissTimer = window.setTimeout(() => {
      visible.value = false
      dismissTimer = 0
    }, 1500)
  })
}

onMounted(() => {
  window.addEventListener('mesting:play-mode-changed', showModeToast)
})

onUnmounted(() => {
  window.removeEventListener('mesting:play-mode-changed', showModeToast)
  if (dismissTimer) window.clearTimeout(dismissTimer)
})
</script>

<style scoped>
.player-mode-toast {
  position: fixed;
  left: 50%;
  bottom: calc(108px + env(safe-area-inset-bottom, 0px));
  z-index: 30000;
  min-width: 126px;
  min-height: 42px;
  padding: 8px 15px 8px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: 1px solid rgba(255, 255, 255, .18);
  border-radius: 999px;
  color: #fff;
  background: rgba(24, 22, 28, .88);
  box-shadow: 0 10px 28px rgba(0, 0, 0, .28);
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  font-size: 14px;
  font-weight: 650;
  pointer-events: none;
  transform: translateX(-50%);
}

.player-mode-toast-icon {
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #fff;
  background: #ff5e6c;
  font-size: 15px;
  font-weight: 800;
}

.player-mode-toast.is-single .player-mode-toast-icon {
  background: #ff668a;
}

.player-mode-toast.is-random .player-mode-toast-icon {
  background: #8d6be8;
}

.player-mode-toast-enter-active,
.player-mode-toast-leave-active {
  transition:
    opacity .2s ease,
    transform .24s cubic-bezier(.2, .8, .2, 1);
}

.player-mode-toast-enter-from,
.player-mode-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px) scale(.96);
}

@media (max-width: 768px) {
  .player-mode-toast {
    bottom: calc(96px + env(safe-area-inset-bottom, 0px));
    min-width: 118px;
    min-height: 40px;
    font-size: 13px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .player-mode-toast-enter-active,
  .player-mode-toast-leave-active {
    transition: none;
  }
}
</style>
