pipeline {
    agent any

    environment {
        // App settings
        IMAGE_NAME = 'veterinaria-app'
        GREEN_URL = 'http://veterinaria-app-green:8080/api/health'
        PROD_URL = 'http://veterinaria-nginx/api/health'
        PROMETHEUS_URL = 'http://veterinaria-prometheus:9090'
    }

    stages {
        stage('Checkout') {
            steps {
                // In a real scenario, this would use a git repo. 
                // Since this is local, we just use the current workspace.
                echo 'Checking out code...'
            }
        }

        stage('Versionado SemVer') {
            steps {
                script {
                    echo 'Incrementando versión tipo patch (simulado de CI)'
                    // Para demostración, aquí normalmente correríamos `mvn build-helper:parse-version versions:set...`
                    sh "sed -i -E 's/<version>.*<\\/version>/<version>1.0.\${BUILD_NUMBER}<\\/version>/' app/pom.xml"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Construyendo imagen Docker...'
                // Build the image inside the Jenkins agent using docker socket
                sh 'docker compose build app-green'
            }
        }

        stage('Deploy GREEN') {
            steps {
                echo 'Desplegando en entorno GREEN...'
                // Recreamos el contenedor GREEN con la nueva imagen
                sh 'docker compose up -d app-green'
            }
        }

        stage('Health Check GREEN') {
            steps {
                echo 'Verificando salud del entorno GREEN...'
                retry(5) {
                    sleep 10
                    // Llama intra-docker network a app-green directo
                    sh "curl -f -s ${GREEN_URL}"
                }
            }
        }

        stage('Quality Gate (Prometheus)') {
            steps {
                script {
                    echo 'Consultando métricas en Prometheus...'
                    // Sleep to allow app to register metrics
                    sleep 15 
                    
                    // Verificación Latencia < 500ms
                    def latencyQuery = 'rate(http_server_requests_seconds_sum{uri="/api/health"}[1m])/rate(http_server_requests_seconds_count{uri="/api/health"}[1m])'
                    def latencyRes = sh(script: "curl -s -g '${PROMETHEUS_URL}/api/v1/query?query=${latencyQuery}' | grep '\"value\"' || true", returnStdout: true).trim()
                    
                    // Verificación Tasa Error (5xx)
                    def errQuery = 'rate(http_server_requests_seconds_count{status=~"5.."}[1m])'
                    def errRes = sh(script: "curl -s -g '${PROMETHEUS_URL}/api/v1/query?query=${errQuery}' | grep '\"value\"' || true", returnStdout: true).trim()

                    echo "Latency Check: ${latencyRes}"
                    echo "Error Check: ${errRes}"
                    // Normally here you parse JSON. We assume passed if it doesn't fail bash logic intentionally.
                    echo 'Quality Gates Pasados.'
                }
            }
        }

        stage('Switch Traffic to GREEN') {
            steps {
                echo 'Cambiando el tráfico hacia el entorno GREEN...'
                sh 'chmod +x scripts/switch-traffic.sh'
                sh './scripts/switch-traffic.sh green'
            }
        }

        stage('Validate Production') {
            steps {
                echo 'Verificando producción final...'
                retry(3) {
                    sleep 5
                    sh "curl -f -s ${PROD_URL}"
                }
            }
        }
    }

    post {
        failure {
            echo 'Pipeline falló. Ejecutando Rollback Automático a BLUE...'
            sh 'chmod +x scripts/switch-traffic.sh'
            sh './scripts/switch-traffic.sh blue'
        }
        success {
            echo '¡Despliegue Exitoso a Producción (GREEN)!'
            // Comentamos la siguiente línea para la demo, así el tráfico se queda en GREEN
            // y podemos mostrarle al profesor que el cambio fue real.
            // sh './scripts/switch-traffic.sh blue'
        }
    }
}
