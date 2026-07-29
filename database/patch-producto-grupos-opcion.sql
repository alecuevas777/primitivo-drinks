-- =============================================================================
-- Primitivos Drinks — Grupos de opciones (ej. Tipo de Jack + Sabor)
-- Ejecutar en local y en producción (phpMyAdmin / MySQL)
-- =============================================================================

SET NAMES utf8mb4;

-- Flag en producto (precio fijo + varias elecciones obligatorias)
ALTER TABLE `producto`
  ADD COLUMN `usa_grupos_opcion` tinyint(1) NOT NULL DEFAULT 0
  AFTER `usa_variantes`;

-- Grupos por producto (paso 1, paso 2, …)
CREATE TABLE IF NOT EXISTS `producto_opcion_grupo` (
  `id_grupo` int NOT NULL AUTO_INCREMENT,
  `producto_id` int NOT NULL,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `min_seleccion` tinyint unsigned NOT NULL DEFAULT 1,
  `max_seleccion` tinyint unsigned NOT NULL DEFAULT 1,
  `orden` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_grupo`),
  KEY `pog_producto_idx` (`producto_id`),
  CONSTRAINT `pog_producto_fkey`
    FOREIGN KEY (`producto_id`) REFERENCES `producto` (`id_producto`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Opciones dentro de cada grupo
CREATE TABLE IF NOT EXISTS `producto_opcion` (
  `id_opcion` int NOT NULL AUTO_INCREMENT,
  `grupo_id` int NOT NULL,
  `nombre_opcion` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `precio_extra` int NOT NULL DEFAULT 0,
  `stock` int DEFAULT NULL,
  `img_opcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `orden` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_opcion`),
  KEY `po_grupo_idx` (`grupo_id`),
  CONSTRAINT `po_grupo_fkey`
    FOREIGN KEY (`grupo_id`) REFERENCES `producto_opcion_grupo` (`id_grupo`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
