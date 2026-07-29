import { create } from 'zustand'
import api from '@/services/api'
import { getCurrentUser, login as loginRequest, logout as logoutRequest } from '@/services/adminApi'

export const useAuthStore = create((set, get) => ({
  user: null,
  status: 'idle',

  checkSession: async () => {
    if (get().status === 'loading') return false

    set({ status: 'loading' })

    try {
      const res = await getCurrentUser()
      set({ user: res.data, status: 'authenticated' })
      return true
    } catch {
      set({ user: null, status: 'unauthenticated' })
      return false
    }
  },

  login: async (correo, contrasena) => {
    const res = await loginRequest({ correo_usuario: correo, contrasena })
    set({ user: res.data, status: 'authenticated' })
    return res.data
  },

  logout: async () => {
    try {
      await logoutRequest()
    } catch {
      // Clear local state even if the request fails.
    }

    set({ user: null, status: 'unauthenticated' })
  },
}))

if (typeof window !== 'undefined') {
  window.addEventListener('auth:unauthorized', () => {
    useAuthStore.setState({ user: null, status: 'unauthenticated' })
  })
}
