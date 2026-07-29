<?php

declare(strict_types=1);

namespace App\Core;

final class Auth
{
    public static function init(): void
    {
        if (session_status() !== PHP_SESSION_NONE) {
            return;
        }

        session_set_cookie_params(self::cookieParams());
        session_name('PRIMITIVOS_ADMIN_SESSION');
        session_start();
    }

    /** @return array<string, mixed> */
    private static function cookieParams(): array
    {
        $isDev = ($_ENV['APP_ENV'] ?? 'production') === 'development';

        if ($isDev) {
            // Frontend (Vite) and API run on different ports; cookies must be
            // SameSite=None so the browser sends them on cross-origin XHR.
            return [
                'lifetime' => 0,
                'path'     => '/',
                'httponly' => true,
                'samesite' => 'None',
                'secure'   => true,
            ];
        }

        $secure = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';

        return [
            'lifetime' => 0,
            'path'     => '/',
            'httponly' => true,
            'samesite' => 'Lax',
            'secure'   => $secure,
        ];
    }

    public static function require(): void
    {
        self::init();

        if (empty($_SESSION['user_id'])) {
            http_response_code(401);
            header('Content-Type: application/json; charset=UTF-8');
            echo json_encode([
                'success' => false,
                'message' => 'Sesión no válida o expirada',
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    public static function id(): ?int
    {
        self::init();

        return isset($_SESSION['user_id']) ? (int) $_SESSION['user_id'] : null;
    }

    public static function login(int $userId): void
    {
        self::init();
        session_regenerate_id(true);
        $_SESSION['user_id'] = $userId;
    }

    public static function logout(): void
    {
        self::init();
        $_SESSION = [];

        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', [
                'expires'  => time() - 42000,
                'path'     => $params['path'],
                'domain'   => $params['domain'],
                'secure'   => $params['secure'],
                'httponly' => $params['httponly'],
                'samesite' => $params['samesite'] ?? 'Lax',
            ]);
        }

        session_destroy();
    }

    public static function verifyPassword(string $password, string $hash): bool
    {
        if (str_starts_with($hash, '$2b$')) {
            $hash = '$2y$' . substr($hash, 4);
        }

        return password_verify($password, $hash);
    }

    public static function hashPassword(string $password): string
    {
        return password_hash($password, PASSWORD_DEFAULT);
    }
}
