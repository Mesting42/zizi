<template>
  <div v-if="settings.showShinchan" class="player-shinchan-decor" aria-hidden="true">
    <span class="player-shinchan-scene player-shinchan-scene--left" :style="{ backgroundImage: `url('${activeDecor.left}')` }"></span>
    <span class="player-shinchan-scene player-shinchan-scene--right" :style="{ backgroundImage: `url('${activeDecor.right}')` }"></span>
    <span class="player-shinchan-radio">{{ activeDecor.label }}</span>
    <span class="player-shinchan-dot player-shinchan-dot--red"></span>
    <span class="player-shinchan-dot player-shinchan-dot--yellow"></span>
    <span class="player-shinchan-dot player-shinchan-dot--blue"></span>
    <span class="player-shinchan-crayon"></span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMusicBackground } from '../composables/useMusicBackground'

const { settings } = useMusicBackground()

const DECOR_BY_THEME = {
  'kasukabe-sky': { label: '春日部晴空', left: '/images/shinchan-playlists/cover-11.jpg', right: '/images/shinchan-playlists/cover-09.jpg' },
  'family-picnic': { label: '野原家野餐', left: '/images/shinchan-playlists/cover-03.jpg', right: '/images/shinchan-playlists/cover-06.jpg' },
  'sunset-road': { label: '放学晚霞', left: '/images/shinchan-playlists/cover-15.jpg', right: '/images/shinchan-playlists/cover-13.jpg' },
  'starry-radio': { label: '春日部夜电台', left: '/images/shinchan-playlists/cover-10.jpg', right: '/images/shinchan-playlists/cover-14.jpg' },
  'crayon-room': { label: '蜡笔涂鸦屋', left: '/images/shinchan-playlists/cover-07.jpg', right: '/images/shinchan-playlists/cover-11.jpg' },
  'rainy-day': { label: '小新雨天', left: '/images/shinchan-playlists/cover-01.jpg', right: '/images/shinchan-playlists/cover-05.jpg' },
  'midnight-cinema': { label: '春日部深夜影院', left: '/images/shinchan-playlists/cover-02.jpg', right: '/images/shinchan-playlists/cover-10.jpg' },
  'motion-walk': { label: '放学晴空', left: '/images/shinchan-playlists/cover-09.jpg', right: '/images/shinchan-playlists/cover-11.jpg' },
  'motion-rain': { label: '雷雨夜行', left: '/images/music-themes/motion-rain-scene.png', right: '/images/shinchan-playlists/cover-14.jpg' },
  'motion-parade': { label: '春日部庆典巡游', left: '/images/music-themes/motion-parade-scene.png', right: '/images/shinchan-playlists/cover-06.jpg' },
  'hello-kitty-garden': { label: 'SWEET BOW GARDEN', left: '/images/ip-themes/hello-kitty-main.png', right: '/images/ip-themes/hello-kitty-angel.png' },
  'hello-kitty-midnight': { label: 'RED VELVET MIDNIGHT', left: '/images/ip-themes/hello-kitty-main.png', right: '/images/ip-themes/hello-kitty-friends.png' },
  'hello-kitty-dream': { label: 'CLOUDY BOW DREAM', left: '/images/ip-themes/hello-kitty-angel.png', right: '/images/ip-themes/hello-kitty-main.png' },
  'hello-kitty-patisserie': { label: 'STRAWBERRY PATISSERIE', left: '/images/music-themes/kitty-strawberry-patisserie.png', right: '/images/ip-themes/hello-kitty-main.png' },
  'hello-kitty-ribbon-cinema': { label: 'RIBBON REEL CINEMA', left: '/images/music-themes/kitty-ribbon-cinema.png', right: '/images/ip-themes/hello-kitty-main.png' },
  'hello-kitty-sakura-breeze': { label: 'PETAL LETTERS', left: '/images/music-themes/kitty-sakura-letter.png', right: '/images/ip-themes/hello-kitty-angel.png' },
  'hello-kitty-candy-carousel': { label: 'MOONLIT CAROUSEL', left: '/images/music-themes/kitty-carousel-sunrise.png', right: '/images/ip-themes/hello-kitty-main.png' },
  'kuromi-neon': { label: 'KUROMI NEON ROOM', left: '/images/ip-themes/kuromi-main.png', right: '/images/ip-themes/kuromi-melody.png' },
  'kuromi-midnight': { label: 'MIDNIGHT STAGE', left: '/images/music-themes/kuromi-midnight-stage.png', right: '/images/ip-themes/kuromi-main.png' },
  'kuromi-night-flight': { label: 'MIDNIGHT FLIGHT', left: '/images/ip-themes/kuromi-melody.png', right: '/images/ip-themes/kuromi-main.png' },
  'kuromi-arcade-noir': { label: 'MOONLIT ARCADE', left: '/images/music-themes/kuromi-arcade-noir.png', right: '/images/ip-themes/kuromi-main.png' },
  'kuromi-violet-library': { label: 'VIOLET NIGHT LIBRARY', left: '/images/music-themes/kuromi-violet-library.png', right: '/images/ip-themes/kuromi-melody.png' },
  'kuromi-sticker-storm': { label: 'STICKER STORM', left: '/images/music-themes/kuromi-sticker-storm.png', right: '/images/ip-themes/kuromi-main.png' },
  'kuromi-vinyl-rush': { label: 'VINYL NIGHT RUSH', left: '/images/music-themes/kuromi-vinyl-night.png', right: '/images/ip-themes/kuromi-melody.png' }
}

const activeDecor = computed(() => DECOR_BY_THEME[settings.preset] || DECOR_BY_THEME['kasukabe-sky'])
</script>

<style scoped>
.player-shinchan-decor {
  position: absolute !important;
  inset: 3px 0 0 !important;
  z-index: 0 !important;
  overflow: hidden;
  pointer-events: none;
}

.player-shinchan-scene {
  position: absolute;
  top: 50%;
  display: block;
  width: 90px;
  height: 90px;
  border: 4px solid rgba(255, 255, 255, 0.56);
  border-radius: 50%;
  background-position: center;
  background-size: cover;
  filter: saturate(0.78);
  opacity: 0.09;
}

.player-shinchan-scene--left {
  left: clamp(170px, 18vw, 340px);
  transform: translateY(-47%) rotate(-7deg);
}

.player-shinchan-scene--right {
  right: clamp(170px, 17vw, 330px);
  transform: translateY(-46%) rotate(8deg);
}

.player-shinchan-radio {
  position: absolute;
  left: clamp(235px, 25vw, 480px);
  bottom: 7px;
  padding: 3px 8px;
  border: 1px dashed rgba(255, 99, 116, 0.24);
  border-radius: 999px;
  color: rgba(87, 96, 117, 0.32);
  background: rgba(255, 242, 190, 0.22);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.12em;
  transform: rotate(-2deg);
}

.player-shinchan-dot {
  position: absolute;
  display: block;
  border-radius: 50%;
  opacity: 0.2;
}

.player-shinchan-dot--red { right: 31%; top: 14px; width: 7px; height: 7px; background: #ff6173; }
.player-shinchan-dot--yellow { right: 29.6%; top: 27px; width: 10px; height: 10px; background: #f3c94b; }
.player-shinchan-dot--blue { left: 29%; top: 15px; width: 6px; height: 6px; background: #5bbde8; }

.player-shinchan-crayon {
  position: absolute;
  right: 24%;
  bottom: 8px;
  width: 46px;
  height: 5px;
  border-radius: 999px;
  background: repeating-linear-gradient(90deg, rgba(255, 97, 115, 0.24) 0 12px, transparent 12px 16px);
  transform: rotate(-5deg);
}

body:is(.dark-mode, .music-theme-dark) .player-shinchan-scene { opacity: 0.07; }
body:is(.dark-mode, .music-theme-dark) .player-shinchan-radio {
  color: rgba(238, 242, 255, 0.27);
  background: rgba(255, 226, 87, 0.08);
}

@media (max-width: 1100px) {
  .player-shinchan-scene--right,
  .player-shinchan-radio,
  .player-shinchan-crayon { display: none; }

  .player-shinchan-scene--left { left: 145px; opacity: 0.065; }
}

@media (max-width: 768px) {
  .player-shinchan-scene { display: none; }
  .player-shinchan-dot--red { right: 18%; }
  .player-shinchan-dot--yellow { right: 14%; }
  .player-shinchan-dot--blue { left: 37%; }
}
</style>
