import { create } from 'zustand'
import { getDeliveryZonas } from '@/services/api'

export const useDeliveryStore = create((set, get) => ({
  zones: [],
  isLoading: false,
  error: null,

  fetchZones: async (force = false) => {
    if (!force && get().zones.length > 0) return

    set({ isLoading: true, error: null })
    try {
      const zones = await getDeliveryZonas()
      set({ zones, isLoading: false })
    } catch (error) {
      set({
        error: error.message || 'No se pudieron cargar las zonas de delivery',
        isLoading: false,
      })
    }
  },
}))
