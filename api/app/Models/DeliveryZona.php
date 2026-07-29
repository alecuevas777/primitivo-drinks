<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;
use PDO;

class DeliveryZona
{
    public static function all(): array
    {
        $db = Database::connect();

        $stmt = $db->query(
            'SELECT * FROM delivery_zona ORDER BY comuna ASC'
        );

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function active(): array
    {
        $db = Database::connect();

        $stmt = $db->query(
            'SELECT * FROM delivery_zona WHERE activo = 1 ORDER BY comuna ASC'
        );

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function find(int $id): array|false
    {
        $db = Database::connect();

        $stmt = $db->prepare('SELECT * FROM delivery_zona WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public static function create(array $data): int
    {
        $db = Database::connect();

        $stmt = $db->prepare(
            'INSERT INTO delivery_zona (comuna, costo, tiempo_estimado, activo)
             VALUES (:comuna, :costo, :tiempo_estimado, :activo)'
        );

        $stmt->execute(self::bindValues($data));

        return (int) $db->lastInsertId();
    }

    public static function update(int $id, array $data): bool
    {
        $db = Database::connect();

        $stmt = $db->prepare(
            'UPDATE delivery_zona SET
                comuna = :comuna,
                costo = :costo,
                tiempo_estimado = :tiempo_estimado,
                activo = :activo
             WHERE id = :id'
        );

        return $stmt->execute([
            'id'               => $id,
            ...self::bindValues($data),
        ]);
    }

    public static function delete(int $id): bool
    {
        $db = Database::connect();

        $stmt = $db->prepare('DELETE FROM delivery_zona WHERE id = :id');

        return $stmt->execute(['id' => $id]);
    }

    /** @return array<string, mixed> */
    private static function bindValues(array $data): array
    {
        return [
            'comuna'           => trim((string) ($data['comuna'] ?? '')),
            'costo'            => (float) ($data['costo'] ?? 0),
            'tiempo_estimado'  => self::nullableString($data['tiempo_estimado'] ?? null),
            'activo'           => !empty($data['activo']) ? 1 : 0,
        ];
    }

    private static function nullableString(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        return trim((string) $value);
    }
}
