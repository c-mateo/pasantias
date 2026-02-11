import { create } from "zustand";
import { api } from '~/api/api'
import type { NotificationDTO, NotificationsListResponse } from '~/api/types'
import { useAuthState } from './AuthContext'

// polling timer id (module-scoped so only one timer runs)
let pollingTimer: number | null = null

type State = {
  items: NotificationDTO[]
  page: number | null
  loading: boolean
  unread: number
  loadedOnce: boolean
  loadInitial: () => Promise<void>
  loadMore: () => Promise<void>
  markAsRead: (id: number) => Promise<void>
  markAllAsRead: () => Promise<void>
  remove: (id: number) => Promise<void>
  removeAll: () => Promise<void>
  push: (n: NotificationDTO) => void
  setItems: (items: NotificationDTO[]) => void
  startPolling: (intervalMs?: number) => void
  stopPolling: () => void
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

  markAllAsRead: async () => {
    const s = get()
    const ids = s.items.filter(it => !it.readAt).map(it => it.id)
    if (ids.length === 0) return
    set({ loading: true })
    try {
      const results = await Promise.allSettled(ids.map(id => api.patch({}, `/notifications/${id}/mark-as-read`).json()))
      const updatedIds = new Set<number>()
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') {
          // Backend returns data with readAt; we'll mark with current time if missing
          updatedIds.add(ids[i])
        } else {
          console.error('markAllAsRead failed for id', ids[i], r.reason)
        }
      })
      set((state) => ({
        items: state.items.map(it => updatedIds.has(it.id) ? { ...it, readAt: new Date().toISOString() } : it),
        unread: Math.max(0, state.unread - updatedIds.size)
      }))
    } finally {
      set({ loading: false })
    }
  },

  removeAll: async () => {
    const s = get()
    const ids = s.items.map(it => it.id)
    if (ids.length === 0) return
    set({ loading: true })
    try {
      const results = await Promise.allSettled(ids.map(id => api.delete(`/notifications/${id}`).res()))
      const successIds = new Set<number>()
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') successIds.add(ids[i])
        else console.error('removeAll failed for id', ids[i], r.reason)
      })
      set((state) => ({ items: state.items.filter(it => !successIds.has(it.id)), unread: state.items.filter(it => !it.readAt && !successIds.has(it.id)).length }))
    } finally {
      set({ loading: false })
    }
  },

  push: (n: NotificationDTO) => {
    set((state) => ({ items: [n, ...state.items].slice(0, 100), unread: state.unread + (n.readAt ? 0 : 1) }))
  },

  // Start polling for new notifications. intervalMs defaults to 60000 (1 min)
  startPolling: (intervalMs = 60000) => {
    const auth = useAuthState.getState();
    if (!auth.user) return;
    if (pollingTimer) return; // already polling

    // polling starts after the first interval (no immediate fetch)
    pollingTimer = window.setInterval(async () => {
      try {
        const res = await api.get('/notifications?limit=20').json<NotificationsListResponse>()
        const data = res?.data ?? []
        set((state) => {
          const existingIds = new Set(state.items.map(i => i.id))
          const newItems = data.filter(d => !existingIds.has(d.id))
          if (newItems.length === 0) return {}
          return { items: [...newItems, ...state.items].slice(0,100), unread: state.unread + newItems.filter(n=>!n.readAt).length }
        })
      } catch (e) {
        console.error('polling fetch', e)
      }
    }, intervalMs)
  },

  stopPolling: () => {
    if (pollingTimer) {
      clearInterval(pollingTimer)
      pollingTimer = null
    }
  },

  setItems: (items: NotificationDTO[]) => set({ items, unread: items.filter(n => !n.readAt).length })
}))

export default useNotifications
