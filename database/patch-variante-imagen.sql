-- Parche: imagen por variante de producto
USE `primitivos_drinks`;

ALTER TABLE `producto_variantes`
  ADD COLUMN `img_variante` text COLLATE utf8mb4_unicode_ci DEFAULT NULL
  AFTER `stock`;
