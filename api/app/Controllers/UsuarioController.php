<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Models\Usuario;

class UsuarioController
{
    /** GET /usuarios */
    public function index(): void
    {
        Auth::require();

        $this->json(['success' => true, 'data' => Usuario::all()]);
    }

    /** GET /usuarios/{id} */
    public function show(string $id): void
    {
        Auth::require();

        $usuario = Usuario::find((int) $id);

        if (!$usuario) {
            $this->json(['success' => false, 'message' => 'Usuario no encontrado'], 404);
            return;
        }

        $this->json(['success' => true, 'data' => $usuario]);
    }

    /** POST /usuarios */
    public function store(): void
    {
        Auth::require();

        $data = $this->sanitizeInput($this->body());
        $error = $this->validate($data, true);

        if ($error !== null) {
            $this->json(['success' => false, 'message' => $error], 422);
            return;
        }

        if (Usuario::emailExists($data['correo_usuario'])) {
            $this->json(['success' => false, 'message' => 'El correo ya está registrado'], 409);
            return;
        }

        $id = Usuario::create([
            'nom_usuario'        => $data['nom_usuario'],
            'telefono_usuario'   => $data['telefono_usuario'],
            'correo_usuario'     => $data['correo_usuario'],
            'contrasena_usuario' => Auth::hashPassword($data['contrasena']),
        ]);

        $this->json(['success' => true, 'data' => Usuario::find($id)], 201);
    }

    /** PUT /usuarios/{id} */
    public function update(string $id): void
    {
        Auth::require();

        $usuarioId = (int) $id;
        $usuario = Usuario::find($usuarioId);

        if (!$usuario) {
            $this->json(['success' => false, 'message' => 'Usuario no encontrado'], 404);
            return;
        }

        $data = $this->sanitizeInput($this->body());
        $error = $this->validate($data, false);

        if ($error !== null) {
            $this->json(['success' => false, 'message' => $error], 422);
            return;
        }

        if (Usuario::emailExists($data['correo_usuario'], $usuarioId)) {
            $this->json(['success' => false, 'message' => 'El correo ya está registrado'], 409);
            return;
        }

        $payload = [
            'nom_usuario'      => $data['nom_usuario'],
            'telefono_usuario' => $data['telefono_usuario'],
            'correo_usuario'   => $data['correo_usuario'],
        ];

        if ($data['contrasena'] !== '') {
            $payload['contrasena_usuario'] = Auth::hashPassword($data['contrasena']);
        }

        Usuario::update($usuarioId, $payload);

        $this->json(['success' => true, 'data' => Usuario::find($usuarioId)]);
    }

    /** DELETE /usuarios/{id} */
    public function destroy(string $id): void
    {
        Auth::require();

        $usuarioId = (int) $id;

        if ($usuarioId === Auth::id()) {
            $this->json(['success' => false, 'message' => 'No puedes eliminar tu propia cuenta'], 403);
            return;
        }

        $usuario = Usuario::find($usuarioId);

        if (!$usuario) {
            $this->json(['success' => false, 'message' => 'Usuario no encontrado'], 404);
            return;
        }

        Usuario::delete($usuarioId);

        $this->json(['success' => true, 'message' => 'Usuario eliminado']);
    }

    private function sanitizeInput(array $data): array
    {
        return [
            'nom_usuario'      => trim((string) ($data['nom_usuario'] ?? '')),
            'telefono_usuario' => preg_replace('/\s+/', '', (string) ($data['telefono_usuario'] ?? '')),
            'correo_usuario'   => strtolower(trim((string) ($data['correo_usuario'] ?? ''))),
            'contrasena'       => (string) ($data['contrasena'] ?? ''),
        ];
    }

    private function validate(array $data, bool $isCreate): ?string
    {
        if (mb_strlen($data['nom_usuario']) < 2) {
            return 'El nombre debe tener al menos 2 caracteres';
        }

        if ($data['telefono_usuario'] === '') {
            return 'El teléfono es obligatorio';
        }

        if (!filter_var($data['correo_usuario'], FILTER_VALIDATE_EMAIL)) {
            return 'Correo electrónico no válido';
        }

        if ($isCreate && strlen($data['contrasena']) < 8) {
            return 'La contraseña debe tener al menos 8 caracteres';
        }

        if (!$isCreate && $data['contrasena'] !== '' && strlen($data['contrasena']) < 8) {
            return 'La contraseña debe tener al menos 8 caracteres';
        }

        return null;
    }

    private function body(): array
    {
        $raw = file_get_contents('php://input');
        $decoded = json_decode($raw ?: '', true);

        return is_array($decoded) ? $decoded : [];
    }

    private function json(array $payload, int $status = 200): void
    {
        http_response_code($status);
        echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    }
}
