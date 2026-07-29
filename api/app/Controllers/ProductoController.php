<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Models\Producto;

class ProductoController
{
    /** GET /productos */
    public function index(): void
    {
        $productos = Producto::all();

        $this->json(['success' => true, 'data' => $productos]);
    }

    /** GET /productos/{id} */
    public function show(string $id): void
    {
        $producto = Producto::find((int) $id);

        if (!$producto) {
            $this->json(['success' => false, 'message' => 'Producto no encontrado'], 404);
            return;
        }

        $this->json(['success' => true, 'data' => $producto]);
    }

    /** GET /categorias/{id}/productos */
    public function byCategoria(string $categoriaId): void
    {
        $productos = Producto::byCategoria((int) $categoriaId);

        $this->json(['success' => true, 'data' => $productos]);
    }

    /** POST /productos */
    public function store(): void
    {
        Auth::require();

        $data = $this->body();

        if (empty($data['nom_producto']) || empty($data['categoria_id'])) {
            $this->json(['success' => false, 'message' => 'nom_producto y categoria_id son obligatorios'], 422);
            return;
        }

        if (empty($data['usa_variantes']) && empty($data['usa_grupos_opcion']) && !isset($data['precio_producto'])) {
            $this->json(['success' => false, 'message' => 'precio_producto es obligatorio si no usa variantes'], 422);
            return;
        }

        if (!empty($data['usa_grupos_opcion']) && !isset($data['precio_producto'])) {
            $this->json(['success' => false, 'message' => 'precio_producto es obligatorio con grupos de opciones'], 422);
            return;
        }

        $id = Producto::create($data);

        $this->json(['success' => true, 'data' => Producto::find($id)], 201);
    }

    /** PUT /productos/{id} */
    public function update(string $id): void
    {
        Auth::require();

        $producto = Producto::find((int) $id);

        if (!$producto) {
            $this->json(['success' => false, 'message' => 'Producto no encontrado'], 404);
            return;
        }

        $data = $this->body();
        Producto::update((int) $id, $data);

        $this->json(['success' => true, 'data' => Producto::find((int) $id)]);
    }

    /** DELETE /productos/{id} */
    public function destroy(string $id): void
    {
        Auth::require();

        $producto = Producto::find((int) $id);

        if (!$producto) {
            $this->json(['success' => false, 'message' => 'Producto no encontrado'], 404);
            return;
        }

        Producto::delete((int) $id);

        $this->json(['success' => true, 'message' => 'Producto eliminado']);
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