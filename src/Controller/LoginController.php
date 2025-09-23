<?php
namespace App\Controller;

class LoginController implements Controller
{
    public function render(): void
    {
        include __DIR__ . '/../View/includes/header.php';
        include __DIR__ . '/../View/pages/login.php';
        include __DIR__ . '/../View/includes/footer.php';
    }
}
