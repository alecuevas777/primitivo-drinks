import { create } from 'zustand'
import { getIngredientesExtra } from '@/services/api'

export const useExtrasStore = create((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchExtras: async (force = false) => {
    if (!force && get().items.length > 0) return

    set({ isLoading: true, error: null })
    try {
      const items = await getIngredientesExtra()
      set({ items, isLoading: false })
    } catch (error) {
      set({
        error: error.message || 'No se pudieron cargar los extras',
        isLoading: false,
      })
    }
  },
}))
