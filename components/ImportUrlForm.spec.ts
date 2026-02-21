import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ImportUrlForm from './ImportUrlForm.vue'

describe('ImportUrlForm', () => {
  const mountForm = () => mount(ImportUrlForm, {
    props: {
      url: '',
      temperature: 1,
    },
  })

  it('emits submit with url and temperature', async () => {
    const wrapper = mountForm()

    const urlInput = wrapper.get('input[type="url"]')
    const rangeInput = wrapper.get('input[type="range"]')

    await urlInput.setValue('https://example.com')
    await rangeInput.setValue('0.7')

    await wrapper.get('form').trigger('submit')

    const emitted = wrapper.emitted('submit')
    expect(emitted).toBeTruthy()
    expect(emitted?.[0][0]).toEqual({
      url: 'https://example.com',
      temperature: 0.7,
    })
  })

  it('does not emit submit when url is empty', async () => {
    const wrapper = mountForm()

    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeFalsy()
  })

  it('updates temperature when slider changes', async () => {
    const wrapper = mountForm()

    const rangeInput = wrapper.get('input[type="range"]')

    await rangeInput.setValue('0.3')

    expect((rangeInput.element as HTMLInputElement).value).toBe('0.3')
  })
})
