<?php
use App\Controller\LoginController;
use App\Controller\Controller;
use App\Controller\RegistroController;
$base = "https://{$_SERVER['SERVER_NAME']}{$_SERVER['SCRIPT_NAME']}";

require_once __DIR__ . '/../vendor/autoload.php';
$uri=$_SERVER['REQUEST_URI'];
$pages = [
    '/login' => new LoginController(),
    '/registro' => new RegistroController()
];
$controller = $pages[$uri];
$controller->render();
?>



