<template>
  <div v-if="visible" class="custom-alert-overlay" @click="handleOverlayClick">
    <div class="custom-alert-container" @click.stop>
      <div class="alert-header" :class="`alert-${type}`">
        <div class="alert-icon">
          <svg v-if="type === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <svg v-else-if="type === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <svg v-else-if="type === 'warning'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        <h3 class="alert-title">{{ title }}</h3>
      </div>
      <div class="alert-body">
        <p>{{ message }}</p>
      </div>
      <div class="alert-footer">
        <button 
          v-if="showCancel" 
          class="alert-btn alert-btn-cancel"
          @click="handleCancel"
        >
          {{ cancelText }}
        </button>
        <button 
          class="alert-btn alert-btn-confirm"
          :class="`alert-btn-${type}`"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

// 定义组件 props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '提示'
  },
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  showCancel: {
    type: Boolean,
    default: false
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  }
})

// 定义组件事件
const emit = defineEmits(['confirm', 'cancel', 'close'])

// 处理确认按钮点击
const handleConfirm = () => {
  emit('confirm')
}

// 处理取消按钮点击
const handleCancel = () => {
  emit('cancel')
}

// 处理遮罩层点击
const handleOverlayClick = () => {
  emit('close')
}
</script>

<style scoped>
/* 遮罩层 */
.custom-alert-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease;
}

/* 弹窗容器 */
.custom-alert-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 450px;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

/* 弹窗头部 */
.alert-header {
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #f1f5f9;
}

/* 头部样式 - 成功 */
.alert-header.alert-success {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-bottom-color: #bbf7d0;
}

/* 头部样式 - 错误 */
.alert-header.alert-error {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-bottom-color: #fca5a5;
}

/* 头部样式 - 警告 */
.alert-header.alert-warning {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-bottom-color: #fcd34d;
}

/* 头部样式 - 信息 */
.alert-header.alert-info {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-bottom-color: #93c5fd;
}

/* 图标 */
.alert-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}

.alert-header.alert-success .alert-icon {
  background: #10b981;
  color: white;
}

.alert-header.alert-error .alert-icon {
  background: #ef4444;
  color: white;
}

.alert-header.alert-warning .alert-icon {
  background: #f59e0b;
  color: white;
}

.alert-header.alert-info .alert-icon {
  background: #3b82f6;
  color: white;
}

.alert-icon svg {
  width: 18px;
  height: 18px;
}

/* 标题 */
.alert-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #1e293b;
}

/* 弹窗内容 */
.alert-body {
  padding: 24px;
}

.alert-body p {
  margin: 0;
  font-size: 16px;
  line-height: 1.6;
  color: #475569;
  text-align: center;
}

/* 弹窗底部 */
.alert-footer {
  padding: 0 24px 24px;
  display: flex;
  justify-content: center;
  gap: 12px;
}

/* 按钮 */
.alert-btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  min-width: 80px;
}

/* 取消按钮 */
.alert-btn-cancel {
  background: #f1f5f9;
  color: #64748b;
}

.alert-btn-cancel:hover {
  background: #e2e8f0;
  color: #475569;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 确认按钮 */
.alert-btn-confirm {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.alert-btn-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* 确认按钮样式 - 成功 */
.alert-btn-confirm.alert-btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.alert-btn-confirm.alert-btn-success:hover {
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

/* 确认按钮样式 - 错误 */
.alert-btn-confirm.alert-btn-error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.alert-btn-confirm.alert-btn-error:hover {
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

/* 确认按钮样式 - 警告 */
.alert-btn-confirm.alert-btn-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.alert-btn-confirm.alert-btn-warning:hover {
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

/* 确认按钮样式 - 信息 */
.alert-btn-confirm.alert-btn-info {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.alert-btn-confirm.alert-btn-info:hover {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .custom-alert-container {
    width: 95%;
    max-width: 400px;
  }
  
  .alert-header {
    padding: 16px 20px;
  }
  
  .alert-body {
    padding: 20px;
  }
  
  .alert-body p {
    font-size: 14px;
  }
  
  .alert-footer {
    padding: 0 20px 20px;
  }
  
  .alert-btn {
    padding: 8px 20px;
    font-size: 13px;
  }
}

/* 深色模式适配 */
body.dark-mode .custom-alert-overlay {
  background: rgba(0, 0, 0, 0.7);
}

body.dark-mode .custom-alert-container {
  background: rgba(30, 30, 30, 0.95);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

body.dark-mode .alert-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

body.dark-mode .alert-header.alert-success {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(167, 243, 208, 0.2) 100%);
}

body.dark-mode .alert-header.alert-error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(254, 202, 202, 0.2) 100%);
}

body.dark-mode .alert-header.alert-warning {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(253, 230, 138, 0.2) 100%);
}

body.dark-mode .alert-header.alert-info {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(191, 219, 254, 0.2) 100%);
}

body.dark-mode .alert-title {
  color: rgba(255, 255, 255, 0.95);
}

body.dark-mode .alert-message {
  color: rgba(255, 255, 255, 0.8);
}

body.dark-mode .alert-btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

body.dark-mode .alert-btn-cancel:hover {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 1);
}
</style>