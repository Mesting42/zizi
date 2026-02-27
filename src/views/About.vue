<template>
  <AboutTemplate 
    ref="templateRef"
    :avatarUrl="avatarUrl"
    :handleFileChange="handleFileChange"
  />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import AboutTemplate from './AboutTemplate.vue';
import { handleFileChange, loadAvatar, setupScrollAnimation } from '../assets/js/about.js';
import '../assets/css/about.css';

// 头像URL
const avatarUrl = ref('https://api.dicebear.com/7.x/avataaars/svg?seed=Felix');

// 模板引用
const templateRef = ref(null);

// 组件挂载后初始化
onMounted(async () => {
  // 从存储加载头像
  try {
    avatarUrl.value = await loadAvatar();
  } catch (error) {
    console.error('加载头像失败:', error);
  }
  
  // 不再设置body背景样式，让App.vue统一管理
  
  // 等待下一帧确保子组件已挂载
  setTimeout(() => {
    if (templateRef.value) {
      const cards = [
        templateRef.value.projectCard,
        templateRef.value.educationCard,
        templateRef.value.workCard,
        templateRef.value.contactCard,
        templateRef.value.interestCard
      ].filter(card => card !== null);
      
      setupScrollAnimation(cards);
    }
  }, 100);
});

// 组件卸载时不恢复body背景，让App.vue统一管理
onUnmounted(() => {
  // 不再清除body背景样式
});
</script>
<style scoped>
@import '../css/About.css';
</style>


