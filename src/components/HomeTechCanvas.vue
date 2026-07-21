<template>
  <canvas ref="canvasRef" class="home-tech-canvas" aria-hidden="true"></canvas>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const canvasRef = ref(null)

let animationFrame = 0
let resizeObserver = null
let context = null
let width = 0
let height = 0
let dpr = 1
let particles = []
let lastTime = 0

const pointer = { x: 0.5, y: 0.45, targetX: 0.5, targetY: 0.45 }
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

const createParticles = () => {
  const density = Math.max(34, Math.min(78, Math.round((width * height) / 19000)))
  particles = Array.from({ length: density }, (_, index) => ({
    x: Math.random(),
    y: Math.random(),
    size: 0.55 + Math.random() * 1.5,
    speed: 0.000018 + Math.random() * 0.000032,
    drift: (Math.random() - 0.5) * 0.000018,
    alpha: 0.16 + Math.random() * 0.48,
    warm: index % 7 === 0
  }))
}

const resize = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  width = Math.max(1, rect.width)
  height = Math.max(1, rect.height)
  dpr = Math.min(window.devicePixelRatio || 1, 1.75)
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  context = canvas.getContext('2d')
  context.setTransform(dpr, 0, 0, dpr, 0, 0)
  createParticles()
}

const drawGrid = (time) => {
  const ctx = context
  const horizon = height * 0.66
  const offset = (time * 0.006) % 54

  ctx.save()
  ctx.lineWidth = 0.7
  ctx.strokeStyle = 'rgba(202, 227, 224, 0.08)'

  for (let x = -width * 0.4; x <= width * 1.4; x += 86) {
    ctx.beginPath()
    ctx.moveTo(width * 0.5 + (x - width * 0.5) * 0.22, horizon)
    ctx.lineTo(x + (pointer.x - 0.5) * 20, height)
    ctx.stroke()
  }

  for (let y = horizon + 18 + offset; y < height + 54; y += 54) {
    const progress = (y - horizon) / Math.max(1, height - horizon)
    ctx.globalAlpha = Math.min(0.5, progress) * 0.34
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
  ctx.restore()
}

const drawOrbitalLines = (time) => {
  const ctx = context
  const centerX = width * (0.72 + (pointer.x - 0.5) * 0.025)
  const centerY = height * (0.43 + (pointer.y - 0.5) * 0.02)
  const radius = Math.min(width, height) * 0.27

  ctx.save()
  ctx.translate(centerX, centerY)
  ctx.rotate(time * 0.000035)
  ctx.lineWidth = 0.8

  const rings = [1, 0.74, 0.46]
  rings.forEach((scale, index) => {
    ctx.strokeStyle = index === 1
      ? 'rgba(205, 151, 92, 0.20)'
      : 'rgba(178, 224, 215, 0.13)'
    ctx.beginPath()
    ctx.ellipse(0, 0, radius * scale, radius * scale * 0.42, index * 0.68, 0, Math.PI * 2)
    ctx.stroke()
  })

  const satelliteAngle = time * 0.00034
  const satelliteX = Math.cos(satelliteAngle) * radius * 0.74
  const satelliteY = Math.sin(satelliteAngle) * radius * 0.31
  const satelliteGlow = ctx.createRadialGradient(satelliteX, satelliteY, 0, satelliteX, satelliteY, 16)
  satelliteGlow.addColorStop(0, 'rgba(255, 209, 145, 0.92)')
  satelliteGlow.addColorStop(0.22, 'rgba(205, 151, 92, 0.48)')
  satelliteGlow.addColorStop(1, 'rgba(205, 151, 92, 0)')
  ctx.fillStyle = satelliteGlow
  ctx.beginPath()
  ctx.arc(satelliteX, satelliteY, 16, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

const drawParticles = (delta) => {
  const ctx = context
  const linkDistance = 112

  particles.forEach((particle) => {
    particle.y -= particle.speed * delta
    particle.x += particle.drift * delta
    if (particle.y < -0.03) particle.y = 1.03
    if (particle.x < -0.03) particle.x = 1.03
    if (particle.x > 1.03) particle.x = -0.03
  })

  ctx.save()
  for (let i = 0; i < particles.length; i += 1) {
    const particle = particles[i]
    const x = particle.x * width + (pointer.x - 0.5) * (18 + particle.size * 4)
    const y = particle.y * height + (pointer.y - 0.5) * (10 + particle.size * 3)

    ctx.fillStyle = particle.warm
      ? `rgba(224, 175, 115, ${particle.alpha})`
      : `rgba(196, 231, 225, ${particle.alpha})`
    ctx.beginPath()
    ctx.arc(x, y, particle.size, 0, Math.PI * 2)
    ctx.fill()

    if (i % 3 !== 0) continue
    for (let j = i + 1; j < Math.min(i + 7, particles.length); j += 1) {
      const other = particles[j]
      const otherX = other.x * width + (pointer.x - 0.5) * (18 + other.size * 4)
      const otherY = other.y * height + (pointer.y - 0.5) * (10 + other.size * 3)
      const distance = Math.hypot(otherX - x, otherY - y)
      if (distance > linkDistance) continue
      ctx.strokeStyle = `rgba(176, 218, 211, ${(1 - distance / linkDistance) * 0.075})`
      ctx.lineWidth = 0.6
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(otherX, otherY)
      ctx.stroke()
    }
  }
  ctx.restore()
}

const draw = (time = 0) => {
  if (!context) return
  const delta = Math.min(40, Math.max(12, time - lastTime || 16))
  lastTime = time
  pointer.x += (pointer.targetX - pointer.x) * 0.035
  pointer.y += (pointer.targetY - pointer.y) * 0.035

  context.clearRect(0, 0, width, height)
  const backdrop = context.createLinearGradient(0, 0, width, height)
  backdrop.addColorStop(0, '#080b0c')
  backdrop.addColorStop(0.48, '#0e1414')
  backdrop.addColorStop(1, '#15100d')
  context.fillStyle = backdrop
  context.fillRect(0, 0, width, height)

  const lightX = width * (0.58 + (pointer.x - 0.5) * 0.08)
  const lightY = height * (0.24 + (pointer.y - 0.5) * 0.06)
  const light = context.createRadialGradient(lightX, lightY, 0, lightX, lightY, width * 0.58)
  light.addColorStop(0, 'rgba(76, 130, 119, 0.22)')
  light.addColorStop(0.46, 'rgba(36, 80, 72, 0.08)')
  light.addColorStop(1, 'rgba(0, 0, 0, 0)')
  context.fillStyle = light
  context.fillRect(0, 0, width, height)

  drawGrid(time)
  drawOrbitalLines(time)
  drawParticles(delta)

  if (!reduceMotion()) animationFrame = requestAnimationFrame(draw)
}

const onPointerMove = (event) => {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  pointer.targetX = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
  pointer.targetY = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))
}

const onPointerLeave = () => {
  pointer.targetX = 0.5
  pointer.targetY = 0.45
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(canvas)
  canvas.parentElement?.addEventListener('pointermove', onPointerMove, { passive: true })
  canvas.parentElement?.addEventListener('pointerleave', onPointerLeave, { passive: true })
  resize()
  draw(0)
})

onUnmounted(() => {
  cancelAnimationFrame(animationFrame)
  resizeObserver?.disconnect()
  const canvas = canvasRef.value
  canvas?.parentElement?.removeEventListener('pointermove', onPointerMove)
  canvas?.parentElement?.removeEventListener('pointerleave', onPointerLeave)
})
</script>

<style scoped>
.home-tech-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}
</style>
