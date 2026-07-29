<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;
use PDO;

class Cupon
{
    private const TIPOS = [
        'porcentaje_pedido',
        'porcentaje_categoria',
        'porcentaje_producto',
        'envio_gratis',
    ];

    public static function all(): array
    {
        $db = Database::connect();

        $stmt = $db->query('SELECT * FROM cupon ORDER BY id_cupon DESC');

        return array_map(fn ($row) => self::attachRelations($row), $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public static function find(int $id): array|false
    {
        $db = Database::connect();

        $stmt = $db->prepare('SELECT * FROM cupon WHERE id_cupon = :id LIMIT 1');
        $stmt->execute(['id' => $id]);

        $cupon = $stmt->fetch(PDO::FETCH_ASSOC);

        return $cupon ? self::attachRelations($cupon) : false;
    }

    public static function findByCodigo(string $codigo): array|false
    {
        $db = Database::connect();

        $stmt = $db->prepare('SELECT * FROM cupon WHERE codigo = :codigo LIMIT 1');
        $stmt->execute(['codigo' => strtoupper(trim($codigo))]);

        $cupon = $stmt->fetch(PDO::FETCH_ASSOC);

        return $cupon ? self::attachRelations($cupon) : false;
    }

    public static function create(array $data): int
    {
        $db = Database::connect();

        $stmt = $db->prepare(
            'INSERT INTO cupon
                (codigo, descripcion, tipo, valor, pedido_minimo, solo_delivery, activo, fecha_inicio, fecha_fin)
             VALUES
                (:codigo, :descripcion, :tipo, :valor, :pedido_minimo, :solo_delivery, :activo, :fecha_inicio, :fecha_fin)'
        );

        $stmt->execute(self::bindableFields($data));

        $id = (int) $db->lastInsertId();
        self::syncRelations($id, $data);

        return $id;
    }

    public static function update(int $id, array $data): bool
    {
        $db = Database::connect();

        $fields = self::bindableFields($data);
        $fields['id'] = $id;

        $stmt = $db->prepare(
            'UPDATE cupon SET
                codigo = :codigo,
                descripcion = :descripcion,
                tipo = :tipo,
                valor = :valor,
                pedido_minimo = :pedido_minimo,
                solo_delivery = :solo_delivery,
                activo = :activo,
                fecha_inicio = :fecha_inicio,
                fecha_fin = :fecha_fin
             WHERE id_cupon = :id'
        );

        $ok = $stmt->execute($fields);

        if ($ok && (array_key_exists('producto_ids', $data) || array_key_exists('categoria_ids', $data))) {
            self::syncRelations($id, $data);
        }

        return $ok;
    }

    public static function delete(int $id): bool
    {
        $db = Database::connect();

        $stmt = $db->prepare('DELETE FROM cupon WHERE id_cupon = :id');

        return $stmt->execute(['id' => $id]);
    }

    public static function validateForOrder(string $codigo, float $subtotal, array $lineas, float $deliveryFee): array
    {
        $cupon = self::findByCodigo($codigo);

        if (!$cupon) {
            return ['valid' => false, 'message' => 'Cupón no válido. Intenta con otro código.'];
        }

        if (!(int) $cupon['activo']) {
            return ['valid' => false, 'message' => 'Este cupón no está activo.'];
        }

        $today = date('Y-m-d');

        if (!empty($cupon['fecha_inicio']) && $cupon['fecha_inicio'] > $today) {
            return ['valid' => false, 'message' => 'Este cupón aún no está vigente.'];
        }

        if (!empty($cupon['fecha_fin']) && $cupon['fecha_fin'] < $today) {
            return ['valid' => false, 'message' => 'Este cupón ha expirado.'];
        }

        if ($cupon['pedido_minimo'] !== null && $subtotal < (float) $cupon['pedido_minimo']) {
            $min = number_format((float) $cupon['pedido_minimo'], 0, ',', '.');
            return ['valid' => false, 'message' => "El pedido debe ser de al menos \${$min} para usar este cupón."];
        }

        $productoIds = $cupon['producto_ids'];
        $categoriaIds = $cupon['categoria_ids'];

        if (!self::cartMeetsRestrictions($lineas, $productoIds, $categoriaIds)) {
            return ['valid' => false, 'message' => 'Este cupón no aplica a los productos de tu pedido.'];
        }

        $valor = (float) $cupon['valor'];
        $tipo = $cupon['tipo'];
        $subtotalDiscount = 0.0;
        $deliveryDiscount = 0.0;
        $adjustedDeliveryFee = $deliveryFee;

        switch ($tipo) {
            case 'envio_gratis':
                $deliveryDiscount = $deliveryFee;
                $adjustedDeliveryFee = 0.0;
                break;

            case 'porcentaje_pedido':
                $subtotalDiscount = round($subtotal * $valor / 100, 0);
                break;

            case 'porcentaje_categoria':
                $eligible = self::sumEligibleByCategoria($lineas, $categoriaIds);
                if ($eligible <= 0) {
                    return ['valid' => false, 'message' => 'No hay productos elegibles para este cupón.'];
                }
                $subtotalDiscount = round($eligible * $valor / 100, 0);
                break;

            case 'porcentaje_producto':
                $eligible = self::sumEligibleByProducto($lineas, $productoIds);
                if ($eligible <= 0) {
                    return ['valid' => false, 'message' => 'No hay productos elegibles para este cupón.'];
                }
                $subtotalDiscount = round($eligible * $valor / 100, 0);
                break;
        }

        return [
            'valid'            => true,
            'message'          => 'Cupón aplicado correctamente.',
            'cupon'            => self::publicPayload($cupon),
            'subtotalDiscount' => $subtotalDiscount,
            'deliveryDiscount' => $deliveryDiscount,
            'deliveryFee'      => $adjustedDeliveryFee,
            'totalDiscount'    => $subtotalDiscount + $deliveryDiscount,
        ];
    }

    private static function bindableFields(array $data): array
    {
        $tipo = (string) ($data['tipo'] ?? 'porcentaje_pedido');

        if (!in_array($tipo, self::TIPOS, true)) {
            $tipo = 'porcentaje_pedido';
        }

        return [
            'codigo'         => strtoupper(trim((string) ($data['codigo'] ?? ''))),
            'descripcion'    => trim((string) ($data['descripcion'] ?? '')) ?: null,
            'tipo'           => $tipo,
            'valor'          => $data['valor'] ?? 0,
            'pedido_minimo'  => $data['pedido_minimo'] !== '' && $data['pedido_minimo'] !== null
                ? $data['pedido_minimo']
                : null,
            'solo_delivery'  => !empty($data['solo_delivery']) ? 1 : 0,
            'activo'         => !isset($data['activo']) || !empty($data['activo']) ? 1 : 0,
            'fecha_inicio'   => !empty($data['fecha_inicio']) ? $data['fecha_inicio'] : null,
            'fecha_fin'      => !empty($data['fecha_fin']) ? $data['fecha_fin'] : null,
        ];
    }

    private static function attachRelations(array $cupon): array
    {
        $id = (int) $cupon['id_cupon'];
        $cupon['producto_ids'] = self::productoIds($id);
        $cupon['categoria_ids'] = self::categoriaIds($id);

        return $cupon;
    }

    private static function productoIds(int $cuponId): array
    {
        $db = Database::connect();

        $stmt = $db->prepare('SELECT producto_id FROM cupon_producto WHERE cupon_id = :id');
        $stmt->execute(['id' => $cuponId]);

        return array_map('intval', array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'producto_id'));
    }

    private static function categoriaIds(int $cuponId): array
    {
        $db = Database::connect();

        $stmt = $db->prepare('SELECT categoria_id FROM cupon_categoria WHERE cupon_id = :id');
        $stmt->execute(['id' => $cuponId]);

        return array_map('intval', array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'categoria_id'));
    }

    private static function syncRelations(int $cuponId, array $data): void
    {
        $db = Database::connect();

        if (array_key_exists('producto_ids', $data)) {
            $db->prepare('DELETE FROM cupon_producto WHERE cupon_id = :id')
                ->execute(['id' => $cuponId]);

            $productoIds = array_map('intval', (array) ($data['producto_ids'] ?? []));

            if ($productoIds) {
                $stmt = $db->prepare(
                    'INSERT INTO cupon_producto (cupon_id, producto_id) VALUES (:cupon_id, :producto_id)'
                );

                foreach ($productoIds as $productoId) {
                    $stmt->execute(['cupon_id' => $cuponId, 'producto_id' => $productoId]);
                }
            }
        }

        if (array_key_exists('categoria_ids', $data)) {
            $db->prepare('DELETE FROM cupon_categoria WHERE cupon_id = :id')
                ->execute(['id' => $cuponId]);

            $categoriaIds = array_map('intval', (array) ($data['categoria_ids'] ?? []));

            if ($categoriaIds) {
                $stmt = $db->prepare(
                    'INSERT INTO cupon_categoria (cupon_id, categoria_id) VALUES (:cupon_id, :categoria_id)'
                );

                foreach ($categoriaIds as $categoriaId) {
                    $stmt->execute(['cupon_id' => $cuponId, 'categoria_id' => $categoriaId]);
                }
            }
        }
    }

    private static function cartMeetsRestrictions(array $lineas, array $productoIds, array $categoriaIds): bool
    {
        if (!$productoIds && !$categoriaIds) {
            return true;
        }

        $hasProduct = false;
        $hasCategory = false;

        foreach ($lineas as $linea) {
            $productId = isset($linea['product_id']) ? (int) $linea['product_id'] : 0;
            $categoriaId = isset($linea['categoria_id']) ? (int) $linea['categoria_id'] : 0;

            if ($productoIds && in_array($productId, $productoIds, true)) {
                $hasProduct = true;
            }

            if ($categoriaIds && in_array($categoriaId, $categoriaIds, true)) {
                $hasCategory = true;
            }
        }

        if ($productoIds && $categoriaIds) {
            return $hasProduct || $hasCategory;
        }

        if ($productoIds) {
            return $hasProduct;
        }

        return $hasCategory;
    }

    private static function sumEligibleByCategoria(array $lineas, array $categoriaIds): float
    {
        $sum = 0.0;

        foreach ($lineas as $linea) {
            $categoriaId = isset($linea['categoria_id']) ? (int) $linea['categoria_id'] : 0;
            $precio = (float) ($linea['precio'] ?? 0);
            $cantidad = (int) ($linea['cantidad'] ?? 1);

            if (!$categoriaIds || in_array($categoriaId, $categoriaIds, true)) {
                $sum += $precio * $cantidad;
            }
        }

        return $sum;
    }

    private static function sumEligibleByProducto(array $lineas, array $productoIds): float
    {
        $sum = 0.0;

        foreach ($lineas as $linea) {
            $productId = isset($linea['product_id']) ? (int) $linea['product_id'] : 0;
            $precio = (float) ($linea['precio'] ?? 0);
            $cantidad = (int) ($linea['cantidad'] ?? 1);

            if (!$productoIds || in_array($productId, $productoIds, true)) {
                $sum += $precio * $cantidad;
            }
        }

        return $sum;
    }

    private static function publicPayload(array $cupon): array
    {
        return [
            'id_cupon'    => (int) $cupon['id_cupon'],
            'codigo'      => $cupon['codigo'],
            'descripcion' => $cupon['descripcion'],
            'tipo'        => $cupon['tipo'],
            'valor'       => (float) $cupon['valor'],
        ];
    }
}
