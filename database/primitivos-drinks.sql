-- Primitivos Drinks — dump completo del esquema y datos base
-- Fecha: 22 de julio de 2026
-- Incluye: variantes, imágenes de variantes, max_sabores, delivery, extras,
--          horarios, hero móvil, descuento global, cupones, configuración bancaria
-- Importar en phpMyAdmin o MySQL local

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET UNIQUE_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET time_zone = '+00:00';

CREATE DATABASE IF NOT EXISTS `primitivos_drinks`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `primitivos_drinks`;

-- ------------------------------------------------------------
-- usuario
-- ------------------------------------------------------------

DROP TABLE IF EXISTS `usuario`;
CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nom_usuario` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono_usuario` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `correo_usuario` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `contrasena_usuario` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `usuario_correo_usuario_key` (`correo_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contraseña: Admin123!
INSERT INTO `usuario` (`id_usuario`, `nom_usuario`, `telefono_usuario`, `correo_usuario`, `contrasena_usuario`) VALUES
(1, 'Administrador', '56900000000', 'admin@primitivos.cl', '$2y$10$s67PyG0M1dPz4eGoghxheOzolRyRqS.qoKOPna51LXavhzu/Hk1mq');

-- ------------------------------------------------------------
-- categoria
-- ------------------------------------------------------------

DROP TABLE IF EXISTS `categoria`;
CREATE TABLE `categoria` (
  `id_categoria` int NOT NULL AUTO_INCREMENT,
  `nom_categoria` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `descuento_porcentaje` decimal(5,2) DEFAULT NULL,
  `aviso_stock_desde` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id_categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `categoria` (`id_categoria`, `nom_categoria`, `descripcion`, `descuento_porcentaje`, `aviso_stock_desde`) VALUES
(1, 'Ceviches', 'Ceviches y entradas', 0.00, 5),
(2, 'Mojitos', 'Mojitos y cócteles', 0.00, 5),
(3, 'Promos', 'Promociones especiales', 0.00, 0);

-- ------------------------------------------------------------
-- configuracion
-- ------------------------------------------------------------

DROP TABLE IF EXISTS `configuracion`;
CREATE TABLE `configuracion` (
  `id_configuracion` int NOT NULL DEFAULT '1',
  `nombre_negocio` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `direccion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `url_mapa` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `logo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `instagram` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `facebook` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `whatsapp` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tiktok` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `titulo_hero` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtitulo_hero` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `imagen_hero` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `imagen_hero_mobile` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `texto_promo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `delivery_gratis_desde` decimal(10,2) DEFAULT NULL,
  `descuento_porcentaje` decimal(5,2) DEFAULT NULL,
  `etiqueta_carta` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Nuestra Carta',
  `titulo_carta` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Productos',
  `subtitulo_carta` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cb_titular_nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cb_titular_rut` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cb_titular_email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cb_tipo_cuenta` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cb_numero_cuenta` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cb_banco` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_configuracion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `configuracion` VALUES (
  1,
  'Primitivos Drinks',
  '',
  '',
  'https://res.cloudinary.com/dinhrwram/image/upload/v1784771925/ChatGPT_Image_22_jul_2026_09_58_39_p.m._rvcwew.png',
  '',
  NULL,
  '',
  '',
  '',
  '',
  'Primitivos Drinks',
  'Ceviches, mojitos y delivery a domicilio.',
  'https://res.cloudinary.com/dinhrwram/image/upload/v1784771943/ChatGPT_Image_22_jul_2026_09_58_24_p.m._rf4mcf.png',
  'https://res.cloudinary.com/dinhrwram/image/upload/v1784781306/bannersimiomovi1l_mrg6bo.png',
  '',
  NULL,
  NULL,
  'Nuestra Carta',
  'Productos',
  'Explora el menú y pide por WhatsApp con delivery a domicilio.',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL
);

-- ------------------------------------------------------------
-- configuracion_horario
-- ------------------------------------------------------------

DROP TABLE IF EXISTS `configuracion_horario`;
CREATE TABLE `configuracion_horario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dia_semana` tinyint NOT NULL COMMENT '0=domingo ... 6=sabado',
  `hora_apertura` time NOT NULL,
  `hora_cierre` time NOT NULL,
  `abierto` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dia_semana` (`dia_semana`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `configuracion_horario` (`dia_semana`, `hora_apertura`, `hora_cierre`, `abierto`) VALUES
(0, '18:00:00', '23:00:00', 1),
(1, '18:00:00', '23:00:00', 1),
(2, '18:00:00', '23:00:00', 1),
(3, '18:00:00', '23:00:00', 1),
(4, '18:00:00', '23:00:00', 1),
(5, '18:00:00', '23:00:00', 1),
(6, '18:00:00', '23:00:00', 1);

-- ------------------------------------------------------------
-- producto
-- ------------------------------------------------------------

DROP TABLE IF EXISTS `producto`;
CREATE TABLE `producto` (
  `id_producto` int NOT NULL AUTO_INCREMENT,
  `nom_producto` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `precio_producto` int DEFAULT NULL,
  `descuento_porcentaje` decimal(5,2) DEFAULT NULL,
  `stock_disponible` int DEFAULT NULL,
  `aviso_stock_desde` int unsigned DEFAULT NULL,
  `descripcion_producto` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `img_prod` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `categoria_id` int NOT NULL,
  `caracteristicas` json NOT NULL,
  `presentacion` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `detalles` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `usa_variantes` tinyint(1) DEFAULT '0',
  `tipo_variante` enum('sabor','presentacion') NOT NULL DEFAULT 'sabor',
  `mostrar_imagen_variantes` tinyint(1) NOT NULL DEFAULT '0',
  `max_sabores` tinyint unsigned NOT NULL DEFAULT '1',
  `promo_cantidad` tinyint unsigned DEFAULT NULL,
  `promo_origen_id` int DEFAULT NULL,
  PRIMARY KEY (`id_producto`),
  UNIQUE KEY `producto_categoria_nombre_unique` (`categoria_id`, `nom_producto`),
  KEY `producto_categoria_id_idx` (`categoria_id`),
  CONSTRAINT `producto_categoria_id_fkey` FOREIGN KEY (`categoria_id`) REFERENCES `categoria` (`id_categoria`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- producto_variantes
-- ------------------------------------------------------------

DROP TABLE IF EXISTS `producto_variantes`;
CREATE TABLE `producto_variantes` (
  `id_variante` int NOT NULL AUTO_INCREMENT,
  `producto_id` int DEFAULT NULL,
  `nombre_variante` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `precio` int NOT NULL,
  `stock` int DEFAULT '0',
  `img_variante` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id_variante`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `producto_variantes_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `producto` (`id_producto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- cupon
-- ------------------------------------------------------------

DROP TABLE IF EXISTS `cupon`;
CREATE TABLE `cupon` (
  `id_cupon` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo` enum('porcentaje_pedido','porcentaje_categoria','porcentaje_producto','envio_gratis') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'porcentaje_pedido',
  `valor` decimal(10,2) NOT NULL DEFAULT '0.00',
  `pedido_minimo` decimal(10,2) DEFAULT NULL,
  `solo_delivery` tinyint(1) NOT NULL DEFAULT '0',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  PRIMARY KEY (`id_cupon`),
  UNIQUE KEY `cupon_codigo_unique` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `cupon` (`id_cupon`, `codigo`, `descripcion`, `tipo`, `valor`, `pedido_minimo`, `solo_delivery`, `activo`, `fecha_inicio`, `fecha_fin`) VALUES
(1, 'PROMO10', '10% de descuento en tu pedido', 'porcentaje_pedido', 10.00, 15000.00, 0, 1, NULL, NULL),
(2, 'ENVIOGRATIS', 'Envío gratis en pedidos elegibles', 'envio_gratis', 0.00, 25000.00, 1, 1, NULL, NULL);

-- ------------------------------------------------------------
-- cupon_categoria
-- ------------------------------------------------------------

DROP TABLE IF EXISTS `cupon_categoria`;
CREATE TABLE `cupon_categoria` (
  `cupon_id` int NOT NULL,
  `categoria_id` int NOT NULL,
  PRIMARY KEY (`cupon_id`, `categoria_id`),
  KEY `cc_categoria_idx` (`categoria_id`),
  CONSTRAINT `cc_categoria_fkey` FOREIGN KEY (`categoria_id`) REFERENCES `categoria` (`id_categoria`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cc_cupon_fkey` FOREIGN KEY (`cupon_id`) REFERENCES `cupon` (`id_cupon`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- cupon_producto
-- ------------------------------------------------------------

DROP TABLE IF EXISTS `cupon_producto`;
CREATE TABLE `cupon_producto` (
  `cupon_id` int NOT NULL,
  `producto_id` int NOT NULL,
  PRIMARY KEY (`cupon_id`, `producto_id`),
  KEY `cp_producto_idx` (`producto_id`),
  CONSTRAINT `cp_cupon_fkey` FOREIGN KEY (`cupon_id`) REFERENCES `cupon` (`id_cupon`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cp_producto_fkey` FOREIGN KEY (`producto_id`) REFERENCES `producto` (`id_producto`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- delivery_zona
-- ------------------------------------------------------------

DROP TABLE IF EXISTS `delivery_zona`;
CREATE TABLE `delivery_zona` (
  `id` int NOT NULL AUTO_INCREMENT,
  `comuna` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `costo` decimal(10,2) NOT NULL,
  `tiempo_estimado` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `comuna` (`comuna`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `delivery_zona` (`id`, `comuna`, `costo`, `tiempo_estimado`, `activo`) VALUES
(1, 'Concepción', 2000.00, '30-45 min', 1),
(2, 'Hualpén', 2000.00, '30-45 min', 1),
(3, 'Talcahuano', 3000.00, '35-50 min', 1),
(4, 'San Pedro', 3000.00, '35-50 min', 1);

-- ------------------------------------------------------------
-- ingrediente_extra
-- ------------------------------------------------------------

DROP TABLE IF EXISTS `ingrediente_extra`;
CREATE TABLE `ingrediente_extra` (
  `id_ingrediente_extra` int NOT NULL AUTO_INCREMENT,
  `nom_ingrediente` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `precio_extra` decimal(10,2) NOT NULL DEFAULT '0.00',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_ingrediente_extra`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
SET UNIQUE_CHECKS = 1;

-- Importación completada.
-- Admin: admin@primitivos.cl / Admin123!
