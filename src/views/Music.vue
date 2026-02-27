<template>
  <div class="music-page">
    <!-- 第一个盒子：头部导航栏 -->
    <header class="music-header">
      <div class="header-left">
        <h1 class="logo">Music</h1>
      </div>
      <div class="header-center">
        <div class="search-box">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input type="text" v-model="searchQuery" @input="handleSearch" placeholder="搜索音乐、歌单、歌手" />
        </div>
        <!-- 搜索结果弹窗 -->
        <div class="search-results-popup" v-if="showSearchResults && searchQuery">
          <div class="search-results-header">
            <span>搜索 "{{ searchQuery }}" 的结果</span>
            <button class="close-search" @click="showSearchResults = false; searchQuery = ''">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
          <div class="search-results-list" v-if="searchResults.length > 0">
            <div 
              class="search-result-item" 
              v-for="(song, index) in searchResults" 
              :key="index"
              @click="playSearchResult(song)"
            >
              <img :src="song.cover" class="result-cover" />
              <div class="result-info">
                <h4>{{ song.title }}</h4>
                <p>{{ song.artist }}</p>
              </div>
              <span class="result-duration">{{ song.duration }}</span>
            </div>
          </div>
          <div class="search-no-result" v-else>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <p>未找到与 "{{ searchQuery }}" 相关的音乐</p>
            <span>请尝试其他关键词</span>
          </div>
        </div>
      </div>
      <div class="header-right">
        <button class="header-btn" @click="goToPlayer">
          <svg viewBox="0 0 24 24" fill="currentColor" class="spinning" :key="spinKey" :style="{ animationPlayState: isPlaying ? 'running' : 'paused' }">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </button>
      </div>
    </header>

    <!-- 主体区域 -->
    <div class="music-body">
      <!-- 第二个盒子：左侧导航 -->
      <nav class="music-sidebar">
        <div class="nav-section">
          <h3 class="nav-title">推荐</h3>
          <div class="nav-item" :class="{ active: activeTab === 'discover' }" @click="activeTab = 'discover'">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
            <span>发现音乐</span>
          </div>
          <div class="nav-item" :class="{ active: activeTab === 'recommend' }" @click="activeTab = 'recommend'" style="margin-top: 8px;">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
            <span>每日推荐</span>
          </div>
        </div>
        <div class="nav-section" style="margin-top: 20px;">
          <h3 class="nav-title">我的音乐</h3>
          <div class="nav-item" :class="{ active: activeTab === 'favorite' }" @click="activeTab = 'favorite'" style="margin-top: 8px;">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span>我的收藏</span>
          </div>
          <div class="nav-item" :class="{ active: activeTab === 'playlist' }" @click="activeTab = 'playlist'" style="margin-top: 8px;">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
            </svg>
            <span>我的歌单</span>
          </div>
        </div>
      </nav>

      <!-- 第三个盒子：主内容区 -->
      <main class="music-main">
        <!-- 发现音乐 -->
        <div class="content-section" v-if="activeTab === 'discover'">
          <!-- 精选歌单 -->
          <div class="section-header">
            <h2>精选歌单</h2>
            <button class="more-btn">更多 ></button>
          </div>
          <div class="playlist-grid">
            <div 
              class="playlist-card"
              v-for="(pl, index) in featuredPlaylistsList" 
              :key="index" 
              @click="playPlaylist(pl)"
            >
              <div class="card-image">
                <img :src="pl.cover" :alt="pl.name" />
                <div class="card-overlay">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              <div class="card-info">
                <h4>{{ pl.name }}</h4>
                <span class="play-count">{{ getPlaylistPlayCount(pl.id) }} 次播放</span>
              </div>
            </div>
          </div>

          <!-- 最新音乐 -->
          <div class="section-header" style="margin-top: 40px;">
            <h2>最新音乐</h2>
            <button class="more-btn">更多 ></button>
          </div>
          <div class="song-grid">
            <div 
              class="song-card"
              v-for="(song, index) in recommendedSongsList" 
              :key="index"
              @click="playRecommendedSong(index)"
            >
              <div class="song-cover">
                <img :src="song.cover" :alt="song.title" />
                <div class="play-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              <div class="song-info">
                <h4>{{ song.title }}</h4>
                <p>{{ song.artist }}</p>
              </div>
              <button class="add-to-playlist-btn" @click.stop="addToPlaylist(song)" title="添加到播放列表">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- 宝藏歌单 -->
          <div class="section-header" style="margin-top: 40px;">
            <h2>宝藏歌单</h2>
            <button class="more-btn">更多 ></button>
          </div>
          <div class="playlist-grid">
            <div 
              class="playlist-card"
              v-for="(pl, index) in treasurePlaylistsList" 
              :key="'treasure-' + index" 
              @click="playPlaylist(pl)"
            >
              <div class="card-image">
                <img :src="pl.cover" :alt="pl.name" />
                <div class="card-overlay">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              <div class="card-info">
                <h4>{{ pl.name }}</h4>
                <span class="play-count">{{ getPlaylistPlayCount(pl.id) }} 次播放</span>
              </div>
            </div>
          </div>

          <!-- 今日编辑推荐 -->
          <div class="section-header" style="margin-top: 40px;">
            <h2>今日编辑推荐</h2>
            <button class="more-btn">更多 ></button>
          </div>
          <div class="playlist-grid">
            <div 
              class="playlist-card"
              v-for="(pl, index) in editorPlaylists" 
              :key="'editor-' + index" 
              @click="playPlaylist(pl)"
            >
              <div class="card-image">
                <img :src="pl.cover" :alt="pl.name" />
                <div class="card-overlay">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              <div class="card-info">
                <h4>{{ pl.name }}</h4>
                <span class="play-count">{{ getPlaylistPlayCount(pl.id) }} 次播放</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 每日推荐 -->
        <div class="content-section" v-if="activeTab === 'recommend'">
          <div class="recommend-banner">
            <div class="date-info">
              <span class="day">{{ currentDate }}</span>
              <span class="month">月</span>
            </div>
            <div class="banner-text">
              <h2>每日推荐</h2>
              <p>根据你的口味为你推荐好音乐</p>
            </div>
            <button class="section-play-all" @click="playAllRecommended">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              播放全部
            </button>
          </div>
          <div class="song-list">
            <div 
              class="song-item" 
              v-for="(song, index) in recommendedSongsList" 
              :key="index"
              @click="playRecommendedSong(index)"
            >
              <span class="song-index">{{ index + 1 }}</span>
              <div class="song-cover-large">
                <img :src="song.cover" :alt="song.title" />
                <div class="play-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              <div class="song-info-large">
                <h4>{{ song.title }}</h4>
                <p>{{ song.artist }}</p>
              </div>
              <span class="duration">{{ song.duration }}</span>
              <button class="add-to-playlist-btn" @click.stop="addToPlaylist(song)" title="添加到播放列表">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 我的收藏 -->
        <div class="content-section" v-if="activeTab === 'favorite'">
          <div class="section-header">
            <h2>我的收藏</h2>
            <div class="section-header-right">
              <span class="count">{{ favorites.length }} 首</span>
              <button 
                v-if="favorites.length" 
                class="section-play-all" 
                @click="playAllFavorites"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                播放全部
              </button>
            </div>
          </div>
          <div class="song-list" v-if="favorites.length > 0">
            <div 
              class="song-item" 
              v-for="(song, index) in favorites" 
              :key="index"
              @click="playFavoriteSong(index)"
            >
              <span class="song-index">{{ index + 1 }}</span>
              <div class="song-cover-large">
                <img :src="song.cover" :alt="song.title" />
                <div class="play-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              <div class="song-info-large">
                <h4>{{ song.title }}</h4>
                <p>{{ song.artist }}</p>
              </div>
              <span class="duration">{{ song.duration }}</span>
              <button class="remove-btn" @click.stop="removeFavorite(index)">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="empty-state" v-else>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <p>暂无收藏歌曲</p>
          </div>
        </div>

        <!-- 我的歌单：展示用户歌单卡片，而不是当前播放队列 -->
        <div class="content-section" v-if="activeTab === 'playlist'">
          <div class="section-header">
            <h2>我的歌单</h2>
            <button class="create-btn" @click="createPlaylist">+ 创建歌单（占位）</button>
          </div>
          <div class="playlist-grid" v-if="userPlaylists.length">
            <div
              class="playlist-card"
              v-for="(pl, index) in userPlaylists"
              :key="index"
              @click="router.push(`/music/playlist/${pl.id}`)"
            >
              <div class="card-image">
                <img :src="pl.cover" :alt="pl.name" />
              </div>
              <div class="card-info">
                <h4>{{ pl.name }}</h4>
                <span>{{ (pl.songs || pl.songIds || []).length }} 首歌曲 · {{ pl.description }}</span>
              </div>
            </div>
          </div>
          <div class="empty-state" v-else>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M4 4h16a1 1 0 0 1 1 1v11.5a2.5 2.5 0 0 1-3.743 2.147L12 15.882l-5.257 2.765A2.5 2.5 0 0 1 3 16.5V5a1 1 0 0 1 1-1z"
              />
            </svg>
            <p>还没有创建歌单，试着把喜欢的音乐整理成一个歌单吧～</p>
          </div>
        </div>
      </main>
    </div>

    <!-- 新建歌单弹窗 -->
    <div class="create-playlist-modal" v-if="showCreatePlaylistModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>创建歌单</h3>
          <button class="close-btn" @click="cancelCreatePlaylist">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="cover-upload-section">
            <div class="cover-preview">
              <img :src="coverPreview" alt="封面预览" @error="handleCoverError" />
              <div class="upload-overlay">
                <input 
                  type="file" 
                  accept="image/*" 
                  @change="handleCoverUpload"
                  id="cover-upload"
                />
                <label for="cover-upload" class="upload-btn">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                  </svg>
                  上传封面
                </label>
              </div>
            </div>
          </div>
          <div class="form-section">
            <div class="form-group">
              <label>歌单名称</label>
              <input 
                type="text" 
                v-model="newPlaylistName"
                placeholder="请输入歌单名称"
              />
            </div>
            <div class="form-group">
              <label>歌单描述</label>
              <textarea 
                v-model="newPlaylistDescription"
                placeholder="为歌单写一句描述..."
                rows="3"
              ></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="cancelCreatePlaylist">取消</button>
          <button class="confirm-btn" @click="confirmCreatePlaylist">创建</button>
        </div>
      </div>
    </div>

    <!-- 底部播放控制栏 -->
    <footer class="player-bar">
      <!-- 顶部进度条 -->
      <div 
        class="player-progress" 
        :class="{ dragging: isDragging }"
        @click="seek"
        @mousedown="startDragging"
        @mousemove="handleDragging"
        @mouseup="stopDragging"
        @mouseleave="stopDragging"
      >
        <div class="player-progress-bar">
          <div class="player-progress-now" :style="{ width: progress + '%' }"></div>
          <div 
            class="player-progress-tooltip" 
            :style="{ left: tooltipPosition + '%' }"
          >
            <span class="tooltip-time-current">{{ formatTime(isDragging ? dragCurrentTime : currentTime) }}</span>
            <span class="tooltip-time-sep">/</span>
            <span class="tooltip-time-duration">{{ formatTime(duration) }}</span>
          </div>
        </div>
      </div>
      
      <div class="bar-song" @click="goToPlayer">
        <img :src="currentSong.cover" class="song-cover spinning" :key="spinKey" :style="{ animationPlayState: isPlaying ? 'running' : 'paused' }" @error="handleImageError" />
        <div class="song-text">
          <h4>{{ currentSong.title }}</h4>
          <p>{{ currentSong.artist }}</p>
        </div>
        <button class="like-btn" :class="{ liked: isLiked }" @click.stop="toggleLike">
          <svg viewBox="0 0 24 24" :fill="isLiked ? '#e74c3c' : 'none'" stroke="currentColor" stroke-width="2">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>
      </div>

      <div class="bar-controls">
        <button class="ctrl-btn play-mode-btn" :class="playMode" :title="playMode === 'list' ? '列表循环' : playMode === 'single' ? '单曲循环' : '随机播放'" @click="togglePlayMode">
          <svg v-if="playMode === 'list'" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
          </svg>
          <svg v-else-if="playMode === 'single'" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 8.64L15.27 12 10 15.36V8.64M8 5v14l11-7L8 5z"/>
          </svg>
        </button>
        <div class="control-btns">
          <button class="ctrl-btn" title="上一首" @click="prevSong">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>
          <button class="ctrl-btn play-btn" @click="togglePlay">
            <svg v-if="!isPlaying" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          </button>
          <button class="ctrl-btn" title="下一首" @click="nextSong">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>
          <button class="ctrl-btn list-btn" @click="showPlaylist = !showPlaylist" title="播放列表">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
            </svg>
            <span v-if="playlist.length > 0" class="list-count">{{ playlist.length }}</span>
          </button>
        </div>
      </div>

      <div class="bar-extra">
        <!-- 播放列表按钮已移至控制区域 -->
      </div>
    </footer>

    <!-- 播放列表弹窗 -->
    <div class="playlist-popup" v-if="showPlaylist">
      <div class="popup-header">
        <h3>播放列表</h3>
        <button class="close-btn" @click="showPlaylist = false">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
      <div class="popup-list">
        <div 
          class="popup-item" 
          v-for="(song, index) in playlist" 
          :key="index"
          :class="{ active: currentIndex === index }"
        >
          <span class="item-index" @click="playSong(index)">{{ index + 1 }}</span>
          <div class="item-cover" @click="playSong(index)">
            <img :src="song.cover" :alt="song.title" />
          </div>
          <div class="item-info" @click="playSong(index)">
            <h4>{{ song.title }}</h4>
            <p>{{ song.artist }}</p>
          </div>
          <span class="item-time">{{ song.duration }}</span>
          <button class="remove-btn" @click.stop="removeFromPlaylist(index)">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 底部导航栏（移动端） -->
    <nav class="music-bottom-nav">
      <div class="nav-item" :class="{ active: activeTab === 'discover' }" @click="activeTab = 'discover'">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
        <span>发现音乐</span>
      </div>
      <div class="nav-item" :class="{ active: activeTab === 'recommend' }" @click="activeTab = 'recommend'">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
        <span>每日推荐</span>
      </div>
      <div class="nav-item" :class="{ active: activeTab === 'favorite' }" @click="activeTab = 'favorite'">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <span>我的收藏</span>
      </div>
      <div class="nav-item" :class="{ active: activeTab === 'playlist' }" @click="activeTab = 'playlist'">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
        </svg>
        <span>我的歌单</span>
      </div>
    </nav>

    <div v-if="showModeMessage" class="mode-message">
      {{ modeMessageText }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeMount, computed, onUnmounted, shallowRef, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayer } from '../composables/usePlayer'
import { recommendedSongs, featuredPlaylists, treasurePlaylists, dailyRecommendSongs } from '../data/songs.js'

const router = useRouter()
const { 
  currentSong: sharedCurrentSong,
  isPlaying: sharedIsPlaying,
  currentTime: sharedCurrentTime,
  duration: sharedDuration,
  volume: sharedVolume,
  isLiked: sharedIsLiked,
  playMode: sharedPlayMode,
  playlist: sharedPlaylist,
  favorites: sharedFavorites,
  currentIndex: sharedCurrentIndex,
  initAudio,
  togglePlay: globalTogglePlay,
  seek: globalSeek,
  next: globalNext,
  prev: globalPrev,
  playByIndex,
  play: globalPlay,
  setVolume: globalSetVolume,
  toggleLike: globalToggleLike,
  removeFromFavorites,
  cyclePlayMode,
  addToPlaylist,
  removeFromPlaylist
} = usePlayer()

const activeTab = ref('discover')
const showPlaylist = ref(false)
const currentIndex = sharedCurrentIndex
const isPlaying = sharedIsPlaying
const currentTime = sharedCurrentTime
const duration = sharedDuration
const volume = sharedVolume
const isLiked = sharedIsLiked
const playMode = sharedPlayMode
const playlist = sharedPlaylist
const favorites = sharedFavorites
const currentSong = sharedCurrentSong
const previousVolume = ref(0.7)

const showModeMessage = ref(false)
const modeMessageText = ref('')
const isDragging = ref(false)
const dragCurrentTime = ref(0)
const searchQuery = ref('')
const searchResults = ref([])
const showSearchResults = ref(false)

const handleSearch = () => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) {
    showSearchResults.value = false
    searchResults.value = []
    return
  }
  
  const allSongs = [
    ...recommendedSongsList,
    ...playlist.value
  ]
  
  const filtered = allSongs.filter(song => 
    song.title.toLowerCase().includes(query) || 
    song.artist.toLowerCase().includes(query)
  )
  
  const seen = new Set()
  searchResults.value = filtered.filter(song => {
    const key = song.url
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
  
  showSearchResults.value = true
}

const playSearchResult = (song) => {
  const index = playlist.value.findIndex(s => s.url === song.url)
  if (index !== -1) {
    playSong(index)
  } else {
    playlist.value = [song, ...playlist.value]
    playSong(0)
  }
  searchQuery.value = ''
  showSearchResults.value = false
}

const currentDate = new Date().getDate()

// 使用导入的歌曲数据
const recommendedSongsList = recommendedSongs

// 用户歌单，由 usePlaylists 统一管理
import { usePlaylists } from '../composables/usePlaylists'

const {
  playlists: userPlaylists,
  createPlaylist: createPlaylistRaw,
  getPlaylistById
} = usePlaylists()

// 获取歌单的播放次数
const getPlaylistPlayCount = (playlistId) => {
  const playlist = getPlaylistById(playlistId)
  return playlist ? playlist.playCount : '0'
}

// 使用导入的歌单数据
const featuredPlaylistsList = featuredPlaylists
const treasurePlaylistsList = treasurePlaylists

const editorPlaylists = ref([
  {
    id: 'editor-1',
    name: '跑步节奏',
    cover: '/images/13416469477674348.jpeg'
  },
  {
    id: 'editor-2',
    name: '睡前放松',
    cover: '/images/13416469437208232.jpeg'
  },
  {
    id: 'editor-3',
    name: '咖啡时光',
    cover: '/images/13416469467325044.jpeg'
  },
  {
    id: 'editor-4',
    name: '雨天 mood',
    cover: '/images/13416469468993130.jpeg'
  },
  {
    id: 'editor-5',
    name: '旅行必备',
    cover: '/images/13416469470216262.jpeg'
  },
  {
    id: 'editor-6',
    name: '回忆杀',
    cover: '/images/13416469428051659.jpeg'
  }
])

const progress = ref(0)
const tooltipPosition = ref(0)
const spinKey = ref(0)

const formatTime = (time) => {
  if (!time || !isFinite(time)) return '0:00'
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const togglePlay = () => {
  globalTogglePlay()
}

const seek = (e) => {
  const rect = e.currentTarget.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  globalSeek(percent * duration.value)
}

// 开始拖动
const startDragging = (e) => {
  isDragging.value = true
  dragCurrentTime.value = currentTime.value
  updateDragPosition(e)
}

// 拖动中
const handleDragging = (e) => {
  if (!isDragging.value) return
  updateDragPosition(e)
}

// 更新拖动位置
const updateDragPosition = (e) => {
  const progressBar = document.querySelector('.player-progress')
  if (!progressBar) return
  
  const rect = progressBar.getBoundingClientRect()
  let percent = (e.clientX - rect.left) / rect.width
  percent = Math.max(0, Math.min(1, percent))
  
  // 更新进度条显示
  progress.value = percent * 100
  
  // 更新拖动时的时间显示
  dragCurrentTime.value = percent * duration.value
  
  // 更新 tooltip 位置
  const progressBarWidth = rect.width
  const progressPixels = percent * progressBarWidth
  const maxOffset = 35
  const currentOffset = Math.min(progressPixels * 0.4, maxOffset)
  const tooltipPixels = progressPixels - currentOffset
  tooltipPosition.value = (tooltipPixels / progressBarWidth) * 100
}

// 停止拖动
const stopDragging = (e) => {
  if (!isDragging.value) return
  
  const progressBar = document.querySelector('.player-progress')
  if (progressBar && e.type !== 'mouseleave') {
    const rect = progressBar.getBoundingClientRect()
    let percent = (e.clientX - rect.left) / rect.width
    percent = Math.max(0, Math.min(1, percent))
    // 先设置 isDragging 为 false，让 watch 可以更新 UI
    isDragging.value = false
    globalSeek(percent * duration.value)
  } else {
    isDragging.value = false
  }
}

const seekVolume = (e) => {
  const volBar = e.currentTarget
  const rect = volBar.getBoundingClientRect()
  const clickX = e.clientX - rect.left
  const percentage = Math.max(0, Math.min(1, clickX / rect.width))
  globalSetVolume(percentage)
}

const toggleMute = () => {
  if (volume.value > 0) {
    previousVolume.value = volume.value
    globalSetVolume(0)
  } else {
    globalSetVolume(previousVolume.value || 0.7)
  }
}

const togglePlayMode = () => {
  cyclePlayMode()
  const modeTexts = {
    'list': '列表循环',
    'single': '单曲循环',
    'random': '随机播放'
  }
  modeMessageText.value = modeTexts[playMode.value]
  showModeMessage.value = true
  setTimeout(() => {
    showModeMessage.value = false
  }, 2000)
}

const nextSong = () => {
  globalNext()
  spinKey.value++
}

const prevSong = () => {
  globalPrev()
  spinKey.value++
}

const playSong = (index) => {
  playByIndex(index)
  spinKey.value++
}

const goToPlayer = () => {
  router.push('/music-player')
}

const defaultCover = '/images/13416469354055551.jpeg'

const handleImageError = (e) => {
  e.target.src = defaultCover
}

const handleCoverError = () => {
  coverPreview.value = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg=='
}

const playRecommendedSong = (index) => {
  const song = recommendedSongsList[index]
  const existingIndex = playlist.value.findIndex(s => s.url === song.url)
  if (existingIndex !== -1) {
    playSong(existingIndex)
  } else {
    playlist.value = [song, ...playlist.value]
    playSong(0)
  }
}

const playFavoriteSong = (index) => {
  playByIndex(index)
}

const removeFavorite = (index) => {
  removeFromFavorites(index)
}

const playAllRecommended = () => {
  if (!recommendedSongsList.length) return
  playlist.value = [...recommendedSongsList]
  playByIndex(0)
}

const playAllFavorites = () => {
  if (!favorites.value.length) return
  playlist.value = [...favorites.value]
  playByIndex(0)
}

const toggleLike = () => {
  globalToggleLike()
}

const playPlaylist = (pl) => {
  const playlistData = getPlaylistById(pl.id)
  if (playlistData && playlistData.songs && playlistData.songs.length > 0) {
    playlist.value = [...playlistData.songs]
    playByIndex(0)
  }
  // 跳转到歌单详情页面
  router.push(`/music/playlist/${pl.id}`)
}

const showCreatePlaylistModal = ref(false)
const newPlaylistName = ref('')
const newPlaylistDescription = ref('')
const newPlaylistCover = ref('')
const coverPreview = ref('/images/playlist-default.jpg')

const handleCoverUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      coverPreview.value = e.target.result
      newPlaylistCover.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const createPlaylist = () => {
  showCreatePlaylistModal.value = true
}

const confirmCreatePlaylist = () => {
  const cover = newPlaylistCover.value || '/images/playlist-default.jpg'
  const pl = createPlaylistRaw({
    name: newPlaylistName.value || '新建歌单',
    description: newPlaylistDescription.value,
    cover: cover,
    songs: []
  })
  showCreatePlaylistModal.value = false
  newPlaylistName.value = ''
  newPlaylistDescription.value = ''
  newPlaylistCover.value = ''
  coverPreview.value = '/images/playlist-default.jpg'
  router.push(`/music/playlist/${pl.id}`)
}

const cancelCreatePlaylist = () => {
  showCreatePlaylistModal.value = false
  newPlaylistName.value = ''
  newPlaylistDescription.value = ''
  newPlaylistCover.value = ''
  coverPreview.value = '/images/playlist-default.jpg'
}

const syncProgress = () => {
  if (duration.value > 0) {
    const rawProgress = (currentTime.value / duration.value) * 100
    progress.value = rawProgress
    
    const progressBar = document.querySelector('.player-progress')
    const progressBarWidth = progressBar ? progressBar.offsetWidth : 500
    const progressPixels = (rawProgress / 100) * progressBarWidth
    const maxOffset = 35
    const currentOffset = Math.min(progressPixels * 0.4, maxOffset)
    const tooltipPixels = progressPixels - currentOffset
    tooltipPosition.value = (tooltipPixels / progressBarWidth) * 100
  }
}

watch(currentTime, () => {
  if (!isDragging.value) {
    if (duration.value > 0) {
      progress.value = (currentTime.value / duration.value) * 100
    }
    
    const progressBar = document.querySelector('.player-progress')
    if (progressBar) {
      const progressBarWidth = progressBar.offsetWidth || 500
      const progressPixels = (progress.value / 100) * progressBarWidth
      const maxOffset = 35
      const currentOffset = Math.min(progressPixels * 0.4, maxOffset)
      const tooltipPixels = progressPixels - currentOffset
      tooltipPosition.value = (tooltipPixels / progressBarWidth) * 100
    }
  }
})

onMounted(() => {
  initAudio()
  nextTick(() => {
    syncProgress()
  })
})
</script>
<style scoped>
@import '../css/Music.css';
</style>



