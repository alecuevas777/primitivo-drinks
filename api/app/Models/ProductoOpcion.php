<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;
use PDO;

class ProductoOpcion
{
    public static function byGrupo(int $grupoId): array
    {
        $db = Database::connect();
        $stmt = $db->prepare(
            'SELECT id_opcion AS id, grupo_id, nombre_opcion, precio_extra, stock, img_opcion, orden
             FROM producto_opcion
             WHERE grupo_id = :grupo_id
             ORDER BY orden ASC, id_opcion ASC'
        );
        $stmt->execute(['grupo_id' => $grupoId]);

        return array_map([self::class, 'normalize'], $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /** @param array<int> $grupoIds @return array<int, array<int, array>> */
    public static function byGrupos(array $grupoIds): array
    {
        if (!$grupoIds) {
            return [];
        }

        $db = Database::connect();
        $placeholders = implode(',', array_fill(0, count($grupoIds), '?'));
        $stmt = $db->prepare(
            "SELECT id_opcion AS id, grupo_id, nombre_opcion, precio_extra, stock, img_opcion, orden
             FROM producto_opcion
             WHERE grupo_id IN ($placeholders)
             ORDER BY orden ASC, id_opcion ASC"
        );
        $stmt->execute(array_values($grupoIds));

        $map = [];
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $normalized = self::normalize($row);
            $map[(int) $normalized['grupo_id']][] = $normalized;
        }

        return $map;
    }

    public static function find(int $id): ?array
    {
        $db = Database::connect();
        $stmt = $db->prepare(
            'SELECT id_opcion AS id, grupo_id, nombre_opcion, precio_extra, stock, img_opcion, orden
             FROM producto_opcion
             WHERE id_opcion = :id
             LIMIT 1'
        );
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row ? self::normalize($row) : null;
    }

    public static function create(array $data): int
    {
        $db = Database::connect();
        $stmt = $db->prepare(
            'INSERT INTO producto_opcion (grupo_id, nombre_opcion, precio_extra, stock, img_opcion, orden)
             VALUES (:grupo_id, :nombre_opcion, :precio_extra, :stock, :img_opcion, :orden)'
        );
        $stmt->execute([
            'grupo_id' => (int) $data['grupo_id'],
            'nombre_opcion' => trim((string) $data['nombre_opcion']),
            'precio_extra' => (int) ($data['precio_extra'] ?? 0),
            'stock' => array_key_exists('stock', $data) && $data['stock'] !== null && $data['stock'] !== ''
                ? (int) $data['stock']
                : null,
            'img_opcion' => trim((string) ($data['img_opcion'] ?? '')) ?: null,
            'orden' => (int) ($data['orden'] ?? 0),
        ]);

        return (int) $db->lastInsertId();
    }

    public static function update(int $id, array $data): bool
    {
        $db = Database::connect();
        $stmt = $db->prepare(
            'UPDATE producto_opcion SET
                nombre_opcion = :nombre_opcion,
                precio_extra = :precio_extra,
                stock = :stock,
                img_opcion = :img_opcion,
                orden = :orden
             WHERE id_opcion = :id'
        );

        return $stmt->execute([
            'id' => $id,
            'nombre_opcion' => trim((string) $data['nombre_opcion']),
            'precio_extra' => (int) ($data['precio_extra'] ?? 0),
            'stock' => array_key_exists('stock', $data) && $data['stock'] !== null && $data['stock'] !== ''
                ? (int) $data['stock']
                : null,
            'img_opcion' => trim((string) ($data['img_opcion'] ?? '')) ?: null,
            'orden' => (int) ($data['orden'] ?? 0),
        ]);
    }

    public static function delete(int $id): bool
    {
        $db = Database::connect();
        $stmt = $db->prepare('DELETE FROM producto_opcion WHERE id_opcion = :id');

        return $stmt->execute(['id' => $id]);
    }

    private static function normalize(array $row): array
    {
        $row['id'] = (int) $row['id'];
        $row['grupo_id'] = (int) $row['grupo_id'];
        $row['precio_extra'] = (int) ($row['precio_extra'] ?? 0);
        $row['stock'] = $row['stock'] !== null ? (int) $row['stock'] : null;
        $row['orden'] = (int) ($row['orden'] ?? 0);
        $row['img_opcion'] = $row['img_opcion'] ?: null;

        return $row;
    }
}
