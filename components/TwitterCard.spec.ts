import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TwitterCard from './TwitterCard.vue'

describe('TwitterCard', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  function mountComponent(props = {}) {
    return mount(TwitterCard, {
      props: {
        initialTweet: '',
        isLoading: false,
        ...props,
      },
      global: {
        stubs: {
          SocialCard: {
            template: '<div><slot /></div>',
            props: ['title', 'isLoading', 'isEmpty'],
          },
          AutoResizeTextarea: {
            props: ['modelValue'],
            emits: ['update:modelValue'],
            template: `
              <textarea
                :value="modelValue"
                @input="$emit('update:modelValue', $event.target.value)"
              />
            `,
          },
        },
      },
    })
  }

  it('initializes tweet from initialTweet prop', () => {
    const wrapper = mountComponent({ initialTweet: 'Hello' })

    const textarea = wrapper.find('textarea')
    expect((textarea.element as HTMLTextAreaElement).value).toBe('Hello')
  })

  it('updates tweet when initialTweet prop changes', async () => {
    const wrapper = mountComponent({ initialTweet: 'First' })

    await wrapper.setProps({ initialTweet: 'Updated' })

    const textarea = wrapper.find('textarea')
    expect((textarea.element as HTMLTextAreaElement).value).toBe('Updated')
  })

  it('computes correct character count', async () => {
    const wrapper = mountComponent()

    const textarea = wrapper.find('textarea')
    await textarea.setValue('Hello')

    expect(wrapper.text()).toContain('Character Count:')
    expect(wrapper.text()).toContain('5')
  })

  it('disables POST button when tweet is empty', () => {
    const wrapper = mountComponent()

    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('enables POST button when tweet is not empty', async () => {
    const wrapper = mountComponent()

    const textarea = wrapper.find('textarea')
    await textarea.setValue('Hello')

    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeUndefined()
  })

  it('calls window.open with correct encoded URL when posting', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    const wrapper = mountComponent()

    const textarea = wrapper.find('textarea')
    await textarea.setValue('Hello World')

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(openSpy).toHaveBeenCalledWith(
      'https://twitter.com/intent/tweet?text=Hello%20World',
      '_blank'
    )
  })

  it('does not call window.open if tweet is only whitespace', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    const wrapper = mountComponent()

    const textarea = wrapper.find('textarea')
    await textarea.setValue('   ')

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(openSpy).not.toHaveBeenCalled()
  })
})
