/**
 * Pipeline CI/CD — GOrbitSF (Frontend).
 * Mismo flujo que PSD-DMP (docente): Clone → Install → Sonar → Build → Deploy.
 * Deploy: Termux + Nginx (no Tomcat WAR).
 */
pipeline {
    agent any

    tools {
        nodejs 'NodeJS 22'   // mismo nombre que en Manage Jenkins → Tools
    }

    parameters {
        booleanParam(name: 'DEPLOY_TO_SERVER', defaultValue: false,
            description: 'Si true, despliega a Termux (tar + scp + deploy.sh)')
        string(name: 'TERMUX_HOST', defaultValue: '192.168.2.4', description: 'IP Termux')
        string(name: 'TERMUX_USER', defaultValue: 'u0_a296', description: 'Usuario SSH')
        string(name: 'TERMUX_PORT', defaultValue: '8022', description: 'Puerto SSH')
    }

    environment {
        GITHUB_TOKEN   = credentials('github-token')
        SONAR_TOKEN    = credentials('Sonarqube')
        SONAR_HOST_URL = 'http://sonarqube:9000'
        GIT_REPO_URL   = "${env.GIT_REPO_URL ?: 'https://github.com/CodeNowDAVD/gorbits-fronted.git'}"
        DIST_DIR       = 'dist/gorbitsf/browser'
        FRONTEND_URL   = "http://${params.TERMUX_HOST}:8088"
        HEALTH_URL     = "http://${params.TERMUX_HOST}:8088/api/actuator/health"
    }

    stages {

        stage('Clone') {
            steps {
                timeout(time: 3, unit: 'MINUTES') {
                    git branch: "${env.BRANCH_NAME ?: 'main'}",
                        credentialsId: 'github-token',
                        url: "${GIT_REPO_URL}"
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    sh 'npm ci'
                }
            }
        }

        stage('Sonar') {
            steps {
                timeout(time: 15, unit: 'MINUTES') {
                    withSonarQubeEnv('sonarqube') {
                        sh """
                            npx sonar-scanner \
                                -Dsonar.projectKey=GOrbitSF \
                                -Dsonar.projectName=GOrbitSF \
                                -Dsonar.sources=src \
                                -Dsonar.exclusions=**/node_modules/**,**/*.spec.ts \
                                -Dsonar.token=${SONAR_TOKEN} \
                                -Dsonar.host.url=${SONAR_HOST_URL}
                        """
                    }
                }
            }
        }

        stage('Build') {
            steps {
                timeout(time: 15, unit: 'MINUTES') {
                    sh '''
                        chmod +x ci/build-production.sh
                        ./ci/build-production.sh
                    '''
                }
            }
        }

        stage('Deploy Frontend') {
            when {
                expression { params.DEPLOY_TO_SERVER }
            }
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    sh """
                        export TERMUX_HOST='${params.TERMUX_HOST}'
                        export TERMUX_USER='${params.TERMUX_USER}'
                        export TERMUX_PORT='${params.TERMUX_PORT}'
                        chmod +x ci/deploy-frontend-termux.sh
                        ./ci/deploy-frontend-termux.sh
                    """
                }
            }
        }
    }

    post {
        success {
            script {
                echo "Build OK → ${DIST_DIR}"
                if (params.DEPLOY_TO_SERVER) {
                    echo "App → ${FRONTEND_URL}/login"
                    echo "Health → ${HEALTH_URL}"
                }
            }
        }
        failure {
            echo 'Revisar npm, Sonar, build o deploy SSH.'
        }
        always {
            archiveArtifacts artifacts: 'dist/gorbitsf/browser/**',
                              allowEmptyArchive: true
        }
    }
}
