import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/utils/constants'

const getCartTotal = (items) =>
  items.reduce((total, item) => total + item.price * item.quantity, 0)

const getItemCount = (items) => items.reduce((count, item) => count + item.quantity, 0)

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1, variant = null) => {
        const variantIds = Array.isArray(variant?.ids)
          ? variant.ids
          : variant?.id != null
            ? [variant.id]
            : []
        const itemId = variantIds.length
          ? `${product.id}-${variantIds.map(String).join('-')}`
          : `${product.id}`
        const { items } = get()
        const existing = items.find((item) => item.id === itemId)

        if (existing) {
          set({
            items: items.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    quantity: item.quantity + quantity,
                    category: product.category ?? item.category,
                  }
                : item,
            ),
          })
          return
        }

        set({
          items: [
            ...items,
            {
              id: itemId,
              productId: product.id,
              variantId: variantIds.length === 1 ? variantIds[0] : variantIds.join('-') || null,
              variantIds,
              variantName: variant?.nombre_variante ?? null,
              usa_variantes: Boolean(product.usa_variantes || product.es_promo_sabores || product.usa_grupos_opcion),
              es_promo_sabores: Boolean(product.es_promo_sabores || variant?.isPromoPack),
              usa_grupos_opcion: Boolean(product.usa_grupos_opcion || variant?.isGrupoOpciones),
              promo_cantidad: product.promo_cantidad || null,
              variants: product.variantes ?? [],
              name: product.name,
              price: Number(variant?.precio ?? product.price),
              image:
                product.mostrar_imagen_variantes && variant?.image
                  ? variant.image
                  : product.image,
              category: product.category,
              quantity,
            },
          ],
        })
      },

      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) })
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id)
          return
        }

        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity } : item,
          ),
        })
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => getCartTotal(get().items),

      getItemCount: () => getItemCount(get().items),
    }),
    {
      name: STORAGE_KEYS.CART,
      partialize: (state) => ({ items: state.items }),
    },
  ),
)
