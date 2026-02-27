<template>
  <footer class="footer">
    <div class="footer-waves">
      <svg class="wave wave1" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path fill="#667eea" fill-opacity="0.1" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
      </svg>
      <svg class="wave wave2" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path fill="#764ba2" fill-opacity="0.1" d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
      </svg>
    </div>

    <div class="footer-container">
      <div class="footer-main">
        <div class="footer-section brand-section">
          <div class="footer-logo">
            <span class="logo-icon">🚀</span>
            <span class="logo-text">Mesting</span>
          </div>
          <p class="footer-description">
            记录学习历程，分享技术心得，持续成长进步
          </p>
          <div class="social-links">
            <a href="https://github.com" target="_blank" class="social-link github-link" title="GitHub">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a href="#" class="social-link twitter-link" title="Twitter">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
            <a href="#" class="social-link email-link" title="Email">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </a>
          </div>
        </div>

        <div class="footer-section">
          <h3 class="footer-title">快速导航</h3>
          <ul class="footer-links">
            <li>
              <router-link to="/" class="footer-link">
                <span class="link-icon">🏠</span>
                首页
              </router-link>
            </li>
            <li>
              <router-link to="/articles" class="footer-link">
                <span class="link-icon">📝</span>
                全部文章
              </router-link>
            </li>
            <li>
              <router-link to="/about" class="footer-link">
                <span class="link-icon">👤</span>
                关于我
              </router-link>
            </li>
            <li>
              <router-link to="/vivo-case" class="footer-link">
                <span class="link-icon">🚀</span>
                项目案例
              </router-link>
            </li>
          </ul>
        </div>

        <div class="footer-section">
          <h3 class="footer-title">技术栈</h3>
          <div class="tech-tags">
            <span class="tech-tag">Vue3</span>
            <span class="tech-tag">Vite</span>
            <span class="tech-tag">JavaScript</span>
            <span class="tech-tag">CSS3</span>
          </div>
        </div>

        <div class="footer-section">
          <h3 class="footer-title">联系我</h3>
          <div class="contact-info">
            <div class="contact-item">
              <span class="contact-icon">📧</span>
              <span>contact@mesting.com</span>
            </div>
            <div class="contact-item">
              <span class="contact-icon">📍</span>
              <span>中国 · 北京</span>
            </div>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="footer-bottom-content">
          <p class="copyright">
            © {{ currentYear }} Mesting. 用心记录每一个学习瞬间，持续成长，分享技术
          </p>
          <div class="footer-bottom-links">
            <a href="#" class="bottom-link">隐私政策</a>
            <span class="separator">|</span>
            <a href="#" class="bottom-link">使用条款</a>
            <span class="separator">|</span>
            <a href="#" class="bottom-link">网站地图</a>
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
/* Footer 容器 */
.footer {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-top: 4rem;
  overflow: hidden;
}

/* 波浪动画 */
.footer-waves {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100px;
  overflow: hidden;
  line-height: 0;
}

.wave {
  position: absolute;
  top: 0;
  left: 0;
  width: 200%;
  height: 100%;
  animation: wave 20s linear infinite;
}

.wave2 {
  animation-delay: -10s;
  opacity: 0.5;
}

@keyframes wave {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

/* Footer 主容器 */
.footer-container {
  position: relative;
  max-width: 1400px;
  margin: 0 auto;
  padding: 4rem 2rem 2rem;
}

/* Footer 主要内容区 */
.footer-main {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
}

/* Footer 区块 */
.footer-section {
  animation: fadeInUp 0.6s ease-out;
}

.footer-section:nth-child(1) {
  animation-delay: 0.1s;
}

.footer-section:nth-child(2) {
  animation-delay: 0.2s;
}

.footer-section:nth-child(3) {
  animation-delay: 0.3s;
}

.footer-section:nth-child(4) {
  animation-delay: 0.4s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 品牌区块 */
.brand-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.75rem;
  font-weight: 700;
}

.logo-icon {
  font-size: 2rem;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.footer-description {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin: 0;
}

/* 社交链接 */
.social-links {
  display: flex;
  gap: 1rem;
  justify-content: flex-start;
}

.social-link {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: white;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.social-link:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-3px) scale(1.1);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.social-link svg {
  width: 20px;
  height: 20px;
}

/* Footer 标题 */
.footer-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 1.25rem 0;
  color: white;
  position: relative;
  display: inline-block;
}

.footer-title::after {
  content: '';
  position: absolute;
  bottom: -0.5rem;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #fff, rgba(255, 255, 255, 0.3));
  border-radius: 2px;
  transition: width 0.3s ease;
}

.footer-section:hover .footer-title::after {
  width: 100%;
}

/* Footer 链接列表 */
.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  transition: all 0.3s ease;
  padding: 0.5rem;
  border-radius: 8px;
}

.footer-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}

.link-icon {
  font-size: 1rem;
  transition: transform 0.3s ease;
}

.footer-link:hover .link-icon {
  transform: scale(1.2);
}

/* 技术标签 */
.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tech-tag {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.tech-tag:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}

/* 联系信息 */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.85);
  transition: all 0.3s ease;
}

.contact-item:hover {
  color: white;
  transform: translateX(5px);
}

.contact-icon {
  font-size: 1.25rem;
}

/* Footer 底部 */
.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 2rem;
}

.footer-bottom-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.copyright {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
}

.footer-bottom-links {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.bottom-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.bottom-link:hover {
  color: white;
  text-decoration: underline;
}

.separator {
  color: rgba(255, 255, 255, 0.4);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .footer-main {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  .brand-section {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .footer-container {
    padding: 3rem 1.5rem 1.5rem;
  }

  .footer-main {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .brand-section {
    grid-column: span 1;
  }

  .footer-bottom-content {
    flex-direction: column;
    text-align: center;
  }

  .footer-bottom-links {
    flex-wrap: wrap;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .footer-logo {
    font-size: 1.5rem;
  }

  .logo-icon {
    font-size: 1.75rem;
  }

  .footer-title {
    font-size: 1rem;
  }
}

/* 暗黑模式样式 */
body.dark-mode .footer {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

body.dark-mode .footer-description {
  color: rgba(255, 255, 255, 0.75);
}

body.dark-mode .social-link {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

body.dark-mode .social-link:hover {
  background: rgba(99, 102, 241, 0.3);
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow: 0 5px 15px rgba(99, 102, 241, 0.3);
}

body.dark-mode .footer-title {
  color: #ffffff;
}

body.dark-mode .footer-title::after {
  background: linear-gradient(90deg, #667eea, rgba(102, 126, 234, 0.3));
}

body.dark-mode .footer-link {
  color: rgba(255, 255, 255, 0.75);
}

body.dark-mode .footer-link:hover {
  color: #ffffff;
  background: rgba(99, 102, 241, 0.15);
}

body.dark-mode .tech-tag {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.85);
}

body.dark-mode .tech-tag:hover {
  background: rgba(99, 102, 241, 0.3);
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow: 0 3px 10px rgba(99, 102, 241, 0.3);
}

body.dark-mode .contact-item {
  color: rgba(255, 255, 255, 0.75);
}

body.dark-mode .contact-item:hover {
  color: #ffffff;
}

body.dark-mode .footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

body.dark-mode .copyright {
  color: rgba(255, 255, 255, 0.7);
}

body.dark-mode .bottom-link {
  color: rgba(255, 255, 255, 0.7);
}

body.dark-mode .bottom-link:hover {
  color: #ffffff;
}

body.dark-mode .separator {
  color: rgba(255, 255, 255, 0.3);
}
</style>