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
      const heroAtmosphere = root.querySelector('.hero-atmosphere')
      const usesCinematicHero = root.classList.contains('home-cinematic')

      if (curtain && !usesCinematicHero) {
        gsap.set(curtain, { scaleY: 1, transformOrigin: '50% 0%' })
      }

      if (!usesCinematicHero) {
        gsap.set(heroTitle, {
          autoAlpha: 0,
          yPercent: 118,
          transformOrigin: '50% 100%'
        })
        gsap.set(heroReveals, { autoAlpha: 0, y: 32 })
        gsap.set(heroVisual, { autoAlpha: 0, scale: 0.82, rotate: -8 })
      }

      const opening = gsap.timeline({
        defaults: { ease: 'expo.out' },
        onComplete: () => {
          root.classList.add('motion-ready')
          curtain?.remove()
          // 动画完成后直接移除幕布，避免主题切换或路由切换时残留成一层灰白遮罩。
          curtain?.remove()
        }
      })

      if (curtain && !usesCinematicHero) {
        opening.to(curtain, { scaleY: 0, duration: 1.05, ease: 'power4.inOut' })
      }

      if (!usesCinematicHero) {
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
      } else {
        root.classList.add('motion-ready')
        curtain?.remove()
      }

      if (heroVisual && !usesCinematicHero) {
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

      if (heroAtmosphere && !usesCinematicHero) {
        gsap.to(heroAtmosphere, {
          yPercent: -8,
          scale: 1.08,
          ease: 'none',
          scrollTrigger: {
            trigger: root.querySelector('.home-hero'),
            start: 'top top',
            end: 'bottom top',
            scrub: 1.4
          }
        })
      }

      root.querySelectorAll('.motion-section').forEach((section) => {
        const eyebrow = section.querySelector('.motion-section-eyebrow')
        const title = section.querySelector('.motion-section-title')
        const link = section.querySelector('.motion-section-link')
        const items = section.querySelectorAll('.motion-stagger-item')
        const images = section.querySelectorAll('.motion-image-reveal')

        const headingTargets = [eyebrow, title, link].filter(Boolean)

        // 标题在区块刚进入视野时作为一个整体出现；下面的内容则单独监听。
        // 这样文章列表、档案卡片和个人资料不会在区块标题出现时就提前播放完动画。
        if (headingTargets.length) {
          gsap.fromTo(headingTargets, {
            autoAlpha: 0,
            y: 30,
            filter: 'blur(9px)'
          }, {
            autoAlpha: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.78,
            stagger: 0.1,
            ease: 'power3.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: section,
              start: 'top 88%',
              once: true
            }
          })
        }

        // 参考原关于页的滚动入场方式：每个尚未出现的内容在真正进入视野时再渐显，
        // 并带一点上移与柔焦退场，避免长内容区块一次性失去节奏。
        items.forEach((item) => {
          const compactItem = item.classList.contains('ledger-row')

          gsap.fromTo(item, {
            autoAlpha: 0,
            y: compactItem ? 24 : 42,
            scale: compactItem ? 0.995 : 0.985,
            filter: compactItem ? 'blur(6px)' : 'blur(12px)'
          }, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            duration: compactItem ? 0.62 : 0.9,
            ease: 'power3.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: item,
              start: 'top 90%',
              once: true
            }
          })
        })

        images.forEach((image) => {
          gsap.fromTo(image, {
            clipPath: 'inset(4% 3% 4% 3%)',
            scale: 1.045
          }, {
            clipPath: 'inset(0% 0% 0% 0%)',
            scale: 1,
            duration: 1.05,
            ease: 'power3.inOut',
            immediateRender: false,
            scrollTrigger: {
              trigger: image,
              start: 'top 88%',
              once: true
            }
          })
        })

        const watermark = section.querySelector('.section-watermark')
        if (watermark) {
          const watermarkOpacity = watermark.classList.contains('section-watermark-light') ? 0.035 : 0.025
          gsap.fromTo(watermark, {
            opacity: 0,
            xPercent: 12,
            rotate: 4
          }, {
            opacity: watermarkOpacity,
            xPercent: 0,
            rotate: 0,
            duration: 1.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              once: true
            }
          })
          gsap.to(watermark, {
            yPercent: -18,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.1
            }
          })
        }
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
