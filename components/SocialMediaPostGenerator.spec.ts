import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import SocialMediaPostGenerator from './SocialMediaPostGenerator.vue'

// --- MOCK useChatAi ---
const twitterChatMock = vi.fn()
const facebookChatMock = vi.fn()
const fetchMock = vi.fn()

const twitterFirstMessage = ref<any>(undefined)
const facebookFirstMessage = ref<any>(undefined)

vi.mock('../composables/useChatAi', () => ({
  useChatAi: vi.fn(({ agent }) => {
    const isTwitter = agent === 'twitter'

    return {
      chat: isTwitter ? twitterChatMock : facebookChatMock,
      firstMessage: isTwitter ? twitterFirstMessage : facebookFirstMessage,
    }
  }),
}))

describe('SocialMediaPostGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    fetchMock.mockImplementation((url: string) => {
      if (url === '/api/image') {
        return Promise.resolve('mock-image-url')
      }

      if (url === '/api/scrape') {
        return Promise.resolve({ title: 'Mock scraped title' })
      }

      return Promise.resolve({})
    })

    // mock global $fetch
    globalThis.$fetch = fetchMock as any
  })

  function mountComponent() {
    return mount(SocialMediaPostGenerator, {
      global: {
        stubs: {
          ImportUrlForm: {
            name: 'ImportUrlForm',
            template: `<div />`,
            props: ['url', 'temperature'],
            emits: ['submit'],
          },
          TwitterCard: {
            name: 'TwitterCard',
            template: `<div />`,
            props: ['initialTweet', 'isLoading'],
          },
          FacebookCard: {
            name: 'FacebookCard',
            template: `<div />`,
            props: ['initialPost', 'isLoading'],
          },
          ImagesCard: {
            name: 'ImagesCard',
            template: `<div />`,
            props: ['gradients', 'bgImage', 'title', 'isLoading'],
          },
        },
      },
    })
  }

  it('calls both AI chats on form submit', async () => {
    twitterChatMock.mockResolvedValue({
      choices: [{ message: { content: 'Tweet text' } }],
    })

    facebookChatMock.mockResolvedValue({
      choices: [{ message: { content: 'Facebook text' } }],
    })

    const wrapper = mountComponent()

    await wrapper.findComponent({ name: 'ImportUrlForm' }).vm.$emit('submit', {
      url: 'https://example.com',
      temperature: 0.7,
    })

    await flushPromises()

    expect(twitterChatMock).toHaveBeenCalledWith({
      url: 'https://example.com',
      temperature: 0.7,
    })

    expect(facebookChatMock).toHaveBeenCalledWith({
      url: 'https://example.com',
      temperature: 0.7,
    })
  })

  it('sets generated content on successful responses', async () => {
    twitterChatMock.mockResolvedValue({
      choices: [{ message: { content: 'Generated Tweet' } }],
    })

    facebookChatMock.mockResolvedValue({
      choices: [{ message: { content: 'Generated Facebook' } }],
    })

    const wrapper = mountComponent()

    await wrapper.findComponent({ name: 'ImportUrlForm' }).vm.$emit('submit', {
      url: 'https://example.com',
      temperature: 0.5,
    })

    await flushPromises()

    const twitterCard = wrapper.findComponent({ name: 'TwitterCard' })
    const facebookCard = wrapper.findComponent({ name: 'FacebookCard' })

    expect(twitterCard.props('initialTweet')).toBe('Generated Tweet')
    expect(facebookCard.props('initialPost')).toBe('Generated Facebook')
  })

  it('uses fallback firstMessage when promise is rejected', async () => {
    twitterChatMock.mockRejectedValue(new Error('fail'))
    facebookChatMock.mockRejectedValue(new Error('fail'))

    twitterFirstMessage.value = { content: 'Fallback Tweet' }
    facebookFirstMessage.value = { content: 'Fallback Facebook' }

    const wrapper = mountComponent()

    await wrapper.findComponent({ name: 'ImportUrlForm' }).vm.$emit('submit', {
        url: 'https://example.com',
        temperature: 0.5,
    })

    await flushPromises()

    const twitterCard = wrapper.findComponent({ name: 'TwitterCard' })
    const facebookCard = wrapper.findComponent({ name: 'FacebookCard' })

    expect(twitterCard.props('initialTweet')).toBe('Fallback Tweet')
    expect(facebookCard.props('initialPost')).toBe('Fallback Facebook')
 })


  it('sets loading state during generation and clears after', async () => {
    let resolveTwitter: any
    let resolveFacebook: any

    twitterChatMock.mockReturnValue(
      new Promise((resolve) => (resolveTwitter = resolve))
    )

    facebookChatMock.mockReturnValue(
      new Promise((resolve) => (resolveFacebook = resolve))
    )

    const wrapper = mountComponent()

    await wrapper.findComponent({ name: 'ImportUrlForm' }).vm.$emit('submit', {
      url: 'https://example.com',
      temperature: 0.5,
    })

    const twitterCard = wrapper.findComponent({ name: 'TwitterCard' })
    const facebookCard = wrapper.findComponent({ name: 'FacebookCard' })

    expect(twitterCard.props('isLoading')).toBe(true)
    expect(facebookCard.props('isLoading')).toBe(true)

    resolveTwitter({ choices: [{ message: { content: 'T' } }] })
    resolveFacebook({ choices: [{ message: { content: 'F' } }] })

    await flushPromises()

    expect(twitterCard.props('isLoading')).toBe(false)
    expect(facebookCard.props('isLoading')).toBe(false)
  })

  it('sets generated image and title from API', async () => {
    twitterChatMock.mockResolvedValue({
      choices: [{ message: { content: 'Tweet' } }],
    })

    facebookChatMock.mockResolvedValue({
      choices: [{ message: { content: 'Facebook' } }],
    })

    const wrapper = mountComponent()

    await wrapper.findComponent({ name: 'ImportUrlForm' }).vm.$emit('submit', {
      url: 'https://example.com',
      temperature: 0.5,
    })

    await flushPromises()

    const imagesCard = wrapper.findComponent({ name: 'ImagesCard' })

    expect(imagesCard.props('bgImage')).toBe('mock-image-url')
    expect(imagesCard.props('title')).toBe('Mock scraped title')
  })
})
