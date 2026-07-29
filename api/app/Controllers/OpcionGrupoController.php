<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Models\Producto;
use App\Models\ProductoOpcion;
use App\Models\ProductoOpcionGrupo;

class OpcionGrupoController
{
    /** GET /productos/{id}/opcion-grupos */
    public function index(string $productoId): void
    {
        $producto = Producto::find((int) $productoId);
        if (!$producto) {
            $this->json(['success' => false, 'message' => 'Producto no encontrado'], 404);
            return;
        }

        $this->json([
            'success' => true,
            'data' => ProductoOpcionGrupo::byProducto((int) $productoId),
        ]);
    }

    /** POST /productos/{id}/opcion-grupos */
    public function store(string $productoId): void
    {
        Auth::require();

        $producto = Producto::find((int) $productoId);
        if (!$producto) {
            $this->json(['success' => false, 'message' => 'Producto no encontrado'], 404);
            return;
        }

        $data = $this->body();
        if (empty($data['nombre']) || !trim((string) $data['nombre'])) {
            $this->json(['success' => false, 'message' => 'nombre es obligatorio'], 422);
            return;
        }

        $id = ProductoOpcionGrupo::create([
            'producto_id' => (int) $productoId,
            'nombre' => $data['nombre'],
            'min_seleccion' => $data['min_seleccion'] ?? 1,
            'max_seleccion' => $data['max_seleccion'] ?? 1,
            'orden' => $data['orden'] ?? 0,
        ]);

        $this->json(['success' => true, 'data' => ProductoOpcionGrupo::find($id)], 201);
    }

    /** PUT /opcion-grupos/{id} */
    public function update(string $id): void
    {
        Auth::require();

        $grupo = ProductoOpcionGrupo::find((int) $id);
        if (!$grupo) {
            $this->json(['success' => false, 'message' => 'Grupo no encontrado'], 404);
            return;
        }

        $data = $this->body();
        if (empty($data['nombre']) || !trim((string) $data['nombre'])) {
            $this->json(['success' => false, 'message' => 'nombre es obligatorio'], 422);
            return;
        }

        ProductoOpcionGrupo::update((int) $id, [
            'nombre' => $data['nombre'],
            'min_seleccion' => $data['min_seleccion'] ?? $grupo['min_seleccion'],
            'max_seleccion' => $data['max_seleccion'] ?? $grupo['max_seleccion'],
            'orden' => $data['orden'] ?? $grupo['orden'],
        ]);

        $this->json(['success' => true, 'data' => ProductoOpcionGrupo::find((int) $id)]);
    }

    /** DELETE /opcion-grupos/{id} */
    public function destroy(string $id): void
    {
        Auth::require();

        $grupo = ProductoOpcionGrupo::find((int) $id);
        if (!$grupo) {
            $this->json(['success' => false, 'message' => 'Grupo no encontrado'], 404);
            return;
        }

        ProductoOpcionGrupo::delete((int) $id);
        $this->json(['success' => true, 'message' => 'Grupo eliminado']);
    }

    /** POST /opcion-grupos/{id}/opciones */
    public function storeOpcion(string $grupoId): void
    {
        Auth::require();

        $grupo = ProductoOpcionGrupo::find((int) $grupoId);
        if (!$grupo) {
            $this->json(['success' => false, 'message' => 'Grupo no encontrado'], 404);
            return;
        }

        $data = $this->body();
        if (empty($data['nombre_opcion']) || !trim((string) $data['nombre_opcion'])) {
            $this->json(['success' => false, 'message' => 'nombre_opcion es obligatorio'], 422);
            return;
        }

        $id = ProductoOpcion::create([
            'grupo_id' => (int) $grupoId,
            'nombre_opcion' => $data['nombre_opcion'],
            'precio_extra' => $data['precio_extra'] ?? 0,
            'stock' => $data['stock'] ?? null,
            'img_opcion' => $data['img_opcion'] ?? null,
            'orden' => $data['orden'] ?? 0,
        ]);

        $this->json(['success' => true, 'data' => ProductoOpcion::find($id)], 201);
    }

    /** PUT /opciones/{id} */
    public function updateOpcion(string $id): void
    {
        Auth::require();

        $opcion = ProductoOpcion::find((int) $id);
        if (!$opcion) {
            $this->json(['success' => false, 'message' => 'Opción no encontrada'], 404);
            return;
        }

        $data = $this->body();
        if (empty($data['nombre_opcion']) || !trim((string) $data['nombre_opcion'])) {
            $this->json(['success' => false, 'message' => 'nombre_opcion es obligatorio'], 422);
            return;
        }

        ProductoOpcion::update((int) $id, [
            'nombre_opcion' => $data['nombre_opcion'],
            'precio_extra' => $data['precio_extra'] ?? 0,
            'stock' => $data['stock'] ?? null,
            'img_opcion' => $data['img_opcion'] ?? null,
            'orden' => $data['orden'] ?? $opcion['orden'],
        ]);

        $this->json(['success' => true, 'data' => ProductoOpcion::find((int) $id)]);
    }

    /** DELETE /opciones/{id} */
    public function destroyOpcion(string $id): void
    {
        Auth::require();

        $opcion = ProductoOpcion::find((int) $id);
        if (!$opcion) {
            $this->json(['success' => false, 'message' => 'Opción no encontrada'], 404);
            return;
        }

        ProductoOpcion::delete((int) $id);
        $this->json(['success' => true, 'message' => 'Opción eliminada']);
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
