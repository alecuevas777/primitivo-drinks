<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;
use PDO;

class Configuracion
{
    private static ?bool $hasMobileHeroColumn = null;
    private static ?bool $hasDiscountColumn = null;

    private static function hasMobileHeroColumn(): bool
    {
        if (self::$hasMobileHeroColumn !== null) {
            return self::$hasMobileHeroColumn;
        }

        $db = Database::connect();
        $stmt = $db->query("SHOW COLUMNS FROM configuracion LIKE 'imagen_hero_mobile'");
        self::$hasMobileHeroColumn = (bool) $stmt->fetch();

        return self::$hasMobileHeroColumn;
    }

    private static function hasDiscountColumn(): bool
    {
        if (self::$hasDiscountColumn !== null) {
            return self::$hasDiscountColumn;
        }

        $db = Database::connect();
        $stmt = $db->query("SHOW COLUMNS FROM configuracion LIKE 'descuento_porcentaje'");
        self::$hasDiscountColumn = (bool) $stmt->fetch();

        return self::$hasDiscountColumn;
    }

    public static function get(): array|false
    {
        $db = Database::connect();

        $stmt = $db->query('SELECT * FROM configuracion WHERE id_configuracion = 1 LIMIT 1');

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public static function update(array $data): bool
    {
        $db = Database::connect();

        $fields = [
            'nombre_negocio'        => $data['nombre_negocio'],
            'direccion'             => $data['direccion'] ?? '',
            'url_mapa'              => $data['url_mapa'] ?? '',
            'logo'                  => $data['logo'] ?? '',
            'telefono'              => $data['telefono'] ?? null,
            'email'                 => $data['email'] ?? null,
            'instagram'             => $data['instagram'] ?? null,
            'facebook'              => $data['facebook'] ?? null,
            'whatsapp'              => $data['whatsapp'],
            'tiktok'                => $data['tiktok'] ?? null,
            'titulo_hero'           => $data['titulo_hero'],
            'subtitulo_hero'        => $data['subtitulo_hero'],
            'imagen_hero'           => $data['imagen_hero'],
            'texto_promo'           => $data['texto_promo'] ?? null,
            'delivery_gratis_desde' => $data['delivery_gratis_desde'] !== '' && $data['delivery_gratis_desde'] !== null
                ? $data['delivery_gratis_desde']
                : null,
            'etiqueta_carta'        => $data['etiqueta_carta'],
            'titulo_carta'          => $data['titulo_carta'],
            'subtitulo_carta'       => $data['subtitulo_carta'],
            'cb_titular_nombre'     => $data['cb_titular_nombre'] ?? null,
            'cb_titular_rut'        => $data['cb_titular_rut'] ?? null,
            'cb_titular_email'      => $data['cb_titular_email'] ?? null,
            'cb_tipo_cuenta'        => $data['cb_tipo_cuenta'] ?? null,
            'cb_numero_cuenta'      => $data['cb_numero_cuenta'] ?? null,
            'cb_banco'              => $data['cb_banco'] ?? null,
        ];

        if (self::hasMobileHeroColumn()) {
            $fields['imagen_hero_mobile'] = $data['imagen_hero_mobile'] ?? null;
        }

        if (self::hasDiscountColumn()) {
            $fields['descuento_porcentaje'] = $data['descuento_porcentaje'] !== '' && $data['descuento_porcentaje'] !== null
                ? $data['descuento_porcentaje']
                : null;
        }

        $setClauses = array_map(
            fn (string $column) => "{$column} = :{$column}",
            array_keys($fields)
        );

        $stmt = $db->prepare(
            'UPDATE configuracion SET ' . implode(', ', $setClauses) . ' WHERE id_configuracion = 1'
        );

        return $stmt->execute($fields);
    }
}
