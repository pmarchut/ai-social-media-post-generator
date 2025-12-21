import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ChatBox from './ChatBox.vue'
import type { User, Message } from '~~/types'

vi.mock('nanoid', () => ({
  nanoid: () => 'test-id'
}))

const me: User = {
  id: 'me',
  name: 'Me',
  avatar: "/avatar.jpg"
}

const userA: User = {
  id: 'u1',
  name: 'Alice',
  avatar: "/avatar.jpg"
}

const userB: User = {
  id: 'u2',
  name: 'Bob',
  avatar: "/avatar.jpg"
}

const userC: User = {
  id: 'u3',
  name: 'Charlie',
  avatar: "/avatar.jpg"
}

function factory(props?: Partial<InstanceType<typeof ChatBox>['$props']>) {
  return mount(ChatBox, {
    props: {
      messages: [],
      users: [me, userA, userB, userC],
      me,
      usersTyping: [],
      ...props
    },
    global: {
      stubs: {
        ChatBubble: {
          template: '<div class="chat-bubble"><slot /></div>',
          props: ['user', 'message', 'isMine']
        },
        IconChat: true,
        AppLoading: true
      }
    }
  })
}

describe('ChatBox.vue', () => {
  describe('initial state', () => {
    it('renders closed chat by default', () => {
      const wrapper = factory()

      expect(wrapper.find('.box').exists()).toBe(false)
      expect(wrapper.find('button').exists()).toBe(true)
    })
  })

  describe('open / close behavior', () => {
    it('opens chat after clicking chat button', async () => {
      const wrapper = factory()

      await wrapper.find('button').trigger('click')

      expect(wrapper.find('.box').exists()).toBe(true)
    })

    it('closes chat after clicking close button', async () => {
      const wrapper = factory()

      await wrapper.find('button').trigger('click')
      await wrapper.find('header button').trigger('click')

      expect(wrapper.find('.box').exists()).toBe(false)
    })
  })

  describe('usersTyping computed logic', () => {
    it('returns empty text when no users typing', () => {
      const wrapper = factory({ usersTyping: [] })

      expect(wrapper.text()).not.toContain('typing')
    })

    it('shows single user typing text', async () => {
      const wrapper = factory({ usersTyping: [userA] })

      await wrapper.find('button').trigger('click')

      expect(wrapper.text()).toContain('User Alice is typing...')
    })

    it('shows two users typing text', async () => {
      const wrapper = factory({ usersTyping: [userA, userB] })

      await wrapper.find('button').trigger('click')

      expect(wrapper.text()).toContain('Alice and Bob are typing...')
    })

    it('shows multiple users typing text', async () => {
      const wrapper = factory({ usersTyping: [userA, userB, userC] })

      await wrapper.find('button').trigger('click')

      expect(wrapper.text()).toContain('3 people are typing...')
    })

    it('deduplicates usersTyping by id', async () => {
      const wrapper = factory({
        usersTyping: [userA, userA, userB]
      })

      await wrapper.find('button').trigger('click')

      expect(wrapper.text()).toContain('Alice and Bob are typing...')
    })
  })

  describe('sending messages', () => {
    it('emits newMessage on enter key', async () => {
      const wrapper = factory()

      await wrapper.find('button').trigger('click')

      const input = wrapper.find('input')
      await input.setValue('Hello world')
      await input.trigger('keypress.enter')

      const emitted = wrapper.emitted('newMessage')!
      const [message] = emitted[0] as [Message]

      expect(emitted).toHaveLength(1)
      expect(message).toMatchObject({
        id: 'test-id',
        userId: me.id,
        text: 'Hello world'
      })
      expect(message.createdAt).toBeInstanceOf(Date)
    })

    it('clears input after sending message', async () => {
      const wrapper = factory()

      await wrapper.find('button').trigger('click')

      const input = wrapper.find('input')
      await input.setValue('Test message')
      await input.trigger('keypress.enter')

      expect((input.element as HTMLInputElement).value).toBe('')
    })
  })

  describe('example messages', () => {
    it('emits newMessage after clicking example button', async () => {
      const wrapper = factory()

      await wrapper.find('button').trigger('click')

      const exampleButton = wrapper.findAll('button')
        .find(btn => btn.text().includes('Help me create a social media post'))

      expect(exampleButton).toBeTruthy()

      await exampleButton!.trigger('click')

      const emitted = wrapper.emitted('newMessage')

      expect(emitted).toHaveLength(1)
      expect(emitted?.[0][0]).toMatchObject({
        text: 'Help me create a social media post',
        userId: me.id
      })
    })
  })

  describe('messages rendering', () => {
    it('renders chat bubbles for messages', async () => {
      const messages: Message[] = [
        {
          id: 'm1',
          userId: userA.id,
          text: 'Hi',
          createdAt: new Date()
        },
        {
          id: 'm2',
          userId: me.id,
          text: 'Hello',
          createdAt: new Date()
        }
      ]

      const wrapper = factory({ messages })

      await wrapper.find('button').trigger('click')

      const bubbles = wrapper.findAll('.chat-bubble')
      expect(bubbles).toHaveLength(2)
    })

    it('renders typing bubbles for usersTyping', async () => {
      const wrapper = factory({ usersTyping: [userA, userB] })

      await wrapper.find('button').trigger('click')

      const bubbles = wrapper.findAll('.chat-bubble')
      expect(bubbles.length).toBeGreaterThanOrEqual(2)
    })
  })
})
