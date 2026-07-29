<?php

declare(strict_types=1);

namespace App\Core;

use PDO;
use PDOException;

class Database
{
    private static ?PDO $connection = null;

    /**
     * Obtiene una única instancia de la conexión a la base de datos.
     */
    public static function connect(): PDO
    {
        if (self::$connection === null) {

            $host = $_ENV['DB_HOST'];
            $port = $_ENV['DB_PORT'];
            $database = $_ENV['DB_DATABASE'];
            $username = $_ENV['DB_USERNAME'];
            $password = $_ENV['DB_PASSWORD'];

            $dsn = "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4";

            try {

                self::$connection = new PDO(
                    $dsn,
                    $username,
                    $password,
                    [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,

                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,

                        PDO::ATTR_EMULATE_PREPARES => false,

                        PDO::ATTR_PERSISTENT => false
                    ]
                );

            } catch (PDOException $e) {

                error_log($e->getMessage());

                throw new PDOException(
                    "No fue posible establecer conexión con la base de datos."
                );

            }

        }

        return self::$connection;
    }
}