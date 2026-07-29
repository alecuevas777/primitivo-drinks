<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;
use PDO;

class ConfiguracionHorario
{
  private const DIAS = [0, 1, 2, 3, 4, 5, 6];

  /** Orden de visualización: Lunes → Domingo */
  private const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

    public static function all(): array
    {
        $db = Database::connect();
        $byDay = [];

        try {
            $stmt = $db->query(
                'SELECT id, dia_semana, hora_apertura, hora_cierre, abierto
                 FROM configuracion_horario
                 ORDER BY dia_semana ASC, id ASC'
            );

            foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
                $dia = (int) $row['dia_semana'];

                if ($dia >= 0 && $dia <= 6 && !isset($byDay[$dia])) {
                    $byDay[$dia] = self::normalize($row);
                }
            }
        } catch (\PDOException) {
            // Tabla aún no creada
        }

        return array_map(
            fn (int $dia) => $byDay[$dia] ?? self::defaultDay($dia),
            self::DISPLAY_ORDER
        );
    }

    public static function syncAll(array $horarios): void
    {
        $db = Database::connect();

        $db->exec('DELETE FROM configuracion_horario');

        $stmt = $db->prepare(
            'INSERT INTO configuracion_horario (dia_semana, hora_apertura, hora_cierre, abierto)
             VALUES (:dia_semana, :hora_apertura, :hora_cierre, :abierto)'
        );

        foreach (self::DIAS as $dia) {
            $row = self::findDayRow($horarios, $dia) ?? self::defaultDay($dia);

            $stmt->execute([
                'dia_semana'    => $dia,
                'hora_apertura' => self::normalizeTime((string) $row['hora_apertura']),
                'hora_cierre'   => self::normalizeTime((string) $row['hora_cierre']),
                'abierto'       => !empty($row['abierto']) ? 1 : 0,
            ]);
        }
    }

    private static function findDayRow(array $horarios, int $dia): ?array
    {
        foreach ($horarios as $row) {
            if ((int) ($row['dia_semana'] ?? -1) === $dia) {
                return $row;
            }
        }

        return null;
    }

    private static function defaults(): array
    {
        return array_map(fn (int $dia) => self::defaultDay($dia), self::DIAS);
    }

    private static function defaultDay(int $dia): array
    {
        return [
            'id'            => null,
            'dia_semana'    => $dia,
            'hora_apertura' => '18:00',
            'hora_cierre'   => '23:00',
            'abierto'       => 1,
        ];
    }

    private static function normalize(array $row): array
    {
        return [
            'id'            => isset($row['id']) ? (int) $row['id'] : null,
            'dia_semana'    => (int) $row['dia_semana'],
            'hora_apertura' => substr((string) $row['hora_apertura'], 0, 5),
            'hora_cierre'   => substr((string) $row['hora_cierre'], 0, 5),
            'abierto'       => (int) $row['abierto'],
        ];
    }

    private static function normalizeTime(string $time): string
    {
        $parts = explode(':', $time);

        return sprintf('%02d:%02d:00', (int) ($parts[0] ?? 0), (int) ($parts[1] ?? 0));
    }
}
