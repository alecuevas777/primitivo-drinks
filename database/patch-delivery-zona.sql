USE `primitivos_drinks`;

CREATE TABLE IF NOT EXISTS delivery_zona (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comuna VARCHAR(100) NOT NULL,
    costo DECIMAL(10,2) NOT NULL,
    tiempo_estimado VARCHAR(50) DEFAULT NULL,
    activo TINYINT(1) DEFAULT 1,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (comuna)
);

INSERT INTO delivery_zona (comuna, costo, tiempo_estimado)
VALUES
('Lomas Coloradas', 3000, '30-45 min'),
('Coronel', 2000, '20-35 min'),
('Lota', 2500, '25-40 min')
ON DUPLICATE KEY UPDATE
    costo = VALUES(costo),
    tiempo_estimado = VALUES(tiempo_estimado);
