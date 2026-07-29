<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Models\IngredienteExtra;

class IngredienteExtraController
{
    /** GET /ingredientes-extra */
    public function index(): void
    {
        $items = Auth::id() !== null ? IngredienteExtra::all() : IngredienteExtra::active();

        $this->json(['success' => true, 'data' => $items]);
    }

    /** GET /ingredientes-extra/{id} */
    public function show(string $id): void
    {
        $item = IngredienteExtra::find((int) $id);

        if (!$item) {
            $this->json(['success' => false, 'message' => 'Extra no encontrado'], 404);
            return;
        }

        $this->json(['success' => true, 'data' => $item]);
    }

    /** POST /ingredientes-extra */
    public function store(): void
    {
        Auth::require();

        $data = $this->body();

        if (trim((string) ($data['nom_ingrediente'] ?? '')) === '') {
            $this->json(['success' => false, 'message' => 'El nombre es obligatorio'], 422);
            return;
        }

        if (!isset($data['precio_extra']) || (float) $data['precio_extra'] < 0) {
            $this->json(['success' => false, 'message' => 'El precio es obligatorio'], 422);
            return;
        }

        $id = IngredienteExtra::create($data);
        $this->json(['success' => true, 'data' => IngredienteExtra::find($id)], 201);
    }

    /** PUT /ingredientes-extra/{id} */
    public function update(string $id): void
    {
        Auth::require();

        $item = IngredienteExtra::find((int) $id);

        if (!$item) {
            $this->json(['success' => false, 'message' => 'Extra no encontrado'], 404);
            return;
        }

        $data = $this->body();

        if (trim((string) ($data['nom_ingrediente'] ?? '')) === '') {
            $this->json(['success' => false, 'message' => 'El nombre es obligatorio'], 422);
            return;
        }

        if (!isset($data['precio_extra']) || (float) $data['precio_extra'] < 0) {
            $this->json(['success' => false, 'message' => 'El precio es obligatorio'], 422);
            return;
        }

        IngredienteExtra::update((int) $id, $data);
        $this->json(['success' => true, 'data' => IngredienteExtra::find((int) $id)]);
    }

    /** DELETE /ingredientes-extra/{id} */
    public function destroy(string $id): void
    {
        Auth::require();

        $item = IngredienteExtra::find((int) $id);

        if (!$item) {
            $this->json(['success' => false, 'message' => 'Extra no encontrado'], 404);
            return;
        }

        IngredienteExtra::delete((int) $id);
        $this->json(['success' => true, 'message' => 'Extra eliminado']);
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
