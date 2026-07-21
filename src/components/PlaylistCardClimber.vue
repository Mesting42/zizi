<template>
  <div class="playlist-card-climber" :class="`is-${character}`" aria-hidden="true">
    <span class="playlist-card-climber__trail"><i></i><i></i><i></i></span>

    <span class="playlist-card-climber__runner">
      <img :src="characterArtwork" alt="">
    </span>

    <span class="playlist-card-climber__peeker">
      <img :src="characterArtwork" alt="">
      <small>{{ characterLabel }}</small>
      <i class="playlist-card-climber__note">♪</i>
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  character: { type: String, default: 'friends' }
})

const CHARACTER_ART = {
  shinchan: {
    label: '小新出动',
    src: '/images/motion-walk-shinchan-stride.png'
  },
  friends: {
    label: '春日部防卫队',
    src: '/images/playlist-climber-friends.png'
  }
}

const activeCharacter = computed(() => CHARACTER_ART[props.character] || CHARACTER_ART.friends)
const characterArtwork = computed(() => activeCharacter.value.src)
const characterLabel = computed(() => activeCharacter.value.label)
</script>

<style scoped>
.playlist-card-climber {
  position: absolute !important;
  inset: 0;
  z-index: auto !important;
  overflow: visible;
  pointer-events: none;
}

.playlist-card-climber__runner,
.playlist-card-climber__peeker {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.playlist-card-climber__runner {
  left: -98px;
  top: 44%;
  z-index: 0;
  width: 94px;
  height: 112px;
  transform-origin: 58% 76%;
  animation: playlist-original-climb 8.8s cubic-bezier(0.42, 0.02, 0.24, 1) both;
}

.playlist-card-climber.is-friends .playlist-card-climber__runner {
  left: -172px;
  top: 50%;
  width: 184px;
  height: 105px;
}

.playlist-card-climber__runner img,
.playlist-card-climber__peeker img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center bottom;
  filter: drop-shadow(0 7px 7px rgba(31, 37, 52, 0.22));
  user-select: none;
  -webkit-user-drag: none;
}

.playlist-card-climber__runner img {
  animation: playlist-original-step 0.52s ease-in-out infinite alternate;
}

.playlist-card-climber__peeker {
  left: -24px;
  top: -76px;
  z-index: 6;
  width: 104px;
  height: 122px;
  transform-origin: 52% 88%;
  animation: playlist-original-peek 8.8s cubic-bezier(0.34, 1.28, 0.5, 1) both;
}

.playlist-card-climber.is-friends .playlist-card-climber__peeker {
  left: -48px;
  top: -74px;
  width: 214px;
  height: 116px;
}

.playlist-card-climber__peeker small {
  position: absolute;
  right: -8px;
  top: 11px;
  padding: 3px 7px;
  border: 1px solid rgba(255, 255, 255, 0.76);
  border-radius: 999px;
  background: rgba(221, 74, 66, 0.88);
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.03em;
  box-shadow: 0 5px 14px rgba(75, 43, 38, 0.18);
  backdrop-filter: blur(7px);
}

.playlist-card-climber.is-friends .playlist-card-climber__peeker small {
  right: -3px;
  top: 5px;
  background: rgba(49, 104, 147, 0.88);
}

.playlist-card-climber__note {
  position: absolute;
  right: 2px;
  top: -8px;
  color: #e84c55;
  font-family: Georgia, serif;
  font-size: 20px;
  font-style: normal;
  animation: playlist-original-note 1.5s ease-in-out infinite;
}

.playlist-card-climber__trail {
  position: absolute;
  left: -18px;
  top: 8px;
  z-index: 0;
  width: 26px;
  height: 78%;
  opacity: 0;
  animation: playlist-original-trail 8.8s ease both;
}

.playlist-card-climber__trail i {
  position: absolute;
  left: 7px;
  width: 17px;
  height: 7px;
  border-top: 2px solid rgba(238, 107, 91, 0.52);
  border-radius: 50%;
  transform: rotate(-18deg);
}

.playlist-card-climber__trail i:nth-child(1) { bottom: 9%; }
.playlist-card-climber__trail i:nth-child(2) { bottom: 43%; left: 1px; border-color: rgba(65, 156, 190, 0.52); }
.playlist-card-climber__trail i:nth-child(3) { bottom: 74%; left: 9px; border-color: rgba(237, 174, 43, 0.6); }

@keyframes playlist-original-climb {
  0%, 5% { opacity: 0; transform: translate3d(0, 42px, 0) rotate(-8deg); }
  12% { opacity: 1; }
  48% { opacity: 1; transform: translate3d(58px, -48px, 0) rotate(5deg); }
  57%, 100% { opacity: 0; transform: translate3d(86px, -92px, 0) rotate(0); }
}

@keyframes playlist-original-peek {
  0%, 48% { opacity: 0; transform: translateY(36px) scale(0.84); }
  58% { opacity: 1; transform: translateY(5px) scale(0.96); }
  66%, 88% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(22px) scale(0.9); }
}

@keyframes playlist-original-step {
  from { transform: translateY(0) rotate(-2deg); }
  to { transform: translateY(-5px) rotate(2deg); }
}

@keyframes playlist-original-note {
  0%, 100% { opacity: 0.42; transform: translateY(4px) rotate(-8deg); }
  50% { opacity: 1; transform: translateY(-5px) rotate(8deg); }
}

@keyframes playlist-original-trail {
  0%, 8%, 94%, 100% { opacity: 0; }
  18%, 82% { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .playlist-card-climber__runner,
  .playlist-card-climber__runner img,
  .playlist-card-climber__peeker,
  .playlist-card-climber__note,
  .playlist-card-climber__trail {
    animation: none !important;
  }

  .playlist-card-climber__peeker {
    opacity: 1;
    transform: none;
  }
}
</style>
