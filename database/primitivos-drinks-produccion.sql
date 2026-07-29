-- =============================================================================
-- Primitivos Drinks — dump completo para PRODUCCIÓN
-- Base: u813593352_primitivo (Hostinger / primitivosdrinks.cl)
-- Fecha: 26 julio 2026
-- Incluye: usuario, categorias, config, horarios, delivery, extras,
--          productos, variantes, cupones
-- Importar en phpMyAdmin seleccionando la DB u813593352_primitivo
-- =============================================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET UNIQUE_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET time_zone = '+00:00';

USE `u813593352_primitivo`;

-- ------------------------------------------------------------
-- primitivos_drinks_usuario
-- ------------------------------------------------------------

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nom_usuario` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono_usuario` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `correo_usuario` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `contrasena_usuario` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `usuario_correo_usuario_key` (`correo_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'Administrador','56900000000','admin@primitivos.cl','$2y$10$a0ZDdR2gTY1RS.6p7Q0aierGaGkG62JSwqvFJajY5fUwE7is9JxgS');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;


-- ------------------------------------------------------------
-- primitivos_drinks_categoria
-- ------------------------------------------------------------

--
-- Table structure for table `categoria`
--

DROP TABLE IF EXISTS `categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria` (
  `id_categoria` int NOT NULL AUTO_INCREMENT,
  `nom_categoria` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `descuento_porcentaje` decimal(5,2) DEFAULT NULL,
  `aviso_stock_desde` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id_categoria`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria`
--

LOCK TABLES `categoria` WRITE;
/*!40000 ALTER TABLE `categoria` DISABLE KEYS */;
INSERT INTO `categoria` VALUES (1,'Ceviches','Ceviches y entradas',0.00,5),(2,'Mojitos','Mojitos y cócteles',0.00,5),(3,'Promos','Promociones especiales',0.00,0);
/*!40000 ALTER TABLE `categoria` ENABLE KEYS */;
UNLOCK TABLES;


-- ------------------------------------------------------------
-- primitivos_drinks_configuracion
-- ------------------------------------------------------------

--
-- Table structure for table `configuracion`
--

DROP TABLE IF EXISTS `configuracion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion`
--

LOCK TABLES `configuracion` WRITE;
/*!40000 ALTER TABLE `configuracion` DISABLE KEYS */;
INSERT INTO `configuracion` VALUES (1,'Primitivos Drinks','','','https://res.cloudinary.com/dinhrwram/image/upload/v1784774189/ChatGPT_Image_22_jul_2026_09_58_39_p.m._xjwwuq.png',NULL,NULL,'https://www.instagram.com/primitivos.cl/',NULL,'+56 9 6628 7725',NULL,'Primitivos Drinks','Ceviches, mojitos y delivery a domicilio.','https://res.cloudinary.com/dinhrwram/image/upload/v1784771943/ChatGPT_Image_22_jul_2026_09_58_24_p.m._rf4mcf.png','https://res.cloudinary.com/dinhrwram/image/upload/v1784781306/bannersimiomovi1l_mrg6bo.png',NULL,NULL,NULL,'Nuestra Carta','Productos','Explora el menú y pide por WhatsApp con delivery a domicilio.','BENJAMIN ISAIAS VALENZUELA UBILLA','20959187-1',NULL,'vista','111120959187','Tenpo');
/*!40000 ALTER TABLE `configuracion` ENABLE KEYS */;
UNLOCK TABLES;


-- ------------------------------------------------------------
-- primitivos_drinks_configuracion_horario
-- ------------------------------------------------------------

--
-- Table structure for table `configuracion_horario`
--

DROP TABLE IF EXISTS `configuracion_horario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracion_horario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dia_semana` tinyint NOT NULL COMMENT '0=domingo ... 6=sabado',
  `hora_apertura` time NOT NULL,
  `hora_cierre` time NOT NULL,
  `abierto` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dia_semana` (`dia_semana`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion_horario`
--

LOCK TABLES `configuracion_horario` WRITE;
/*!40000 ALTER TABLE `configuracion_horario` DISABLE KEYS */;
INSERT INTO `configuracion_horario` VALUES (36,0,'18:00:00','23:00:00',0,'2026-07-26 02:16:42','2026-07-26 02:16:42'),(37,1,'18:00:00','00:00:00',1,'2026-07-26 02:16:42','2026-07-26 02:16:42'),(38,2,'18:00:00','00:00:00',1,'2026-07-26 02:16:42','2026-07-26 02:16:42'),(39,3,'18:00:00','00:00:00',1,'2026-07-26 02:16:42','2026-07-26 02:16:42'),(40,4,'18:00:00','00:00:00',1,'2026-07-26 02:16:42','2026-07-26 02:16:42'),(41,5,'18:00:00','00:00:00',1,'2026-07-26 02:16:42','2026-07-26 02:16:42'),(42,6,'18:00:00','00:00:00',1,'2026-07-26 02:16:42','2026-07-26 02:16:42');
/*!40000 ALTER TABLE `configuracion_horario` ENABLE KEYS */;
UNLOCK TABLES;


-- ------------------------------------------------------------
-- primitivos_drinks_delivery_zona
-- ------------------------------------------------------------

--
-- Table structure for table `delivery_zona`
--

DROP TABLE IF EXISTS `delivery_zona`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delivery_zona` (
  `id` int NOT NULL AUTO_INCREMENT,
  `comuna` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `costo` decimal(10,2) NOT NULL,
  `tiempo_estimado` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `comuna` (`comuna`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_zona`
--

LOCK TABLES `delivery_zona` WRITE;
/*!40000 ALTER TABLE `delivery_zona` DISABLE KEYS */;
INSERT INTO `delivery_zona` VALUES (1,'Concepción',2000.00,'30-45 min',1,'2026-07-23 01:42:40','2026-07-23 01:42:40'),(2,'Hualpén',2000.00,'30-45 min',1,'2026-07-23 01:42:40','2026-07-23 01:42:40'),(3,'Talcahuano',3000.00,'35-50 min',1,'2026-07-23 01:42:40','2026-07-23 01:42:40'),(4,'San Pedro',3000.00,'35-50 min',1,'2026-07-23 01:42:40','2026-07-23 01:42:40');
/*!40000 ALTER TABLE `delivery_zona` ENABLE KEYS */;
UNLOCK TABLES;


-- ------------------------------------------------------------
-- primitivos_drinks_ingrediente_extra
-- ------------------------------------------------------------

--
-- Table structure for table `ingrediente_extra`
--

DROP TABLE IF EXISTS `ingrediente_extra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingrediente_extra` (
  `id_ingrediente_extra` int NOT NULL AUTO_INCREMENT,
  `nom_ingrediente` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `precio_extra` decimal(10,2) NOT NULL DEFAULT '0.00',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_ingrediente_extra`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ingrediente_extra`
--

LOCK TABLES `ingrediente_extra` WRITE;
/*!40000 ALTER TABLE `ingrediente_extra` DISABLE KEYS */;
/*!40000 ALTER TABLE `ingrediente_extra` ENABLE KEYS */;
UNLOCK TABLES;


-- ------------------------------------------------------------
-- primitivos_drinks_producto
-- ------------------------------------------------------------

--
-- Table structure for table `producto`
--

DROP TABLE IF EXISTS `producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  `tipo_variante` enum('sabor','presentacion') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'sabor',
  `mostrar_imagen_variantes` tinyint(1) NOT NULL DEFAULT '0',
  `max_sabores` tinyint unsigned NOT NULL DEFAULT '1',
  `promo_cantidad` tinyint unsigned DEFAULT NULL,
  `promo_origen_id` int DEFAULT NULL,
  PRIMARY KEY (`id_producto`),
  UNIQUE KEY `producto_categoria_nombre_unique` (`categoria_id`,`nom_producto`),
  KEY `producto_categoria_id_idx` (`categoria_id`),
  KEY `producto_promo_origen_fkey` (`promo_origen_id`),
  CONSTRAINT `producto_categoria_id_fkey` FOREIGN KEY (`categoria_id`) REFERENCES `categoria` (`id_categoria`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `producto_promo_origen_fkey` FOREIGN KEY (`promo_origen_id`) REFERENCES `producto` (`id_producto`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto`
--

LOCK TABLES `producto` WRITE;
/*!40000 ALTER TABLE `producto` DISABLE KEYS */;
INSERT INTO `producto` VALUES (1,'Ceviche de Salmón',NULL,NULL,50,5,'Salmón fresco, morrón rojo, cebolla morada, choclo, choclo peruano, cilantro y palta.','https://res.cloudinary.com/dinhrwram/image/upload/v1785012265/ChatGPT_Image_25_jul_2026_04_44_04_p.m._mvjnh3.png',1,'[\"Fresco\", \"Natural\", \"Preparado al momento\"]','','',1,'presentacion',0,1,NULL,NULL),(2,'Ceviche de Macha',NULL,NULL,50,5,'Macha fresca, morrón rojo, cebolla morada, choclo, choclo peruano, cilantro y palta.','https://res.cloudinary.com/dinhrwram/image/upload/v1785011447/ChatGPT_Image_25_jul_2026_04_30_41_p.m._qbwysj.png',1,'[\"Fresco\", \"Natural\", \"Preparado al momento\"]','','',1,'presentacion',0,1,NULL,NULL),(3,'Mojito Sabores',NULL,NULL,80,5,'Mojilitro de 1 litro. Elige tu sabor favorito.','https://res.cloudinary.com/dinhrwram/image/upload/v1784953718/ChatGPT_Image_25_jul_2026_12_28_13_a.m._unqx7z.png',2,'[\"1 litro\", \"A elección\"]','','',1,'sabor',0,1,NULL,NULL),(4,'Mojitos Zero',8000,NULL,40,5,'Mojito zero azúcar. Sabor a elección.','https://res.cloudinary.com/dinhrwram/image/upload/v1785010466/ChatGPT_Image_25_jul_2026_04_14_02_p.m._sllsxe.png',2,'[\"Zero\", \"Sabor a elección\"]','','',0,'sabor',0,1,NULL,NULL),(5,'Mojito Aperol',9000,NULL,30,5,'Mojito especial con Aperol.','https://res.cloudinary.com/dinhrwram/image/upload/v1785002604/ChatGPT_Image_25_jul_2026_02_03_06_p.m._cmqqyd.png',2,'[\"Especial\"]','','',0,'sabor',0,1,NULL,NULL),(7,'Mojito Jagger',9000,NULL,30,5,'Mojito especial con Jägermeister.','https://res.cloudinary.com/dinhrwram/image/upload/v1785003760/ChatGPT_Image_25_jul_2026_02_22_34_p.m._ykifg5.png',2,'[\"Especial\"]','','',0,'sabor',0,1,NULL,NULL),(8,'Mojito Ramazzotti',9000,NULL,30,5,'Mojito especial con Ramazzotti.','https://res.cloudinary.com/dinhrwram/image/upload/v1785002852/ChatGPT_Image_25_jul_2026_02_07_27_p.m._qvk9uw.png',2,'[\"Especial\"]','','',0,'sabor',0,1,NULL,NULL),(9,'Promo 2 Mojitos Sabores',15000,NULL,40,3,'2 Mojitos Sabores a precio promo. Sabores a elección.','https://res.cloudinary.com/dinhrwram/image/upload/v1784954225/ChatGPT_Image_25_jul_2026_12_36_49_a.m._hyw9ty.png',3,'[\"Promo\", \"2x\"]','','',0,'sabor',0,1,2,3),(10,'Promo 3 Mojitos Sabores',20000,NULL,40,3,'3 Mojitos Sabores a precio promo. Sabores a elección.','https://res.cloudinary.com/dinhrwram/image/upload/v1784954053/ChatGPT_Image_25_jul_2026_12_31_59_a.m._t6lqyc.png',3,'[\"Promo\", \"3x\"]','','',0,'sabor',0,1,3,3),(11,'Promo 4 Mojitos Sabores',26000,NULL,40,3,'4 Mojitos Sabores a precio promo. Sabores a elección.','https://res.cloudinary.com/dinhrwram/image/upload/v1784954801/ChatGPT_Image_25_jul_2026_12_46_34_a.m._a320lq.png',3,'[\"Promo\", \"4x\"]','','',0,'sabor',0,1,4,3);
/*!40000 ALTER TABLE `producto` ENABLE KEYS */;
UNLOCK TABLES;


-- ------------------------------------------------------------
-- primitivos_drinks_producto_variantes
-- ------------------------------------------------------------

--
-- Table structure for table `producto_variantes`
--

DROP TABLE IF EXISTS `producto_variantes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `producto_variantes` (
  `id_variante` int NOT NULL AUTO_INCREMENT,
  `producto_id` int DEFAULT NULL,
  `nombre_variante` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `precio` int NOT NULL,
  `stock` int DEFAULT '0',
  `img_variante` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id_variante`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `producto_variantes_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `producto` (`id_producto`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto_variantes`
--

LOCK TABLES `producto_variantes` WRITE;
/*!40000 ALTER TABLE `producto_variantes` DISABLE KEYS */;
INSERT INTO `producto_variantes` VALUES (1,1,'250 g',4000,20,NULL),(2,1,'350 g',6000,20,NULL),(3,1,'500 g',8000,20,NULL),(4,1,'1 kilo',16000,15,NULL),(5,2,'250 g',4000,20,NULL),(6,2,'350 g',6000,20,NULL),(7,2,'500 g',8000,20,NULL),(8,2,'1 kilo',16000,15,NULL),(9,3,'Arándano',8500,20,NULL),(10,3,'Frambuesa',8500,20,NULL),(11,3,'Frutilla',8500,20,NULL),(12,3,'Mango',8500,20,NULL),(13,3,'Maracuyá',8500,20,NULL),(14,3,'Mix de Berries',8500,20,NULL),(15,3,'Papaya',8500,20,NULL),(16,3,'Piña',8500,20,NULL),(17,3,'Tradicional',8500,20,NULL);
/*!40000 ALTER TABLE `producto_variantes` ENABLE KEYS */;
UNLOCK TABLES;


-- ------------------------------------------------------------
-- primitivos_drinks_cupon
-- ------------------------------------------------------------

--
-- Table structure for table `cupon`
--

DROP TABLE IF EXISTS `cupon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cupon`
--

LOCK TABLES `cupon` WRITE;
/*!40000 ALTER TABLE `cupon` DISABLE KEYS */;
INSERT INTO `cupon` VALUES (1,'PROMO10','10% de descuento en tu pedido','porcentaje_pedido',10.00,15000.00,0,1,NULL,NULL),(2,'ENVIOGRATIS','Envío gratis en pedidos elegibles','envio_gratis',0.00,25000.00,1,1,NULL,NULL);
/*!40000 ALTER TABLE `cupon` ENABLE KEYS */;
UNLOCK TABLES;


-- ------------------------------------------------------------
-- primitivos_drinks_cupon_categoria
-- ------------------------------------------------------------

--
-- Table structure for table `cupon_categoria`
--

DROP TABLE IF EXISTS `cupon_categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cupon_categoria` (
  `cupon_id` int NOT NULL,
  `categoria_id` int NOT NULL,
  PRIMARY KEY (`cupon_id`,`categoria_id`),
  KEY `cc_categoria_idx` (`categoria_id`),
  CONSTRAINT `cc_categoria_fkey` FOREIGN KEY (`categoria_id`) REFERENCES `categoria` (`id_categoria`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cc_cupon_fkey` FOREIGN KEY (`cupon_id`) REFERENCES `cupon` (`id_cupon`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cupon_categoria`
--

LOCK TABLES `cupon_categoria` WRITE;
/*!40000 ALTER TABLE `cupon_categoria` DISABLE KEYS */;
/*!40000 ALTER TABLE `cupon_categoria` ENABLE KEYS */;
UNLOCK TABLES;


-- ------------------------------------------------------------
-- primitivos_drinks_cupon_producto
-- ------------------------------------------------------------

--
-- Table structure for table `cupon_producto`
--

DROP TABLE IF EXISTS `cupon_producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cupon_producto` (
  `cupon_id` int NOT NULL,
  `producto_id` int NOT NULL,
  PRIMARY KEY (`cupon_id`,`producto_id`),
  KEY `cp_producto_idx` (`producto_id`),
  CONSTRAINT `cp_cupon_fkey` FOREIGN KEY (`cupon_id`) REFERENCES `cupon` (`id_cupon`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cp_producto_fkey` FOREIGN KEY (`producto_id`) REFERENCES `producto` (`id_producto`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cupon_producto`
--

LOCK TABLES `cupon_producto` WRITE;
/*!40000 ALTER TABLE `cupon_producto` DISABLE KEYS */;
/*!40000 ALTER TABLE `cupon_producto` ENABLE KEYS */;
UNLOCK TABLES;


SET FOREIGN_KEY_CHECKS = 1;
SET UNIQUE_CHECKS = 1;

-- Fin dump producción Primitivos Drinks
