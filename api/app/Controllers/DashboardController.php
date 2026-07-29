<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Database;
use PDO;

class DashboardController
{
    /** GET /admin/stats */
    public function stats(): void
    {
        Auth::require();

        $db = Database::connect();

        $this->json([
            'success' => true,
            'data' => [
                'usuarios'           => $this->count($db, 'usuario'),
                'categorias'         => $this->count($db, 'categoria'),
                'productos'          => $this->count($db, 'producto'),
                'cupones'            => $this->count($db, 'cupon'),
                'delivery_zonas'     => $this->count($db, 'delivery_zona'),
                'ingredientes_extra' => $this->count($db, 'ingrediente_extra'),
            ],
        ]);
    }

    private function count(PDO $db, string $table): int
    {
        $stmt = $db->query("SELECT COUNT(*) AS total FROM {$table}");
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return (int) ($row['total'] ?? 0);
    }

    private function json(array $payload, int $status = 200): void
    {
        http_response_code($status);
        echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    }
}
