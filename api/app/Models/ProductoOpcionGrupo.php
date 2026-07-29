<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;
use PDO;

class ProductoOpcionGrupo
{
    public static function byProducto(int $productoId): array
    {
        $db = Database::connect();

        $stmt = $db->prepare(
            'SELECT id_grupo AS id, producto_id, nombre, min_seleccion, max_seleccion, orden
             FROM producto_opcion_grupo
             WHERE producto_id = :producto_id
             ORDER BY orden ASC, id_grupo ASC'
        );
        $stmt->execute(['producto_id' => $productoId]);
        $grupos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (!$grupos) {
            return [];
        }

        $ids = array_map(static fn ($g) => (int) $g['id'], $grupos);
        $opcionesByGrupo = ProductoOpcion::byGrupos($ids);

        foreach ($grupos as &$grupo) {
            $grupo['min_seleccion'] = (int) $grupo['min_seleccion'];
            $grupo['max_seleccion'] = (int) $grupo['max_seleccion'];
            $grupo['orden'] = (int) $grupo['orden'];
            $grupo['opciones'] = $opcionesByGrupo[(int) $grupo['id']] ?? [];
        }
        unset($grupo);

        return $grupos;
    }

    /** @param array<int> $productoIds */
    public static function byProductos(array $productoIds): array
    {
        if (!$productoIds) {
            return [];
        }

        $db = Database::connect();
        $placeholders = implode(',', array_fill(0, count($productoIds), '?'));

        $stmt = $db->prepare(
            "SELECT id_grupo AS id, producto_id, nombre, min_seleccion, max_seleccion, orden
             FROM producto_opcion_grupo
             WHERE producto_id IN ($placeholders)
             ORDER BY orden ASC, id_grupo ASC"
        );
        $stmt->execute(array_values($productoIds));
        $grupos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (!$grupos) {
            return [];
        }

        $ids = array_map(static fn ($g) => (int) $g['id'], $grupos);
        $opcionesByGrupo = ProductoOpcion::byGrupos($ids);

        $map = [];
        foreach ($grupos as $grupo) {
            $productoId = (int) $grupo['producto_id'];
            $grupo['min_seleccion'] = (int) $grupo['min_seleccion'];
            $grupo['max_seleccion'] = (int) $grupo['max_seleccion'];
            $grupo['orden'] = (int) $grupo['orden'];
            $grupo['opciones'] = $opcionesByGrupo[(int) $grupo['id']] ?? [];
            $map[$productoId][] = $grupo;
        }

        return $map;
    }

    public static function find(int $id): ?array
    {
        $db = Database::connect();
        $stmt = $db->prepare(
            'SELECT id_grupo AS id, producto_id, nombre, min_seleccion, max_seleccion, orden
             FROM producto_opcion_grupo
             WHERE id_grupo = :id
             LIMIT 1'
        );
        $stmt->execute(['id' => $id]);
        $grupo = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$grupo) {
            return null;
        }

        $grupo['min_seleccion'] = (int) $grupo['min_seleccion'];
        $grupo['max_seleccion'] = (int) $grupo['max_seleccion'];
        $grupo['orden'] = (int) $grupo['orden'];
        $grupo['opciones'] = ProductoOpcion::byGrupo((int) $grupo['id']);

        return $grupo;
    }

    public static function create(array $data): int
    {
        $db = Database::connect();
        $stmt = $db->prepare(
            'INSERT INTO producto_opcion_grupo (producto_id, nombre, min_seleccion, max_seleccion, orden)
             VALUES (:producto_id, :nombre, :min_seleccion, :max_seleccion, :orden)'
        );
        $stmt->execute([
            'producto_id' => (int) $data['producto_id'],
            'nombre' => trim((string) $data['nombre']),
            'min_seleccion' => max(0, min(5, (int) ($data['min_seleccion'] ?? 1))),
            'max_seleccion' => max(1, min(5, (int) ($data['max_seleccion'] ?? 1))),
            'orden' => (int) ($data['orden'] ?? 0),
        ]);

        return (int) $db->lastInsertId();
    }

    public static function update(int $id, array $data): bool
    {
        $db = Database::connect();
        $stmt = $db->prepare(
            'UPDATE producto_opcion_grupo SET
                nombre = :nombre,
                min_seleccion = :min_seleccion,
                max_seleccion = :max_seleccion,
                orden = :orden
             WHERE id_grupo = :id'
        );

        return $stmt->execute([
            'id' => $id,
            'nombre' => trim((string) $data['nombre']),
            'min_seleccion' => max(0, min(5, (int) ($data['min_seleccion'] ?? 1))),
            'max_seleccion' => max(1, min(5, (int) ($data['max_seleccion'] ?? 1))),
            'orden' => (int) ($data['orden'] ?? 0),
        ]);
    }

    public static function delete(int $id): bool
    {
        $db = Database::connect();
        $stmt = $db->prepare('DELETE FROM producto_opcion_grupo WHERE id_grupo = :id');

        return $stmt->execute(['id' => $id]);
    }
}
