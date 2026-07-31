<template>
  <div class="about">
    <div class="about-container">
      <div class="profile-section fade-in-up">
        <div class="avatar-wrapper">
          <div class="avatar-glow"></div>
          <div class="avatar">
            <img :src="props.avatarUrl" alt="头像" />
          </div>
          <div class="upload-overlay">
            <span class="upload-icon">📷</span>
            <span class="upload-text">更换头像</span>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="file-input"
            @change="props.handleFileChange"
          />
        </div>
        <h1 class="profile-name typing-text">Hello</h1>
        <p class="tagline">热爱技术，分享知识，创造价值</p>
        <div class="social-links">
          <a href="mailto:mesting042@gmail.com" class="social-link" aria-label="邮箱">📧</a>
          <a href="tel:18589064576" class="social-link" aria-label="电话">📱</a>
          <a href="https://github.com" class="social-link" target="_blank" rel="noreferrer" aria-label="GitHub">💬</a>
        </div>
      </div>

      <div class="content-section">
        <div ref="projectCard" class="card glass-card scroll-animate">
          <div class="card-header">
            <span class="card-icon">🚀</span>
            <h2>个人数字空间项目</h2>
          </div>
          <div class="card-content">
            <div class="project-item">
              <div class="project-header">
                <div class="project-info">
                  <h3 class="project-name">Mesting 个人数字空间</h3>
                  <div class="project-meta">
                    <span class="project-role">👩‍💻 全栈开发</span>
                    <span class="project-time">📅 2025.12 - 2026.1</span>
                  </div>
                </div>
              </div>
              <div class="project-content">
                <div class="project-description">
                  <h4>📑 项目简介</h4>
                  <p>基于 Vue 3 + Vite 构建的个人数字空间，把作品案例、思考档案、音乐体验与个人展示放在同一处持续更新。</p>
                </div>
                <div class="tech-stack">
                  <h4>🔧 技术栈</h4>
                  <div class="tech-tags">
                    <span v-for="tech in techStack" :key="tech" class="tech-tag">{{ tech }}</span>
                  </div>
                </div>
                <div class="project-features">
                  <h4>✨ 核心功能</h4>
                  <div class="feature-list">
                    <div v-for="feature in projectFeatures" :key="feature" class="feature-item">
                      <span class="feature-icon">✦</span>
                      <span class="feature-text">{{ feature }}</span>
                    </div>
                  </div>
                </div>
                <div class="project-achievements">
                  <h4>🏆 项目成果</h4>
                  <p>作品、思考、音乐与个人档案既能彼此呼应，也能各自独立被探索；这个空间会随着新的体验持续生长。</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div ref="contactCard" class="card glass-card scroll-animate">
          <div class="card-header">
            <span class="card-icon">📤</span>
            <h2>联系方式</h2>
          </div>
          <div class="card-content">
            <div class="contact-info">
              <div v-for="contact in contacts" :key="contact.label" class="contact-item">
                <span class="contact-icon">{{ contact.icon }}</span>
                <div class="contact-details">
                  <span class="contact-label">{{ contact.label }}</span>
                  <span class="contact-value">{{ contact.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div ref="interestCard" class="card glass-card scroll-animate">
          <div class="card-header">
            <span class="card-icon">✦</span>
            <h2>兴趣爱好</h2>
          </div>
          <div class="card-content">
            <div class="interests-container">
              <div v-for="interest in interests" :key="interest.title" class="interest-card">
                <div class="interest-icon-wrapper">
                  <span class="interest-icon">{{ interest.icon }}</span>
                  <div class="interest-glow"></div>
                </div>
                <div class="interest-info">
                  <h3 class="interest-title">{{ interest.title }}</h3>
                  <p class="interest-description">{{ interest.description }}</p>
                  <div class="interest-level">
                    <span class="level-label">热情度</span>
                    <div class="level-bar"><div class="level-fill" :style="{ width: `${interest.level}%` }"></div></div>
                    <span class="level-value">{{ interest.level }}%</span>
                  </div>
                  <div class="interest-tags">
                    <span v-for="tag in interest.tags" :key="tag" class="interest-tag-small">{{ tag }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  avatarUrl: {
    type: String,
    default: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
  },
  handleFileChange: {
    type: Function,
    required: true
  }
})

const fileInput = ref(null)
const projectCard = ref(null)
const contactCard = ref(null)
const interestCard = ref(null)

const techStack = ['Vue 3', 'Vite', 'Vue Router', 'Pinia', 'CSS 3', 'JavaScript']
const projectFeatures = [
  '响应式设计，适配移动端和桌面端',
  '首页汇集精选作品、思考与声音入口',
  '思考档案支持分类浏览与详情阅读',
  '细腻的动效与持续的交互反馈'
]
const contacts = [
  { icon: '📧', label: '邮箱', value: '354xxx@qq.com' },
  { icon: '📱', label: '电话', value: '133xxx-xxx' },
  { icon: '💬', label: '微信', value: 'xxxxxx' }
]
const interests = [
  { icon: '💻', title: '编程开发', description: '享受用代码创造价值的过程，持续学习新技术。', level: 95, tags: ['Vue 3', 'JavaScript', '前端开发'] },
  { icon: '🎵', title: '音乐欣赏', description: '让不同风格的旋律成为日常的调味剂。', level: 88, tags: ['流行', '古典', '电子'] },
  { icon: '📷', title: '摄影创作', description: '用镜头记录日常中容易被忽略的美好瞬间。', level: 82, tags: ['光线', '构图', '记录'] }
]

defineExpose({
  projectCard,
  contactCard,
  interestCard
})
</script>
