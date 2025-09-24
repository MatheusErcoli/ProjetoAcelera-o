<?php
namespace App\Controller;

class RegistroController implements Controller
{
    public function render(): void
    {
        include __DIR__ . '/../View/includes/header.php';
        include __DIR__ . '/../View/pages/registro.php';
        include __DIR__ . '/../View/includes/footer.php';
    }
}