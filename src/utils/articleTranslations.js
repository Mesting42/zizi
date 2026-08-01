export const articleCategoryTranslations = {
  全部: 'All',
  Flutter: 'Flutter',
  性能优化: 'Performance',
  工具: 'Tooling',
  学习记录: 'Learning Notes'
}

export const articleTranslations = {
  1001: {
    title: 'Mesting Music: From a Native Flutter Rebuild to a Java Service Backend',
    excerpt: 'From Vue and Capacitor to a native Flutter client, then from a CloudBase-primary backend to Java 21, Spring Boot 4.1, and MySQL 8: this retrospective covers playback architecture, data migration, authentication boundaries, staged rollout, and cloud deployment.',
    content: `
      <blockquote>
        <p>A rebuild is not the act of rewriting old screens in a new language. It preserves validated product memory while deciding what should become the new system’s foundation.</p>
      </blockquote>

      <h2>1. Why Move from the Web to Flutter?</h2>
      <p>Mesting Music began as a music module inside my personal digital space. As the full player, lyrics, queue, themes, playlists, floating lyrics, and Android media controls grew, it stopped behaving like a page. It became a music product that needed to stay alive, preserve state between screens, and work closely with the operating system.</p>
      <p>The Vue and Capacitor version validated the product direction, but it also revealed the limits of a WebView-based runtime. Layered themes and video backgrounds could drop frames. Pages, audio elements, browser storage, and native bridges could each hold competing copies of state. Background playback, notifications, lock-screen controls, system back gestures, and lifecycle recovery required increasingly fragile patches.</p>
      <p>I therefore rebuilt the Android application independently in Flutter. <mark>The old interface was not embedded and its WebView runtime was not reused. It became a behavioral specification and a source of product lessons.</mark></p>

      <h2>2. Rebuild the Product Before Rebuilding the Code</h2>
      <p>Before implementation, I reorganized the product into six capability layers: discovery, playback, collection, visual identity, social connection, and service/native systems. The main navigation became four stable destinations: For You, Discover Music, Favorites, and Me.</p>
      <p>Every destination shares one persistent mini player. Moving from a playlist to the full player, lyrics, queue, or a friend’s profile never interrupts the sound or replaces the current track because a widget was rebuilt. This appears to be a layout choice, but it actually defines the state boundary for the entire application.</p>

      <h3>Six Principles Behind the Rebuild</h3>
      <ul>
        <li><strong>Music comes first:</strong> visuals may carry emotion, but never obscure playback, search, or queue actions.</li>
        <li><strong>One playback truth:</strong> screens observe shared state instead of keeping their own “current track.”</li>
        <li><strong>The queue expresses intent:</strong> tapping a track plays that track; adding to the queue does not switch immediately; Play All is the action that builds a complete queue.</li>
        <li><strong>Identity is a system:</strong> a theme includes its background, brightness, player form, character, and performance level—not only a color.</li>
        <li><strong>Connection grows from listening:</strong> friends, statuses, and shared sessions extend music behavior instead of living in an unrelated social module.</li>
        <li><strong>Local reliability first:</strong> local playback, playlists, and favorites remain useful when cloud services or online sources fail.</li>
      </ul>

      <h2>3. The Playback Core: Moving Sound Beyond the Widget Lifecycle</h2>
      <p>The most important part of the rebuild was not a specific player screen. It was a single playback core that remains alive. Flutter widgets use Riverpod to observe state and send user intent. <code>MestingAudioHandler</code> owns the queue, current media item, repeat mode, and shuffle mode, while <code>just_audio</code> performs the actual playback.</p>

      <pre><code>Flutter UI
  → Riverpod Providers
  → Playback Controller
  → MestingAudioHandler
  → just_audio / audio_session
  → Android Media Service</code></pre>

      <p><code>audio_service</code> exposes that same state to the background service, notification controls, lock screen, and headset buttons. <code>audio_session</code> coordinates calls, audio focus, unplugged headphones, and interruptions from other apps. Wherever the listener is, the operating system and the application agree about the current track, position, and controls.</p>

      <h3>Why the Queue and History Must Be Separate</h3>
      <p>Previous and Next are deceptively difficult. In shuffle mode, Previous must not simply randomize again. Once a queued song has played, the application should not reconstruct history by guessing from the visible list. The new architecture therefore separates the pending queue, active source and index, and real playback history.</p>
      <p>Next consumes explicit queue intent first. Previous follows real history. When the pending queue is empty, playback continues according to the active source and mode. Invalid URLs also have bounded failure handling so a group of broken sources cannot create an infinite skip loop. These rules are visually quiet, but they determine whether the player feels trustworthy.</p>

      <h2>4. Information Architecture for 43 Capabilities</h2>
      <p>The finished product contains 43 visible capabilities, but the home screen does not expose all of them at once. They are grouped by user goals:</p>
      <ul>
        <li><strong>Discovery:</strong> personalized recommendations, Daily Picks, private mixes, time-aware prompts, status-based entry points, and combined local/online search.</li>
        <li><strong>Playback:</strong> queue management, repeat and shuffle, lyrics, seeking, prefetching, notifications, and continuous background playback.</li>
        <li><strong>Collection:</strong> favorites, personal playlists, recent plays, listening rankings, and account-based recovery.</li>
        <li><strong>Visual identity:</strong> 25 static and animated themes, three player styles, character progress indicators, and custom image or muted-video backgrounds.</li>
        <li><strong>Accounts and shared listening:</strong> profiles, follows, private messages, voice notes, statuses, and synchronized sessions.</li>
        <li><strong>Services and native systems:</strong> account sync, relational data, in-app updates, system sharing, back gestures, notifications, and lifecycle recovery.</li>
      </ul>
      <p>Every feature must answer one question: is the listener trying to find music, control it, save it, express an identity, or connect with someone? If a feature cannot answer that question, it should not occupy a first-level destination.</p>

      <h2>5. The Visual System: More Than 25 Background Images</h2>
      <p>The visual language retains four character families—Classic, Crayon Shin-chan, Hello Kitty, and Kuromi—alongside static scenes, animated scenes, and custom image or muted looping-video backgrounds. A theme configuration can control the background, brightness mode, card material, accent color, launch screen, playlist artwork, progress character, and animation tier.</p>
      <p>The full player can also switch between Classic Vinyl, Luminous Vinyl, and Orbital Pulse without interrupting playback because visual rendering and audio state are completely separate. Characters may travel along the progress bar and scenes may move subtly, but decoration avoids the primary control area and can be downgraded on slower devices.</p>
      <p>Mobile is not a scaled-down desktop. Phones emphasize one-handed interaction, bottom navigation, the capsule player, and sheets. Wider screens can place lyrics, queue, and richer controls together. <mark>Responsive design is the redistribution of attention, not simple scaling.</mark></p>

      <h2>6. Client Data: Local First, with Explicit Service Boundaries</h2>
      <p>Structured local data is stored with Drift. Tracks, favorites, playlists, playlist-track relationships, and online-track snapshots are modeled separately and accessed through repositories. Screens never write directly to the database. When an online track enters a personal playlist, enough metadata is stored locally to keep it useful during a temporary API outage.</p>
      <p>Theme selection, brightness mode, and lightweight preferences use SharedPreferences. Accounts, cross-device profiles, social relationships, messages, favorites, and playback history belong to the service domain. Flutter still responds locally first and reconciles authoritative state when connectivity returns instead of blocking a favorite action on network latency.</p>
      <p><code>go_router</code> organizes navigation while keeping the player shell persistent. <code>flutter_riverpod</code> divides state by domain, and each screen observes only the smallest state fragment it needs. The backend migration did not change that rule: the server is authoritative for cross-device data, but it does not own the real-time playback lifecycle.</p>

      <h2>7. Why Move the Primary Backend from CloudBase to Java and MySQL?</h2>
      <p>CloudBase helped the early product validate accounts, synchronization, and social features quickly. Long-term maintenance, however, required clearer domain models, relational constraints, versioned schema migrations, and a deployment chain that could be diagnosed independently. The point was not to adopt a heavier stack for its own sake. It was to make data ownership, authentication rules, service boundaries, and failure locations explicit.</p>
      <p>The new compatibility API preserves the previous action protocol, so Flutter did not need an all-at-once rewrite. <code>AUTH_API_BASE_URL</code> switches the client between the previous service and the Java API while login, profiles, favorites, playlists, follows, messages, history, and Listen Together compatibility actions are verified one by one.</p>

      <pre><code>Flutter Android Client
  → Nginx /v1/
  → Java 21 / Spring Boot 4.1
  → Spring Security / JWT
  → MySQL 8 / Flyway

Side services
  → QQ SMTP verification
  → CVM media storage (test environment)</code></pre>

      <p>The Spring Boot service implements registration, login, access and refresh tokens, verification-code password recovery, user profiles, follows, blocks, private messages, favorites, playlists, playback history, Listen Together compatibility actions, and media uploads. Flyway puts schema changes under version control instead of relying on one-off manual database edits.</p>

      <h2>8. Data Migration: From 19 Collections to a Verifiable Relational Model</h2>
      <p>The migration exported 19 CloudBase collections containing 676 raw records. After normalization, deduplication, and relational mapping, 669 rows were imported into MySQL. The verified result included 9 users, 255 messages, and 335 playback-history entries, alongside follows, playlists, favorites, and Listen Together data.</p>
      <p>A successful import is not the end of a migration. Foreign keys, orphaned follows, ownerless messages, and count differences were checked; no orphan follow or message records remained. CloudBase Auth password hashes could not be transferred safely, so no fake compatibility password was created. Existing users must reset their passwords through email or phone verification. Three email bindings and seven phone bindings were synchronized afterward.</p>
      <p>The central lesson is that <mark>a migration report must state both what moved successfully and what security boundaries made impossible to move</mark>. Otherwise “the data was migrated” becomes a misleading promise.</p>

      <h2>9. Authentication, Synchronization, and Failure Boundaries</h2>
      <p>Spring Security and JWT now own authentication, with separate access and refresh tokens. Registration, password reset, and account recovery use verification codes delivered through QQ SMTP over SSL. Both email and phone account paths remain supported so the migration does not privilege only new users.</p>
      <p>Favorites, playlists, playback history, and social relationships have explicit server records, while Flutter retains local state and actionable failure feedback. Requests distinguish unauthenticated, validation, connectivity, and server failures instead of collapsing them into a generic loading error. Diagnosis can now follow the chain through Nginx, Spring Boot, SQL, and SMTP rather than guessing between client code and cloud functions.</p>

      <h2>10. Deployment and Release Status: A Test Environment Is Not Production</h2>
      <p>The Java service runs on a Tencent Cloud Ubuntu 22.04 CVM under systemd. Nginx forwards only <code>/v1/</code> to <code>127.0.0.1:8080</code>; MySQL remains internal, and ports 3306 and 8080 are not publicly exposed. Test uploads are written to <code>/opt/mesting-api/data/media</code>, with their metadata URLs stored in MySQL.</p>
      <p>The public stable release remains <strong>1.0.37 (build 38)</strong>. The Java and MySQL connected <strong>1.0.38+39</strong> build is a migration test release whose login, registration, password reset, and email-verification paths have been verified. It still uses a public IP over HTTP; a domain and HTTPS are pending, so it must not be described as a final production deployment. During this transition, CloudBase remains only for the update manifest and APK hosting, not as the new primary user-data backend.</p>

      <h2>11. Performance Is Part of the Theme System</h2>
      <p>The earlier version taught me that motion cannot be judged only by how it looks. It also needs a clear rule for when it stops. Performance decisions are therefore part of Flutter theme configuration:</p>
      <ul>
        <li>Animations, video backgrounds, and frequent painting pause when they leave the viewport.</li>
        <li>Large images are decoded near their display size and loaded only when needed.</li>
        <li>Full Motion, Auto, and Battery Saver modes allow graceful visual reduction.</li>
        <li>High-frequency state such as playback position updates only a small set of widgets.</li>
        <li>The next track can be prefetched without loading an entire library during startup.</li>
        <li>Backgrounding the app preserves audio while suspending unnecessary visual work.</li>
      </ul>
      <p>This is another reason the player and interface must remain separate: visuals can pause, degrade, or rebuild; the sound must continue.</p>

      <h2>12. The Migration Sequence: Build the Spine, Then Move Authoritative Data</h2>
      <ol>
        <li><strong>Inventory client behavior:</strong> document what every old screen actually accomplished instead of copying screenshots.</li>
        <li><strong>Define domain models:</strong> establish Track, Playlist, Favorite, PlaybackSnapshot, LyricsDocument, and ThemePreset first.</li>
        <li><strong>Rebuild the playback spine:</strong> local playback, queue rules, three modes, background media sessions, and recovery.</li>
        <li><strong>Restore the music archive:</strong> Drift, favorites, playlists, lyrics, and listening history.</li>
        <li><strong>Rebuild the visual language:</strong> translate CSS effects into Flutter animation and a degradable theme renderer.</li>
        <li><strong>Establish the Java compatibility API:</strong> retain the action protocol while replacing account, sync, social, and media endpoints.</li>
        <li><strong>Migrate and reconcile data:</strong> export CloudBase, normalize MySQL tables, run Flyway, and verify foreign keys and counts.</li>
        <li><strong>Switch the client in stages:</strong> connect a test build through configuration and keep stable and Java-backend releases clearly separated.</li>
        <li><strong>Verify on real devices:</strong> test playback lifecycle, offline states, token expiry, password recovery, sync conflicts, and reduced-performance mode.</li>
      </ol>

      <h2>13. Core Technology Choices</h2>
      <ul>
        <li><strong>Flutter and Dart:</strong> the Android interface, motion system, and domain models.</li>
        <li><strong>Riverpod:</strong> cross-screen playback, lyrics, playlists, themes, and account state.</li>
        <li><strong>go_router:</strong> paths, deep navigation, and a persistent player shell.</li>
        <li><strong>just_audio:</strong> local and online audio, queues, seeking, repeat, and shuffle.</li>
        <li><strong>audio_service:</strong> background service, notifications, lock-screen controls, and media sessions.</li>
        <li><strong>audio_session:</strong> focus, call interruption, headset behavior, and audio coexistence.</li>
        <li><strong>Drift and SQLite:</strong> favorites, playlists, relational track data, snapshots, and migrations.</li>
        <li><strong>SharedPreferences:</strong> themes and lightweight preferences.</li>
        <li><strong>Java 21 and Spring Boot 4.1:</strong> service boundaries for accounts, sync, social data, media, and compatibility endpoints.</li>
        <li><strong>Spring Security and JWT:</strong> login, access tokens, refresh tokens, and endpoint authorization.</li>
        <li><strong>MySQL 8 and Flyway:</strong> relational data, constraints, indexes, and versioned schema changes.</li>
        <li><strong>Nginx, systemd, and Tencent Cloud CVM:</strong> reverse proxying, process supervision, and test deployment.</li>
        <li><strong>QQ SMTP:</strong> verification codes for registration, password recovery, and account restoration.</li>
        <li><strong>Android platform capabilities:</strong> notifications, system sharing, back gestures, lifecycle handling, and in-app updates.</li>
      </ul>

      <h2>14. What These Two Migrations Actually Changed</h2>
      <p>The first migration changed the client’s foundation. The old application began with pages and tried to carry state through them; Flutter begins with persistent playback and local data systems, then lets interfaces observe them. The second migration changed the authority boundary: accounts, relationships, and cross-device state moved from a cloud-function arrangement into a Java service that can be versioned, constrained, and deployed independently.</p>
      <p>The direction of Mesting Music is now clearer as well. It is not trying to be the player with the longest feature list. It is a personal soundspace that remembers listening behavior, allows visual identity, and makes sharing one song with a friend feel natural.</p>
      <blockquote>
        <p>A migration is complete not when every technology label has changed, but when every piece of state has an explicit owner, a verifiable path, and an honest failure boundary.</p>
      </blockquote>
    `
  },
  1: {
    title: 'The Complete Guide to Vue 3 Composition API',
    excerpt: 'A complete guide to Vue 3’s Composition API, from setup, ref, and reactive to computed and watch. Practical examples show how to organize component logic for clearer, reusable, and maintainable code.',
    content: `
      <h2>What Is the Composition API?</h2>
      <p>The Composition API is a set of APIs introduced in Vue 3. It provides a <mark>more flexible</mark> way to organize component logic. Compared with the Options API, it keeps related logic together and makes code easier to reuse and maintain.</p>

      <h2>Core Concepts</h2>
      <h3>1. ref and reactive</h3>
      <p><code>ref</code> and <code>reactive</code> are the two main ways to create reactive state. <mark>Use ref for primitive values</mark> and reactive for objects.</p>

      <pre><code>import { ref, reactive } from 'vue'

// Create reactive primitive values with ref
const count = ref(0)
const name = ref('Vue')

// Create a reactive object with reactive
const state = reactive({
  count: 0,
  name: 'Vue'
})</code></pre>

      <h3>2. computed</h3>
      <p><code>computed</code> creates derived state. Vue automatically tracks its dependencies and recalculates the value whenever those dependencies change.</p>

      <pre><code>const doubled = computed(() => count.value * 2)</code></pre>

      <h3>3. watch and watchEffect</h3>
      <p><code>watch</code> observes explicitly selected state, while <code>watchEffect</code> automatically tracks every reactive value used inside its callback.</p>

      <pre><code>watch(count, (newValue, oldValue) => {
  console.log('count changed from', oldValue, 'to', newValue)
})

watchEffect(() => {
  console.log('current count:', count.value)
})</code></pre>

      <h2>Benefits</h2>
      <ul>
        <li>Clearer organization of related logic</li>
        <li>More flexible code reuse</li>
        <li>Stronger TypeScript support</li>
        <li>Better opportunities for bundle optimization</li>
      </ul>
    `
  },
  2: {
    title: 'Modern CSS Techniques and Practice',
    excerpt: 'Explore modern CSS features including Flexbox, Grid, custom properties, motion, and transitions. Learn responsive composition practices for interfaces that remain polished, adaptable, and performant.',
    content: `
      <h2>CSS Grid Layout</h2>
      <p>CSS Grid is a <mark>powerful two-dimensional layout system</mark> that makes complex page structures easier to build and maintain.</p>

      <pre><code>.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}</code></pre>

      <h2>Flexible Layouts with Flexbox</h2>
      <p>Flexbox is a one-dimensional layout system designed for <mark>flexible component alignment</mark> along a row or column.</p>

      <pre><code>.flex-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}</code></pre>

      <h2>CSS Custom Properties</h2>
      <p>CSS custom properties let us define reusable design values, making themes and shared interface rules easier to update.</p>

      <pre><code>:root {
  --primary-color: #3b82f6;
  --secondary-color: #1e40af;
  --spacing: 1rem;
}

.button {
  background: var(--primary-color);
  padding: var(--spacing);
}</code></pre>

      <h2>Modern CSS Features</h2>
      <ul>
        <li>Custom properties and design tokens</li>
        <li>Grid and Flexbox composition</li>
        <li>Motion, transitions, and transforms</li>
        <li>Filters and blend modes</li>
      </ul>
    `
  },
  3: {
    title: 'Asynchronous JavaScript Explained',
    excerpt: 'Follow asynchronous JavaScript from callbacks and Promises to async/await. Understand the event loop, handle complex flows, and write async code that is easier to reason about.',
    content: `
      <h2>Asynchronous Programming Fundamentals</h2>
      <p>JavaScript runs on a single main thread, so asynchronous programming is essential for handling network requests, timers, and other long-running work without blocking the interface.</p>

      <h2>Promise</h2>
      <p>A Promise represents the eventual completion or failure of an asynchronous operation and provides a structured way to compose its result.</p>

      <h2>Async/Await</h2>
      <p>Async/await is syntax built on top of Promises. It makes asynchronous flows read more like synchronous code while preserving non-blocking behavior.</p>

      <h2>The Event Loop</h2>
      <p>Understanding the event loop, task queue, and microtask queue is fundamental to predicting when asynchronous JavaScript will run.</p>

      <h2>Best Practices</h2>
      <ul>
        <li>Always handle rejected operations</li>
        <li>Avoid deeply nested callbacks</li>
        <li>Use <code>Promise.all</code> when tasks can run together</li>
        <li>Understand the difference between tasks and microtasks</li>
      </ul>
    `
  },
  4: {
    title: 'Practical Frontend Performance Optimization',
    excerpt: 'Improve loading, code splitting, lazy loading, and rendering performance across the frontend. Use Chrome DevTools and key metrics to diagnose bottlenecks and build a faster experience.',
    content: `
      <h2>Performance in Context</h2>
      <p>Frontend performance directly shapes the user experience. It includes how quickly resources load, how smoothly the page renders, and how promptly the interface responds.</p>

      <h2>Optimizing Resource Loading</h2>
      <ul>
        <li>Split code and load routes on demand</li>
        <li>Compress images and defer off-screen media</li>
        <li>Serve static assets through a CDN</li>
        <li>Use HTTP/2 or HTTP/3 where available</li>
      </ul>

      <h2>Optimizing Rendering</h2>
      <ul>
        <li>Reduce unnecessary DOM work</li>
        <li>Use virtualization for very long lists</li>
        <li>Avoid forced synchronous layout</li>
        <li>Prefer transform and opacity for motion</li>
      </ul>

      <h2>Performance Analysis</h2>
      <p>Chrome DevTools can reveal loading, scripting, rendering, and layout bottlenecks. Measure first, then optimize the work that has the greatest effect on the experience.</p>
    `
  },
  5: {
    title: 'A Practical Guide to Vite',
    excerpt: 'Understand Vite’s native ES module development server, Rollup-powered production builds, plugin system, environment configuration, and deployment optimization.',
    content: `
      <h2>Introducing Vite</h2>
      <p>Vite is a modern frontend build tool that uses native ES modules to provide a fast and focused development experience.</p>

      <h2>Core Features</h2>
      <ul>
        <li>Near-instant development server startup</li>
        <li>Fast hot module replacement</li>
        <li>Efficient production builds powered by Rollup</li>
        <li>A broad plugin ecosystem</li>
      </ul>

      <h2>Compared with Traditional Bundlers</h2>
      <p>Vite serves source modules directly during development, reducing the amount of work required before the browser can display a change.</p>

      <h2>Best Practices</h2>
      <ul>
        <li>Separate environment-specific configuration</li>
        <li>Add plugins only when they provide clear value</li>
        <li>Inspect and optimize the production bundle</li>
        <li>Define a deliberate code-splitting strategy</li>
      </ul>
    `
  },
  6: {
    title: 'Vue 3 Learning Notes',
    excerpt: 'Notes from learning Vue 3, covering the Composition API, reactivity, and component communication through practical exercises and examples.',
    content: `
      <h2>Core Features of Vue 3</h2>
      <p>Vue 3 introduced a range of new capabilities, with the Composition API becoming one of its most visible changes.</p>

      <h2>Composition API</h2>
      <p>The Composition API offers a flexible way to group related component logic, helping larger components remain easier to understand, reuse, and maintain.</p>

      <h2>How Reactivity Works</h2>
      <p>Vue 3 uses <code>Proxy</code> instead of Vue 2’s <code>Object.defineProperty</code>, enabling more complete observation of objects and collections.</p>
    `
  },
  7: {
    title: 'Practicing CSS Grid Layouts',
    excerpt: 'Practice the fundamentals and common patterns of CSS Grid through real layouts, including responsive composition and more complex page structures.',
    content: `
      <h2>CSS Grid Fundamentals</h2>
      <p>CSS Grid is a two-dimensional layout system that can express complex page structures with concise, readable rules.</p>

      <h2>Common Properties</h2>
      <ul>
        <li><code>grid-template-columns</code></li>
        <li><code>grid-template-rows</code></li>
        <li><code>gap</code></li>
        <li><code>grid-area</code></li>
      </ul>

      <h2>Practical Exercise</h2>
      <p>Build a responsive portfolio layout to practice track sizing, named areas, alignment, and breakpoint-driven changes.</p>
    `
  },
  8: {
    title: 'Interactive Motion Design',
    excerpt: 'A practical introduction to CSS transforms: coordinate systems, translation, rotation, scaling, skewing, and motion that responds without disturbing the surrounding layout.',
    content: `
      <h2>Transforms: The Foundation of Interactive Motion</h2>
      <p>CSS <code>transform</code> is the core property for moving an element in two or three dimensions. It can translate, rotate, scale, and skew an element without changing the document flow around it.</p>
      <p>That separation makes transforms especially useful for interaction. A card can react to a pointer, a button can acknowledge a click, and an illustration can gain depth while the rest of the interface remains stable.</p>

      <h2>Coordinate Systems: x, y, and z</h2>
      <p>Every movement needs a coordinate system. In browser space, the horizontal <code>x</code> axis increases to the right and decreases to the left. The vertical <code>y</code> axis increases downward and decreases upward.</p>

      <h3>2D coordinates</h3>
      <ul>
        <li><code>x</code>: right is positive; left is negative</li>
        <li><code>y</code>: down is positive; up is negative</li>
      </ul>

      <h3>3D coordinates</h3>
      <p>When perspective is involved, the <code>z</code> axis adds depth. Positive values move an element closer to the viewer, while negative values move it farther away.</p>

      <h2>Core Transform Functions</h2>
      <ul>
        <li><code>translate(x, y)</code> moves an element along the two-dimensional plane.</li>
        <li><code>translate3d(x, y, z)</code> adds depth and can help create layered motion.</li>
        <li><code>rotate()</code> turns an element around its origin.</li>
        <li><code>scale()</code> changes visual size without recalculating layout.</li>
        <li><code>skew()</code> shears an element to introduce directional energy.</li>
      </ul>

      <pre><code>.project-card:hover {
  transform: translateY(-8px) rotate(-1deg) scale(1.015);
}</code></pre>

      <h2>Transform Origin Changes the Feeling</h2>
      <p><code>transform-origin</code> defines the point around which rotation and scaling happen. A centered origin feels balanced; an origin near an edge can make an element feel hinged, lifted, or pulled into view.</p>

      <pre><code>.cover {
  transform-origin: 20% 80%;
  transform: rotate(-4deg);
}</code></pre>

      <h2>Motion Should Clarify an Interaction</h2>
      <p>Motion works best when it explains cause and effect: an item rises because it is selectable, a panel expands because it contains more detail, and a state change settles because the action is complete.</p>
      <p>Keep the distance small, the duration intentional, and the easing natural. Prefer <code>transform</code> and <code>opacity</code> for most interface animation so the experience remains fluid even when the page is busy.</p>
    `
  }
}

export const localizeArticle = (article, isChinese) => {
  if (!article || isChinese) return article

  const translation = articleTranslations[article.id] || {}
  const hasCuratedTranslation = Object.prototype.hasOwnProperty.call(
    articleTranslations,
    article.id
  )
  const prefersCustomTranslation = article.translationOverride === true
  const localizedValue = (field) => {
    const customValue = article[`${field}En`]
    const curatedValue = translation[field]

    if (prefersCustomTranslation) {
      return customValue || curatedValue || article[field]
    }

    // Built-in articles use the maintained bilingual archive first. Older
    // localStorage snapshots may contain partial English fields that would
    // otherwise overwrite the complete translation with mixed-language copy.
    if (hasCuratedTranslation) {
      return curatedValue || customValue || article[field]
    }

    return customValue || curatedValue || article[field]
  }

  return {
    ...article,
    title: localizedValue('title'),
    excerpt: localizedValue('excerpt'),
    content: localizedValue('content'),
    category: article.categoryEn || articleCategoryTranslations[article.category] || article.category,
    readTime: article.readTimeEn || article.readTime
  }
}
