-- Descuento global del sitio (aplica a precios y etiquetas del catálogo)
ALTER TABLE `configuracion`
  ADD COLUMN `descuento_porcentaje` decimal(5,2) DEFAULT NULL
  AFTER `delivery_gratis_desde`;
