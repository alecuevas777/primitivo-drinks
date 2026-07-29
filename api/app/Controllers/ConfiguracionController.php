<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Models\Configuracion;
use App\Models\ConfiguracionHorario;

class ConfiguracionController
{
    /** GET /configuracion */
    public function show(): void
    {
        $config = Configuracion::get();

        if (!$config) {
            $this->json(['success' => false, 'message' => 'Configuración no encontrada'], 404);
            return;
        }

        $this->json([
            'success' => true,
            'data'    => [
                'configuracion' => $config,
                'horarios'      => ConfiguracionHorario::all(),
            ],
        ]);
    }

    /** PUT /configuracion */
    public function update(): void
    {
        Auth::require();

        $config = Configuracion::get();

        if (!$config) {
            $this->json(['success' => false, 'message' => 'Configuración no encontrada'], 404);
            return;
        }

        $data = $this->body();

        if (empty(trim((string) ($data['nombre_negocio'] ?? '')))) {
            $this->json(['success' => false, 'message' => 'nombre_negocio es obligatorio'], 422);
            return;
        }

        if (empty(trim((string) ($data['whatsapp'] ?? '')))) {
            $this->json(['success' => false, 'message' => 'whatsapp es obligatorio'], 422);
            return;
        }

        try {
            Configuracion::update($data);

            if (isset($data['horarios']) && is_array($data['horarios'])) {
                ConfiguracionHorario::syncAll($data['horarios']);
            }
        } catch (\PDOException $e) {
            $this->json([
                'success' => false,
                'message' => 'Error al guardar la configuración. Verifica que la base de datos esté actualizada.',
            ], 500);
            return;
        }

        $this->json([
            'success' => true,
            'data'    => [
                'configuracion' => Configuracion::get(),
                'horarios'      => ConfiguracionHorario::all(),
            ],
        ]);
    }

    private function body(): array
    {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }

    private function json(array $payload, int $status = 200): void
    {
        http_response_code($status);
        echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    }
}
