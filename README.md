# Implementación de un Pipeline CI/CD con Versionado SemVer, Quality Gates y Rollback Automático para una Clínica Veterinaria usando Jenkins, Prometheus y Grafana

> **Proyecto académico de DevOps** — Demostración de un sistema completo de integración y entrega continua aplicado a una plataforma web de gestión veterinaria.

---

## 📋 Descripción General

Este proyecto implementa una solución **DevOps de extremo a extremo** para una clínica veterinaria ficticia. El objetivo principal no es solo la aplicación en sí, sino la **infraestructura de entrega de software** que la rodea: un pipeline automatizado que construye, versiona, despliega, valida y hace rollback de la aplicación sin intervención humana.

La aplicación es un backend REST en **Java 17 + Spring Boot** con un frontend web integrado, que gestiona mascotas, servicios veterinarios y citas. Toda la infraestructura corre sobre **Docker**, orquestada con **Docker Compose**.

---

## 🏗️ Arquitectura del Sistema

```
                        ┌─────────────┐
                        │   Jenkins   │  ← CI/CD Pipeline (Jenkinsfile)
                        └──────┬──────┘
                               │ Build & Deploy
              ┌────────────────┼─────────────────┐
              ▼                                   ▼
   ┌─────────────────┐               ┌─────────────────┐
   │  App BLUE :3001 │               │  App GREEN :3002 │
   │  (producción)   │               │  (nuevo release) │
   └────────┬────────┘               └────────┬─────────┘
            └──────────────┬──────────────────┘
                           ▼
                  ┌─────────────────┐
                  │  Nginx :80      │  ← Proxy inverso (Blue-Green switch)
                  └─────────────────┘
                           │
              ┌────────────┴──────────────┐
              ▼                           ▼
   ┌─────────────────┐        ┌───────────────────┐
   │  Prometheus     │        │     Grafana        │
   │  :9090          │◄───────│     :3000          │
   │  (métricas)     │        │  (visualización)   │
   └─────────────────┘        └───────────────────┘
```

---

## ⚙️ Componentes Principales

### 1. 🔧 Pipeline CI/CD — Jenkins
El pipeline declarativo (`Jenkinsfile`) automatiza todo el ciclo de vida del software con las siguientes etapas:

| Stage | Descripción |
|---|---|
| `Checkout` | Obtención del código fuente |
| `Versionado SemVer` | Incremento automático de versión `1.0.BUILD_NUMBER` en `pom.xml` |
| `Build Docker Image` | Construcción de la imagen de la app para el entorno GREEN |
| `Deploy GREEN` | Despliegue en contenedor GREEN (sin afectar producción BLUE) |
| `Health Check GREEN` | Verificación de salud del nuevo release (5 reintentos) |
| `Quality Gate (Prometheus)` | Consulta métricas reales: latencia y tasa de errores 5xx |
| `Switch Traffic → GREEN` | Nginx redirige el tráfico de producción al nuevo entorno |
| `Validate Production` | Verificación post-switch de que producción responde correctamente |
| `Rollback Automático` | En caso de fallo en cualquier stage, el tráfico regresa automáticamente a BLUE |

### 2. 🔢 Versionado Semántico (SemVer)
Cada ejecución del pipeline incrementa automáticamente la versión `PATCH` del proyecto siguiendo el estándar **MAJOR.MINOR.PATCH**:
- La versión se actualiza directamente en el `pom.xml` usando `sed` con la variable `${BUILD_NUMBER}` de Jenkins.
- Resultado: cada build genera un artefacto versionado único (ej. `1.0.42`).

### 3. 🚦 Quality Gates con Prometheus
Antes de cambiar el tráfico a producción, el pipeline consulta métricas reales en Prometheus:
- **Latencia promedio** del endpoint `/api/health` - debe ser aceptable
- **Tasa de errores HTTP 5xx** - debe ser 0 o cercana a 0
- Si las métricas no son satisfactorias, el pipeline falla y se ejecuta el rollback automático.

### 4. 🔄 Despliegue Blue-Green
El sistema mantiene **dos entornos idénticos** de la aplicación:
- **BLUE** (`:3001`): versión actual en producción
- **GREEN** (`:3002`): nueva versión siendo validada

Nginx actúa como proxy inverso y puede cambiar el tráfico entre ambos entornos en segundos a través del script `switch-traffic.sh`.

### 5. ↩️ Rollback Automático
Si cualquier stage del pipeline falla (Health Check, Quality Gate, Validate Production), el bloque `post { failure }` ejecuta automáticamente:
```groovy
sh './scripts/switch-traffic.sh blue'
```
Esto garantiza que producción siempre apunte a la última versión estable.

### 6. 📊 Observabilidad — Prometheus + Grafana
La aplicación Spring Boot expone métricas automáticamente vía **Micrometer** en `/actuator/prometheus`. El dashboard de Grafana muestra en tiempo real:

- **Mascotas Registradas** (`veterinaria_pets_created_total`)
- **Citas Programadas** (`veterinaria_appointments_created_total`)
- **Tiempo de Actividad** del servidor
- **Uso de Memoria JVM** (heap / non-heap)
- **Tasa de Peticiones por segundo (RPS)**

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Java 17 + Spring Boot 3 |
| Base de Datos | H2 (embebida, en memoria) |
| Frontend | HTML5 + CSS3 + JavaScript |
| Autenticación | Spring Security |
| Métricas | Micrometer + Spring Actuator |
| CI/CD | Jenkins LTS |
| Contenedores | Docker + Docker Compose |
| Proxy Inverso | Nginx 1.25 |
| Monitoreo | Prometheus 2.51 |
| Visualización | Grafana 10.4 |

---

## 🚀 Arranque del Proyecto

### Requisitos previos
- Docker Desktop instalado y corriendo
- Puertos disponibles: `80`, `3000`, `3001`, `3002`, `8080`, `9090`

### Iniciar todos los servicios
```bash
docker compose up -d --build
```

### Acceso a los servicios

| Servicio | URL | Credenciales |
|---|---|---|
| 🌐 Aplicación Web | http://localhost | `Alexis` / `1234` |
| 🔧 Jenkins | http://localhost:8080 | (configurado en primer uso) |
| 📈 Prometheus | http://localhost:9090 | — |
| 📊 Grafana | http://localhost:3000 | `admin` / `admin` |
| 🗄️ H2 Console | http://localhost:3001/h2-console | `sa` / (sin contraseña) |

### Detener todos los servicios
```bash
docker compose down
```

---

## 📁 Estructura del Proyecto

```
proyecto-veterinaria/
├── app/                        # Código fuente Spring Boot
│   ├── src/main/java/          # Controllers, Models, Repositories
│   ├── src/main/resources/     # application.properties, templates, static
│   ├── pom.xml                 # Dependencias Maven + versión SemVer
│   └── Dockerfile              # Imagen Docker de la aplicación
├── jenkins/                    # Configuración de Jenkins
├── monitoring/
│   ├── prometheus.yml          # Configuración de scraping
│   └── grafana/
│       ├── datasources.yml     # Fuente de datos Prometheus
│       ├── provisioning/       # Auto-provisioning de dashboards
│       └── dashboards/         # Dashboard JSON de Grafana
├── nginx/
│   └── nginx.conf              # Configuración Blue-Green routing
├── scripts/
│   ├── switch-traffic.sh       # Script de cambio de tráfico
│   └── build.sh                # Script de construcción
├── Jenkinsfile                 # Pipeline CI/CD declarativo
└── docker-compose.yml          # Orquestación de todos los servicios
```

---

## 📌 API REST Disponible

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/pets` | Listar todas las mascotas |
| `POST` | `/api/pets` | Registrar nueva mascota |
| `PUT/PATCH` | `/api/pets/{id}` | Actualizar mascota |
| `DELETE` | `/api/pets/{id}` | Eliminar mascota |
| `GET` | `/api/appointments` | Listar citas |
| `POST` | `/api/appointments` | Crear nueva cita |
| `GET` | `/api/services` | Listar servicios veterinarios |
| `GET` | `/api/health` | Health check de la aplicación |
| `GET` | `/api/stats` | Estadísticas generales |
| `GET` | `/actuator/prometheus` | Métricas para Prometheus |

---

## 👨‍💻 Autor

Proyecto desarrollado como trabajo académico de la materia de **DevOps / Integración Continua**.
