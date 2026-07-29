<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;
use PDO;

class ProductoVariante
{
    private static ?bool $hasImageColumn = null;

    private static function hasImageColumn(): bool
    {
        if (self::$hasImageColumn !== null) {
            return self::$hasImageColumn;
        }

        $db = Database::connect();
        $stmt = $db->query("SHOW COLUMNS FROM producto_variantes LIKE 'img_variante'");
        self::$hasImageColumn = (bool) $stmt->fetch();

        return self::$hasImageColumn;
    }

    private static function selectColumns(): string
    {
        return self::hasImageColumn()
            ? 'id_variante AS id, producto_id, nombre_variante, precio, stock, img_variante'
            : 'id_variante AS id, producto_id, nombre_variante, precio, stock';
    }

    public static function byProducto(int $productoId): array
    {
        $db = Database::connect();

        $stmt = $db->prepare(
            'SELECT ' . self::selectColumns() . '
             FROM producto_variantes
             WHERE producto_id = :producto_id
             ORDER BY id_variante ASC'
        );
        $stmt->execute(['producto_id' => $productoId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Variantes agrupadas por producto (una sola consulta para listados).
     *
     * @param int[] $productoIds
     * @return array<int, array<int, array<string, mixed>>>
     */
    public static function byProductos(array $productoIds): array
    {
        $productoIds = array_values(array_unique(array_filter(array_map('intval', $productoIds))));

        if (!$productoIds) {
            return [];
        }

        $db = Database::connect();
        $placeholders = implode(',', array_fill(0, count($productoIds), '?'));

        $stmt = $db->prepare(
            'SELECT ' . self::selectColumns() . '
             FROM producto_variantes
             WHERE producto_id IN (' . $placeholders . ')
             ORDER BY producto_id ASC, id_variante ASC'
        );
        $stmt->execute($productoIds);

        $grouped = [];

        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $productoId = (int) $row['producto_id'];
            $grouped[$productoId][] = $row;
        }

        return $grouped;
    }

    public static function find(int $id): array|false
    {
        $db = Database::connect();

        $stmt = $db->prepare(
            'SELECT ' . self::selectColumns() . '
             FROM producto_variantes
             WHERE id_variante = :id
             LIMIT 1'
        );
        $stmt->execute(['id' => $id]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public static function create(array $data): int
    {
        $db = Database::connect();

        if (self::hasImageColumn()) {
            $stmt = $db->prepare(
                'INSERT INTO producto_variantes (producto_id, nombre_variante, precio, stock, img_variante)
                 VALUES (:producto_id, :nombre_variante, :precio, :stock, :img_variante)'
            );

            $stmt->execute([
                'producto_id'      => $data['producto_id'],
                'nombre_variante'  => $data['nombre_variante'],
                'precio'           => $data['precio'],
                'stock'            => $data['stock'] ?? null,
                'img_variante'     => $data['img_variante'] ?? null,
            ]);
        } else {
            $stmt = $db->prepare(
                'INSERT INTO producto_variantes (producto_id, nombre_variante, precio, stock)
                 VALUES (:producto_id, :nombre_variante, :precio, :stock)'
            );

            $stmt->execute([
                'producto_id'      => $data['producto_id'],
                'nombre_variante'  => $data['nombre_variante'],
                'precio'           => $data['precio'],
                'stock'            => $data['stock'] ?? null,
            ]);
        }

        return (int) $db->lastInsertId();
    }

    public static function update(int $id, array $data): bool
    {
        $db = Database::connect();

        if (self::hasImageColumn()) {
            $stmt = $db->prepare(
                'UPDATE producto_variantes SET
                    nombre_variante = :nombre_variante,
                    precio = :precio,
                    stock = :stock,
                    img_variante = :img_variante
                 WHERE id_variante = :id'
            );

            return $stmt->execute([
                'id'               => $id,
                'nombre_variante'  => $data['nombre_variante'],
                'precio'           => $data['precio'],
                'stock'            => $data['stock'] ?? null,
                'img_variante'     => $data['img_variante'] ?? null,
            ]);
        }

        $stmt = $db->prepare(
            'UPDATE producto_variantes SET
                nombre_variante = :nombre_variante,
                precio = :precio,
                stock = :stock
             WHERE id_variante = :id'
        );

        return $stmt->execute([
            'id'               => $id,
            'nombre_variante'  => $data['nombre_variante'],
            'precio'           => $data['precio'],
            'stock'            => $data['stock'] ?? null,
        ]);
    }

    public static function delete(int $id): bool
    {
        $db = Database::connect();

        $stmt = $db->prepare('DELETE FROM producto_variantes WHERE id_variante = :id');

        return $stmt->execute(['id' => $id]);
    }

    public static function minPrecio(int $productoId): ?float
    {
        $db = Database::connect();

        $stmt = $db->prepare(
            'SELECT MIN(precio) AS min_precio
             FROM producto_variantes
             WHERE producto_id = :producto_id'
        );
        $stmt->execute(['producto_id' => $productoId]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return isset($row['min_precio']) ? (float) $row['min_precio'] : null;
    }
}
