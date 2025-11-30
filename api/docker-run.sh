#!/bin/bash

echo "🛠️ Rodando Migrations e Seeders..."
php artisan migrate:fresh --seed --force

echo "🚀 Iniciando o Servidor Apache..."
exec apache2-foreground