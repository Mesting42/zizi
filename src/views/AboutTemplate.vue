<template>
  <div class="about">
    <div class="about-container">
      <!-- 个人信息区域 -->
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
            @change="props.handleFileChange"
            class="file-input"
          />
        </div>
        <h1 class="profile-name typing-text">Hello</h1>
        <p class="tagline">热爱技术，分享知识，创造价值</p>
        <div class="social-links">
          <a href="mailto:3541798955@qq.com" class="social-link">
            <span class="social-icon">📧</span>
          </a>
          <a href="tel:18589064576" class="social-link">
            <span class="social-icon">📱</span>
          </a>
          <a class="social-link">
            <span class="social-icon">💬</span>
          </a>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="content-section">
        <!-- 个人博客项目经历卡片 -->
        <div ref="projectCard" class="card glass-card scroll-animate">
          <div class="card-header">
            <span class="card-icon">🚀</span>
            <h2>个人博客项目经历</h2>
          </div>
          <div class="card-content">
            <div class="project-item">
              <div class="project-header">
                <div class="project-info">
                  <h3 class="project-name">个人博客系统</h3>
                  <div class="project-meta">
                    <span class="project-role">👨‍💻 全栈开发</span>
                    <span class="project-time">📅 2025.12 - 2026.1</span>
                  </div>
                </div>
              </div>
              <div class="project-content">
                <div class="project-description">
                  <h4>📝 项目简介</h4>
                  <p>基于 Vue3 + Vite 构建的现代化个人博客系统，采用响应式设计，支持多端访问。项目集成了文章管理、评论互动、个人展示等功能模块。</p>
                </div>
                <div class="tech-stack">
                  <h4>💻 技术栈</h4>
                  <div class="tech-tags">
                    <span class="tech-tag">Vue3</span>
                    <span class="tech-tag">Vite</span>
                    <span class="tech-tag">Vue Router</span>
                    <span class="tech-tag">Pinia</span>
                    <span class="tech-tag">CSS3</span>
                    <span class="tech-tag">JavaScript</span>
                  </div>
                </div>
                <div class="project-features">
                  <h4>✨ 核心功能</h4>
                  <div class="feature-list">
                    <div class="feature-item">
                      <span class="feature-icon">🎨</span>
                      <span class="feature-text">iOS 液态玻璃效果的头部导航栏</span>
                    </div>
                    <div class="feature-item">
                      <span class="feature-icon">📱</span>
                      <span class="feature-text">完全响应式设计，适配移动端和桌面端</span>
                    </div>
                    <div class="feature-item">
                      <span class="feature-icon">🏠</span>
                      <span class="feature-text">首页展示最新文章和精选内容</span>
                    </div>
                    <div class="feature-item">
                      <span class="feature-icon">📖</span>
                      <span class="feature-text">文章分类浏览和详情展示</span>
                    </div>
                    <div class="feature-item">
                      <span class="feature-icon">👤</span>
                      <span class="feature-text">个人介绍页面，展示教育和工作经历</span>
                    </div>
                    <div class="feature-item">
                      <span class="feature-icon">🌈</span>
                      <span class="feature-text">精美的动画效果和交互体验</span>
                    </div>
                  </div>
                </div>
                <div class="project-achievements">
                  <h4>🏆 项目成果</h4>
                  <p>成功构建了一个功能完整、界面美观的个人博客平台，实现了从前端展示到交互体验的完整开发流程。通过这个项目，深入掌握了 Vue3 生态系统和现代前端开发技术。</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 教育经历卡片 -->
        <div ref="educationCard" class="card glass-card scroll-animate">
          <div class="card-header">
            <span class="card-icon">🎓</span>
            <h2>教育经历</h2>
          </div>
          <div class="card-content">
            <div class="education-item">
              <div class="education-header">
                <div class="school-info">
                  <h3 class="school-name">广东南方职业学院</h3>
                  <div class="school-meta">
                    <span class="education-level">🎓 大专学历</span>
                    <span class="education-time">📅 2023.9 - 2026.6（在读）</span>
                  </div>
                </div>
              </div>
              <div class="education-content">
                <div class="major-info">
                  <h4>📚 专业方向</h4>
                  <p>计算机应用技术 · 前端开发方向</p>
                  <p class="major-description">系统学习计算机基础理论与前端开发技术，专注于构建现代化的 Web 应用程序。通过课程学习与项目实践，培养了扎实的编程能力和良好的工程思维。</p>
                </div>
                <div class="skills-info">
                  <h4>💡 核心技能</h4>
                  <div class="skills-list">
                    <span class="skill-tag">前端开发</span>
                    <span class="skill-tag">响应式设计</span>
                    <span class="skill-tag">组件化开发</span>
                    <span class="skill-tag">数据库应用</span>
                    <span class="skill-tag">算法基础</span>
                  </div>
                </div>
                <div class="courses-info">
                  <h4>📖 主要课程</h4>
                  <div class="courses-group">
                    <h5 class="courses-category">前端技术栈</h5>
                    <div class="courses-list">
                      <span class="course-tag">HTML5</span>
                      <span class="course-tag">CSS3</span>
                      <span class="course-tag">JavaScript</span>
                      <span class="course-tag">Vue3</span>
                      <span class="course-tag">Uniapp</span>
                    </div>
                  </div>
                  <div class="courses-group">
                    <h5 class="courses-category">后端与数据库</h5>
                    <div class="courses-list">
                      <span class="course-tag">Java</span>
                      <span class="course-tag">Python</span>
                      <span class="course-tag">PHP</span>
                      <span class="course-tag">MySQL</span>
                    </div>
                  </div>
                  <div class="courses-group">
                    <h5 class="courses-category">编程基础</h5>
                    <div class="courses-list">
                      <span class="course-tag">C语言</span>
                      <span class="course-tag">数据结构</span>
                      <span class="course-tag">算法</span>
                    </div>
                  </div>
                </div>
                <div class="learning-achievements">
                  <h4>🌟 学习成果</h4>
                  <div class="achievement-list">
                    <div class="achievement-item">
                      <span class="achievement-icon">✓</span>
                      <span class="achievement-text">熟练掌握 Vue3 生态系统，能够独立开发完整的前端项目</span>
                    </div>
                    <div class="achievement-item">
                      <span class="achievement-icon">✓</span>
                      <span class="achievement-text">具备良好的代码规范和项目组织能力</span>
                    </div>
                    <div class="achievement-item">
                      <span class="achievement-icon">✓</span>
                      <span class="achievement-text">持续关注前端技术发展，积极学习新技术和最佳实践</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 工作经历卡片 -->
        <div ref="workCard" class="card glass-card scroll-animate">
          <div class="card-header">
            <span class="card-icon">💼</span>
            <h2>工作经历</h2>
          </div>
          <div class="card-content">
            <div class="experience-item">
              <div class="experience-header">
                <div class="company-info">
                  <h3 class="company-name">深圳市新奥互联网有限公司</h3>
                  <div class="company-meta">
                    <span class="position">💼 电信外呼客服</span>
                    <span class="work-time">📅 2021.6 - 2021.10（4个月）</span>
                  </div>
                </div>
              </div>
              <div class="experience-content">
                <div class="company-intro">
                  <h4>🏢 公司简介</h4>
                  <p>深圳市新奥互联网有限公司是一家专注于电信业务推广与客户服务的互联网企业，致力于为用户提供优质的通信服务体验。</p>
                </div>
                <div class="work-responsibilities">
                  <h4>📋 主要职责</h4>
                  <div class="responsibility-list">
                    <div class="responsibility-item">
                      <span class="responsibility-icon">📞</span>
                      <div class="responsibility-detail">
                        <h5>客户服务与业务推广</h5>
                        <p>通过专业外呼系统主动联系客户，详细介绍 5G 手机套餐、宽带业务等电信产品，耐心解答客户疑问，提供专业的业务咨询，协助客户完成业务办理流程。</p>
                      </div>
                    </div>
                    <div class="responsibility-item">
                      <span class="responsibility-icon">💡</span>
                      <div class="responsibility-detail">
                        <h5>服务质量优化</h5>
                        <p>认真记录客户反馈意见和沟通中发现的问题，定期整理分析，协助团队优化推广话术和服务流程，提升整体服务质量和客户满意度。</p>
                      </div>
                    </div>
                    <div class="responsibility-item">
                      <span class="responsibility-icon">📊</span>
                      <div class="responsibility-detail">
                        <h5>数据统计与报表管理</h5>
                        <p>负责对已办理业务的客户信息进行系统化汇总，熟练运用 Excel 进行数据统计、分类整理和可视化分析，按时提交准确的工作报表，为业务决策提供数据支持。</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="work-achievements">
                  <h4>🏆 工作成果</h4>
                  <div class="achievement-grid">
                    <div class="achievement-card">
                      <span class="achievement-number">100+</span>
                      <span class="achievement-label">日均通话量</span>
                    </div>
                    <div class="achievement-card">
                      <span class="achievement-number">95%</span>
                      <span class="achievement-label">客户满意度</span>
                    </div>
                    <div class="achievement-card">
                      <span class="achievement-number">20+</span>
                      <span class="achievement-label">优化建议</span>
                    </div>
                  </div>
                </div>
                <div class="work-skills">
                  <h4>💼 获得技能</h4>
                  <div class="skills-tags">
                    <span class="work-skill-tag">客户沟通</span>
                    <span class="work-skill-tag">问题解决</span>
                    <span class="work-skill-tag">数据统计</span>
                    <span class="work-skill-tag">Excel应用</span>
                    <span class="work-skill-tag">团队协作</span>
                    <span class="work-skill-tag">服务意识</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 联系方式卡片 -->
        <div ref="contactCard" class="card glass-card scroll-animate">
          <div class="card-header">
            <span class="card-icon">📬</span>
            <h2>联系方式</h2>
          </div>
          <div class="card-content">
            <div class="contact-info">
              <div class="contact-item">
                <span class="contact-icon">📧</span>
                <div class="contact-details">
                  <span class="contact-label">邮箱</span>
                  <span class="contact-value">354xxx@qq.com</span>
                </div>
              </div>
              <div class="contact-item">
                <span class="contact-icon">📱</span>
                <div class="contact-details">
                  <span class="contact-label">电话</span>
                  <span class="contact-value">133xxx-xxx</span>
                </div>
              </div>
              <div class="contact-item">
                <span class="contact-icon">💬</span>
                <div class="contact-details">
                  <span class="contact-label">微信</span>
                  <span class="contact-value">xxxxxx</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 兴趣爱好卡片 -->
        <div ref="interestCard" class="card glass-card scroll-animate">
          <div class="card-header">
            <span class="card-icon">✨</span>
            <h2>兴趣爱好</h2>
          </div>
          <div class="card-content">
            <div class="interests-container">
              <!-- 编程 -->
              <div class="interest-card" data-interest="coding">
                <div class="interest-icon-wrapper">
                  <span class="interest-icon">💻</span>
                  <div class="interest-glow"></div>
                </div>
                <div class="interest-info">
                  <h3 class="interest-title">编程开发</h3>
                  <p class="interest-description">热爱编程，享受用代码创造价值的过程，持续学习新技术</p>
                  <div class="interest-level">
                    <span class="level-label">热情度</span>
                    <div class="level-bar">
                      <div class="level-fill" style="width: 95%"></div>
                    </div>
                    <span class="level-value">95%</span>
                  </div>
                  <div class="interest-tags">
                    <span class="interest-tag-small">Vue3</span>
                    <span class="interest-tag-small">JavaScript</span>
                    <span class="interest-tag-small">前端开发</span>
                  </div>
                </div>
              </div>

              <!-- 音乐 -->
              <div class="interest-card" data-interest="music">
                <div class="interest-icon-wrapper">
                  <span class="interest-icon">🎵</span>
                  <div class="interest-glow"></div>
                </div>
                <div class="interest-info">
                  <h3 class="interest-title">音乐欣赏</h3>
                  <p class="interest-description">喜欢各种类型的音乐，音乐是生活中不可或缺的调味剂</p>
                  <div class="interest-level">
                    <span class="level-label">热情度</span>
                    <div class="level-bar">
                      <div class="level-fill" style="width: 88%"></div>
                    </div>
                    <span class="level-value">88%</span>
                  </div>
                  <div class="interest-tags">
                    <span class="interest-tag-small">流行</span>
                    <span class="interest-tag-small">古典</span>
                    <span class="interest-tag-small">电子</span>
                  </div>
                </div>
              </div>

              <!-- 摄影 -->
              <div class="interest-card" data-interest="photography">
                <div class="interest-icon-wrapper">
                  <span class="interest-icon">📸</span>
                  <div class="interest-glow"></div>
                </div>
                <div class="interest-info">
                  <h3 class="interest-title">摄影创作</h3>
                  <p class="interest-description">用镜头记录生活中的美好瞬间，发现平凡中的不平凡</p>
                  <div class="interest-level">
                    <span class="level-label">热情度</span>
                    <div class="level-bar">
                      <div class="level-fill" style="width: 82%"></div>
                    </div>
                    <span class="level-value">82%</span>
                  </div>
                  <div class="interest-tags">
                    <span class="interest-tag-small">风景</span>
                    <span class="interest-tag-small">人像</span>
                    <span class="interest-tag-small">街拍</span>
                  </div>
                </div>
              </div>

              <!-- 开源 -->
              <div class="interest-card" data-interest="opensource">
                <div class="interest-icon-wrapper">
                  <span class="interest-icon">🌟</span>
                  <div class="interest-glow"></div>
                </div>
                <div class="interest-info">
                  <h3 class="interest-title">开源贡献</h3>
                  <p class="interest-description">积极参与开源社区，分享知识，与全球开发者共同成长</p>
                  <div class="interest-level">
                    <span class="level-label">热情度</span>
                    <div class="level-bar">
                      <div class="level-fill" style="width: 90%"></div>
                    </div>
                    <span class="level-value">90%</span>
                  </div>
                  <div class="interest-tags">
                    <span class="interest-tag-small">GitHub</span>
                    <span class="interest-tag-small">技术分享</span>
                    <span class="interest-tag-small">社区</span>
                  </div>
                </div>
              </div>

              <!-- 游戏 -->
              <div class="interest-card" data-interest="gaming">
                <div class="interest-icon-wrapper">
                  <span class="interest-icon">🎮</span>
                  <div class="interest-glow"></div>
                </div>
                <div class="interest-info">
                  <h3 class="interest-title">游戏娱乐</h3>
                  <p class="interest-description">闲暇时光享受游戏乐趣，放松身心，体验虚拟世界的精彩</p>
                  <div class="interest-level">
                    <span class="level-label">热情度</span>
                    <div class="level-bar">
                      <div class="level-fill" style="width: 50%"></div>
                    </div>
                    <span class="level-value">50%</span>
                  </div>
                  <div class="interest-tags">
                    <span class="interest-tag-small">MOBA</span>
                    <span class="interest-tag-small">休闲</span>
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
import { ref } from 'vue';

// Props
const props = defineProps({
  avatarUrl: {
    type: String,
    default: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
  },
  handleFileChange: {
    type: Function,
    required: true
  }
});

// 卡片引用
const projectCard = ref(null);
const educationCard = ref(null);
const workCard = ref(null);
const contactCard = ref(null);
const interestCard = ref(null);

// 导出卡片引用供父组件使用
defineExpose({
  projectCard,
  educationCard,
  workCard,
  contactCard,
  interestCard
});
</script>