<template>
  <div
    class="music-page"
    :class="[
      `ip-${activeThemeIp}`,
      `preset-${musicBackgroundSettings.preset}`,
      `appearance-${musicBackgroundSettings.customAppearance}`
    ]"
  >
    <MusicPageBackground :playing="isPlaying" :climbing="activeClimbCardIndex >= 0" />
    <MusicSettingsPanel :visible="showMusicSettings" @close="showMusicSettings = false" />
    <Teleport to="body">
      <Transition name="music-queue-toast">
        <div
          v-if="queueToastMessage"
          class="music-queue-toast"
          role="status"
          aria-live="polite"
        >
          <span aria-hidden="true">✓</span>
          {{ queueToastMessage }}
        </div>
      </Transition>
    </Teleport>

    <!-- Hero 头部横幅 -->
    <header class="music-hero">
      <div class="hero-bg-glow"></div>
      <button class="music-settings-trigger" type="button" @click="showMusicSettings = true">
        <span aria-hidden="true">⚙</span>
        音乐设置
      </button>
      <h1 class="hero-title">Music</h1>
      <p class="hero-subtitle">发现属于你的旋律 · 随时聆听</p>
      <div class="hero-search" :class="{ 'is-search-open': showSearchResults }" ref="heroSearchRef">
        <div class="search-box" ref="searchBoxRef">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            ref="searchInputRef"
            type="text"
            v-model="searchQuery"
            @input="onSearchInput"
            @focus="openSearchPanel"
            @compositionstart="isComposing = true"
            @compositionend="onCompositionEnd"
            placeholder="搜索本地音乐，也可以在线找试听"
          />
        </div>
      </div>
    </header>

    <Teleport to="body">
      <Transition :name="isMobileSearchPage ? 'music-search-page' : 'music-search-drop'">
        <div
          v-if="showSearchResults"
          class="music-search-overlay-root"
          :class="{ 'is-mobile-search-page': isMobileSearchPage }"
        >
          <div
            ref="searchPanelRef"
            class="search-results-popup music-search-popup music-search-dropdown music-search-dropdown-fixed"
            :class="{ 'is-mobile-search-page-panel': isMobileSearchPage }"
            :style="isMobileSearchPage ? {} : searchPanelStyle"
            @mousedown.stop
          >
            <div v-if="isMobileSearchPage" class="mobile-search-page-toolbar">
              <button type="button" class="mobile-search-back" @click="closeSearch" aria-label="返回音乐首页">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </button>
              <div class="search-box mobile-search-input-wrap">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                <input
                  ref="mobileSearchInputRef"
                  type="text"
                  v-model="searchQuery"
                  @input="onSearchInput"
                  @compositionstart="isComposing = true"
                  @compositionend="onCompositionEnd"
                  placeholder="搜索本地音乐，也可以在线找试听"
                />
                <button type="button" class="mobile-search-cancel" @click="closeSearch">取消</button>
              </div>
            </div>
            <div class="search-dropdown-toolbar" v-else-if="searchQuery.trim()">
              <span class="search-results-title">搜索「{{ searchQuery }}」</span>
              <div class="search-panel-meta inline">
                <span>{{ localSearchResults.length }} 首本地</span>
                <span>{{ onlineSearchResults.length }} 首在线</span>
              </div>
              <button type="button" class="close-search" @click="closeSearch" aria-label="关闭搜索">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              </button>
            </div>
            <div class="search-empty-panel netease-search-panel" v-if="!searchQuery.trim()">
              <div class="search-suggestion-section" v-if="recentSearches.length">
                <div class="suggestion-title">
                  <span>搜索历史</span>
                  <button type="button" class="suggestion-clear-btn" @click="clearRecentSearches">清空</button>
                </div>
                <div class="search-chip-row">
                  <button
                    class="search-chip"
                    v-for="keyword in recentSearches"
                    :key="`recent-${keyword}`"
                    @click="applySearchKeyword(keyword)"
                  >
                    {{ keyword }}
                  </button>
                </div>
              </div>
              <div class="search-suggestion-section">
                <div class="suggestion-title">
                  <span>猜你喜欢</span>
                </div>
                <div class="search-chip-row">
                  <button
                    class="search-chip"
                    v-for="keyword in guessYouLike"
                    :key="`guess-${keyword}`"
                    @click="applySearchKeyword(keyword)"
                  >
                    {{ keyword }}
                  </button>
                </div>
              </div>
              <div
                class="search-rank-boards"
                :class="{ 'is-dragging': isRankBoardDragging }"
                @pointerdown="startRankBoardDrag"
                @pointermove="moveRankBoardDrag"
                @pointerup="finishRankBoardDrag"
                @pointercancel="cancelRankBoardDrag"
                @lostpointercapture="cancelRankBoardDrag"
                @click.capture="suppressRankBoardClick"
              >
                <div class="search-rank-board">
                  <div class="search-rank-board-head">
                    <div class="suggestion-title">
                      <span>热搜榜</span>
                      <small>实时热度</small>
                    </div>
                    <div class="search-rank-board-actions">
                      <button
                        type="button"
                        class="search-rank-board-play"
                        aria-label="播放热搜榜"
                        @click.stop="playRankBoard(hotRankSongs)"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
                        <span>播放</span>
                      </button>
                    </div>
                  </div>
                  <ol class="search-rank-list">
                    <li
                      v-for="(keyword, index) in hotSearchList"
                      :key="`hot-${keyword}`"
                      @click="applySearchKeyword(keyword)"
                    >
                      <span class="rank-index" :class="{ top: index < 3 }">{{ index + 1 }}</span>
                      <span class="rank-text">{{ keyword }}</span>
                      <span v-if="index === 0" class="rank-badge hot">爆</span>
                    </li>
                  </ol>
                </div>
                <div class="search-rank-board">
                  <div class="search-rank-board-head">
                    <div class="suggestion-title">
                      <span>本地音乐</span>
                      <small>{{ localHotSongs.length }} 首</small>
                    </div>
                    <div class="search-rank-board-actions">
                      <button
                        type="button"
                        class="search-rank-board-play"
                        aria-label="播放本地音乐榜"
                        @click.stop="playRankBoard(localHotSongs)"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
                        <span>播放</span>
                      </button>
                      <span class="search-rank-board-more">全部</span>
                    </div>
                  </div>
                  <ol class="search-rank-list">
                    <li
                      v-for="(song, index) in localHotSongs"
                      :key="`local-hot-${song.id || song.title}`"
                      @click="applySearchKeyword(song.title)"
                    >
                      <span class="rank-index" :class="{ top: index < 3 }">{{ index + 1 }}</span>
                      <span class="rank-text">{{ song.title }}</span>
                      <span class="rank-sub">{{ song.artist }}</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
            <div class="search-results-list" v-else-if="searchResults.length > 0">
              <div class="search-result-group" v-if="localSearchResults.length">
                <span>本地曲库</span>
              </div>
              <div
                class="search-result-item"
                v-for="song in localSearchResults"
                :key="song.searchKey"
                @click="playSearchResult(song)"
              >
                <img :src="song.cover" class="result-cover" />
                <div class="result-info">
                  <h4>{{ song.title }}</h4>
                  <p>{{ song.artist }}</p>
                </div>
                <div class="result-meta">
                  <span class="result-source local">完整</span>
                  <span class="result-duration">{{ formatSearchDuration(song) }}</span>
                </div>
                <div class="result-actions">
                  <button
                    class="result-add-btn"
                    :class="{ 'is-added': isSearchResultInQueue(song) }"
                    @click.stop="addSearchResultToQueue(song)"
                    :title="isSearchResultInQueue(song) ? '已添加' : '加入播放列表'"
                    :aria-label="isSearchResultInQueue(song) ? '已添加到播放列表' : '加入播放列表'"
                  >
                    <svg v-if="isSearchResultInQueue(song)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="m5 12 4.2 4.2L19 6.7"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="search-result-group" v-if="onlineSearchResults.length">
                <span>在线音乐 · 完整歌曲优先，含 iTunes 试听</span>
              </div>
              <div
                class="search-result-item online"
                v-for="song in onlineSearchResults"
                :key="song.searchKey"
                @click="playSearchResult(song)"
              >
                <img :src="song.cover" class="result-cover" />
                <div class="result-info">
                  <h4>{{ song.title }}</h4>
                  <p>{{ song.artist }}</p>
                  <small v-if="song.album">{{ song.album }}</small>
                </div>
                <div class="result-meta">
                  <span class="result-source" :class="song.isOnlineFull ? 'full' : 'preview'">
                    {{ song.provider || '在线' }} · {{ song.isOnlineFull ? '完整' : '试听' }}
                  </span>
                  <span class="result-duration">{{ formatSearchDuration(song) }}</span>
                </div>
                <div class="result-actions">
                  <button
                    class="result-add-btn"
                    :class="{ 'is-added': isSearchResultInQueue(song) }"
                    @click.stop="addSearchResultToQueue(song)"
                    :title="isSearchResultInQueue(song) ? '已添加' : '加入播放列表'"
                    :aria-label="isSearchResultInQueue(song) ? '已添加到播放列表' : '加入播放列表'"
                  >
                    <svg v-if="isSearchResultInQueue(song)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="m5 12 4.2 4.2L19 6.7"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                  </button>
                  <button
                    v-if="song.externalUrl"
                    class="result-open-link"
                    @click.stop="openExternalSong(song)"
                    :title="`在 ${song.provider || 'Apple Music'} 打开`"
                    :aria-label="`在 ${song.provider || 'Apple Music'} 打开`"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 3h7v7"/>
                      <path d="M10 14 21 3"/>
                      <path d="M5 10v11h11"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div class="search-loading" v-else-if="isOnlineSearching">
              <span class="search-spinner"></span>
              <p>正在连接在线试听库...</p>
            </div>
            <div class="search-no-result" v-else-if="searchError">
              <p>{{ searchError }}</p>
              <span>本地搜索仍然可用，稍后可以再试在线结果</span>
            </div>
            <div class="search-no-result" v-else>
              <p>未找到与 "{{ searchQuery }}" 相关的音乐</p>
              <span>可以换歌手、歌名或英文关键词试试</span>
            </div>
            <div v-if="isMobileSearchPage" class="mobile-search-mini-player" aria-label="迷你播放控制">
              <button type="button" class="mobile-search-mini-song" @click="goToPlayer">
                <span class="mobile-search-mini-record" :class="{ 'is-spinning': isPlaying }" aria-hidden="true">
                  <img :src="currentSong.cover" :alt="currentSong.title" />
                  <i class="mobile-search-mini-record-hole"></i>
                </span>
                <span class="mobile-search-mini-song-copy">
                  <strong>{{ currentSong.title }}</strong>
                  <small>{{ currentSong.artist }}</small>
                </span>
              </button>
              <div class="mobile-search-mini-actions">
                <button
                  type="button"
                  class="mobile-search-mini-play"
                  :style="{ '--mobile-play-progress': `${Math.min(100, Math.max(0, progress))}%` }"
                  :aria-label="isPlaying ? '暂停播放' : '继续播放'"
                  @click="togglePlay"
                >
                  <svg v-if="!isPlaying" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M6 19h4V5H6v14Zm8-14v14h4V5h-4Z" />
                  </svg>
                </button>
                <button
                  type="button"
                  class="mobile-search-mini-queue"
                  aria-label="打开播放列表"
                  @click="openMobileSearchQueue"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M3 13h2v-2H3v2Zm0 4h2v-2H3v2Zm0-8h2V7H3v2Zm4 4h14v-2H7v2Zm0 4h14v-2H7v2ZM7 7v2h14V7H7Z" />
                  </svg>
                  <span v-if="playlist.length" class="mobile-search-mini-count">{{ playlist.length }}</span>
                </button>
              </div>
            </div>
            <Transition name="mobile-search-queue">
              <div
                v-show="showMobileSearchQueue"
                class="mobile-search-queue-backdrop"
                :class="[`ip-${activeThemeIp}`, `preset-${musicBackgroundSettings.preset}`]"
                @click.self="closeMobileSearchQueue"
              >
                <section class="mobile-search-queue-sheet" role="dialog" aria-modal="true" aria-label="播放列表">
                  <div class="mobile-search-queue-handle" aria-hidden="true"></div>
                  <header class="mobile-search-queue-header">
                    <div>
                      <span>当前播放</span>
                      <strong>{{ playlist.length }} 首</strong>
                    </div>
                    <button type="button" class="mobile-search-queue-close" aria-label="关闭播放列表" @click="closeMobileSearchQueue">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m7 7 10 10M17 7 7 17"/></svg>
                    </button>
                  </header>
                  <div class="mobile-search-queue-mode">
                    <button type="button" @click="togglePlayMode">
                      <svg v-if="playMode === 'list'" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
                      </svg>
                      <svg v-else-if="playMode === 'single'" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/>
                      </svg>
                      <svg v-else viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="m14.5 4 2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm-9.09.59L4 6l5.17 5.17 1.41-1.41L5.41 4.59zm8 9.65-1.41 1.41L16.54 20 14.5 22H20v-5.5l-2.04 2.04-4.55-4.3z"/>
                      </svg>
                      {{ playMode === 'list' ? '顺序播放' : playMode === 'single' ? '单曲循环' : '随机播放' }}
                    </button>
                  </div>
                  <div v-if="playlist.length" class="mobile-search-queue-list">
                    <div
                      v-for="(song, index) in playlist"
                      :key="song.id || `${song.title}-${index}`"
                      class="mobile-search-queue-song"
                      :class="{ active: index === currentIndex }"
                      role="button"
                      tabindex="0"
                      @click="playSong(index)"
                      @keydown.enter="playSong(index)"
                    >
                      <span class="mobile-search-queue-song-index">
                        <svg v-if="index === currentIndex && isPlaying" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true"><path d="M2 12h2V6H2v6Zm5 3h2V3H7v12Zm5-3h2V6h-2v6Z"/></svg>
                        <template v-else>{{ index + 1 }}</template>
                      </span>
                      <img :src="song.cover" :alt="song.title" />
                      <span class="mobile-search-queue-song-copy">
                        <strong>{{ song.title }}</strong>
                        <small>{{ song.artist }}</small>
                      </span>
                      <span class="mobile-search-queue-duration">{{ song.duration }}</span>
                      <button
                        type="button"
                        class="mobile-search-queue-remove"
                        :aria-label="`从播放列表移除 ${song.title}`"
                        @click.stop="removeFromPlaylist(index)"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m7 7 10 10M17 7 7 17"/></svg>
                      </button>
                    </div>
                  </div>
                  <div v-else class="mobile-search-queue-empty">接下来没有待播放的歌曲</div>
                </section>
              </div>
            </Transition>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 主体区域 -->
    <div class="music-body">
      <!-- 水平标签导航栏 (iOS 27 风格) -->
      <nav class="music-tabs">
        <button class="music-tab" :class="{ active: activeTab === 'discover' }" @click="activeTab = 'discover'">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
          <span>发现</span>
        </button>
        <button class="music-tab" :class="{ active: activeTab === 'recommend' }" @click="activeTab = 'recommend'">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
          <span>每日推荐</span>
        </button>
        <button class="music-tab" :class="{ active: activeTab === 'favorite' }" @click="activeTab = 'favorite'">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <span>我的喜欢</span>
        </button>
        <button class="music-tab" :class="{ active: activeTab === 'playlist' }" @click="activeTab = 'playlist'">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
          </svg>
          <span>歌单</span>
        </button>
      </nav>

      <!-- 主内容区 -->
      <main class="music-main">
        <!-- 发现音乐 -->
        <div class="content-section" v-if="activeTab === 'discover'">
          <!-- 精选歌单 -->
          <div class="section-header">
            <h2>精选歌单</h2>
            <button class="more-btn" type="button" @click="goToAllPlaylists">更多 ></button>
          </div>
          <div class="playlist-grid">
            <div 
              class="playlist-card"
              :class="{ 'has-card-climber': activeClimbCardIndex === index }"
              v-for="(pl, index) in featuredPlaylistsList" 
              :key="index" 
              @click="playPlaylist(pl)"
            >
              <PlaylistCardClimber
                v-if="activeClimbCardIndex === index"
                :key="playlistClimbCycle"
                :character="activeClimbCharacter"
              />
              <div class="card-image">
                <img :class="activeThemeIp !== 'shinchan' ? ['ip-cover', `ip-cover--${activeThemeIp}`] : ''" :src="getActivePlaylistCover(index, pl.cover)" :alt="`${pl.name} · ${activeThemeIpLabel}主题封面`" loading="lazy" decoding="async" />
                <div class="card-overlay">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              <div class="card-info">
                <h4>{{ pl.name }}</h4>
                <span class="play-count">在线完整歌单</span>
              </div>
            </div>
          </div>

          <!-- 最新音乐 -->
          <div class="section-header">
            <h2>最新音乐</h2>
            <button class="more-btn" type="button" @click="goToAllPlaylists">更多 ></button>
          </div>
          <div class="song-grid">
            <div 
              class="song-card"
              v-for="(song, index) in recommendedSongsList" 
              :key="index"
              @click="playRecommendedSong(song)"
            >
              <div class="song-cover">
                <img :src="song.cover" :alt="song.title" loading="lazy" decoding="async" />
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
              <button
                class="add-to-playlist-btn"
                type="button"
                title="加入播放列表"
                aria-label="加入播放列表"
                @pointerdown.stop
                @click.stop="addRecommendedToQueue(song)"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- 宝藏歌单 -->
          <div class="section-header">
            <h2>宝藏歌单</h2>
            <button class="more-btn" type="button" @click="goToAllPlaylists">更多 ></button>
          </div>
          <div class="playlist-grid">
            <div 
              class="playlist-card"
              v-for="(pl, index) in treasurePlaylistsList" 
              :key="'treasure-' + index" 
              @click="playPlaylist(pl)"
            >
              <div class="card-image">
                <img :class="activeThemeIp !== 'shinchan' ? ['ip-cover', `ip-cover--${activeThemeIp}`] : ''" :src="getActivePlaylistCover(index + 6, pl.cover)" :alt="`${pl.name} · ${activeThemeIpLabel}主题封面`" loading="lazy" decoding="async" />
                <div class="card-overlay">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              <div class="card-info">
                <h4>{{ pl.name }}</h4>
                <span class="play-count">在线完整歌单</span>
              </div>
            </div>
          </div>

          <!-- 今日编辑推荐 -->
          <div class="section-header">
            <h2>今日编辑推荐</h2>
            <button class="more-btn" type="button" @click="goToAllPlaylists">更多 ></button>
          </div>
          <div class="playlist-grid">
            <div 
              class="playlist-card"
              v-for="(pl, index) in editorPlaylistsList"
              :key="'editor-' + index" 
              @click="playPlaylist(pl)"
            >
              <div class="card-image">
                <img :class="activeThemeIp !== 'shinchan' ? ['ip-cover', `ip-cover--${activeThemeIp}`] : ''" :src="getActivePlaylistCover(index + 10, pl.cover)" :alt="`${pl.name} · ${activeThemeIpLabel}主题封面`" loading="lazy" decoding="async" />
                <div class="card-overlay">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              <div class="card-info">
                <h4>{{ pl.name }}</h4>
                <span class="play-count">在线完整歌单</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 每日推荐 -->
        <div class="content-section daily-recommend-section" v-if="activeTab === 'recommend'">
          <section class="daily-recommend-panel">
            <div class="daily-showcase">
              <div class="daily-showcase-top">
                <div class="date-info daily-date-card">
                  <span class="day">{{ currentDate }}</span>
                  <span class="month">{{ currentMonth }}月</span>
                </div>
                <div class="daily-top-actions">
                  <div class="daily-history-switch" role="group" aria-label="选择推荐日期">
                    <button
                      type="button"
                      :class="{ active: dailyViewMode === 'today' }"
                      :aria-pressed="dailyViewMode === 'today'"
                      @click="showDailyRecommendations('today')"
                    >
                      今日推荐
                    </button>
                    <button
                      type="button"
                      :class="{ active: dailyViewMode === 'yesterday' }"
                      :aria-pressed="dailyViewMode === 'yesterday'"
                      @click="showDailyRecommendations('yesterday')"
                    >
                      昨日推荐
                    </button>
                  </div>
                  <span class="daily-live-pill">{{ dailyViewMode === 'today' ? '今日更新' : '昨日回顾' }}</span>
                </div>
              </div>

              <div class="daily-cover-stack" aria-hidden="true">
                <div
                  class="daily-cover-orbit"
                  v-for="(song, coverIndex) in recommendedSongsList.slice(0, 4)"
                  :key="`daily-cover-${coverIndex}`"
                >
                  <img :src="song.cover" :alt="song.title" loading="lazy" decoding="async" />
                </div>
              </div>

              <div class="daily-showcase-copy">
                <span class="daily-kicker">{{ dailyViewMode === 'today' ? 'Daily Mix' : 'Yesterday Replay' }}</span>
                <h2>{{ dailyViewMode === 'today' ? '每日推荐' : '昨日推荐' }}</h2>
                <p>{{ dailyViewMode === 'today' ? '根据你的口味挑选今天适合循环播放的旋律，把熟悉和惊喜放在同一个队列里。' : '回看昨天为你挑选的歌曲，错过的旋律现在还可以继续听。' }}</p>
                <div class="daily-meta-row">
                  <span>{{ recommendedSongsList.length }} 首</span>
                  <span>为你精选</span>
                  <span>私人歌单</span>
                </div>
                <button class="section-play-all daily-play-all" @click="playAllRecommended">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  播放全部
                </button>
              </div>
            </div>

            <div class="daily-queue">
              <div class="daily-queue-head">
                <div>
                  <span class="daily-kicker">{{ dailyViewMode === 'today' ? "Today's Queue" : "Yesterday's Queue" }}</span>
                  <h3>精选队列</h3>
                </div>
                <span>{{ isDailyOnlineLoading ? '正在加入在线推荐...' : `${recommendedSongsList.length} 首歌曲` }}</span>
              </div>

              <div class="daily-list-labels">
                <span>#</span>
                <span>歌曲</span>
                <span>时长</span>
              </div>

              <div class="song-list daily-song-list">
                <div
                  class="song-item daily-song-row"
                  v-for="(song, index) in recommendedSongsList"
                  :key="index"
                  @click="playRecommendedSong(song)"
                >
                  <span class="song-index daily-song-index">{{ String(index + 1).padStart(2, '0') }}</span>
                  <div class="daily-song-main">
                    <div class="song-cover-large">
                      <img :src="song.cover" :alt="song.title" loading="lazy" decoding="async" />
                      <div class="play-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                    <div class="song-info-large">
                      <h4>{{ song.title }}</h4>
                      <p>
                        {{ song.artist }}
                        <span v-if="song.isOnlineFull" class="daily-online-badge">在线完整</span>
                      </p>
                    </div>
                  </div>
                  <div class="daily-song-actions">
                    <span class="duration">{{ song.duration }}</span>
                    <button
                      class="add-to-playlist-btn"
                      type="button"
                      title="加入播放列表"
                      aria-label="加入播放列表"
                      @pointerdown.stop
                      @click.stop="addRecommendedToQueue(song)"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- 我的喜欢 -->
        <div class="content-section favorite-section" v-if="activeTab === 'favorite'">
          <section class="favorite-hero">
            <div class="favorite-hero-art" aria-hidden="true">
              <span class="favorite-art-disc favorite-art-disc--back"></span>
              <span class="favorite-art-disc favorite-art-disc--front">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </span>
            </div>
            <div class="favorite-hero-copy">
              <span>MY LIKES</span>
              <h2>我的喜欢</h2>
              <p>收藏每一段让你心动的旋律</p>
              <small>{{ favorites.length }} 首喜欢的歌曲</small>
            </div>
            <button
              v-if="favorites.length"
              class="favorite-hero-play"
              type="button"
              aria-label="播放全部喜欢的歌曲"
              @click="playAllFavorites"
            >
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              <span>播放全部</span>
            </button>
          </section>

          <div v-if="favorites.length" class="favorite-list-title">
            <h3>喜欢的歌曲</h3>
            <span>{{ favorites.length }} 首</span>
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
                <img :src="song.cover" :alt="song.title" loading="lazy" decoding="async" />
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
            <p>还没有喜欢的歌曲</p>
            <button class="empty-action" @click="activeTab = 'discover'">去发现音乐</button>
          </div>
        </div>

        <!-- 我的歌单：展示用户歌单卡片，而不是当前播放队列 -->
        <div class="content-section playlist-library-section" v-if="activeTab === 'playlist'">
          <section class="playlist-library-hero">
            <div class="playlist-library-hero-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6h16M4 12h11M4 18h8"/><circle cx="18" cy="17" r="3"/></svg>
            </div>
            <div>
              <span>MY PLAYLISTS</span>
              <h2>我的歌单</h2>
              <p>把每一段喜欢的声音，收进自己的音乐空间</p>
            </div>
            <button class="playlist-library-create" type="button" aria-label="创建歌单" @click="createPlaylist">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
              <span>创建</span>
            </button>
          </section>

          <div v-if="userPlaylists.length" class="playlist-library-title">
            <h3>创建的歌单</h3>
            <span>{{ userPlaylists.length }} 个</span>
          </div>
          <div class="playlist-grid playlist-library-grid" v-if="userPlaylists.length">
            <div
              class="playlist-card playlist-library-card"
              v-for="(pl, index) in userPlaylists"
              :key="index"
              @click="router.push({ name: 'PlaylistDetail', params: { id: pl.id }, query: { from: 'home' } })"
            >
              <div class="card-image">
                <img :src="pl.cover" :alt="pl.name" loading="lazy" decoding="async" />
              </div>
              <div class="card-info">
                <h4>{{ pl.name }}</h4>
                <span>{{ (pl.songs || pl.songIds || []).length }} 首歌曲</span>
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
            <button class="empty-action" @click="createPlaylist">创建第一个歌单</button>
          </div>
        </div>
      </main>
    </div>

    <!-- 新建歌单弹窗：挂载到 body，始终相对当前视口居中 -->
    <Teleport to="body">
      <div
        class="create-playlist-modal"
        :class="[`ip-${activeThemeIp}`, `preset-${musicBackgroundSettings.preset}`]"
        v-if="showCreatePlaylistModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-playlist-title"
        @click.self="cancelCreatePlaylist"
      >
        <div class="modal-content">
        <div class="modal-header">
          <h3 id="create-playlist-title">创建歌单</h3>
          <button class="close-btn" aria-label="关闭创建歌单窗口" @click="cancelCreatePlaylist">
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
    </Teleport>

    <!-- 底部播放控制栏 -->
    <footer class="player-bar player-bar-unified">
      <PlayerShinchanDecor />
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
          <div class="player-progress-now" :style="{ width: progress + '%' }">
            <ProgressWalker :is-playing="isPlaying" :dragging="isDragging" />
          </div>
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
        <span class="bar-song-record" :class="{ 'is-spinning': isPlaying }" aria-hidden="true">
          <img :src="currentSong.cover" class="song-cover" :key="spinKey" @error="handleImageError" />
          <i class="bar-song-record-hole"></i>
        </span>
        <div class="song-text">
          <PlayerTitleMarquee :text="currentSong.title" />
          <p>{{ currentSong.artist }}</p>
        </div>
        <button class="like-btn" :class="{ liked: isLiked }" @click.stop="toggleLike">
          <svg viewBox="0 0 24 24" :fill="isLiked ? '#e74c3c' : 'none'" stroke="currentColor" stroke-width="2">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>
      </div>

      <div class="bar-controls">
        <button class="ctrl-btn play-mode-btn" :class="playMode" :title="playMode === 'list' ? '顺序播放' : playMode === 'single' ? '单曲循环' : '随机播放'" @click="togglePlayMode">
          <svg v-if="playMode === 'list'" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
          </svg>
          <svg v-else-if="playMode === 'single'" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41ZM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5Zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13Z"/>
          </svg>
        </button>
        <div class="control-btns">
          <button class="ctrl-btn" title="上一首" @click="prevSong">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>
          <button class="ctrl-btn play-btn" :style="{ '--mobile-play-progress': `${Math.min(100, Math.max(0, progress))}%` }" @click="togglePlay">
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
          <button class="ctrl-btn list-btn" @click="handlePlaylistClick" title="播放列表">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
            </svg>
            <span v-if="playlist.length > 0" class="list-count">{{ playlist.length }}</span>
          </button>
        </div>
      </div>

      <div class="bar-extra">
        <LyricsToggleButton />
        <div class="volume-wrap">
          <button
            class="vol-btn"
            type="button"
            :title="volume > 0 ? '静音' : '恢复音量'"
            :aria-label="volume > 0 ? '静音' : '恢复音量'"
            @click="toggleMute"
          >
            <svg v-if="volume > 0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            </svg>
          </button>
          <div
            ref="volumeBarRef"
            class="vol-bar"
            :class="{ 'is-dragging': isVolumeDragging }"
            :style="{ '--volume-position': (volume * 100) + '%' }"
            role="slider"
            aria-label="音量"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuenow="Math.round(volume * 100)"
            :aria-valuetext="`${Math.round(volume * 100)}%`"
            tabindex="0"
            @pointerdown="startVolumeDragging"
            @pointermove="handleVolumeDragging"
            @pointerup="stopVolumeDragging"
            @pointercancel="cancelVolumeDragging"
            @lostpointercapture="cancelVolumeDragging"
            @keydown="handleVolumeKeydown"
          >
            <div class="vol-now" :style="{ width: (volume * 100) + '%' }"></div>
          </div>
        </div>
      </div>
    </footer>

    <!-- 播放列表弹窗：挂载到 body，始终固定在当前视口内 -->
    <Teleport to="body">
    <Transition name="mobile-search-queue">
      <div
        v-show="showMobilePlayerQueue"
        class="mobile-search-queue-backdrop mobile-player-queue-backdrop"
        :class="[`ip-${activeThemeIp}`, `preset-${musicBackgroundSettings.preset}`]"
        @click.self="closeMobilePlayerQueue"
      >
        <section class="mobile-search-queue-sheet" role="dialog" aria-modal="true" aria-label="播放列表">
          <div class="mobile-search-queue-handle" aria-hidden="true"></div>
          <header class="mobile-search-queue-header">
            <div>
              <span>当前播放</span>
              <strong>{{ playlist.length }} 首</strong>
            </div>
            <button type="button" class="mobile-search-queue-close" aria-label="关闭播放列表" @click="closeMobilePlayerQueue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m7 7 10 10M17 7 7 17"/></svg>
            </button>
          </header>
          <div class="mobile-search-queue-mode">
            <button type="button" @click="togglePlayMode">
              <svg v-if="playMode === 'list'" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
              <svg v-else-if="playMode === 'single'" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/></svg>
              <svg v-else viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m14.5 4 2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm-9.09.59L4 6l5.17 5.17 1.41-1.41L5.41 4.59zm8 9.65-1.41 1.41L16.54 20 14.5 22H20v-5.5l-2.04 2.04-4.55-4.3z"/></svg>
              {{ playMode === 'list' ? '顺序播放' : playMode === 'single' ? '单曲循环' : '随机播放' }}
            </button>
          </div>
          <div v-if="playlist.length" class="mobile-search-queue-list">
            <div
              v-for="(song, index) in playlist"
              :key="song.id || `${song.title}-${index}`"
              class="mobile-search-queue-song"
              :class="{ active: index === currentIndex }"
              role="button"
              tabindex="0"
              @click="playSong(index)"
              @keydown.enter="playSong(index)"
            >
              <span class="mobile-search-queue-song-index">
                <svg v-if="index === currentIndex && isPlaying" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true"><path d="M2 12h2V6H2v6Zm5 3h2V3H7v12Zm5-3h2V6h-2v6Z"/></svg>
                <template v-else>{{ index + 1 }}</template>
              </span>
              <img :src="song.cover" :alt="song.title" />
              <span class="mobile-search-queue-song-copy"><strong>{{ song.title }}</strong><small>{{ song.artist }}</small></span>
              <span class="mobile-search-queue-duration">{{ song.duration }}</span>
              <button type="button" class="mobile-search-queue-remove" :aria-label="`从播放列表移除 ${song.title}`" @click.stop="removeFromPlaylist(index)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m7 7 10 10M17 7 7 17"/></svg>
              </button>
            </div>
          </div>
          <div v-else class="mobile-search-queue-empty">接下来没有待播放的歌曲</div>
        </section>
      </div>
    </Transition>
    <div class="playlist-popup" v-if="showPlaylist">
      <div class="popup-header">
        <h3>播放列表</h3>
        <button class="close-btn" aria-label="关闭播放列表" @click="showPlaylist = false">
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
            <img :src="song.cover" :alt="song.title" loading="lazy" decoding="async" />
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
    </Teleport>

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
        <span>我的喜欢</span>
      </div>
      <div class="nav-item" :class="{ active: activeTab === 'playlist' }" @click="activeTab = 'playlist'">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
        </svg>
        <span>我的歌单</span>
      </div>
    </nav>

  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayer } from '../composables/usePlayer'
import { usePlaylists } from '../composables/usePlaylists'
import { useProgressBar } from '../composables/useProgressBar'
import { useVolumeSlider } from '../composables/useVolumeSlider'
import ProgressWalker from '../components/ProgressWalker.vue'
import PlayerShinchanDecor from '../components/PlayerShinchanDecor.vue'
import LyricsToggleButton from '../components/LyricsToggleButton.vue'
import MusicPageBackground from '../components/MusicPageBackground.vue'
import MusicSettingsPanel from '../components/MusicSettingsPanel.vue'
import PlaylistCardClimber from '../components/PlaylistCardClimber.vue'
import PlayerTitleMarquee from '../components/PlayerTitleMarquee.vue'
import { useMusicBackground } from '../composables/useMusicBackground'
import { getMusicThemeIp, getMusicThemeIpLabel, getThemedPlaylistCover } from '../config/musicThemeCatalog'
import { allSongs, recommendedSongs, featuredPlaylists, treasurePlaylists, editorPlaylists, dailyRecommendSongs, ensureMusicId } from '../data/songs.js'
import { searchAudiusTracks } from '../services/audius.js'
import { isJamendoConfigured, searchJamendoTracks } from '../services/jamendo.js'
import { searchITunesPreviews } from '../services/itunes.js'

const router = useRouter()
const showMusicSettings = ref(false)
const queueToastMessage = ref('')
let queueToastTimer = 0
const { settings: musicBackgroundSettings } = useMusicBackground()
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
  playSong: globalPlaySong,
  syncSongWithCatalog,
  setVolume: globalSetVolume,
  toggleLike: globalToggleLike,
  removeFromFavorites,
  cyclePlayMode,
  addToPlaylist,
  removeFromPlaylist,
  prefetchLyrics,
  playCollection
} = usePlayer()

const {
  playlists: userPlaylists,
  createPlaylist: createPlaylistRaw,
  getPlaylistById
} = usePlaylists()

// ── 进度条（使用共享 composable）──
const {
  progress,
  tooltipPosition,
  isDragging,
  dragCurrentTime,
  formatTime,
  syncProgress,
  seek,
  startDragging,
  handleDragging,
  stopDragging
} = useProgressBar({
  currentTime: sharedCurrentTime,
  duration: sharedDuration,
  onSeek: (percent) => globalSeek(percent * sharedDuration.value)
})

// ── 状态别名 ──
const activeTab = ref('discover')
const showPlaylist = ref(false)
const showMobilePlayerQueue = ref(false)
const handlePlaylistClick = () => {
  if (window.matchMedia('(max-width: 767px)').matches) {
    showPlaylist.value = false
    showMobilePlayerQueue.value = true
    return
  }
  if (window.matchMedia('(max-width: 1024px)').matches) {
    showPlaylist.value = false
    router.push({ name: 'MusicQueue', query: { from: router.currentRoute.value.fullPath } })
    return
  }
  showPlaylist.value = !showPlaylist.value
}
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
const previousVolume = ref(volume.value || 0.7)

const {
  volumeBarRef,
  isVolumeDragging,
  startVolumeDragging,
  handleVolumeDragging,
  stopVolumeDragging,
  cancelVolumeDragging,
  handleVolumeKeydown
} = useVolumeSlider({
  volume,
  onChange: (nextVolume) => {
    if (nextVolume > 0) previousVolume.value = nextVolume
    globalSetVolume(nextVolume)
  }
})

const spinKey = ref(0)
const searchQuery = ref('')
const searchResults = ref([])
const localSearchResults = ref([])
const onlineSearchResults = ref([])
const showSearchResults = ref(false)
const showMobileSearchQueue = ref(false)
const isOnlineSearching = ref(false)
const isDailyOnlineLoading = ref(false)
const searchError = ref('')
let searchTimer = null
let searchRequestId = 0
const heroSearchRef = ref(null)
const searchBoxRef = ref(null)
const searchPanelRef = ref(null)
const searchInputRef = ref(null)
const mobileSearchInputRef = ref(null)
const searchPanelStyle = ref({})
const isComposing = ref(false)
const isMobileSearchPage = ref(false)
const isRankBoardDragging = ref(false)
let rankBoardDrag = null
let blockRankBoardClickUntil = 0

const startRankBoardDrag = (event) => {
  if (!isMobileSearchPage.value) return
  if (event.pointerType === 'mouse' && event.button !== 0) return

  const scroller = event.currentTarget
  rankBoardDrag = {
    scroller,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    startScrollLeft: scroller.scrollLeft,
    axis: '',
    moved: false
  }
}

const moveRankBoardDrag = (event) => {
  if (!rankBoardDrag || rankBoardDrag.pointerId !== event.pointerId) return

  const deltaX = event.clientX - rankBoardDrag.startX
  const deltaY = event.clientY - rankBoardDrag.startY
  if (!rankBoardDrag.axis) {
    if (Math.hypot(deltaX, deltaY) < 7) return
    rankBoardDrag.axis = Math.abs(deltaX) > Math.abs(deltaY) * 1.08 ? 'x' : 'y'
    if (rankBoardDrag.axis !== 'x') return
    rankBoardDrag.scroller.setPointerCapture?.(event.pointerId)
  }
  if (rankBoardDrag.axis !== 'x') return

  event.preventDefault()
  rankBoardDrag.moved = true
  isRankBoardDragging.value = true
  rankBoardDrag.scroller.scrollLeft = rankBoardDrag.startScrollLeft - deltaX
}

const settleRankBoard = (scroller) => {
  const cards = [...scroller.querySelectorAll(':scope > .search-rank-board')]
  if (!cards.length) return

  const closestCard = cards.reduce((closest, card) => (
    Math.abs(card.offsetLeft - scroller.scrollLeft)
      < Math.abs(closest.offsetLeft - scroller.scrollLeft)
      ? card
      : closest
  ), cards[0])
  scroller.scrollTo({ left: closestCard.offsetLeft, behavior: 'smooth' })
}

const finishRankBoardDrag = (event) => {
  if (!rankBoardDrag || rankBoardDrag.pointerId !== event.pointerId) return
  const { scroller, pointerId, moved, axis } = rankBoardDrag
  if (scroller.hasPointerCapture?.(pointerId)) scroller.releasePointerCapture(pointerId)
  rankBoardDrag = null
  isRankBoardDragging.value = false

  if (moved) {
    blockRankBoardClickUntil = performance.now() + 320
    if (axis === 'x') requestAnimationFrame(() => settleRankBoard(scroller))
  }
}

const cancelRankBoardDrag = (event) => {
  if (!rankBoardDrag || rankBoardDrag.pointerId !== event.pointerId) return
  const { scroller, moved, axis } = rankBoardDrag
  rankBoardDrag = null
  isRankBoardDragging.value = false
  if (moved) {
    blockRankBoardClickUntil = performance.now() + 320
    if (axis === 'x') requestAnimationFrame(() => settleRankBoard(scroller))
  }
}

const suppressRankBoardClick = (event) => {
  if (performance.now() >= blockRankBoardClickUntil) return
  event.preventDefault()
  event.stopPropagation()
}

const isMobileSearchViewport = () => {
  if (typeof window === 'undefined') return false
  return (window.visualViewport?.width || window.innerWidth) <= 767
}

const syncMobileSearchPresentation = () => {
  const nextValue = isMobileSearchViewport()
  const changed = isMobileSearchPage.value !== nextValue
  isMobileSearchPage.value = nextValue

  if (changed && nextValue) {
    nextTick(() => mobileSearchInputRef.value?.focus())
  }

  return nextValue
}

const updateSearchPanelPosition = () => {
  const el = searchBoxRef.value
  if (!el) return

  const rect = el.getBoundingClientRect()
  const viewport = window.visualViewport
  const viewportWidth = viewport?.width || window.innerWidth
  const viewportHeight = viewport?.height || window.innerHeight
  const viewportLeft = viewport?.offsetLeft || 0
  const viewportTop = viewport?.offsetTop || 0
  const isMobileViewport = viewportWidth <= 767
  if (isMobileViewport) {
    isMobileSearchPage.value = true
    searchPanelStyle.value = {}
    return
  }

  isMobileSearchPage.value = false
  const edgeGap = isMobileViewport ? 12 : 0
  const panelWidth = isMobileViewport
    ? Math.max(0, Math.min(560, viewportWidth - edgeGap * 2))
    : rect.width
  const panelLeft = isMobileViewport
    ? viewportLeft + Math.max(edgeGap, (viewportWidth - panelWidth) / 2)
    : rect.left
  const availableHeight = Math.max(
    220,
    viewportTop + viewportHeight - rect.bottom - (isMobileViewport ? 12 : 20)
  )
  const maxHeight = Math.min(isMobileViewport ? 520 : 560, availableHeight)

  searchPanelStyle.value = {
    top: `${rect.bottom + 6}px`,
    left: `${panelLeft}px`,
    width: `${panelWidth}px`,
    minWidth: `${panelWidth}px`,
    maxWidth: `${panelWidth}px`,
    maxHeight: `${maxHeight}px`,
    boxSizing: 'border-box',
    transform: 'none'
  }
}

let searchPanelFrame = 0
const scheduleSearchPanelPosition = () => {
  if (searchPanelFrame) return
  searchPanelFrame = requestAnimationFrame(() => {
    searchPanelFrame = 0
    updateSearchPanelPosition()
  })
}

const bindSearchPanelListeners = () => {
  window.addEventListener('resize', scheduleSearchPanelPosition, { passive: true })
  window.addEventListener('scroll', scheduleSearchPanelPosition, { passive: true, capture: true })
  window.visualViewport?.addEventListener('resize', scheduleSearchPanelPosition, { passive: true })
  window.visualViewport?.addEventListener('scroll', scheduleSearchPanelPosition, { passive: true })
}

const unbindSearchPanelListeners = () => {
  window.removeEventListener('resize', scheduleSearchPanelPosition)
  window.removeEventListener('scroll', scheduleSearchPanelPosition, true)
  window.visualViewport?.removeEventListener('resize', scheduleSearchPanelPosition)
  window.visualViewport?.removeEventListener('scroll', scheduleSearchPanelPosition)
  if (searchPanelFrame) {
    cancelAnimationFrame(searchPanelFrame)
    searchPanelFrame = 0
  }
}

const dismissSearchPanel = () => {
  showSearchResults.value = false
  isOnlineSearching.value = false
  if (searchTimer) {
    clearTimeout(searchTimer)
    searchTimer = null
  }
}

const RECENT_SEARCH_KEY = 'music_recent_searches'
const MAX_RECENT_SEARCHES = 8
const guessYouLike = ['周杰伦', '林俊杰', '邓紫棋', '薛之谦', '陈粒', '五月天', '陈奕迅', '李荣浩', '海洋Bo', '虚拟']
const hotSearchList = ['晴天', '七里香', '稻香', '青花瓷', '夜曲', '告白气球', '演员', '像我这样的人', '成都']

const localHotSongs = computed(() => allSongs.slice(0, 9))
const hotRankSongs = computed(() => {
  const remainingSongs = [...allSongs]
  const rankedSongs = hotSearchList
    .map((keyword) => {
      const songIndex = remainingSongs.findIndex(song => song.title === keyword)
      return songIndex >= 0 ? remainingSongs.splice(songIndex, 1)[0] : null
    })
    .filter(Boolean)

  return [...rankedSongs, ...remainingSongs]
})

const loadRecentSearches = () => {
  try {
    const raw = localStorage.getItem(RECENT_SEARCH_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const recentSearches = ref(loadRecentSearches())

const persistRecentSearches = () => {
  try {
    localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(recentSearches.value))
  } catch {
    /* ignore quota errors */
  }
}

const saveRecentSearch = (keyword) => {
  const trimmed = String(keyword || '').trim()
  if (!trimmed) return
  recentSearches.value = [trimmed, ...recentSearches.value.filter(item => item !== trimmed)].slice(0, MAX_RECENT_SEARCHES)
  persistRecentSearches()
}

const openSearchPanel = () => {
  syncMobileSearchPresentation()
  showSearchResults.value = true
  scheduleSearchPanelPosition()
  if (isMobileSearchPage.value) {
    nextTick(() => mobileSearchInputRef.value?.focus())
  }
  if (searchQuery.value.trim()) {
    handleSearch()
  }
}

const onCompositionEnd = () => {
  isComposing.value = false
  handleSearch()
}

const onSearchInput = () => {
  if (isComposing.value) return
  handleSearch()
}

const applySearchKeyword = (keyword) => {
  searchQuery.value = keyword
  saveRecentSearch(keyword)
  handleSearch()
  nextTick(() => (isMobileSearchPage.value ? mobileSearchInputRef.value : searchInputRef.value)?.focus())
}

const clearRecentSearches = () => {
  recentSearches.value = []
  try {
    localStorage.removeItem(RECENT_SEARCH_KEY)
  } catch {
    /* ignore */
  }
}

const isSearchResultInQueue = (song) => {
  const playableSong = ensureMusicId(song)
  return playlist.value.some(
    item => getSongKey(item) === getSongKey(playableSong) || item.url === playableSong.url
  )
}

const addSearchResultToQueue = (song) => {
  const playableSong = ensureMusicId(song)

  if (isSearchResultInQueue(playableSong)) {
    showQueueToast('已添加')
    return
  }

  if (addToPlaylist(playableSong)) {
    showQueueToast('已添加')
    return
  }

  showQueueToast('播放列表中已有这首歌')
}

watch(onlineSearchResults, (results) => {
  // 只预取最可能点击的前三首，避免大量歌词请求互相抢占网络。
  results.slice(0, 3).forEach((song) => prefetchLyrics(song))
})

// ── 搜索逻辑 ──
const handleSearch = () => {
  showSearchResults.value = true
  scheduleSearchPanelPosition()
  const query = searchQuery.value.trim().toLowerCase()

  if (!query) {
    searchResults.value = []
    localSearchResults.value = []
    onlineSearchResults.value = []
    isOnlineSearching.value = false
    searchError.value = ''
    if (searchTimer) {
      clearTimeout(searchTimer)
      searchTimer = null
    }
    return
  }

  searchError.value = ''
  localSearchResults.value = searchLocalSongs(query)
  mergeSearchResults()

  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  searchTimer = setTimeout(() => {
    searchOnlineSongs(query)
  }, 260)
}

const normalizeText = (value = '') => String(value).toLowerCase()

const formatSearchDuration = (song) => {
  const value = String(song?.duration || '--:--')
  return value.replace(/\s*[（(][^）)]*试听[^）)]*[）)]\s*$/, '').trim() || '--:--'
}

const getSongKey = (song) => {
  if (!song) return ''
  return song.id || song.url || `${song.title}-${song.artist}`
}

const decorateSearchSong = (song, source = 'local') => {
  const normalized = ensureMusicId(song)
  return {
    ...normalized,
    source,
    searchKey: `${source}-${getSongKey(normalized)}`,
    duration: normalized.duration || (source === 'online' ? '试听' : '--:--')
  }
}

const collectSearchPool = () => {
  const userPlaylistSongs = userPlaylists.value.flatMap((pl) => {
    const detail = getPlaylistById(pl.id, favorites.value)
    return detail?.songs || []
  })

  return [
    ...allSongs,
    ...recommendedSongsList,
    ...favorites.value,
    ...playlist.value,
    ...userPlaylistSongs
  ]
}

const searchLocalSongs = (query) => {
  const seen = new Set()
  return collectSearchPool()
    .filter(Boolean)
    .filter(song => {
      const haystack = `${normalizeText(song.title)} ${normalizeText(song.artist)} ${normalizeText(song.album)}`
      return haystack.includes(query)
    })
    .map(song => decorateSearchSong(song, 'local'))
    .filter(song => {
      const key = getSongKey(song)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 12)
}

const mergeSearchResults = () => {
  searchResults.value = [...localSearchResults.value, ...onlineSearchResults.value]
}

const mapAudiusSearchSong = (song) => ({
  ...decorateSearchSong(song, 'audius'),
  isOnlineFull: true,
  provider: 'Audius'
})

const mapJamendoSearchSong = (song) => ({
  ...decorateSearchSong(song, 'jamendo'),
  isOnlineFull: true,
  provider: 'Jamendo'
})

const mapITunesSearchSong = (song) => ({
  ...decorateSearchSong(song, 'itunes'),
  isPreview: true,
  isOnlineFull: false,
  provider: 'iTunes'
})

const searchOnlineSongs = async (query) => {
  const requestId = ++searchRequestId
  isOnlineSearching.value = true
  searchError.value = ''

  try {
    // 完整曲目优先：Jamendo 为主、Audius 补充；iTunes 仅作为明确标识的 30 秒试听库。
    const [jamendoResult, audiusResult, itunesResult] = await Promise.allSettled([
      searchJamendoTracks(query, { limit: 8 }),
      searchAudiusTracks(query, { limit: 8 }),
      searchITunesPreviews(query, { limit: 8 })
    ])
    if (requestId !== searchRequestId) return

    if (jamendoResult.status === 'rejected' && audiusResult.status === 'rejected' && itunesResult.status === 'rejected') {
      throw new Error('online-search-failed')
    }

    const localKeys = new Set(localSearchResults.value.map(song => `${normalizeText(song.title)}-${normalizeText(song.artist)}`))
    const seen = new Set()
    const jamendoSongs = jamendoResult.status === 'fulfilled'
      ? jamendoResult.value.map(mapJamendoSearchSong)
      : []
    const audiusSongs = audiusResult.status === 'fulfilled'
      ? audiusResult.value.map(mapAudiusSearchSong)
      : []
    const itunesSongs = itunesResult.status === 'fulfilled'
      ? itunesResult.value.map(mapITunesSearchSong)
      : []

    onlineSearchResults.value = [...jamendoSongs, ...audiusSongs, ...itunesSongs]
      .filter(song => {
        const nameKey = `${normalizeText(song.title)}-${normalizeText(song.artist)}`
        const urlKey = song.url
        if (seen.has(urlKey) || localKeys.has(nameKey)) return false
        seen.add(urlKey)
        return true
      })
      .slice(0, 12)

    mergeSearchResults()
    if (!onlineSearchResults.value.length && !isJamendoConfigured() && audiusResult.status === 'rejected') {
      searchError.value = 'Audius 暂时不可用；配置 Jamendo Client ID 后可启用主曲库'
    }
  } catch (error) {
    if (requestId !== searchRequestId) return
    onlineSearchResults.value = []
    searchError.value = localSearchResults.value.length ? '' : '在线搜索暂时不可用'
    mergeSearchResults()
  } finally {
    if (requestId === searchRequestId) {
      isOnlineSearching.value = false
    }
  }
}

const closeSearch = () => {
  showMobileSearchQueue.value = false
  searchQuery.value = ''
  searchResults.value = []
  localSearchResults.value = []
  onlineSearchResults.value = []
  searchError.value = ''
  dismissSearchPanel()
  isMobileSearchPage.value = false
}

const openMobileSearchQueue = () => {
  showMobileSearchQueue.value = true
}

const closeMobileSearchQueue = () => {
  showMobileSearchQueue.value = false
}

const closeMobilePlayerQueue = () => {
  showMobilePlayerQueue.value = false
}

const openExternalSong = (song) => {
  if (song.externalUrl) {
    window.open(song.externalUrl, '_blank', 'noopener,noreferrer')
  }
}

const playSearchResult = (song) => {
  if (searchQuery.value.trim()) {
    saveRecentSearch(searchQuery.value)
  }
  const playableSong = song.isPreview
    ? ensureMusicId(song)
    : syncSongWithCatalog(ensureMusicId(song))
  prefetchLyrics(playableSong)
  globalPlaySong(playableSong)
  spinKey.value++
  closeSearch()
}

const playRankBoard = (songs) => {
  if (!songs?.length) return
  playCollection(songs, 0)
  spinKey.value++
}

const currentDate = ref(new Date().getDate())
const currentMonth = ref(new Date().getMonth() + 1)
const dailyViewMode = ref('today')

// 数据源
const recommendedSongsList = reactive([...recommendedSongs])
const dailyRecommendationLists = reactive({
  today: [...recommendedSongs],
  yesterday: [...recommendedSongs]
})
const dailyRecommendationDates = {
  today: new Date(),
  yesterday: new Date(Date.now() - 24 * 60 * 60 * 1000)
}
const featuredPlaylistsList = featuredPlaylists
const treasurePlaylistsList = treasurePlaylists
const editorPlaylistsList = editorPlaylists
const activeThemeIpLabel = computed(() => getMusicThemeIpLabel(musicBackgroundSettings.preset))
const activeThemeIp = computed(() => getMusicThemeIp(musicBackgroundSettings.preset))
const getActivePlaylistCover = (index, fallback = '') => getThemedPlaylistCover(musicBackgroundSettings.preset, index, fallback)

const DYNAMIC_CLIMBER_PRESETS = new Set(['motion-walk', 'motion-rain', 'motion-parade'])
const PLAYLIST_CLIMBER_TARGETS = [1, 4, 2, 5, 0, 3]
const PLAYLIST_CLIMBER_CHARACTERS = ['friends', 'shinchan', 'friends', 'friends']
const activeClimbCardIndex = ref(-1)
const activeClimbCharacter = ref('shinchan')
const playlistClimbCycle = ref(0)
let playlistClimberTimer = null
let playlistClimberTargetCursor = 0

const playlistClimberEnabled = computed(() => (
  activeTab.value === 'discover'
  && musicBackgroundSettings.mode === 'default'
  && musicBackgroundSettings.showShinchan
  && DYNAMIC_CLIMBER_PRESETS.has(musicBackgroundSettings.preset)
))

function clearPlaylistClimberTimer() {
  if (!playlistClimberTimer) return
  window.clearTimeout(playlistClimberTimer)
  playlistClimberTimer = null
}

function queueNextPlaylistClimb(delay = 2400) {
  clearPlaylistClimberTimer()
  if (!playlistClimberEnabled.value) {
    activeClimbCardIndex.value = -1
    return
  }

  playlistClimberTimer = window.setTimeout(() => {
    const cardCount = featuredPlaylistsList.length
    const target = PLAYLIST_CLIMBER_TARGETS[playlistClimberTargetCursor % PLAYLIST_CLIMBER_TARGETS.length]
    activeClimbCardIndex.value = cardCount ? target % cardCount : -1
    activeClimbCharacter.value = PLAYLIST_CLIMBER_CHARACTERS[playlistClimberTargetCursor % PLAYLIST_CLIMBER_CHARACTERS.length]
    playlistClimbCycle.value += 1
    playlistClimberTargetCursor += 1

    playlistClimberTimer = window.setTimeout(() => {
      activeClimbCardIndex.value = -1
      queueNextPlaylistClimb()
    }, 9000)
  }, delay)
}

watch(playlistClimberEnabled, (enabled) => {
  clearPlaylistClimberTimer()
  activeClimbCardIndex.value = -1
  if (enabled) queueNextPlaylistClimb(1400)
}, { immediate: true })

const DAILY_ONLINE_QUERIES = [
  'indie pop discovery',
  'chill electronic',
  'acoustic soul',
  'dream pop',
  'lofi jazz',
  'city pop night drive',
  'alternative rock discovery',
  'female vocal indie',
  'melodic electronic',
  'folk acoustic morning',
  'neo soul groove',
  'ambient cinematic'
]

const getDailySeed = (date = new Date()) => {
  const dateKey = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-')

  let hash = 2166136261
  for (const character of dateKey) {
    hash ^= character.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

const shuffleWithDailySeed = (songs, seed) => {
  const result = [...songs]
  let state = seed || 1

  const nextRandom = () => {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    return (state >>> 0) / 4294967296
  }

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(nextRandom() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }

  return result
}

const mergeDailySongs = (localSongs, onlineSongs) => {
  const result = []
  const pendingOnline = [...onlineSongs]

  localSongs.forEach((song, index) => {
    result.push(song)
    if ((index + 1) % 2 === 0 && pendingOnline.length) {
      result.push(pendingOnline.shift())
    }
  })

  return [...result, ...pendingOnline]
}

let dailyRecommendationRequestId = 0

const buildDailyRecommendationList = async (date) => {
  const dailySeed = getDailySeed(date)
  const shuffledLocalSongs = shuffleWithDailySeed(recommendedSongs, dailySeed)

  try {
    const firstQueryIndex = dailySeed % DAILY_ONLINE_QUERIES.length
    const secondQueryIndex = (firstQueryIndex + 3 + (dailySeed % 5)) % DAILY_ONLINE_QUERIES.length
    const queryResults = await Promise.allSettled([
      searchAudiusTracks(DAILY_ONLINE_QUERIES[firstQueryIndex], { limit: 6 }),
      searchAudiusTracks(DAILY_ONLINE_QUERIES[secondQueryIndex], { limit: 6 })
    ])

    const seen = new Set()
    const onlineCandidates = queryResults
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => result.value)
      .filter((song) => {
        const key = song.id || song.url || `${song.title}-${song.artist}`
        if (!key || seen.has(key)) return false
        seen.add(key)
        return true
      })

    const onlineSongs = shuffleWithDailySeed(onlineCandidates, dailySeed ^ 0x9e3779b9).slice(0, 4)

    if (onlineSongs.length) {
      return mergeDailySongs(shuffledLocalSongs.slice(0, 6), onlineSongs)
    }
  } catch (error) {
    console.warn('Daily online recommendations unavailable:', error)
  }

  // 在线服务不可用时保留按日期排好的本地推荐，不打断页面。
  return shuffledLocalSongs
}

const applyDailyRecommendationView = () => {
  const date = dailyRecommendationDates[dailyViewMode.value]
  const songs = dailyRecommendationLists[dailyViewMode.value]
  currentDate.value = date.getDate()
  currentMonth.value = date.getMonth() + 1
  recommendedSongsList.splice(0, recommendedSongsList.length, ...songs)
}

const showDailyRecommendations = (period) => {
  if (!dailyRecommendationLists[period]) return
  dailyViewMode.value = period
  applyDailyRecommendationView()
}

const refreshDailyRecommendations = async () => {
  const requestId = ++dailyRecommendationRequestId
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  dailyRecommendationDates.today = today
  dailyRecommendationDates.yesterday = yesterday
  dailyRecommendationLists.today = shuffleWithDailySeed(recommendedSongs, getDailySeed(today))
  dailyRecommendationLists.yesterday = shuffleWithDailySeed(recommendedSongs, getDailySeed(yesterday))
  applyDailyRecommendationView()
  isDailyOnlineLoading.value = true

  try {
    const [todaySongs, yesterdaySongs] = await Promise.all([
      buildDailyRecommendationList(today),
      buildDailyRecommendationList(yesterday)
    ])

    if (requestId !== dailyRecommendationRequestId) return

    dailyRecommendationLists.today = todaySongs
    dailyRecommendationLists.yesterday = yesterdaySongs
    applyDailyRecommendationView()
  } finally {
    if (requestId === dailyRecommendationRequestId) {
      isDailyOnlineLoading.value = false
    }
  }
}

let dailyRefreshTimer = null

const scheduleNextDailyRefresh = () => {
  if (dailyRefreshTimer) window.clearTimeout(dailyRefreshTimer)

  const now = new Date()
  const nextMidnight = new Date(now)
  nextMidnight.setHours(24, 0, 3, 0)

  dailyRefreshTimer = window.setTimeout(() => {
    refreshDailyRecommendations()
    scheduleNextDailyRefresh()
  }, Math.max(1000, nextMidnight.getTime() - now.getTime()))
}

const getPlaylistPlayCount = (playlistId) => {
  const pl = getPlaylistById(playlistId)
  return pl ? pl.playCount : '0'
}

// ── 播放控制 ──
const togglePlay = () => globalTogglePlay()

const goToAllPlaylists = () => router.push('/music/playlists')

const openPlaylistFromHome = (playlistId) => {
  router.push({ name: 'PlaylistDetail', params: { id: playlistId }, query: { from: 'home' } })
}

const toggleMute = () => {
  if (volume.value > 0) {
    previousVolume.value = volume.value
    globalSetVolume(0)
    return
  }
  globalSetVolume(previousVolume.value || 0.7)
}

const togglePlayMode = () => {
  cyclePlayMode()
}

const nextSong = () => { globalNext(); spinKey.value++ }
const prevSong = () => { globalPrev(); spinKey.value++ }

const playSong = (index) => {
  playByIndex(index)
  showMobilePlayerQueue.value = false
  showMobileSearchQueue.value = false
  spinKey.value++
}

const goToPlayer = () => router.push('/music-player')

const defaultCover = '/images/covers/qingtian.jpg'

const handleImageError = (e) => { e.target.src = defaultCover }

const handleCoverError = () => {
  coverPreview.value = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg=='
}

const playRecommendedSong = (songOrIndex) => {
  const selectedSong = typeof songOrIndex === 'number'
    ? recommendedSongsList[songOrIndex]
    : songOrIndex
  const song = syncSongWithCatalog(selectedSong)
  if (!song) return
  globalPlaySong(song)
  spinKey.value++
}

const showQueueToast = (message) => {
  queueToastMessage.value = ''
  if (queueToastTimer) window.clearTimeout(queueToastTimer)
  requestAnimationFrame(() => {
    queueToastMessage.value = message
    queueToastTimer = window.setTimeout(() => {
      queueToastMessage.value = ''
      queueToastTimer = 0
    }, 1600)
  })
}

const addRecommendedToQueue = (song) => {
  const playableSong = ensureMusicId(song)
  const currentKey = getSongKey(currentSong.value)
  const songKey = getSongKey(playableSong)

  if (songKey && songKey === currentKey) {
    showQueueToast('当前歌曲正在播放')
    return
  }

  if (addToPlaylist(playableSong)) {
    showQueueToast('已添加')
    return
  }

  showQueueToast('播放列表中已有这首歌')
}

const removeFavorite = (index) => removeFromFavorites(index)

const playFavoriteSong = (index) => {
  const song = syncSongWithCatalog(favorites.value[index])
  if (!song) return
  globalPlaySong(song)
  spinKey.value++
}

const playAllRecommended = () => {
  if (!recommendedSongsList.length) return
  playCollection(recommendedSongsList, 0)
}

const playAllFavorites = () => {
  if (!favorites.value.length) return
  playCollection(favorites.value, 0)
}

const toggleLike = () => globalToggleLike()

const playPlaylist = (pl) => {
  openPlaylistFromHome(pl.id)
}

// ── 创建歌单弹窗 ──
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

const createPlaylist = () => { showCreatePlaylistModal.value = true }

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
  openPlaylistFromHome(pl.id)
}

const cancelCreatePlaylist = () => {
  showCreatePlaylistModal.value = false
  newPlaylistName.value = ''
  newPlaylistDescription.value = ''
  newPlaylistCover.value = ''
  coverPreview.value = '/images/playlist-default.jpg'
}

let bodyOverflowBeforeModal = ''

const onCreatePlaylistKeyDown = (event) => {
  if (event.key === 'Escape') cancelCreatePlaylist()
}

watch(showCreatePlaylistModal, (visible) => {
  if (visible) {
    bodyOverflowBeforeModal = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onCreatePlaylistKeyDown)
    nextTick(() => document.querySelector('.create-playlist-modal input[type="text"]')?.focus())
    return
  }

  document.body.style.overflow = bodyOverflowBeforeModal
  document.removeEventListener('keydown', onCreatePlaylistKeyDown)
})

// ── 生命周期 ──
const onDocumentPointerDown = (event) => {
  if (!showSearchResults.value) return
  if (heroSearchRef.value?.contains(event.target)) return
  if (searchPanelRef.value?.contains(event.target)) return
  dismissSearchPanel()
}

watch(showSearchResults, (visible) => {
  if (visible) {
    nextTick(updateSearchPanelPosition)
    bindSearchPanelListeners()
    document.addEventListener('mousedown', onDocumentPointerDown)
    return
  }
  unbindSearchPanelListeners()
  document.removeEventListener('mousedown', onDocumentPointerDown)
})

onMounted(() => {
  initAudio()
  refreshDailyRecommendations()
  scheduleNextDailyRefresh()
  nextTick(() => syncProgress())
})

onUnmounted(() => {
  if (dailyRefreshTimer) window.clearTimeout(dailyRefreshTimer)
  if (queueToastTimer) window.clearTimeout(queueToastTimer)
  clearPlaylistClimberTimer()
  dailyRecommendationRequestId += 1
  unbindSearchPanelListeners()
  document.removeEventListener('mousedown', onDocumentPointerDown)
  document.removeEventListener('keydown', onCreatePlaylistKeyDown)
  document.body.style.overflow = bodyOverflowBeforeModal
})
</script>
<style scoped>
@import '../css/Music.css';
</style>
