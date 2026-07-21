import { nextTick, onMounted, onUnmounted } from 'vue'

const prefersReducedMotion = () =>
  typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function useHomeMotion(rootRef) {
  let context = null
  let gsapInstance = null
  let scrollTriggerPlugin = null
  let themeObserver = null

  const destroyMotion = (root) => {
    context?.revert()
    context = null

    // ScrollTrigger 是全局注册的，只清理由首页创建的触发器。
    scrollTriggerPlugin?.getAll().forEach((trigger) => {
      if (root && trigger.trigger && root.contains(trigger.trigger)) {
        trigger.kill()
      }
    })

    gsapInstance = null
    scrollTriggerPlugin = null
  }

  const revealWithoutMotion = (root) => {
    if (!root) return

    root.classList.remove('motion-scroll-pending')
    root.classList.add('motion-ready', 'motion-scroll-ready')
    root.querySelector('.home-opening-curtain')?.remove()
    // 开场遮罩在主题切换中断动画时可能残留在根节点之外，必须一并清理。
    document.querySelectorAll('.home-opening-curtain').forEach((curtain) => curtain.remove())

    root.querySelectorAll('.hero-title-inner, [data-hero-reveal], .hero-visual').forEach((element) => {
      element.style.setProperty('opacity', '1', 'important')
      element.style.setProperty('visibility', 'visible', 'important')
      element.style.setProperty('transform', 'none', 'important')
    })
    root.querySelectorAll('.module-enter').forEach((element) => {
      element.classList.add('module-entered')
    })
  }

  const isLightMode = () =>
    typeof document !== 'undefined' && !document.body.classList.contains('dark-mode')

  const init = async () => {
    const root = rootRef.value
    if (!root) return

    // 阳光模式不使用开场幕布：它在路由/主题切换的极短瞬间会显成灰白遮罩。
    if (isLightMode()) {
      revealWithoutMotion(root)
      return
    }

    if (prefersReducedMotion()) {
      revealWithoutMotion(root)
      return
    }

    const [{ gsap }, { ScrollTrigger }] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger')
    ])
    if (rootRef.value !== root) return
    if (isLightMode()) {
      revealWithoutMotion(root)
      return
    }

    gsap.registerPlugin(ScrollTrigger)
    gsapInstance = gsap
    scrollTriggerPlugin = ScrollTrigger

    context = gsap.context(() => {
      const curtain = root.querySelector('.home-opening-curtain')
      const heroTitle = root.querySelector('.hero-title-inner')
      const heroReveals = root.querySelectorAll('[data-hero-reveal]')
      const heroVisual = root.querySelector('.hero-visual')

      if (curtain) {
        gsap.set(curtain, { scaleY: 1, transformOrigin: '50% 0%' })
      }
      gsap.set(heroTitle, {
        autoAlpha: 0,
        yPercent: 118,
        transformOrigin: '50% 100%'
      })
      gsap.set(heroReveals, { autoAlpha: 0, y: 32 })
      gsap.set(heroVisual, { autoAlpha: 0, scale: 0.82, rotate: -8 })

      const opening = gsap.timeline({
        defaults: { ease: 'expo.out' },
        onComplete: () => {
          root.classList.add('motion-ready')
          curtain?.remove()
          // 动画完成后直接移除幕布，避免主题切换或路由切换时残留成一层灰白遮罩。
          curtain?.remove()
        }
      })

      if (curtain) {
        opening.to(curtain, { scaleY: 0, duration: 1.05, ease: 'power4.inOut' })
      }

      opening
        .to(heroTitle, {
          autoAlpha: 1,
          yPercent: 0,
          duration: 1.35,
          ease: 'power4.out'
        }, curtain ? '-=0.62' : 0)
        .to(heroReveals, {
          autoAlpha: 1,
          y: 0,
          duration: 0.92,
          stagger: 0.1
        }, '-=1.02')
        .to(heroVisual, {
          autoAlpha: 1,
          scale: 1,
          rotate: 0,
          duration: 1.5,
          ease: 'expo.out'
        }, '-=1.14')

      if (heroVisual) {
        gsap.to(heroVisual, {
          yPercent: 14,
          rotate: 4,
          ease: 'none',
          scrollTrigger: {
            trigger: root.querySelector('.home-hero'),
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2
          }
        })
      }

      root.querySelectorAll('.motion-section').forEach((section) => {
        const eyebrow = section.querySelector('.motion-section-eyebrow')
        const title = section.querySelector('.motion-section-title')
        const link = section.querySelector('.motion-section-link')
        const items = section.querySelectorAll('.motion-stagger-item')
        const images = section.querySelectorAll('.motion-image-reveal')

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top 88%',
            once: true
          }
        })

        timeline
          .fromTo([eyebrow, title, link].filter(Boolean), {
            autoAlpha: 0.82,
            y: 24
          }, {
            autoAlpha: 1,
            y: 0,
            duration: 0.72,
            stagger: 0.1,
            ease: 'power3.out',
            immediateRender: false
          })
          .fromTo(items, {
            autoAlpha: 0.88,
            y: 30,
            scale: 0.99
          }, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.76,
            stagger: 0.09,
            ease: 'power3.out',
            immediateRender: false
          }, '-=0.42')
          .fromTo(images, {
            clipPath: 'inset(2% 2% 2% 2%)',
            scale: 1.025
          }, {
            clipPath: 'inset(0% 0% 0% 0%)',
            scale: 1,
            duration: 0.9,
            stagger: 0.08,
            ease: 'power3.inOut',
            immediateRender: false
          }, '-=0.72')
      })

      root.classList.remove('motion-scroll-pending')
      root.classList.add('motion-scroll-ready')
      ScrollTrigger.refresh()
    }, root)
  }

  const revealForLightMode = () => {
    const root = rootRef.value
    if (!root || !isLightMode()) return

    destroyMotion(root)
    revealWithoutMotion(root)
  }

  onMounted(async () => {
    await nextTick()

    // 首页若在暗色状态挂载后再切到阳光模式，GSAP 的内联样式不会自动还原。
    // 监听主题类名，立即移除遮罩并恢复全部内容，避免页面被灰白层盖住。
    if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
      themeObserver = new MutationObserver(() => {
        revealForLightMode()
      })
      themeObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
      })
    }

    init().catch(() => {
      if (rootRef.value) revealWithoutMotion(rootRef.value)
    })
  })

  onUnmounted(() => {
    themeObserver?.disconnect()
    themeObserver = null
    destroyMotion(rootRef.value)
  })
}
