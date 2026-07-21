/**
 * 卡片 BorderGlow 统一配色 — 极光天青（对齐站点 --accent-color）
 * 避免紫色系，与全局蓝青主色和谐
 */
export const CARD_GLOW_HSL = '199 85 48'
export const CARD_GLOW_MESH = ['#22d3ee', '#5b6cff', '#67e8f9']

export const cardGlowProps = {
  borderRadius: 24,
  edgeSensitivity: 22,
  glowRadius: 48,
  glowIntensity: 1.5,
  coneSpread: 28,
  glowColor: CARD_GLOW_HSL,
  fillOpacity: 0,
  innerClass: '',
  colors: CARD_GLOW_MESH
}
