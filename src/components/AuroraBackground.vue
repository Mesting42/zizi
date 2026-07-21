<template>
  <div class="aurora-background" :class="{ 'is-paused': isPaused }" aria-hidden="true">
    <span class="aurora-veil"></span>
    <span class="aurora-shimmer"></span>
    <span class="aurora-orb aurora-orb-one"></span>
    <span class="aurora-orb aurora-orb-two"></span>
    <span class="aurora-orb aurora-orb-three"></span>
    <span class="aurora-orb aurora-orb-four"></span>
    <span class="aurora-wave aurora-wave-one"></span>
    <span class="aurora-wave aurora-wave-two"></span>
    <span class="aurora-float aurora-float-one"></span>
    <span class="aurora-float aurora-float-two"></span>
    <span class="aurora-float aurora-float-three"></span>
    <span class="aurora-grid"></span>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isPaused = ref(typeof document !== 'undefined' ? document.hidden : false)

const syncVisibility = () => {
  isPaused.value = document.hidden
}

onMounted(() => {
  document.addEventListener('visibilitychange', syncVisibility)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', syncVisibility)
})
</script>

<style scoped>
.aurora-background {
  position: fixed;
  inset: -12vh -10vw;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  contain: paint;
  --aurora-blue: rgba(91, 108, 255, 0.34);
  --aurora-cyan: rgba(103, 232, 249, 0.24);
  --aurora-rose: rgba(255, 143, 163, 0.2);
  --aurora-violet: rgba(196, 181, 253, 0.26);
  --aurora-base: rgba(255, 255, 255, 0.8);
}

.aurora-veil {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 8%, rgba(255, 255, 255, 0.76), transparent 34%),
    radial-gradient(circle at 18% 18%, rgba(91, 108, 255, 0.08), transparent 30%),
    radial-gradient(circle at 82% 14%, rgba(103, 232, 249, 0.08), transparent 26%),
    linear-gradient(135deg, rgba(247, 249, 255, 0.88) 0%, rgba(241, 246, 255, 0.68) 48%, rgba(244, 247, 255, 0.9) 100%);
  opacity: 0.95;
}

.aurora-orb,
.aurora-wave {
  position: absolute;
  border-radius: 999px;
  mix-blend-mode: screen;
  will-change: transform, opacity;
}

.aurora-orb {
  filter: blur(72px) saturate(155%);
  opacity: 0.88;
}

.aurora-orb-one {
  width: 42vw;
  height: 42vw;
  left: -10vw;
  top: -8vh;
  background: radial-gradient(circle at 30% 30%, var(--aurora-blue) 0%, rgba(91, 108, 255, 0.16) 34%, transparent 72%);
  animation: aurora-drift-one 24s ease-in-out infinite alternate;
}

.aurora-orb-two {
  width: 36vw;
  height: 36vw;
  right: -8vw;
  top: 10vh;
  background: radial-gradient(circle at 38% 34%, var(--aurora-cyan) 0%, rgba(103, 232, 249, 0.1) 36%, transparent 74%);
  animation: aurora-drift-two 28s ease-in-out infinite alternate;
}

.aurora-orb-three {
  width: 48vw;
  height: 48vw;
  left: 28vw;
  bottom: -18vh;
  background: radial-gradient(circle at 50% 46%, var(--aurora-rose) 0%, rgba(255, 143, 163, 0.08) 34%, transparent 74%);
  animation: aurora-drift-three 30s ease-in-out infinite alternate;
}

.aurora-wave {
  width: 160vw;
  height: 30vh;
  left: -30vw;
  filter: blur(90px) saturate(160%);
  opacity: 0.68;
  transform-origin: center;
}

.aurora-wave-one {
  top: 2vh;
  background: linear-gradient(90deg, transparent 0%, rgba(91, 108, 255, 0.18) 16%, rgba(103, 232, 249, 0.3) 48%, rgba(255, 143, 163, 0.18) 72%, transparent 100%);
  transform: rotate(-8deg);
  animation: aurora-wave-one 22s ease-in-out infinite alternate;
}

.aurora-wave-two {
  top: 32vh;
  background: linear-gradient(90deg, transparent 0%, rgba(196, 181, 253, 0.16) 18%, rgba(91, 108, 255, 0.22) 50%, rgba(103, 232, 249, 0.16) 78%, transparent 100%);
  transform: rotate(14deg);
  animation: aurora-wave-two 26s ease-in-out infinite alternate;
  opacity: 0.52;
}

.aurora-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(92, 124, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(92, 124, 255, 0.04) 1px, transparent 1px);
  background-size: 72px 72px;
  opacity: 0.3;
  mask-image: radial-gradient(circle at 50% 18%, #000 0%, transparent 72%);
  -webkit-mask-image: radial-gradient(circle at 50% 18%, #000 0%, transparent 72%);
}

.aurora-shimmer,
.aurora-orb-four,
.aurora-float {
  display: none;
}

body.page-home .aurora-shimmer {
  display: block;
  position: absolute;
  inset: -25%;
  background:
    linear-gradient(
      108deg,
      transparent 38%,
      rgba(255, 255, 255, 0.42) 49%,
      rgba(103, 232, 249, 0.18) 50.5%,
      rgba(255, 255, 255, 0.34) 52%,
      transparent 62%
    );
  opacity: 0.55;
  mix-blend-mode: soft-light;
  animation: aurora-shimmer-pass 14s ease-in-out infinite;
}

body.page-home .aurora-orb-four {
  display: block;
  width: 34vw;
  height: 34vw;
  right: 18vw;
  bottom: 8vh;
  background: radial-gradient(circle at 50% 50%, var(--aurora-violet) 0%, rgba(196, 181, 253, 0.12) 38%, transparent 72%);
  animation: aurora-drift-four 32s ease-in-out infinite alternate;
}

body.page-home .aurora-float {
  display: block;
  position: absolute;
  border-radius: 999px;
  background: rgba(109, 40, 217, 0.42);
  box-shadow: 0 0 18px rgba(109, 40, 217, 0.35);
  opacity: 0.55;
}

body.page-home .aurora-float-one {
  width: 7px;
  height: 7px;
  left: 18%;
  top: 28%;
  animation: aurora-float-rise 18s ease-in-out infinite;
}

body.page-home .aurora-float-two {
  width: 5px;
  height: 5px;
  left: 72%;
  top: 42%;
  animation: aurora-float-rise 22s ease-in-out infinite reverse;
  animation-delay: -6s;
}

body.page-home .aurora-float-three {
  width: 6px;
  height: 6px;
  left: 46%;
  top: 68%;
  animation: aurora-float-rise 20s ease-in-out infinite;
  animation-delay: -10s;
}

body.page-home .aurora-background {
  --aurora-blue: rgba(91, 108, 255, 0.42);
  --aurora-cyan: rgba(103, 232, 249, 0.32);
  --aurora-rose: rgba(255, 143, 163, 0.28);
  --aurora-violet: rgba(196, 181, 253, 0.34);
}

body.page-home .aurora-orb {
  opacity: 0.94;
}

body.page-home .aurora-wave {
  opacity: 0.76;
}

body.page-home .aurora-veil {
  animation: aurora-veil-breathe 20s ease-in-out infinite;
}

body.page-home .aurora-grid {
  opacity: 0.36;
  animation: aurora-grid-drift 48s linear infinite;
}

body.dark-mode.page-home .aurora-shimmer {
  background:
    linear-gradient(
      108deg,
      transparent 38%,
      rgba(255, 255, 255, 0.045) 49%,
      rgba(131, 181, 165, 0.04) 50.5%,
      rgba(214, 183, 128, 0.035) 52%,
      transparent 62%
    );
  opacity: 0.24;
}

body.dark-mode.page-home .aurora-orb {
  opacity: 0.36;
}

body.dark-mode.page-home .aurora-float {
  background: rgba(131, 181, 165, 0.2);
  box-shadow: 0 0 14px rgba(131, 181, 165, 0.12);
}

body.dark-mode .aurora-background {
  --aurora-blue: rgba(255, 255, 255, 0.025);
  --aurora-cyan: rgba(131, 181, 165, 0.03);
  --aurora-rose: rgba(214, 183, 128, 0.02);
  --aurora-violet: rgba(174, 181, 189, 0.024);
  --aurora-base: rgba(7, 8, 9, 0.98);
}

body.dark-mode .aurora-veil {
  background:
    radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.035), transparent 38%),
    radial-gradient(circle at 82% 18%, rgba(131, 181, 165, 0.018), transparent 28%),
    #070809;
  opacity: 1;
}

body.dark-mode .aurora-orb {
  opacity: 0.28;
}

body.dark-mode .aurora-wave {
  opacity: 0.12;
}

body.dark-mode .aurora-grid {
  opacity: 0.08;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
}

@keyframes aurora-drift-one {
  0% { transform: translate3d(-4%, -2%, 0) scale(1); }
  45% { transform: translate3d(7%, 4%, 0) scale(1.08); }
  100% { transform: translate3d(2%, 8%, 0) scale(1.02); }
}

@keyframes aurora-drift-two {
  0% { transform: translate3d(5%, -1%, 0) scale(1); }
  50% { transform: translate3d(-4%, 5%, 0) scale(1.06); }
  100% { transform: translate3d(8%, 10%, 0) scale(1.03); }
}

@keyframes aurora-drift-three {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(6%, -4%, 0) scale(1.07); }
  100% { transform: translate3d(-5%, 6%, 0) scale(1.02); }
}

@keyframes aurora-wave-one {
  0% { transform: translate3d(-8%, -2%, 0) rotate(-8deg) scale(1); }
  100% { transform: translate3d(10%, 4%, 0) rotate(-3deg) scale(1.06); }
}

@keyframes aurora-wave-two {
  0% { transform: translate3d(-6%, 3%, 0) rotate(14deg) scale(1); }
  100% { transform: translate3d(8%, -4%, 0) rotate(8deg) scale(1.05); }
}

@keyframes aurora-shimmer-pass {
  0%, 100% { transform: translate3d(-18%, -6%, 0) rotate(0deg); opacity: 0.2; }
  45% { opacity: 0.62; }
  50% { transform: translate3d(18%, 8%, 0) rotate(0deg); opacity: 0.55; }
}

@keyframes aurora-drift-four {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(-8%, -6%, 0) scale(1.08); }
  100% { transform: translate3d(6%, 4%, 0) scale(1.03); }
}

@keyframes aurora-float-rise {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.25; }
  25% { opacity: 0.72; }
  50% { transform: translate3d(12px, -28px, 0) scale(1.15); opacity: 0.55; }
  75% { opacity: 0.38; }
}

@keyframes aurora-veil-breathe {
  0%, 100% { opacity: 0.92; }
  50% { opacity: 1; }
}

@keyframes aurora-grid-drift {
  0% { background-position: 0 0, 0 0; }
  100% { background-position: 72px 48px, 48px 72px; }
}

@media (prefers-reduced-motion: reduce) {
  .aurora-orb,
  .aurora-wave,
  body.page-home .aurora-shimmer,
  body.page-home .aurora-grid,
  body.page-home .aurora-veil,
  body.page-home .aurora-float {
    animation: none !important;
  }
}

.aurora-background.is-paused .aurora-orb,
.aurora-background.is-paused .aurora-wave,
.aurora-background.is-paused .aurora-shimmer,
.aurora-background.is-paused .aurora-grid,
.aurora-background.is-paused .aurora-veil,
.aurora-background.is-paused .aurora-float {
  animation-play-state: paused;
}

@media (max-width: 768px) {
  .aurora-orb {
    filter: blur(48px) saturate(140%);
    opacity: 0.72;
  }

  .aurora-wave {
    filter: blur(56px) saturate(140%);
    opacity: 0.48;
  }
}

@media (prefers-reduced-motion: reduce) {
  .aurora-orb,
  .aurora-wave,
  .aurora-shimmer,
  .aurora-grid,
  .aurora-float {
    animation: none !important;
  }
}
</style>
