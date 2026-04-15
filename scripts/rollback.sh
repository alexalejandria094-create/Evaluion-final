#!/bin/bash
# scripts/rollback.sh
set -e

# Asumiendo que guardamos un tag anterior como "previous" 
# Este script reinicia el contenedor usando un tag específico
# Uso: ./ rollback.sh <tag>

TAG=${1:-latest}

echo "=== Preparando rollback a $TAG ==="

# Aquí en un entorno de CI/CD real se modificaría 
# la imagen en el docker-compose o se haría un docker run directamente.

echo "Recreando contenedores docker..."
docker-compose down
# TODO: Establecer variable de entorno de TAG u otro mecanismo.
docker-compose up -d

echo "=== Rollback a $TAG hipotéticamente completado ==="
