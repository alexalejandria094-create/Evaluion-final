#!/bin/bash
# scripts/build.sh
set -e

# Asegurar que estamos en el directorio raíz del proyecto
cd "$(dirname "$0")/.."

echo "=== Compilando el proyecto veterinaría backend ==="
docker-compose build app

echo "=== Construcción finalizada ==="
