<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Models\Categoria;

class CategoriaController
{
    /** GET /categorias */
    public function index(): void
    {
        $categorias = Categoria::all();

        $this->json(['success' => true, 'data' => $categorias]);
    }

    /** GET /categorias/{id} */
    public function show(string $id): void
    {
        $categoria = Categoria::find((int) $id);

        if (!$categoria) {
            $this->json(['success' => false, 'message' => 'Categoría no encontrada'], 404);
            return;
        }

        $this->json(['success' => true, 'data' => $categoria]);
    }

    /** POST /categorias */
    public function store(): void
    {
        Auth::require();

        $data = $this->body();

        if (empty($data['nom_categoria'])) {
            $this->json(['success' => false, 'message' => 'nom_categoria es obligatorio'], 422);
            return;
        }

        $id = Categoria::create($data);

        $this->json(['success' => true, 'data' => Categoria::find($id)], 201);
    }

    /** PUT /categorias/{id} */
    public function update(string $id): void
    {
        Auth::require();

        $categoria = Categoria::find((int) $id);

        if (!$categoria) {
            $this->json(['success' => false, 'message' => 'Categoría no encontrada'], 404);
            return;
        }

        $data = $this->body();
        Categoria::update((int) $id, $data);

        $this->json(['success' => true, 'data' => Categoria::find((int) $id)]);
    }

    /** DELETE /categorias/{id} */
    public function destroy(string $id): void
    {
        Auth::require();

        $categoria = Categoria::find((int) $id);

        if (!$categoria) {
            $this->json(['success' => false, 'message' => 'Categoría no encontrada'], 404);
            return;
        }

        try {
            Categoria::delete((int) $id);
            $this->json(['success' => true, 'message' => 'Categoría eliminada']);
        } catch (\PDOException) {
            $this->json([
                'success' => false,
                'message' => 'No se puede eliminar: tiene productos asociados',
            ], 409);
        }
    }

    private function body(): array
    {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }

    private function json(array $payload, int $status = 200): void
    {
        http_response_code($status);
        echo json_encode($payload);
    }
}