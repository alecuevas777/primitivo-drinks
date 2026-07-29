<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;
use PDO;

class IngredienteExtra
{
    public static function all(): array
    {
        $db = Database::connect();

        $stmt = $db->query(
            'SELECT * FROM ingrediente_extra ORDER BY nom_ingrediente ASC'
        );

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function active(): array
    {
        $db = Database::connect();

        $stmt = $db->query(
            'SELECT * FROM ingrediente_extra WHERE activo = 1 ORDER BY nom_ingrediente ASC'
        );

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function find(int $id): array|false
    {
        $db = Database::connect();

        $stmt = $db->prepare(
            'SELECT * FROM ingrediente_extra WHERE id_ingrediente_extra = :id LIMIT 1'
        );
        $stmt->execute(['id' => $id]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public static function create(array $data): int
    {
        $db = Database::connect();

        $stmt = $db->prepare(
            'INSERT INTO ingrediente_extra (nom_ingrediente, precio_extra, activo)
             VALUES (:nom_ingrediente, :precio_extra, :activo)'
        );

        $stmt->execute(self::bindValues($data));

        return (int) $db->lastInsertId();
    }

    public static function update(int $id, array $data): bool
    {
        $db = Database::connect();

        $stmt = $db->prepare(
            'UPDATE ingrediente_extra SET
                nom_ingrediente = :nom_ingrediente,
                precio_extra = :precio_extra,
                activo = :activo
             WHERE id_ingrediente_extra = :id'
        );

        return $stmt->execute([
            'id' => $id,
            ...self::bindValues($data),
        ]);
    }

    public static function delete(int $id): bool
    {
        $db = Database::connect();

        $stmt = $db->prepare(
            'DELETE FROM ingrediente_extra WHERE id_ingrediente_extra = :id'
        );

        return $stmt->execute(['id' => $id]);
    }

    /** @return array<string, mixed> */
    private static function bindValues(array $data): array
    {
        return [
            'nom_ingrediente' => trim((string) ($data['nom_ingrediente'] ?? '')),
            'precio_extra'    => (float) ($data['precio_extra'] ?? 0),
            'activo'          => !empty($data['activo']) ? 1 : 0,
        ];
    }
}
