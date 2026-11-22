import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import { clearNuxtData } from '#imports'
import PhotoCommentsSection from '~/components/PhotoCommentsSection.vue'

const COMMENTS = [
  {
    id: '1',
    photoId: '1',
    author: 'Marta Lewandowska',
    avatar: 'https://i.pravatar.cc/100?img=5',
    content: 'Starszy komentarz',
    createdAt: '2026-08-10T10:00:00Z'
  },
  {
    id: '2',
    photoId: '1',
    author: 'Piotr Nowak',
    avatar: 'https://i.pravatar.cc/100?img=12',
    content: 'Nowszy komentarz',
    createdAt: '2026-08-16T10:00:00Z'
  },
  {
    id: '3',
    photoId: '2',
    author: 'Anna Kowalska',
    avatar: 'https://i.pravatar.cc/100?img=23',
    content: 'Komentarz do innego zdjęcia',
    createdAt: '2026-08-12T10:00:00Z'
  }
]

// Odpowiedź endpointu podmieniana w poszczególnych testach.
let respond
registerEndpoint('/api/comments.json', () => respond())

let wrapper

const mountSection = async (photoId = '1') => {
  wrapper = await mountSuspended(PhotoCommentsSection, { props: { photoId } })
  return wrapper
}

const isLoading = () => wrapper.find('[role="status"]').exists()

// Odpowiedź przechodzi przez kilka kroków asynchronicznych (handler → fetch →
// useFetch), więc czekamy na zniknięcie stanu ładowania zamiast zgadywać,
// ile razy opróżnić kolejkę promise'ów.
const waitForLoaded = () => vi.waitFor(() => expect(isLoading()).toBe(false))

beforeEach(() => {
  respond = () => COMMENTS
})

afterEach(() => {
  wrapper?.unmount()
  // Komponent trzyma dane pod wspólnym kluczem — czyścimy je między testami.
  clearNuxtData('comments')
})

describe('PhotoCommentsSection', () => {
  it('shows a loading state until comments arrive', async () => {
    let release
    respond = () => new Promise((resolve) => (release = () => resolve(COMMENTS)))

    await mountSection()

    expect(isLoading()).toBe(true)

    release()
    await waitForLoaded()

    expect(wrapper.findAll('time')).toHaveLength(2)
  })

  it('renders only comments of the given photo, newest first', async () => {
    await mountSection('1')
    await waitForLoaded()

    const text = wrapper.text()
    expect(text).toContain('Nowszy komentarz')
    expect(text).toContain('Starszy komentarz')
    expect(text).not.toContain('Komentarz do innego zdjęcia')
    expect(text.indexOf('Piotr Nowak')).toBeLessThan(
      text.indexOf('Marta Lewandowska')
    )
  })

  it('shows the formatted date and keeps the ISO date in datetime', async () => {
    await mountSection('1')
    await waitForLoaded()

    const time = wrapper.find('time')
    expect(time.text()).toBe('16.08.2026')
    expect(time.attributes('datetime')).toBe('2026-08-16T10:00:00Z')
  })

  it('shows an empty state when the photo has no comments', async () => {
    await mountSection('999')
    await waitForLoaded()

    expect(wrapper.text()).toContain('Brak komentarzy do tego zdjęcia.')
    expect(wrapper.findAll('time')).toHaveLength(0)
  })

  it('shows an error state and refetches after clicking retry', async () => {
    respond = () => {
      throw new Error('Server error')
    }

    await mountSection('1')
    await waitForLoaded()

    expect(wrapper.text()).toContain('Nie udało się pobrać komentarzy.')

    respond = () => COMMENTS
    await wrapper.find('button').trigger('click')

    // Czekamy na stan końcowy, a nie na zniknięcie ładowania — po kliknięciu
    // ładowanie mogłoby jeszcze się nie pojawić.
    await vi.waitFor(() => expect(wrapper.findAll('time')).toHaveLength(2))
    expect(wrapper.text()).not.toContain('Nie udało się pobrać komentarzy.')
  })
})
