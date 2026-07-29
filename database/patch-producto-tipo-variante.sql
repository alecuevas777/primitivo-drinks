USE `primitivos_drinks`;

-- Tipo de variante: sabor (mojitos) | presentacion (ceviches)
ALTER TABLE `producto`
  ADD COLUMN `tipo_variante` ENUM('sabor', 'presentacion') NOT NULL DEFAULT 'sabor'
  AFTER `usa_variantes`;

-- Ceviches → presentación
UPDATE `producto`
SET `tipo_variante` = 'presentacion'
WHERE `usa_variantes` = 1
  AND (
    `nom_producto` LIKE '%Ceviche%'
    OR `categoria_id` = 1
  );

-- Mojitos con variantes → sabor
UPDATE `producto`
SET `tipo_variante` = 'sabor'
WHERE `usa_variantes` = 1
  AND `categoria_id` = 2;
