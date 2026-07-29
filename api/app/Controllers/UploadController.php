<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;

class UploadController
{
    private const MAX_BYTES = 5_242_880; // 5 MB

    /** @var array<string, string> */
    private const MIME_TO_EXT = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
        'image/gif'  => 'gif',
    ];

    /** POST /upload/producto-imagen */
    public function productoImagen(): void
    {
        Auth::require();

        if (empty($_FILES['imagen']) || $_FILES['imagen']['error'] !== UPLOAD_ERR_OK) {
            $this->json(['success' => false, 'message' => 'No se recibió una imagen válida'], 422);
            return;
        }

        $file = $_FILES['imagen'];

        if ($file['size'] > self::MAX_BYTES) {
            $this->json(['success' => false, 'message' => 'La imagen no puede superar 5 MB'], 422);
            return;
        }

        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($file['tmp_name']) ?: '';

        if (!isset(self::MIME_TO_EXT[$mime])) {
            $this->json([
                'success' => false,
                'message' => 'Formato no permitido. Usa JPG, PNG, WEBP o GIF',
            ], 422);
            return;
        }

        $uploadDir = dirname(__DIR__, 2) . '/Public/uploads/productos/';

        if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
            $this->json(['success' => false, 'message' => 'No se pudo crear la carpeta de subidas'], 500);
            return;
        }

        $filename = uniqid('prod_', true) . '.' . self::MIME_TO_EXT[$mime];
        $destination = $uploadDir . $filename;

        if (!move_uploaded_file($file['tmp_name'], $destination)) {
            $this->json(['success' => false, 'message' => 'Error al guardar la imagen'], 500);
            return;
        }

        $path = '/uploads/productos/' . $filename;

        $this->json([
            'success' => true,
            'data' => [
                'path' => $path,
                'url'  => $path,
            ],
        ], 201);
    }

    private function json(array $payload, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    }
}
