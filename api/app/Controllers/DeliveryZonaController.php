<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Models\DeliveryZona;

class DeliveryZonaController
{
    /** GET /delivery-zonas */
    public function index(): void
    {
        $zonas = Auth::id() !== null ? DeliveryZona::all() : DeliveryZona::active();

        $this->json(['success' => true, 'data' => $zonas]);
    }

    /** GET /delivery-zonas/{id} */
    public function show(string $id): void
    {
        $zona = DeliveryZona::find((int) $id);

        if (!$zona) {
            $this->json(['success' => false, 'message' => 'Zona no encontrada'], 404);
            return;
        }

        $this->json(['success' => true, 'data' => $zona]);
    }

    /** POST /delivery-zonas */
    public function store(): void
    {
        Auth::require();

        $data = $this->body();

        if (trim((string) ($data['comuna'] ?? '')) === '') {
            $this->json(['success' => false, 'message' => 'La comuna es obligatoria'], 422);
            return;
        }

        if (!isset($data['costo']) || (float) $data['costo'] < 0) {
            $this->json(['success' => false, 'message' => 'El costo de delivery es obligatorio'], 422);
            return;
        }

        try {
            $id = DeliveryZona::create($data);
            $this->json(['success' => true, 'data' => DeliveryZona::find($id)], 201);
        } catch (\PDOException) {
            $this->json([
                'success' => false,
                'message' => 'Ya existe una zona con esa comuna',
            ], 409);
        }
    }

    /** PUT /delivery-zonas/{id} */
    public function update(string $id): void
    {
        Auth::require();

        $zona = DeliveryZona::find((int) $id);

        if (!$zona) {
            $this->json(['success' => false, 'message' => 'Zona no encontrada'], 404);
            return;
        }

        $data = $this->body();

        if (trim((string) ($data['comuna'] ?? '')) === '') {
            $this->json(['success' => false, 'message' => 'La comuna es obligatoria'], 422);
            return;
        }

        if (!isset($data['costo']) || (float) $data['costo'] < 0) {
            $this->json(['success' => false, 'message' => 'El costo de delivery es obligatorio'], 422);
            return;
        }

        try {
            DeliveryZona::update((int) $id, $data);
            $this->json(['success' => true, 'data' => DeliveryZona::find((int) $id)]);
        } catch (\PDOException) {
            $this->json([
                'success' => false,
                'message' => 'Ya existe una zona con esa comuna',
            ], 409);
        }
    }

    /** DELETE /delivery-zonas/{id} */
    public function destroy(string $id): void
    {
        Auth::require();

        $zona = DeliveryZona::find((int) $id);

        if (!$zona) {
            $this->json(['success' => false, 'message' => 'Zona no encontrada'], 404);
            return;
        }

        DeliveryZona::delete((int) $id);
        $this->json(['success' => true, 'message' => 'Zona eliminada']);
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
