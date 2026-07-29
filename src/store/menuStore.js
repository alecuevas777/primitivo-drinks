import { create } from 'zustand'
import { getProductos, getCategorias } from '@/services/api'
import { resolveProductImage } from '@/utils'
import { normalizeTipoVariante } from '@/utils/variantCopy'

const ALL_CATEGORY = { id: 'all', name: 'Todos', icon: 'grid' }

export function mapVariante(v) {
  const rawImage = String(v.img_variante ?? '').trim()

  return {
    id: v.id,
    nombre_variante: v.nombre_variante,
    precio: Number(v.precio),
    stock: v.stock != null ? Number(v.stock) : null,
    img_variante: rawImage || null,
    image: rawImage ? resolveProductImage(rawImage) : null,
  }
}

export function mapOpcion(o) {
  const rawImage = String(o.img_opcion ?? '').trim()

  return {
    id: o.id,
    grupo_id: Number(o.grupo_id),
    nombre_opcion: o.nombre_opcion,
    precio_extra: Number(o.precio_extra) || 0,
    stock: o.stock != null ? Number(o.stock) : null,
    img_opcion: rawImage || null,
    image: rawImage ? resolveProductImage(rawImage) : null,
    orden: Number(o.orden) || 0,
  }
}

export function mapGrupoOpcion(g) {
  return {
    id: g.id,
    producto_id: Number(g.producto_id),
    nombre: g.nombre,
    min_seleccion: Math.max(0, Number(g.min_seleccion) || 1),
    max_seleccion: Math.max(1, Number(g.max_seleccion) || 1),
    orden: Number(g.orden) || 0,
    opciones: (g.opciones ?? []).map(mapOpcion),
  }
}

function mapProduct(p, categoryDiscountMap = new Map()) {
  const usaVariantes = Boolean(Number(p.usa_variantes))
  const usaGruposOpcion = Boolean(Number(p.usa_grupos_opcion))
  const precioDesde = p.precio_desde != null ? Number(p.precio_desde) : null
  const basePrice = usaVariantes ? (precioDesde ?? 0) : Number(p.precio_producto)

  return {
    id: p.id_producto,
    name: p.nom_producto,
    description: p.descripcion_producto ?? '',
    price: basePrice,
    precio_base: precioDesde,
    productDiscount: Number(p.descuento_porcentaje) || 0,
    categoryDiscount: categoryDiscountMap.get(String(p.categoria_id)) || 0,
    category: String(p.categoria_id),
    image: resolveProductImage(p.img_prod),
    usa_variantes: usaVariantes,
    usa_grupos_opcion: usaGruposOpcion,
    tipo_variante: usaVariantes ? normalizeTipoVariante(p.tipo_variante) : 'sabor',
    promo_cantidad: Number(p.promo_cantidad) > 0 ? Number(p.promo_cantidad) : 0,
    promo_origen_id: p.promo_origen_id != null ? Number(p.promo_origen_id) : null,
    es_promo_sabores:
      Number(p.promo_cantidad) >= 2 && p.promo_origen_id != null && Number(p.promo_origen_id) > 0,
    mostrar_imagen_variantes: Boolean(Number(p.mostrar_imagen_variantes)),
    max_sabores: usaVariantes
      ? normalizeTipoVariante(p.tipo_variante) === 'presentacion'
        ? 1
        : Math.min(2, Math.max(1, Number(p.max_sabores) || 1))
      : 1,
    variantes: (p.variantes ?? []).map(mapVariante),
    grupos_opcion: (p.grupos_opcion ?? []).map(mapGrupoOpcion),
  }
}

function mapCategory(c) {
  return {
    id: String(c.id_categoria),
    name: c.nom_categoria,
    icon: 'grid',
    descuento_porcentaje: Number(c.descuento_porcentaje) || 0,
  }
}

function sortCategoriesByName(categories) {
  return [...categories].sort((a, b) =>
    String(a.name).localeCompare(String(b.name), 'es'),
  )
}

export const useMenuStore = create((set, get) => ({
  categories: [ALL_CATEGORY],
  items: [],
  activeCategory: 'all',
  searchQuery: '',
  isLoading: false,
  hasLoaded: false,
  error: null,

  setActiveCategory: (category) => set({ activeCategory: category }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  fetchMenu: async () => {
    const { isLoading, hasLoaded } = get()
    if (isLoading || hasLoaded) return

    set({ isLoading: true, error: null })

    try {
      const [productosRes, categoriasRes] = await Promise.all([
        getProductos(),
        getCategorias(),
      ])

      const categories = [
        ALL_CATEGORY,
        ...sortCategoriesByName((categoriasRes.data ?? []).map(mapCategory)),
      ]
      const categoryDiscountMap = new Map(
        categories
          .filter((cat) => cat.id !== 'all')
          .map((cat) => [cat.id, cat.descuento_porcentaje]),
      )
      const items = (productosRes.data ?? []).map((p) => mapProduct(p, categoryDiscountMap))

      set({
        items,
        categories,
        isLoading: false,
        hasLoaded: true,
      })
    } catch (error) {
      set({
        isLoading: false,
        hasLoaded: true,
        error: error.message,
      })
    }
  },
}))