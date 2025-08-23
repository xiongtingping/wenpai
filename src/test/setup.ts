import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-url')
global.URL.revokeObjectURL = vi.fn()

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    write: vi.fn(),
    writeText: vi.fn(),
    read: vi.fn(),
    readText: vi.fn(),
  },
})

// Mock HTMLCanvasElement
class MockCanvasRenderingContext2D {
  fillStyle: string = '#000000'
  font: string = '16px sans-serif'
  textAlign: string = 'start'
  textBaseline: string = 'alphabetic'
  globalAlpha: number = 1

  fillRect = vi.fn()
  fillText = vi.fn()
  measureText = vi.fn((text: string) => ({ width: text.length * 8 }))
  scale = vi.fn()
  clearRect = vi.fn()
  drawImage = vi.fn()
  beginPath = vi.fn()
  arc = vi.fn()
  fill = vi.fn()
  stroke = vi.fn()
  moveTo = vi.fn()
  lineTo = vi.fn()
  closePath = vi.fn()
  save = vi.fn()
  restore = vi.fn()
  translate = vi.fn()
  rotate = vi.fn()
}

class MockHTMLCanvasElement {
  width: number = 800
  height: number = 600
  private context = new MockCanvasRenderingContext2D()

  getContext(type: string) {
    if (type === '2d') {
      return this.context
    }
    return null
  }

  toDataURL = vi.fn((type?: string, quality?: number) => {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
  })

  toBlob = vi.fn((callback: (blob: Blob | null) => void) => {
    const blob = new Blob(['mock canvas data'], { type: 'image/png' })
    setTimeout(() => callback(blob), 0)
  })
}

// Mock createElement for canvas
const originalCreateElement = document.createElement
document.createElement = vi.fn((tagName: string) => {
  if (tagName === 'canvas') {
    return new MockHTMLCanvasElement() as any
  }
  return originalCreateElement.call(document, tagName)
})

// Mock File API
global.File = class MockFile {
  constructor(bits: any, name: string, options?: any) {
    this.name = name
    this.size = bits.length
    this.type = options?.type || ''
  }
  name: string
  size: number
  type: string
}

global.FileReader = class MockFileReader {
  result: any = null
  error: any = null
  readyState: number = 0
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null
  onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null
  
  readAsText(file: File) {
    setTimeout(() => {
      this.result = 'mock file content'
      this.readyState = 2
      if (this.onload) {
        this.onload({} as any)
      }
    }, 0)
  }
  
  readAsDataURL(file: File) {
    setTimeout(() => {
      this.result = 'data:text/plain;base64,bW9jayBmaWxlIGNvbnRlbnQ='
      this.readyState = 2
      if (this.onload) {
        this.onload({} as any)
      }
    }, 0)
  }
}