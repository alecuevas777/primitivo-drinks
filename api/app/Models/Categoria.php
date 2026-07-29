<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;
use PDO;

class Categoria
{
    public static function all(): array
    {
        $db = Database::connect();

        $stmt = $db->query(
            'SELECT * FROM categoria
             ORDER BY nom_categoria ASC'
        );

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function find(int $id): array|false
    {
        $db = Database::connect();

        $stmt = $db->prepare('SELECT * FROM categoria WHERE id_categoria = :id LIMIT 1');
        $stmt->execute(['id' => $id]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public static function create(array $data): int
    {
        $db = Database::connect();

        $stmt = $db->prepare(
            'INSERT INTO categoria (nom_categoria, descripcion, descuento_porcentaje, aviso_stock_desde)
             VALUES (:nom_categoria, :descripcion, :descuento_porcentaje, :aviso_stock_desde)'
        );

        $stmt->execute([
            'nom_categoria'         => $data['nom_categoria'],
            'descripcion'           => $data['descripcion'] ?? null,
            'descuento_porcentaje'  => $data['descuento_porcentaje'] ?? 0,
            'aviso_stock_desde'     => $data['aviso_stock_desde'] ?? null,
        ]);

        return (int) $db->lastInsertId();
    }

    public static function update(int $id, array $data): bool
    {
        $db = Database::connect();

        $stmt = $db->prepare(
            'UPDATE categoria SET
                nom_categoria = :nom_categoria,
                descripcion = :descripcion,
                descuento_porcentaje = :descuento_porcentaje,
                aviso_stock_desde = :aviso_stock_desde
             WHERE id_categoria = :id'
        );

        return $stmt->execute([
            'id'                    => $id,
            'nom_categoria'         => $data['nom_categoria'],
            'descripcion'           => $data['descripcion'] ?? null,
            'descuento_porcentaje'  => $data['descuento_porcentaje'] ?? 0,
            'aviso_stock_desde'     => $data['aviso_stock_desde'] ?? null,
        ]);
    }

    public static function delete(int $id): bool
    {
        $db = Database::connect();

        $stmt = $db->prepare('DELETE FROM categoria WHERE id_categoria = :id');

        return $stmt->execute(['id' => $id]);
    }
}