import { ref, onMounted } from 'vue';

// IndexedDB 数据库名称和存储对象
const DB_NAME = 'BlogAvatarDB';
const DB_VERSION = 1;
const STORE_NAME = 'avatars';

// 打开 IndexedDB 数据库
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB 打开失败:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

// 保存头像到 IndexedDB
async function saveAvatarToIndexedDB(avatarUrl) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.put(avatarUrl, 'userAvatar');

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        resolve();
      };
      transaction.onerror = () => {
        console.error('保存头像失败:', transaction.error);
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.error('IndexedDB 保存失败:', error);
    throw error;
  }
}

// 从 IndexedDB 加载头像
async function loadAvatarFromIndexedDB() {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get('userAvatar');

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        console.error('加载头像失败:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('IndexedDB 加载失败:', error);
    return null;
  }
}

// 头像上传处理函数
export async function handleFileChange(event) {
  const file = event.target.files[0];
  if (file) {
    // 限制图片大小（最大 2MB）
    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过 2MB，请选择更小的图片');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const avatarUrl = e.target.result;
      try {
        // 保存到 IndexedDB
        await saveAvatarToIndexedDB(avatarUrl);
        // 同时也保存到 localStorage 作为备份
        localStorage.setItem('userAvatar', avatarUrl);
        // 刷新页面以显示新头像
        window.location.reload();
      } catch (error) {
        console.error('保存头像失败:', error);
        alert('保存头像失败，请重试');
      }
    };
    reader.onerror = () => {
      console.error('读取文件失败:', reader.error);
      alert('读取文件失败，请重试');
    };
    reader.readAsDataURL(file);
  }
}

// 从存储加载头像
export async function loadAvatar() {
  try {
    // 优先从 IndexedDB 加载
    let savedAvatar = await loadAvatarFromIndexedDB();
    
    // 如果 IndexedDB 中没有，尝试从 localStorage 加载
    if (!savedAvatar) {
      savedAvatar = localStorage.getItem('userAvatar');
      
      // 如果 localStorage 中有，同步到 IndexedDB
      if (savedAvatar) {
        await saveAvatarToIndexedDB(savedAvatar);
      }
    }
    
    return savedAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix';
  } catch (error) {
    console.error('加载头像失败:', error);
    // 如果加载失败，尝试从 localStorage 获取
    const localStorageAvatar = localStorage.getItem('userAvatar');
    return localStorageAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix';
  }
}

// Intersection Observer实现滚动动画
const resolveAnimationElement = (card) => card?.value || card?.$el || card;

const isElementInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

  return rect.width > 0
    && rect.height > 0
    && rect.bottom > 0
    && rect.right > 0
    && rect.top < viewportHeight
    && rect.left < viewportWidth;
};

const revealVisibleCard = (element) => {
  if (!element || element.classList.contains('animate-in')) {
    return false;
  }

  if (isElementInViewport(element)) {
    element.classList.add('animate-in');
    requestAnimationFrame(() => {
      if (isElementInViewport(element)) {
        element.classList.add('animate-in');
      }
    });
    return true;
  }

  return false;
};

export function setupScrollAnimation(cards) {
  const elements = cards
    .map(resolveAnimationElement)
    .filter((element) => element instanceof Element);

  if (!elements.length) {
    return null;
  }

  if (!('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('animate-in'));
    return null;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting || isElementInViewport(entry.target)) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.02,
      rootMargin: '0px 0px -6% 0px'
    }
  );

  elements.forEach((element) => {
    if (!revealVisibleCard(element)) {
      observer.observe(element);
    }
  });

  setTimeout(() => {
    elements.forEach((element) => {
      if (revealVisibleCard(element)) {
        observer.unobserve(element);
      }
    });
  }, 180);

  return observer;
}

// 导出onMounted钩子
export function useAboutPage(cards) {
  onMounted(() => {
    setupScrollAnimation(cards);
  });
}
