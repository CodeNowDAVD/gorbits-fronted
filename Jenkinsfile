/**
 * Pipeline CI/CD — GOrbitSF (Frontend).
 * Clone → Install → Test (cobertura) → Sonar → Build → Deploy HTTP.
 */
pipeline {
    agent any

    tools {
        nodejs 'NodeJS 22'
    }

    parameters {
        booleanParam(name: 'DEPLOY_TO_SERVER', defaultValue: false,
            description: 'Si true, POST tar.gz a https://app.gorbits.xyz/deploy (Bearer)')
    }

    environment {
        GITHUB_TOKEN   = credentials('github-token')
        SONAR_HOST_URL = 'http://sonarqube:9000'
        GIT_REPO_URL   = "${env.GIT_REPO_URL ?: 'https://github.com/CodeNowDAVD/gorbits-fronted.git'}"
        DIST_DIR       = 'dist/gorbitsf/browser'
        DEPLOY_URL     = 'https://app.gorbits.xyz/deploy'
        FRONTEND_URL   = 'https://app.gorbits.xyz'
        HEALTH_URL     = 'https://app.gorbits.xyz/api/actuator/health'
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

        stage('Test') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    sh 'npm run test:ci'
                }
            }
        }

        stage('Sonar') {
            steps {
                timeout(time: 15, unit: 'MINUTES') {
                    withSonarQubeEnv('sonarqube') {
                        sh '''
                            npx sonar-scanner \
                                -Dsonar.host.url=http://sonarqube:9000
                        '''
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
                    withCredentials([string(
                        credentialsId: 'gorbits-deploy-token',
                        variable: 'DEPLOY_TOKEN')]) {
                        sh '''
                            chmod +x ci/deploy-http-gorbits.sh
                            ./ci/deploy-http-gorbits.sh
                        '''
                    }
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
            echo 'Revisar npm, tests, Sonar, build o deploy HTTP (/deploy).'
        }
        always {
            archiveArtifacts artifacts: 'dist/gorbitsf/browser/**,coverage/gorbitsf/**',
                              allowEmptyArchive: true
        }
    }
}
