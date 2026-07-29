<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;
use PDO;

class Producto
{
    private static function normalizeTextField(string $value): string
    {
        $value = trim($value);

        if ($value === '' || $value === '{}' || $value === '[]' || $value === 'null') {
            return '';
        }

        return $value;
    }

    private static function normalizeTipoVariante(array $data): string
    {
        return (($data['tipo_variante'] ?? '') === 'presentacion') ? 'presentacion' : 'sabor';
    }

    private static function normalizeMaxSabores(array $data): int
    {
        // Presentaciones: normalmente se elige una sola
        if (self::normalizeTipoVariante($data) === 'presentacion') {
            return 1;
        }

        $max = (int) ($data['max_sabores'] ?? 1);

        return max(1, min(2, $max));
    }

    private static function normalizePromoCantidad(array $data): ?int
    {
        $cantidad = isset($data['promo_cantidad']) ? (int) $data['promo_cantidad'] : 0;

        if ($cantidad < 2) {
            return null;
        }

        return min(10, $cantidad);
    }

    private static function normalizePromoOrigenId(array $data): ?int
    {
        $origen = isset($data['promo_origen_id']) ? (int) $data['promo_origen_id'] : 0;

        return $origen > 0 ? $origen : null;
    }

    private static function isPromoSabores(array $producto): bool
    {
        return (int) ($producto['promo_cantidad'] ?? 0) >= 2
            && (int) ($producto['promo_origen_id'] ?? 0) > 0;
    }

    private static function attachVariantes(array $producto): array
    {
        if (self::isPromoSabores($producto)) {
            $origenId = (int) $producto['promo_origen_id'];
            $producto['variantes'] = ProductoVariante::byProducto($origenId);
            $producto['precio_desde'] = $producto['precio_producto'] != null
                ? (float) $producto['precio_producto']
                : null;
            $producto['max_sabores'] = 1;
            $producto['tipo_variante'] = 'sabor';
            $producto['grupos_opcion'] = [];
        } elseif (!empty($producto['usa_grupos_opcion'])) {
            $producto['variantes'] = [];
            $producto['max_sabores'] = 1;
            $producto['grupos_opcion'] = ProductoOpcionGrupo::byProducto((int) $producto['id_producto']);
            $producto['precio_desde'] = $producto['precio_producto'] != null
                ? (float) $producto['precio_producto']
                : null;
        } elseif (!empty($producto['usa_variantes'])) {
            $producto['variantes'] = ProductoVariante::byProducto((int) $producto['id_producto']);
            $producto['precio_desde'] = ProductoVariante::minPrecio((int) $producto['id_producto']);
            $producto['max_sabores'] = self::normalizeMaxSabores($producto);
            $producto['grupos_opcion'] = [];
        } else {
            $producto['variantes'] = [];
            $producto['max_sabores'] = 1;
            $producto['grupos_opcion'] = [];
        }

        $producto['usa_grupos_opcion'] = !empty($producto['usa_grupos_opcion']) ? 1 : 0;
        $producto['presentacion'] = self::normalizeTextField((string) ($producto['presentacion'] ?? ''));
        $producto['detalles'] = self::normalizeTextField((string) ($producto['detalles'] ?? ''));

        return $producto;
    }

    /**
     * @param array<int, array<string, mixed>> $rows
     * @return array<int, array<string, mixed>>
     */
    private static function attachVariantesBatch(array $rows): array
    {
        $idsWithVariantes = [];
        $idsWithGrupos = [];

        foreach ($rows as $row) {
            if (self::isPromoSabores($row)) {
                $idsWithVariantes[] = (int) $row['promo_origen_id'];
            } elseif (!empty($row['usa_grupos_opcion'])) {
                $idsWithGrupos[] = (int) $row['id_producto'];
            } elseif (!empty($row['usa_variantes'])) {
                $idsWithVariantes[] = (int) $row['id_producto'];
            }
        }

        $idsWithVariantes = array_values(array_unique($idsWithVariantes));
        $idsWithGrupos = array_values(array_unique($idsWithGrupos));

        $variantMap = $idsWithVariantes
            ? ProductoVariante::byProductos($idsWithVariantes)
            : [];
        $gruposMap = $idsWithGrupos
            ? ProductoOpcionGrupo::byProductos($idsWithGrupos)
            : [];

        return array_map(function (array $row) use ($variantMap, $gruposMap): array {
            if (self::isPromoSabores($row)) {
                $origenId = (int) $row['promo_origen_id'];
                $row['variantes'] = $variantMap[$origenId] ?? [];
                $row['precio_desde'] = $row['precio_producto'] != null
                    ? (float) $row['precio_producto']
                    : null;
                $row['max_sabores'] = 1;
                $row['tipo_variante'] = 'sabor';
                $row['grupos_opcion'] = [];
            } elseif (!empty($row['usa_grupos_opcion'])) {
                $id = (int) $row['id_producto'];
                $row['variantes'] = [];
                $row['max_sabores'] = 1;
                $row['grupos_opcion'] = $gruposMap[$id] ?? [];
                $row['precio_desde'] = $row['precio_producto'] != null
                    ? (float) $row['precio_producto']
                    : null;
            } elseif (!empty($row['usa_variantes'])) {
                $id = (int) $row['id_producto'];
                $variantes = $variantMap[$id] ?? [];
                $row['variantes'] = $variantes;

                $precios = array_map(
                    static fn ($variante) => (float) $variante['precio'],
                    $variantes
                );
                $row['precio_desde'] = $precios ? min($precios) : null;
                $row['max_sabores'] = self::normalizeMaxSabores($row);
                $row['grupos_opcion'] = [];
            } else {
                $row['variantes'] = [];
                $row['max_sabores'] = 1;
                $row['grupos_opcion'] = [];
            }

            $row['usa_grupos_opcion'] = !empty($row['usa_grupos_opcion']) ? 1 : 0;
            $row['presentacion'] = self::normalizeTextField((string) ($row['presentacion'] ?? ''));
            $row['detalles'] = self::normalizeTextField((string) ($row['detalles'] ?? ''));

            return $row;
        }, $rows);
    }

    /**
     * Trae todos los productos, con el nombre de su categoría incluido.
     */
    public static function all(): array
    {
        $db = Database::connect();

        $stmt = $db->query(
            'SELECT p.*, c.nom_categoria,
                    (SELECT MIN(pv.precio) FROM producto_variantes pv WHERE pv.producto_id = p.id_producto) AS precio_desde
             FROM producto p
             LEFT JOIN categoria c ON c.id_categoria = p.categoria_id
             ORDER BY p.id_producto DESC'
        );

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return self::attachVariantesBatch($rows);
    }

    public static function find(int $id): array|false
    {
        $db = Database::connect();

        $stmt = $db->prepare(
            'SELECT p.*, c.nom_categoria
             FROM producto p
             LEFT JOIN categoria c ON c.id_categoria = p.categoria_id
             WHERE p.id_producto = :id
             LIMIT 1'
        );
        $stmt->execute(['id' => $id]);

        $producto = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$producto) {
            return false;
        }

        return self::attachVariantes($producto);
    }

    /**
     * Productos de una categoría específica.
     */
    public static function byCategoria(int $categoriaId): array
    {
        $db = Database::connect();

        $stmt = $db->prepare(
            'SELECT p.*, c.nom_categoria,
                    (SELECT MIN(pv.precio) FROM producto_variantes pv WHERE pv.producto_id = p.id_producto) AS precio_desde
             FROM producto p
             LEFT JOIN categoria c ON c.id_categoria = p.categoria_id
             WHERE p.categoria_id = :categoria_id
             ORDER BY p.id_producto DESC'
        );
        $stmt->execute(['categoria_id' => $categoriaId]);

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return self::attachVariantesBatch($rows);
    }

    public static function create(array $data): int
    {
        $db = Database::connect();

        $stmt = $db->prepare(
            'INSERT INTO producto
                (nom_producto, precio_producto, descuento_porcentaje, stock_disponible,
                 aviso_stock_desde, descripcion_producto, img_prod, categoria_id,
                 caracteristicas, presentacion, detalles, usa_variantes, usa_grupos_opcion, tipo_variante,
                 mostrar_imagen_variantes, max_sabores, promo_cantidad, promo_origen_id)
             VALUES
                (:nom_producto, :precio_producto, :descuento_porcentaje, :stock_disponible,
                 :aviso_stock_desde, :descripcion_producto, :img_prod, :categoria_id,
                 :caracteristicas, :presentacion, :detalles, :usa_variantes, :usa_grupos_opcion, :tipo_variante,
                 :mostrar_imagen_variantes, :max_sabores, :promo_cantidad, :promo_origen_id)'
        );

        $usaGrupos = !empty($data['usa_grupos_opcion']) && empty($data['usa_variantes']);
        $usaVariantes = !empty($data['usa_variantes']) && !$usaGrupos;

        $stmt->execute([
            'nom_producto'          => $data['nom_producto'],
            'precio_producto'       => $usaVariantes ? ($data['precio_producto'] ?? null) : ($data['precio_producto'] ?? null),
            'descuento_porcentaje'  => $data['descuento_porcentaje'] ?? null,
            'stock_disponible'      => $data['stock_disponible'] ?? null,
            'aviso_stock_desde'     => $data['aviso_stock_desde'] ?? null,
            'descripcion_producto'  => $data['descripcion_producto'] ?? '',
            'img_prod'              => $data['img_prod'] ?? '',
            'categoria_id'          => $data['categoria_id'],
            'caracteristicas'       => $data['caracteristicas'] ?? '{}',
            'presentacion'          => self::normalizeTextField((string) ($data['presentacion'] ?? '')),
            'detalles'              => self::normalizeTextField((string) ($data['detalles'] ?? '')),
            'usa_variantes'         => $usaVariantes ? 1 : 0,
            'usa_grupos_opcion'     => $usaGrupos ? 1 : 0,
            'tipo_variante'         => $usaVariantes
                ? self::normalizeTipoVariante($data)
                : 'sabor',
            'mostrar_imagen_variantes' => $usaVariantes && !empty($data['mostrar_imagen_variantes']) ? 1 : 0,
            'max_sabores'           => $usaVariantes
                ? self::normalizeMaxSabores($data)
                : 1,
            'promo_cantidad'        => (!$usaVariantes && !$usaGrupos)
                ? self::normalizePromoCantidad($data)
                : null,
            'promo_origen_id'       => (!$usaVariantes && !$usaGrupos && self::normalizePromoCantidad($data))
                ? self::normalizePromoOrigenId($data)
                : null,
        ]);

        return (int) $db->lastInsertId();
    }

    public static function update(int $id, array $data): bool
    {
        $db = Database::connect();

        $stmt = $db->prepare(
            'UPDATE producto SET
                nom_producto = :nom_producto,
                precio_producto = :precio_producto,
                descuento_porcentaje = :descuento_porcentaje,
                stock_disponible = :stock_disponible,
                aviso_stock_desde = :aviso_stock_desde,
                descripcion_producto = :descripcion_producto,
                img_prod = :img_prod,
                categoria_id = :categoria_id,
                caracteristicas = :caracteristicas,
                presentacion = :presentacion,
                detalles = :detalles,
                usa_variantes = :usa_variantes,
                usa_grupos_opcion = :usa_grupos_opcion,
                tipo_variante = :tipo_variante,
                mostrar_imagen_variantes = :mostrar_imagen_variantes,
                max_sabores = :max_sabores,
                promo_cantidad = :promo_cantidad,
                promo_origen_id = :promo_origen_id
             WHERE id_producto = :id'
        );

        $usaGrupos = !empty($data['usa_grupos_opcion']) && empty($data['usa_variantes']);
        $usaVariantes = !empty($data['usa_variantes']) && !$usaGrupos;

        return $stmt->execute([
            'id'                    => $id,
            'nom_producto'          => $data['nom_producto'],
            'precio_producto'       => $data['precio_producto'] ?? null,
            'descuento_porcentaje'  => $data['descuento_porcentaje'] ?? null,
            'stock_disponible'      => $data['stock_disponible'] ?? null,
            'aviso_stock_desde'     => $data['aviso_stock_desde'] ?? null,
            'descripcion_producto'  => $data['descripcion_producto'] ?? '',
            'img_prod'              => $data['img_prod'] ?? '',
            'categoria_id'          => $data['categoria_id'],
            'caracteristicas'       => $data['caracteristicas'] ?? '{}',
            'presentacion'          => self::normalizeTextField((string) ($data['presentacion'] ?? '')),
            'detalles'              => self::normalizeTextField((string) ($data['detalles'] ?? '')),
            'usa_variantes'         => $usaVariantes ? 1 : 0,
            'usa_grupos_opcion'     => $usaGrupos ? 1 : 0,
            'tipo_variante'         => $usaVariantes
                ? self::normalizeTipoVariante($data)
                : 'sabor',
            'mostrar_imagen_variantes' => $usaVariantes && !empty($data['mostrar_imagen_variantes']) ? 1 : 0,
            'max_sabores'           => $usaVariantes
                ? self::normalizeMaxSabores($data)
                : 1,
            'promo_cantidad'        => (!$usaVariantes && !$usaGrupos)
                ? self::normalizePromoCantidad($data)
                : null,
            'promo_origen_id'       => (!$usaVariantes && !$usaGrupos && self::normalizePromoCantidad($data))
                ? self::normalizePromoOrigenId($data)
                : null,
        ]);
    }

    public static function delete(int $id): bool
    {
        $db = Database::connect();

        $stmt = $db->prepare('DELETE FROM producto WHERE id_producto = :id');

        return $stmt->execute(['id' => $id]);
    }
}