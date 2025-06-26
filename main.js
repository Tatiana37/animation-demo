// Main application controller

import { gsap, ScrollTrigger } from "gsap"
import ScrollManager from "./ScrollManager"
import PerformanceMonitor from "./PerformanceMonitor"
import HeroSection from "./HeroSection"
import ParticlesSection from "./ParticlesSection"
import GeometrySection from "./GeometrySection"
import MorphingSection from "./MorphingSection"

class App {
  constructor() {
    this.sections = {}
    this.scrollManager = new ScrollManager()
    this.performanceMonitor = new PerformanceMonitor()
    this.isLoaded = false
    this.currentSection = "hero"

    this.init()
  }

  async init() {
    // Show loading screen
    this.showLoading()

    // Initialize GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger)

    // Initialize sections
    await this.initSections()

    // Setup scroll triggers
    this.setupScrollTriggers()

    // Setup resize handler
    this.setupResize()

    // Setup navigation
    this.setupNavigation()

    // Start animation loop
    this.animate()

    // Hide loading screen
    setTimeout(() => {
      this.hideLoading()
    }, 1000)
  }

  async initSections() {
    // Initialize each section
    const heroCanvas = document.getElementById("hero-canvas")
    const particlesCanvas = document.getElementById("particles-canvas")
    const geometryCanvas = document.getElementById("geometry-canvas")
    const morphingCanvas = document.getElementById("morphing-canvas")

    if (heroCanvas) {
      this.sections.hero = new HeroSection(heroCanvas)
    }

    if (particlesCanvas) {
      this.sections.particles = new ParticlesSection(particlesCanvas)
    }

    if (geometryCanvas) {
      this.sections.geometry = new GeometrySection(geometryCanvas)
    }

    if (morphingCanvas) {
      this.sections.morphing = new MorphingSection(morphingCanvas)
    }
  }

  setupScrollTriggers() {
    // Hero section
    ScrollTrigger.create({
      trigger: "#hero",
      start: "top top",
      end: "bottom top",
      onUpdate: (self) => {
        if (this.sections.hero) {
          this.sections.hero.update(self.progress)
        }
      },
    })

    // Particles section
    ScrollTrigger.create({
      trigger: "#particles",
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        if (this.sections.particles) {
          this.sections.particles.update(self.progress)
        }
      },
    })

    // Geometry section
    ScrollTrigger.create({
      trigger: "#geometry",
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        if (this.sections.geometry) {
          this.sections.geometry.update(self.progress)
        }
      },
    })

    // Morphing section
    ScrollTrigger.create({
      trigger: "#morphing",
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        if (this.sections.morphing) {
          this.sections.morphing.update(self.progress)
        }
      },
    })

    // Section content animations
    gsap.utils.toArray(".section-content").forEach((content, index) => {
      gsap.fromTo(
        content,
        {
          y: 100,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: content,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        },
      )
    })

    // Navigation highlight
    gsap.utils.toArray(".section").forEach((section, index) => {
      ScrollTrigger.create({
        trigger: section,
        start: "top 50%",
        end: "bottom 50%",
        onEnter: () => this.updateNavigation(section.id),
        onEnterBack: () => this.updateNavigation(section.id),
      })
    })
  }

  setupResize() {
    window.addEventListener("resize", () => {
      Object.values(this.sections).forEach((section) => {
        if (section.resize) {
          section.resize()
        }
      })

      ScrollTrigger.refresh()
    })
  }

  setupNavigation() {
    const navLinks = document.querySelectorAll(".nav-link")

    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault()
        const targetId = link.getAttribute("href").substring(1)
        const targetElement = document.getElementById(targetId)

        if (targetElement) {
          gsap.to(window, {
            duration: 1,
            scrollTo: targetElement,
            ease: "power2.inOut",
          })
        }
      })
    })
  }

  updateNavigation(sectionId) {
    this.currentSection = sectionId

    const navLinks = document.querySelectorAll(".nav-link")
    navLinks.forEach((link) => {
      link.classList.remove("active")
      if (link.getAttribute("href") === `#${sectionId}`) {
        link.classList.add("active")
      }
    })
  }

  animate() {
    requestAnimationFrame(() => this.animate())

    // Update performance monitor
    this.performanceMonitor.update()

    // Update scroll manager
    this.scrollManager.update()

    // Optimize performance based on FPS
    if (this.performanceMonitor.shouldReduceQuality()) {
      this.reduceQuality()
    }
  }

  reduceQuality() {
    // Reduce quality for better performance
    Object.values(this.sections).forEach((section) => {
      if (section.renderer) {
        section.renderer.setPixelRatio(1)
      }
    })
  }

  showLoading() {
    const loadingScreen = document.getElementById("loading")
    if (loadingScreen) {
      loadingScreen.style.opacity = "1"
      loadingScreen.style.pointerEvents = "all"
    }
  }

  hideLoading() {
    const loadingScreen = document.getElementById("loading")
    if (loadingScreen) {
      gsap.to(loadingScreen, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          loadingScreen.style.pointerEvents = "none"
          this.isLoaded = true
        },
      })
    }
  }

  // Public methods for external control
  goToSection(sectionId) {
    const targetElement = document.getElementById(sectionId)
    if (targetElement) {
      gsap.to(window, {
        duration: 1,
        scrollTo: targetElement,
        ease: "power2.inOut",
      })
    }
  }

  getCurrentSection() {
    return this.currentSection
  }

  getPerformanceStats() {
    return {
      fps: this.performanceMonitor.fps,
      averageFPS: this.performanceMonitor.getAverageFPS(),
    }
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.app = new App()
})

// Handle page visibility for performance optimization
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    // Pause animations when page is not visible
    Object.values(window.app?.sections || {}).forEach((section) => {
      if (section.renderer) {
        section.renderer.setAnimationLoop(null)
      }
    })
  } else {
    // Resume animations when page becomes visible
    Object.values(window.app?.sections || {}).forEach((section) => {
      if (section.renderer) {
        section.renderer.setAnimationLoop(() => {
          // Animation loop will be handled by main animate function
        })
      }
    })
  }
})

// Add smooth scrolling polyfill for older browsers
if (!("scrollBehavior" in document.documentElement.style)) {
  const script = document.createElement("script")
  script.src = "https://cdn.jsdelivr.net/gh/iamdustan/smoothscroll@master/src/smoothscroll.js"
  document.head.appendChild(script)
}

// Export for external use
window.ThreeJSApp = App
