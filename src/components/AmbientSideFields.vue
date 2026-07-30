<template>
  <div ref="root" class="ambient-fields" aria-hidden="true">
    <aside
      v-for="field in fields"
      :key="field.side"
      class="ambient-rail"
      :class="`ambient-rail--${field.side}`"
      :data-side="field.side"
    >
      <div class="ambient-drift-layer">
        <span class="ambient-haze"></span>
        <span class="ambient-grid"></span>

        <svg class="ambient-trace" viewBox="0 0 360 1000" preserveAspectRatio="none">
          <defs>
            <linearGradient :id="field.gradientId" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" :stop-color="field.colors[0]" stop-opacity=".06" />
              <stop offset=".48" :stop-color="field.colors[1]" stop-opacity=".7" />
              <stop offset="1" :stop-color="field.colors[2]" stop-opacity=".08" />
            </linearGradient>
          </defs>
          <path
            class="ambient-line ambient-line--primary"
            :stroke="`url(#${field.gradientId})`"
            d="M-35 94C128 122 68 306 230 364C353 408 204 568 300 672C355 732 297 848 386 914"
          />
          <path
            class="ambient-line ambient-line--secondary"
            d="M30 40C215 184 73 284 176 426C252 532 104 672 246 792C302 839 277 912 326 982"
          />
          <path
            class="ambient-line ambient-line--signal"
            d="M-18 218C98 243 150 195 241 263C315 318 210 454 302 524C355 566 308 651 378 700"
          />
          <path
            class="ambient-line ambient-line--echo"
            d="M-46 506C91 438 137 538 229 500C321 462 250 369 377 342"
          />
        </svg>

        <span class="ambient-axis">
          <i class="ambient-progress"></i>
        </span>

        <span class="ambient-scan ambient-scan--one"></span>
        <span class="ambient-scan ambient-scan--two"></span>

        <span class="ambient-orbit ambient-orbit--one"><i></i></span>
        <span class="ambient-orbit ambient-orbit--two"><i></i></span>

        <span class="ambient-crosshair ambient-crosshair--one"></span>
        <span class="ambient-crosshair ambient-crosshair--two"></span>

        <span
          v-for="particle in field.particles"
          :key="particle.id"
          class="ambient-particle"
          :style="{
            '--particle-x': `${particle.x}%`,
            '--particle-y': `${particle.y}%`,
            '--particle-size': `${particle.size}px`,
            '--particle-opacity': particle.opacity,
          }"
        ></span>

        <span class="ambient-label">{{ field.label }}</span>
        <div class="ambient-index ambient-index--top">
          <b>{{ field.topIndex }}</b>
          <span>{{ field.topCaption }}</span>
        </div>
        <div class="ambient-index ambient-index--bottom">
          <b>{{ field.bottomIndex }}</b>
          <span>{{ field.bottomCaption }}</span>
        </div>
      </div>

      <span class="ambient-cursor">
        <i class="ambient-cursor-core"></i>
        <i class="ambient-cursor-ring"></i>
        <i class="ambient-cursor-ring ambient-cursor-ring--outer"></i>
      </span>
      <span class="ambient-impact"></span>
      <span class="ambient-interaction-hint">MOVE / PRESS</span>
    </aside>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const root = ref(null)
let gsapContext = null
let gsapMedia = null
let activeSide = ''
let fieldLoops = []
let isFieldVisible = false
let scrollStateHandler = null

const makeParticles = (offset) => [
  { id: `${offset}-1`, x: 18, y: 16, size: 3, opacity: 0.38 },
  { id: `${offset}-2`, x: 54, y: 25, size: 2, opacity: 0.24 },
  { id: `${offset}-3`, x: 32, y: 39, size: 4, opacity: 0.3 },
  { id: `${offset}-4`, x: 68, y: 51, size: 2, opacity: 0.34 },
  { id: `${offset}-5`, x: 22, y: 63, size: 3, opacity: 0.28 },
  { id: `${offset}-6`, x: 58, y: 75, size: 4, opacity: 0.22 },
  { id: `${offset}-7`, x: 38, y: 88, size: 2, opacity: 0.36 },
]

const fields = [
  {
    side: 'left',
    gradientId: 'ambient-gradient-left',
    colors: ['#d8ebe5', '#527c74', '#0b2b35'],
    label: 'MESTING / SIGNAL FIELD',
    topIndex: '01',
    topCaption: 'LIVE / PROCESS',
    bottomIndex: '26',
    bottomCaption: 'CHINA / 2026',
    particles: makeParticles('l'),
  },
  {
    side: 'right',
    gradientId: 'ambient-gradient-right',
    colors: ['#f3e4d7', '#ac856b', '#d6ebe4'],
    label: 'OBSERVATION / CONTINUOUS',
    topIndex: '02',
    topCaption: 'VISUAL / SOUND',
    bottomIndex: '∞',
    bottomCaption: 'STILL EVOLVING',
    particles: makeParticles('r'),
  },
]

const clamp = (min, max, value) => Math.min(max, Math.max(min, value))

const getRailSideAt = (clientX, rails) => {
  const railWidth = rails[0]?.getBoundingClientRect().width || 0
  if (clientX <= railWidth) return 'left'
  if (clientX >= window.innerWidth - railWidth) return 'right'
  return ''
}

const setEngagedSide = (side, rails, cursors) => {
  if (side === activeSide) return
  activeSide = side
  root.value?.classList.toggle('is-engaged', Boolean(side))
  root.value?.classList.toggle('is-engaged-left', side === 'left')
  root.value?.classList.toggle('is-engaged-right', side === 'right')

  rails.forEach((rail, index) => {
    gsap.to(cursors[index], {
      autoAlpha: rail.dataset.side === side ? 1 : 0,
      scale: rail.dataset.side === side ? 1 : 0.72,
      duration: 0.32,
      ease: 'power3.out',
      overwrite: true,
    })
  })
}

onMounted(() => {
  if (!root.value) return

  gsapContext = gsap.context(() => {
    gsapMedia = gsap.matchMedia()
    gsapMedia.add(
      {
        desktop: '(min-width: 1380px)',
        reduceMotion: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        if (!context.conditions.desktop) return undefined

        const rails = gsap.utils.toArray('.ambient-rail')
        const driftLayers = gsap.utils.toArray('.ambient-drift-layer')
        const cursors = gsap.utils.toArray('.ambient-cursor')
        const impacts = gsap.utils.toArray('.ambient-impact')
        const particles = gsap.utils.toArray('.ambient-particle')
        const signalLines = gsap.utils.toArray('.ambient-line--signal')
        const echoLines = gsap.utils.toArray('.ambient-line--echo')
        const orbits = gsap.utils.toArray('.ambient-orbit')
        const scans = gsap.utils.toArray('.ambient-scan')
        const startSection = document.querySelector('#about-space')
        const endSection = document.querySelector('.oddy-partner-shell')
        const reducedMotion = context.conditions.reduceMotion

        if (!rails.length || !startSection || !endSection) return undefined

        gsap.set(root.value, { autoAlpha: 0 })
        gsap.set(cursors, { autoAlpha: 0, scale: 0.72, transformOrigin: '50% 50%' })
        gsap.set(impacts, { autoAlpha: 0, scale: 0.2, transformOrigin: '50% 50%' })
        gsap.set(driftLayers, { force3D: true })

        const railYTo = rails.map((rail) =>
          gsap.quickTo(rail, 'y', { duration: 0.7, ease: 'power3.out' }))
        const driftXTo = driftLayers.map((layer) =>
          gsap.quickTo(layer, 'x', { duration: 0.65, ease: 'power3.out' }))
        const driftYTo = driftLayers.map((layer) =>
          gsap.quickTo(layer, 'y', { duration: 0.65, ease: 'power3.out' }))
        const cursorXTo = cursors.map((cursor) =>
          gsap.quickTo(cursor, 'x', { duration: 0.28, ease: 'power3.out' }))
        const cursorYTo = cursors.map((cursor) =>
          gsap.quickTo(cursor, 'y', { duration: 0.28, ease: 'power3.out' }))

        const setFieldVisible = (visible) => {
          if (visible === isFieldVisible) return
          isFieldVisible = visible
          root.value?.classList.toggle('is-visible', visible)
          gsap.to(root.value, {
            autoAlpha: visible ? 1 : 0,
            duration: reducedMotion ? 0.01 : visible ? 0.8 : 0.42,
            ease: visible ? 'power3.out' : 'power2.in',
            overwrite: true,
          })
          if (!visible) setEngagedSide('', rails, cursors)
        }

        const fieldTrigger = ScrollTrigger.create({
          trigger: startSection,
          endTrigger: endSection,
          start: 'top 72%',
          end: 'bottom 12%',
          onToggle: (self) => setFieldVisible(self.isActive),
          onUpdate: (self) => {
            const progress = self.progress
            root.value?.style.setProperty('--field-progress', progress.toFixed(4))
            railYTo[0]((progress - 0.5) * 38)
            railYTo[1]((0.5 - progress) * 38)
          },
        })

        if (fieldTrigger.isActive) setFieldVisible(true)

        if (!reducedMotion) {
          fieldLoops = [
            gsap.to(signalLines, {
              strokeDashoffset: -176,
              duration: 13,
              repeat: -1,
              ease: 'none',
            }),
            gsap.to(echoLines, {
              strokeDashoffset: 118,
              duration: 17,
              repeat: -1,
              ease: 'none',
            }),
            gsap.to(orbits, {
              rotation: (index) => index % 2 ? -360 : 360,
              duration: (index) => 18 + index * 2.5,
              repeat: -1,
              ease: 'none',
              transformOrigin: '50% 50%',
            }),
            gsap.to(scans, {
              y: (index) => index % 2 ? -18 : 18,
              duration: (index) => 3.2 + index * 0.28,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
            }),
            gsap.to(particles, {
              x: (index) => (index % 3 - 1) * 11,
              y: (index) => (index % 2 ? -1 : 1) * (8 + index % 4 * 3),
              duration: (index) => 3.6 + index % 5 * 0.55,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
              stagger: 0.08,
            }),
          ]
        }

        const handlePointerMove = (event) => {
          if (!isFieldVisible || reducedMotion || event.pointerType === 'touch') return

          const viewportX = event.clientX / Math.max(1, window.innerWidth)
          const viewportY = event.clientY / Math.max(1, window.innerHeight)
          const pullX = (viewportX - 0.5) * 18
          const pullY = (viewportY - 0.5) * 15

          driftXTo[0](pullX)
          driftXTo[1](-pullX)
          driftYTo[0](pullY)
          driftYTo[1](-pullY)

          const side = getRailSideAt(event.clientX, rails)
          setEngagedSide(side, rails, cursors)

          rails.forEach((rail, index) => {
            const bounds = rail.getBoundingClientRect()
            cursorXTo[index](clamp(18, bounds.width - 18, event.clientX - bounds.left))
            cursorYTo[index](clamp(20, bounds.height - 20, event.clientY - bounds.top))
          })
        }

        const handlePointerDown = (event) => {
          if (!isFieldVisible || reducedMotion || event.button > 0) return
          const side = getRailSideAt(event.clientX, rails)
          if (!side) return

          const index = side === 'left' ? 0 : 1
          const bounds = rails[index].getBoundingClientRect()
          gsap.set(impacts[index], {
            x: clamp(16, bounds.width - 16, event.clientX - bounds.left),
            y: clamp(16, bounds.height - 16, event.clientY - bounds.top),
          })
          gsap.fromTo(
            impacts[index],
            { autoAlpha: 0.72, scale: 0.18 },
            { autoAlpha: 0, scale: 3.8, duration: 0.86, ease: 'power2.out', overwrite: true },
          )
          gsap.fromTo(
            rails[index],
            { filter: 'brightness(1.16)' },
            { filter: 'brightness(1)', duration: 0.72, ease: 'power2.out', overwrite: true },
          )
        }

        const handlePointerLeave = () => {
          setEngagedSide('', rails, cursors)
          driftXTo.forEach((quickTo) => quickTo(0))
          driftYTo.forEach((quickTo) => quickTo(0))
        }

        scrollStateHandler = (event) => {
          const scrolling = Boolean(event.detail?.scrolling)
          fieldLoops.forEach((loop) => loop.paused(scrolling))
        }

        if (!reducedMotion) {
          window.addEventListener('pointermove', handlePointerMove, { passive: true })
          window.addEventListener('pointerdown', handlePointerDown, { passive: true })
          document.documentElement.addEventListener('mouseleave', handlePointerLeave)
          document.addEventListener('mesting:scroll-state', scrollStateHandler)
        }

        return () => {
          window.removeEventListener('pointermove', handlePointerMove)
          window.removeEventListener('pointerdown', handlePointerDown)
          document.documentElement.removeEventListener('mouseleave', handlePointerLeave)
          if (scrollStateHandler) {
            document.removeEventListener('mesting:scroll-state', scrollStateHandler)
          }
          fieldLoops = []
          activeSide = ''
          isFieldVisible = false
        }
      },
    )
  }, root.value)

  requestAnimationFrame(() => ScrollTrigger.refresh())
})

onBeforeUnmount(() => {
  gsapMedia?.revert()
  gsapContext?.revert()
  fieldLoops = []
  scrollStateHandler = null
})
</script>

<style scoped>
.ambient-fields {
  --field-progress: 0;
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  contain: layout paint style;
}

.ambient-rail {
  position: absolute;
  inset-block: 0;
  width: max(190px, calc((100vw - 1160px) / 2 + 34px));
  overflow: hidden;
  opacity: .76;
  transition: opacity .42s ease;
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0 9%,
    #000 18%,
    #000 90%,
    transparent 100%
  );
  mask-image: linear-gradient(
    to bottom,
    transparent 0 9%,
    #000 18%,
    #000 90%,
    transparent 100%
  );
}

.ambient-rail--left { left: 0; }
.ambient-rail--right { right: 0; }

.ambient-fields.is-engaged .ambient-rail { opacity: .55; }
.ambient-fields.is-engaged-left .ambient-rail--left,
.ambient-fields.is-engaged-right .ambient-rail--right { opacity: 1; }

.ambient-drift-layer {
  position: absolute;
  inset: 0;
  transform: translateZ(0);
}

.ambient-haze {
  position: absolute;
  top: 13%;
  width: 88%;
  height: 72%;
  border-radius: 50%;
  filter: blur(38px);
  opacity: .58;
  background:
    radial-gradient(circle at 50% 38%, rgba(190, 221, 212, .38), transparent 41%),
    radial-gradient(circle at 56% 69%, rgba(224, 237, 232, .28), transparent 36%);
  transition: filter .4s ease, opacity .4s ease;
}

.ambient-rail--left .ambient-haze { left: -46%; }
.ambient-rail--right .ambient-haze {
  right: -46%;
  background:
    radial-gradient(circle at 50% 38%, rgba(238, 216, 197, .32), transparent 41%),
    radial-gradient(circle at 46% 69%, rgba(202, 226, 219, .25), transparent 36%);
}

.ambient-fields.is-engaged-left .ambient-rail--left .ambient-haze,
.ambient-fields.is-engaged-right .ambient-rail--right .ambient-haze {
  opacity: .8;
  filter: blur(31px);
}

.ambient-grid {
  position: absolute;
  inset: 13% 9% 11%;
  opacity: .2;
  background-image:
    linear-gradient(rgba(7, 35, 45, .08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(7, 35, 45, .08) 1px, transparent 1px);
  background-size: 42px 42px;
  -webkit-mask-image: radial-gradient(ellipse at center, #000, transparent 70%);
  mask-image: radial-gradient(ellipse at center, #000, transparent 70%);
}

.ambient-trace {
  position: absolute;
  inset-block: 5%;
  width: 120%;
  height: 90%;
  overflow: visible;
  fill: none;
}

.ambient-rail--left .ambient-trace { left: -42%; }
.ambient-rail--right .ambient-trace {
  right: -42%;
  transform: scaleX(-1);
}

.ambient-line {
  vector-effect: non-scaling-stroke;
  stroke-linecap: round;
}

.ambient-line--primary {
  stroke-width: 1.35;
  transition: stroke-width .35s ease;
}

.ambient-line--secondary {
  stroke: rgba(54, 91, 86, .14);
  stroke-width: .75;
}

.ambient-rail--right .ambient-line--secondary { stroke: rgba(138, 105, 83, .13); }

.ambient-line--signal {
  stroke: rgba(7, 35, 45, .23);
  stroke-width: .95;
  stroke-dasharray: 2 12;
}

.ambient-line--echo {
  stroke: rgba(90, 133, 122, .13);
  stroke-width: .7;
  stroke-dasharray: 1 17;
}

.ambient-rail--right .ambient-line--signal { stroke: rgba(132, 92, 67, .2); }
.ambient-rail--right .ambient-line--echo { stroke: rgba(154, 111, 81, .12); }

.ambient-fields.is-engaged-left .ambient-rail--left .ambient-line--primary,
.ambient-fields.is-engaged-right .ambient-rail--right .ambient-line--primary {
  stroke-width: 2;
}

.ambient-axis {
  position: absolute;
  top: 12%;
  bottom: 11%;
  width: 1px;
  opacity: .56;
  overflow: hidden;
  background:
    repeating-linear-gradient(
      to bottom,
      rgba(7, 35, 45, .1) 0 78px,
      rgba(7, 35, 45, .42) 78px 80px
    );
}

.ambient-progress {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, #88afa4, #0b2b35 54%, #d4a783);
  transform: scaleY(var(--field-progress));
  transform-origin: top;
  opacity: .78;
}

.ambient-rail--left .ambient-axis { right: 18%; }
.ambient-rail--right .ambient-axis { left: 18%; }

.ambient-scan {
  position: absolute;
  width: 56%;
  height: 1px;
  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(7, 35, 45, .4) 28%,
      rgba(7, 35, 45, .04)
    );
}

.ambient-scan::after {
  position: absolute;
  top: -3px;
  right: -3px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #0b2b35;
  box-shadow: 0 0 0 5px rgba(255, 255, 255, .7), 0 0 22px rgba(11, 43, 53, .24);
  content: '';
}

.ambient-rail--left .ambient-scan { right: 18%; }
.ambient-rail--right .ambient-scan {
  left: 18%;
  transform: scaleX(-1);
}

.ambient-scan--one { top: 34%; }
.ambient-scan--two { top: 70%; width: 39%; opacity: .64; }

.ambient-orbit {
  position: absolute;
  width: 132px;
  height: 132px;
  border: 1px solid rgba(7, 35, 45, .1);
  border-radius: 50%;
}

.ambient-orbit::before,
.ambient-orbit::after {
  position: absolute;
  inset: 17%;
  border: 1px dashed rgba(7, 35, 45, .11);
  border-radius: inherit;
  content: '';
}

.ambient-orbit::after { inset: 37%; border-style: solid; }
.ambient-orbit i {
  position: absolute;
  top: 50%;
  left: -3px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #6d968b;
  box-shadow: 0 0 0 6px rgba(255, 255, 255, .6);
}

.ambient-orbit--one { top: 18%; }
.ambient-orbit--two { bottom: 10%; transform: scale(.7); opacity: .72; }
.ambient-rail--left .ambient-orbit { left: 8%; }
.ambient-rail--right .ambient-orbit { right: 8%; }
.ambient-rail--right .ambient-orbit i { background: #c39a7d; }

.ambient-crosshair {
  position: absolute;
  width: 24px;
  height: 24px;
  border: 1px solid rgba(7, 35, 45, .13);
  border-radius: 50%;
}

.ambient-crosshair::before,
.ambient-crosshair::after {
  position: absolute;
  top: 50%;
  left: 50%;
  background: rgba(7, 35, 45, .16);
  content: '';
  transform: translate(-50%, -50%);
}

.ambient-crosshair::before { width: 36px; height: 1px; }
.ambient-crosshair::after { width: 1px; height: 36px; }
.ambient-crosshair--one { top: 22%; }
.ambient-crosshair--two { bottom: 18%; opacity: .64; }
.ambient-rail--left .ambient-crosshair { left: 20%; }
.ambient-rail--right .ambient-crosshair { right: 20%; }

.ambient-particle {
  position: absolute;
  top: var(--particle-y);
  left: var(--particle-x);
  width: var(--particle-size);
  height: var(--particle-size);
  border-radius: 50%;
  opacity: var(--particle-opacity);
  background: #0b2b35;
  box-shadow: 0 0 0 5px rgba(255, 255, 255, .4);
}

.ambient-rail--right .ambient-particle { background: #ad8064; }

.ambient-label {
  position: absolute;
  color: rgba(7, 35, 45, .46);
  font: 600 8px/1 Inter, sans-serif;
  letter-spacing: .23em;
  white-space: nowrap;
  writing-mode: vertical-rl;
}

.ambient-rail--left .ambient-label { top: 45%; right: calc(18% + 14px); }
.ambient-rail--right .ambient-label { top: 51%; left: calc(18% + 14px); }

.ambient-index {
  position: absolute;
  display: grid;
  gap: 5px;
  color: rgba(7, 35, 45, .42);
  font-family: Inter, sans-serif;
  letter-spacing: .15em;
  text-transform: uppercase;
}

.ambient-index b {
  color: rgba(7, 35, 45, .72);
  font-size: 12px;
  font-weight: 500;
}

.ambient-index span { font-size: 7px; font-weight: 600; }
.ambient-index--top { top: 26%; }
.ambient-index--bottom { bottom: 24%; }
.ambient-rail--left .ambient-index { left: 14%; }
.ambient-rail--right .ambient-index { right: 14%; text-align: right; }

.ambient-cursor,
.ambient-impact {
  position: absolute;
  top: 0;
  left: 0;
  width: 58px;
  height: 58px;
  margin: -29px 0 0 -29px;
  border-radius: 50%;
  pointer-events: none;
}

.ambient-cursor-core {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #0b2b35;
  box-shadow: 0 0 22px rgba(11, 43, 53, .36);
  transform: translate(-50%, -50%);
}

.ambient-cursor-ring {
  position: absolute;
  inset: 8px;
  border: 1px solid rgba(7, 35, 45, .28);
  border-radius: inherit;
}

.ambient-cursor-ring--outer {
  inset: 0;
  border-style: dashed;
  opacity: .48;
}

.ambient-impact {
  width: 44px;
  height: 44px;
  margin: -22px 0 0 -22px;
  border: 1px solid rgba(7, 35, 45, .34);
  box-shadow: inset 0 0 18px rgba(119, 164, 151, .18);
}

.ambient-interaction-hint {
  position: absolute;
  bottom: 13.5%;
  color: rgba(7, 35, 45, .34);
  font: 600 7px/1 Inter, sans-serif;
  letter-spacing: .2em;
  opacity: 0;
  transition: opacity .35s ease, transform .4s cubic-bezier(.16, 1, .3, 1);
}

.ambient-rail--left .ambient-interaction-hint { left: 14%; transform: translateX(-8px); }
.ambient-rail--right .ambient-interaction-hint { right: 14%; transform: translateX(8px); }
.ambient-fields.is-engaged-left .ambient-rail--left .ambient-interaction-hint,
.ambient-fields.is-engaged-right .ambient-rail--right .ambient-interaction-hint {
  opacity: 1;
  transform: translateX(0);
}

@media (max-width: 1379px) {
  .ambient-fields { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .ambient-drift-layer,
  .ambient-rail,
  .ambient-progress { transform: none !important; }
  .ambient-cursor,
  .ambient-impact,
  .ambient-interaction-hint { display: none; }
}
</style>
