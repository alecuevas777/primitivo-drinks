-- =============================================================================
-- Ejemplo: Mojitos Jack Daniel’s — Saborizado ($11.000)
-- Requiere haber corrido antes: patch-producto-grupos-opcion.sql
-- Ajusta categoria_id / img_prod según tu DB
-- =============================================================================

-- 1) Producto con precio fijo + grupos de opciones
INSERT INTO `producto` (
  `nom_producto`, `precio_producto`, `descuento_porcentaje`, `stock_disponible`,
  `aviso_stock_desde`, `descripcion_producto`, `img_prod`, `categoria_id`,
  `caracteristicas`, `presentacion`, `detalles`,
  `usa_variantes`, `usa_grupos_opcion`, `tipo_variante`,
  `mostrar_imagen_variantes`, `max_sabores`, `promo_cantidad`, `promo_origen_id`
) VALUES (
  'Mojitos Jack Daniel''s - SABORIZADO',
  11000,
  NULL,
  40,
  5,
  'Mojilitro saborizado con Jack Daniel''s. Elige el tipo de Jack y el sabor de fruta.',
  '',
  2,
  JSON_ARRAY('Jack Daniel''s', '1 litro', 'Saborizado'),
  '',
  '',
  0,
  1,
  'sabor',
  0,
  1,
  NULL,
  NULL
);

SET @jack_producto_id = LAST_INSERT_ID();

-- 2) Grupo: Tipo de Jack
INSERT INTO `producto_opcion_grupo` (`producto_id`, `nombre`, `min_seleccion`, `max_seleccion`, `orden`)
VALUES (@jack_producto_id, 'Tipo de Jack', 1, 1, 1);
SET @grupo_jack = LAST_INSERT_ID();

INSERT INTO `producto_opcion` (`grupo_id`, `nombre_opcion`, `precio_extra`, `stock`, `orden`) VALUES
(@grupo_jack, 'Jack Manzana', 0, NULL, 1),
(@grupo_jack, 'Jack''s miel', 0, NULL, 2),
(@grupo_jack, 'Jack''s Fire', 0, NULL, 3),
(@grupo_jack, 'Jack''s blackberry', 0, NULL, 4);

-- 3) Grupo: Sabor
INSERT INTO `producto_opcion_grupo` (`producto_id`, `nombre`, `min_seleccion`, `max_seleccion`, `orden`)
VALUES (@jack_producto_id, 'Sabor', 1, 1, 2);
SET @grupo_sabor = LAST_INSERT_ID();

INSERT INTO `producto_opcion` (`grupo_id`, `nombre_opcion`, `precio_extra`, `stock`, `orden`) VALUES
(@grupo_sabor, 'Frutilla', 0, NULL, 1),
(@grupo_sabor, 'Maracuyá', 0, NULL, 2),
(@grupo_sabor, 'Frambuesa', 0, NULL, 3),
(@grupo_sabor, 'Mix Berries', 0, NULL, 4),
(@grupo_sabor, 'Mango', 0, NULL, 5),
(@grupo_sabor, 'Piña', 0, NULL, 6),
(@grupo_sabor, 'Papaya', 0, NULL, 7),
(@grupo_sabor, 'Arándanos', 0, NULL, 8);
