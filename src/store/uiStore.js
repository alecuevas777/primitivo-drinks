import { create } from 'zustand'

export const useUiStore = create((set) => ({
  isCartOpen: false,
  orderModal: null,
  productDetail: null,

  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((s) => ({ isCartOpen: !s.isCartOpen })),
  openOrderModal: (lines, source = 'product') =>
    set({ orderModal: { lines, source } }),
  closeOrderModal: () => set({ orderModal: null }),
  openProductDetail: (product) => set({ productDetail: product }),
  closeProductDetail: () => set({ productDetail: null }),
}))
