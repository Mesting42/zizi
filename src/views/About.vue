<template>
  <AboutTemplate 
    ref="templateRef"
    :avatarUrl="avatarUrl"
    :handleFileChange="handleFileChange"
  />
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue';
import AboutTemplate from './AboutTemplate.vue';
import { handleFileChange, loadAvatar, setupScrollAnimation } from '../assets/js/about.js';
import '../assets/css/about.css';

// 头像URL
const avatarUrl = ref('https://api.dicebear.com/7.x/avataaars/svg?seed=Felix');

// 模板引用
const templateRef = ref(null);
let aboutRevealObserver = null;
const aboutRevealTimers = [];

const revealAboutCards = () => {
  if (!templateRef.value) return;

  const cards = [
    templateRef.value.projectCard,
    templateRef.value.contactCard,
    templateRef.value.interestCard
  ].filter(card => card !== null);

  // Calls can be scheduled while the template settles. Keep one live
  // observer so a card has one predictable, repeatable reveal lifecycle.
  aboutRevealObserver?.disconnect();
  aboutRevealObserver = setupScrollAnimation(cards);
};

// 组件挂载后初始化
onMounted(async () => {
  await nextTick();
  revealAboutCards();
  aboutRevealTimers.push(window.setTimeout(revealAboutCards, 160));
  // 从存储加载头像
  try {
    avatarUrl.value = await loadAvatar();
  } catch (error) {
    console.error('加载头像失败:', error);
  }
  
  // 不再设置body背景样式，让App.vue统一管理
  
  // 等待下一帧确保子组件已挂载
  aboutRevealTimers.push(window.setTimeout(() => {
    revealAboutCards();
  }, 100));
});

// 组件卸载时不恢复body背景，让App.vue统一管理
onUnmounted(() => {
  aboutRevealObserver?.disconnect();
  aboutRevealObserver = null;
  aboutRevealTimers.forEach(timer => window.clearTimeout(timer));
  // 不再清除body背景样式
});
</script>
<style scoped>
@import '../css/About.css';
</style>
