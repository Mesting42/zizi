<template>
  <div class="mp-bg" :class="{ playing }" aria-hidden="true">
    <div class="mp-bg-snow">
      <span
        v-for="flake in snowflakes"
        :key="flake.id"
        class="mp-bg-snowflake"
        :class="`mp-bg-snowflake--layer-${flake.layer}`"
        :style="flake.style"
      >
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <path stroke-width="2.8" d="M50 6v88M50 50L14 26M50 50l36-24M50 50L14 74M50 50l36 24" />
            <path stroke-width="2" d="M50 18l-10 6 4 8 6-14M50 18l10 6-4 8-6-14M50 82l-10-6 4-8 6 14M50 82l10-6-4-8-6 14" />
            <path stroke-width="2" d="M24 34l-8-5 5-5 3 10M24 34l-2 10 10-5M76 34l8-5-5-5-3 10M76 34l2 10-10-5M24 66l-8 5 5 5 3-10M24 66l-2-10 10 5M76 66l8 5-5 5-3-10M76 66l2-10-10 5" />
            <circle cx="50" cy="50" r="2.2" fill="currentColor" stroke="none" />
          </g>
        </svg>
      </span>
    </div>
    <div v-if="settings.showShinchan" class="mp-bg-shinchan-world">
      <span class="mp-bg-shinchan-card mp-bg-shinchan-card--family"></span>
      <span class="mp-bg-shinchan-card mp-bg-shinchan-card--friends"></span>
      <span class="mp-bg-shinchan-card mp-bg-shinchan-card--winter"></span>
      <span class="mp-bg-shinchan-bubble mp-bg-shinchan-bubble--left">野原家音乐时间 ♪</span>
      <span class="mp-bg-shinchan-bubble mp-bg-shinchan-bubble--right">小白也在听</span>
      <span class="mp-bg-shinchan-stamp">KASUKABE<br />RADIO</span>
      <span class="mp-bg-crayon mp-bg-crayon--red"></span>
      <span class="mp-bg-crayon mp-bg-crayon--yellow"></span>
      <span class="mp-bg-crayon mp-bg-crayon--blue"></span>
    </div>
    <div class="mp-bg-vignette"></div>
  </div>
</template>

<script setup>
import { useMusicBackground } from '../composables/useMusicBackground'

defineProps({
  playing: { type: Boolean, default: false }
})

const { settings } = useMusicBackground()

const snowflakes = Array.from({ length: 132 }, (_, index) => {
  const layer = index % 3
  const left = ((index * 53.7 + (index % 17) * 23.1 + layer * 11.3) % 97) + 1.5
  const size = layer === 0
    ? 11 + (index % 5) * 2
    : layer === 1
      ? 16 + (index % 6) * 3
      : 22 + (index % 5) * 4
  const duration = layer === 0
    ? 16 + (index % 8) * 2.2
    : layer === 1
      ? 11 + (index % 7) * 1.6
      : 8 + (index % 6) * 1.4
  const delay = -(((index * 1.47 + (index % 19) * 0.83 + layer * 2.1) % 22))
  const drift = -60 + ((index * 17 + layer * 9) % 32) * 4
  const spin = index % 2 === 0 ? 140 : -140
  const opacity = layer === 0
    ? 0.28 + (index % 4) * 0.07
    : layer === 1
      ? 0.46 + (index % 4) * 0.09
      : 0.58 + (index % 3) * 0.1
  const startY = -8 - ((index * 9.7 + layer * 14) % 120)

  return {
    id: index,
    layer,
    style: {
      left: `${left}%`,
      width: `${size}px`,
      height: `${size}px`,
      opacity,
      top: `${startY}vh`,
      animationDuration: `${duration}s`,
      animationDelay: `${delay}s`,
      '--snow-drift': `${drift}px`,
      '--snow-spin': `${spin}deg`
    }
  }
})
</script>

<style scoped>
.mp-bg {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.mp-bg-snow {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.mp-bg-shinchan-world {
  position: absolute;
  inset: 0;
}

.mp-bg-shinchan-card {
  position: absolute;
  display: block;
  overflow: hidden;
  border: 6px solid rgba(255, 255, 255, 0.58);
  background-position: center;
  background-size: cover;
  box-shadow: 0 18px 48px rgba(39, 57, 85, 0.12);
  opacity: 0.11;
}

.mp-bg-shinchan-card--family {
  left: -45px;
  bottom: 14%;
  width: clamp(130px, 13vw, 210px);
  aspect-ratio: 1.2;
  border-radius: 32px;
  background-image: url('/images/shinchan-playlists/cover-02.jpg');
  transform: rotate(7deg);
}

.mp-bg-shinchan-card--friends {
  top: 15%;
  right: -36px;
  width: clamp(120px, 12vw, 190px);
  aspect-ratio: 1;
  border-radius: 50%;
  background-image: url('/images/shinchan-playlists/cover-06.jpg');
  transform: rotate(-8deg);
  opacity: 0.09;
}

.mp-bg-shinchan-card--winter {
  right: 15%;
  bottom: 10%;
  width: clamp(100px, 9vw, 150px);
  aspect-ratio: 1.35;
  border-radius: 24px;
  background-image: url('/images/shinchan-playlists/cover-14.jpg');
  transform: rotate(5deg);
  opacity: 0.075;
}

.mp-bg-shinchan-bubble {
  position: absolute;
  padding: 0.48rem 0.76rem;
  border: 1px solid rgba(90, 139, 177, 0.12);
  color: rgba(57, 84, 112, 0.32);
  background: rgba(255, 255, 255, 0.42);
  box-shadow: 0 10px 30px rgba(50, 77, 104, 0.08);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.mp-bg-shinchan-bubble--left {
  top: 23%;
  left: 6%;
  border-radius: 18px 18px 18px 5px;
  transform: rotate(-3deg);
}

.mp-bg-shinchan-bubble--right {
  right: 8%;
  bottom: 30%;
  border-radius: 18px 18px 5px 18px;
  transform: rotate(3deg);
}

.mp-bg-shinchan-stamp {
  position: absolute;
  top: 10%;
  left: 23%;
  padding: 0.72rem;
  border: 2px dashed rgba(64, 130, 177, 0.18);
  border-radius: 50%;
  color: rgba(64, 130, 177, 0.24);
  font-size: 0.58rem;
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: 0.12em;
  text-align: center;
  transform: rotate(-10deg);
}

.mp-bg-crayon {
  position: absolute;
  width: 6px;
  height: 38px;
  border-radius: 4px;
  opacity: 0.16;
}

.mp-bg-crayon--red { top: 36%; right: 5%; background: #f06c7b; transform: rotate(22deg); }
.mp-bg-crayon--yellow { bottom: 18%; left: 28%; background: #e8c34b; transform: rotate(-14deg); }
.mp-bg-crayon--blue { top: 18%; left: 43%; background: #57abd8; transform: rotate(11deg); }

.mp-bg-snowflake {
  position: absolute;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(58, 132, 188, 0.9);
  filter:
    drop-shadow(0 0 2px rgba(255, 255, 255, 0.95))
    drop-shadow(0 0 6px rgba(58, 132, 188, 0.42));
  animation: mp-snow-fall linear infinite;
  will-change: transform;
}

.mp-bg-snowflake--layer-0 {
  filter: blur(0.4px) drop-shadow(0 0 3px rgba(58, 132, 188, 0.22));
}

.mp-bg-snowflake--layer-2 {
  filter:
    drop-shadow(0 0 2px rgba(255, 255, 255, 0.98))
    drop-shadow(0 0 8px rgba(58, 132, 188, 0.48));
}

:global(.music-player-page:not(.dark-theme)) .mp-bg-snowflake {
  color: rgba(46, 118, 178, 0.92);
  filter:
    drop-shadow(0 0 2px rgba(255, 255, 255, 1))
    drop-shadow(0 1px 4px rgba(46, 118, 178, 0.38))
    drop-shadow(0 0 10px rgba(72, 148, 210, 0.28));
}

:global(.music-player-page:not(.dark-theme)) .mp-bg-snowflake--layer-0 {
  filter: blur(0.4px) drop-shadow(0 0 3px rgba(46, 118, 178, 0.2));
}

:global(.music-player-page:not(.dark-theme)) .mp-bg-snowflake--layer-2 {
  filter:
    drop-shadow(0 0 2px rgba(255, 255, 255, 1))
    drop-shadow(0 1px 5px rgba(46, 118, 178, 0.42))
    drop-shadow(0 0 12px rgba(72, 148, 210, 0.32));
}

.mp-bg-snowflake svg {
  width: 100%;
  height: 100%;
  display: block;
}

.mp-bg.playing .mp-bg-snowflake {
  animation-name: mp-snow-fall-fast;
}

.mp-bg-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 50% 42%, transparent 0%, rgba(0, 0, 0, 0.03) 72%),
    linear-gradient(180deg, rgba(0, 0, 0, 0.04) 0%, transparent 12%, transparent 88%, rgba(0, 0, 0, 0.05) 100%);
}

:global(.music-player-page:not(.dark-theme)) .mp-bg-vignette {
  background:
    radial-gradient(circle at 50% 42%, rgba(120, 180, 230, 0.05) 0%, transparent 50%),
    linear-gradient(180deg, rgba(58, 132, 188, 0.03) 0%, transparent 14%, transparent 86%, rgba(58, 132, 188, 0.04) 100%);
}

:global(.music-player-page.dark-theme) .mp-bg-snowflake {
  color: rgba(248, 252, 255, 0.88);
  filter: drop-shadow(0 0 8px rgba(215, 232, 255, 0.36));
}

:global(.music-player-page.dark-theme) .mp-bg-snowflake--layer-0 {
  filter: blur(0.5px) drop-shadow(0 0 4px rgba(215, 232, 255, 0.18));
}

:global(.music-player-page.dark-theme) .mp-bg-snowflake--layer-2 {
  filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.5)) drop-shadow(0 0 10px rgba(215, 232, 255, 0.42));
}

:global(.music-player-page.dark-theme) .mp-bg-vignette {
  background:
    radial-gradient(circle at 50% 40%, rgba(130, 180, 230, 0.04) 0%, transparent 54%),
    linear-gradient(180deg, rgba(0, 0, 0, 0.08) 0%, transparent 10%, transparent 90%, rgba(0, 0, 0, 0.1) 100%);
}

:global(.music-player-page.dark-theme) .mp-bg-shinchan-card { opacity: 0.065; }
:global(.music-player-page.dark-theme) .mp-bg-shinchan-bubble {
  color: rgba(235, 242, 255, 0.32);
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(16, 25, 45, 0.24);
}
:global(.music-player-page.dark-theme) .mp-bg-shinchan-stamp {
  color: rgba(206, 227, 247, 0.28);
  border-color: rgba(206, 227, 247, 0.18);
}

@keyframes mp-snow-fall {
  0% {
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
  100% {
    transform: translate3d(var(--snow-drift), 125vh, 0) rotate(var(--snow-spin));
  }
}

@keyframes mp-snow-fall-fast {
  0% {
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
  100% {
    transform: translate3d(calc(var(--snow-drift) * 1.12), 125vh, 0) rotate(var(--snow-spin));
  }
}

@media (prefers-reduced-motion: reduce) {
  .mp-bg-snowflake {
    animation: none !important;
    display: none;
  }
}

@media (max-width: 768px) {
  .mp-bg-shinchan-card--friends,
  .mp-bg-shinchan-card--winter,
  .mp-bg-shinchan-bubble--left,
  .mp-bg-shinchan-stamp,
  .mp-bg-crayon--yellow,
  .mp-bg-crayon--blue { display: none; }

  .mp-bg-shinchan-card--family { opacity: 0.07; }
  .mp-bg-shinchan-bubble--right { right: 14px; bottom: 22%; }
}
</style>
