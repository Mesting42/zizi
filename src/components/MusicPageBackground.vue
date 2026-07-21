<template>
  <div
    class="music-page-bg"
    :class="[
      `preset-${settings.preset || 'kasukabe-sky'}`,
      `ip-${activeIp}`,
      {
        playing,
        climbing,
        'music-page-bg--lyrics': variant === 'lyrics',
        'has-custom-media': settings.mode === 'custom' && mediaUrl,
        'lean-rendering': useLeanRendering,
        'classic-theme': isClassicTheme,
        'classic-theme--sunny': isClassicTheme && classicAppearance === 'sunny',
        'classic-theme--dark': isClassicTheme && classicAppearance === 'dark'
      }
    ]"
    aria-hidden="true"
    >
    <div v-if="settings.mode === 'custom' && mediaUrl" class="mpb-custom-media" :style="customMediaStyle">
      <img
        v-if="settings.mediaKind === 'image'"
        :src="mediaUrl"
        alt=""
        decoding="async"
      />
      <video
        v-else-if="settings.mediaKind === 'video'"
        :key="mediaUrl"
        :src="mediaUrl"
        autoplay
        muted
        loop
        playsinline
        preload="auto"
        @canplay="ensureCustomVideoPlayback"
      ></video>
      <div class="mpb-custom-shade"></div>
    </div>

    <div class="mpb-theme-wash"></div>
    <div
      v-if="showIpDecorations"
      class="mpb-mobile-scene"
      :class="`mpb-mobile-scene--${activeMobileComposition.kind}`"
      :style="mobileSceneStyle"
    >
      <span class="mpb-mobile-scene-atmosphere"></span>
      <span class="mpb-mobile-scene-subject"></span>
    </div>
    <div v-if="showIpDecorations" class="mpb-theme-scene" :style="{ backgroundImage: `url('${activeTheme.hero}')` }">
      <span class="mpb-theme-scene-copy">
        <strong>{{ activeTheme.label }}</strong>
        <small>{{ activeTheme.tagline }}</small>
      </span>
    </div>

    <div
      v-if="showIpDecorations && activeTheme.motion"
      class="mpb-mobile-motion"
      :class="`mpb-mobile-motion--${activeTheme.motion}`"
    >
      <i v-for="index in 3" :key="`mobile-motion-${activeTheme.motion}-${index}`"></i>
    </div>

    <div v-if="showIpDecorations && activeTheme.motion && !useLeanRendering" class="mpb-motion-layer">
      <div v-if="activeTheme.motion === 'walk'" class="mpb-motion-sky" aria-hidden="true">
        <i v-for="cloud in motionSkyClouds" :key="cloud.id" :style="cloud.style"></i>
      </div>

      <div v-if="activeTheme.motion === 'walk'" class="mpb-walk-sun" aria-hidden="true"><i></i></div>

      <div v-if="activeTheme.motion === 'walk'" class="mpb-walk-birds" aria-hidden="true">
        <i v-for="bird in motionBirds" :key="bird.id" :style="bird.style"></i>
      </div>

      <div v-if="activeTheme.motion === 'walk'" class="mpb-walk-paper-planes" aria-hidden="true">
        <i v-for="plane in motionPaperPlanes" :key="plane.id" :style="plane.style"></i>
      </div>

      <div v-if="activeTheme.motion === 'walk'" class="mpb-motion-leaves" aria-hidden="true">
        <i v-for="leaf in motionLeaves" :key="leaf.id" :style="leaf.style"></i>
      </div>

      <div v-if="activeTheme.motion === 'walk'" class="mpb-motion-breeze" aria-hidden="true">
        <i v-for="line in motionBreezeLines" :key="line.id" :style="line.style"></i>
      </div>

      <div v-if="activeTheme.motion === 'rain'" class="mpb-motion-storm-glow" aria-hidden="true"></div>
      <div v-if="activeTheme.motion === 'rain'" class="mpb-rain-cloudbank" aria-hidden="true">
        <i v-for="cloud in motionStormClouds" :key="cloud.id" :style="cloud.style"></i>
      </div>
      <div v-if="activeTheme.motion === 'rain'" class="mpb-motion-mist" aria-hidden="true"></div>
      <div v-if="activeTheme.motion === 'rain'" class="mpb-rain-lightning" aria-hidden="true"><i></i><i></i><i></i></div>
      <div v-if="activeTheme.motion === 'rain'" class="mpb-rain-streetlights" aria-hidden="true">
        <i v-for="lamp in motionStreetlights" :key="lamp.id" :style="lamp.style"></i>
      </div>

      <div v-if="activeTheme.motion === 'walk'" class="mpb-motion-companions mpb-motion-companions--walk" aria-hidden="true">
        <span
          v-for="(cover, index) in activeTheme.cards.slice(0, 3)"
          :key="`companion-${activeTheme.motion}-${cover}`"
          class="mpb-motion-companion"
          :style="{ backgroundImage: `url('${cover}')`, '--companion-index': index }"
        ></span>
      </div>

      <div
        v-if="activeTheme.motion === 'walk' || activeTheme.motion === 'rain'"
        class="mpb-motion-walker-track"
        :class="`mpb-motion-walker-track--${activeTheme.motion}`"
      >
        <span class="mpb-motion-walker">
          <img class="mpb-motion-walker-frame mpb-motion-walker-frame--stride" :src="motionCharacterFrames[0]" alt="" />
          <img class="mpb-motion-walker-frame mpb-motion-walker-frame--pass" :src="motionCharacterFrames[1]" alt="" />
          <span class="mpb-motion-character-blink" aria-hidden="true"><i></i><i></i></span>
        </span>
        <span v-if="activeTheme.motion === 'walk'" class="mpb-motion-dust" aria-hidden="true"><i></i><i></i><i></i></span>
        <span v-if="activeTheme.motion === 'rain'" class="mpb-motion-splash" aria-hidden="true"><i></i><i></i><i></i></span>
      </div>

      <div v-if="activeTheme.motion === 'rain'" class="mpb-motion-rain" aria-hidden="true">
        <i v-for="drop in motionRainDrops" :key="drop.id" :style="drop.style"></i>
      </div>

      <div v-if="activeTheme.motion === 'rain'" class="mpb-motion-ripples" aria-hidden="true">
        <i v-for="ripple in motionRipples" :key="ripple.id" :style="ripple.style"></i>
      </div>

      <div v-if="activeTheme.motion === 'parade'" class="mpb-motion-parade" aria-hidden="true">
        <span
          v-for="(cover, index) in activeTheme.cards"
          :key="`motion-${cover}`"
          class="mpb-motion-parade-card"
          :style="{ backgroundImage: `url('${cover}')`, '--motion-card-index': index }"
        ></span>
      </div>

      <div v-if="activeTheme.motion === 'parade'" class="mpb-parade-spotlights" aria-hidden="true"><i></i><i></i><i></i></div>

      <div v-if="activeTheme.motion === 'parade'" class="mpb-parade-lanterns" aria-hidden="true">
        <i v-for="lantern in motionLanterns" :key="lantern.id" :style="lantern.style"><b></b></i>
      </div>

      <div v-if="activeTheme.motion === 'parade'" class="mpb-parade-balloons" aria-hidden="true">
        <i v-for="balloon in motionBalloons" :key="balloon.id" :style="balloon.style"></i>
      </div>

      <div v-if="activeTheme.motion === 'parade'" class="mpb-motion-confetti" aria-hidden="true">
        <i v-for="piece in motionConfetti" :key="piece.id" :style="piece.style"></i>
      </div>

      <div v-if="activeTheme.motion === 'kitty-dream'" class="mpb-kitty-dream-motion" aria-hidden="true">
        <span v-for="item in ipMotionItems" :key="`kitty-${item.id}`" :style="item.style">{{ item.id % 3 === 0 ? '♡' : item.id % 3 === 1 ? '✦' : '🎀' }}</span>
        <i class="mpb-kitty-cloud mpb-kitty-cloud--one"></i>
        <i class="mpb-kitty-cloud mpb-kitty-cloud--two"></i>
        <span class="mpb-kitty-flyer" :style="{ backgroundImage: `url('${activeTheme.hero}')` }"></span>
      </div>

      <div v-if="activeTheme.motion === 'kuromi-flight'" class="mpb-kuromi-flight-motion" aria-hidden="true">
        <span class="mpb-kuromi-moon"></span>
        <i v-for="item in ipMotionItems" :key="`kuromi-${item.id}`" :style="item.style">{{ item.id % 2 ? '★' : '✦' }}</i>
        <span class="mpb-kuromi-comet" :style="{ backgroundImage: `url('${activeTheme.hero}')` }"></span>
        <b class="mpb-kuromi-trail"></b>
      </div>

      <div v-if="activeTheme.motion === 'kitty-sakura'" class="mpb-kitty-sakura-motion" aria-hidden="true">
        <i v-for="item in ipMotionItems" :key="`sakura-${item.id}`" :style="item.style"></i>
        <span class="mpb-kitty-letter mpb-kitty-letter--one"></span>
        <span class="mpb-kitty-letter mpb-kitty-letter--two"></span>
        <b class="mpb-kitty-sakura-ribbon"></b>
      </div>

      <div v-if="activeTheme.motion === 'kitty-carousel'" class="mpb-kitty-carousel-motion" aria-hidden="true">
        <i v-for="item in ipMotionItems" :key="`carousel-${item.id}`" :style="item.style"></i>
        <span class="mpb-kitty-carousel-wheel"><b></b><b></b><b></b><b></b></span>
        <span class="mpb-kitty-carousel-light mpb-kitty-carousel-light--one"></span>
        <span class="mpb-kitty-carousel-light mpb-kitty-carousel-light--two"></span>
      </div>

      <div v-if="activeTheme.motion === 'kuromi-stickers'" class="mpb-kuromi-sticker-motion" aria-hidden="true">
        <i v-for="item in ipMotionItems" :key="`sticker-${item.id}`" :style="item.style">{{ item.id % 3 === 0 ? '✦' : item.id % 3 === 1 ? '♥' : '⚡' }}</i>
        <span class="mpb-kuromi-sticker-card mpb-kuromi-sticker-card--one"></span>
        <span class="mpb-kuromi-sticker-card mpb-kuromi-sticker-card--two"></span>
      </div>

      <div v-if="activeTheme.motion === 'kuromi-vinyl'" class="mpb-kuromi-vinyl-motion" aria-hidden="true">
        <i v-for="item in ipMotionItems" :key="`vinyl-${item.id}`" :style="item.style"></i>
        <span class="mpb-kuromi-vinyl-disc mpb-kuromi-vinyl-disc--one"></span>
        <span class="mpb-kuromi-vinyl-disc mpb-kuromi-vinyl-disc--two"></span>
        <b class="mpb-kuromi-speed-line mpb-kuromi-speed-line--one"></b>
        <b class="mpb-kuromi-speed-line mpb-kuromi-speed-line--two"></b>
      </div>
    </div>

    <template v-if="!useLeanRendering">
      <div class="mpb-orb mpb-orb--1"></div>
      <div class="mpb-orb mpb-orb--2"></div>
      <div class="mpb-orb mpb-orb--3"></div>
      <div class="mpb-orb mpb-orb--4"></div>
    </template>

    <div v-if="!useLeanRendering" class="mpb-notes">
      <span
        v-for="note in notes"
        :key="note.id"
        class="mpb-note"
        :style="note.style"
      >{{ note.symbol }}</span>
    </div>

    <div v-if="!useLeanRendering" class="mpb-sparkles">
      <span
        v-for="spark in sparkles"
        :key="spark.id"
        class="mpb-spark"
        :style="spark.style"
      ></span>
    </div>

    <div v-if="showIpDecorations && activeIp === 'shinchan' && !useLeanRendering" class="mpb-shinchan-elements">
      <div
        v-if="!activeTheme.motion"
        class="mpb-shinchan-signature"
        :class="`mpb-shinchan-signature--${settings.preset}`"
      >
        <template v-if="settings.preset === 'kasukabe-sky'">
          <span class="mpb-sky-sun"></span>
          <span class="mpb-sky-rainbow"></span>
          <span class="mpb-sky-cloud mpb-sky-cloud--one"></span>
          <span class="mpb-sky-cloud mpb-sky-cloud--two"></span>
          <span class="mpb-sky-kite"></span>
          <span class="mpb-signature-caption">KASUKABE SKY · SUNNY DAY</span>
        </template>

        <template v-else-if="settings.preset === 'family-picnic'">
          <span class="mpb-picnic-blanket"></span>
          <span class="mpb-picnic-basket"><i></i></span>
          <span class="mpb-picnic-plate"></span>
          <span class="mpb-picnic-flower mpb-picnic-flower--one"></span>
          <span class="mpb-picnic-flower mpb-picnic-flower--two"></span>
          <span class="mpb-picnic-flower mpb-picnic-flower--three"></span>
          <span class="mpb-signature-caption">NOHARA FAMILY · WEEKEND PICNIC</span>
        </template>

        <template v-else-if="settings.preset === 'sunset-road'">
          <span class="mpb-sunset-sun"></span>
          <span class="mpb-sunset-cloud mpb-sunset-cloud--one"></span>
          <span class="mpb-sunset-cloud mpb-sunset-cloud--two"></span>
          <span class="mpb-sunset-campus"><i></i><b></b></span>
          <span class="mpb-sunset-fence"></span>
          <span class="mpb-sunset-birds"><i></i><i></i><i></i></span>
          <span class="mpb-sunset-leaves"><i></i><i></i><i></i><i></i><i></i></span>
          <span class="mpb-sunset-wire mpb-sunset-wire--one"></span>
          <span class="mpb-sunset-wire mpb-sunset-wire--two"></span>
          <span class="mpb-signature-caption">AFTER SCHOOL · GOLDEN HOUR</span>
        </template>

        <template v-else-if="settings.preset === 'starry-radio'">
          <span class="mpb-radio-moon"></span>
          <span class="mpb-radio-tower"><i></i><b></b></span>
          <span class="mpb-radio-wave mpb-radio-wave--one"></span>
          <span class="mpb-radio-wave mpb-radio-wave--two"></span>
          <span class="mpb-radio-frequency">FM 93.5</span>
          <span class="mpb-radio-constellation"><i></i><i></i><i></i><i></i></span>
          <span class="mpb-signature-caption">KASUKABE NIGHT RADIO · ON AIR</span>
        </template>

        <template v-else-if="settings.preset === 'crayon-room'">
          <span class="mpb-doodle-paper">
            <i class="mpb-doodle-tape"></i>
            <i class="mpb-doodle-house"></i>
            <i class="mpb-doodle-flower"></i>
            <i class="mpb-doodle-sun"></i>
            <i class="mpb-doodle-spiral"></i>
            <b>OH! しんちゃん</b>
          </span>
          <span class="mpb-doodle-floor"></span>
          <span class="mpb-doodle-crayon mpb-doodle-crayon--red"></span>
          <span class="mpb-doodle-crayon mpb-doodle-crayon--blue"></span>
          <span class="mpb-doodle-crayon mpb-doodle-crayon--yellow"></span>
          <span class="mpb-signature-caption">CRAYON SKETCH ROOM · DRAW YOUR SONG</span>
        </template>

        <template v-else-if="settings.preset === 'rainy-day'">
          <span class="mpb-rain-window"><i></i><b></b></span>
          <span class="mpb-rain-umbrella"><i></i></span>
          <span class="mpb-rain-puddle"></span>
          <span class="mpb-rain-drop mpb-rain-drop--one"></span>
          <span class="mpb-rain-drop mpb-rain-drop--two"></span>
          <span class="mpb-rain-drop mpb-rain-drop--three"></span>
          <span class="mpb-rain-drop mpb-rain-drop--four"></span>
          <span class="mpb-rain-drop mpb-rain-drop--five"></span>
          <span class="mpb-signature-caption">KASUKABE RAIN · WINDOW SIDE MIX</span>
        </template>

        <template v-else-if="settings.preset === 'midnight-cinema'">
          <span class="mpb-cinema-projector"><i></i><b></b></span>
          <span class="mpb-cinema-beam"></span>
          <span class="mpb-cinema-film"><i></i></span>
          <span class="mpb-cinema-marquee">MIDNIGHT<br />CINEMA</span>
          <span class="mpb-signature-caption">KASUKABE LATE SHOW · NOW SCREENING</span>
        </template>
      </div>

      <div class="mpb-shinchan-bubble">♪ 春日部电台</div>
      <div class="mpb-shinchan-bubble mpb-shinchan-bubble--family">野原家正在播放</div>
      <div class="mpb-shinchan-bubble mpb-shinchan-bubble--shiro">小白也在听 ♪</div>
      <div
        v-for="(cover, index) in activeTheme.cards"
        :key="`${settings.preset}-${cover}`"
        class="mpb-shinchan-postcard"
        :class="`mpb-shinchan-postcard--${index + 1}`"
        :style="{ backgroundImage: `url('${cover}')` }"
      ></div>
      <span class="mpb-kasukabe-stamp">KASUKABE<br />DEFENCE<br />FORCE</span>
      <span class="mpb-comic-burst">わくわく!</span>
      <span class="mpb-crayon mpb-crayon--red"></span>
      <span class="mpb-crayon mpb-crayon--yellow"></span>
      <span class="mpb-crayon mpb-crayon--blue"></span>

      <div class="mpb-listening-corner">
        <span class="mpb-corner-orbit"></span>
        <div class="mpb-corner-note">
          <small>KASUKABE FM · 93.5</small>
          <strong>{{ activeTheme.label }}</strong>
          <em>{{ playing ? 'ON AIR' : 'READY' }}</em>
        </div>

        <div class="mpb-corner-gallery">
          <span
            v-for="(cover, index) in activeTheme.cards.slice(0, 2)"
            :key="`corner-${settings.preset}-${cover}`"
            class="mpb-corner-photo"
            :style="{ backgroundImage: `url('${cover}')` }"
          >
            <i>0{{ index + 1 }}</i>
          </span>
        </div>

        <div class="mpb-corner-radio">
          <span class="mpb-corner-radio-antenna"></span>
          <span class="mpb-corner-radio-display">{{ playing ? 'PLAY' : 'FM' }}</span>
          <span class="mpb-corner-radio-speaker"></span>
          <i class="mpb-corner-radio-knob"></i>
          <b class="mpb-corner-radio-light"></b>
        </div>

        <div class="mpb-corner-equalizer">
          <i v-for="bar in 7" :key="bar"></i>
        </div>
        <p>{{ activeTheme.tagline }}</p>
        <span class="mpb-corner-scribble"></span>
      </div>
    </div>

    <div v-if="showIpDecorations && activeIp === 'hello-kitty' && !useLeanRendering" class="mpb-ip-elements mpb-ip-elements--hello-kitty">
      <div class="mpb-kitty-signature" :class="`mpb-kitty-signature--${settings.preset}`">
        <template v-if="settings.preset === 'hello-kitty-garden'">
          <span class="mpb-kitty-garden-arch"><i></i><b></b></span>
          <span class="mpb-kitty-flower-bed"><i></i><i></i><i></i><i></i><i></i></span>
          <span class="mpb-kitty-tea-table"><i></i><b></b></span>
          <img class="mpb-kitty-scene-character mpb-kitty-scene-character--garden" src="/images/ip-themes/hello-kitty-main.png" alt="" />
          <span class="mpb-kitty-scene-label">STRAWBERRY GARDEN · AFTERNOON TEA</span>
        </template>

        <template v-else-if="settings.preset === 'hello-kitty-midnight'">
          <span class="mpb-kitty-ballroom-panels"><i></i><b></b></span>
          <span class="mpb-kitty-chandelier"><i></i><i></i><i></i></span>
          <span class="mpb-kitty-banquet-table"><i></i><b></b></span>
          <span class="mpb-kitty-lounge-sofa"><i></i><b></b></span>
          <span class="mpb-kitty-midnight-monogram">HK</span>
          <span class="mpb-kitty-scene-label">RED VELVET MIDNIGHT · DESSERT SOIRÉE</span>
        </template>

        <template v-else-if="settings.preset === 'hello-kitty-dream'">
          <span class="mpb-kitty-dream-moon"></span>
          <span class="mpb-kitty-cloud-stair"><i></i><i></i><i></i></span>
          <span class="mpb-kitty-dream-stars"><i></i><i></i><i></i><i></i><i></i></span>
          <span class="mpb-kitty-dream-ribbon"></span>
          <span class="mpb-kitty-scene-label">CLOUDY BOW DREAM · FLY WITH THE MELODY</span>
        </template>

        <template v-else-if="settings.preset === 'hello-kitty-patisserie'">
          <span class="mpb-kitty-shop-awning"></span>
          <span class="mpb-kitty-pastry-counter"><i></i><b></b></span>
          <span class="mpb-kitty-cake-stand"><i></i><b></b></span>
          <span class="mpb-kitty-dessert-shelf"><i></i><i></i><i></i><i></i></span>
          <span class="mpb-kitty-macaron-stack"><i></i><i></i><i></i><i></i><i></i></span>
          <span class="mpb-kitty-menu-board">CAKE<br />TEA<br />TAPES</span>
          <img class="mpb-kitty-scene-character mpb-kitty-scene-character--patisserie" src="/images/ip-themes/hello-kitty-main.png" alt="" />
          <span class="mpb-kitty-scene-label">STRAWBERRY PATISSERIE · FRESH TODAY</span>
        </template>

        <template v-else-if="settings.preset === 'hello-kitty-ribbon-cinema'">
          <span class="mpb-kitty-cinema-curtain mpb-kitty-cinema-curtain--left"></span>
          <span class="mpb-kitty-cinema-curtain mpb-kitty-cinema-curtain--right"></span>
          <span class="mpb-kitty-cinema-marquee">RIBBON REEL<br /><b>NOW SHOWING</b></span>
          <span class="mpb-kitty-cinema-film"><i></i></span>
          <span class="mpb-kitty-popcorn"><i></i></span>
          <span class="mpb-kitty-scene-label">RIBBON CINEMA · A SOFT LITTLE PREMIERE</span>
        </template>

        <template v-else-if="settings.preset === 'hello-kitty-sakura-breeze'">
          <span class="mpb-kitty-sakura-branch"><i></i><i></i><i></i><i></i></span>
          <span class="mpb-kitty-writing-desk"><i></i><b></b></span>
          <span class="mpb-kitty-ink-bottle"></span>
          <img class="mpb-kitty-scene-character mpb-kitty-scene-character--sakura" src="/images/ip-themes/hello-kitty-angel.png" alt="" />
          <span class="mpb-kitty-scene-label">PETAL LETTERS · A SONG FOR SPRING</span>
        </template>

        <template v-else-if="settings.preset === 'hello-kitty-candy-carousel'">
          <span class="mpb-kitty-fairground-canopy"></span>
          <span class="mpb-kitty-carousel-stage"><i></i><b></b></span>
          <span class="mpb-kitty-fairground-lights"><i></i><i></i><i></i><i></i><i></i><i></i></span>
          <span class="mpb-kitty-ticket-booth">BOW<br />TICKET</span>
          <span class="mpb-kitty-scene-label">MOONLIT CAROUSEL · ONE MORE ROUND</span>
        </template>
      </div>
    </div>

    <div v-else-if="showIpDecorations && activeIp === 'kuromi' && !useLeanRendering" class="mpb-ip-elements mpb-ip-elements--kuromi">
      <div class="mpb-kuromi-zine">
        <span>MISCHIEF ZINE / 009</span>
        <strong>{{ activeTheme.label }}</strong>
        <small>{{ playing ? 'LOUD · CUTE · ON AIR' : 'BLACKBERRY PUNK RADIO' }}</small>
      </div>
      <img class="mpb-ip-character mpb-ip-character--kuromi" src="/images/ip-themes/kuromi-main.png" alt="" />
      <img class="mpb-ip-character mpb-ip-character--kuromi-mini" src="/images/ip-themes/kuromi-melody.png" alt="" />
      <span class="mpb-kuromi-checker"></span>
      <span class="mpb-kuromi-chain"><i></i><i></i><i></i><i></i><i></i></span>
      <span class="mpb-kuromi-tape">NO RULES / JUST RHYTHM</span>
      <span class="mpb-kuromi-bolt mpb-kuromi-bolt--one">ϟ</span>
      <span class="mpb-kuromi-bolt mpb-kuromi-bolt--two">✦</span>
    </div>

    <div class="mpb-vignette"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMusicBackground } from '../composables/useMusicBackground'
import { getMusicIp, getMusicThemeIp, getMusicThemeMobileComposition } from '../config/musicThemeCatalog'
import { devicePerformanceProfile } from '../utils/devicePerformance'

defineProps({
  playing: { type: Boolean, default: false },
  climbing: { type: Boolean, default: false },
  variant: { type: String, default: 'page' }
})

const { settings, mediaUrl, customMediaStyle } = useMusicBackground()
const useLeanRendering = devicePerformanceProfile.isMobilePerformance
const isClassicTheme = computed(() => settings.mode === 'custom' || settings.preset === 'classic')
const classicAppearance = computed(() => (
  settings.customAppearance === 'dark' ? 'dark' : 'sunny'
))
const showIpDecorations = computed(() => (
  settings.mode === 'default' && settings.showShinchan && activeIp.value !== 'classic'
))

const ensureCustomVideoPlayback = (event) => {
  const video = event.currentTarget
  video.muted = true
  video.play().catch(() => {
    // 某些浏览器会在切换标签页后延迟自动播放；保留首帧而不打断页面。
  })
}

const THEME_SCENES = {
  classic: {
    label: '经典音乐空间',
    tagline: 'PURE MUSIC · YOUR WAY',
    hero: '',
    cards: []
  },
  'kasukabe-sky': {
    label: '春日部晴空',
    tagline: '小新与防卫队的晴天散步',
    hero: '/images/shinchan-playlists/cover-09.jpg',
    cards: [
      '/images/shinchan-playlists/cover-11.jpg',
      '/images/shinchan-playlists/cover-12.jpg',
      '/images/shinchan-playlists/cover-04.jpg'
    ]
  },
  'family-picnic': {
    label: '野原家野餐',
    tagline: '草地、微风和全家人的周末',
    hero: '/images/shinchan-playlists/cover-03.jpg',
    cards: [
      '/images/shinchan-playlists/cover-08.jpg',
      '/images/shinchan-playlists/cover-06.jpg',
      '/images/shinchan-playlists/cover-16.jpg'
    ]
  },
  'sunset-road': {
    label: '放学晚霞',
    tagline: '沿着暖橘色街道慢慢回家',
    hero: '/images/shinchan-playlists/cover-15.jpg',
    cards: [
      '/images/shinchan-playlists/cover-13.jpg',
      '/images/shinchan-playlists/cover-05.jpg',
      '/images/shinchan-playlists/cover-01.jpg'
    ]
  },
  'starry-radio': {
    label: '春日部夜电台',
    tagline: '路灯、星夜和安静的晚间歌单',
    hero: '/images/shinchan-playlists/cover-10.jpg',
    cards: [
      '/images/shinchan-playlists/cover-14.jpg',
      '/images/shinchan-playlists/cover-02.jpg',
      '/images/shinchan-playlists/cover-11.jpg'
    ]
  },
  'crayon-room': {
    label: '蜡笔涂鸦屋',
    tagline: '野原家的饭桌与慵懒日常',
    hero: '/images/shinchan-playlists/cover-07.jpg',
    cards: [
      '/images/shinchan-playlists/cover-11.jpg',
      '/images/shinchan-playlists/cover-02.jpg',
      '/images/shinchan-playlists/cover-16.jpg'
    ]
  },
  'rainy-day': {
    label: '小新雨天',
    tagline: '撑着雨伞听一场春日部的雨',
    hero: '/images/shinchan-playlists/cover-01.jpg',
    cards: [
      '/images/shinchan-playlists/cover-05.jpg',
      '/images/shinchan-playlists/cover-10.jpg',
      '/images/shinchan-playlists/cover-14.jpg'
    ]
  },
  'midnight-cinema': {
    label: '春日部深夜影院',
    tagline: '暖黄路灯下的午夜放映时间',
    hero: '/images/shinchan-playlists/cover-02.jpg',
    cards: [
      '/images/shinchan-playlists/cover-10.jpg',
      '/images/shinchan-playlists/cover-14.jpg',
      '/images/shinchan-playlists/cover-07.jpg'
    ]
  },
  'motion-walk': {
    label: '放学晴空',
    tagline: '风筝、纸飞机与放学路上的轻快脚步',
    motion: 'walk',
    hero: '/images/music-themes/motion-walk-scene.png',
    cards: [
      '/images/music-themes/motion-walk-scene.png',
      '/images/music-themes/motion-rain-scene.png',
      '/images/music-themes/motion-parade-scene.png'
    ]
  },
  'motion-rain': {
    label: '雷雨夜行',
    tagline: '闪电、路灯、积水与撑伞小新的雨夜',
    motion: 'rain',
    hero: '/images/music-themes/motion-rain-scene.png',
    cards: [
      '/images/music-themes/motion-rain-scene.png',
      '/images/music-themes/motion-walk-scene.png',
      '/images/music-themes/motion-parade-scene.png'
    ]
  },
  'motion-parade': {
    label: '春日部庆典巡游',
    tagline: '灯笼、气球、聚光灯和热闹的相册花车',
    motion: 'parade',
    hero: '/images/music-themes/motion-parade-scene.png',
    cards: [
      '/images/music-themes/motion-parade-scene.png',
      '/images/music-themes/motion-walk-scene.png',
      '/images/music-themes/motion-rain-scene.png'
    ]
  },
  'hello-kitty-garden': {
    label: 'Kitty 草莓花园',
    tagline: '草莓甜点、红色蝴蝶结与花园午后',
    hero: '/images/ip-themes/hello-kitty-main.png',
    cards: [
      '/images/ip-themes/hello-kitty-main.png',
      '/images/ip-themes/hello-kitty-angel.png'
    ]
  },
  'hello-kitty-midnight': {
    label: 'Kitty 红丝绒夜宴',
    tagline: '红丝绒、香槟金与午夜甜点桌',
    hero: '/images/ip-themes/hello-kitty-friends.png',
    cards: [
      '/images/ip-themes/hello-kitty-main.png',
      '/images/ip-themes/hello-kitty-angel.png'
    ]
  },
  'hello-kitty-dream': {
    label: 'Kitty 云端梦游',
    tagline: '云朵、爱心和丝带沿着旋律漂浮',
    motion: 'kitty-dream',
    hero: '/images/ip-themes/hello-kitty-angel.png',
    cards: [
      '/images/ip-themes/hello-kitty-angel.png',
      '/images/ip-themes/hello-kitty-main.png'
    ]
  },
  'hello-kitty-patisserie': {
    label: 'Kitty 草莓甜品屋',
    tagline: 'STRAWBERRY PATISSERIE · TEA & TAPES',
    hero: '/images/music-themes/kitty-strawberry-patisserie.png',
    cards: [
      '/images/music-themes/kitty-strawberry-patisserie.png',
      '/images/ip-themes/hello-kitty-main.png'
    ]
  },
  'hello-kitty-ribbon-cinema': {
    label: 'Kitty 缎带影院',
    tagline: 'RIBBON REEL · A SOFT LITTLE PREMIERE',
    hero: '/images/music-themes/kitty-ribbon-cinema.png',
    cards: [
      '/images/music-themes/kitty-ribbon-cinema.png',
      '/images/ip-themes/hello-kitty-angel.png'
    ]
  },
  'hello-kitty-sakura-breeze': {
    label: 'Kitty 樱花纸笺',
    tagline: 'PETAL LETTERS · A SONG FOR SPRING',
    motion: 'kitty-sakura',
    hero: '/images/music-themes/kitty-sakura-letter.png',
    cards: [
      '/images/music-themes/kitty-sakura-letter.png',
      '/images/music-themes/kitty-strawberry-patisserie.png'
    ]
  },
  'hello-kitty-candy-carousel': {
    label: 'Kitty 月光旋转木马',
    tagline: 'MOONLIT FAIRGROUND · PAPER MELODY',
    motion: 'kitty-carousel',
    hero: '/images/music-themes/kitty-carousel-sunrise.png',
    cards: [
      '/images/music-themes/kitty-carousel-sunrise.png',
      '/images/ip-themes/hello-kitty-main.png'
    ]
  },
  'kuromi-neon': {
    label: '库洛米霓虹卧室',
    tagline: '黑莓紫、朋克格纹和坏坏的甜酷节拍',
    hero: '/images/ip-themes/kuromi-main.png',
    cards: [
      '/images/ip-themes/kuromi-main.png',
      '/images/ip-themes/kuromi-melody.png'
    ]
  },
  'kuromi-midnight': {
    label: '库洛米暗夜舞台',
    tagline: '黑曜石舞台、霓虹粉与金属铆钉',
    hero: '/images/music-themes/kuromi-midnight-stage.png',
    cards: [
      '/images/music-themes/kuromi-midnight-stage.png',
      '/images/ip-themes/kuromi-melody.png'
    ]
  },
  'kuromi-night-flight': {
    label: '库洛米午夜飞行',
    tagline: '弯月、星芒和穿过夜空的顽皮轨迹',
    motion: 'kuromi-flight',
    hero: '/images/ip-themes/kuromi-melody.png',
    cards: [
      '/images/ip-themes/kuromi-melody.png',
      '/images/ip-themes/kuromi-main.png'
    ]
  },
  'kuromi-arcade-noir': {
    label: '库洛米月光街机厅',
    tagline: 'MOONLIT ARCADE · INSERT THE BEAT',
    hero: '/images/music-themes/kuromi-arcade-noir.png',
    cards: [
      '/images/music-themes/kuromi-arcade-noir.png',
      '/images/ip-themes/kuromi-main.png'
    ]
  },
  'kuromi-violet-library': {
    label: '库洛米紫夜书房',
    tagline: 'VIOLET INK · LATE NIGHT TRACKS',
    hero: '/images/music-themes/kuromi-violet-library.png',
    cards: [
      '/images/music-themes/kuromi-violet-library.png',
      '/images/ip-themes/kuromi-main.png'
    ]
  },
  'kuromi-sticker-storm': {
    label: '库洛米贴纸风暴',
    tagline: 'STICKERS IN THE AIR · TURN IT UP',
    motion: 'kuromi-stickers',
    hero: '/images/music-themes/kuromi-sticker-storm.png',
    cards: [
      '/images/music-themes/kuromi-sticker-storm.png',
      '/images/music-themes/kuromi-arcade-noir.png'
    ]
  },
  'kuromi-vinyl-rush': {
    label: '库洛米黑胶夜行',
    tagline: 'VINYL NIGHT · GRAFFITI BEATS',
    motion: 'kuromi-vinyl',
    hero: '/images/music-themes/kuromi-vinyl-night.png',
    cards: [
      '/images/music-themes/kuromi-vinyl-night.png',
      '/images/ip-themes/kuromi-melody.png'
    ]
  }
}

const activeTheme = computed(() => THEME_SCENES[settings.preset] || THEME_SCENES['kasukabe-sky'])
const activeIp = computed(() => getMusicThemeIp(settings.preset))
const activeIpMeta = computed(() => getMusicIp(activeIp.value))
const activeMobileComposition = computed(() => getMusicThemeMobileComposition(settings.preset))
const mobileSceneStyle = computed(() => ({
  '--mpb-mobile-scene-image': `url("${activeMobileComposition.value.mobileArtwork || activeTheme.value.hero}")`,
  '--mpb-mobile-atmosphere-position': activeMobileComposition.value.atmospherePosition,
  '--mpb-mobile-atmosphere-opacity': activeMobileComposition.value.atmosphereOpacity,
  '--mpb-mobile-subject-width': activeMobileComposition.value.subjectWidth,
  '--mpb-mobile-subject-height': activeMobileComposition.value.subjectHeight,
  '--mpb-mobile-subject-x': activeMobileComposition.value.subjectX,
  '--mpb-mobile-subject-bottom': activeMobileComposition.value.subjectBottom,
  '--mpb-mobile-subject-position': activeMobileComposition.value.subjectPosition,
  '--mpb-mobile-subject-opacity': activeMobileComposition.value.subjectOpacity
}))

const ipMotionItems = Array.from({ length: 15 }, (_, index) => ({
  id: index,
  style: {
    left: `${3 + (index * 17) % 92}%`,
    top: `${6 + (index * 23) % 78}%`,
    '--ip-delay': `${-(index * 1.7)}s`,
    '--ip-duration': `${7 + (index % 5) * 1.8}s`,
    '--ip-size': `${12 + (index % 4) * 5}px`
  }
}))

const motionCharacterFrames = computed(() => {
  const prefix = activeTheme.value.motion === 'rain' ? 'motion-rain' : 'motion-walk'
  return [
    `/images/${prefix}-shinchan-stride.png`,
    `/images/${prefix}-shinchan-pass.png`
  ]
})

const motionSkyClouds = Array.from({ length: 5 }, (_, index) => ({
  id: index,
  style: {
    top: `${7 + (index % 3) * 15}%`,
    width: `${120 + (index % 3) * 48}px`,
    opacity: 0.16 + (index % 3) * 0.05,
    animationDelay: `${-(index * 7.4)}s`,
    animationDuration: `${30 + (index % 4) * 8}s`
  }
}))

const motionBirds = Array.from({ length: 7 }, (_, index) => ({
  id: index,
  style: {
    top: `${12 + (index % 4) * 7}%`,
    left: `${-10 - (index % 3) * 7}%`,
    '--bird-scale': 0.65 + (index % 3) * 0.18,
    animationDelay: `${-(index * 3.4)}s`,
    animationDuration: `${18 + (index % 4) * 3.5}s`
  }
}))

const motionPaperPlanes = Array.from({ length: 5 }, (_, index) => ({
  id: index,
  style: {
    top: `${22 + (index * 13) % 48}%`,
    left: `${-12 - index * 3}%`,
    animationDelay: `${-(index * 4.7)}s`,
    animationDuration: `${21 + (index % 3) * 4}s`,
    '--plane-rise': `${-42 + (index % 4) * 22}px`
  }
}))

const motionLeaves = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  style: {
    left: `${(index * 19.7 + 3) % 100}%`,
    top: `${5 + (index * 17.3) % 66}%`,
    width: `${8 + (index % 4) * 3}px`,
    height: `${5 + (index % 3) * 2}px`,
    animationDelay: `${-((index * 0.83) % 9)}s`,
    animationDuration: `${6.5 + (index % 6) * 0.9}s`,
    '--leaf-mid': `${34 + (index % 5) * 16}px`,
    '--leaf-drift': `${70 + (index % 5) * 32}px`,
    '--leaf-color': ['#f5c34e', '#ef8d4f', '#76b86a', '#f0d765'][index % 4]
  }
}))

const motionBreezeLines = Array.from({ length: 9 }, (_, index) => ({
  id: index,
  style: {
    left: `${-12 + (index % 3) * 7}%`,
    top: `${18 + index * 7.2}%`,
    width: `${70 + (index % 4) * 42}px`,
    animationDelay: `${-(index * 0.72)}s`,
    animationDuration: `${5.2 + (index % 4) * 0.8}s`
  }
}))

const rainNoise = (index, salt) => {
  const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453
  return value - Math.floor(value)
}

const motionRainDrops = Array.from({ length: 96 }, (_, index) => ({
  id: index,
  style: {
    left: `${rainNoise(index, 1) * 100}%`,
    top: `${-8 - rainNoise(index, 2) * 26}%`,
    animationDelay: `${-(rainNoise(index, 3) * 3.8)}s`,
    animationDuration: `${0.68 + rainNoise(index, 4) * 1.02}s`,
    opacity: 0.28 + rainNoise(index, 5) * 0.62,
    width: `${1.15 + rainNoise(index, 6) * 1.25}px`,
    height: `${7 + Math.round(rainNoise(index, 7) * 12)}px`,
    '--rain-slant': `${7 + rainNoise(index, 8) * 13}deg`,
    '--rain-drift': `${-18 - rainNoise(index, 9) * 36}px`
  }
}))

const motionRipples = Array.from({ length: 11 }, (_, index) => ({
  id: index,
  style: {
    left: `${3 + (index * 17.3) % 92}%`,
    bottom: `${58 + (index % 3) * 21}px`,
    width: `${42 + (index % 5) * 18}px`,
    animationDelay: `${-((index * 0.64) % 4.8)}s`,
    animationDuration: `${3.1 + (index % 4) * 0.55}s`
  }
}))

const motionStreetlights = Array.from({ length: 4 }, (_, index) => ({
  id: index,
  style: {
    left: `${12 + index * 25}%`,
    animationDelay: `${-(index * 1.6)}s`
  }
}))

const motionStormClouds = Array.from({ length: 8 }, (_, index) => ({
  id: index,
  style: {
    top: `${-5 + (index % 3) * 9}%`,
    left: `${-32 - (index % 4) * 11}%`,
    width: `${210 + (index % 4) * 74}px`,
    opacity: 0.24 + (index % 3) * 0.1,
    animationDelay: `${-(index * 5.8)}s`,
    animationDuration: `${34 + (index % 5) * 7}s`
  }
}))

const motionConfetti = Array.from({ length: 22 }, (_, index) => ({
  id: index,
  style: {
    left: `${2 + (index * 23.7) % 96}%`,
    top: `${-5 - (index % 4) * 7}%`,
    width: `${5 + (index % 3) * 3}px`,
    height: `${11 + (index % 4) * 3}px`,
    animationDelay: `${-((index * 0.73) % 9)}s`,
    animationDuration: `${7 + (index % 6) * 1.1}s`,
    '--confetti-color': ['#ef5f61', '#f3be4d', '#63b6d6', '#75bd82', '#f08fb4'][index % 5],
    '--confetti-drift': `${-60 + (index % 7) * 22}px`
  }
}))

const motionLanterns = Array.from({ length: 10 }, (_, index) => ({
  id: index,
  style: {
    left: `${4 + index * 10.2}%`,
    top: `${7 + Math.sin(index * 0.9) * 3}%`,
    animationDelay: `${-(index * 0.28)}s`
  }
}))

const motionBalloons = Array.from({ length: 9 }, (_, index) => ({
  id: index,
  style: {
    left: `${4 + (index * 27.7) % 92}%`,
    bottom: `${-18 - (index % 4) * 9}%`,
    width: `${18 + (index % 3) * 7}px`,
    height: `${24 + (index % 3) * 8}px`,
    animationDelay: `${-(index * 2.4)}s`,
    animationDuration: `${15 + (index % 5) * 2.3}s`,
    '--balloon-color': ['#ef6461', '#f5bb45', '#64b7d7', '#6ebe86', '#f08bb0'][index % 5],
    '--balloon-drift': `${-42 + (index % 5) * 21}px`
  }
}))

const NOTE_SYMBOLS = ['♪', '♫', '♩', '♬']
const NOTE_COUNT = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches ? 10 : 16
const SPARKLE_COUNT = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches ? 14 : 22

const notes = Array.from({ length: NOTE_COUNT }, (_, index) => {
  const left = ((index * 41.3 + (index % 11) * 17.7) % 94) + 3
  const size = 14 + (index % 5) * 4
  const duration = 14 + (index % 8) * 2.5
  const delay = -((index * 1.9 + (index % 13) * 0.7) % 20)
  const drift = -30 + ((index * 13) % 60)
  const opacity = 0.12 + (index % 4) * 0.06

  return {
    id: index,
    symbol: NOTE_SYMBOLS[index % NOTE_SYMBOLS.length],
    style: {
      left: `${left}%`,
      fontSize: `${size}px`,
      opacity,
      animationDuration: `${duration}s`,
      animationDelay: `${delay}s`,
      '--note-drift': `${drift}px`
    }
  }
})

const sparkles = Array.from({ length: SPARKLE_COUNT }, (_, index) => {
  const left = ((index * 29.1 + (index % 9) * 11.4) % 98) + 1
  const top = ((index * 23.7 + (index % 7) * 15.2) % 96) + 2
  const size = 2 + (index % 3)
  const duration = 3 + (index % 5) * 1.2
  const delay = -((index * 0.85) % 8)

  return {
    id: index,
    style: {
      left: `${left}%`,
      top: `${top}%`,
      width: `${size}px`,
      height: `${size}px`,
      animationDuration: `${duration}s`,
      animationDelay: `${delay}s`
    }
  }
})
</script>

<style scoped>
.music-page-bg {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  background: linear-gradient(145deg, rgba(255, 247, 224, 0.48), rgba(238, 246, 255, 0.46) 48%, rgba(255, 231, 239, 0.42));
  transition: background 320ms ease;
}

.mpb-theme-wash {
  position: absolute;
  inset: 0;
  opacity: 0.72;
  transition: background 320ms ease, opacity 320ms ease;
}

.mpb-theme-scene {
  position: absolute;
  right: clamp(22px, 4vw, 78px);
  bottom: 78px;
  width: clamp(290px, 34vw, 560px);
  height: clamp(190px, 27vw, 360px);
  overflow: hidden;
  border: 8px solid rgba(255, 255, 255, 0.66);
  border-radius: 38px 38px 12px 38px;
  background-position: center;
  background-size: cover;
  box-shadow: 0 30px 80px rgba(47, 59, 86, 0.18);
  opacity: 0.27;
  filter: saturate(1.08);
  transform: rotate(-2.5deg);
  transition: opacity 260ms ease, filter 260ms ease, transform 260ms ease;
}

.mpb-theme-scene::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 48%, rgba(17, 24, 39, 0.62));
}

.mpb-theme-scene-copy {
  position: absolute;
  right: 1.1rem;
  bottom: 0.9rem;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  color: #fff;
  text-align: right;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.48);
}

.mpb-theme-scene-copy strong {
  font-size: clamp(0.92rem, 1.3vw, 1.18rem);
  letter-spacing: 0.08em;
}

.mpb-theme-scene-copy small {
  margin-top: 0.22rem;
  font-size: 0.66rem;
  letter-spacing: 0.04em;
}

.music-page-bg.preset-family-picnic .mpb-theme-scene {
  right: 3vw;
  border-radius: 44px 16px 44px 16px;
  transform: rotate(1.8deg);
}

.music-page-bg.preset-sunset-road .mpb-theme-scene {
  right: 5vw;
  border-radius: 18px 48px 18px 48px;
  transform: rotate(-1deg);
}

.music-page-bg.preset-starry-radio .mpb-theme-scene {
  opacity: 0.34;
  filter: saturate(1.16) contrast(1.04);
  transform: rotate(1.5deg);
}

.music-page-bg.preset-crayon-room .mpb-theme-scene {
  right: auto;
  left: 3vw;
  border-radius: 28px 48px 28px 14px;
  transform: rotate(2.5deg);
}

.music-page-bg.preset-rainy-day .mpb-theme-scene {
  border-color: rgba(222, 239, 248, 0.66);
  border-radius: 48px 48px 16px 16px;
  filter: saturate(0.86) contrast(1.04);
  transform: rotate(-1.5deg);
}

.music-page-bg.preset-midnight-cinema .mpb-theme-scene {
  border-color: rgba(255, 222, 162, 0.2);
  border-radius: 24px 44px 24px 44px;
  opacity: 0.4;
  filter: saturate(0.86) contrast(1.08) brightness(0.74);
  transform: rotate(1deg);
}

.music-page-bg.preset-kasukabe-sky .mpb-theme-wash {
  background:
    radial-gradient(circle at 12% 16%, rgba(255, 226, 87, 0.34), transparent 25%),
    radial-gradient(circle at 82% 18%, rgba(104, 203, 246, 0.24), transparent 30%),
    linear-gradient(155deg, rgba(255, 252, 231, 0.46), rgba(236, 249, 255, 0.42) 54%, rgba(255, 235, 242, 0.34));
}

.music-page-bg.preset-family-picnic .mpb-theme-wash {
  background:
    radial-gradient(ellipse at 50% 112%, rgba(115, 187, 103, 0.3), transparent 48%),
    radial-gradient(circle at 16% 13%, rgba(255, 239, 154, 0.3), transparent 24%),
    linear-gradient(180deg, rgba(217, 242, 255, 0.48), rgba(237, 249, 222, 0.5));
}

.music-page-bg.preset-sunset-road .mpb-theme-wash {
  background:
    radial-gradient(circle at 78% 18%, rgba(255, 214, 112, 0.42), transparent 24%),
    linear-gradient(145deg, rgba(255, 225, 187, 0.52), rgba(255, 178, 163, 0.38) 52%, rgba(238, 180, 210, 0.38));
}

.music-page-bg.preset-starry-radio .mpb-theme-wash {
  opacity: 0.9;
  background:
    radial-gradient(circle at 72% 24%, rgba(116, 155, 226, 0.25), transparent 28%),
    radial-gradient(circle at 18% 80%, rgba(106, 85, 168, 0.25), transparent 32%),
    linear-gradient(145deg, rgba(19, 34, 69, 0.74), rgba(40, 42, 84, 0.68) 52%, rgba(25, 45, 75, 0.7));
}

.music-page-bg.preset-crayon-room .mpb-theme-wash {
  background:
    repeating-linear-gradient(12deg, transparent 0 44px, rgba(219, 172, 102, 0.05) 45px 47px),
    radial-gradient(circle at 16% 22%, rgba(255, 197, 118, 0.31), transparent 24%),
    linear-gradient(145deg, rgba(255, 248, 218, 0.56), rgba(255, 230, 211, 0.48) 55%, rgba(232, 245, 223, 0.46));
}

.music-page-bg.preset-rainy-day .mpb-theme-wash {
  background:
    repeating-linear-gradient(112deg, transparent 0 42px, rgba(89, 153, 193, 0.055) 43px 45px, transparent 46px 82px),
    radial-gradient(circle at 74% 20%, rgba(197, 231, 248, 0.38), transparent 28%),
    linear-gradient(155deg, rgba(226, 240, 249, 0.56), rgba(202, 222, 239, 0.45) 55%, rgba(231, 238, 247, 0.5));
}

.music-page-bg.preset-midnight-cinema {
  background: #090a0d;
}

.music-page-bg.preset-midnight-cinema .mpb-theme-wash {
  opacity: 1;
  background:
    radial-gradient(circle at 76% 18%, rgba(239, 174, 84, 0.16), transparent 25%),
    radial-gradient(circle at 14% 78%, rgba(125, 38, 51, 0.18), transparent 32%),
    linear-gradient(145deg, rgba(8, 9, 13, 0.98), rgba(29, 21, 25, 0.96) 52%, rgba(11, 14, 18, 0.98));
}

.music-page-bg.preset-family-picnic .mpb-orb--1,
.music-page-bg.preset-family-picnic .mpb-orb--3 {
  background: radial-gradient(circle, rgba(112, 190, 101, 0.5), transparent 70%);
}

.music-page-bg.preset-sunset-road .mpb-orb--1,
.music-page-bg.preset-sunset-road .mpb-orb--3 {
  background: radial-gradient(circle, rgba(255, 135, 104, 0.52), transparent 70%);
}

.music-page-bg.preset-starry-radio .mpb-orb--1,
.music-page-bg.preset-starry-radio .mpb-orb--4 {
  background: radial-gradient(circle, rgba(78, 105, 190, 0.54), transparent 70%);
}

.music-page-bg.preset-crayon-room .mpb-orb--1,
.music-page-bg.preset-crayon-room .mpb-orb--3 {
  background: radial-gradient(circle, rgba(238, 169, 91, 0.46), transparent 70%);
}

.music-page-bg.preset-rainy-day .mpb-orb--2,
.music-page-bg.preset-rainy-day .mpb-orb--4 {
  background: radial-gradient(circle, rgba(75, 146, 191, 0.48), transparent 70%);
}

.music-page-bg.preset-midnight-cinema .mpb-orb--1,
.music-page-bg.preset-midnight-cinema .mpb-orb--4 {
  background: radial-gradient(circle, rgba(151, 52, 62, 0.34), transparent 70%);
}

.music-page-bg.preset-midnight-cinema .mpb-orb--2 {
  background: radial-gradient(circle, rgba(232, 173, 91, 0.24), transparent 70%);
}

.music-page-bg.preset-motion-walk {
  background: linear-gradient(155deg, #fff8d9, #e9f7ff 52%, #f7f1df);
}

.music-page-bg.preset-motion-walk .mpb-theme-wash {
  background:
    radial-gradient(circle at 84% 13%, rgba(255, 218, 76, 0.42), transparent 27%),
    radial-gradient(circle at 15% 24%, rgba(111, 200, 239, 0.2), transparent 31%),
    linear-gradient(180deg, rgba(228, 247, 255, 0.52), rgba(244, 249, 220, 0.48));
}

.music-page-bg.preset-motion-rain {
  background: linear-gradient(155deg, #aebfca, #8ea6b5 54%, #7e92a5);
}

.music-page-bg.preset-motion-rain .mpb-theme-wash {
  opacity: 0.97;
  background:
    radial-gradient(circle at 72% 16%, rgba(221, 238, 246, 0.26), transparent 25%),
    radial-gradient(ellipse at 42% 0%, rgba(56, 79, 96, 0.25), transparent 42%),
    linear-gradient(155deg, rgba(155, 185, 201, 0.86), rgba(92, 126, 147, 0.72) 55%, rgba(109, 127, 151, 0.8));
  animation: mpb-rain-wash-flash 6.9s steps(1, end) infinite;
}

.music-page-bg.preset-motion-parade {
  background: linear-gradient(145deg, #fff1c9, #ffe1d5 52%, #e4f1d9);
}

.music-page-bg.preset-motion-parade .mpb-theme-wash {
  background:
    radial-gradient(circle at 18% 18%, rgba(255, 199, 87, 0.28), transparent 26%),
    radial-gradient(circle at 80% 20%, rgba(235, 105, 105, 0.18), transparent 28%),
    linear-gradient(145deg, rgba(255, 246, 209, 0.58), rgba(255, 224, 211, 0.5) 52%, rgba(226, 242, 216, 0.48));
}

.music-page-bg.preset-motion-walk .mpb-theme-scene {
  animation: mpb-motion-scene-walk 18s ease-in-out infinite alternate;
}

.music-page-bg.preset-motion-rain .mpb-theme-scene {
  animation: mpb-motion-scene-rain 10s ease-in-out infinite alternate;
}

.music-page-bg.preset-motion-parade .mpb-theme-scene {
  animation: mpb-motion-scene-parade 13s cubic-bezier(0.45, 0, 0.55, 1) infinite alternate;
}

.mpb-motion-layer {
  position: absolute;
  inset: 0;
  z-index: 2;
  overflow: hidden;
  pointer-events: none;
}

.mpb-motion-sky,
.mpb-walk-birds,
.mpb-walk-paper-planes,
.mpb-motion-leaves,
.mpb-motion-breeze,
.mpb-motion-ripples,
.mpb-motion-confetti,
.mpb-rain-streetlights,
.mpb-parade-lanterns,
.mpb-parade-balloons,
.mpb-parade-spotlights {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.mpb-motion-sky {
  z-index: 0;
}

.mpb-motion-sky i {
  position: absolute;
  left: -22%;
  height: 34px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  filter: blur(0.2px);
  box-shadow: 0 10px 28px rgba(99, 161, 185, 0.08);
  animation: mpb-motion-cloud-drift linear infinite;
}

.mpb-motion-sky i::before,
.mpb-motion-sky i::after {
  content: '';
  position: absolute;
  bottom: 7px;
  border-radius: 50%;
  background: inherit;
}

.mpb-walk-sun {
  position: absolute;
  top: 5.5%;
  right: 8%;
  z-index: 0;
  width: clamp(112px, 9.5vw, 166px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 249, 196, 0.68) 0 20%, rgba(255, 219, 91, 0.24) 38%, rgba(255, 202, 70, 0.08) 57%, transparent 73%);
  filter: drop-shadow(0 0 20px rgba(255, 207, 68, 0.24));
  animation: mpb-walk-sun-pulse 6.8s ease-in-out infinite;
}

.mpb-walk-sun::before {
  content: '';
  position: absolute;
  inset: 1%;
  border-radius: 50%;
  background: conic-gradient(
    from -7deg,
    transparent 0 4%, rgba(255, 202, 62, 0.36) 4.5% 7%, transparent 7.5% 15%,
    rgba(255, 216, 93, 0.25) 15.5% 18%, transparent 18.5% 27%,
    rgba(255, 197, 49, 0.3) 27.5% 30%, transparent 30.5% 39%,
    rgba(255, 220, 103, 0.24) 39.5% 42.5%, transparent 43% 53%,
    rgba(255, 196, 45, 0.31) 53.5% 56%, transparent 56.5% 66%,
    rgba(255, 218, 96, 0.25) 66.5% 69%, transparent 69.5% 79%,
    rgba(255, 198, 50, 0.3) 79.5% 82%, transparent 82.5% 92%,
    rgba(255, 218, 96, 0.24) 92.5% 95%, transparent 95.5% 100%
  );
  -webkit-mask: radial-gradient(circle, transparent 0 43%, #000 49% 62%, transparent 73%);
  mask: radial-gradient(circle, transparent 0 43%, #000 49% 62%, transparent 73%);
  filter: blur(0.8px);
  animation: mpb-walk-sun-rays 42s linear infinite;
}

.mpb-walk-sun::after {
  content: '';
  position: absolute;
  inset: -24%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 237, 153, 0.2), rgba(255, 218, 86, 0.07) 42%, transparent 69%);
  filter: blur(5px);
  animation: mpb-walk-sun-halo 5.6s ease-in-out infinite alternate;
}

.mpb-walk-sun i {
  position: absolute;
  inset: 31%;
  z-index: 1;
  border-radius: inherit;
  border: 1px solid rgba(255, 251, 210, 0.9);
  background: radial-gradient(circle at 36% 30%, #fffbd6 0 10%, #ffe986 36%, #ffd45a 70%, #f4b93e 100%);
  box-shadow: inset -7px -8px 13px rgba(222, 145, 33, 0.13), 0 0 26px rgba(255, 202, 54, 0.4);
}

.mpb-walk-birds { z-index: 1; }

.mpb-walk-birds i {
  position: absolute;
  width: 22px;
  height: 10px;
  animation: mpb-walk-bird-cross linear infinite;
}

.mpb-walk-birds i::before,
.mpb-walk-birds i::after {
  content: '';
  position: absolute;
  top: 2px;
  width: 12px;
  height: 7px;
  border-top: 2px solid rgba(65, 119, 135, 0.48);
  border-radius: 50%;
  animation: mpb-walk-bird-wing 0.72s ease-in-out infinite alternate;
}

.mpb-walk-birds i::before { left: 0; transform: rotate(14deg); }
.mpb-walk-birds i::after { right: 0; transform: rotate(-14deg); }

.mpb-walk-paper-planes { z-index: 2; }

.mpb-walk-paper-planes i {
  position: absolute;
  width: 24px;
  height: 19px;
  opacity: 0;
  border-top: 2px solid rgba(255, 255, 255, 0.74);
  border-right: 2px solid rgba(79, 157, 184, 0.35);
  clip-path: polygon(0 22%, 100% 0, 70% 100%, 45% 58%);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.82), rgba(174, 226, 239, 0.48));
  filter: drop-shadow(0 5px 7px rgba(78, 148, 171, 0.13));
  animation: mpb-walk-plane-cross linear infinite;
}

.mpb-motion-sky i::before {
  left: 18%;
  width: 38%;
  aspect-ratio: 1;
}

.mpb-motion-sky i::after {
  right: 13%;
  width: 46%;
  aspect-ratio: 1;
}

.mpb-motion-leaves {
  z-index: 2;
}

.mpb-motion-leaves i {
  position: absolute;
  border-radius: 90% 8% 90% 8%;
  background: var(--leaf-color);
  box-shadow: 0 2px 5px rgba(111, 83, 42, 0.11);
  animation: mpb-motion-leaf-drift ease-in-out infinite;
}

.mpb-motion-breeze {
  z-index: 1;
}

.mpb-motion-breeze i {
  position: absolute;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, rgba(91, 172, 198, 0.2), transparent);
  animation: mpb-motion-breeze-pass linear infinite;
}

.mpb-motion-storm-glow {
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(circle at 76% 12%, rgba(225, 243, 255, 0.34), transparent 31%),
    radial-gradient(circle at 22% 36%, rgba(76, 126, 158, 0.13), transparent 38%);
  animation: mpb-motion-storm-pulse 6.9s ease-in-out infinite;
}

.mpb-rain-cloudbank {
  position: absolute;
  inset: 0 0 auto;
  z-index: 1;
  height: 38%;
  overflow: hidden;
  filter: blur(0.4px) saturate(0.76);
}

.mpb-rain-cloudbank i {
  position: absolute;
  height: 48px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(70, 89, 105, 0.78), rgba(102, 123, 139, 0.58));
  box-shadow: 0 18px 42px rgba(34, 53, 68, 0.2);
  animation: mpb-rain-cloudbank-drift linear infinite;
}

.mpb-rain-cloudbank i::before,
.mpb-rain-cloudbank i::after {
  content: '';
  position: absolute;
  bottom: 8px;
  border-radius: 50%;
  background: inherit;
}

.mpb-rain-cloudbank i::before { left: 15%; width: 36%; aspect-ratio: 1; }
.mpb-rain-cloudbank i::after { right: 11%; width: 45%; aspect-ratio: 1; }

.mpb-motion-mist {
  position: absolute;
  right: -28%;
  bottom: 60px;
  z-index: 1;
  width: 150%;
  height: 28%;
  background: repeating-radial-gradient(ellipse at 50% 100%, rgba(235, 246, 251, 0.23) 0 9%, transparent 18% 28%);
  filter: blur(16px);
  animation: mpb-motion-mist-drift 16s ease-in-out infinite alternate;
}

.mpb-rain-lightning {
  position: absolute;
  inset: 0;
  z-index: 2;
  opacity: 0;
  background:
    radial-gradient(circle at 76% 8%, rgba(246, 252, 255, 0.92), transparent 37%),
    linear-gradient(180deg, rgba(226, 246, 255, 0.3), transparent 62%);
  animation: mpb-rain-sky-flash 6.9s steps(1, end) infinite;
}

.mpb-rain-lightning i {
  position: absolute;
  top: -2%;
  width: 34px;
  height: 238px;
  background: linear-gradient(180deg, rgba(247, 252, 255, 0.96), rgba(154, 213, 244, 0.58));
  clip-path: polygon(44% 0, 96% 0, 60% 40%, 90% 40%, 25% 100%, 39% 54%, 8% 54%);
  filter: drop-shadow(0 0 8px #ffffff) drop-shadow(0 0 22px rgba(189, 231, 255, 0.96));
}

.mpb-rain-lightning i:first-child { right: 18%; transform: rotate(6deg) scale(0.8); }
.mpb-rain-lightning i:last-child { left: 23%; top: 8%; transform: rotate(-8deg) scale(0.5); opacity: 0.55; }
.mpb-rain-lightning i:nth-child(2) { left: 47%; top: -5%; transform: rotate(4deg) scale(0.62); opacity: 0.72; }

.mpb-rain-streetlights {
  z-index: 1;
  bottom: 62px;
  top: auto;
  height: 32%;
}

.mpb-rain-streetlights i {
  position: absolute;
  bottom: 0;
  width: 3px;
  height: 68%;
  border-radius: 5px 5px 0 0;
  background: linear-gradient(180deg, rgba(56, 77, 89, 0.66), rgba(49, 68, 82, 0.18));
  opacity: 0.34;
}

.mpb-rain-streetlights i::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 50%;
  width: 12px;
  height: 9px;
  border-radius: 7px 7px 3px 3px;
  background: #f4cd76;
  box-shadow: 0 0 16px 5px rgba(250, 208, 112, 0.34), 0 0 42px 18px rgba(250, 208, 112, 0.12);
  transform: translateX(-50%);
  animation: mpb-rain-lamp-flicker 5.2s steps(1, end) infinite;
  animation-delay: inherit;
}

.mpb-motion-companions {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.mpb-motion-companion {
  position: absolute;
  display: block;
  width: clamp(84px, 8vw, 132px);
  aspect-ratio: 1;
  border: 5px solid rgba(255, 255, 255, 0.68);
  border-radius: 42% 58% 48% 52% / 52% 44% 56% 48%;
  background-position: center;
  background-size: cover;
  box-shadow: 0 18px 42px rgba(65, 74, 91, 0.14);
  opacity: 0.24;
  animation: mpb-motion-companion-float 6.8s ease-in-out infinite;
  animation-delay: calc(var(--companion-index) * -1.35s);
}

.mpb-motion-companion:nth-child(1) { top: 18%; left: 4%; }
.mpb-motion-companion:nth-child(2) { top: 42%; right: 4%; }
.mpb-motion-companion:nth-child(3) { right: 20%; bottom: 18%; }

.mpb-motion-companions--rain .mpb-motion-companion {
  border-color: rgba(218, 239, 249, 0.58);
  box-shadow: 0 18px 48px rgba(44, 82, 105, 0.18);
  filter: saturate(0.9) contrast(1.02);
  animation-name: mpb-motion-companion-rain-float;
}

.mpb-motion-companions--parade .mpb-motion-companion {
  opacity: 0.3;
  animation-duration: 5.4s;
}

.mpb-motion-walker-track {
  position: absolute;
  z-index: 3;
  left: -460px;
  bottom: 62px;
  width: 440px;
  height: 290px;
  animation: mpb-motion-walker-travel 22s linear infinite;
}

.music-page-bg:not(.playing) .mpb-motion-walker-track {
  animation-duration: 42s;
}

.music-page-bg.climbing .mpb-motion-walker-track {
  opacity: 0;
  transition: opacity 260ms ease;
}

.preset-motion-rain .mpb-motion-walker-track {
  animation-duration: 28s;
  filter: saturate(0.98) brightness(0.96);
}

.preset-motion-rain:not(.playing) .mpb-motion-walker-track {
  animation-duration: 52s;
}

.mpb-motion-walker {
  position: absolute;
  inset: 0;
  display: block;
  transform-origin: 50% 82%;
  animation: mpb-motion-run-cadence 0.56s cubic-bezier(0.42, 0, 0.58, 1) infinite;
}

.music-page-bg:not(.playing) .mpb-motion-walker {
  animation-duration: 0.78s;
}

.mpb-motion-walker-frame {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 12px 18px rgba(44, 50, 59, 0.2));
}

.mpb-motion-walker-track--walk .mpb-motion-walker-frame {
  animation-timing-function: steps(1, end);
}

.mpb-motion-walker-track--rain .mpb-motion-walker-frame {
  filter: drop-shadow(0 14px 20px rgba(35, 68, 86, 0.24));
}

.mpb-motion-walker-frame--stride {
  opacity: 1;
  transform: translateY(2px) rotate(-0.7deg) scaleX(1.01);
  animation: mpb-motion-stride-frame 0.56s steps(1, end) infinite;
}

.mpb-motion-walker-frame--pass {
  opacity: 0;
  transform: translateY(-5px) rotate(0.8deg) scaleX(0.985);
  animation: mpb-motion-pass-frame 0.56s steps(1, end) infinite;
}

.music-page-bg:not(.playing) .mpb-motion-walker-frame {
  animation-duration: 0.78s;
}

.mpb-motion-character-blink {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
}

.mpb-motion-character-blink i {
  position: absolute;
  top: 29.5%;
  width: 18px;
  height: 19px;
  border-radius: 50%;
  border-bottom: 3px solid #151515;
  background: #f6cbae;
  opacity: 0;
  transform: translate(-50%, -50%) scaleY(0.15);
  transform-origin: center bottom;
  animation: mpb-motion-character-blink 5.8s steps(1, end) infinite;
}

.mpb-motion-character-blink i:first-child { left: 52.5%; }
.mpb-motion-character-blink i:last-child { left: 58.2%; }

.mpb-motion-walker-track--rain .mpb-motion-character-blink i {
  top: 32%;
  width: 19px;
  height: 20px;
  background: #f5c9ab;
}

.mpb-motion-walker-track--rain .mpb-motion-character-blink i:first-child { left: 52%; }
.mpb-motion-walker-track--rain .mpb-motion-character-blink i:last-child { left: 58.3%; }

.mpb-motion-cloud {
  position: absolute;
  z-index: 2;
  top: 14px;
  left: 50%;
  width: 88px;
  height: 28px;
  border-radius: 999px;
  background: linear-gradient(180deg, #8997a9, #687687);
  box-shadow: 0 8px 16px rgba(48, 62, 78, 0.2);
  transform: translateX(-50%);
  animation: mpb-motion-rain-cloud-bob 3.8s ease-in-out infinite;
}

.mpb-motion-cloud::before,
.mpb-motion-cloud::after {
  content: '';
  position: absolute;
  bottom: 6px;
  border-radius: 50%;
  background: inherit;
}

.mpb-motion-cloud::before { left: 10px; width: 31px; height: 31px; }
.mpb-motion-cloud::after { right: 8px; width: 39px; height: 39px; }
.preset-motion-walk .mpb-motion-cloud { display: none; }

.mpb-motion-dust,
.mpb-motion-splash {
  position: absolute;
  z-index: 3;
  left: 24%;
  bottom: 28px;
  width: 132px;
  height: 50px;
}

.mpb-motion-dust i,
.mpb-motion-splash i {
  position: absolute;
  border-radius: 50%;
  animation: mpb-motion-trail-pop 1.15s ease-out infinite;
}

.mpb-motion-dust i {
  bottom: 5px;
  width: 18px;
  height: 12px;
  background: rgba(215, 181, 112, 0.25);
  filter: blur(1px);
}

.mpb-motion-splash i {
  bottom: 0;
  width: 25px;
  height: 9px;
  border: 2px solid rgba(81, 153, 193, 0.38);
  background: transparent;
}

.mpb-motion-dust i:nth-child(1),
.mpb-motion-splash i:nth-child(1) { left: 4px; animation-delay: -0.2s; }
.mpb-motion-dust i:nth-child(2),
.mpb-motion-splash i:nth-child(2) { left: 34px; animation-delay: -0.62s; }
.mpb-motion-dust i:nth-child(3),
.mpb-motion-splash i:nth-child(3) { left: 66px; animation-delay: -0.94s; }

.mpb-motion-rain {
  position: absolute;
  z-index: 4;
  inset: -18% 0 0;
  overflow: hidden;
}

.mpb-motion-rain::before {
  content: none;
}

.mpb-motion-rain i {
  position: absolute;
  top: -12%;
  width: 1.7px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(190, 229, 246, 0.28), rgba(30, 115, 168, 0.94));
  box-shadow: 0 0 4px rgba(102, 190, 231, 0.42);
  transform: rotate(var(--rain-slant, 12deg));
  animation: mpb-motion-rain-fall linear infinite;
}

.mpb-motion-ripples {
  z-index: 2;
}

.mpb-motion-ripples i {
  position: absolute;
  height: 13px;
  border: 2px solid rgba(50, 126, 168, 0.42);
  border-radius: 50%;
  opacity: 0;
  transform: translateX(-50%) scale(0.25);
  animation: mpb-motion-ripple-out ease-out infinite;
}

.mpb-motion-parade {
  position: absolute;
  left: -38vw;
  bottom: 104px;
  display: flex;
  gap: 24px;
  width: max-content;
  animation: mpb-motion-parade-travel 24s linear infinite;
}

.music-page-bg:not(.playing) .mpb-motion-parade {
  animation-duration: 42s;
}

.mpb-motion-parade-card {
  width: clamp(150px, 14vw, 230px);
  aspect-ratio: 1;
  border: 7px solid rgba(255, 255, 255, 0.7);
  border-radius: 28px 14px 28px 14px;
  background-position: center;
  background-size: cover;
  box-shadow: 0 24px 58px rgba(95, 60, 47, 0.18);
  opacity: 0.22;
  animation: mpb-motion-card-bob 4.6s ease-in-out infinite;
  animation-delay: calc(var(--motion-card-index) * -0.7s);
}

.mpb-motion-confetti {
  z-index: 3;
}

.mpb-motion-confetti i {
  position: absolute;
  border-radius: 2px 6px 2px 6px;
  background: var(--confetti-color);
  opacity: 0.38;
  animation: mpb-motion-confetti-fall linear infinite;
}

.mpb-parade-spotlights {
  z-index: 0;
  opacity: 0.44;
}

.mpb-parade-spotlights i {
  position: absolute;
  top: -18%;
  left: 15%;
  width: 18vw;
  height: 105vh;
  transform-origin: 50% 0;
  background: linear-gradient(180deg, rgba(255, 225, 139, 0.46), transparent 70%);
  clip-path: polygon(45% 0, 55% 0, 100% 100%, 0 100%);
  filter: blur(8px);
  animation: mpb-parade-spotlight-sweep 8s ease-in-out infinite alternate;
}

.mpb-parade-spotlights i:nth-child(2) { left: 51%; animation-delay: -3.2s; animation-direction: alternate-reverse; }
.mpb-parade-spotlights i:nth-child(3) { left: 80%; animation-delay: -5.4s; }

.mpb-parade-lanterns {
  z-index: 4;
  overflow: visible;
  height: 18%;
  border-top: 2px solid rgba(147, 80, 60, 0.18);
  border-radius: 50%;
  transform: rotate(-1.6deg) translateY(8px);
}

.mpb-parade-lanterns i {
  position: absolute;
  width: 3px;
  height: 31px;
  border-radius: 999px;
  background: rgba(123, 74, 60, 0.25);
  transform-origin: 50% 0;
  animation: mpb-parade-lantern-sway 3.4s ease-in-out infinite alternate;
}

.mpb-parade-lanterns b {
  position: absolute;
  left: 50%;
  bottom: -20px;
  width: 23px;
  height: 29px;
  border-radius: 45% 45% 38% 38%;
  background: linear-gradient(90deg, #e95f4e, #f6a04f 46%, #db4f47);
  box-shadow: inset 0 0 0 2px rgba(255, 222, 120, 0.25), 0 0 18px rgba(244, 124, 73, 0.3);
  transform: translateX(-50%);
}

.mpb-parade-lanterns b::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -9px;
  width: 2px;
  height: 10px;
  background: #d9a34f;
  transform: translateX(-50%);
}

.mpb-parade-balloons { z-index: 2; }

.mpb-parade-balloons i {
  position: absolute;
  border-radius: 50% 50% 46% 46%;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.52), transparent 33%), var(--balloon-color);
  box-shadow: inset -4px -6px 8px rgba(77, 57, 55, 0.1);
  opacity: 0;
  animation: mpb-parade-balloon-rise linear infinite;
}

.mpb-parade-balloons i::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 100%;
  width: 1px;
  height: 54px;
  background: rgba(91, 82, 75, 0.25);
}

.preset-motion-parade::after {
  content: '';
  position: absolute;
  z-index: 1;
  top: 13%;
  left: -4%;
  width: 108%;
  height: 22px;
  border-top: 2px dashed rgba(218, 117, 88, 0.14);
  border-radius: 50%;
  transform: rotate(-2deg);
  animation: mpb-motion-bunting-sway 6s ease-in-out infinite alternate;
}

@keyframes mpb-motion-walker-travel {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(calc(100vw + 900px), 0, 0); }
}

@keyframes mpb-motion-stride-frame {
  0%, 49.99% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

@keyframes mpb-motion-pass-frame {
  0%, 49.99% { opacity: 0; }
  50%, 100% { opacity: 1; }
}

@keyframes mpb-motion-run-cadence {
  0%, 100% { transform: translate3d(0, 1px, 0) rotate(-0.35deg) scaleY(1); }
  28% { transform: translate3d(1px, -3px, 0) rotate(0.2deg) scaleY(1.012); }
  52% { transform: translate3d(0, -7px, 0) rotate(0.55deg) scaleY(0.99); }
  76% { transform: translate3d(-1px, -2px, 0) rotate(-0.1deg) scaleY(1.006); }
}

@keyframes mpb-motion-character-blink {
  0%, 44%, 48%, 76%, 80%, 100% { opacity: 0; transform: translate(-50%, -50%) scaleY(0.15); }
  45%, 47%, 77%, 79% { opacity: 1; transform: translate(-50%, -50%) scaleY(0.92); }
}

@keyframes mpb-motion-rain-fall {
  from { transform: translate3d(0, -12vh, 0) rotate(var(--rain-slant, 12deg)); }
  to { transform: translate3d(var(--rain-drift, -34px), 126vh, 0) rotate(var(--rain-slant, 12deg)); }
}

@keyframes mpb-motion-rain-sheet {
  from { transform: translate3d(0, -180px, 0); }
  to { transform: translate3d(-42px, 180px, 0); }
}

@keyframes mpb-motion-companion-float {
  0%, 100% { transform: translate3d(0, 0, 0) rotate(-2deg) scale(1); }
  40% { transform: translate3d(12px, -14px, 0) rotate(2deg) scale(1.05); }
  72% { transform: translate3d(-7px, -5px, 0) rotate(-0.8deg) scale(0.98); }
}

@keyframes mpb-motion-companion-rain-float {
  0%, 100% { transform: translate3d(0, 0, 0) rotate(1deg); }
  50% { transform: translate3d(-8px, 12px, 0) rotate(-2deg); }
}

@keyframes mpb-motion-cloud-drift {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(145vw, 0, 0); }
}

@keyframes mpb-walk-sun-pulse {
  0%, 100% { transform: scale(0.96); opacity: 0.88; }
  50% { transform: scale(1.05); opacity: 1; }
}

@keyframes mpb-walk-sun-rays {
  to { transform: rotate(360deg); }
}

@keyframes mpb-walk-sun-halo {
  from { transform: scale(0.92); opacity: 0.68; }
  to { transform: scale(1.1); opacity: 1; }
}

@keyframes mpb-walk-bird-cross {
  from { transform: translate3d(-8vw, 0, 0) scale(var(--bird-scale, 1)); opacity: 0; }
  10%, 82% { opacity: 0.7; }
  to { transform: translate3d(125vw, -32px, 0) scale(var(--bird-scale, 1)); opacity: 0; }
}

@keyframes mpb-walk-bird-wing {
  from { margin-top: 1px; }
  to { margin-top: -3px; }
}

@keyframes mpb-walk-plane-cross {
  0% { transform: translate3d(-10vw, 20px, 0) rotate(-9deg) scale(0.72); opacity: 0; }
  12%, 78% { opacity: 0.64; }
  48% { transform: translate3d(62vw, var(--plane-rise), 0) rotate(4deg) scale(1); }
  100% { transform: translate3d(128vw, 12px, 0) rotate(-3deg) scale(0.78); opacity: 0; }
}

@keyframes mpb-motion-leaf-drift {
  0% { transform: translate3d(-20px, -16px, 0) rotate(0deg); opacity: 0; }
  12% { opacity: 0.48; }
  55% { transform: translate3d(var(--leaf-mid), 48px, 0) rotate(190deg); }
  100% { transform: translate3d(var(--leaf-drift), 122px, 0) rotate(390deg); opacity: 0; }
}

@keyframes mpb-motion-breeze-pass {
  from { transform: translate3d(-12vw, 0, 0); opacity: 0; }
  14%, 72% { opacity: 0.65; }
  to { transform: translate3d(124vw, -8px, 0); opacity: 0; }
}

@keyframes mpb-motion-storm-pulse {
  0%, 31%, 100% { opacity: 0.72; }
  34% { opacity: 1; }
  36% { opacity: 0.75; }
  39% { opacity: 0.96; }
  71% { opacity: 0.8; }
  73% { opacity: 1; }
}

@keyframes mpb-rain-sky-flash {
  0%, 31%, 33%, 36%, 39%, 70%, 72%, 75%, 100% { opacity: 0; }
  32%, 37%, 71%, 74% { opacity: 0.88; }
  34%, 38%, 73% { opacity: 0.3; }
}

@keyframes mpb-rain-cloudbank-drift {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(148vw, 6px, 0); }
}

@keyframes mpb-rain-wash-flash {
  0%, 31%, 33%, 36%, 39%, 70%, 72%, 75%, 100% { filter: brightness(1); }
  32%, 37%, 71%, 74% { filter: brightness(1.2) saturate(0.86); }
  34%, 38%, 73% { filter: brightness(1.06); }
}

@keyframes mpb-rain-lamp-flicker {
  0%, 64%, 68%, 100% { opacity: 0.92; }
  65%, 67% { opacity: 0.38; }
}

@keyframes mpb-motion-mist-drift {
  from { transform: translate3d(-2%, 4px, 0) scaleX(1); opacity: 0.48; }
  to { transform: translate3d(11%, -8px, 0) scaleX(1.08); opacity: 0.72; }
}

@keyframes mpb-motion-rain-cloud-bob {
  0%, 100% { transform: translateX(-50%) translateY(0) scale(1); }
  50% { transform: translateX(-50%) translateY(-7px) scale(1.04); }
}

@keyframes mpb-motion-trail-pop {
  0% { transform: translate3d(42px, 0, 0) scale(0.28); opacity: 0; }
  28% { opacity: 0.65; }
  100% { transform: translate3d(-34px, -14px, 0) scale(1.7); opacity: 0; }
}

@keyframes mpb-motion-ripple-out {
  0% { transform: translateX(-50%) scale(0.18); opacity: 0; }
  18% { opacity: 0.46; }
  100% { transform: translateX(-50%) scale(1.8); opacity: 0; }
}

@keyframes mpb-motion-confetti-fall {
  from { transform: translate3d(0, -12vh, 0) rotate(0deg); opacity: 0; }
  10% { opacity: 0.58; }
  86% { opacity: 0.42; }
  to { transform: translate3d(var(--confetti-drift), 118vh, 0) rotate(760deg); opacity: 0; }
}

@keyframes mpb-parade-spotlight-sweep {
  from { transform: rotate(-18deg) translateX(-8%); opacity: 0.26; }
  to { transform: rotate(19deg) translateX(10%); opacity: 0.58; }
}

@keyframes mpb-parade-lantern-sway {
  from { transform: rotate(-7deg); }
  to { transform: rotate(7deg); }
}

@keyframes mpb-parade-balloon-rise {
  0% { transform: translate3d(0, 18vh, 0) rotate(-4deg); opacity: 0; }
  12%, 78% { opacity: 0.5; }
  55% { transform: translate3d(var(--balloon-drift), -54vh, 0) rotate(5deg); }
  100% { transform: translate3d(var(--balloon-drift), -124vh, 0) rotate(-3deg); opacity: 0; }
}

@keyframes mpb-motion-bunting-sway {
  from { transform: rotate(-2deg) translateY(0); }
  to { transform: rotate(1deg) translateY(8px); }
}

@keyframes mpb-motion-parade-travel {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(148vw, 0, 0); }
}

@keyframes mpb-motion-card-bob {
  0%, 100% { transform: translateY(0) rotate(-1deg); }
  50% { transform: translateY(-18px) rotate(1deg); }
}

@keyframes mpb-motion-scene-breathe {
  from { background-position: 46% center; transform: scale(1) rotate(-1deg); }
  to { background-position: 56% center; transform: scale(1.045) rotate(1deg); }
}

@keyframes mpb-motion-scene-walk {
  from { background-position: 42% 48%; transform: scale(1.01) translate3d(-4px, 3px, 0); }
  to { background-position: 60% 52%; transform: scale(1.055) translate3d(8px, -5px, 0); }
}

@keyframes mpb-motion-scene-rain {
  from { background-position: 48% 45%; transform: scale(1.035) translate3d(0, 0, 0); filter: saturate(0.84) contrast(1.06) brightness(0.88); }
  to { background-position: 53% 55%; transform: scale(1.075) translate3d(-5px, 4px, 0); filter: saturate(0.94) contrast(1.1) brightness(0.78); }
}

@keyframes mpb-motion-scene-parade {
  from { background-position: 44% 52%; transform: scale(1.01) rotate(-0.35deg); filter: saturate(1.03); }
  to { background-position: 57% 48%; transform: scale(1.06) rotate(0.35deg); filter: saturate(1.18); }
}

.mpb-custom-media,
.mpb-custom-media img,
.mpb-custom-media video,
.mpb-custom-shade {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.mpb-custom-media {
  z-index: 0;
  background: #111827;
  transition: opacity 240ms ease;
}

.mpb-custom-media img,
.mpb-custom-media video {
  object-fit: cover;
}

.mpb-custom-shade {
  background:
    linear-gradient(180deg, rgba(11, 18, 34, 0.05), rgba(11, 18, 34, 0.18)),
    radial-gradient(circle at 50% 38%, transparent 42%, rgba(13, 20, 38, 0.18));
}

.music-page-bg.has-custom-media .mpb-orb {
  opacity: 0.2;
}

/* 自定义图片 / 视频是背景主角。主题色只保留轻微氛围，不能盖住媒体本身。 */
.music-page-bg.has-custom-media .mpb-theme-wash {
  z-index: 1;
  opacity: 0.1 !important;
  background: linear-gradient(180deg, rgba(8, 10, 18, 0.08), rgba(8, 10, 18, 0.18)) !important;
}

.music-page-bg.has-custom-media .mpb-custom-media video {
  display: block;
  visibility: visible;
}

/* 自定义媒体使用干净的经典主题：不叠加任何 IP 场景，只保留很轻的电影暗角。 */
.music-page-bg.classic-theme {
  background: #edf5fb;
}

.music-page-bg.classic-theme .mpb-orb,
.music-page-bg.classic-theme .mpb-notes,
.music-page-bg.classic-theme .mpb-sparkles {
  display: none;
}

.music-page-bg.classic-theme .mpb-theme-wash {
  opacity: 1;
  background:
    radial-gradient(circle at 12% 14%, rgba(255, 207, 113, 0.3), transparent 28%),
    radial-gradient(circle at 86% 18%, rgba(109, 194, 255, 0.28), transparent 30%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.82), rgba(225, 243, 255, 0.78) 52%, rgba(242, 235, 255, 0.72));
}

.music-page-bg.classic-theme .mpb-custom-shade {
  background:
    linear-gradient(180deg, rgba(5, 8, 14, 0.03) 0%, transparent 25%, transparent 72%, rgba(5, 8, 14, 0.26) 100%),
    radial-gradient(ellipse at center, transparent 48%, rgba(3, 6, 12, 0.16) 100%);
}

.music-page-bg.classic-theme--dark {
  background: #090b12;
}

.music-page-bg.classic-theme--dark .mpb-theme-wash {
  opacity: 1 !important;
  background:
    radial-gradient(circle at 78% 12%, rgba(100, 78, 167, 0.24), transparent 30%),
    radial-gradient(circle at 18% 82%, rgba(38, 111, 164, 0.18), transparent 32%),
    linear-gradient(145deg, #090c16, #151529 52%, #080a12) !important;
}

.music-page-bg.classic-theme--sunny .mpb-custom-shade {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent 45%, rgba(17, 62, 93, 0.08)),
    radial-gradient(ellipse at center, transparent 62%, rgba(37, 115, 164, 0.08));
}

.mpb-shinchan-elements {
  position: absolute;
  inset: 0;
}

/* Shinchan presets use their own scene language instead of one shared radio collage. */
.music-page-bg.ip-shinchan .mpb-listening-corner,
.music-page-bg.ip-shinchan .mpb-shinchan-postcard,
.music-page-bg.ip-shinchan .mpb-shinchan-bubble,
.music-page-bg.ip-shinchan .mpb-kasukabe-stamp,
.music-page-bg.ip-shinchan .mpb-comic-burst,
.music-page-bg.ip-shinchan .mpb-crayon {
  display: none;
}

.mpb-shinchan-signature {
  position: absolute;
  inset: 0;
  z-index: 2;
  overflow: hidden;
  opacity: 0.52;
}

.mpb-signature-caption {
  position: absolute;
  z-index: 5;
  left: clamp(34px, 4vw, 78px);
  bottom: 70px;
  padding: 0.38rem 0.7rem;
  border: 1px solid rgba(255, 255, 255, 0.48);
  border-radius: 999px;
  color: rgba(53, 67, 84, 0.5);
  background: rgba(255, 255, 255, 0.36);
  box-shadow: 0 8px 24px rgba(48, 61, 79, 0.08);
  font-size: 0.55rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  backdrop-filter: blur(8px);
}

/* Spring sky: rainbow arch, large sun, floating clouds and a hand-made kite. */
.mpb-sky-sun {
  position: absolute;
  top: 12%;
  left: 6%;
  width: clamp(92px, 9vw, 148px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 239, 132, 0.88) 0 45%, rgba(255, 216, 80, 0.42) 46% 62%, transparent 63%);
  box-shadow: 0 0 70px rgba(255, 213, 73, 0.34);
}

.mpb-sky-rainbow {
  position: absolute;
  left: -3vw;
  bottom: 106px;
  width: clamp(280px, 27vw, 460px);
  height: clamp(142px, 13vw, 224px);
  border: 16px solid rgba(242, 105, 123, 0.36);
  border-right-color: rgba(242, 105, 123, 0.36);
  border-bottom: 0;
  border-radius: 50% 50% 0 0 / 100% 100% 0 0;
  box-shadow:
    inset 0 14px 0 rgba(249, 186, 76, 0.38),
    inset 0 28px 0 rgba(113, 191, 128, 0.32),
    inset 0 42px 0 rgba(92, 172, 218, 0.32);
  transform: rotate(-4deg);
}

.mpb-sky-cloud {
  position: absolute;
  width: 118px;
  height: 35px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.66);
  filter: drop-shadow(0 10px 20px rgba(100, 159, 190, 0.12));
}

.mpb-sky-cloud::before,
.mpb-sky-cloud::after {
  content: '';
  position: absolute;
  bottom: 0;
  border-radius: 50%;
  background: inherit;
}

.mpb-sky-cloud::before { left: 18px; width: 50px; height: 50px; }
.mpb-sky-cloud::after { right: 17px; width: 64px; height: 64px; }
.mpb-sky-cloud--one { top: 20%; left: 25%; transform: scale(0.82); }
.mpb-sky-cloud--two { top: 9%; right: 18%; transform: scale(0.56); opacity: 0.74; }

.mpb-sky-kite {
  position: absolute;
  top: 21%;
  right: 42%;
  width: 48px;
  height: 48px;
  border: 2px solid rgba(69, 127, 168, 0.42);
  background: linear-gradient(135deg, rgba(245, 96, 107, 0.72) 0 50%, rgba(255, 214, 83, 0.76) 50%);
  transform: rotate(45deg);
}

.mpb-sky-kite::after {
  content: '';
  position: absolute;
  top: 40px;
  left: 39px;
  width: 130px;
  height: 88px;
  border-left: 2px dashed rgba(69, 127, 168, 0.36);
  border-radius: 50%;
  transform: rotate(-44deg);
}

/* Family picnic: a gingham cloth, basket, tableware and meadow flowers. */
.mpb-picnic-blanket {
  position: absolute;
  left: -4vw;
  bottom: 42px;
  width: clamp(350px, 35vw, 580px);
  height: clamp(220px, 30vh, 340px);
  border: 8px solid rgba(255, 255, 244, 0.48);
  border-radius: 36px 18px 48px 14px;
  background:
    repeating-linear-gradient(0deg, transparent 0 34px, rgba(235, 103, 94, 0.18) 35px 50px),
    repeating-linear-gradient(90deg, transparent 0 34px, rgba(235, 103, 94, 0.18) 35px 50px),
    rgba(255, 244, 211, 0.66);
  box-shadow: 0 22px 54px rgba(78, 124, 61, 0.14);
  transform: perspective(430px) rotateX(56deg) rotateZ(-5deg);
  transform-origin: bottom;
}

.mpb-picnic-basket {
  position: absolute;
  left: 7%;
  bottom: 92px;
  width: 142px;
  height: 86px;
  border: 4px solid rgba(120, 70, 39, 0.24);
  border-radius: 15px 15px 28px 28px;
  background:
    repeating-linear-gradient(0deg, transparent 0 8px, rgba(104, 61, 35, 0.13) 9px 11px),
    repeating-linear-gradient(90deg, transparent 0 12px, rgba(104, 61, 35, 0.15) 13px 16px),
    rgba(208, 138, 72, 0.72);
  box-shadow: 0 18px 30px rgba(89, 58, 34, 0.16);
}

.mpb-picnic-basket::before {
  content: '';
  position: absolute;
  left: 22px;
  top: -55px;
  width: 90px;
  height: 74px;
  border: 9px solid rgba(139, 83, 43, 0.58);
  border-bottom: 0;
  border-radius: 70px 70px 0 0;
}

.mpb-picnic-basket i {
  position: absolute;
  top: -4px;
  left: 0;
  width: 100%;
  height: 14px;
  border-radius: 999px;
  background: rgba(250, 214, 149, 0.7);
}

.mpb-picnic-plate {
  position: absolute;
  left: 20%;
  bottom: 103px;
  width: 76px;
  height: 38px;
  border: 7px solid rgba(255, 255, 255, 0.68);
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(245, 187, 77, 0.6) 0 28%, rgba(255, 247, 215, 0.72) 30% 100%);
  transform: rotate(7deg);
}

.mpb-picnic-flower {
  position: absolute;
  bottom: 92px;
  width: 10px;
  height: 58px;
  border-radius: 999px;
  background: rgba(79, 143, 72, 0.55);
}

.mpb-picnic-flower::before {
  content: '✿';
  position: absolute;
  top: -20px;
  left: -8px;
  color: rgba(255, 208, 75, 0.88);
  font-size: 27px;
  line-height: 1;
}

.mpb-picnic-flower--one { left: 2%; transform: rotate(-9deg); }
.mpb-picnic-flower--two { left: 27%; bottom: 74px; transform: scale(0.8) rotate(11deg); }
.mpb-picnic-flower--three { right: 3%; bottom: 83px; transform: scale(0.72) rotate(-8deg); }

/* After-school sunset: school silhouettes, warm clouds, birds and quiet utility wires. */
.mpb-sunset-sun {
  position: absolute;
  top: 10%;
  right: 8%;
  width: clamp(118px, 12vw, 194px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 240, 171, 0.95) 0 47%, rgba(255, 169, 105, 0.4) 48% 66%, transparent 68%);
  box-shadow: 0 0 110px rgba(255, 139, 96, 0.4);
}

.mpb-sunset-cloud {
  position: absolute;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(90deg, transparent, rgba(255, 226, 208, 0.54) 18% 76%, transparent);
  filter: blur(1px);
  transform: rotate(-3deg);
}

.mpb-sunset-cloud--one {
  top: 22%;
  left: 5%;
  width: 46%;
}

.mpb-sunset-cloud--two {
  top: 31%;
  right: 13%;
  width: 34%;
  height: 19px;
  opacity: 0.68;
  transform: rotate(2deg);
}

.mpb-sunset-campus {
  position: absolute;
  left: -1%;
  bottom: 48px;
  width: clamp(310px, 36vw, 590px);
  height: clamp(145px, 23vh, 230px);
  border-top: 6px solid rgba(93, 65, 77, 0.2);
  border-radius: 7px 7px 0 0;
  background:
    repeating-linear-gradient(90deg, transparent 0 38px, rgba(255, 212, 150, 0.36) 39px 58px, transparent 59px 80px),
    repeating-linear-gradient(0deg, transparent 0 42px, rgba(87, 57, 69, 0.14) 43px 47px),
    linear-gradient(180deg, rgba(137, 83, 91, 0.3), rgba(81, 58, 76, 0.44));
  box-shadow: 0 -24px 60px rgba(255, 162, 105, 0.1);
}

.mpb-sunset-campus::before {
  content: '';
  position: absolute;
  left: 4%;
  top: -72px;
  width: 62%;
  height: 76px;
  clip-path: polygon(8% 100%, 17% 22%, 84% 0, 100% 100%);
  background: linear-gradient(160deg, rgba(104, 66, 77, 0.36), rgba(70, 55, 72, 0.46));
}

.mpb-sunset-campus::after {
  content: '';
  position: absolute;
  left: 12%;
  top: 24%;
  width: 42px;
  height: 42px;
  border: 5px solid rgba(255, 220, 164, 0.34);
  border-radius: 50%;
  background: rgba(104, 68, 80, 0.34);
  box-shadow: 0 0 26px rgba(255, 176, 108, 0.16);
}

.mpb-sunset-campus i {
  position: absolute;
  right: 8%;
  bottom: 0;
  width: 31%;
  height: 68%;
  border-radius: 4px 4px 0 0;
  background:
    repeating-linear-gradient(90deg, transparent 0 27px, rgba(255, 211, 147, 0.28) 28px 42px, transparent 43px 58px),
    linear-gradient(180deg, rgba(116, 72, 84, 0.3), rgba(71, 55, 73, 0.42));
}

.mpb-sunset-campus b {
  position: absolute;
  left: 48%;
  top: -48px;
  width: 46px;
  height: 48px;
  border-radius: 4px 4px 0 0;
  background: rgba(90, 61, 76, 0.4);
}

.mpb-sunset-campus b::before {
  content: '';
  position: absolute;
  left: 14px;
  top: -28px;
  border-right: 9px solid transparent;
  border-bottom: 30px solid rgba(84, 58, 72, 0.42);
  border-left: 9px solid transparent;
}

.mpb-sunset-fence {
  position: absolute;
  right: -2%;
  bottom: 48px;
  width: 64%;
  height: 104px;
  border-top: 7px solid rgba(85, 66, 77, 0.25);
  border-bottom: 7px solid rgba(85, 66, 77, 0.19);
  background: repeating-linear-gradient(90deg, transparent 0 54px, rgba(85, 66, 77, 0.22) 55px 62px);
  transform: perspective(420px) rotateX(8deg) rotate(-1deg);
}

.mpb-sunset-wire {
  position: absolute;
  top: 18%;
  left: -4%;
  width: 108%;
  height: 19%;
  border-top: 2px solid rgba(79, 58, 73, 0.22);
  border-radius: 50%;
  transform: rotate(1deg);
}

.mpb-sunset-wire--two { top: 24%; opacity: 0.72; transform: rotate(-1deg) scaleY(0.72); }

.mpb-sunset-birds {
  position: absolute;
  top: 14%;
  left: 34%;
  width: 190px;
  height: 90px;
}

.mpb-sunset-birds i {
  position: absolute;
  width: 30px;
  height: 15px;
  border-top: 3px solid rgba(91, 65, 77, 0.36);
  border-radius: 50%;
  transform: rotate(13deg);
}

.mpb-sunset-birds i::after {
  content: '';
  position: absolute;
  top: -3px;
  left: 24px;
  width: 30px;
  height: 15px;
  border-top: 3px solid rgba(91, 65, 77, 0.36);
  border-radius: 50%;
  transform: rotate(-26deg);
}

.mpb-sunset-birds i:nth-child(1) { left: 0; top: 42px; }
.mpb-sunset-birds i:nth-child(2) { left: 72px; top: 12px; transform: scale(.72) rotate(8deg); }
.mpb-sunset-birds i:nth-child(3) { right: 0; top: 54px; transform: scale(.58) rotate(18deg); }

.mpb-sunset-leaves {
  position: absolute;
  inset: 0;
}

.mpb-sunset-leaves i {
  position: absolute;
  width: 17px;
  height: 9px;
  border-radius: 100% 0 100% 0;
  background: rgba(225, 121, 74, 0.48);
  transform: rotate(28deg);
}

.mpb-sunset-leaves i:nth-child(1) { left: 8%; top: 42%; }
.mpb-sunset-leaves i:nth-child(2) { left: 24%; top: 19%; transform: scale(.7) rotate(-18deg); }
.mpb-sunset-leaves i:nth-child(3) { right: 29%; top: 34%; background: rgba(239, 170, 74, .5); }
.mpb-sunset-leaves i:nth-child(4) { right: 17%; top: 52%; transform: scale(.76) rotate(61deg); }
.mpb-sunset-leaves i:nth-child(5) { left: 47%; top: 27%; transform: scale(.6) rotate(-42deg); }

/* Night radio: radio tower, frequency waves, moon and constellation. */
.mpb-radio-moon {
  position: absolute;
  top: 12%;
  left: 7%;
  width: clamp(100px, 10vw, 164px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: rgba(255, 235, 174, 0.82);
  box-shadow: 0 0 60px rgba(255, 220, 130, 0.24);
}

.mpb-radio-moon::after {
  content: '';
  position: absolute;
  top: -13px;
  left: 30px;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #24345d;
}

.mpb-radio-tower {
  position: absolute;
  left: 13%;
  bottom: 76px;
  width: 100px;
  height: 260px;
  clip-path: polygon(47% 0, 53% 0, 86% 100%, 70% 100%, 60% 70%, 40% 70%, 30% 100%, 14% 100%);
  background:
    repeating-linear-gradient(145deg, transparent 0 17px, rgba(236, 214, 176, 0.22) 18px 22px),
    repeating-linear-gradient(35deg, transparent 0 17px, rgba(236, 214, 176, 0.22) 18px 22px);
  border-bottom: 8px solid rgba(236, 214, 176, 0.28);
}

.mpb-radio-tower::before {
  content: '';
  position: absolute;
  top: 0;
  left: 47px;
  width: 6px;
  height: 100%;
  background: rgba(236, 214, 176, 0.4);
}

.mpb-radio-tower i,
.mpb-radio-tower b {
  position: absolute;
  left: 45px;
  border-radius: 50%;
}

.mpb-radio-tower i {
  top: 4px;
  width: 12px;
  height: 12px;
  background: #ef6573;
  box-shadow: 0 0 20px rgba(239, 101, 115, 0.82);
}

.mpb-radio-tower b {
  top: 44px;
  width: 10px;
  height: 10px;
  background: rgba(255, 231, 160, 0.72);
}

.mpb-radio-wave {
  position: absolute;
  left: calc(13% + 11px);
  bottom: 264px;
  width: 78px;
  height: 78px;
  border: 3px solid rgba(117, 177, 232, 0.34);
  border-bottom-color: transparent;
  border-left-color: transparent;
  border-radius: 50%;
  transform: rotate(-45deg);
}

.mpb-radio-wave--two {
  left: calc(13% - 17px);
  bottom: 237px;
  width: 132px;
  height: 132px;
  opacity: 0.72;
}

.mpb-radio-frequency {
  position: absolute;
  left: 6%;
  bottom: 98px;
  color: rgba(255, 227, 154, 0.64);
  font-family: monospace;
  font-size: clamp(1.7rem, 3vw, 3.7rem);
  font-weight: 800;
  letter-spacing: 0.08em;
}

.mpb-radio-constellation {
  position: absolute;
  top: 13%;
  right: 34%;
  width: 210px;
  height: 126px;
  border-top: 1px solid rgba(193, 217, 255, 0.24);
  transform: rotate(14deg);
}

.mpb-radio-constellation i {
  position: absolute;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(255, 240, 189, 0.82);
  box-shadow: 0 0 10px rgba(255, 228, 154, 0.5);
}

.mpb-radio-constellation i:nth-child(1) { left: 0; top: -4px; }
.mpb-radio-constellation i:nth-child(2) { left: 28%; top: 34px; }
.mpb-radio-constellation i:nth-child(3) { left: 64%; top: 12px; }
.mpb-radio-constellation i:nth-child(4) { right: 0; top: 67px; }

/* Crayon room: a large taped sketch sheet, wax strokes and a drawn floor. */
.mpb-doodle-paper {
  position: absolute;
  left: 3.5vw;
  bottom: 80px;
  width: clamp(330px, 34vw, 570px);
  height: clamp(310px, 48vh, 500px);
  border: 4px solid rgba(230, 155, 98, 0.34);
  border-radius: 4% 8% 5% 3% / 6% 4% 8% 5%;
  background:
    repeating-linear-gradient(0deg, transparent 0 30px, rgba(112, 169, 198, 0.13) 31px 33px),
    linear-gradient(90deg, transparent 0 52px, rgba(238, 112, 119, 0.16) 53px 56px, transparent 57px),
    rgba(255, 251, 225, 0.82);
  box-shadow: 14px 18px 0 rgba(231, 142, 117, 0.11), 0 24px 60px rgba(113, 73, 46, 0.12);
  transform: rotate(-2.2deg);
}

.mpb-doodle-tape {
  position: absolute;
  top: -17px;
  left: 38%;
  width: 110px;
  height: 31px;
  background: rgba(247, 195, 105, 0.5);
  transform: rotate(3deg);
}

.mpb-doodle-paper b {
  position: absolute;
  left: 16%;
  top: 12%;
  color: rgba(235, 94, 90, 0.62);
  font-family: cursive;
  font-size: clamp(1rem, 1.6vw, 1.65rem);
  letter-spacing: 0.08em;
  transform: rotate(-5deg);
}

.mpb-doodle-house {
  position: absolute;
  left: 18%;
  bottom: 18%;
  width: 132px;
  height: 112px;
  border: 7px solid rgba(76, 140, 178, 0.48);
  border-top: 0;
  transform: rotate(-2deg);
}

.mpb-doodle-house::before {
  content: '';
  position: absolute;
  left: -1px;
  top: -61px;
  width: 94px;
  height: 94px;
  border-top: 8px solid rgba(234, 89, 93, 0.54);
  border-left: 8px solid rgba(234, 89, 93, 0.54);
  transform: rotate(45deg);
}

.mpb-doodle-house::after {
  content: '';
  position: absolute;
  right: 17px;
  bottom: 0;
  width: 35px;
  height: 58px;
  border: 6px solid rgba(245, 177, 61, 0.55);
  border-bottom: 0;
}

.mpb-doodle-flower {
  position: absolute;
  right: 17%;
  bottom: 18%;
  width: 8px;
  height: 86px;
  border-radius: 999px;
  background: rgba(84, 164, 102, 0.54);
  transform: rotate(5deg);
}

.mpb-doodle-flower::before {
  content: '✿';
  position: absolute;
  left: -27px;
  top: -42px;
  color: rgba(237, 93, 143, 0.62);
  font-size: 58px;
  line-height: 1;
}

.mpb-doodle-sun {
  position: absolute;
  top: 23%;
  right: 17%;
  width: 60px;
  height: 60px;
  border: 8px solid rgba(245, 186, 51, 0.58);
  border-radius: 50%;
  box-shadow: 0 -24px 0 -21px #efaf31, 0 24px 0 -21px #efaf31, 24px 0 0 -21px #efaf31, -24px 0 0 -21px #efaf31;
}

.mpb-doodle-spiral {
  position: absolute;
  right: 8%;
  top: 47%;
  width: 78px;
  height: 48px;
  border: 6px solid rgba(121, 103, 187, 0.42);
  border-left-color: transparent;
  border-radius: 50%;
  transform: rotate(13deg);
}

.mpb-doodle-floor {
  position: absolute;
  inset: auto 0 48px;
  height: 34%;
  background:
    repeating-linear-gradient(90deg, transparent 0 112px, rgba(165, 107, 70, 0.09) 113px 117px),
    linear-gradient(rgba(224, 167, 115, 0.14), rgba(217, 151, 101, 0.06));
  clip-path: polygon(0 24%, 100% 0, 100% 100%, 0 100%);
}

.mpb-doodle-crayon {
  position: absolute;
  width: 20px;
  height: 132px;
  border-radius: 5px;
  box-shadow: inset 0 -22px rgba(255, 255, 255, 0.18), 0 10px 18px rgba(84, 58, 42, 0.12);
}

.mpb-doodle-crayon::before {
  content: '';
  position: absolute;
  top: -20px;
  left: 0;
  border-right: 10px solid transparent;
  border-bottom: 22px solid currentColor;
  border-left: 10px solid transparent;
}

.mpb-doodle-crayon--red { right: 7%; bottom: 88px; color: #ed6561; background: #ed6561; transform: rotate(18deg); }
.mpb-doodle-crayon--blue { right: 11%; bottom: 72px; color: #58a8cf; background: #58a8cf; transform: rotate(6deg); }
.mpb-doodle-crayon--yellow { right: 15%; bottom: 83px; color: #edbd42; background: #edbd42; transform: rotate(-10deg); }

/* Rainy day: the artwork becomes a window view with glass, drops, umbrella and puddles. */
.mpb-rain-window {
  position: absolute;
  right: 4vw;
  bottom: 70px;
  width: clamp(310px, 34vw, 560px);
  height: clamp(300px, 54vh, 500px);
  border: 13px solid rgba(226, 239, 244, 0.58);
  border-radius: 34px 34px 14px 14px;
  box-shadow: inset 0 0 0 2px rgba(92, 135, 159, 0.18), 0 26px 60px rgba(48, 82, 102, 0.16);
}

.mpb-rain-window::before,
.mpb-rain-window::after {
  content: '';
  position: absolute;
  z-index: 2;
  background: rgba(225, 239, 246, 0.56);
  box-shadow: 0 0 0 1px rgba(104, 144, 168, 0.1);
}

.mpb-rain-window::before { top: 0; left: 49%; width: 12px; height: 100%; }
.mpb-rain-window::after { top: 48%; left: 0; width: 100%; height: 12px; }

.mpb-rain-window i,
.mpb-rain-window b {
  position: absolute;
  z-index: 3;
  width: 7px;
  height: 46px;
  border-radius: 50% 50% 60% 60%;
  background: linear-gradient(90deg, rgba(255,255,255,.16), rgba(83, 147, 183, 0.38));
  transform: rotate(11deg);
}

.mpb-rain-window i { top: 12%; left: 18%; }
.mpb-rain-window b { top: 62%; right: 19%; height: 68px; transform: rotate(-8deg); }

.mpb-rain-umbrella {
  position: absolute;
  left: 5%;
  bottom: 128px;
  width: clamp(180px, 19vw, 310px);
  height: clamp(90px, 10vw, 160px);
  border-radius: 50% 50% 12% 12% / 100% 100% 18% 18%;
  background:
    linear-gradient(90deg, transparent 49%, rgba(255,255,255,.32) 50% 51%, transparent 52%),
    repeating-linear-gradient(90deg, rgba(84, 153, 190, 0.66) 0 20%, rgba(246, 191, 87, 0.68) 20% 40%);
  box-shadow: 0 16px 38px rgba(64, 99, 121, 0.16);
}

.mpb-rain-umbrella::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 82%;
  width: 7px;
  height: 132px;
  border-right: 6px solid rgba(77, 101, 115, 0.52);
  border-bottom: 6px solid rgba(77, 101, 115, 0.52);
  border-radius: 0 0 18px 0;
}

.mpb-rain-puddle {
  position: absolute;
  left: 2%;
  bottom: 52px;
  width: 34%;
  height: 58px;
  border: 4px solid rgba(99, 163, 194, 0.28);
  border-radius: 50%;
  box-shadow: inset 0 0 0 12px rgba(137, 190, 215, 0.09), 0 0 30px rgba(92, 149, 179, 0.14);
  transform: rotate(-2deg);
}

.mpb-rain-drop {
  position: absolute;
  width: 6px;
  height: 54px;
  border-radius: 999px;
  background: linear-gradient(transparent, rgba(76, 146, 184, 0.44));
  transform: rotate(12deg);
}

.mpb-rain-drop--one { left: 3%; top: 18%; }
.mpb-rain-drop--two { left: 23%; top: 9%; height: 80px; }
.mpb-rain-drop--three { left: 44%; top: 31%; }
.mpb-rain-drop--four { right: 37%; top: 12%; height: 72px; }
.mpb-rain-drop--five { right: 3%; top: 38%; height: 92px; }

/* Midnight cinema: projector, light cone, screen, film strip and marquee. */
.mpb-cinema-projector {
  position: absolute;
  left: 6%;
  bottom: 112px;
  z-index: 4;
  width: 180px;
  height: 116px;
  border: 4px solid rgba(247, 211, 151, 0.28);
  border-radius: 16px;
  background: linear-gradient(145deg, rgba(54, 49, 48, 0.9), rgba(16, 17, 21, 0.95));
  box-shadow: 0 22px 48px rgba(0, 0, 0, 0.38);
}

.mpb-cinema-projector::before,
.mpb-cinema-projector::after {
  content: '';
  position: absolute;
  top: -70px;
  width: 84px;
  height: 84px;
  border: 9px solid rgba(215, 178, 117, 0.34);
  border-radius: 50%;
  background: repeating-radial-gradient(circle, #222 0 8px, #785d42 9px 11px, #17191e 12px 18px);
}

.mpb-cinema-projector::before { left: 0; }
.mpb-cinema-projector::after { right: 0; }

.mpb-cinema-projector i {
  position: absolute;
  right: -31px;
  top: 23px;
  width: 34px;
  height: 58px;
  border-radius: 0 12px 12px 0;
  background: rgba(70, 62, 56, 0.95);
}

.mpb-cinema-projector b {
  position: absolute;
  left: 20px;
  bottom: -22px;
  width: 140px;
  height: 24px;
  border-radius: 0 0 8px 8px;
  background: rgba(24, 24, 28, 0.95);
}

.mpb-cinema-beam {
  position: absolute;
  left: calc(6% + 178px);
  bottom: 130px;
  z-index: 1;
  width: 58%;
  height: 320px;
  clip-path: polygon(0 42%, 100% 0, 100% 100%, 0 58%);
  background: linear-gradient(90deg, rgba(250, 215, 151, 0.22), rgba(255, 230, 176, 0.05));
  filter: blur(1px);
}

.mpb-cinema-film {
  position: absolute;
  left: -2%;
  bottom: 48px;
  width: 106%;
  height: 66px;
  border-top: 2px solid rgba(232, 195, 133, 0.2);
  border-bottom: 2px solid rgba(232, 195, 133, 0.2);
  background:
    repeating-linear-gradient(90deg, transparent 0 24px, rgba(235, 201, 145, 0.27) 25px 41px, transparent 42px 66px),
    linear-gradient(180deg, rgba(7, 9, 12, 0.7) 0 18px, transparent 19px 47px, rgba(7, 9, 12, 0.7) 48px);
  transform: rotate(-1.5deg);
}

.mpb-cinema-marquee {
  position: absolute;
  left: 7%;
  top: 15%;
  padding: 0.8rem 1.2rem;
  border: 2px solid rgba(232, 190, 119, 0.42);
  color: rgba(255, 226, 173, 0.72);
  background: rgba(62, 20, 27, 0.5);
  box-shadow: 8px 8px 0 rgba(128, 38, 49, 0.18);
  font-family: Georgia, serif;
  font-size: clamp(1rem, 1.6vw, 1.55rem);
  line-height: 1.12;
  letter-spacing: 0.18em;
  text-align: center;
  transform: rotate(-2deg);
}

.mpb-shinchan-signature--starry-radio .mpb-signature-caption,
.mpb-shinchan-signature--midnight-cinema .mpb-signature-caption {
  border-color: rgba(255, 224, 170, 0.18);
  color: rgba(255, 230, 185, 0.58);
  background: rgba(16, 22, 37, 0.44);
}

.music-page-bg.preset-crayon-room .mpb-note,
.music-page-bg.preset-rainy-day .mpb-note,
.music-page-bg.preset-sunset-road .mpb-note,
.music-page-bg.preset-midnight-cinema .mpb-note {
  display: none;
}

.music-page-bg.preset-kasukabe-sky .mpb-theme-scene {
  right: 4vw;
  bottom: 86px;
  width: clamp(310px, 34vw, 560px);
  height: clamp(220px, 30vw, 390px);
  border: 10px solid rgba(255, 255, 255, 0.58);
  border-radius: 52% 44% 18% 48% / 42% 50% 22% 46%;
  opacity: 0.28;
  transform: rotate(-2deg);
}

.music-page-bg.preset-family-picnic .mpb-theme-scene {
  right: 3vw;
  bottom: 82px;
  width: clamp(330px, 38vw, 620px);
  height: clamp(230px, 28vw, 390px);
  border: 11px solid rgba(255, 251, 225, 0.58);
  border-radius: 70px 24px 70px 20px;
  opacity: 0.28;
  transform: rotate(1.2deg);
}

.music-page-bg.preset-sunset-road .mpb-theme-scene {
  right: 4vw;
  bottom: 86px;
  left: auto;
  width: clamp(330px, 38vw, 620px);
  height: clamp(220px, 27vw, 380px);
  border: 8px solid rgba(255, 230, 203, 0.38);
  border-radius: 44px 18px 44px 18px;
  opacity: 0.22;
  filter: saturate(1.08) contrast(1.05);
  box-shadow: 0 26px 70px rgba(111, 66, 74, 0.16);
  transform: rotate(1deg);
}

.music-page-bg.preset-starry-radio .mpb-theme-scene {
  right: 5vw;
  bottom: 84px;
  width: clamp(300px, 31vw, 510px);
  height: auto;
  aspect-ratio: 1;
  border: 12px solid rgba(230, 221, 196, 0.16);
  border-radius: 50%;
  opacity: 0.34;
  filter: saturate(1.08) contrast(1.08) brightness(0.82);
  transform: rotate(2deg);
}

.music-page-bg.preset-crayon-room .mpb-theme-scene {
  right: 3vw;
  bottom: 88px;
  left: auto;
  width: clamp(300px, 31vw, 520px);
  height: clamp(250px, 43vh, 430px);
  border: 7px dashed rgba(234, 117, 102, 0.38);
  border-radius: 19px 43px 21px 35px;
  opacity: 0.25;
  filter: saturate(0.92) contrast(1.03);
  box-shadow: 12px 16px 0 rgba(89, 164, 184, 0.1), 0 25px 60px rgba(92, 60, 43, 0.12);
  transform: rotate(2.2deg);
}

.music-page-bg.preset-rainy-day .mpb-theme-scene {
  right: 4vw;
  bottom: 70px;
  left: auto;
  width: clamp(310px, 34vw, 560px);
  height: clamp(300px, 54vh, 500px);
  border: 15px solid rgba(223, 238, 246, 0.42);
  border-radius: 34px 34px 14px 14px;
  opacity: 0.24;
  filter: saturate(0.82) contrast(1.05);
  transform: none;
}

.music-page-bg.preset-midnight-cinema .mpb-theme-scene {
  right: 6vw;
  bottom: 116px;
  left: auto;
  width: clamp(430px, 47vw, 760px);
  height: clamp(240px, 30vw, 420px);
  border: 15px solid rgba(31, 28, 29, 0.94);
  border-top-color: rgba(86, 69, 55, 0.9);
  border-radius: 5px;
  opacity: 0.4;
  filter: saturate(0.82) contrast(1.1) brightness(0.7);
  box-shadow: 0 0 0 3px rgba(236, 199, 132, 0.2), 0 30px 80px rgba(0, 0, 0, 0.48);
  transform: none;
}

.mpb-shinchan-postcard {
  position: absolute;
  overflow: hidden;
  border: 6px solid rgba(255, 255, 255, 0.68);
  border-radius: 24px;
  background-position: center;
  background-size: cover;
  box-shadow: 0 16px 40px rgba(43, 55, 86, 0.14);
  opacity: 0.2;
}

.mpb-shinchan-postcard--1 {
  right: 2.4vw;
  bottom: 82px;
  width: clamp(130px, 14vw, 210px);
  aspect-ratio: 1.42;
  background-image: url('/images/shinchan-playlists/cover-01.jpg');
  transform: rotate(-5deg);
}

.mpb-shinchan-postcard--2 {
  top: 19%;
  left: -42px;
  width: clamp(120px, 12vw, 178px);
  aspect-ratio: 1;
  border-radius: 50%;
  background-image: url('/images/shinchan-playlists/cover-09.jpg');
  transform: rotate(7deg);
  opacity: 0.13;
}

.mpb-shinchan-postcard--3 {
  top: 8%;
  right: 23%;
  width: clamp(92px, 8vw, 138px);
  aspect-ratio: 1.15;
  background-image: url('/images/shinchan-playlists/cover-04.jpg');
  transform: rotate(5deg);
  opacity: 0.1;
}

.mpb-shinchan-postcard--4 {
  bottom: 15%;
  left: 18%;
  width: clamp(104px, 10vw, 164px);
  aspect-ratio: 1.36;
  background-image: url('/images/shinchan-playlists/cover-07.jpg');
  transform: rotate(-7deg);
  opacity: 0.12;
}

.mpb-shinchan-postcard--5 {
  top: 46%;
  right: -36px;
  width: clamp(118px, 11vw, 180px);
  aspect-ratio: 1;
  border-radius: 50%;
  background-image: url('/images/shinchan-playlists/cover-12.jpg');
  transform: rotate(8deg);
  opacity: 0.1;
}

.mpb-shinchan-postcard--6 {
  bottom: -38px;
  left: 45%;
  width: clamp(130px, 13vw, 210px);
  aspect-ratio: 1.5;
  background-image: url('/images/shinchan-playlists/cover-16.jpg');
  transform: rotate(2deg);
  opacity: 0.09;
}

.mpb-shinchan-bubble {
  position: absolute;
  right: clamp(26px, 4vw, 72px);
  bottom: 222px;
  padding: 0.48rem 0.8rem;
  border-radius: 18px 18px 5px 18px;
  color: rgba(62, 72, 96, 0.48);
  background: rgba(255, 255, 255, 0.48);
  box-shadow: 0 8px 26px rgba(51, 65, 96, 0.1);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  transform: rotate(2deg);
}

.mpb-shinchan-bubble--family {
  top: 14%;
  right: auto;
  bottom: auto;
  left: 7%;
  border-radius: 18px 18px 18px 5px;
  transform: rotate(-3deg);
  opacity: 0.72;
}

.mpb-shinchan-bubble--shiro {
  right: 14%;
  bottom: 15%;
  transform: rotate(-2deg);
  opacity: 0.68;
}

.mpb-kasukabe-stamp {
  position: absolute;
  top: 35%;
  left: 2.8%;
  padding: 0.65rem 0.72rem;
  border: 2px dashed rgba(255, 91, 110, 0.2);
  border-radius: 50%;
  color: rgba(255, 91, 110, 0.28);
  font-size: 0.56rem;
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: 0.12em;
  text-align: center;
  transform: rotate(-12deg);
}

.mpb-comic-burst {
  position: absolute;
  top: 12%;
  left: 42%;
  color: rgba(64, 77, 105, 0.22);
  font-size: clamp(0.76rem, 1vw, 0.98rem);
  font-weight: 900;
  letter-spacing: 0.08em;
  transform: rotate(7deg);
}

.mpb-crayon {
  position: absolute;
  width: 6px;
  height: 42px;
  border-radius: 4px;
  opacity: 0.24;
  box-shadow: inset 0 -8px rgba(255, 255, 255, 0.24);
}

.mpb-crayon::before {
  content: '';
  position: absolute;
  top: -7px;
  left: 0;
  border-right: 3px solid transparent;
  border-bottom: 7px solid currentColor;
  border-left: 3px solid transparent;
}

.mpb-crayon--red { top: 28%; right: 8%; color: #ff6173; background: #ff6173; transform: rotate(28deg); }
.mpb-crayon--yellow { top: 12%; left: 20%; color: #f4c83f; background: #f4c83f; transform: rotate(-18deg); }
.mpb-crayon--blue { bottom: 20%; left: 8%; color: #5dbce8; background: #5dbce8; transform: rotate(12deg); }

.mpb-listening-corner {
  position: absolute;
  left: clamp(28px, 4vw, 78px);
  bottom: 92px;
  z-index: 2;
  width: clamp(280px, 23vw, 372px);
  height: clamp(300px, 34vh, 388px);
  color: rgba(54, 67, 88, 0.66);
  opacity: 0.58;
  transform: rotate(-1.2deg);
  transform-origin: 30% 80%;
  transition: opacity 300ms ease, transform 300ms ease;
}

.mpb-listening-corner::before {
  content: '';
  position: absolute;
  inset: 18px 7px 9px 12px;
  border: 1px dashed rgba(86, 115, 125, 0.18);
  border-radius: 46% 38% 43% 36%;
  background:
    radial-gradient(circle at 15% 12%, rgba(255, 212, 95, 0.18), transparent 28%),
    radial-gradient(circle at 85% 78%, rgba(104, 188, 202, 0.14), transparent 33%);
  transform: rotate(3deg);
}

.mpb-listening-corner::after {
  content: '♪  CRAYON RADIO  ♫';
  position: absolute;
  left: 16px;
  bottom: 4px;
  color: rgba(81, 111, 120, 0.33);
  font-size: 0.56rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  transform: rotate(-4deg);
}

.mpb-corner-orbit {
  position: absolute;
  inset: 7px 0 18px 4px;
  border: 2px solid rgba(238, 151, 82, 0.13);
  border-right-color: transparent;
  border-bottom-color: rgba(91, 170, 185, 0.1);
  border-radius: 48% 42% 52% 38%;
  transform: rotate(-5deg);
}

.mpb-corner-orbit::before,
.mpb-corner-orbit::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: #ef9a67;
  box-shadow: 0 0 0 5px rgba(239, 154, 103, 0.08);
}

.mpb-corner-orbit::before {
  top: 18px;
  right: 28px;
  width: 7px;
  height: 7px;
}

.mpb-corner-orbit::after {
  left: 25px;
  bottom: 46px;
  width: 5px;
  height: 5px;
  background: #70b2c5;
  box-shadow: 0 0 0 5px rgba(112, 178, 197, 0.08);
}

.mpb-corner-note {
  position: absolute;
  top: 1px;
  left: 24px;
  z-index: 3;
  width: 190px;
  min-height: 76px;
  padding: 0.78rem 0.9rem 0.7rem;
  border: 1px solid rgba(255, 255, 255, 0.66);
  border-radius: 8px 20px 18px 20px;
  background: rgba(255, 252, 237, 0.56);
  box-shadow: 0 14px 35px rgba(55, 68, 82, 0.11), inset 0 1px rgba(255, 255, 255, 0.68);
  backdrop-filter: blur(12px);
  transform: rotate(-3deg);
}

.mpb-corner-note::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 63px;
  width: 58px;
  height: 16px;
  background: rgba(247, 201, 126, 0.42);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.24);
  transform: rotate(2deg);
}

.mpb-corner-note small,
.mpb-corner-note strong {
  display: block;
}

.mpb-corner-note small {
  color: rgba(112, 96, 74, 0.54);
  font-size: 0.51rem;
  font-weight: 900;
  letter-spacing: 0.14em;
}

.mpb-corner-note strong {
  max-width: 126px;
  margin-top: 0.28rem;
  overflow: hidden;
  font-size: 0.83rem;
  letter-spacing: 0.06em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mpb-corner-note em {
  position: absolute;
  right: 9px;
  bottom: 9px;
  padding: 0.2rem 0.38rem;
  border: 1px solid rgba(232, 95, 88, 0.26);
  border-radius: 999px;
  color: rgba(213, 70, 65, 0.68);
  background: rgba(255, 255, 255, 0.34);
  font-size: 0.44rem;
  font-style: normal;
  font-weight: 900;
  letter-spacing: 0.1em;
}

.mpb-corner-gallery {
  position: absolute;
  top: 72px;
  right: 4px;
  z-index: 2;
  width: 180px;
  height: 150px;
}

.mpb-corner-photo {
  position: absolute;
  top: 0;
  right: 0;
  width: 112px;
  height: 88px;
  border: 7px solid rgba(255, 255, 255, 0.74);
  border-bottom-width: 18px;
  border-radius: 9px;
  background-position: center;
  background-size: cover;
  box-shadow: 0 12px 26px rgba(47, 62, 79, 0.14);
  transform: rotate(-5deg);
}

.mpb-corner-photo:nth-child(2) {
  top: 40px;
  right: 58px;
  transform: rotate(5deg);
}

.mpb-corner-photo i {
  position: absolute;
  right: -3px;
  bottom: -16px;
  color: rgba(67, 77, 91, 0.48);
  font-size: 0.5rem;
  font-style: normal;
  font-weight: 900;
  letter-spacing: 0.1em;
}

.mpb-corner-radio {
  position: absolute;
  left: 35px;
  bottom: 48px;
  z-index: 3;
  width: 158px;
  height: 94px;
  border: 2px solid rgba(118, 91, 63, 0.22);
  border-radius: 19px 25px 20px 17px;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.25), transparent 24%),
    linear-gradient(145deg, rgba(239, 178, 84, 0.8), rgba(221, 111, 77, 0.72));
  box-shadow: 0 15px 35px rgba(80, 58, 38, 0.16), inset 0 2px rgba(255, 247, 216, 0.48);
  transform: rotate(2deg);
}

.mpb-corner-radio-antenna {
  position: absolute;
  left: 21px;
  top: -49px;
  width: 3px;
  height: 55px;
  border-radius: 999px;
  background: rgba(73, 74, 78, 0.54);
  transform: rotate(-25deg);
  transform-origin: bottom;
}

.mpb-corner-radio-antenna::after {
  content: '';
  position: absolute;
  top: -4px;
  left: -3px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #f3d05e;
  box-shadow: 0 0 0 3px rgba(255, 248, 202, 0.3);
}

.mpb-corner-radio-display {
  position: absolute;
  top: 14px;
  left: 15px;
  display: grid;
  width: 50px;
  height: 24px;
  place-items: center;
  border: 2px solid rgba(82, 69, 60, 0.28);
  border-radius: 7px;
  color: rgba(225, 250, 213, 0.78);
  background: rgba(49, 76, 65, 0.66);
  box-shadow: inset 0 3px 7px rgba(22, 39, 33, 0.28);
  font-family: monospace;
  font-size: 0.52rem;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.mpb-corner-radio-speaker {
  position: absolute;
  right: 15px;
  bottom: 13px;
  width: 62px;
  height: 62px;
  border: 4px solid rgba(90, 60, 48, 0.27);
  border-radius: 50%;
  background:
    repeating-radial-gradient(circle, transparent 0 3px, rgba(72, 56, 50, 0.26) 3.5px 5px),
    rgba(255, 232, 184, 0.18);
  box-shadow: inset 0 0 0 5px rgba(255, 231, 177, 0.13);
}

.mpb-corner-radio-knob {
  position: absolute;
  left: 25px;
  bottom: 17px;
  width: 24px;
  height: 24px;
  border: 4px solid rgba(111, 71, 50, 0.25);
  border-radius: 50%;
  background: #f5d26d;
  box-shadow: inset 2px 2px rgba(255, 249, 202, 0.58);
}

.mpb-corner-radio-knob::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 1px;
  width: 2px;
  height: 7px;
  border-radius: 999px;
  background: rgba(95, 67, 49, 0.52);
  transform: translateX(-50%) rotate(18deg);
  transform-origin: 50% 8px;
}

.mpb-corner-radio-light {
  position: absolute;
  left: 72px;
  top: 23px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #e74e46;
  box-shadow: 0 0 0 4px rgba(231, 78, 70, 0.1), 0 0 8px rgba(231, 78, 70, 0.44);
}

.mpb-corner-equalizer {
  position: absolute;
  right: 28px;
  bottom: 38px;
  z-index: 4;
  display: flex;
  height: 30px;
  align-items: flex-end;
  gap: 4px;
  transform: rotate(-4deg);
}

.mpb-corner-equalizer i {
  width: 4px;
  height: 24px;
  border-radius: 999px;
  background: linear-gradient(#6ab8c8, #e69a6e);
  transform-origin: bottom;
  animation: mpb-corner-equalizer 0.82s ease-in-out infinite alternate;
  animation-delay: -0.09s;
  animation-play-state: paused;
}

.mpb-corner-equalizer i:nth-child(2) { animation-delay: -0.18s; }
.mpb-corner-equalizer i:nth-child(3) { animation-delay: -0.27s; }
.mpb-corner-equalizer i:nth-child(4) { animation-delay: -0.36s; }
.mpb-corner-equalizer i:nth-child(5) { animation-delay: -0.45s; }
.mpb-corner-equalizer i:nth-child(6) { animation-delay: -0.54s; }
.mpb-corner-equalizer i:nth-child(7) { animation-delay: -0.63s; }

.music-page-bg.playing .mpb-corner-equalizer i {
  animation-play-state: running;
}

.mpb-listening-corner p {
  position: absolute;
  right: 7px;
  bottom: 76px;
  width: 142px;
  margin: 0;
  color: rgba(64, 79, 94, 0.48);
  font-size: 0.58rem;
  line-height: 1.65;
  letter-spacing: 0.04em;
  text-align: right;
  transform: rotate(-2deg);
}

.mpb-corner-scribble {
  position: absolute;
  right: 0;
  bottom: 59px;
  width: 96px;
  height: 9px;
  border-top: 3px solid rgba(236, 140, 105, 0.24);
  border-radius: 50%;
  transform: rotate(-5deg);
}

.mpb-corner-scribble::before,
.mpb-corner-scribble::after {
  content: '';
  position: absolute;
  top: -4px;
  width: 14px;
  height: 6px;
  border-top: 2px solid rgba(95, 177, 194, 0.28);
  border-radius: 50%;
}

.mpb-corner-scribble::before { left: 18px; transform: rotate(10deg); }
.mpb-corner-scribble::after { left: 51px; transform: rotate(-8deg); }

.music-page-bg.playing .mpb-listening-corner {
  opacity: 0.68;
  transform: rotate(-0.5deg) translateY(-2px);
}

.music-page-bg.preset-starry-radio .mpb-listening-corner,
.music-page-bg.preset-midnight-cinema .mpb-listening-corner {
  color: rgba(238, 226, 196, 0.7);
}

.music-page-bg.preset-starry-radio .mpb-corner-note,
.music-page-bg.preset-midnight-cinema .mpb-corner-note {
  border-color: rgba(255, 231, 181, 0.16);
  background: rgba(27, 36, 62, 0.46);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.22), inset 0 1px rgba(255, 255, 255, 0.06);
}

.music-page-bg.preset-starry-radio .mpb-corner-note small,
.music-page-bg.preset-midnight-cinema .mpb-corner-note small,
.music-page-bg.preset-starry-radio .mpb-listening-corner p,
.music-page-bg.preset-midnight-cinema .mpb-listening-corner p {
  color: rgba(231, 219, 195, 0.56);
}

.music-page-bg.has-custom-media .mpb-listening-corner {
  opacity: 0.16;
}

@keyframes mpb-corner-equalizer {
  0% { opacity: 0.58; transform: scaleY(0.26); }
  100% { opacity: 0.94; transform: scaleY(1); }
}

.mpb-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(56px);
  opacity: 0.55;
  will-change: transform;
}

.mpb-orb--1 {
  top: -8%;
  left: -6%;
  width: min(42vw, 520px);
  height: min(42vw, 520px);
  background: radial-gradient(circle, rgba(167, 139, 250, 0.55) 0%, transparent 68%);
  animation: mpbOrbDrift1 22s ease-in-out infinite;
}

.mpb-orb--2 {
  top: 8%;
  right: -10%;
  width: min(36vw, 440px);
  height: min(36vw, 440px);
  background: radial-gradient(circle, rgba(56, 189, 248, 0.42) 0%, transparent 70%);
  animation: mpbOrbDrift2 26s ease-in-out infinite;
}

.mpb-orb--3 {
  bottom: 12%;
  left: 18%;
  width: min(32vw, 400px);
  height: min(32vw, 400px);
  background: radial-gradient(circle, rgba(244, 114, 182, 0.38) 0%, transparent 72%);
  animation: mpbOrbDrift3 24s ease-in-out infinite;
}

.mpb-orb--4 {
  bottom: -12%;
  right: 12%;
  width: min(28vw, 360px);
  height: min(28vw, 360px);
  background: radial-gradient(circle, rgba(129, 140, 248, 0.4) 0%, transparent 70%);
  animation: mpbOrbDrift4 28s ease-in-out infinite;
}

.mpb-notes {
  position: absolute;
  inset: 0;
}

.mpb-note {
  position: absolute;
  bottom: -8%;
  color: rgba(196, 181, 253, 0.85);
  font-weight: 600;
  line-height: 1;
  animation: mpbNoteFloat linear infinite;
  text-shadow: 0 0 12px rgba(167, 139, 250, 0.35);
}

.mpb-sparkles {
  position: absolute;
  inset: 0;
}

.mpb-spark {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 0 8px rgba(167, 139, 250, 0.55);
  animation: mpbSparkTwinkle ease-in-out infinite;
}

.mpb-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 100%, transparent 55%, rgba(10, 10, 20, 0.18) 100%);
  opacity: 0.28;
}

.music-page-bg.playing .mpb-orb {
  opacity: 0.68;
  filter: blur(52px);
}

.music-page-bg.playing .mpb-note {
  color: rgba(216, 180, 254, 0.95);
  animation-duration: calc(var(--note-duration, 16s) * 0.82);
}

.music-page-bg.playing .mpb-orb--1 { animation-duration: 18s; }
.music-page-bg.playing .mpb-orb--2 { animation-duration: 21s; }
.music-page-bg.playing .mpb-orb--3 { animation-duration: 19s; }
.music-page-bg.playing .mpb-orb--4 { animation-duration: 22s; }

@keyframes mpbOrbDrift1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(6vw, 8vh) scale(1.08); }
}

@keyframes mpbOrbDrift2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-7vw, 6vh) scale(1.06); }
}

@keyframes mpbOrbDrift3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(5vw, -5vh) scale(1.1); }
}

@keyframes mpbOrbDrift4 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-4vw, -7vh) scale(1.05); }
}

@keyframes mpbNoteFloat {
  0% {
    transform: translate3d(0, 0, 0) rotate(0deg);
    opacity: 0;
  }
  8% { opacity: 1; }
  88% { opacity: 0.85; }
  100% {
    transform: translate3d(var(--note-drift, 0px), -108vh, 0) rotate(24deg);
    opacity: 0;
  }
}

@keyframes mpbSparkTwinkle {
  0%, 100% { opacity: 0.15; transform: scale(0.8); }
  50% { opacity: 0.9; transform: scale(1.2); }
}

@media (prefers-reduced-motion: reduce) {
  .mpb-orb,
  .mpb-note,
  .mpb-spark,
  .mpb-motion-walker-track,
  .mpb-motion-walker,
  .mpb-motion-walker-frame,
  .mpb-motion-character-blink i,
  .mpb-motion-companion,
  .mpb-motion-sky i,
  .mpb-walk-sun,
  .mpb-walk-sun::before,
  .mpb-walk-sun::after,
  .mpb-walk-birds i,
  .mpb-walk-birds i::before,
  .mpb-walk-birds i::after,
  .mpb-walk-paper-planes i,
  .mpb-motion-leaves i,
  .mpb-motion-breeze i,
  .mpb-motion-storm-glow,
  .mpb-rain-cloudbank i,
  .mpb-motion-mist,
  .mpb-rain-lightning,
  .preset-motion-rain .mpb-theme-wash,
  .mpb-rain-streetlights i::before,
  .mpb-motion-cloud,
  .mpb-motion-dust i,
  .mpb-motion-splash i,
  .mpb-motion-rain i,
  .mpb-motion-rain::before,
  .mpb-motion-ripples i,
  .mpb-motion-parade,
  .mpb-motion-parade-card,
  .mpb-motion-confetti i,
  .mpb-parade-spotlights i,
  .mpb-parade-lanterns i,
  .mpb-parade-balloons i,
  .preset-motion-parade::after,
  .mpb-corner-equalizer i,
  .music-page-bg .mpb-theme-scene {
    animation: none !important;
  }

  .music-page-bg.playing .mpb-orb {
    opacity: 0.55;
  }
}

.music-page-bg.has-custom-media .mpb-shinchan-postcard {
  opacity: 0.075;
}

.music-page-bg.has-custom-media .mpb-theme-scene {
  opacity: 0.08;
}

.music-page-bg.preset-starry-radio .mpb-shinchan-bubble,
.music-page-bg.preset-starry-radio .mpb-comic-burst {
  color: rgba(236, 242, 255, 0.52);
  background: rgba(33, 47, 82, 0.38);
}

.music-page-bg.preset-starry-radio .mpb-kasukabe-stamp {
  color: rgba(255, 222, 112, 0.38);
  border-color: rgba(255, 222, 112, 0.28);
}

@media (max-width: 768px) {
  .mpb-listening-corner {
    display: none;
  }

  .mpb-motion-walker-track {
    left: -330px;
    bottom: 56px;
    width: 320px;
    height: 222px;
  }

  .mpb-walk-sun {
    top: 7%;
    right: 1%;
    width: 112px;
  }

  .mpb-motion-cloud {
    top: 5px;
    width: 66px;
    height: 21px;
  }

  .mpb-motion-cloud::before { width: 24px; height: 24px; }
  .mpb-motion-cloud::after { width: 29px; height: 29px; }

  .mpb-motion-leaves i:nth-child(n + 12),
  .mpb-walk-birds i:nth-child(n + 5),
  .mpb-walk-paper-planes i:nth-child(n + 4),
  .mpb-motion-confetti i:nth-child(n + 15),
  .mpb-parade-balloons i:nth-child(n + 6),
  .mpb-motion-rain i:nth-child(n + 49) {
    display: none;
  }

  .mpb-motion-companion {
    width: 74px;
    border-width: 3px;
    opacity: 0.17;
  }

  .mpb-motion-companion:nth-child(3) {
    display: none;
  }

  .mpb-theme-scene {
    right: -62px !important;
    bottom: 72px;
    left: auto !important;
    width: 250px;
    height: 168px;
    border-width: 5px;
    opacity: 0.16;
  }
  .mpb-shinchan-postcard--2,
  .mpb-shinchan-postcard--3,
  .mpb-shinchan-postcard--4,
  .mpb-shinchan-postcard--6,
  .mpb-shinchan-bubble--family,
  .mpb-shinchan-bubble--shiro,
  .mpb-kasukabe-stamp,
  .mpb-comic-burst,
  .mpb-crayon--yellow {
    display: none;
  }

  .mpb-shinchan-postcard--1 {
    right: -22px;
    bottom: 76px;
    opacity: 0.15;
  }

  .mpb-shinchan-bubble {
    right: 18px;
    bottom: 190px;
  }

  .mpb-shinchan-signature {
    opacity: 0.38;
  }

  .mpb-signature-caption,
  .mpb-sky-kite,
  .mpb-picnic-plate,
  .mpb-picnic-flower,
  .mpb-radio-constellation,
  .mpb-rain-drop--three,
  .mpb-rain-drop--five {
    display: none;
  }

  .mpb-sky-sun { top: 9%; left: -24px; width: 92px; }
  .mpb-sky-rainbow { left: -155px; bottom: 48px; width: 310px; height: 150px; }
  .mpb-sky-cloud--one { top: 20%; left: 12%; transform: scale(0.52); }
  .mpb-sky-cloud--two { right: -16px; }

  .mpb-picnic-blanket { left: -154px; bottom: 24px; width: 330px; height: 210px; }
  .mpb-picnic-basket { left: -6px; bottom: 74px; transform: scale(0.68); transform-origin: bottom left; }

  .mpb-sunset-sun { top: 8%; right: -22px; width: 110px; }
  .mpb-sunset-campus { left: -132px; bottom: 48px; width: 310px; height: 148px; }
  .mpb-sunset-fence { right: -24%; bottom: 48px; width: 88%; height: 72px; }
  .mpb-sunset-cloud--one { left: -20%; width: 76%; }
  .mpb-sunset-cloud--two { right: -16%; width: 58%; }
  .mpb-sunset-birds { top: 18%; left: 25%; transform: scale(.64); transform-origin: top left; }
  .mpb-sunset-leaves i:nth-child(n + 4) { display: none; }
  .mpb-sunset-wire { top: 25%; left: -4%; width: 110%; }

  .mpb-radio-moon { top: 10%; left: -36px; width: 104px; }
  .mpb-radio-tower { left: 2%; bottom: 58px; transform: scale(0.58); transform-origin: bottom left; }
  .mpb-radio-wave { left: 7px; bottom: 167px; transform: rotate(-45deg) scale(0.62); }
  .mpb-radio-wave--two { left: -10px; bottom: 150px; }
  .mpb-radio-frequency { left: 3%; bottom: 72px; font-size: 1.35rem; }

  .mpb-doodle-paper {
    left: -132px;
    bottom: 62px;
    width: 310px;
    height: 280px;
    border-width: 3px;
  }
  .mpb-doodle-paper b { font-size: 0.78rem; }
  .mpb-doodle-house { transform: scale(0.64) rotate(-2deg); transform-origin: bottom left; }
  .mpb-doodle-flower { right: 12%; transform: scale(0.65); transform-origin: bottom; }
  .mpb-doodle-sun { top: 20%; right: 11%; transform: scale(0.62); }
  .mpb-doodle-spiral { display: none; }
  .mpb-doodle-crayon { bottom: 72px; transform: scale(0.56) rotate(9deg); transform-origin: bottom; }
  .mpb-doodle-crayon--red { right: 5%; }
  .mpb-doodle-crayon--blue { right: 10%; }
  .mpb-doodle-crayon--yellow { display: none; }

  .mpb-rain-window {
    right: -62px;
    bottom: 72px;
    width: 250px;
    height: 168px;
    border-width: 7px;
    border-radius: 22px 22px 8px 8px;
  }
  .mpb-rain-window::before { width: 7px; }
  .mpb-rain-window::after { height: 7px; }
  .mpb-rain-umbrella { left: -92px; bottom: 72px; width: 180px; height: 88px; }
  .mpb-rain-puddle { left: -12%; bottom: 48px; width: 58%; }

  .mpb-cinema-projector {
    left: -48px;
    bottom: 76px;
    transform: scale(0.55);
    transform-origin: bottom left;
  }
  .mpb-cinema-beam { left: 35px; bottom: 90px; width: 110%; height: 200px; }
  .mpb-cinema-film { bottom: 48px; height: 48px; }
  .mpb-cinema-marquee { left: 2%; top: 14%; transform: scale(0.72) rotate(-2deg); transform-origin: top left; }
}

/* Lyrics-page composition: share the selected theme without crowding the record and lyrics. */
.music-page-bg.music-page-bg--lyrics .mpb-shinchan-signature {
  opacity: 0.16;
}

.music-page-bg.music-page-bg--lyrics .mpb-theme-scene {
  right: clamp(-54px, 2vw, 34px);
  bottom: 86px;
  width: clamp(250px, 28vw, 430px);
  height: clamp(165px, 21vw, 280px);
  border-width: 5px;
  opacity: 0.16;
  filter: saturate(0.94) contrast(1.02);
}

.music-page-bg.music-page-bg--lyrics .mpb-theme-scene-copy,
.music-page-bg.music-page-bg--lyrics .mpb-listening-corner,
.music-page-bg.music-page-bg--lyrics .mpb-shinchan-bubble--family,
.music-page-bg.music-page-bg--lyrics .mpb-shinchan-bubble--shiro {
  display: none;
}

.music-page-bg.music-page-bg--lyrics .mpb-shinchan-postcard {
  opacity: 0.055;
}

.music-page-bg.music-page-bg--lyrics .mpb-motion-walker-track {
  bottom: 62px;
  opacity: 0.72;
}

.music-page-bg.music-page-bg--lyrics .mpb-vignette {
  background:
    radial-gradient(ellipse at 50% 48%, rgba(255, 255, 255, 0.05) 0%, transparent 56%),
    radial-gradient(ellipse at 50% 100%, transparent 52%, rgba(10, 16, 28, 0.2) 100%);
  opacity: 0.34;
}

.music-page-bg.music-page-bg--lyrics.preset-midnight-cinema .mpb-theme-scene {
  opacity: 0.22;
  filter: brightness(0.78) saturate(1.05) contrast(1.08);
}

.music-page-bg.music-page-bg--lyrics.preset-midnight-cinema .mpb-vignette {
  background:
    radial-gradient(ellipse at 50% 45%, rgba(255, 222, 166, 0.025) 0%, transparent 52%),
    radial-gradient(ellipse at 50% 100%, transparent 42%, rgba(2, 5, 12, 0.62) 100%);
  opacity: 0.58;
}

/* Hello Kitty / Kuromi IP themes */
.music-page-bg.preset-hello-kitty-garden {
  background: linear-gradient(145deg, #fffaf2, #ffe3e9 48%, #e5f4ee);
}
.music-page-bg.preset-hello-kitty-garden .mpb-theme-wash {
  opacity: 0.94;
  background:
    radial-gradient(circle at 14% 20%, rgba(255, 89, 121, 0.2), transparent 24%),
    radial-gradient(circle at 82% 15%, rgba(255, 231, 145, 0.34), transparent 27%),
    linear-gradient(145deg, rgba(255, 252, 244, 0.9), rgba(255, 219, 230, 0.72) 52%, rgba(221, 244, 235, 0.74));
}
.music-page-bg.preset-hello-kitty-dream {
  background: linear-gradient(145deg, #dff2ff, #efdfff 48%, #ffe2ea);
}
.music-page-bg.preset-hello-kitty-dream .mpb-theme-wash {
  opacity: 0.91;
  background:
    radial-gradient(circle at 18% 23%, rgba(255, 255, 255, 0.8), transparent 25%),
    radial-gradient(circle at 80% 17%, rgba(255, 160, 191, 0.28), transparent 28%),
    linear-gradient(145deg, rgba(211, 239, 255, 0.76), rgba(238, 216, 255, 0.72) 52%, rgba(255, 215, 226, 0.7));
}
.music-page-bg.preset-hello-kitty-midnight {
  background: linear-gradient(145deg, #1b090e, #40131f 48%, #17080e);
}
.music-page-bg.preset-hello-kitty-midnight .mpb-theme-wash {
  opacity: 0.96;
  background:
    radial-gradient(circle at 14% 17%, rgba(225, 175, 94, 0.2), transparent 23%),
    radial-gradient(circle at 82% 24%, rgba(173, 39, 70, 0.28), transparent 30%),
    repeating-linear-gradient(90deg, rgba(255, 242, 218, 0.025) 0 1px, transparent 1px 48px),
    linear-gradient(145deg, rgba(27, 8, 14, 0.98), rgba(67, 17, 31, 0.93) 50%, rgba(20, 7, 12, 0.98));
}
.music-page-bg.preset-kuromi-neon {
  background: linear-gradient(145deg, #eee4f2, #d5b9df 52%, #e7b7d0);
}
.music-page-bg.preset-kuromi-neon .mpb-theme-wash {
  opacity: 0.94;
  background:
    repeating-linear-gradient(45deg, rgba(49, 31, 60, 0.045) 0 16px, transparent 16px 34px),
    radial-gradient(circle at 76% 17%, rgba(232, 89, 168, 0.25), transparent 28%),
    linear-gradient(145deg, rgba(240, 229, 245, 0.88), rgba(209, 182, 220, 0.82) 52%, rgba(236, 190, 215, 0.78));
}
.music-page-bg.preset-kuromi-night-flight {
  background: linear-gradient(145deg, #dad8ec, #b9afd5 50%, #d3a9ca);
}
.music-page-bg.preset-kuromi-night-flight .mpb-theme-wash {
  opacity: 0.95;
  background:
    radial-gradient(circle at 80% 14%, rgba(255, 240, 167, 0.3), transparent 18%),
    radial-gradient(circle at 16% 76%, rgba(124, 79, 160, 0.22), transparent 30%),
    linear-gradient(145deg, rgba(221, 221, 241, 0.92), rgba(185, 171, 211, 0.88) 52%, rgba(213, 173, 204, 0.82));
}
.music-page-bg.preset-kuromi-midnight {
  background: #070509;
}
.music-page-bg.preset-kuromi-midnight .mpb-theme-wash {
  opacity: 0.97;
  background:
    linear-gradient(135deg, transparent 0 47%, rgba(236, 72, 153, 0.11) 48% 50%, transparent 51%) 0 0 / 72px 72px,
    radial-gradient(circle at 78% 18%, rgba(238, 69, 158, 0.22), transparent 27%),
    radial-gradient(circle at 15% 72%, rgba(112, 74, 159, 0.2), transparent 30%),
    linear-gradient(145deg, #09070c, #181020 52%, #050407);
}
.music-page-bg:is(.preset-hello-kitty-garden, .preset-hello-kitty-dream, .preset-hello-kitty-midnight) .mpb-theme-scene {
  border-color: rgba(255, 255, 255, 0.82);
  right: 3.5%;
  bottom: 8%;
  width: min(31vw, 520px);
  height: min(32vw, 410px);
  border-radius: 18px 54px 18px 54px;
  opacity: 0.26;
  filter: saturate(1.05) contrast(0.98);
}
.music-page-bg:is(.preset-kuromi-neon, .preset-kuromi-night-flight, .preset-kuromi-midnight) .mpb-theme-scene {
  border-color: rgba(253, 217, 244, 0.46);
  left: 3.5%;
  right: auto;
  bottom: 7%;
  width: min(32vw, 530px);
  height: min(28vw, 390px);
  border-radius: 10px 38px 10px 38px;
  clip-path: polygon(0 8%, 91% 0, 100% 89%, 9% 100%);
  opacity: 0.28;
  filter: saturate(0.96) contrast(1.04);
}
.music-page-bg:is(.preset-hello-kitty-garden, .preset-hello-kitty-dream, .preset-hello-kitty-midnight) .mpb-note { color: rgba(222, 57, 92, 0.42); }
.music-page-bg:is(.preset-kuromi-neon, .preset-kuromi-night-flight, .preset-kuromi-midnight) .mpb-note { color: rgba(84, 43, 103, 0.48); }

.mpb-ip-elements { position: absolute; inset: 0; z-index: 4; }
.mpb-ip-bubble {
  position: absolute;
  left: clamp(24px, 5vw, 88px);
  top: 16%;
  padding: 0.55rem 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.78);
  border-radius: 999px;
  color: rgba(79, 61, 78, 0.62);
  background: rgba(255, 255, 255, 0.48);
  box-shadow: 0 12px 26px rgba(78, 47, 72, 0.08);
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.13em;
}
.mpb-ip-bubble--right { right: 9%; left: auto; top: 10%; }
.mpb-ip-sticker {
  position: absolute;
  display: block;
  width: 118px;
  height: 100px;
  filter: drop-shadow(0 12px 18px rgba(61, 43, 66, 0.16));
  opacity: 0.35;
}
.mpb-ip-sticker--main { left: 3.5%; bottom: 15%; }
.mpb-ip-sticker--mini { right: 4%; top: 34%; transform: scale(0.68) rotate(8deg); opacity: 0.21; }
.mpb-ip-sticker::before,
.mpb-ip-sticker::after,
.mpb-ip-sticker i::before,
.mpb-ip-sticker i::after { content: ''; position: absolute; display: block; }

.mpb-ip-elements--hello-kitty .mpb-ip-sticker::before {
  left: 18px; top: 19px; width: 79px; height: 68px; border: 3px solid #453b45; border-radius: 48%; background: #fffdf8;
}
.mpb-ip-elements--hello-kitty .mpb-ip-sticker::after {
  right: 6px; top: 5px; width: 38px; height: 25px; border-radius: 50%; background: #e9425b; box-shadow: -19px 2px #e9425b;
}
.mpb-ip-elements--hello-kitty .mpb-ip-sticker i::before {
  left: 43px; top: 47px; width: 5px; height: 8px; border-radius: 50%; background: #302a31; box-shadow: 29px 0 #302a31;
}
.mpb-ip-elements--hello-kitty .mpb-ip-sticker i::after { left: 58px; top: 60px; width: 10px; height: 7px; border-radius: 50%; background: #efc23b; }
.mpb-ip-elements--hello-kitty .mpb-ip-ribbon {
  position: absolute; left: 13%; bottom: 7%; width: 52px; height: 22px; border-radius: 50%; background: #e9435d; box-shadow: 34px 0 #e9435d; transform: rotate(-8deg); opacity: 0.22;
}

.mpb-ip-elements--kuromi .mpb-ip-sticker::before {
  left: 18px; top: 20px; width: 80px; height: 69px; border-radius: 49%; background: #fff9f7;
}
.mpb-ip-elements--kuromi .mpb-ip-sticker::after {
  left: 10px; top: 4px; width: 97px; height: 53px; border-radius: 50% 50% 34% 34%; background: #2c2233; clip-path: polygon(0 18%, 18% 0, 30% 36%, 70% 36%, 84% 0, 100% 18%, 92% 100%, 8% 100%);
}
.mpb-ip-elements--kuromi .mpb-ip-sticker i::before {
  left: 44px; top: 49px; width: 6px; height: 9px; border-radius: 50%; background: #33263b; box-shadow: 29px 0 #33263b;
}
.mpb-ip-elements--kuromi .mpb-ip-sticker i::after { left: 56px; top: 20px; width: 19px; height: 19px; border-radius: 50%; background: #ef70ad; }
.mpb-ip-elements--kuromi .mpb-ip-ribbon {
  position: absolute; left: 8%; bottom: 8%; width: 88px; height: 28px; background: repeating-linear-gradient(90deg, #2d2334 0 14px, #ed70ad 14px 28px); transform: rotate(-8deg); opacity: 0.16;
}
.mpb-ip-symbol { position: absolute; color: rgba(226, 75, 123, 0.26); font-size: 38px; animation: mpb-ip-symbol-float 6s ease-in-out infinite; }
.mpb-ip-symbol--one { left: 24%; top: 25%; }
.mpb-ip-symbol--two { right: 21%; bottom: 22%; animation-delay: -2.8s; }
.mpb-ip-elements--kuromi .mpb-ip-symbol { color: rgba(73, 38, 88, 0.31); }
@keyframes mpb-ip-symbol-float { 0%, 100% { transform: translateY(0) rotate(-5deg); } 50% { transform: translateY(-18px) rotate(8deg); } }

/* Hello Kitty uses a clean editorial / patisserie layout, deliberately unlike the Kasukabe collage. */
.mpb-ip-character {
  position: absolute;
  display: block;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
}
.mpb-ip-elements--hello-kitty::before {
  content: '';
  position: absolute;
  inset: 7% 2.5% 5%;
  border: 1px solid rgba(205, 55, 86, 0.13);
  border-radius: 42px 14px 42px 14px;
  background:
    radial-gradient(circle, rgba(224, 54, 91, 0.16) 1px, transparent 1.5px) 0 0 / 28px 28px;
  mask-image: linear-gradient(90deg, #000, transparent 22%, transparent 78%, #000);
  opacity: 0.52;
}
.mpb-kitty-editorial {
  position: absolute;
  left: 4.6%;
  bottom: 8.5%;
  display: grid;
  gap: 0.12rem;
  width: min(300px, 23vw);
  padding: 1.25rem 1.4rem 1.1rem;
  border: 1px solid rgba(255, 255, 255, 0.74);
  border-radius: 9px 32px 9px 32px;
  color: #7f2338;
  background: rgba(255, 250, 244, 0.54);
  box-shadow: 0 22px 52px rgba(121, 45, 67, 0.1);
  backdrop-filter: blur(7px);
}
.mpb-kitty-editorial::before {
  content: '';
  position: absolute;
  top: 0;
  left: 1.4rem;
  width: 72px;
  height: 4px;
  background: #d92f50;
}
.mpb-kitty-editorial span,
.mpb-kitty-editorial small { font-size: 0.58rem; font-weight: 800; letter-spacing: 0.16em; }
.mpb-kitty-editorial strong { font-family: Georgia, 'Noto Serif SC', serif; font-size: clamp(1rem, 1.8vw, 1.65rem); font-weight: 500; }
.mpb-kitty-editorial small { opacity: 0.58; }
.mpb-ip-character--kitty { left: 2.8%; bottom: 17%; width: clamp(120px, 12vw, 205px); opacity: 0.48; filter: drop-shadow(0 18px 24px rgba(150, 47, 69, 0.14)); }
.mpb-ip-character--kitty-mini { right: 4%; top: 29%; width: clamp(80px, 8vw, 128px); opacity: 0.24; transform: rotate(7deg); }
.mpb-kitty-ticket {
  position: absolute;
  right: 8.5%;
  bottom: 8%;
  padding: 0.8rem 1.2rem;
  border: 1px dashed rgba(172, 42, 68, 0.35);
  border-radius: 8px;
  color: rgba(126, 38, 58, 0.58);
  background: rgba(255, 249, 239, 0.46);
  font: 700 0.58rem/1.6 ui-monospace, SFMono-Regular, Menlo, monospace;
  letter-spacing: 0.15em;
  transform: rotate(-4deg);
}
.mpb-kitty-bow { position: absolute; width: 42px; height: 25px; opacity: 0.28; animation: mpb-kitty-bow-float 7s ease-in-out infinite; }
.mpb-kitty-bow::before,.mpb-kitty-bow::after { content:''; position:absolute; top:2px; width:24px; height:20px; border-radius:55% 45% 55% 45%; background:#df3a58; }
.mpb-kitty-bow::before { left:0; transform:rotate(18deg); }.mpb-kitty-bow::after { right:0; transform:rotate(-18deg); }
.mpb-kitty-bow i { position:absolute; z-index:2; left:17px; top:7px; width:12px; height:12px; border-radius:50%; background:#f6c451; }
.mpb-kitty-bow--one { left:28%; top:22%; }.mpb-kitty-bow--two { right:31%; bottom:21%; animation-delay:-3s; transform:scale(.72); }
@keyframes mpb-kitty-bow-float { 50% { translate: 0 -16px; rotate: 8deg; } }
.mpb-kitty-ribbon-line { position:absolute; left:0; right:0; top:44%; height:1px; background:linear-gradient(90deg, transparent, rgba(207,48,79,.18), transparent); }

/* Every Hello Kitty preset owns a different setting instead of reusing one editorial card. */
.mpb-ip-elements--hello-kitty::before {
  display: none;
}

.mpb-kitty-signature {
  position: absolute;
  inset: 0;
  overflow: hidden;
  opacity: 0.52;
}

.mpb-kitty-scene-label {
  position: absolute;
  z-index: 8;
  left: clamp(34px, 4vw, 78px);
  bottom: 70px;
  padding: 0.4rem 0.78rem;
  border: 1px solid rgba(255, 255, 255, 0.58);
  border-radius: 999px;
  color: rgba(126, 42, 66, 0.58);
  background: rgba(255, 250, 245, 0.48);
  box-shadow: 0 9px 24px rgba(102, 42, 64, 0.08);
  font-size: 0.55rem;
  font-weight: 900;
  letter-spacing: 0.15em;
  backdrop-filter: blur(8px);
}

.mpb-kitty-scene-character {
  position: absolute;
  z-index: 5;
  display: block;
  object-fit: contain;
  filter: drop-shadow(0 20px 30px rgba(151, 61, 87, 0.13));
}

/* Strawberry garden: greenhouse, tea table and flower bed. */
.mpb-kitty-garden-arch {
  position: absolute;
  left: 3%;
  bottom: 54px;
  width: clamp(340px, 38vw, 620px);
  height: clamp(320px, 54vh, 520px);
  border: 12px solid rgba(255, 255, 246, 0.56);
  border-bottom-width: 20px;
  border-radius: 50% 50% 12px 12px / 38% 38% 12px 12px;
  background:
    linear-gradient(90deg, transparent 49%, rgba(255, 255, 255, 0.42) 50% 52%, transparent 53%),
    linear-gradient(0deg, transparent 47%, rgba(255, 255, 255, 0.38) 48% 51%, transparent 52%),
    linear-gradient(145deg, rgba(233, 251, 238, 0.28), rgba(255, 230, 235, 0.18));
  box-shadow: inset 0 0 0 2px rgba(80, 144, 102, 0.08), 0 24px 60px rgba(93, 126, 92, 0.1);
}

.mpb-kitty-garden-arch::before,
.mpb-kitty-garden-arch::after {
  content: '';
  position: absolute;
  bottom: -10px;
  width: 42%;
  height: 23%;
  border-radius: 50% 50% 8px 8px;
  background:
    radial-gradient(circle at 15% 34%, #f087a5 0 5px, transparent 6px),
    radial-gradient(circle at 46% 22%, #f6c85c 0 5px, transparent 6px),
    radial-gradient(circle at 75% 48%, #f27794 0 6px, transparent 7px),
    linear-gradient(180deg, rgba(119, 181, 112, 0.54), rgba(78, 145, 87, 0.32));
}

.mpb-kitty-garden-arch::before { left: 2%; }
.mpb-kitty-garden-arch::after { right: 2%; transform: scaleX(-1); }

.mpb-kitty-garden-arch i {
  position: absolute;
  left: 11%;
  top: 15%;
  width: 22%;
  height: 34%;
  border: 8px solid rgba(213, 70, 98, 0.28);
  border-radius: 50% 50% 18px 18px;
}

.mpb-kitty-garden-arch b {
  position: absolute;
  right: 11%;
  top: 20%;
  width: 26%;
  height: 28%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 225, 131, 0.58), rgba(255, 237, 180, 0.15) 56%, transparent 58%);
}

.mpb-kitty-flower-bed {
  position: absolute;
  right: 2%;
  bottom: 48px;
  width: 48%;
  height: 110px;
  border-radius: 55% 45% 0 0;
  background: linear-gradient(180deg, rgba(121, 184, 112, 0.38), rgba(79, 145, 89, 0.16));
}

.mpb-kitty-flower-bed i {
  position: absolute;
  bottom: 31%;
  width: 8px;
  height: 58px;
  border-radius: 999px;
  background: rgba(84, 151, 91, 0.48);
}

.mpb-kitty-flower-bed i::before {
  content: '✿';
  position: absolute;
  top: -22px;
  left: -10px;
  color: #ee7898;
  font-size: 29px;
  line-height: 1;
}

.mpb-kitty-flower-bed i:nth-child(1) { left: 10%; transform: rotate(-8deg); }
.mpb-kitty-flower-bed i:nth-child(2) { left: 28%; height: 76px; }
.mpb-kitty-flower-bed i:nth-child(3) { left: 48%; transform: rotate(9deg); }
.mpb-kitty-flower-bed i:nth-child(4) { left: 68%; height: 72px; }
.mpb-kitty-flower-bed i:nth-child(5) { right: 8%; transform: rotate(-7deg); }
.mpb-kitty-flower-bed i:nth-child(2)::before,
.mpb-kitty-flower-bed i:nth-child(5)::before { color: #f3c85a; }

.mpb-kitty-tea-table {
  position: absolute;
  left: 27%;
  bottom: 84px;
  z-index: 6;
  width: 178px;
  height: 78px;
  border-radius: 50%;
  background: rgba(255, 249, 233, 0.72);
  box-shadow: 0 14px 30px rgba(116, 79, 65, 0.12);
}

.mpb-kitty-tea-table::after {
  content: '';
  position: absolute;
  left: 79px;
  top: 52px;
  width: 22px;
  height: 112px;
  border-radius: 7px;
  background: rgba(207, 146, 119, 0.45);
}

.mpb-kitty-tea-table i,
.mpb-kitty-tea-table b {
  position: absolute;
  top: 3px;
  border-radius: 8px 8px 50% 50%;
  background: rgba(255, 255, 255, 0.75);
}

.mpb-kitty-tea-table i { left: 43px; width: 34px; height: 31px; border: 4px solid rgba(223, 88, 112, .34); }
.mpb-kitty-tea-table b { right: 35px; width: 52px; height: 36px; background: radial-gradient(circle at 50% 28%, #ef7998 0 7px, #fff7ea 8px); }
.mpb-kitty-scene-character--garden { left: 7%; bottom: 78px; width: clamp(122px, 12vw, 202px); }

/* Red velvet midnight: curtains, chandelier and banquet table. */
.mpb-kitty-velvet-curtain {
  position: absolute;
  top: 0;
  bottom: 46px;
  width: 22%;
  background:
    repeating-linear-gradient(90deg, rgba(91, 10, 34, 0.94) 0 22px, rgba(145, 24, 52, 0.9) 23px 45px);
  box-shadow: inset 0 0 42px rgba(13, 2, 8, 0.45);
}

.mpb-kitty-velvet-curtain::after {
  content: '';
  position: absolute;
  top: 39%;
  width: 48px;
  height: 18px;
  border-radius: 999px;
  background: #bc8549;
  box-shadow: 0 0 0 5px rgba(233, 188, 112, 0.13);
}

.mpb-kitty-velvet-curtain--left {
  left: -4%;
  clip-path: polygon(0 0, 100% 0, 74% 48%, 100% 100%, 0 100%);
}

.mpb-kitty-velvet-curtain--left::after { right: 17%; }
.mpb-kitty-velvet-curtain--right {
  right: -4%;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, 26% 48%);
}
.mpb-kitty-velvet-curtain--right::after { left: 17%; }

.mpb-kitty-ballroom-panels {
  position: absolute;
  inset: 5% 2.5% 48px;
  border: 2px solid rgba(218, 170, 94, 0.2);
  border-radius: 28px 28px 8px 8px;
  background:
    linear-gradient(90deg, transparent 0 11%, rgba(218, 170, 94, .14) 11.1% 11.3%, transparent 11.4% 88%, rgba(218, 170, 94, .14) 88.1% 88.3%, transparent 88.4%),
    repeating-linear-gradient(90deg, transparent 0 118px, rgba(221, 177, 104, .055) 119px 121px),
    radial-gradient(ellipse at 50% -8%, rgba(224, 173, 92, .14), transparent 42%);
  box-shadow: inset 0 0 90px rgba(10, 2, 7, .34);
}

.mpb-kitty-ballroom-panels::before,
.mpb-kitty-ballroom-panels::after {
  content: '';
  position: absolute;
  top: 12%;
  width: 21%;
  height: 66%;
  border: 4px solid rgba(218, 170, 94, .18);
  border-bottom-width: 8px;
  border-radius: 50% 50% 10px 10px / 24% 24% 10px 10px;
  box-shadow: inset 0 0 0 6px rgba(76, 15, 32, .18);
}

.mpb-kitty-ballroom-panels::before { left: 4%; }
.mpb-kitty-ballroom-panels::after { right: 4%; }

.mpb-kitty-ballroom-panels i,
.mpb-kitty-ballroom-panels b {
  position: absolute;
  top: 17%;
  width: 84px;
  height: 84px;
  border: 3px solid rgba(225, 184, 111, .22);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(216, 164, 87, .16), transparent 60%);
}

.mpb-kitty-ballroom-panels i { left: calc(14.5% - 42px); }
.mpb-kitty-ballroom-panels b { right: calc(14.5% - 42px); }

.mpb-kitty-chandelier {
  position: absolute;
  left: 50%;
  top: -18px;
  width: 220px;
  height: 190px;
  border-left: 4px solid rgba(223, 180, 105, 0.55);
}

.mpb-kitty-chandelier::after {
  content: '';
  position: absolute;
  left: -78px;
  bottom: 23px;
  width: 156px;
  height: 82px;
  border: 5px solid rgba(224, 178, 100, 0.44);
  border-top: 0;
  border-radius: 0 0 50% 50%;
}

.mpb-kitty-chandelier i {
  position: absolute;
  bottom: 12px;
  width: 22px;
  height: 32px;
  border-radius: 50% 50% 36% 36%;
  background: rgba(255, 215, 134, 0.66);
  box-shadow: 0 0 28px rgba(255, 196, 96, 0.62);
}

.mpb-kitty-chandelier i:nth-child(1) { left: -74px; }
.mpb-kitty-chandelier i:nth-child(2) { left: -11px; bottom: -8px; }
.mpb-kitty-chandelier i:nth-child(3) { left: 52px; }

.mpb-kitty-banquet-table {
  position: absolute;
  left: 31%;
  bottom: 58px;
  width: 38%;
  height: 146px;
  border-radius: 50% 50% 10px 10px / 34% 34% 10px 10px;
  background:
    linear-gradient(180deg, rgba(250, 219, 170, 0.25) 0 9%, rgba(91, 13, 36, 0.82) 10% 100%);
  box-shadow: 0 24px 55px rgba(0, 0, 0, 0.32);
}

.mpb-kitty-banquet-table::before,
.mpb-kitty-banquet-table::after {
  content: '';
  position: absolute;
  top: -39px;
  width: 68px;
  height: 45px;
  border-radius: 50% 50% 8px 8px;
  background: radial-gradient(circle at 50% 30%, #d999aa 0 7px, #f3d9b5 8px 23px, transparent 24px);
}

.mpb-kitty-banquet-table::before { left: 22%; }
.mpb-kitty-banquet-table::after { right: 20%; }

.mpb-kitty-banquet-table i,
.mpb-kitty-banquet-table b {
  position: absolute;
  top: -58px;
  width: 7px;
  height: 62px;
  border-radius: 999px;
  background: #d4a35e;
}

.mpb-kitty-banquet-table i { left: 43%; }
.mpb-kitty-banquet-table b { left: 56%; }
.mpb-kitty-banquet-table i::after,
.mpb-kitty-banquet-table b::after {
  content: '';
  position: absolute;
  left: -7px;
  top: -18px;
  width: 21px;
  height: 25px;
  border-radius: 50%;
  background: #ffd98e;
  box-shadow: 0 0 22px rgba(255, 204, 115, 0.7);
}

.mpb-kitty-lounge-sofa {
  position: absolute;
  left: 3%;
  bottom: 52px;
  width: clamp(260px, 27vw, 440px);
  height: clamp(130px, 19vh, 190px);
  border: 8px solid rgba(183, 122, 72, .18);
  border-radius: 58% 58% 24px 24px / 64% 64% 24px 24px;
  background:
    radial-gradient(circle at 22% 44%, rgba(235, 193, 130, .24) 0 4px, transparent 5px),
    radial-gradient(circle at 50% 32%, rgba(235, 193, 130, .24) 0 4px, transparent 5px),
    radial-gradient(circle at 78% 44%, rgba(235, 193, 130, .24) 0 4px, transparent 5px),
    linear-gradient(180deg, rgba(125, 21, 48, .8), rgba(75, 10, 31, .9));
  box-shadow: inset 0 12px 24px rgba(255, 161, 171, .06), 0 22px 48px rgba(0, 0, 0, .28);
}

.mpb-kitty-lounge-sofa::before,
.mpb-kitty-lounge-sofa::after {
  content: '';
  position: absolute;
  bottom: -4px;
  width: 26%;
  height: 72%;
  border-radius: 38px 38px 16px 16px;
  background: linear-gradient(180deg, rgba(136, 24, 54, .9), rgba(76, 10, 31, .95));
}

.mpb-kitty-lounge-sofa::before { left: -7%; }
.mpb-kitty-lounge-sofa::after { right: -7%; }

.mpb-kitty-lounge-sofa i,
.mpb-kitty-lounge-sofa b {
  position: absolute;
  z-index: 2;
  bottom: -24px;
  width: 16px;
  height: 30px;
  border-radius: 5px;
  background: rgba(196, 139, 74, .46);
}

.mpb-kitty-lounge-sofa i { left: 13%; }
.mpb-kitty-lounge-sofa b { right: 13%; }

.mpb-kitty-midnight-monogram {
  position: absolute;
  left: 7%;
  top: 17%;
  color: rgba(231, 190, 119, 0.42);
  font-family: Georgia, serif;
  font-size: clamp(4rem, 8vw, 9rem);
  letter-spacing: -0.16em;
  text-shadow: 0 0 48px rgba(202, 134, 66, 0.2);
}

.mpb-kitty-signature--hello-kitty-midnight .mpb-kitty-scene-label {
  border-color: rgba(231, 190, 119, 0.2);
  color: rgba(245, 214, 160, 0.68);
  background: rgba(50, 8, 21, 0.56);
}

/* Cloud dream: moon, star field, cloud steps and a long floating ribbon. */
.mpb-kitty-dream-moon {
  position: absolute;
  top: 12%;
  left: 7%;
  width: clamp(120px, 13vw, 210px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: rgba(255, 247, 213, 0.72);
  box-shadow: 0 0 85px rgba(255, 238, 191, 0.5);
}

.mpb-kitty-dream-moon::after {
  content: '';
  position: absolute;
  left: 35%;
  top: -11%;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #e8dff8;
}

.mpb-kitty-cloud-stair {
  position: absolute;
  left: 2%;
  bottom: 54px;
  width: 48%;
  height: 280px;
}

.mpb-kitty-cloud-stair i {
  position: absolute;
  width: 230px;
  height: 65px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.58);
  box-shadow: 0 18px 45px rgba(121, 111, 164, 0.09);
}

.mpb-kitty-cloud-stair i::before,
.mpb-kitty-cloud-stair i::after {
  content: '';
  position: absolute;
  bottom: 0;
  border-radius: 50%;
  background: inherit;
}

.mpb-kitty-cloud-stair i::before { left: 32px; width: 90px; height: 90px; }
.mpb-kitty-cloud-stair i::after { right: 31px; width: 112px; height: 112px; }
.mpb-kitty-cloud-stair i:nth-child(1) { left: -30px; bottom: 0; }
.mpb-kitty-cloud-stair i:nth-child(2) { left: 135px; bottom: 92px; transform: scale(.78); }
.mpb-kitty-cloud-stair i:nth-child(3) { left: 278px; bottom: 172px; transform: scale(.58); }

.mpb-kitty-dream-stars {
  position: absolute;
  inset: 0;
}

.mpb-kitty-dream-stars i {
  position: absolute;
  width: 11px;
  height: 11px;
  background: rgba(229, 119, 160, 0.48);
  clip-path: polygon(50% 0, 63% 37%, 100% 50%, 63% 63%, 50% 100%, 37% 63%, 0 50%, 37% 37%);
}

.mpb-kitty-dream-stars i:nth-child(1) { left: 27%; top: 14%; }
.mpb-kitty-dream-stars i:nth-child(2) { left: 46%; top: 33%; transform: scale(.7); }
.mpb-kitty-dream-stars i:nth-child(3) { right: 29%; top: 12%; background: rgba(132, 152, 220, .45); }
.mpb-kitty-dream-stars i:nth-child(4) { right: 12%; top: 43%; transform: scale(1.3); }
.mpb-kitty-dream-stars i:nth-child(5) { left: 18%; top: 49%; transform: scale(.55); }

.mpb-kitty-dream-ribbon {
  position: absolute;
  right: -10%;
  bottom: 14%;
  width: 66%;
  height: 140px;
  border-top: 18px solid rgba(233, 119, 163, 0.27);
  border-radius: 50%;
  transform: rotate(-8deg);
}

/* Patisserie: striped shop awning, glass counter, cake stand and chalk menu. */
.mpb-kitty-shop-awning {
  position: absolute;
  left: 1.5%;
  bottom: 390px;
  width: 27%;
  height: 86px;
  border-radius: 24px 24px 18px 18px;
  background: repeating-linear-gradient(90deg, #fff6e9 0 56px, rgba(232, 91, 112, 0.68) 57px 112px);
  clip-path: polygon(0 0, 100% 0, 96% 72%, 90% 100%, 82% 72%, 74% 100%, 66% 72%, 58% 100%, 50% 72%, 42% 100%, 34% 72%, 26% 100%, 18% 72%, 10% 100%, 4% 72%);
  box-shadow: 0 18px 32px rgba(134, 68, 73, 0.1);
}

.mpb-kitty-pastry-counter {
  position: absolute;
  left: 1.5%;
  bottom: 54px;
  width: 27%;
  height: 335px;
  border: 13px solid rgba(255, 248, 230, 0.62);
  border-radius: 14px 14px 5px 5px;
  background:
    repeating-linear-gradient(90deg, transparent 0 114px, rgba(255,255,255,.28) 115px 120px),
    linear-gradient(180deg, rgba(229, 249, 241, 0.3) 0 58%, rgba(226, 143, 119, 0.35) 59% 100%);
  box-shadow: inset 0 0 0 2px rgba(161, 91, 83, 0.09), 0 22px 60px rgba(117, 72, 68, 0.12);
}

.mpb-kitty-pastry-counter::after {
  content: '';
  position: absolute;
  left: 5%;
  right: 5%;
  top: 53%;
  height: 10px;
  border-radius: 999px;
  background: rgba(210, 108, 100, 0.34);
}

.mpb-kitty-pastry-counter i,
.mpb-kitty-pastry-counter b {
  position: absolute;
  top: 23%;
  width: 92px;
  height: 58px;
  border-radius: 50% 50% 16px 16px;
  background: radial-gradient(ellipse at 50% 45%, #f4becc 0 28%, #fff0d8 30% 57%, transparent 59%);
}

.mpb-kitty-pastry-counter i { left: 13%; }
.mpb-kitty-pastry-counter b { right: 12%; transform: scale(.82); }

.mpb-kitty-cake-stand {
  position: absolute;
  left: 6.5%;
  bottom: 126px;
  z-index: 6;
  width: 132px;
  height: 21px;
  border-radius: 50%;
  background: rgba(255, 246, 220, 0.78);
  box-shadow: 0 8px 18px rgba(126, 77, 68, 0.12);
}

.mpb-kitty-cake-stand::after {
  content: '';
  position: absolute;
  left: 57px;
  top: 12px;
  width: 18px;
  height: 76px;
  border-radius: 8px;
  background: rgba(217, 130, 111, 0.42);
}

.mpb-kitty-cake-stand i {
  position: absolute;
  left: 27px;
  bottom: 8px;
  width: 78px;
  height: 70px;
  border-radius: 16px 16px 9px 9px;
  background: linear-gradient(180deg, #ef8aa7 0 20%, #fff0df 21% 43%, #ef8aa7 44% 59%, #fff0df 60%);
}

.mpb-kitty-cake-stand b {
  position: absolute;
  left: 61px;
  bottom: 77px;
  width: 11px;
  height: 28px;
  border-radius: 999px;
  background: #e85f78;
}

.mpb-kitty-dessert-shelf {
  position: absolute;
  left: 2.8%;
  bottom: 270px;
  z-index: 7;
  width: 24%;
  height: 82px;
  border-bottom: 13px solid rgba(255, 242, 216, .7);
  box-shadow: 0 10px 18px rgba(118, 72, 65, .1);
}

.mpb-kitty-dessert-shelf i {
  position: absolute;
  bottom: 12px;
  width: 48px;
  height: 42px;
  clip-path: polygon(14% 0, 86% 0, 74% 100%, 26% 100%);
  background: repeating-linear-gradient(90deg, #f3a0b4 0 7px, #fff0da 8px 14px);
}

.mpb-kitty-dessert-shelf i::before {
  content: '';
  position: absolute;
  left: 2px;
  top: -25px;
  width: 44px;
  height: 34px;
  border-radius: 50% 50% 24% 24%;
  background: radial-gradient(circle at 50% 12%, #e95f7e 0 5px, #fff1df 6px 100%);
  box-shadow: 0 -7px 0 -1px rgba(255, 245, 225, .9);
}

.mpb-kitty-dessert-shelf i:nth-child(1) { left: 3%; }
.mpb-kitty-dessert-shelf i:nth-child(2) { left: 28%; transform: scale(.86); }
.mpb-kitty-dessert-shelf i:nth-child(3) { left: 54%; }
.mpb-kitty-dessert-shelf i:nth-child(4) { right: 2%; transform: scale(.8); }
.mpb-kitty-dessert-shelf i:nth-child(2)::before { background: radial-gradient(circle at 50% 12%, #efc15a 0 5px, #ffe8bb 6px 100%); }
.mpb-kitty-dessert-shelf i:nth-child(3)::before { background: radial-gradient(circle at 50% 12%, #d95e8d 0 5px, #f9cbd8 6px 100%); }

.mpb-kitty-macaron-stack {
  position: absolute;
  right: 3.5%;
  top: 18%;
  z-index: 6;
  width: 88px;
  height: 220px;
  transform: rotate(4deg);
}

.mpb-kitty-macaron-stack i {
  position: absolute;
  left: 4px;
  width: 78px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(180deg, #ef9fb5 0 40%, #fff1dd 41% 59%, #df819d 60%);
  box-shadow: 0 8px 13px rgba(119, 68, 75, .1);
}

.mpb-kitty-macaron-stack i:nth-child(1) { bottom: 0; }
.mpb-kitty-macaron-stack i:nth-child(2) { bottom: 35px; background: linear-gradient(180deg, #b8d89b 0 40%, #fff1dd 41% 59%, #94c47d 60%); transform: rotate(-6deg); }
.mpb-kitty-macaron-stack i:nth-child(3) { bottom: 70px; background: linear-gradient(180deg, #f1c36f 0 40%, #fff1dd 41% 59%, #dda856 60%); transform: rotate(5deg); }
.mpb-kitty-macaron-stack i:nth-child(4) { bottom: 105px; background: linear-gradient(180deg, #c8b4df 0 40%, #fff1dd 41% 59%, #a891c5 60%); transform: rotate(-4deg); }
.mpb-kitty-macaron-stack i:nth-child(5) { bottom: 140px; background: linear-gradient(180deg, #ef9fb5 0 40%, #fff1dd 41% 59%, #df819d 60%); transform: rotate(6deg); }

.mpb-kitty-menu-board {
  position: absolute;
  left: 2.6%;
  top: 17%;
  padding: 1rem 1.2rem;
  border: 8px solid rgba(185, 125, 89, 0.42);
  border-radius: 8px;
  color: rgba(255, 241, 213, 0.75);
  background: rgba(52, 74, 64, 0.58);
  font: 800 0.68rem/1.7 ui-monospace, monospace;
  letter-spacing: 0.16em;
  transform: rotate(-3deg);
}

.mpb-kitty-scene-character--patisserie { left: 17%; bottom: 68px; width: clamp(112px, 10vw, 170px); }
.mpb-kitty-signature--hello-kitty-patisserie { opacity: .68; }

/* Ribbon cinema: curtains, marquee, film strip and popcorn. */
.mpb-kitty-cinema-curtain {
  position: absolute;
  z-index: 5;
  top: 5%;
  bottom: 48px;
  width: 23%;
  background: repeating-linear-gradient(90deg, rgba(183, 55, 72, 0.7) 0 20px, rgba(229, 119, 121, 0.62) 21px 42px);
  box-shadow: inset 0 0 36px rgba(91, 24, 37, 0.2);
}

.mpb-kitty-cinema-curtain--left { left: -4%; clip-path: polygon(0 0, 100% 0, 70% 47%, 94% 100%, 0 100%); }
.mpb-kitty-cinema-curtain--right { right: -4%; clip-path: polygon(0 0, 100% 0, 100% 100%, 6% 100%, 30% 47%); }

.mpb-kitty-cinema-marquee {
  position: absolute;
  left: 7%;
  top: 13%;
  z-index: 6;
  padding: 0.9rem 1.4rem;
  border: 3px solid rgba(255, 226, 169, 0.56);
  border-radius: 10px 34px 10px 34px;
  color: rgba(113, 33, 51, 0.72);
  background:
    radial-gradient(circle, #f5d77e 0 3px, transparent 4px) 7px 7px / 18px 18px,
    rgba(255, 238, 196, 0.65);
  box-shadow: 0 0 0 6px rgba(167, 61, 76, 0.12);
  font-family: Georgia, serif;
  font-size: clamp(1rem, 1.6vw, 1.5rem);
  line-height: 1.2;
  letter-spacing: 0.13em;
  text-align: center;
  transform: rotate(-2deg);
}

.mpb-kitty-cinema-marquee b {
  font: 800 0.54rem/1.4 ui-monospace, monospace;
}

.mpb-kitty-cinema-film {
  position: absolute;
  left: -2%;
  bottom: 48px;
  z-index: 4;
  width: 104%;
  height: 64px;
  border-top: 2px solid rgba(91, 31, 46, 0.2);
  border-bottom: 2px solid rgba(91, 31, 46, 0.2);
  background:
    repeating-linear-gradient(90deg, rgba(99, 31, 45, 0.28) 0 22px, rgba(255, 228, 184, 0.34) 23px 38px, rgba(99, 31, 45, 0.28) 39px 61px);
  transform: rotate(-1deg);
}

.mpb-kitty-popcorn {
  position: absolute;
  left: 8%;
  bottom: 104px;
  z-index: 6;
  width: 95px;
  height: 112px;
  clip-path: polygon(8% 10%, 92% 10%, 80% 100%, 20% 100%);
  background: repeating-linear-gradient(90deg, #fff2d2 0 16px, #df5d72 17px 33px);
}

.mpb-kitty-popcorn::before {
  content: '● ● ●';
  position: absolute;
  left: 3px;
  top: -22px;
  color: #fff0c8;
  font-size: 36px;
  letter-spacing: -13px;
  text-shadow: 16px -8px #fff5d8, 42px -4px #f5d39b;
}

/* Sakura letter: a writing desk, blossom branch, ink bottle and seated Kitty. */
.mpb-kitty-sakura-branch {
  position: absolute;
  left: -6%;
  top: 12%;
  width: 48%;
  height: 130px;
  border-top: 13px solid rgba(126, 81, 83, 0.32);
  border-radius: 50%;
  transform: rotate(10deg);
}

.mpb-kitty-sakura-branch i {
  position: absolute;
  width: 19px;
  height: 19px;
  border-radius: 50% 0 50% 50%;
  background: #f29ab3;
  box-shadow: 13px 2px #f8b6c7, 6px -12px #f4a6bc;
}

.mpb-kitty-sakura-branch i:nth-child(1) { left: 21%; top: -8px; }
.mpb-kitty-sakura-branch i:nth-child(2) { left: 43%; top: 12px; transform: scale(.75); }
.mpb-kitty-sakura-branch i:nth-child(3) { left: 64%; top: 28px; }
.mpb-kitty-sakura-branch i:nth-child(4) { right: 7%; top: 44px; transform: scale(.66); }

.mpb-kitty-writing-desk {
  position: absolute;
  left: 3%;
  bottom: 48px;
  width: 47%;
  height: 190px;
  border-radius: 50% 15px 0 0 / 18% 15px 0 0;
  background:
    repeating-linear-gradient(90deg, transparent 0 92px, rgba(126, 78, 74, 0.09) 93px 97px),
    linear-gradient(180deg, rgba(239, 187, 165, 0.43), rgba(207, 143, 126, 0.28));
  box-shadow: 0 -13px 34px rgba(128, 78, 74, 0.07);
}

.mpb-kitty-writing-desk::before {
  content: '';
  position: absolute;
  right: 12%;
  top: -76px;
  width: 154px;
  height: 106px;
  border: 2px solid rgba(217, 118, 143, 0.24);
  border-radius: 10px;
  background:
    repeating-linear-gradient(0deg, transparent 0 17px, rgba(225, 132, 154, 0.16) 18px 19px),
    rgba(255, 252, 245, 0.62);
  transform: rotate(6deg);
}

.mpb-kitty-writing-desk i,
.mpb-kitty-writing-desk b {
  position: absolute;
  bottom: -84px;
  width: 20px;
  height: 100px;
  border-radius: 7px;
  background: rgba(145, 91, 83, 0.28);
}

.mpb-kitty-writing-desk i { left: 12%; }
.mpb-kitty-writing-desk b { right: 12%; }

.mpb-kitty-ink-bottle {
  position: absolute;
  left: 39%;
  bottom: 217px;
  z-index: 7;
  width: 52px;
  height: 45px;
  border-radius: 9px 9px 16px 16px;
  background: rgba(84, 103, 124, 0.55);
  box-shadow: inset 0 0 0 5px rgba(255, 255, 255, .12);
}

.mpb-kitty-ink-bottle::after {
  content: '';
  position: absolute;
  left: 28px;
  top: -60px;
  width: 7px;
  height: 74px;
  border-radius: 999px;
  background: linear-gradient(#f6d7df 0 35%, #785c71 36%);
  transform: rotate(18deg);
  transform-origin: bottom;
}

.mpb-kitty-scene-character--sakura { left: 12%; bottom: 83px; width: clamp(120px, 12vw, 195px); }

/* Candy carousel: fairground canopy, lit stage and ticket booth. */
.mpb-kitty-fairground-canopy {
  position: absolute;
  right: 2%;
  top: 7%;
  width: 48%;
  height: 180px;
  border-radius: 50% 50% 12% 12% / 90% 90% 14% 14%;
  background: repeating-linear-gradient(90deg, rgba(238, 124, 160, .64) 0 54px, rgba(255, 232, 179, .66) 55px 108px);
  box-shadow: 0 18px 48px rgba(147, 91, 133, 0.12);
}

.mpb-kitty-fairground-canopy::after {
  content: '';
  position: absolute;
  left: 49%;
  top: 88%;
  width: 11px;
  height: 58vh;
  border-radius: 999px;
  background: rgba(183, 123, 150, 0.28);
}

.mpb-kitty-carousel-stage {
  position: absolute;
  right: 2%;
  bottom: 48px;
  width: 49%;
  height: 112px;
  border-radius: 50% 50% 8px 8px / 38% 38% 8px 8px;
  background:
    radial-gradient(circle, #f7d977 0 4px, transparent 5px) 0 0 / 34px 34px,
    linear-gradient(180deg, rgba(240, 134, 169, .48), rgba(160, 121, 174, .32));
  box-shadow: 0 -18px 50px rgba(177, 96, 144, 0.12);
}

.mpb-kitty-carousel-stage i,
.mpb-kitty-carousel-stage b {
  position: absolute;
  top: -112px;
  width: 9px;
  height: 126px;
  border-radius: 999px;
  background: linear-gradient(90deg, #f2c66f, #fff0b8, #c8954c);
}

.mpb-kitty-carousel-stage i { left: 25%; }
.mpb-kitty-carousel-stage b { right: 25%; }

.mpb-kitty-fairground-lights {
  position: absolute;
  left: 3%;
  right: 2%;
  top: 16%;
  height: 120px;
  border-top: 3px solid rgba(160, 112, 151, 0.24);
  border-radius: 50%;
}

.mpb-kitty-fairground-lights i {
  position: absolute;
  top: -9px;
  width: 17px;
  height: 17px;
  border-radius: 50%;
  background: #ffe49a;
  box-shadow: 0 0 20px rgba(255, 208, 114, 0.72);
}

.mpb-kitty-fairground-lights i:nth-child(1) { left: 5%; }
.mpb-kitty-fairground-lights i:nth-child(2) { left: 22%; top: 7px; }
.mpb-kitty-fairground-lights i:nth-child(3) { left: 39%; top: 15px; }
.mpb-kitty-fairground-lights i:nth-child(4) { left: 56%; top: 14px; }
.mpb-kitty-fairground-lights i:nth-child(5) { left: 73%; top: 6px; }
.mpb-kitty-fairground-lights i:nth-child(6) { right: 5%; }

.mpb-kitty-ticket-booth {
  position: absolute;
  left: 5%;
  bottom: 58px;
  width: 154px;
  height: 210px;
  display: grid;
  place-items: center;
  border: 10px solid rgba(255, 237, 195, 0.56);
  border-radius: 76px 76px 10px 10px;
  color: rgba(123, 68, 101, 0.62);
  background: repeating-linear-gradient(90deg, rgba(235, 125, 163, .46) 0 28px, rgba(255, 234, 193, .5) 29px 57px);
  box-shadow: 0 20px 42px rgba(137, 82, 118, .12);
  font: 900 0.72rem/1.3 ui-monospace, monospace;
  letter-spacing: .14em;
  text-align: center;
}

/* Kuromi switches to an angular punk-zine system: checker rail, tape and hard neon accents. */
.mpb-ip-elements--kuromi::before {
  content:'';
  position:absolute;
  inset:8% 2.5% 6%;
  border:1px solid rgba(244,95,176,.2);
  clip-path:polygon(0 6%,96% 0,100% 90%,7% 100%);
  background:repeating-linear-gradient(135deg, rgba(38,23,47,.08) 0 18px, transparent 18px 38px);
  opacity:.62;
}
.mpb-kuromi-zine {
  position:absolute;
  right:4%;
  top:13%;
  width:min(330px,25vw);
  padding:1.2rem 1.4rem;
  border:2px solid rgba(246,92,175,.42);
  border-radius:4px 24px 4px 24px;
  color:#f5e9f5;
  background:rgba(28,18,34,.6);
  box-shadow:12px 12px 0 rgba(230,72,156,.1);
  transform:rotate(1.5deg);
}
.mpb-kuromi-zine span,.mpb-kuromi-zine small { display:block; font:800 .58rem/1.5 ui-monospace,SFMono-Regular,Menlo,monospace; letter-spacing:.16em; }
.mpb-kuromi-zine strong { display:block; margin:.25rem 0; font-size:clamp(1rem,2vw,1.7rem); text-transform:uppercase; letter-spacing:.04em; }
.mpb-kuromi-zine small { color:#f08cbc; }
.mpb-ip-character--kuromi { right:2.4%; bottom:5%; width:clamp(150px,14vw,230px); opacity:.48; filter:drop-shadow(0 20px 28px rgba(31,15,40,.25)); transform:rotate(-5deg); }
.mpb-ip-character--kuromi-mini { left:4%; top:24%; width:clamp(95px,9vw,145px); opacity:.28; transform:rotate(7deg); }
.mpb-kuromi-checker { position:absolute; left:-2%; right:-2%; top:48%; height:20px; background:repeating-linear-gradient(90deg,#211728 0 20px,#e859a2 20px 40px); opacity:.16; transform:rotate(-2deg); }
.mpb-kuromi-chain { position:absolute; left:12%; bottom:11%; display:flex; gap:3px; transform:rotate(-12deg); opacity:.34; }
.mpb-kuromi-chain i { display:block; width:24px; height:13px; border:3px solid #37263e; border-radius:50%; margin-left:-7px; }
.mpb-kuromi-tape { position:absolute; left:34%; top:19%; padding:.45rem 1.2rem; color:#f9d9ea; background:#2d1d35; font:800 .58rem/1 ui-monospace,monospace; letter-spacing:.14em; transform:rotate(-7deg); box-shadow:inset 0 0 0 1px rgba(245,102,179,.32); }
.mpb-kuromi-bolt { position:absolute; color:rgba(229,62,151,.42); font-size:clamp(32px,4vw,68px); font-weight:900; text-shadow:4px 4px 0 rgba(41,24,48,.13); animation:mpb-kuromi-pulse 2.8s steps(2,end) infinite; }
.mpb-kuromi-bolt--one { left:24%; bottom:20%; }.mpb-kuromi-bolt--two { right:28%; top:31%; animation-delay:-1.2s; }
@keyframes mpb-kuromi-pulse { 50% { opacity:.35; transform:scale(1.16) rotate(7deg); } }

.music-page-bg.preset-hello-kitty-midnight .mpb-kitty-editorial,
.music-page-bg.preset-hello-kitty-midnight .mpb-kitty-ticket { color:#f3d39a; background:rgba(52,12,23,.58); border-color:rgba(226,180,99,.34); }
.music-page-bg.preset-hello-kitty-midnight .mpb-ip-bubble { color:#f1d7ba; background:rgba(55,13,25,.5); border-color:rgba(230,191,123,.26); }
.music-page-bg.preset-kuromi-midnight .mpb-kuromi-zine { background:rgba(7,5,9,.8); border-color:rgba(255,65,161,.56); box-shadow:12px 12px 0 rgba(255,54,158,.13); }

.mpb-kitty-dream-motion,
.mpb-kuromi-flight-motion { position: absolute; inset: 0; overflow: hidden; }
.mpb-kitty-dream-motion > span:not(.mpb-kitty-flyer) {
  position: absolute; color: rgba(225, 64, 103, 0.45); font-size: var(--ip-size); animation: mpb-kitty-drift var(--ip-duration) linear var(--ip-delay) infinite;
}
@keyframes mpb-kitty-drift { from { transform: translate3d(-45px, 60px, 0) rotate(-20deg); opacity: 0; } 20%, 75% { opacity: .58; } to { transform: translate3d(150px, -130px, 0) rotate(28deg); opacity: 0; } }
.mpb-kitty-cloud { position: absolute; width: 150px; height: 42px; border-radius: 999px; background: rgba(255,255,255,.48); filter: blur(.2px); animation: mpb-kitty-cloud 19s ease-in-out infinite alternate; }
.mpb-kitty-cloud::before,.mpb-kitty-cloud::after { content:''; position:absolute; bottom:0; border-radius:50%; background:inherit; }
.mpb-kitty-cloud::before { left:24px; width:64px; height:64px; }.mpb-kitty-cloud::after { right:22px; width:76px; height:76px; }
.mpb-kitty-cloud--one { left:7%; top:28%; }.mpb-kitty-cloud--two { right:9%; top:56%; animation-delay:-8s; transform:scale(.7); }
@keyframes mpb-kitty-cloud { to { translate: 85px 8px; } }
.mpb-kitty-flyer {
  position:absolute; left:-180px; bottom:18%; width:150px; height:104px; border:5px solid rgba(255,255,255,.66); border-radius:45% 55% 50% 50%; background-position:center; background-size:cover; box-shadow:0 18px 38px rgba(110,73,125,.15); animation:mpb-kitty-fly 24s ease-in-out infinite;
}
@keyframes mpb-kitty-fly { 0% { transform:translate3d(0,20px,0) rotate(-6deg); } 45% { transform:translate3d(56vw,-70px,0) rotate(4deg); } 100% { transform:translate3d(calc(100vw + 330px),10px,0) rotate(-3deg); } }

.mpb-kuromi-flight-motion > i { position:absolute; color:rgba(245,205,255,.62); font-style:normal; font-size:var(--ip-size); animation:mpb-kuromi-star var(--ip-duration) ease-in-out var(--ip-delay) infinite; }
@keyframes mpb-kuromi-star { 0%,100% { transform:scale(.45) rotate(0); opacity:.16; } 50% { transform:scale(1.25) rotate(90deg); opacity:.76; } }
.mpb-kuromi-moon { position:absolute; right:11%; top:13%; width:108px; height:108px; border-radius:50%; background:#fff0aa; box-shadow:0 0 55px rgba(255,240,170,.55); opacity:.48; }
.mpb-kuromi-moon::after { content:''; position:absolute; inset:-7px 15px 12px -18px; border-radius:50%; background:rgba(190,178,214,.96); }
.mpb-kuromi-comet { position:absolute; left:-190px; top:30%; width:145px; height:108px; border:5px solid rgba(255,220,247,.45); border-radius:52% 48% 45% 55%; background-position:center; background-size:cover; box-shadow:0 18px 42px rgba(44,27,65,.3); animation:mpb-kuromi-flight 18s cubic-bezier(.4,0,.3,1) infinite; }
.mpb-kuromi-trail { position:absolute; left:-32%; top:48%; width:46%; height:3px; border-radius:999px; background:linear-gradient(90deg,transparent,#f099d0,transparent); transform:rotate(-14deg); animation:mpb-kuromi-trail 18s ease-in-out infinite; opacity:.3; }
@keyframes mpb-kuromi-flight { 0% { transform:translate3d(0,80px,0) rotate(-8deg); } 45% { transform:translate3d(58vw,-80px,0) rotate(8deg); } 100% { transform:translate3d(calc(100vw + 350px),55px,0) rotate(-4deg); } }
@keyframes mpb-kuromi-trail { 45% { transform:translate3d(85vw,-90px,0) rotate(-14deg); } 100% { transform:translate3d(145vw,20px,0) rotate(-14deg); } }

@media (max-width: 768px) {
  .music-page-bg.music-page-bg--lyrics .mpb-theme-scene {
    right: -76px !important;
    bottom: 68px;
    width: 230px;
    height: 150px;
    opacity: 0.1;
  }

  .music-page-bg.music-page-bg--lyrics .mpb-shinchan-postcard:nth-child(n + 3) {
    display: none;
  }

  .music-page-bg.music-page-bg--lyrics .mpb-motion-walker-track {
    bottom: 52px;
    opacity: 0.5;
  }

  .mpb-ip-sticker--mini,
  .mpb-ip-bubble--right,
  .mpb-ip-symbol--two { display: none; }
  .mpb-ip-sticker--main { left: -22px; bottom: 20%; transform: scale(.72); }
  .mpb-kitty-flyer,
  .mpb-kuromi-comet { width: 110px; height: 78px; }
}

/* Mobile/tablet composition: the blurred crop supplies colour and light while
   the contained foreground preserves the subject of wide desktop artwork. */
.mpb-mobile-scene,
.mpb-mobile-motion {
  display: none;
}

@media (max-width: 767px),
  (min-width: 768px) and (max-width: 1366px) and (any-pointer: coarse) and (any-hover: none) {
  .music-page-bg > .mpb-theme-scene,
  .music-page-bg > .mpb-motion-layer,
  .music-page-bg > .mpb-shinchan-elements,
  .music-page-bg > .mpb-ip-elements {
    display: none;
  }

  .mpb-mobile-scene {
    position: absolute;
    inset: 0;
    z-index: 1;
    display: block;
    overflow: hidden;
    contain: strict;
    isolation: isolate;
  }

  .mpb-mobile-scene-atmosphere,
  .mpb-mobile-scene-subject {
    position: absolute;
    display: block;
    background-image: var(--mpb-mobile-scene-image);
    background-repeat: no-repeat;
    pointer-events: none;
  }

  .mpb-mobile-scene-atmosphere {
    inset: -9%;
    z-index: 0;
    background-position: var(--mpb-mobile-atmosphere-position, 50% 50%);
    background-size: cover;
    opacity: var(--mpb-mobile-atmosphere-opacity, 0.2);
    filter: blur(12px) saturate(1.14) contrast(0.94);
    transform: scale(1.08);
    -webkit-mask-image: linear-gradient(180deg, #000 0%, rgba(0, 0, 0, .9) 62%, transparent 100%);
    mask-image: linear-gradient(180deg, #000 0%, rgba(0, 0, 0, .9) 62%, transparent 100%);
  }

  .mpb-mobile-scene-subject {
    left: var(--mpb-mobile-subject-x, 50%);
    bottom: var(--mpb-mobile-subject-bottom, -1%);
    z-index: 1;
    width: var(--mpb-mobile-subject-width, 144vw);
    height: var(--mpb-mobile-subject-height, 52vh);
    background-position: var(--mpb-mobile-subject-position, 50% 60%);
    background-size: contain;
    opacity: var(--mpb-mobile-subject-opacity, 0.64);
    filter: saturate(1.04) contrast(1.02);
    transform: translate3d(-50%, 0, 0);
  }

  .mpb-mobile-scene--character .mpb-mobile-scene-subject {
    filter: saturate(1.04) drop-shadow(0 16px 24px rgba(42, 28, 51, .13));
  }

  /* 竖屏主题素材不再被当成横图裁切：整张画面会完整铺进手机背景，
     上方保留清晰的留白，方便标题与搜索框阅读。 */
  .mpb-mobile-scene--portrait .mpb-mobile-scene-atmosphere {
    inset: -12%;
    background-position: 50% 50%;
    background-size: cover;
    opacity: var(--mpb-mobile-atmosphere-opacity, .3);
    filter: blur(22px) saturate(1.12) brightness(.94);
    -webkit-mask-image: none;
    mask-image: none;
  }

  .mpb-mobile-scene--portrait .mpb-mobile-scene-subject {
    inset: 0;
    width: 100%;
    height: 100%;
    background-position: var(--mpb-mobile-subject-position, 50% 50%);
    background-size: cover;
    opacity: var(--mpb-mobile-subject-opacity, .64);
    filter: saturate(1.04) contrast(.98);
    transform: none;
    animation: mpb-mobile-portrait-breathe 14s ease-in-out infinite alternate;
  }

  /* 其余动态主题仍可复用旧横图，但手机端必须完整展示画面，
     而不是放大后只剩中间一小块。氛围层负责填满整屏，前景保留完整故事场景。 */
  .music-page-bg:is(
    .preset-motion-walk,
    .preset-motion-rain,
    .preset-motion-parade,
    .preset-hello-kitty-sakura-breeze,
    .preset-kuromi-sticker-storm,
    .preset-kuromi-vinyl-rush
  ) .mpb-mobile-scene--scene .mpb-mobile-scene-subject {
    left: 50%;
    bottom: max(7%, 58px);
    width: 100vw;
    height: 56.25vw;
    max-height: 390px;
    background-position: 50% 50%;
    background-size: contain;
    opacity: .72;
    filter: saturate(1.08) contrast(1.01) drop-shadow(0 16px 22px rgba(39, 30, 48, .15));
    transform: translate3d(-50%, 0, 0);
  }

  .music-page-bg--lyrics .mpb-mobile-scene-atmosphere {
    opacity: .08;
  }

  .music-page-bg--lyrics .mpb-mobile-scene-subject {
    bottom: 2%;
    opacity: .2;
  }

  .music-page-bg--lyrics .mpb-mobile-motion {
    display: none;
  }

  .mpb-mobile-motion {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: block;
    overflow: hidden;
    contain: strict;
    color: rgba(255, 255, 255, .72);
    pointer-events: none;
  }

  .mpb-mobile-motion i {
    --mobile-motion-delay: 0s;
    position: absolute;
    left: 12%;
    top: 22%;
    display: block;
    opacity: .54;
    animation: mpb-mobile-float 12s ease-in-out var(--mobile-motion-delay) infinite;
  }

  .mpb-mobile-motion i:nth-child(2) {
    --mobile-motion-delay: -4.2s;
    left: 72%;
    top: 38%;
    scale: .72;
  }

  .mpb-mobile-motion i:nth-child(3) {
    --mobile-motion-delay: -8.1s;
    left: 42%;
    top: 70%;
    scale: .56;
  }

  .mpb-mobile-motion--walk i {
    width: 24px;
    height: 18px;
    background: linear-gradient(135deg, rgba(255, 255, 255, .94), rgba(185, 225, 246, .68));
    clip-path: polygon(0 48%, 100% 0, 68% 100%, 50% 62%);
    animation-name: mpb-mobile-breeze;
  }

  .mpb-mobile-motion--rain i {
    top: -16%;
    width: 2px;
    height: 126px;
    border-radius: 999px;
    background: linear-gradient(180deg, transparent, rgba(218, 241, 255, .8), transparent);
    box-shadow: 58px 42px rgba(218, 241, 255, .34), 116px -24px rgba(218, 241, 255, .28);
    animation: mpb-mobile-rainfall 2.8s linear var(--mobile-motion-delay) infinite;
  }

  .mpb-mobile-motion--parade i {
    width: 22px;
    height: 28px;
    border: 2px solid rgba(255, 255, 255, .62);
    border-radius: 50% 50% 46% 46%;
    background: rgba(239, 94, 106, .48);
    box-shadow: 0 8px 18px rgba(190, 91, 76, .14);
  }

  .mpb-mobile-motion--parade i:nth-child(2) { background: rgba(255, 198, 76, .54); }
  .mpb-mobile-motion--parade i:nth-child(3) { background: rgba(102, 184, 151, .5); }

  .mpb-mobile-motion--parade i::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 100%;
    width: 1px;
    height: 46px;
    background: currentColor;
  }

  .mpb-mobile-motion--kitty-dream i {
    width: 18px;
    height: 18px;
    border-radius: 5px 0;
    background: rgba(236, 101, 150, .46);
    transform: rotate(45deg);
    animation-name: mpb-mobile-heart;
  }

  .mpb-mobile-motion--kitty-dream i::before,
  .mpb-mobile-motion--kitty-dream i::after {
    content: '';
    position: absolute;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: inherit;
  }

  .mpb-mobile-motion--kitty-dream i::before { left: -9px; }
  .mpb-mobile-motion--kitty-dream i::after { top: -9px; }

  .mpb-mobile-motion--kitty-sakura i {
    width: 18px;
    height: 11px;
    border-radius: 90% 12% 90% 12%;
    background: rgba(239, 142, 176, .62);
    animation-name: mpb-mobile-petal;
  }

  .mpb-mobile-motion--kitty-carousel i,
  .mpb-mobile-motion--kuromi-flight i {
    width: 22px;
    height: 22px;
    background: rgba(255, 229, 137, .72);
    clip-path: polygon(50% 0, 61% 36%, 100% 50%, 61% 64%, 50% 100%, 39% 64%, 0 50%, 39% 36%);
    animation-name: mpb-mobile-twinkle;
  }

  .mpb-mobile-motion--kitty-carousel {
    background:
      radial-gradient(circle at 18% 26%, rgba(255, 234, 163, .32), transparent 13%),
      radial-gradient(circle at 78% 55%, rgba(255, 188, 213, .2), transparent 16%);
    mix-blend-mode: screen;
  }

  .mpb-mobile-motion--kitty-carousel::before,
  .mpb-mobile-motion--kitty-carousel::after {
    content: '';
    position: absolute;
    inset: auto;
    border-radius: 50%;
    pointer-events: none;
  }

  .mpb-mobile-motion--kitty-carousel::before {
    top: 13%;
    right: 12%;
    width: 5px;
    height: 5px;
    background: #fff3bd;
    box-shadow: -88px 72px 0 #ffe1ed, -142px 224px 0 #fff3bd, 48px 310px 0 #ffe1ed;
    animation: mpb-mobile-carousel-sparkle 3.8s ease-in-out infinite;
  }

  .mpb-mobile-motion--kitty-carousel::after {
    right: -14vw;
    bottom: 12%;
    width: 52vw;
    height: 52vw;
    border: 1px solid rgba(255, 234, 184, .55);
    box-shadow: 0 0 34px rgba(255, 192, 209, .24), inset 0 0 26px rgba(255, 227, 168, .14);
    animation: mpb-mobile-carousel-orbit 16s linear infinite;
  }

  .mpb-mobile-motion--kuromi-flight i {
    background: rgba(242, 181, 238, .68);
  }

  .mpb-mobile-motion--kuromi-stickers i {
    width: 34px;
    height: 29px;
    border: 2px solid rgba(55, 35, 67, .5);
    border-radius: 9px 5px 10px 6px;
    background: rgba(232, 103, 171, .48);
    box-shadow: 4px 4px 0 rgba(56, 38, 67, .12);
    animation-name: mpb-mobile-petal;
  }

  .mpb-mobile-motion--kuromi-stickers i::after {
    content: '★';
    position: absolute;
    inset: 0;
    color: rgba(255, 240, 250, .86);
    font-size: 15px;
    line-height: 25px;
    text-align: center;
  }

  .mpb-mobile-motion--kuromi-vinyl i {
    width: 32px;
    height: 32px;
    border: 2px solid rgba(231, 107, 177, .38);
    border-radius: 50%;
    background: radial-gradient(circle, #ed70ad 0 11%, #261c2d 12% 38%, #5c3b6b 39% 43%, #211827 44% 100%);
    animation-name: mpb-mobile-vinyl;
  }
}

@keyframes mpb-mobile-portrait-breathe {
  from { transform: scale(1.01); filter: saturate(1.02) contrast(.98); }
  to { transform: scale(1.055); filter: saturate(1.1) contrast(1.01); }
}

@keyframes mpb-mobile-carousel-sparkle {
  0%, 100% { opacity: .35; transform: scale(.65); }
  50% { opacity: 1; transform: scale(1.5); }
}

@keyframes mpb-mobile-carousel-orbit {
  to { transform: rotate(360deg); }
}

@media (max-width: 1366px) and (any-pointer: coarse) and (any-hover: none) and (orientation: landscape) {
  .mpb-mobile-scene-subject {
    bottom: -8%;
    width: min(var(--mpb-mobile-subject-width, 144vw), 94vw);
    height: min(var(--mpb-mobile-subject-height, 52vh), 84vh);
  }

  .mpb-mobile-scene--character .mpb-mobile-scene-subject {
    bottom: -16%;
    width: min(var(--mpb-mobile-subject-width, 88vw), 62vw);
    height: 86vh;
  }
}

@keyframes mpb-mobile-float {
  0%, 100% { transform: translate3d(0, 10px, 0) rotate(-5deg); }
  50% { transform: translate3d(14px, -18px, 0) rotate(6deg); }
}

@keyframes mpb-mobile-breeze {
  0% { transform: translate3d(-70px, 35px, 0) rotate(-10deg); opacity: 0; }
  18%, 78% { opacity: .58; }
  100% { transform: translate3d(56vw, -42px, 0) rotate(8deg); opacity: 0; }
}

@keyframes mpb-mobile-rainfall {
  from { transform: translate3d(-30px, -24vh, 0) rotate(12deg); opacity: 0; }
  22% { opacity: .58; }
  to { transform: translate3d(24px, 118vh, 0) rotate(12deg); opacity: 0; }
}

@keyframes mpb-mobile-petal {
  0%, 100% { transform: translate3d(-18px, -20px, 0) rotate(-18deg); opacity: .18; }
  50% { transform: translate3d(28px, 42px, 0) rotate(42deg); opacity: .62; }
}

@keyframes mpb-mobile-heart {
  0%, 100% { transform: translate3d(0, 10px, 0) rotate(40deg) scale(.82); opacity: .28; }
  50% { transform: translate3d(14px, -18px, 0) rotate(50deg) scale(1.06); opacity: .66; }
}

@keyframes mpb-mobile-twinkle {
  0%, 100% { transform: scale(.62) rotate(0); opacity: .22; }
  50% { transform: scale(1.12) rotate(45deg); opacity: .76; }
}

@keyframes mpb-mobile-vinyl {
  from { transform: translate3d(-10px, 8px, 0) rotate(0); }
  to { transform: translate3d(12px, -12px, 0) rotate(360deg); }
}
</style>

<!-- 浅色（阳光）模式下对背景装饰的调校。
     必须放在非 scoped 块里：Vue 的 scoped 编译器会把
     :global(body:not(.dark-mode)) 后面的后代选择器吃掉，
     导致 opacity/filter 错误地作用到 <body> 本身（整页变糊变紫）。 -->
<style>
body:not(.dark-mode) .music-page-bg .mpb-orb {
  opacity: 0.38;
  filter: blur(64px);
}

body:not(.dark-mode) .music-page-bg .mpb-theme-wash {
  opacity: 0.92;
}

body:not(.dark-mode) .music-page-bg.preset-starry-radio .mpb-theme-wash {
  background:
    radial-gradient(circle at 72% 20%, rgba(106, 128, 205, 0.24), transparent 32%),
    radial-gradient(circle at 18% 80%, rgba(142, 117, 187, 0.18), transparent 36%),
    linear-gradient(145deg, #e7ecf8, #dce5f5 52%, #e9e1f1);
}

body:not(.dark-mode) .music-page-bg .mpb-orb--1 {
  background: radial-gradient(circle, rgba(167, 139, 250, 0.35) 0%, transparent 68%);
}

body:not(.dark-mode) .music-page-bg .mpb-orb--2 {
  background: radial-gradient(circle, rgba(56, 189, 248, 0.28) 0%, transparent 70%);
}

body:not(.dark-mode) .music-page-bg .mpb-orb--3 {
  background: radial-gradient(circle, rgba(255, 107, 129, 0.22) 0%, transparent 72%);
}

body:not(.dark-mode) .music-page-bg .mpb-note {
  color: rgba(109, 40, 217, 0.35);
  text-shadow: none;
}

body:not(.dark-mode) .music-page-bg.preset-family-picnic .mpb-note { color: rgba(56, 139, 75, 0.42); }
body:not(.dark-mode) .music-page-bg.preset-sunset-road .mpb-note { color: rgba(210, 91, 72, 0.42); }
body:not(.dark-mode) .music-page-bg.preset-starry-radio .mpb-note { color: rgba(66, 83, 150, 0.42); }
body:not(.dark-mode) .music-page-bg.preset-crayon-room .mpb-note { color: rgba(194, 116, 49, 0.42); }
body:not(.dark-mode) .music-page-bg.preset-rainy-day .mpb-note { color: rgba(49, 119, 164, 0.42); }

body:not(.dark-mode) .music-page-bg .mpb-spark {
  background: rgba(109, 40, 217, 0.55);
  box-shadow: 0 0 6px rgba(109, 40, 217, 0.25);
}

body:not(.dark-mode) .music-page-bg .mpb-vignette {
  opacity: 0.18;
}

body:not(.dark-mode) .music-page-bg.preset-family-picnic .mpb-orb--1,
body:not(.dark-mode) .music-page-bg.preset-family-picnic .mpb-orb--3 {
  background: radial-gradient(circle, rgba(104, 183, 92, 0.4), transparent 70%);
}

body:not(.dark-mode) .music-page-bg.preset-sunset-road .mpb-orb--1,
body:not(.dark-mode) .music-page-bg.preset-sunset-road .mpb-orb--3 {
  background: radial-gradient(circle, rgba(255, 128, 96, 0.4), transparent 70%);
}

body:not(.dark-mode) .music-page-bg.preset-starry-radio .mpb-orb--1,
body:not(.dark-mode) .music-page-bg.preset-starry-radio .mpb-orb--4 {
  background: radial-gradient(circle, rgba(79, 101, 184, 0.48), transparent 70%);
}

body:not(.dark-mode) .music-page-bg.preset-crayon-room .mpb-orb--1,
body:not(.dark-mode) .music-page-bg.preset-crayon-room .mpb-orb--3 {
  background: radial-gradient(circle, rgba(226, 151, 75, 0.38), transparent 70%);
}

body:not(.dark-mode) .music-page-bg.preset-rainy-day .mpb-orb--2,
body:not(.dark-mode) .music-page-bg.preset-rainy-day .mpb-orb--4 {
  background: radial-gradient(circle, rgba(70, 139, 184, 0.4), transparent 70%);
}

body:is(.dark-mode, .music-theme-dark) .music-page-bg {
  background: #111827;
}

body:is(.dark-mode, .music-theme-dark) .music-page-bg .mpb-theme-wash {
  opacity: 1;
}

body:is(.dark-mode, .music-theme-dark) .music-page-bg.preset-kasukabe-sky .mpb-theme-wash {
  background:
    radial-gradient(circle at 15% 16%, rgba(241, 180, 72, 0.18), transparent 28%),
    radial-gradient(circle at 82% 20%, rgba(54, 153, 199, 0.2), transparent 34%),
    linear-gradient(145deg, #152337, #142c3d 52%, #29243b);
}

body:is(.dark-mode, .music-theme-dark) .music-page-bg.preset-family-picnic .mpb-theme-wash {
  background:
    radial-gradient(ellipse at 50% 110%, rgba(82, 139, 70, 0.26), transparent 50%),
    radial-gradient(circle at 18% 14%, rgba(207, 181, 77, 0.14), transparent 27%),
    linear-gradient(145deg, #14281f, #18352b 52%, #243128);
}

body:is(.dark-mode, .music-theme-dark) .music-page-bg.preset-sunset-road .mpb-theme-wash {
  background:
    radial-gradient(circle at 76% 18%, rgba(241, 150, 74, 0.22), transparent 30%),
    linear-gradient(145deg, #34231f, #40272c 50%, #30233a);
}

body:is(.dark-mode, .music-theme-dark) .music-page-bg.preset-starry-radio .mpb-theme-wash {
  background:
    radial-gradient(circle at 72% 20%, rgba(89, 122, 207, 0.28), transparent 32%),
    radial-gradient(circle at 16% 82%, rgba(83, 61, 151, 0.24), transparent 36%),
    linear-gradient(145deg, #0b1730, #121c3e 52%, #172947);
}

body:is(.dark-mode, .music-theme-dark) .music-page-bg.preset-crayon-room .mpb-theme-wash {
  background:
    repeating-linear-gradient(12deg, transparent 0 44px, rgba(237, 180, 104, 0.025) 45px 47px),
    radial-gradient(circle at 16% 22%, rgba(209, 134, 66, 0.16), transparent 28%),
    linear-gradient(145deg, #2c241d, #3a2925 52%, #263026);
}

body:is(.dark-mode, .music-theme-dark) .music-page-bg.preset-rainy-day .mpb-theme-wash {
  background:
    repeating-linear-gradient(112deg, transparent 0 42px, rgba(114, 178, 216, 0.04) 43px 45px, transparent 46px 82px),
    radial-gradient(circle at 74% 20%, rgba(85, 151, 193, 0.2), transparent 30%),
    linear-gradient(145deg, #142431, #1b3042 52%, #20283a);
}

body:is(.dark-mode, .music-theme-dark) .music-page-bg .mpb-theme-scene {
  border-color: rgba(229, 236, 247, 0.2);
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.42);
  opacity: 0.3;
  filter: brightness(0.82) saturate(1.18) contrast(1.08);
}

body:is(.dark-mode, .music-theme-dark) .music-page-bg.preset-starry-radio .mpb-theme-scene {
  opacity: 0.38;
  filter: brightness(0.88) saturate(1.24) contrast(1.1);
}

body:is(.dark-mode, .music-theme-dark) .music-page-bg .mpb-shinchan-postcard {
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.32);
  opacity: 0.13;
}

body:is(.dark-mode, .music-theme-dark) .music-page-bg .mpb-vignette {
  background: radial-gradient(ellipse at 50% 100%, transparent 46%, rgba(3, 7, 18, 0.52) 100%);
  opacity: 0.44;
}

body:is(.dark-mode, .music-theme-dark) .music-page-bg .mpb-note {
  color: rgba(199, 216, 255, 0.38);
  text-shadow: 0 0 12px rgba(91, 127, 196, 0.24);
}

body:is(.dark-mode, .music-theme-dark) .music-page-bg .mpb-spark {
  background: rgba(221, 232, 255, 0.66);
  box-shadow: 0 0 8px rgba(120, 153, 218, 0.42);
}

body.music-theme-dark .music-page-bg.preset-midnight-cinema {
  background: #090a0d;
}

body.music-theme-dark .music-page-bg.preset-midnight-cinema .mpb-theme-scene {
  border-color: rgba(255, 222, 162, 0.2);
  opacity: 0.4;
  filter: saturate(0.86) contrast(1.08) brightness(0.74);
}

body.music-theme-dark .music-page-bg.preset-midnight-cinema .mpb-note {
  color: rgba(244, 188, 104, 0.4);
  text-shadow: 0 0 12px rgba(154, 60, 67, 0.22);
}

body.music-theme-dark .music-page-bg.preset-midnight-cinema .mpb-spark {
  background: rgba(255, 222, 166, 0.62);
  box-shadow: 0 0 8px rgba(196, 91, 72, 0.34);
}

body.music-theme-dark .music-page-bg.preset-hello-kitty-midnight {
  background: #17080d;
}

body.music-theme-dark .music-page-bg.preset-hello-kitty-midnight .mpb-theme-wash {
  opacity: .96;
  background:
    radial-gradient(circle at 14% 17%, rgba(226, 181, 103, .18), transparent 24%),
    radial-gradient(circle at 82% 24%, rgba(169, 31, 64, .3), transparent 31%),
    repeating-linear-gradient(90deg, rgba(255, 242, 218, .025) 0 1px, transparent 1px 48px),
    linear-gradient(145deg, rgba(25, 7, 13, .98), rgba(68, 16, 31, .94) 50%, rgba(18, 6, 11, .99));
}

body.music-theme-dark .music-page-bg.preset-hello-kitty-midnight .mpb-theme-scene {
  border-color: rgba(228, 183, 106, .24);
  opacity: .24;
  filter: sepia(.16) saturate(.78) brightness(.66) contrast(1.08);
}

body.music-theme-dark .music-page-bg.preset-hello-kitty-midnight .mpb-note { color: rgba(225, 172, 92, .36); }
body.music-theme-dark .music-page-bg.preset-hello-kitty-midnight .mpb-spark { background: rgba(241, 210, 155, .58); box-shadow: 0 0 9px rgba(211, 146, 63, .32); }

body.music-theme-dark .music-page-bg.preset-kuromi-midnight {
  background: #050407;
}

body.music-theme-dark .music-page-bg.preset-kuromi-midnight .mpb-theme-wash {
  opacity: .98;
  background:
    linear-gradient(135deg, transparent 0 47%, rgba(242, 57, 153, .12) 48% 50%, transparent 51%) 0 0 / 72px 72px,
    radial-gradient(circle at 78% 18%, rgba(245, 55, 154, .23), transparent 28%),
    radial-gradient(circle at 14% 74%, rgba(113, 70, 157, .22), transparent 31%),
    linear-gradient(145deg, #070509, #1a0e20 52%, #030204);
}

body.music-theme-dark .music-page-bg.preset-kuromi-midnight .mpb-theme-scene {
  border-color: rgba(255, 75, 167, .28);
  opacity: .22;
  filter: saturate(.92) brightness(.64) contrast(1.16);
}

body.music-theme-dark .music-page-bg.preset-kuromi-midnight .mpb-note { color: rgba(255, 72, 164, .42); text-shadow: 0 0 14px rgba(255, 44, 151, .24); }
body.music-theme-dark .music-page-bg.preset-kuromi-midnight .mpb-spark { background: rgba(247, 112, 185, .65); box-shadow: 0 0 9px rgba(255, 54, 158, .42); }

/* Additional Hello Kitty and Kuromi scenes: each one uses its own setting, palette and motion language. */
.music-page-bg.preset-hello-kitty-patisserie {
  background: linear-gradient(145deg, #fff7e8, #ffd9d7 48%, #e8f4dc);
}
.music-page-bg.preset-hello-kitty-patisserie .mpb-theme-wash {
  opacity: .8;
  background:
    radial-gradient(circle at 14% 18%, rgba(255, 112, 122, .22), transparent 23%),
    radial-gradient(circle at 84% 23%, rgba(255, 211, 120, .24), transparent 26%),
    linear-gradient(145deg, rgba(255, 251, 238, .56), rgba(255, 195, 202, .44) 52%, rgba(217, 244, 220, .5));
}
.music-page-bg.preset-hello-kitty-candy-carousel {
  background: linear-gradient(145deg, #fff1f5, #f7dfcb 48%, #bfc9ef);
}
.music-page-bg.preset-hello-kitty-candy-carousel .mpb-theme-wash {
  opacity: .79;
  background:
    linear-gradient(90deg, rgba(255, 247, 250, .9) 0%, rgba(255, 233, 240, .46) 42%, rgba(255, 255, 255, .08) 72%),
    url('/images/music-themes/kitty-carousel-sunrise.png') center / cover no-repeat;
}
.music-page-bg.preset-hello-kitty-ribbon-cinema {
  background: linear-gradient(145deg, #fff1e8, #f6b9b1 47%, #d98792);
}
.music-page-bg.preset-hello-kitty-ribbon-cinema .mpb-theme-wash {
  opacity: .95;
  background:
    repeating-linear-gradient(90deg, rgba(125, 47, 58, .045) 0 2px, transparent 2px 48px),
    radial-gradient(circle at 20% 18%, rgba(255, 239, 196, .58), transparent 23%),
    linear-gradient(145deg, rgba(255, 245, 232, .86), rgba(239, 149, 151, .76) 52%, rgba(155, 55, 75, .74));
}
.music-page-bg.preset-hello-kitty-sakura-breeze {
  background: linear-gradient(145deg, #fff9f6, #f8d8e5 47%, #dceef4);
}
.music-page-bg.preset-hello-kitty-sakura-breeze .mpb-theme-wash {
  opacity: .88;
  background:
    radial-gradient(circle at 76% 18%, rgba(255, 167, 195, .34), transparent 25%),
    radial-gradient(circle at 14% 82%, rgba(222, 174, 194, .24), transparent 30%),
    linear-gradient(145deg, rgba(255, 251, 248, .8), rgba(249, 207, 224, .62) 52%, rgba(220, 238, 244, .68));
}
.music-page-bg.preset-kuromi-arcade-noir {
  background: #0e0a1d;
}
.music-page-bg.preset-kuromi-arcade-noir .mpb-theme-wash {
  opacity: .84;
  background:
    radial-gradient(circle at 15% 18%, rgba(173, 86, 255, .25), transparent 25%),
    radial-gradient(circle at 84% 12%, rgba(255, 74, 184, .22), transparent 27%),
    linear-gradient(145deg, rgba(12, 8, 27, .82), rgba(47, 18, 68, .72) 54%, rgba(14, 7, 30, .86));
}
.music-page-bg.preset-kuromi-vinyl-rush {
  background: #180a23;
}
.music-page-bg.preset-kuromi-vinyl-rush .mpb-theme-wash {
  opacity: .82;
  background:
    linear-gradient(90deg, rgba(22, 7, 30, .9) 0%, rgba(38, 11, 51, .54) 45%, rgba(24, 8, 34, .12) 78%),
    url('/images/music-themes/kuromi-vinyl-night.png') center / cover no-repeat;
}
.music-page-bg.preset-kuromi-violet-library {
  background: linear-gradient(145deg, #161128, #40305a 52%, #1d1734);
}
.music-page-bg.preset-kuromi-violet-library .mpb-theme-wash {
  opacity: .96;
  background:
    repeating-linear-gradient(90deg, rgba(223, 196, 255, .04) 0 1px, transparent 1px 58px),
    radial-gradient(circle at 78% 18%, rgba(183, 147, 255, .18), transparent 27%),
    linear-gradient(145deg, rgba(18, 13, 35, .94), rgba(62, 43, 92, .84) 52%, rgba(19, 12, 35, .95));
}
.music-page-bg.preset-kuromi-sticker-storm {
  background: linear-gradient(145deg, #251334, #641f5d 48%, #1d1639);
}
.music-page-bg.preset-kuromi-sticker-storm .mpb-theme-wash {
  opacity: .95;
  background:
    repeating-linear-gradient(135deg, rgba(255, 107, 190, .08) 0 2px, transparent 2px 40px),
    radial-gradient(circle at 16% 20%, rgba(255, 109, 192, .24), transparent 23%),
    linear-gradient(145deg, rgba(32, 16, 45, .92), rgba(99, 30, 88, .78) 52%, rgba(23, 17, 48, .94));
}
.music-page-bg:is(.preset-hello-kitty-patisserie, .preset-hello-kitty-ribbon-cinema, .preset-hello-kitty-sakura-breeze, .preset-hello-kitty-candy-carousel) .mpb-theme-scene {
  border-color: rgba(255, 255, 255, .64);
  right: 3.5%; left: auto; bottom: 7%; width: min(32vw, 540px); height: min(29vw, 400px);
  border-radius: 30px 12px 30px 12px; opacity: .27; filter: saturate(1.02) contrast(.97);
}
.music-page-bg:is(.preset-kuromi-arcade-noir, .preset-kuromi-violet-library, .preset-kuromi-sticker-storm, .preset-kuromi-vinyl-rush) .mpb-theme-scene {
  border-color: rgba(230, 194, 255, .38);
  left: 3.5%; right: auto; bottom: 7%; width: min(33vw, 545px); height: min(30vw, 410px);
  border-radius: 8px 34px 8px 34px; opacity: .29; filter: saturate(.96) contrast(1.08);
}
.music-page-bg:is(.preset-hello-kitty-patisserie, .preset-hello-kitty-ribbon-cinema, .preset-hello-kitty-sakura-breeze, .preset-hello-kitty-candy-carousel) .mpb-note { color: rgba(210, 68, 105, .44); }
.music-page-bg:is(.preset-kuromi-arcade-noir, .preset-kuromi-violet-library, .preset-kuromi-sticker-storm, .preset-kuromi-vinyl-rush) .mpb-note { color: rgba(244, 126, 209, .5); }

/* The two newest scenes deliberately abandon the shared pastry/arcade framing. */
.music-page-bg.preset-hello-kitty-candy-carousel .mpb-theme-scene {
  right: 4%; bottom: 9%; width: min(40vw, 650px); height: min(32vw, 470px);
  border-color: rgba(255, 255, 230, .82); border-radius: 48% 48% 28% 28% / 35% 35% 22% 22%;
  opacity: .4; filter: saturate(1.02) contrast(1.01); box-shadow: 0 24px 54px rgba(177, 89, 137, .2);
}
.music-page-bg.preset-hello-kitty-candy-carousel .mpb-theme-scene-copy { color: #80415d; text-shadow: 0 2px 12px rgba(255,255,255,.65); }
.music-page-bg.preset-hello-kitty-candy-carousel .mpb-ip-elements--hello-kitty { opacity: .14; filter: saturate(.78); }
.music-page-bg.preset-hello-kitty-candy-carousel .mpb-note { color: rgba(204, 86, 137, .58); }
.music-page-bg.preset-hello-kitty-candy-carousel .mpb-kitty-carousel-motion > i { background: var(--carousel-dot, #e785b2); box-shadow: 0 0 13px rgba(217, 110, 161, .7); }
.music-page-bg.preset-hello-kitty-candy-carousel .mpb-kitty-carousel-wheel { border-color: rgba(255, 221, 172, .84); box-shadow: inset 0 0 0 15px rgba(224, 133, 178, .2), 0 0 36px rgba(191, 133, 192, .22); }
.music-page-bg.preset-hello-kitty-candy-carousel .mpb-kitty-carousel-wheel::after { background: #ffe2a8; box-shadow: 0 0 0 11px rgba(224, 133, 178, .4); }
.music-page-bg.preset-hello-kitty-candy-carousel .mpb-kitty-carousel-wheel b { background: rgba(216, 119, 162, .56); }
.music-page-bg.preset-hello-kitty-candy-carousel .mpb-kitty-carousel-light { background: #ffe2ab; box-shadow: 0 0 26px #f3ba72; }

/* Final Hello Kitty scene compositions: no preset shares the same left-card/right-frame layout. */
.music-page-bg.preset-hello-kitty-garden .mpb-theme-scene {
  right: 3%;
  bottom: 68px;
  left: auto;
  width: min(42vw, 690px);
  height: min(43vw, 520px);
  border: 12px solid rgba(255, 255, 245, .5);
  border-radius: 50% 50% 16px 16px / 34% 34% 16px 16px;
  opacity: .22;
  filter: saturate(1.05) contrast(.98);
  box-shadow: 0 26px 70px rgba(92, 137, 92, .12);
  transform: none;
}

.music-page-bg.preset-hello-kitty-midnight .mpb-theme-scene {
  right: 6%;
  bottom: 76px;
  left: auto;
  width: min(31vw, 510px);
  height: min(46vw, 610px);
  border: 13px solid rgba(205, 154, 82, .28);
  border-bottom-width: 18px;
  border-radius: 50% 50% 12px 12px / 26% 26% 12px 12px;
  opacity: .3;
  filter: saturate(.88) brightness(.66) contrast(1.08);
  box-shadow: 0 0 0 3px rgba(82, 20, 37, .62), 0 30px 80px rgba(0, 0, 0, .38);
  transform: none;
}

.music-page-bg.preset-hello-kitty-dream .mpb-theme-scene,
.music-page-bg.preset-hello-kitty-candy-carousel .mpb-theme-scene {
  display: none;
}

.music-page-bg.preset-hello-kitty-patisserie .mpb-theme-scene {
  right: 3%;
  bottom: 68px;
  left: auto;
  width: min(45vw, 730px);
  height: min(39vw, 500px);
  border: 14px solid rgba(255, 248, 225, .56);
  border-top-width: 28px;
  border-radius: 13px;
  opacity: .34;
  filter: saturate(1.02) contrast(.97);
  box-shadow: 0 24px 64px rgba(127, 82, 67, .13);
  transform: none;
}

.music-page-bg.preset-hello-kitty-ribbon-cinema .mpb-theme-scene {
  right: auto;
  left: 25%;
  bottom: 92px;
  width: min(51vw, 820px);
  height: min(31vw, 440px);
  border: 16px solid rgba(92, 31, 45, .58);
  border-top-color: rgba(255, 225, 167, .42);
  border-radius: 7px;
  opacity: .32;
  filter: saturate(.93) contrast(1.04);
  box-shadow: 0 0 0 4px rgba(255, 230, 176, .2), 0 28px 76px rgba(104, 37, 50, .25);
  transform: none;
}

.music-page-bg.preset-hello-kitty-sakura-breeze .mpb-theme-scene {
  right: 4%;
  bottom: 74px;
  left: auto;
  width: min(36vw, 590px);
  height: min(43vw, 560px);
  border: 6px dashed rgba(221, 117, 143, .32);
  border-radius: 12px 32px 14px 28px;
  opacity: .24;
  filter: saturate(.9) contrast(.98);
  box-shadow: 12px 15px 0 rgba(114, 166, 185, .08), 0 24px 60px rgba(121, 84, 100, .1);
  transform: rotate(2deg);
}

.music-page-bg.preset-hello-kitty-garden .mpb-theme-scene-copy {
  color: #76523e;
  text-shadow: 0 2px 12px rgba(255, 255, 255, .7);
}

.music-page-bg.preset-hello-kitty-sakura-breeze .mpb-theme-scene-copy {
  color: #9a536d;
  text-shadow: 0 2px 12px rgba(255, 255, 255, .72);
}

@media (max-width: 768px) {
  .mpb-kitty-signature {
    opacity: .37;
  }

  .mpb-kitty-scene-label,
  .mpb-kitty-menu-board,
  .mpb-kitty-dream-stars i:nth-child(n + 4),
  .mpb-kitty-flower-bed i:nth-child(n + 4) {
    display: none;
  }

  .music-page-bg.preset-hello-kitty-garden .mpb-theme-scene,
  .music-page-bg.preset-hello-kitty-patisserie .mpb-theme-scene,
  .music-page-bg.preset-hello-kitty-ribbon-cinema .mpb-theme-scene,
  .music-page-bg.preset-hello-kitty-sakura-breeze .mpb-theme-scene {
    right: -62px !important;
    bottom: 70px;
    left: auto !important;
    width: 250px;
    height: 168px;
    border-width: 6px;
    opacity: .14;
    transform: none;
  }

  .music-page-bg.preset-hello-kitty-midnight .mpb-theme-scene {
    right: -36px !important;
    bottom: 68px;
    left: auto !important;
    width: 190px;
    height: 278px;
    border-width: 7px;
    opacity: .18;
  }

  .mpb-kitty-garden-arch {
    left: -168px;
    bottom: 46px;
    width: 320px;
    height: 280px;
    border-width: 7px;
  }
  .mpb-kitty-flower-bed { right: -28px; bottom: 46px; width: 72%; height: 72px; }
  .mpb-kitty-tea-table { left: 24%; bottom: 70px; transform: scale(.58); transform-origin: bottom left; }
  .mpb-kitty-scene-character--garden { left: -18px; bottom: 64px; width: 105px; }

  .mpb-kitty-ballroom-panels { inset: 7% 2% 46px; }
  .mpb-kitty-chandelier { left: 46%; transform: scale(.56); transform-origin: top; }
  .mpb-kitty-banquet-table { left: 27%; bottom: 46px; width: 58%; height: 86px; }
  .mpb-kitty-lounge-sofa { left: -88px; bottom: 48px; width: 250px; height: 118px; }
  .mpb-kitty-midnight-monogram { left: 3%; top: 18%; font-size: 4rem; }

  .mpb-kitty-dream-moon { top: 9%; left: -34px; width: 110px; }
  .mpb-kitty-cloud-stair { left: -82px; bottom: 48px; transform: scale(.68); transform-origin: bottom left; }
  .mpb-kitty-dream-ribbon { right: -36%; bottom: 12%; width: 92%; }

  .mpb-kitty-shop-awning { left: -52px; bottom: 286px; width: 230px; height: 58px; }
  .mpb-kitty-pastry-counter { left: -56px; bottom: 46px; width: 232px; height: 244px; border-width: 7px; }
  .mpb-kitty-cake-stand { left: 2%; bottom: 78px; transform: scale(.58); transform-origin: bottom left; }
  .mpb-kitty-dessert-shelf { left: -28px; bottom: 210px; width: 200px; transform: scale(.72); transform-origin: bottom left; }
  .mpb-kitty-macaron-stack { right: -22px; top: 18%; transform: scale(.64) rotate(4deg); transform-origin: top right; }
  .mpb-kitty-scene-character--patisserie { left: 11%; bottom: 60px; width: 96px; }

  .mpb-kitty-cinema-curtain { width: 36%; }
  .mpb-kitty-cinema-marquee { left: 1%; top: 15%; transform: scale(.62) rotate(-2deg); transform-origin: top left; }
  .mpb-kitty-cinema-film { bottom: 46px; height: 42px; }
  .mpb-kitty-popcorn { left: -16px; bottom: 76px; transform: scale(.58); transform-origin: bottom left; }

  .mpb-kitty-sakura-branch { left: -34%; top: 17%; width: 92%; }
  .mpb-kitty-writing-desk { left: -142px; bottom: 46px; width: 315px; height: 132px; }
  .mpb-kitty-ink-bottle { left: 29%; bottom: 150px; transform: scale(.68); }
  .mpb-kitty-scene-character--sakura { left: -4px; bottom: 65px; width: 105px; }

  .mpb-kitty-fairground-canopy { right: -94px; top: 9%; width: 320px; height: 112px; }
  .mpb-kitty-carousel-stage { right: -76px; bottom: 46px; width: 330px; height: 78px; }
  .mpb-kitty-fairground-lights { left: -20%; right: -20%; top: 21%; }
  .mpb-kitty-ticket-booth { left: -42px; bottom: 52px; transform: scale(.63); transform-origin: bottom left; }
}

.music-page-bg.preset-kuromi-vinyl-rush .mpb-theme-scene {
  left: 4%; bottom: 8%; width: min(43vw, 700px); height: min(33vw, 485px);
  border-color: rgba(229, 122, 192, .48); border-radius: 38px 8px 38px 8px;
  opacity: .4; filter: saturate(1.04) contrast(1.05); box-shadow: 0 24px 58px rgba(180, 54, 148, .24);
}
.music-page-bg.preset-kuromi-vinyl-rush .mpb-theme-scene-copy { color: #fff0fb; text-shadow: 0 2px 14px rgba(93, 16, 94, .72); }
.music-page-bg.preset-kuromi-vinyl-rush .mpb-ip-elements--kuromi { opacity: .12; filter: saturate(.72); }
.music-page-bg.preset-kuromi-vinyl-rush .mpb-note { color: rgba(235, 111, 192, .72); text-shadow: 0 0 14px rgba(179, 46, 151, .42); }
.music-page-bg.preset-kuromi-vinyl-rush .mpb-kuromi-vinyl-motion > i { background: #e36bb6; box-shadow: 0 0 13px #8c6ee9; }
.music-page-bg.preset-kuromi-vinyl-rush .mpb-kuromi-vinyl-disc { background: repeating-radial-gradient(circle, #160919 0 3px, #4d2054 4px 5px, #09050e 6px 8px); border-color: rgba(228, 105, 186, .42); box-shadow: 0 0 42px rgba(178, 49, 147, .3); }
.music-page-bg.preset-kuromi-vinyl-rush .mpb-kuromi-vinyl-disc::after { background: #e477b8; box-shadow: 0 0 0 9px rgba(221, 155, 230, .18); }
.music-page-bg.preset-kuromi-vinyl-rush .mpb-kuromi-speed-line { background: linear-gradient(90deg, transparent, rgba(231, 96, 183, .95), rgba(132, 115, 232, .28)); }

.mpb-kitty-sakura-motion,
.mpb-kitty-carousel-motion,
.mpb-kuromi-sticker-motion,
.mpb-kuromi-vinyl-motion { position: absolute; inset: 0; overflow: hidden; }
.mpb-kitty-sakura-motion > i { position: absolute; width: 12px; height: 9px; border-radius: 100% 0 100% 0; background: #f09ab2; opacity: .58; animation: mpb-sakura-fall var(--ip-duration) linear var(--ip-delay) infinite; }
.mpb-kitty-letter { position: absolute; width: 102px; height: 68px; border: 2px solid rgba(204, 94, 119, .32); border-radius: 8px; background: repeating-linear-gradient(0deg, rgba(243, 168, 184, .18) 0 1px, transparent 1px 14px), rgba(255, 252, 245, .62); box-shadow: 0 12px 34px rgba(175, 88, 118, .12); }
.mpb-kitty-letter--one { left: 8%; top: 30%; transform: rotate(-10deg); animation: mpb-letter-float 8s ease-in-out infinite; }
.mpb-kitty-letter--two { right: 13%; top: 19%; transform: rotate(8deg) scale(.75); animation: mpb-letter-float 8s ease-in-out -3.6s infinite reverse; }
.mpb-kitty-sakura-ribbon { position: absolute; left: -10%; bottom: 17%; width: 52%; height: 96px; border-top: 13px solid rgba(235, 105, 139, .33); border-radius: 50%; transform: rotate(4deg); animation: mpb-ribbon-sway 7s ease-in-out infinite; }
.mpb-kitty-carousel-motion > i { position: absolute; width: 9px; height: 9px; border-radius: 50%; background: var(--carousel-dot, #ff7ea7); box-shadow: 0 0 13px currentColor; opacity: .68; animation: mpb-carousel-spark var(--ip-duration) ease-in-out var(--ip-delay) infinite; }
.mpb-kitty-carousel-wheel { position: absolute; right: 8%; bottom: 12%; width: min(26vw, 360px); aspect-ratio: 1; border: 14px dotted rgba(255, 239, 183, .75); border-radius: 50%; box-shadow: inset 0 0 0 15px rgba(242, 122, 158, .2), 0 0 36px rgba(244, 109, 154, .2); animation: mpb-carousel-rotate 18s linear infinite; }
.mpb-kitty-carousel-wheel::after { content: ''; position: absolute; inset: 34%; border-radius: 50%; background: #fff2c7; box-shadow: 0 0 0 11px rgba(244, 124, 159, .45); }
.mpb-kitty-carousel-wheel b { position: absolute; left: 50%; top: 50%; width: 45%; height: 5px; border-radius: 50%; background: rgba(245, 117, 154, .52); transform-origin: 0 50%; }
.mpb-kitty-carousel-wheel b:nth-child(1) { transform: rotate(0deg); }.mpb-kitty-carousel-wheel b:nth-child(2) { transform: rotate(90deg); }.mpb-kitty-carousel-wheel b:nth-child(3) { transform: rotate(180deg); }.mpb-kitty-carousel-wheel b:nth-child(4) { transform: rotate(270deg); }
.mpb-kitty-carousel-light { position: absolute; width: 28px; height: 28px; border-radius: 50%; background: #ffe78d; box-shadow: 0 0 26px #ffd26b; animation: mpb-carousel-light 1.3s ease-in-out infinite alternate; }.mpb-kitty-carousel-light--one { right: 29%; bottom: 39%; }.mpb-kitty-carousel-light--two { right: 8%; bottom: 42%; animation-delay: -.65s; }
.mpb-kuromi-sticker-motion > i { position: absolute; color: rgba(255, 174, 226, .73); font-size: var(--ip-size); font-style: normal; text-shadow: 0 0 14px rgba(255, 58, 170, .55); animation: mpb-sticker-tumble var(--ip-duration) cubic-bezier(.36,.04,.4,1) var(--ip-delay) infinite; }
.mpb-kuromi-sticker-card { position: absolute; width: 115px; height: 88px; border: 2px solid rgba(251, 186, 238, .54); border-radius: 14px 28px 14px 24px; background: repeating-linear-gradient(135deg, rgba(255, 92, 184, .28) 0 8px, rgba(75, 37, 103, .4) 8px 16px); box-shadow: 9px 9px 0 rgba(255, 76, 169, .13); animation: mpb-sticker-card 9s ease-in-out infinite; }.mpb-kuromi-sticker-card--one { left: 7%; bottom: 15%; transform: rotate(-13deg); }.mpb-kuromi-sticker-card--two { right: 10%; top: 24%; transform: rotate(12deg) scale(.72); animation-delay: -4.5s; }
.mpb-kuromi-vinyl-motion > i { position: absolute; width: 7px; height: 7px; border-radius: 50%; background: #ff8aca; box-shadow: 0 0 13px #c16cff; opacity: .72; animation: mpb-vinyl-spark var(--ip-duration) linear var(--ip-delay) infinite; }
.mpb-kuromi-vinyl-disc { position: absolute; display: block; border-radius: 50%; background: repeating-radial-gradient(circle, #17111f 0 3px, #2b1639 4px 5px, #100c18 6px 8px); border: 6px solid rgba(224, 133, 255, .32); box-shadow: 0 0 42px rgba(235, 69, 180, .26); animation: mpb-vinyl-spin 11s linear infinite; }.mpb-kuromi-vinyl-disc::after { content: ''; position: absolute; inset: 40%; border-radius: 50%; background: #ff87c6; box-shadow: 0 0 0 9px rgba(249, 229, 255, .18); }.mpb-kuromi-vinyl-disc--one { left: 4%; top: 18%; width: min(21vw, 300px); aspect-ratio: 1; }.mpb-kuromi-vinyl-disc--two { right: 8%; bottom: 14%; width: min(14vw, 220px); aspect-ratio: 1; animation-direction: reverse; animation-duration: 8s; }
.mpb-kuromi-speed-line { position: absolute; right: -5%; width: 34%; height: 3px; border-radius: 999px; background: linear-gradient(90deg, transparent, rgba(255, 116, 202, .9), rgba(171, 120, 255, .2)); animation: mpb-speed-line 2.4s ease-in-out infinite; }.mpb-kuromi-speed-line--one { top: 25%; }.mpb-kuromi-speed-line--two { top: 34%; animation-delay: -1.2s; }
@keyframes mpb-sakura-fall { from { transform: translate3d(0,-30px,0) rotate(0deg); } to { transform: translate3d(135px,105vh,0) rotate(420deg); } }
@keyframes mpb-letter-float { 50% { translate: 0 -18px; rotate: 3deg; } }
@keyframes mpb-ribbon-sway { 50% { transform: rotate(-5deg) translateX(5%); } }
@keyframes mpb-carousel-rotate { to { transform: rotate(360deg); } }
@keyframes mpb-carousel-light { to { opacity: .34; scale: .72; } }
@keyframes mpb-carousel-spark { 50% { translate: 22px -32px; opacity: .2; } }
@keyframes mpb-sticker-tumble { from { transform: translate3d(-6vw,-10vh,0) rotate(-25deg); } to { transform: translate3d(9vw,110vh,0) rotate(340deg); } }
@keyframes mpb-sticker-card { 50% { translate: 8px -23px; rotate: 8deg; } }
@keyframes mpb-vinyl-spin { to { transform: rotate(360deg); } }
@keyframes mpb-vinyl-spark { to { transform: translate3d(-110px,70px,0); opacity: .1; } }
@keyframes mpb-speed-line { 0%, 100% { transform: translateX(45px); opacity: 0; } 45% { opacity: 1; } 60% { transform: translateX(-110vw); opacity: .9; } }

body:not(.dark-mode) .music-page-bg.has-custom-media .mpb-orb {
  opacity: 0.14;
}

body:not(.dark-mode) .music-page-bg.has-custom-media .mpb-note,
body:not(.dark-mode) .music-page-bg.has-custom-media .mpb-spark {
  opacity: 0.2 !important;
}

/* Native Android WebView has a much smaller compositor tile budget than a
   desktop browser. Keep each selected theme's static scene and colour wash,
   while removing the many independent animated full-screen layers that can
   otherwise make cover images disappear and redraw repeatedly. */
body.native-music-app .music-page-bg,
body.native-music-app .music-page-bg *,
body.native-music-app .music-page-bg *::before,
body.native-music-app .music-page-bg *::after {
  transition: none !important;
  will-change: auto !important;
}

body.native-music-app .music-page-bg .mpb-motion-layer,
body.native-music-app .music-page-bg .mpb-orb,
body.native-music-app .music-page-bg .mpb-notes,
body.native-music-app .music-page-bg .mpb-sparkles,
body.native-music-app .music-page-bg .mpb-shinchan-elements,
body.native-music-app .music-page-bg .mpb-ip-elements {
  display: none !important;
}

body.native-music-app .music-page-bg .mpb-theme-scene {
  filter: none !important;
  transform: none !important;
  box-shadow: none !important;
  opacity: .2 !important;
}

body.native-music-app .music-page-bg .mpb-theme-scene::after,
body.native-music-app .music-page-bg .mpb-theme-scene-copy {
  display: none !important;
}

body.native-music-app .music-page-bg .mpb-custom-media,
body.native-music-app .music-page-bg .mpb-custom-media img,
body.native-music-app .music-page-bg .mpb-custom-media video {
  filter: none !important;
  transform: none !important;
}

body.native-music-app .music-page-bg .mpb-vignette {
  opacity: .32 !important;
  filter: none !important;
}

@media (prefers-reduced-motion: reduce) {
  .mpb-orb,
  .mpb-note,
  .mpb-spark,
  .mpb-motion-walker-track,
  .mpb-motion-walker,
  .mpb-motion-walker-frame,
  .mpb-motion-character-blink i,
  .mpb-motion-companion,
  .mpb-motion-sky i,
  .mpb-walk-sun,
  .mpb-walk-sun::before,
  .mpb-walk-sun::after,
  .mpb-walk-birds i,
  .mpb-walk-birds i::before,
  .mpb-walk-birds i::after,
  .mpb-walk-paper-planes i,
  .mpb-motion-leaves i,
  .mpb-motion-breeze i,
  .mpb-motion-storm-glow,
  .mpb-rain-cloudbank i,
  .mpb-motion-mist,
  .mpb-rain-lightning,
  .preset-motion-rain .mpb-theme-wash,
  .mpb-rain-streetlights i::before,
  .mpb-motion-cloud,
  .mpb-motion-dust i,
  .mpb-motion-splash i,
  .mpb-motion-rain i,
  .mpb-motion-rain::before,
  .mpb-motion-ripples i,
  .mpb-motion-parade,
  .mpb-motion-parade-card,
  .mpb-motion-confetti i,
  .mpb-parade-spotlights i,
  .mpb-parade-lanterns i,
  .mpb-parade-balloons i,
  .preset-motion-parade::after {
    animation: none !important;
  }
}
</style>
