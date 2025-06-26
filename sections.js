// Import necessary modules
import * as THREE from "three"
import { Utils } from "./utils" // Assuming Utils is imported from a utils file

// Individual section animations

class HeroSection {
  constructor(canvas) {
    this.canvas = canvas
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    this.clock = new THREE.Clock()

    this.init()
  }

  init() {
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Create floating spheres
    this.spheres = []
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32)

    for (let i = 0; i < 50; i++) {
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5),
        transparent: true,
        opacity: 0.6,
      })

      const sphere = new THREE.Mesh(sphereGeometry, material)
      sphere.position.set(Utils.random(-20, 20), Utils.random(-10, 10), Utils.random(-20, 20))

      sphere.userData = {
        originalPosition: sphere.position.clone(),
        speed: Utils.random(0.5, 2),
        amplitude: Utils.random(1, 3),
      }

      this.spheres.push(sphere)
      this.scene.add(sphere)
    }

    this.camera.position.z = 15
  }

  update(scrollProgress) {
    const time = this.clock.getElapsedTime()

    this.spheres.forEach((sphere, index) => {
      const userData = sphere.userData
      sphere.position.y = userData.originalPosition.y + Math.sin(time * userData.speed + index) * userData.amplitude
      sphere.rotation.x = time * 0.5
      sphere.rotation.y = time * 0.3

      // Scroll-based movement
      sphere.position.z = userData.originalPosition.z - scrollProgress * 10
    })

    // Camera movement based on scroll
    this.camera.position.y = -scrollProgress * 5
    this.camera.rotation.x = scrollProgress * 0.1

    this.renderer.render(this.scene, this.camera)
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }
}

class ParticlesSection {
  constructor(canvas) {
    this.canvas = canvas
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    this.clock = new THREE.Clock()

    this.init()
  }

  init() {
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Create particle system
    const particleCount = 5000
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3

      positions[i3] = Utils.random(-50, 50)
      positions[i3 + 1] = Utils.random(-50, 50)
      positions[i3 + 2] = Utils.random(-50, 50)

      const color = new THREE.Color().setHSL(Math.random(), 0.8, 0.6)
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b

      sizes[i] = Utils.random(1, 3)
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1))

    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                uniform float time;
                uniform float pixelRatio;
                
                void main() {
                    vColor = color;
                    vec3 pos = position;
                    pos.y += sin(time + position.x * 0.1) * 2.0;
                    pos.x += cos(time + position.z * 0.1) * 1.0;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    gl_PointSize = size * pixelRatio * (300.0 / -mvPosition.z);
                }
            `,
      fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
                    float strength = 0.05 / distanceToCenter - 0.1;
                    gl_FragColor = vec4(vColor, strength);
                }
            `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
    })

    this.particles = new THREE.Points(geometry, material)
    this.scene.add(this.particles)

    this.camera.position.z = 30
  }

  update(scrollProgress) {
    const time = this.clock.getElapsedTime()

    this.particles.material.uniforms.time.value = time
    this.particles.rotation.y = time * 0.1

    // Scroll-based effects
    this.particles.rotation.x = scrollProgress * Math.PI * 2
    this.camera.position.z = 30 - scrollProgress * 20

    this.renderer.render(this.scene, this.camera)
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }
}

class GeometrySection {
  constructor(canvas) {
    this.canvas = canvas
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    this.clock = new THREE.Clock()

    this.init()
  }

  init() {
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Create complex geometry
    this.geometries = []

    // Torus Knot
    const torusKnotGeometry = new THREE.TorusKnotGeometry(3, 1, 100, 16)
    const torusKnotMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    })
    const torusKnot = new THREE.Mesh(torusKnotGeometry, torusKnotMaterial)
    torusKnot.position.x = -8
    this.geometries.push(torusKnot)
    this.scene.add(torusKnot)

    // Icosahedron
    const icosahedronGeometry = new THREE.IcosahedronGeometry(3, 1)
    const icosahedronMaterial = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    })
    const icosahedron = new THREE.Mesh(icosahedronGeometry, icosahedronMaterial)
    icosahedron.position.x = 0
    this.geometries.push(icosahedron)
    this.scene.add(icosahedron)

    // Dodecahedron
    const dodecahedronGeometry = new THREE.DodecahedronGeometry(3)
    const dodecahedronMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    })
    const dodecahedron = new THREE.Mesh(dodecahedronGeometry, dodecahedronMaterial)
    dodecahedron.position.x = 8
    this.geometries.push(dodecahedron)
    this.scene.add(dodecahedron)

    this.camera.position.z = 15
  }

  update(scrollProgress) {
    const time = this.clock.getElapsedTime()

    this.geometries.forEach((geometry, index) => {
      geometry.rotation.x = time * (0.5 + index * 0.1)
      geometry.rotation.y = time * (0.3 + index * 0.1)
      geometry.rotation.z = time * (0.2 + index * 0.1)

      // Scroll-based movement
      geometry.position.y = Math.sin(scrollProgress * Math.PI + index) * 3
      geometry.scale.setScalar(1 + scrollProgress * 0.5)
    })

    this.camera.position.x = Math.sin(scrollProgress * Math.PI) * 5

    this.renderer.render(this.scene, this.camera)
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }
}

class MorphingSection {
  constructor(canvas) {
    this.canvas = canvas
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    this.clock = new THREE.Clock()

    this.init()
  }

  init() {
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Create morphing geometry
    const geometry1 = new THREE.SphereGeometry(3, 32, 32)
    const geometry2 = new THREE.BoxGeometry(4, 4, 4)

    // Create morph targets
    const positionAttribute1 = geometry1.attributes.position
    const positionAttribute2 = geometry2.attributes.position

    // Ensure both geometries have the same number of vertices
    const maxVertices = Math.max(positionAttribute1.count, positionAttribute2.count)

    const morphGeometry = new THREE.SphereGeometry(3, 32, 32)
    morphGeometry.morphAttributes.position = []

    const targetPositions = new Float32Array(morphGeometry.attributes.position.count * 3)
    for (let i = 0; i < morphGeometry.attributes.position.count; i++) {
      const i3 = i * 3
      if (i < positionAttribute2.count) {
        targetPositions[i3] = positionAttribute2.getX(i)
        targetPositions[i3 + 1] = positionAttribute2.getY(i)
        targetPositions[i3 + 2] = positionAttribute2.getZ(i)
      } else {
        targetPositions[i3] = positionAttribute1.getX(i)
        targetPositions[i3 + 1] = positionAttribute1.getY(i)
        targetPositions[i3 + 2] = positionAttribute1.getZ(i)
      }
    }

    morphGeometry.morphAttributes.position[0] = new THREE.BufferAttribute(targetPositions, 3)

    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      wireframe: true,
      transparent: true,
      opacity: 0.9,
    })

    this.morphMesh = new THREE.Mesh(morphGeometry, material)
    this.scene.add(this.morphMesh)

    this.camera.position.z = 10
  }

  update(scrollProgress) {
    const time = this.clock.getElapsedTime()

    // Animate morph targets
    const morphProgress = (Math.sin(time * 0.5) + 1) * 0.5
    this.morphMesh.morphTargetInfluences[0] = morphProgress

    // Rotation
    this.morphMesh.rotation.x = time * 0.3
    this.morphMesh.rotation.y = time * 0.5

    // Scroll-based effects
    this.morphMesh.scale.setScalar(1 + scrollProgress * 0.5)
    this.camera.position.y = scrollProgress * 5

    this.renderer.render(this.scene, this.camera)
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }
}
