-- Primitivos Drinks — limpiar catálogo e insertar productos del menú
-- Ejecutar TODO el archivo de una sola vez (Ctrl+Shift+Enter en Workbench)

USE `primitivos_drinks`;

SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE `producto_variantes`;
TRUNCATE TABLE `producto`;

SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;

-- ============================================================
-- CEVICHES (cat 1) — variantes = presentaciones
-- ============================================================

INSERT INTO `producto` (
  `id_producto`, `nom_producto`, `precio_producto`, `descuento_porcentaje`,
  `stock_disponible`, `aviso_stock_desde`, `descripcion_producto`, `img_prod`,
  `categoria_id`, `caracteristicas`, `presentacion`, `detalles`,
  `usa_variantes`, `tipo_variante`, `mostrar_imagen_variantes`, `max_sabores`
) VALUES
(1, 'Ceviche de Salmón', 4000, NULL, 50, 5,
 'Salmón fresco, morrón rojo, cebolla morada, choclo, choclo peruano, cilantro y palta.',
 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80',
 1, JSON_ARRAY('Fresco','Natural','Preparado al momento'),
 'Según presentación', 'Fresco y natural. Ingredientes de calidad.',
 1, 'presentacion', 0, 1),

(2, 'Ceviche de Macha', 4000, NULL, 50, 5,
 'Macha fresca, morrón rojo, cebolla morada, choclo, choclo peruano, cilantro y palta.',
 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=800&q=80',
 1, JSON_ARRAY('Fresco','Natural','Preparado al momento'),
 'Según presentación', 'Fresco y natural. Ingredientes de calidad.',
 1, 'presentacion', 0, 1);

INSERT INTO `producto_variantes` (`producto_id`, `nombre_variante`, `precio`, `stock`) VALUES
(1, '250 g', 4000, 20),
(1, '350 g', 6000, 20),
(1, '500 g', 8000, 20),
(1, '1 kilo', 16000, 15),
(2, '250 g', 4000, 20),
(2, '350 g', 6000, 20),
(2, '500 g', 8000, 20),
(2, '1 kilo', 16000, 15);

-- ============================================================
-- MOJITO SABORES (cat 2) — variantes = sabores
-- ============================================================

INSERT INTO `producto` (
  `id_producto`, `nom_producto`, `precio_producto`, `descuento_porcentaje`,
  `stock_disponible`, `aviso_stock_desde`, `descripcion_producto`, `img_prod`,
  `categoria_id`, `caracteristicas`, `presentacion`, `detalles`,
  `usa_variantes`, `tipo_variante`, `mostrar_imagen_variantes`, `max_sabores`
) VALUES
(3, 'Mojito Sabores', 8500, NULL, 80, 5,
 'Mojilitro de 1 litro. Elige tu sabor favorito.',
 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&q=80',
 2, JSON_ARRAY('1 litro','A elección'),
 '1 litro', 'Sabor a elección.',
 1, 'sabor', 0, 1);

INSERT INTO `producto_variantes` (`producto_id`, `nombre_variante`, `precio`, `stock`) VALUES
(3, 'Arándano', 8500, 20),
(3, 'Frambuesa', 8500, 20),
(3, 'Frutilla', 8500, 20),
(3, 'Mango', 8500, 20),
(3, 'Maracuyá', 8500, 20),
(3, 'Mix de Berries', 8500, 20),
(3, 'Papaya', 8500, 20),
(3, 'Piña', 8500, 20),
(3, 'Tradicional', 8500, 20);

-- ============================================================
-- PRODUCTOS INDIVIDUALES — Mojitos
-- ============================================================

INSERT INTO `producto` (
  `id_producto`, `nom_producto`, `precio_producto`, `descuento_porcentaje`,
  `stock_disponible`, `aviso_stock_desde`, `descripcion_producto`, `img_prod`,
  `categoria_id`, `caracteristicas`, `presentacion`, `detalles`,
  `usa_variantes`, `tipo_variante`, `mostrar_imagen_variantes`, `max_sabores`
) VALUES
(4, 'Mojito Zero', 8000, NULL, 40, 5,
 'Mojito zero azúcar. Sabor a elección.',
 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80',
 2, JSON_ARRAY('Zero','Sabor a elección'),
 '1 litro', 'Sin azúcar.',
 0, 'sabor', 0, 1),

(5, 'Aperol', 9000, NULL, 30, 5,
 'Mojito especial con Aperol.',
 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80',
 2, JSON_ARRAY('Especial'),
 '1 litro', 'Mojito especiales.',
 0, 'sabor', 0, 1),

(6, 'Blue', 9000, NULL, 30, 5,
 'Mojito especial Blue.',
 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800&q=80',
 2, JSON_ARRAY('Especial'),
 '1 litro', 'Mojito especiales.',
 0, 'sabor', 0, 1),

(7, 'Jagger', 9000, NULL, 30, 5,
 'Mojito especial con Jägermeister.',
 'https://images.unsplash.com/photo-1514361892635-6b07e160e8b2?w=800&q=80',
 2, JSON_ARRAY('Especial'),
 '1 litro', 'Mojito especiales.',
 0, 'sabor', 0, 1),

(8, 'Ramazzotti', 9000, NULL, 30, 5,
 'Mojito especial con Ramazzotti.',
 'https://images.unsplash.com/photo-1556679343-c7306c197c53?w=800&q=80',
 2, JSON_ARRAY('Especial'),
 '1 litro', 'Mojito especiales.',
 0, 'sabor', 0, 1);

-- ============================================================
-- PROMOS (cat 3) — solo Mojito Sabores
-- ============================================================

INSERT INTO `producto` (
  `id_producto`, `nom_producto`, `precio_producto`, `descuento_porcentaje`,
  `stock_disponible`, `aviso_stock_desde`, `descripcion_producto`, `img_prod`,
  `categoria_id`, `caracteristicas`, `presentacion`, `detalles`,
  `usa_variantes`, `tipo_variante`, `mostrar_imagen_variantes`, `max_sabores`
) VALUES
(9, 'Promo 2 Mojitos Sabores', 15000, NULL, 40, 3,
 '2 Mojitos Sabores a precio promo. Sabores a elección.',
 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&q=80',
 3, JSON_ARRAY('Promo','2x'),
 '2 litros', 'Válido para Mojito Sabores.',
 0, 'sabor', 0, 1),

(10, 'Promo 3 Mojitos Sabores', 20000, NULL, 40, 3,
 '3 Mojitos Sabores a precio promo. Sabores a elección.',
 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80',
 3, JSON_ARRAY('Promo','3x'),
 '3 litros', 'Válido para Mojito Sabores.',
 0, 'sabor', 0, 1),

(11, 'Promo 4 Mojitos Sabores', 26000, NULL, 40, 3,
 '4 Mojitos Sabores a precio promo. Sabores a elección.',
 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80',
 3, JSON_ARRAY('Promo','4x'),
 '4 litros', 'Válido para Mojito Sabores.',
 0, 'sabor', 0, 1);

-- Configurar packs (después de insertar; id 3 = Mojito Sabores)
UPDATE `producto` SET `promo_cantidad` = 2, `promo_origen_id` = 3 WHERE `id_producto` = 9;
UPDATE `producto` SET `promo_cantidad` = 3, `promo_origen_id` = 3 WHERE `id_producto` = 10;
UPDATE `producto` SET `promo_cantidad` = 4, `promo_origen_id` = 3 WHERE `id_producto` = 11;

ALTER TABLE `producto` AUTO_INCREMENT = 12;
