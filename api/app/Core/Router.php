<?php

declare(strict_types=1);

namespace App\Core;

/**
 * Router simple con soporte de parámetros dinámicos, ej: /productos/{id}
 *
 * NOTA: Si ya tenías tu propio Router.php con otra firma (por ejemplo,
 * que no soporte parámetros dinámicos), reemplázalo por este o avísame
 * cómo era el tuyo y lo adapto en vez de reescribirlo.
 */
class Router
{
    /** @var array<string, array<int, array{pattern: string, paramNames: array, handler: array}>> */
    private array $routes = [
        'GET'    => [],
        'POST'   => [],
        'PUT'    => [],
        'PATCH'  => [],
        'DELETE' => [],
    ];

    public function get(string $uri, array $handler): void
    {
        $this->addRoute('GET', $uri, $handler);
    }

    public function post(string $uri, array $handler): void
    {
        $this->addRoute('POST', $uri, $handler);
    }

    public function put(string $uri, array $handler): void
    {
        $this->addRoute('PUT', $uri, $handler);
    }

    public function patch(string $uri, array $handler): void
    {
        $this->addRoute('PATCH', $uri, $handler);
    }

    public function delete(string $uri, array $handler): void
    {
        $this->addRoute('DELETE', $uri, $handler);
    }

    private function addRoute(string $method, string $uri, array $handler): void
    {
        $uri = '/' . trim($uri, '/');

        // Convierte /productos/{id} en un regex y guarda el nombre del parámetro
        $paramNames = [];
        $pattern = preg_replace_callback('/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/', function ($matches) use (&$paramNames) {
            $paramNames[] = $matches[1];
            return '([^/]+)';
        }, $uri);

        $pattern = '#^' . $pattern . '$#';

        $this->routes[$method][] = [
            'pattern'    => $pattern,
            'paramNames' => $paramNames,
            'handler'    => $handler,
        ];
    }

    public function dispatch(string $method, string $requestUri): void
    {
        // Quita query string (?foo=bar) y normaliza barras finales
        $path = parse_url($requestUri, PHP_URL_PATH) ?? '/';
        $path = '/' . trim($path, '/');

        // El frontend pega a http://localhost:8000/api/... pero las rutas
        // están registradas sin el prefijo (ej. /categorias), así que lo sacamos:
        $path = preg_replace('#^/api#', '', $path) ?: '/';
        $path = '/' . trim($path, '/');

        $routes = $this->routes[$method] ?? [];

        foreach ($routes as $route) {
            if (preg_match($route['pattern'], $path, $matches)) {
                array_shift($matches); // quita el match completo

                $params = array_combine($route['paramNames'], $matches) ?: [];

                [$controllerClass, $methodName] = $route['handler'];
                $controller = new $controllerClass();

                $controller->$methodName(...array_values($params));
                return;
            }
        }

        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => "Ruta no encontrada: {$method} {$path}",
        ]);
    }
}