import { useEffect } from 'react'
import { FiArrowRight } from 'react-icons/fi'

import Seo from '@/components/common/Seo'
import FloatingActions from '@/components/common/FloatingActions'
import Hero from '@/components/hero/Hero'
import CategoryFilter from '@/components/catalog/CategoryFilter'
import ProductSearch from '@/components/catalog/ProductSearch'
import ProductCard from '@/components/cards/ProductCard'
import ProductDetailModal from '@/components/cards/ProductDetailModal'

import CartSidebar from '@/components/cart/CartSidebar'
import OrderConfirmModal from '@/components/order/OrderConfirmModal'

import Footer from '@/components/footer/Footer'

import { useFilteredMenuItems } from '@/hooks/useMenuItems'
import { useMenuStore } from '@/store/menuStore'
import { useConfigStore } from '@/store/configStore'
import { useDeliveryStore } from '@/store/deliveryStore'
import { useExtrasStore } from '@/store/extrasStore'

function prefetchImages(urls) {
  urls.forEach((url) => {
    const img = new Image()
    img.decoding = 'async'
    img.src = url
  })
}

export default function Catalog() {
  const items = useFilteredMenuItems()

  const isLoading = useMenuStore((state) => state.isLoading)
  const searchQuery = useMenuStore((state) => state.searchQuery)
  const categories = useMenuStore((state) => state.categories)
  const activeCategory = useMenuStore((state) => state.activeCategory)
  const setActiveCategory = useMenuStore((state) => state.setActiveCategory)
  const carta = useConfigStore((state) => state.site.carta)

  const showLoading = isLoading && items.length === 0
  const activeCategoryName =
    categories.find((cat) => cat.id === activeCategory)?.name || carta.title

  useEffect(() => {
    useMenuStore.getState().fetchMenu()
    useConfigStore.getState().fetchConfig()
    useDeliveryStore.getState().fetchZones()
    useExtrasStore.getState().fetchExtras()
  }, [])

  useEffect(() => {
    prefetchImages(items.slice(0, 6).map((item) => item.image))
  }, [items])

  return (
    <>
      <Seo
        path="/"
        description="Ceviches frescos, mojitos y promos con delivery a domicilio. Revisa la carta y pide por WhatsApp."
      />

      <div className="min-h-screen bg-[var(--color-bg)]">
        <CartSidebar />
        <OrderConfirmModal />
        <ProductDetailModal />
        <FloatingActions />

        <div className="min-h-screen">
          <main className="flex flex-col">
            <Hero />

            <section
              id="catalogo"
              className="px-8 pt-5 pb-16 max-[1100px]:px-5 max-[1100px]:pt-4"
            >
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
                <CategoryFilter />
                <ProductSearch />
              </div>

              <header className="mb-5 flex items-center justify-between gap-4">
                <h2 className="flex min-w-0 items-center gap-2.5 text-[clamp(1.05rem,2.4vw,1.35rem)] font-extrabold uppercase tracking-[0.04em] text-[var(--color-text)]">
                  <span
                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--color-primary)]"
                    aria-hidden
                  />
                  <span className="truncate">{activeCategoryName}</span>
                </h2>

                {activeCategory !== 'all' ? (
                  <button
                    type="button"
                    onClick={() => setActiveCategory('all')}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#0a0a0a] px-3.5 py-2 text-[0.7rem] font-bold text-white transition hover:bg-[#1a1a1a] sm:px-4 sm:text-xs"
                  >
                    Ver todas
                    <FiArrowRight className="text-[var(--color-primary)]" aria-hidden />
                  </button>
                ) : null}
              </header>

              {showLoading ? (
                <p className="py-12 text-center text-[var(--color-text-dim)]">
                  Cargando menú...
                </p>
              ) : items.length === 0 ? (
                <p className="py-12 text-center text-[var(--color-text-dim)]">
                  {searchQuery.trim()
                    ? `No hay productos que coincidan con "${searchQuery.trim()}".`
                    : 'No hay productos en esta categoría.'}
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                  {items.map((item, index) => (
                    <ProductCard
                      key={item.id}
                      product={item}
                      priority={index < 4}
                    />
                  ))}
                </div>
              )}
            </section>

            <Footer />
          </main>
        </div>
      </div>
    </>
  )
}
