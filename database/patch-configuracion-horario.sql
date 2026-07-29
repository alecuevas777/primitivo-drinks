-- Parche: horarios de atención del negocio
USE `primitivos_drinks`;

CREATE TABLE IF NOT EXISTS `configuracion_horario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dia_semana` tinyint unsigned NOT NULL COMMENT '0=Domingo … 6=Sábado',
  `hora_apertura` time NOT NULL DEFAULT '18:00:00',
  `hora_cierre` time NOT NULL DEFAULT '23:00:00',
  `abierto` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `horario_dia_unique` (`dia_semana`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `configuracion_horario` (`dia_semana`, `hora_apertura`, `hora_cierre`, `abierto`) VALUES
  (0, '18:00:00', '23:00:00', 1),
  (1, '18:00:00', '23:00:00', 1),
  (2, '18:00:00', '23:00:00', 1),
  (3, '18:00:00', '23:00:00', 1),
  (4, '18:00:00', '23:00:00', 1),
  (5, '18:00:00', '23:00:00', 1),
  (6, '18:00:00', '23:00:00', 1)
ON DUPLICATE KEY UPDATE
  `hora_apertura` = VALUES(`hora_apertura`),
  `hora_cierre` = VALUES(`hora_cierre`),
  `abierto` = VALUES(`abierto`);
