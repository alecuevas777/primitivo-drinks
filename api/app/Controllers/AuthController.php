<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Models\Usuario;

class AuthController
{
    /** POST /auth/login */
    public function login(): void
    {
        $data = $this->body();

        $email = strtolower(trim((string) ($data['correo_usuario'] ?? '')));
        $password = (string) ($data['contrasena'] ?? '');

        if ($email === '' || $password === '') {
            $this->json(['success' => false, 'message' => 'Correo y contraseña son obligatorios'], 422);
            return;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->json(['success' => false, 'message' => 'Correo electrónico no válido'], 422);
            return;
        }

        $user = Usuario::findByEmail($email);

        if (!$user || !Auth::verifyPassword($password, $user['contrasena_usuario'])) {
            $this->json(['success' => false, 'message' => 'Credenciales incorrectas'], 401);
            return;
        }

        Auth::login((int) $user['id_usuario']);

        unset($user['contrasena_usuario']);

        $this->json([
            'success' => true,
            'data'    => $user,
            'message' => 'Sesión iniciada',
        ]);
    }

    /** POST /auth/logout */
    public function logout(): void
    {
        Auth::logout();

        $this->json(['success' => true, 'message' => 'Sesión cerrada']);
    }

    /** GET /auth/me */
    public function me(): void
    {
        Auth::require();

        $user = Usuario::find((int) Auth::id());

        if (!$user) {
            Auth::logout();
            $this->json(['success' => false, 'message' => 'Usuario no encontrado'], 401);
            return;
        }

        $this->json(['success' => true, 'data' => $user]);
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
