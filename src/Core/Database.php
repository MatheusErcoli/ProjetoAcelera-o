<?php

namespace App\Core;

use Doctrine\DBAL\Connection;
use Doctrine\DBAL\DriverManager;
use Doctrine\ORM\Configuration;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\ORMSetup;
use Dotenv\Dotenv;

class Database
{
    private function __construct() {}

    private static EntityManager $entityManager;

    public static function getEntityManager(): EntityManager
    {
        if (!isset(self::$entityManager)) {
            self::$entityManager = new EntityManager(
                self::getConnection(), 
                self::getConfig()
            );
        }

        return self::$entityManager;
    }

    private static function getConfig(): Configuration
    {
        $paths = [__DIR__ . '/../Model'];
        $isDevMode = false;

        return ORMSetup::createAttributeMetadataConfiguration(
            $paths, 
            $isDevMode
        );
    }

    private static function getConnection(): Connection
    {
        
        $dotenv = Dotenv::createImmutable(__DIR__ . '/../../');
        $dotenv->load();
        $dbParams = [
            'driver'   => $_ENV['DB_DRIVER'],
            'user'     => $_ENV['DB_USER'],
            'password' => $_ENV['DB_PASSWORD'],
            'dbname'   => $_ENV['DB_DBNAME'],
            'host'     => $_ENV['DB_HOST']
        ];
        
        $config = self::getConfig();

        return DriverManager::getConnection(
            $dbParams, 
            $config
        );
    }
}
