import create from 'zustand'
import { api } from '~/api/api'
import type { NotificationDTO, NotificationsListResponse } from '~/api/types'
import { useAuthState } from './AuthContext'

type State = {
  items: NotificationDTO[]
  page: number | null
  loading: boolean
  unread: number
  loadedOnce: boolean
  loadInitial: () => Promise<void>
  loadMore: () => Promise<void>
  markAsRead: (id: number) => Promise<void>
  remove: (id: number) => Promise<void>
  push: (n: NotificationDTO) => void
  setItems: (items: NotificationDTO[]) => void
}

export const useNotifications = create<State>((set, get) => ({
  items: [],
  page: null,
  loading: false,
  unread: 0,
  loadedOnce: false,

  loadInitial: async () => {
    const auth = useAuthState.getState();
    if (!auth.user) return;
    set({ loading: true });
    try {
      const res = await api.get('/notifications?limit=20').json<NotificationsListResponse>()
      const data = res?.data ?? []
      set({ items: data, page: res?.pagination?.next ?? null, unread: data.filter(n => !n.readAt).length, loadedOnce: true })
    } catch (e) {
      console.error('loadInitial notifications', e)
    } finally {
      set({ loading: false })
    }
  },

  loadMore: async () => {
    const s = get()
    if (!s.page || s.loading) return
    set({ loading: true })
    try {
      const res = await api.get(`/notifications?limit=20&after=${s.page}`).json<NotificationsListResponse>()
      const next = res?.data ?? []
      set({ items: [...s.items, ...next], page: res?.pagination?.next ?? null })
    } catch (e) {
      console.error('loadMore notifications', e)
    } finally {
      set({ loading: false })
    }
  },

  markAsRead: async (id: number) => {
    try {
      const res = await api.patch({}, `/notifications/${id}/mark-as-read`).json()
      set((state) => ({
        items: state.items.map(it => it.id === id ? { ...it, readAt: (res as any)?.data?.readAt ?? new Date().toISOString() } : it),
        unread: Math.max(0, state.unread - (state.items.find(it => it.id === id && !it.readAt) ? 1 : 0))
      }))
    } catch (e) {
      console.error('markAsRead', e)
      throw e
    }
  },

  remove: async (id: number) => {
    try {
      await api.delete(`/notifications/${id}`).res()
      set((state) => ({ items: state.items.filter(it => it.id !== id) }))
    } catch (e) {
      console.error('remove notification', e)
      throw e
    }
  },

  push: (n: NotificationDTO) => {
    set((state) => ({ items: [n, ...state.items].slice(0, 100), unread: state.unread + (n.readAt ? 0 : 1) }))
  }
  ,
  setItems: (items: NotificationDTO[]) => set({ items, unread: items.filter(n => !n.readAt).length })
}))

export default useNotifications
