import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ImageCanvas from './ImageCanvas.vue'
import { toPng } from 'html-to-image'

// --- mock html-to-image ---
vi.mock('html-to-image', () => ({
  toPng: vi.fn(() => Promise.resolve('data:image/png;base64,mock-image')),
}))

describe('ImageCanvas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('computes gradient background style', () => {
    const wrapper = mount(ImageCanvas, {
      props: {
        gradient: { from: '#000000', to: '#ffffff' }
      }
    })

    const vm = wrapper.vm as any

    expect(vm.bgStyle).toEqual({
      background: 'linear-gradient(to right, #000000, #ffffff)'
    })
  })

  it('renders image when bgImage is provided', () => {
    const wrapper = mount(ImageCanvas, {
      props: {
        bgImage: 'mock-image-url',
        title: 'Test title',
      },
    })

    const img = wrapper.find('img')

    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('mock-image-url')
  })

  it('renders placeholder when bgImage is missing', () => {
    const wrapper = mount(ImageCanvas)

    expect(wrapper.text()).toContain('Social Image Placeholder')
  })

  it('calls toPng on mounted', async () => {
    mount(ImageCanvas)

    await flushPromises()

    expect(toPng).toHaveBeenCalled()
  })

  it('renders generated image after toPng resolves', async () => {
    const wrapper = mount(ImageCanvas)

    await flushPromises()

    const generatedImage = wrapper.findAll('img')[0]

    expect(generatedImage.attributes('src')).toContain('data:image/png;base64')
  })
})
