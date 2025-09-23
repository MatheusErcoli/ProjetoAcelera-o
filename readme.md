### Requisitos
- PHP 8.2 ^
- Composer
- Mysql

### Configuração
1. Configure a variável $dbParams em src/Core/Database.php.
2. Crie o banco de dados.
3. Instale as dependencias.
```bash
composer install
```
4. Crie as tabelas no banco de dados.
```bash
composer create-db
```


### Execução
Atualizar tabelas:
```bash
composer update-db
```

Executar o projeto:
```bash
composer start
```