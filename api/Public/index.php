<?php



declare(strict_types=1);



use App\Core\Database;

use App\Core\Router;

use App\Core\Auth;

use Dotenv\Dotenv;



require_once __DIR__ . '/../vendor/autoload.php';



$dotenv = Dotenv::createImmutable(dirname(__DIR__));

$dotenv->load();



/*

|--------------------------------------------------------------------------

| CORS

|--------------------------------------------------------------------------

*/



$allowedOrigins = array_values(array_filter(array_map(
    'trim',
    explode(',', $_ENV['FRONTEND_URL'] ?? 'http://localhost:5173')
)));

$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($requestOrigin !== '' && in_array($requestOrigin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $requestOrigin);
    header('Vary: Origin');
} elseif ($allowedOrigins !== []) {
    header('Access-Control-Allow-Origin: ' . $allowedOrigins[0]);
}

header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');

header('Access-Control-Allow-Headers: Content-Type, Authorization');

header('Access-Control-Allow-Credentials: true');



/*

|--------------------------------------------------------------------------

| Archivos estáticos (uploads)

|--------------------------------------------------------------------------

*/



$requestPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/';



if (str_starts_with($requestPath, '/uploads/')) {

    $filePath = __DIR__ . $requestPath;



    if (is_file($filePath)) {

        $mime = mime_content_type($filePath) ?: 'application/octet-stream';

        header('Content-Type: ' . $mime);

        header('Cache-Control: public, max-age=86400');

        readfile($filePath);

        exit;

    }



    http_response_code(404);

    exit;

}



header('Content-Type: application/json; charset=UTF-8');



Auth::init();



/*

|--------------------------------------------------------------------------

| Preflight

|--------------------------------------------------------------------------

*/



if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {

    http_response_code(204);

    exit;

}



/*

|--------------------------------------------------------------------------

| Errores (dev)

|--------------------------------------------------------------------------

*/



ini_set('display_errors', '1');

ini_set('display_startup_errors', '1');

error_reporting(E_ALL);



/*

|--------------------------------------------------------------------------

| DB

|--------------------------------------------------------------------------

*/



try {

    Database::connect();

} catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([

        'success' => false,

        'message' => 'Error de conexión a la base de datos',

    ]);

    exit;

}



/*

|--------------------------------------------------------------------------

| ROUTER

|--------------------------------------------------------------------------

*/



$router = new Router();



require_once __DIR__ . '/../app/Routes/api.php';



$router->dispatch(

    $_SERVER['REQUEST_METHOD'],

    $_SERVER['REQUEST_URI']

);

