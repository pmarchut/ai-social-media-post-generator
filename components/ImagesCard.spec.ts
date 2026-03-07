import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import ImagesCard from './ImagesCard.vue'
import SocialCard from './SocialCard.vue'

const ImageCanvasStub = {
  name: 'ImageCanvas',
  template: '<div data-testid="image-canvas-stub"></div>',
  props: ['gradient', 'bgImage', 'title']
}

describe('ImagesCard', () => {
  it('renders ImageCanvas for each gradient', () => {
    const gradients = [
      { from: '#000000', to: '#ffffff' },
      { from: '#111111', to: '#eeeeee' },
    ]

    const wrapper = mount(ImagesCard, {
      props: { gradients },
      global: {
        stubs: {
          ImageCanvas: ImageCanvasStub,
          SocialCard: false,
        },
      },
    })

    const canvases = wrapper.findAll('[data-testid="image-canvas-stub"]')

    expect(canvases).toHaveLength(2)
  })

  it('passes props to ImageCanvas', () => {
    const gradients = [{ from: '#000000', to: '#ffffff' }]

    const wrapper = mount(ImagesCard, {
      props: {
        gradients,
        bgImage: 'test-image.png',
        title: 'Test title',
      },
      global: {
        stubs: {
          ImageCanvas: ImageCanvasStub,
          SocialCard: false,
        },
      },
    })

    const canvas = wrapper.getComponent(ImageCanvasStub)

    expect(canvas.props()).toMatchObject({
      gradient: gradients[0],
      bgImage: 'test-image.png',
      title: 'Test title',
    })
  })

  it('passes correct props to SocialCard', () => {
    const wrapper = mount(ImagesCard, {
      props: {
        gradients: [],
        isLoading: true,
      },
      global: {
        stubs: {
          ImageCanvas: ImageCanvasStub,
        },
      },
    })

    const socialCard = wrapper.getComponent(SocialCard)

    expect(socialCard.props('isEmpty')).toBe(true)
    expect(socialCard.props('isLoading')).toBe(true)
  })

  it('renders helper text below each image', () => {
    const gradients = [{ from: '#000000', to: '#ffffff' }]

    const wrapper = mount(ImagesCard, {
      props: { gradients },
      global: {
        stubs: {
          ImageCanvas: ImageCanvasStub,
        },
      },
    })

    expect(wrapper.text()).toContain('right click image to save')
  })
})
