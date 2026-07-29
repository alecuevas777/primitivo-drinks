-- Corrige horarios duplicados (todos en Domingo)
USE `primitivos_drinks`;

DELETE FROM `configuracion_horario`;

INSERT INTO `configuracion_horario` (`dia_semana`, `hora_apertura`, `hora_cierre`, `abierto`) VALUES
  (0, '18:00:00', '23:00:00', 1),
  (1, '18:00:00', '23:00:00', 1),
  (2, '18:00:00', '23:00:00', 1),
  (3, '18:00:00', '23:00:00', 1),
  (4, '18:00:00', '23:00:00', 1),
  (5, '18:00:00', '23:00:00', 1),
  (6, '18:00:00', '23:00:00', 1);
