<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;
use PDO;

class Usuario
{
    public static function all(): array
    {
        $db = Database::connect();

        $stmt = $db->query(
            'SELECT id_usuario, nom_usuario, telefono_usuario, correo_usuario
             FROM usuario
             ORDER BY id_usuario ASC'
        );

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function find(int $id): array|false
    {
        $db = Database::connect();

        $stmt = $db->prepare(
            'SELECT id_usuario, nom_usuario, telefono_usuario, correo_usuario
             FROM usuario
             WHERE id_usuario = :id
             LIMIT 1'
        );
        $stmt->execute(['id' => $id]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public static function findByEmail(string $email): array|false
    {
        $db = Database::connect();

        $stmt = $db->prepare(
            'SELECT id_usuario, nom_usuario, telefono_usuario, correo_usuario, contrasena_usuario
             FROM usuario
             WHERE correo_usuario = :correo
             LIMIT 1'
        );
        $stmt->execute(['correo' => $email]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public static function create(array $data): int
    {
        $db = Database::connect();

        $stmt = $db->prepare(
            'INSERT INTO usuario (nom_usuario, telefono_usuario, correo_usuario, contrasena_usuario)
             VALUES (:nom_usuario, :telefono_usuario, :correo_usuario, :contrasena_usuario)'
        );

        $stmt->execute([
            'nom_usuario'        => $data['nom_usuario'],
            'telefono_usuario'   => $data['telefono_usuario'],
            'correo_usuario'     => $data['correo_usuario'],
            'contrasena_usuario' => $data['contrasena_usuario'],
        ]);

        return (int) $db->lastInsertId();
    }

    public static function update(int $id, array $data): bool
    {
        $db = Database::connect();

        if (!empty($data['contrasena_usuario'])) {
            $stmt = $db->prepare(
                'UPDATE usuario SET
                    nom_usuario = :nom_usuario,
                    telefono_usuario = :telefono_usuario,
                    correo_usuario = :correo_usuario,
                    contrasena_usuario = :contrasena_usuario
                 WHERE id_usuario = :id'
            );

            return $stmt->execute([
                'id'                 => $id,
                'nom_usuario'        => $data['nom_usuario'],
                'telefono_usuario'   => $data['telefono_usuario'],
                'correo_usuario'     => $data['correo_usuario'],
                'contrasena_usuario' => $data['contrasena_usuario'],
            ]);
        }

        $stmt = $db->prepare(
            'UPDATE usuario SET
                nom_usuario = :nom_usuario,
                telefono_usuario = :telefono_usuario,
                correo_usuario = :correo_usuario
             WHERE id_usuario = :id'
        );

        return $stmt->execute([
            'id'               => $id,
            'nom_usuario'      => $data['nom_usuario'],
            'telefono_usuario' => $data['telefono_usuario'],
            'correo_usuario'   => $data['correo_usuario'],
        ]);
    }

    public static function delete(int $id): bool
    {
        $db = Database::connect();

        $stmt = $db->prepare('DELETE FROM usuario WHERE id_usuario = :id');

        return $stmt->execute(['id' => $id]);
    }

    public static function emailExists(string $email, ?int $excludeId = null): bool
    {
        $db = Database::connect();

        if ($excludeId !== null) {
            $stmt = $db->prepare(
                'SELECT COUNT(*) AS total
                 FROM usuario
                 WHERE correo_usuario = :correo AND id_usuario != :id'
            );
            $stmt->execute(['correo' => $email, 'id' => $excludeId]);
        } else {
            $stmt = $db->prepare(
                'SELECT COUNT(*) AS total FROM usuario WHERE correo_usuario = :correo'
            );
            $stmt->execute(['correo' => $email]);
        }

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return ((int) ($row['total'] ?? 0)) > 0;
    }
}
