<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-glass">
        <div class="footer-inner">
          <div class="footer-main">
            <section class="footer-brand" aria-label="站点介绍">
              <router-link to="/" class="footer-logo">
                <span class="logo-mark">M</span>
                <span>Mesting</span>
              </router-link>
              <p class="footer-description">
                记录前端学习、项目实践与日常灵感，把每一次成长沉淀成可复用的经验。
              </p>
              <div class="footer-social-links">
                <a href="https://github.com" target="_blank" rel="noreferrer" class="footer-social-link" title="GitHub">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a href="mailto:contact@mesting.com" class="footer-social-link" title="Email">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </a>
              </div>
            </section>

            <section class="footer-section">
              <h3 class="footer-title">导航</h3>
              <ul class="footer-links">
                <li><router-link to="/">首页</router-link></li>
                <li><router-link to="/articles">全部文章</router-link></li>
                <li><router-link to="/music">音乐空间</router-link></li>
                <li><router-link to="/about">关于我</router-link></li>
              </ul>
            </section>

            <section class="footer-section">
              <h3 class="footer-title">专题</h3>
              <ul class="footer-links">
                <li><router-link to="/category/Vue">Vue 学习</router-link></li>
                <li><router-link to="/category/CSS">CSS 实践</router-link></li>
                <li><router-link to="/vivo-case">Vivo 案例</router-link></li>
                <li><router-link to="/foreign-case">国外站案例</router-link></li>
              </ul>
            </section>

            <section class="footer-section">
              <h3 class="footer-title">技术栈</h3>
              <div class="tech-tags">
                <span>Vue3</span>
                <span>Vite</span>
                <span>JavaScript</span>
                <span>CSS3</span>
              </div>
            </section>
          </div>
          <div class="footer-bottom">
            <p>© {{ currentYear }} Mesting. Crafted with Vue & curiosity.</p>
            <p>持续学习，持续记录。</p>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.footer {
  margin-top: 3rem;
  padding: 0;
  color: var(--text-light);
}

body.dark-mode .footer {
  background: #120F17;
}

.footer-container {
  width: 100%;
}

.footer-glass {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.42);
  border-right: 0;
  border-bottom: 0;
  border-left: 0;
  border-radius: 36px 36px 0 0;
  background:
    radial-gradient(circle at 12% 0%, rgba(255, 255, 255, 0.88), transparent 28%),
    radial-gradient(circle at 88% 118%, rgba(91, 108, 255, 0.16), transparent 38%),
    linear-gradient(150deg, rgba(255, 255, 255, 0.62) 0%, rgba(255, 255, 255, 0.28) 48%, rgba(255, 255, 255, 0.14) 100%);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.94) inset,
    0 -1px 0 rgba(255, 255, 255, 0.22) inset,
    0 26px 80px rgba(15, 23, 42, 0.09),
    0 4px 10px rgba(15, 23, 42, 0.04),
    0 0 34px rgba(91, 108, 255, 0.09);
  backdrop-filter: blur(56px) saturate(220%) contrast(108%);
  -webkit-backdrop-filter: blur(56px) saturate(220%) contrast(108%);
}

.footer-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  padding: 1px;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(91, 108, 255, 0.44) 28%, rgba(14, 165, 233, 0.28) 56%, rgba(255, 255, 255, 0.74) 100%);
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0.78;
  pointer-events: none;
  z-index: 2;
}

.footer-glass::after {
  content: '';
  position: absolute;
  inset: 1px;
  border-radius: inherit;
  background:
    radial-gradient(circle at 16% 0%, rgba(255, 255, 255, 0.64), transparent 28%),
    radial-gradient(circle at 82% 120%, rgba(91, 108, 255, 0.18), transparent 38%),
    linear-gradient(112deg, transparent 24%, rgba(255, 255, 255, 0.28) 45%, rgba(255, 255, 255, 0.08) 54%, transparent 74%);
  background-size: auto, auto, 220% 100%;
  background-position: 0 0, 100% 100%, 0 50%;
  mix-blend-mode: screen;
  opacity: 0.62;
  pointer-events: none;
  z-index: 0;
  animation: footerGlassSheen 16s ease-in-out infinite;
}

.footer-glass > * {
  position: relative;
  z-index: 1;
}

.footer-inner {
  width: min(100% - 48px, 1400px);
  box-sizing: border-box;
  margin: 0 auto;
  padding: clamp(2.4rem, 3.6vw, 3rem) 0 clamp(1.4rem, 2.4vw, 1.8rem);
}

body.dark-mode .footer-glass {
  border-color: rgba(255, 255, 255, 0.05);
  background: linear-gradient(180deg, rgba(26, 21, 36, 0.98) 0%, #120F17 100%);
  box-shadow:
    0 -1px 0 rgba(255, 255, 255, 0.04),
    0 -8px 32px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(12px) saturate(120%);
  -webkit-backdrop-filter: blur(12px) saturate(120%);
}

body.dark-mode .footer-glass::before {
  background: linear-gradient(135deg, rgba(167, 139, 250, 0.12), rgba(109, 40, 217, 0.08) 42%, rgba(244, 114, 182, 0.05) 72%, rgba(167, 139, 250, 0.04));
  opacity: 0.22;
}

body.dark-mode .footer-glass::after {
  opacity: 0.08;
  mix-blend-mode: normal;
}

.footer-main {
  position: relative;
  display: grid;
  grid-template-columns: minmax(260px, 1.7fr) repeat(3, 1fr);
  gap: 2.5rem;
}

.footer-brand,
.footer-section { min-width: 0; }

.footer-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-primary);
  font-size: 1.22rem;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.logo-mark {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: #ffffff;
  box-shadow: 0 14px 28px rgba(91, 108, 255, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.45);
}

.footer-description {
  max-width: 380px;
  margin: 1rem 0 1.25rem;
  color: var(--text-muted);
  line-height: 1.85;
}

.footer-social-links { display: flex; gap: 0.65rem; }

.footer-social-link,
.tech-tags span {
  border: 1px solid rgba(255, 255, 255, 0.52);
  background: rgba(255, 255, 255, 0.35);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.footer-social-link {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  color: var(--text-primary);
  position: relative;
  isolation: isolate;
  transition:
    transform var(--transition-fast),
    color var(--transition-fast),
    box-shadow var(--transition-fast),
    border-color var(--transition-fast),
    background var(--transition-fast);
}

.footer-social-link:hover {
  transform: translateY(-3px) scale(1.05);
  color: var(--primary-color);
  border-color: rgba(255, 255, 255, 0.72);
  background: rgba(255, 255, 255, 0.5);
  box-shadow:
    0 14px 28px rgba(91, 108, 255, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.84);
  transition:
    transform 0.35s var(--ease-spring),
    color var(--transition-fast),
    box-shadow var(--transition-fast),
    border-color var(--transition-fast),
    background var(--transition-fast);
}

.footer-social-link svg {
  position: relative;
  z-index: 1;
  width: 19px;
  height: 19px;
}

body.dark-mode .footer-social-link {
  border-color: rgba(255, 255, 255, 0.06);
  background: rgba(36, 30, 48, 0.72);
  color: #c4b5fd;
  box-shadow: none;
}

body.dark-mode .footer-social-link:hover {
  border-color: rgba(167, 139, 250, 0.22);
  background: rgba(109, 40, 217, 0.16);
  color: #f5f3ff;
  box-shadow: 0 8px 20px rgba(76, 29, 149, 0.2);
}

body.dark-mode .tech-tags span {
  border-color: rgba(255, 255, 255, 0.06);
  background: rgba(109, 40, 217, 0.1);
  color: #b8afc8;
  box-shadow: none;
}

body.dark-mode .footer-bottom {
  border-top-color: rgba(255, 255, 255, 0.06);
}

.footer-title {
  margin: 0 0 1rem;
  color: var(--text-primary);
  font-size: 0.96rem;
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.footer-links a {
  color: var(--text-muted);
  font-weight: 650;
  transition: color var(--transition-fast), transform var(--transition-fast);
}

.footer-links a:hover { color: var(--primary-color); transform: translateX(2px); }

.tech-tags { display: flex; flex-wrap: wrap; gap: 0.55rem; }

.tech-tags span {
  padding: 0.42rem 0.72rem;
  border-radius: 999px;
  color: var(--text-light);
  font-size: 0.82rem;
  font-weight: 750;
}

.footer-bottom {
  position: relative;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: clamp(2rem, 3vw, 3rem);
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.34);
  color: var(--text-muted);
  font-size: 0.88rem;
}

.footer-bottom p { margin: 0; }

@keyframes footerGlassSheen {
  0%,
  100% {
    background-position: 0 0, 100% 100%, 0 50%;
  }
  50% {
    background-position: 0 0, 100% 100%, 100% 50%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .footer-glass::after {
    animation: none;
  }
}

@media (max-width: 900px) {
  .footer-main { grid-template-columns: 1fr 1fr; }
  .footer-brand { grid-column: 1 / -1; }
}

@media (max-width: 640px) {
  .footer-glass { border-radius: 28px 28px 0 0; }
  .footer-inner {
    width: min(100% - 28px, 1400px);
    padding: 2rem 0 1.25rem;
  }
  .footer-main { grid-template-columns: 1fr; gap: 1.75rem; }
  .footer-bottom { flex-direction: column; }
}
/* 页脚与站点暗黑画布保持同一套中性黑灰层次。 */
body.dark-mode .footer {
  background: #070809;
}

body.dark-mode .footer-glass {
  border-color: rgba(255, 255, 255, 0.06);
  background: linear-gradient(180deg, rgba(20, 22, 25, 0.98), #08090a 100%);
  box-shadow: 0 -1px 0 rgba(255, 255, 255, 0.035), 0 -10px 34px rgba(0, 0, 0, 0.36);
  backdrop-filter: blur(14px) saturate(105%);
  -webkit-backdrop-filter: blur(14px) saturate(105%);
}

body.dark-mode .footer-glass::before {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.11), rgba(131, 181, 165, 0.04) 44%, rgba(255, 255, 255, 0.018));
  opacity: 0.2;
}

body.dark-mode .footer-social-link,
body.dark-mode .tech-tags span {
  border-color: rgba(255, 255, 255, 0.07);
  background: rgba(27, 30, 34, 0.86);
  color: #bfc5cb;
}

body.dark-mode .footer-social-link:hover {
  border-color: rgba(131, 181, 165, 0.2);
  background: rgba(131, 181, 165, 0.1);
  color: #f4f5f6;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.32);
}
</style>
