#!/bin/bash

# $1 es el entorno al cual cambiar: 'blue' o 'green'
ENVIRONMENT=$1

if [ "$ENVIRONMENT" == "green" ]; then
    echo "Cambiando tráfico hacia GREEN (app-green)"
    sed -i 's/server app-blue:8080;/server app-green:8080;/g' nginx/nginx.conf
elif [ "$ENVIRONMENT" == "blue" ]; then
    echo "Cambiando tráfico hacia BLUE (app-blue)"
    sed -i 's/server app-green:8080;/server app-blue:8080;/g' nginx/nginx.conf
else
    echo "Entorno no válido. Usa 'blue' o 'green'."
    exit 1
fi

echo "Recargando configuración de nginx..."
docker exec veterinaria-nginx nginx -s reload
echo "Tráfico cambiado exitosamente."
