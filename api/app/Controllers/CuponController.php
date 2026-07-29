<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Models\Cupon;

class CuponController
{
    /** GET /cupones */
    public function index(): void
    {
        $this->json(['success' => true, 'data' => Cupon::all()]);
    }

    /** GET /cupones/{id} */
    public function show(string $id): void
    {
        $cupon = Cupon::find((int) $id);

        if (!$cupon) {
            $this->json(['success' => false, 'message' => 'Cupón no encontrado'], 404);
            return;
        }

        $this->json(['success' => true, 'data' => $cupon]);
    }

    /** POST /cupones */
    public function store(): void
    {
        Auth::require();

        $data = $this->body();

        if (empty(trim((string) ($data['codigo'] ?? '')))) {
            $this->json(['success' => false, 'message' => 'codigo es obligatorio'], 422);
            return;
        }

        try {
            $id = Cupon::create($data);
            $this->json(['success' => true, 'data' => Cupon::find($id)], 201);
        } catch (\PDOException $e) {
            if (str_contains($e->getMessage(), 'cupon_codigo_unique')) {
                $this->json(['success' => false, 'message' => 'Ya existe un cupón con ese código'], 409);
                return;
            }

            throw $e;
        }
    }

    /** PUT /cupones/{id} */
    public function update(string $id): void
    {
        Auth::require();

        $cupon = Cupon::find((int) $id);

        if (!$cupon) {
            $this->json(['success' => false, 'message' => 'Cupón no encontrado'], 404);
            return;
        }

        $data = $this->body();

        try {
            Cupon::update((int) $id, $data);
            $this->json(['success' => true, 'data' => Cupon::find((int) $id)]);
        } catch (\PDOException $e) {
            if (str_contains($e->getMessage(), 'cupon_codigo_unique')) {
                $this->json(['success' => false, 'message' => 'Ya existe un cupón con ese código'], 409);
                return;
            }

            throw $e;
        }
    }

    /** DELETE /cupones/{id} */
    public function destroy(string $id): void
    {
        Auth::require();

        $cupon = Cupon::find((int) $id);

        if (!$cupon) {
            $this->json(['success' => false, 'message' => 'Cupón no encontrado'], 404);
            return;
        }

        Cupon::delete((int) $id);

        $this->json(['success' => true, 'message' => 'Cupón eliminado']);
    }

    /** POST /cupones/validar */
    public function validar(): void
    {
        $data = $this->body();
        $codigo = trim((string) ($data['codigo'] ?? ''));

        if ($codigo === '') {
            $this->json(['success' => false, 'message' => 'codigo es obligatorio'], 422);
            return;
        }

        $subtotal = (float) ($data['subtotal'] ?? 0);
        $deliveryFee = (float) ($data['delivery_fee'] ?? 0);
        $lineas = is_array($data['lineas'] ?? null) ? $data['lineas'] : [];

        $result = Cupon::validateForOrder($codigo, $subtotal, $lineas, $deliveryFee);

        if (!$result['valid']) {
            $this->json(['success' => false, 'message' => $result['message']], 422);
            return;
        }

        $this->json(['success' => true, 'data' => $result]);
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
