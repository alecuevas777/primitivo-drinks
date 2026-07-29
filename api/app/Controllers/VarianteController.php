<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Models\Producto;
use App\Models\ProductoVariante;

class VarianteController
{
    /** GET /productos/{id}/variantes */
    public function index(string $productoId): void
    {
        $producto = Producto::find((int) $productoId);

        if (!$producto) {
            $this->json(['success' => false, 'message' => 'Producto no encontrado'], 404);
            return;
        }

        $this->json([
            'success' => true,
            'data'    => ProductoVariante::byProducto((int) $productoId),
        ]);
    }

    /** POST /productos/{id}/variantes */
    public function store(string $productoId): void
    {
        Auth::require();

        $producto = Producto::find((int) $productoId);

        if (!$producto) {
            $this->json(['success' => false, 'message' => 'Producto no encontrado'], 404);
            return;
        }

        $data = $this->body();
        $nombre = trim((string) ($data['nombre_variante'] ?? ''));
        $precio = $data['precio'] ?? null;

        if ($nombre === '' || $precio === null || $precio === '') {
            $this->json(['success' => false, 'message' => 'nombre_variante y precio son obligatorios'], 422);
            return;
        }

        $id = ProductoVariante::create([
            'producto_id'     => (int) $productoId,
            'nombre_variante' => $nombre,
            'precio'          => $precio,
            'stock'           => $data['stock'] ?? null,
            'img_variante'    => trim((string) ($data['img_variante'] ?? '')) ?: null,
        ]);

        $this->json(['success' => true, 'data' => ProductoVariante::find($id)], 201);
    }

    /** PUT /variantes/{id} */
    public function update(string $id): void
    {
        Auth::require();

        $variante = ProductoVariante::find((int) $id);

        if (!$variante) {
            $this->json(['success' => false, 'message' => 'Variante no encontrada'], 404);
            return;
        }

        $data = $this->body();
        $nombre = trim((string) ($data['nombre_variante'] ?? $variante['nombre_variante']));
        $precio = $data['precio'] ?? $variante['precio'];

        if ($nombre === '') {
            $this->json(['success' => false, 'message' => 'nombre_variante es obligatorio'], 422);
            return;
        }

        ProductoVariante::update((int) $id, [
            'nombre_variante' => $nombre,
            'precio'          => $precio,
            'stock'           => $data['stock'] ?? $variante['stock'],
            'img_variante'    => array_key_exists('img_variante', $data)
                ? (trim((string) $data['img_variante']) ?: null)
                : $variante['img_variante'],
        ]);

        $this->json(['success' => true, 'data' => ProductoVariante::find((int) $id)]);
    }

    /** DELETE /variantes/{id} */
    public function destroy(string $id): void
    {
        Auth::require();

        $variante = ProductoVariante::find((int) $id);

        if (!$variante) {
            $this->json(['success' => false, 'message' => 'Variante no encontrada'], 404);
            return;
        }

        ProductoVariante::delete((int) $id);

        $this->json(['success' => true, 'message' => 'Variante eliminada']);
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
