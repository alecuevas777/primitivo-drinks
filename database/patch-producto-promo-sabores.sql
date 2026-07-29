USE `primitivos_drinks`;

-- Promo pack: N unidades con sabor tomado de otro producto (ej. Mojito Sabores)
ALTER TABLE `producto`
  ADD COLUMN `promo_cantidad` tinyint unsigned DEFAULT NULL
    COMMENT 'Cantidad de unidades del pack (2,3,4)'
    AFTER `max_sabores`,
  ADD COLUMN `promo_origen_id` int DEFAULT NULL
    COMMENT 'Producto origen de sabores (ej. Mojito Sabores)'
    AFTER `promo_cantidad`;

ALTER TABLE `producto`
  ADD CONSTRAINT `producto_promo_origen_fkey`
    FOREIGN KEY (`promo_origen_id`) REFERENCES `producto` (`id_producto`)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- Configura promos existentes (ajusta ids si es necesario)
-- id 3 = Mojito Sabores
UPDATE `producto`
SET `promo_cantidad` = 2, `promo_origen_id` = 3
WHERE `nom_producto` LIKE 'Promo 2%';

UPDATE `producto`
SET `promo_cantidad` = 3, `promo_origen_id` = 3
WHERE `nom_producto` LIKE 'Promo 3%';

UPDATE `producto`
SET `promo_cantidad` = 4, `promo_origen_id` = 3
WHERE `nom_producto` LIKE 'Promo 4%';
