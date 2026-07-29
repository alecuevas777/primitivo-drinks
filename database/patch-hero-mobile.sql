-- Parche: imagen hero móvil (banner responsive)
USE `primitivos_drinks`;

ALTER TABLE `configuracion`
  ADD COLUMN `imagen_hero_mobile` text COLLATE utf8mb4_unicode_ci DEFAULT NULL
  AFTER `imagen_hero`;

UPDATE `configuracion`
SET `imagen_hero_mobile` = 'https://res.cloudinary.com/dinhrwram/image/upload/v1783134210/bannermovil_udm7zm.png'
WHERE `id_configuracion` = 1 AND (`imagen_hero_mobile` IS NULL OR `imagen_hero_mobile` = '');
