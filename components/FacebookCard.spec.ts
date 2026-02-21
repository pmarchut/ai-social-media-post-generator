import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import FacebookCard from './FacebookCard.vue'

describe('FacebookCard', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  function mountComponent(props = {}) {
    return mount(FacebookCard, {
      props: {
        initialPost: '',
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

  it('initializes postText from initialPost prop', () => {
    const wrapper = mountComponent({ initialPost: 'Hello Facebook' })

    const textarea = wrapper.find('textarea')
    expect((textarea.element as HTMLTextAreaElement).value)
      .toBe('Hello Facebook')
  })

  it('updates postText when initialPost prop changes', async () => {
    const wrapper = mountComponent({ initialPost: 'First' })

    await wrapper.setProps({ initialPost: 'Updated post' })

    const textarea = wrapper.find('textarea')
    expect((textarea.element as HTMLTextAreaElement).value)
      .toBe('Updated post')
  })

  it('computes correct character count', async () => {
    const wrapper = mountComponent()

    const textarea = wrapper.find('textarea')
    await textarea.setValue('Hello')

    expect(wrapper.text()).toContain('Character Count:')
    expect(wrapper.text()).toContain('5')
  })

  it('disables Copy button when postText is empty', () => {
    const wrapper = mountComponent()

    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('enables Copy button when postText is not empty', async () => {
    const wrapper = mountComponent()

    const textarea = wrapper.find('textarea')
    await textarea.setValue('Some content')

    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeUndefined()
  })

  it('copies text to clipboard when Copy button is clicked', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined)

    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    })

    const wrapper = mountComponent()

    const textarea = wrapper.find('textarea')
    await textarea.setValue('Copy me')

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(writeTextMock).toHaveBeenCalledWith('Copy me')
  })

  it('does not call clipboard when postText is empty', async () => {
    const writeTextMock = vi.fn()

    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    })

    const wrapper = mountComponent()

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(writeTextMock).not.toHaveBeenCalled()
  })

  it('handles clipboard error without throwing', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('fail')),
      },
    })

    const wrapper = mountComponent({ initialPost: 'Test' })

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(consoleSpy).toHaveBeenCalled()
  })
})
