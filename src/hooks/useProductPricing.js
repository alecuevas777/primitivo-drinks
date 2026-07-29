import { useMemo } from 'react'
import { useConfigStore } from '@/store/configStore'
import { useMenuStore } from '@/store/menuStore'
import {
  getProductPricing,
  getSelectedVariantsPricing,
  getVariantPricing,
} from '@/utils/productPricing'

const EMPTY_PRICING = {
  discountPercent: 0,
  discountLabel: null,
  basePrice: 0,
  displayPrice: 0,
  hasDiscount: false,
  showFromPrice: false,
}

export function useProductPricing(product) {
  const globalDiscount = useConfigStore((state) => state.site.descuentoPorcentaje)
  const categories = useMenuStore((state) => state.categories)

  return useMemo(() => {
    if (!product) return EMPTY_PRICING
    return getProductPricing(product, categories, globalDiscount)
  }, [product, categories, globalDiscount])
}

export function useVariantPricing(product, variant) {
  const pricing = useProductPricing(product)

  return useMemo(
    () => (variant ? getVariantPricing(variant, pricing) : pricing),
    [variant, pricing],
  )
}

export function useSelectedVariantsPricing(product, variants) {
  const pricing = useProductPricing(product)

  return useMemo(
    () =>
      variants?.length ? getSelectedVariantsPricing(variants, pricing) : pricing,
    [variants, pricing],
  )
}
