// Utility functions for Three.js animations
import * as THREE from "three"

class Utils {
  static lerp(start, end, factor) {
    return start + (end - start) * factor
  }

  static map(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
  }

  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max)
  }

  static random(min, max) {
    return Math.random() * (max - min) + min
  }

  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  static getViewportSizes() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      aspect: window.innerWidth / window.innerHeight,
    }
  }

  static createNoise() {
    // Simple noise function for animations
    return (x, y, z = 0) => Math.sin(x * 0.1) * Math.cos(y * 0.1) * Math.sin(z * 0.1)
  }

  static easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
  }

  static easeOutElastic(t) {
    const c4 = (2 * Math.PI) / 3
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
  }

  static createShaderMaterial(vertexShader, fragmentShader, uniforms = {}) {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2() },
        ...uniforms,
      },
    })
  }

  static disposeObject(obj) {
    if (obj.geometry) obj.geometry.dispose()
    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach((material) => {
          if (material.map) material.map.dispose()
          if (material.normalMap) material.normalMap.dispose()
          if (material.roughnessMap) material.roughnessMap.dispose()
          material.dispose()
        })
      } else {
        if (obj.material.map) obj.material.map.dispose()
        if (obj.material.normalMap) obj.material.normalMap.dispose()
        if (obj.material.roughnessMap) obj.material.roughnessMap.dispose()
        obj.material.dispose()
      }
    }
  }
}

// Performance monitor
class PerformanceMonitor {
  constructor() {
    this.fps = 0
    this.frameCount = 0
    this.lastTime = performance.now()
    this.fpsHistory = []
    this.maxHistory = 60
  }

  update() {
    this.frameCount++
    const currentTime = performance.now()

    if (currentTime - this.lastTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime))
      this.fpsHistory.push(this.fps)

      if (this.fpsHistory.length > this.maxHistory) {
        this.fpsHistory.shift()
      }

      this.frameCount = 0
      this.lastTime = currentTime
    }
  }

  getAverageFPS() {
    if (this.fpsHistory.length === 0) return 60
    return this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length
  }

  shouldReduceQuality() {
    return this.getAverageFPS() < 30
  }
}

// Scroll manager
class ScrollManager {
  constructor() {
    this.scrollY = 0
    this.targetScrollY = 0
    this.ease = 0.1
    this.callbacks = []

    this.init()
  }

  init() {
    window.addEventListener("scroll", () => {
      this.targetScrollY = window.pageYOffset
    })
  }

  update() {
    this.scrollY = Utils.lerp(this.scrollY, this.targetScrollY, this.ease)

    this.callbacks.forEach((callback) => {
      callback(this.scrollY, this.targetScrollY)
    })
  }

  onScroll(callback) {
    this.callbacks.push(callback)
  }

  getProgress(element) {
    const rect = element.getBoundingClientRect()
    const elementTop = rect.top + this.scrollY
    const elementHeight = rect.height
    const windowHeight = window.innerHeight

    const start = elementTop - windowHeight
    const end = elementTop + elementHeight

    return Utils.clamp((this.scrollY - start) / (end - start), 0, 1)
  }
}
