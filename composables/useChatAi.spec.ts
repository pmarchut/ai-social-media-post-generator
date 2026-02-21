import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useChatAi } from './useChatAi'
import type OpenAI from 'openai'
import type { Agent } from '../agents'

interface MockCompletion extends Pick<OpenAI.Chat.Completions.ChatCompletion, 'choices' | 'usage'> {}

const mockFetch = vi.fn()

vi.stubGlobal('fetchWithTimeout', mockFetch)

describe('useChatAi', () => {
  const agent: Agent = 'customerSupport'

  const mockResponse = {
    choices: [
      {
        message: {
          role: 'assistant',
          content: 'Hello from AI',
        },
      },
    ],
    usage: {
      prompt_tokens: 10,
      completion_tokens: 20,
      total_tokens: 30,
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sets state to loading and then complete on success', async () => {
    mockFetch.mockResolvedValue(mockResponse)

    const { chat, state } = useChatAi({ agent })

    const promise = chat({ message: 'Hi' })

    expect(state.value).toBe('loading')

    await promise

    expect(state.value).toBe('complete')
  })

  it('stores response and computes derived values correctly', async () => {
    mockFetch.mockResolvedValue(mockResponse)

    const {
      chat,
      res,
      choices,
      usage,
      firstChoice,
      firstMessage,
      hasChoices,
    } = useChatAi({ agent })

    await chat({ message: 'Hi' })

    expect(res.value).toEqual(mockResponse)
    expect(choices.value).toHaveLength(1)
    expect(hasChoices.value).toBe(1)
    expect(firstChoice.value).toEqual(mockResponse.choices[0])
    expect(firstMessage.value?.content).toBe('Hello from AI')
    expect(usage.value?.total_tokens).toBe(30)
  })

  it('sets state to error when response is invalid', async () => {
    const invalidResponse: MockCompletion = {
      choices: [],
      usage: undefined,
    }

    mockFetch.mockResolvedValue(invalidResponse)

    const { chat, state } = useChatAi({ agent })

    await chat({ message: 'Hi' })

    expect(state.value).toBe('error')
  })

  it('sets state to error when fetch throws', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    const { chat, state } = useChatAi({ agent })

    await chat({ message: 'Hi' })

    expect(state.value).toBe('error')
  })

  it('resets previous result before new request', async () => {
    mockFetch.mockResolvedValue(mockResponse)

    const { chat, res } = useChatAi({ agent })

    await chat({ message: 'First' })

    expect(res.value).toEqual(mockResponse)

    mockFetch.mockResolvedValue(mockResponse)

    const promise = chat({ message: 'Second' })

    expect(res.value).toBeUndefined()

    await promise
  })
})
