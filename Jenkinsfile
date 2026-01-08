pipeline {
    agent any
    environment {
        REPO_NAME = 'benz3528'
        IMAGE_NAME = 'jobfinder'
        TAG = 'latest'
        FULL_IMAGE = "${REPO_NAME}/${IMAGE_NAME}:${TAG}"
    }
    
    tools {
        nodejs 'node-v24-lts'
    }
    stages {
        stage('Clone') {
            steps {
                git branch: 'main', url: 'https://github.com/chengdevith/jobfinder.git'
                sh 'ls -lrt'
            }
        }
        stage('Run Test') {
            steps {
                sh """
                    npm ci
                    npm run test:ci
                """
            }
        }
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonarqube') {
                    script {
                        def scannerHome = tool 'sonarqube'
                        sh """
                            ${scannerHome}/bin/sonar-scanner \
                                -Dsonar.projectKey=jobfinder-frontend \
                                -Dsonar.projectName=JobFinder-Frontend \
                                -Dsonar.sources=. \
                                -Dsonar.exclusions=node_modules/**,.next/**,dist/** \
                                -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                        """
                    }
                }
            }
        }
        stage('Quality Gate') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build') {
            steps {
                sh """
                    docker build -t "${FULL_IMAGE}" .
                """
            }
        }
        stage('Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'DOCKERHUB-CREDENTIAL', passwordVariable: 'DH_PASSWORD', usernameVariable: 'DH_USERNAME')]) 
                {
                    sh """
                        echo "$DH_PASSWORD" | docker login -u "$DH_USERNAME" --password-stdin
                        docker push ${FULL_IMAGE}
                        docker logout
                    """
                }
            }
        }
        stage('Deploy') {
            steps {
                sh """
                    docker stop "${IMAGE_NAME}"-cont || true
                    docker rm "${IMAGE_NAME}"-cont || true
                    docker run -dp 3000:3000 \
                        --name "${IMAGE_NAME}"-cont \
                        "${IMAGE_NAME}"
                """
            }
        }
        post {
            success {
                withCredentials([
                    string(credentialsId: 'TELEGRAM_BOT_TOKEN', variable: 'BOT_TOKEN'),
                    string(credentialsId: 'TELEGRAM_CHAT_ID', variable: 'CHAT_ID')
                ]) {
                    sh """
                        curl -s -X POST https://api.telegram.org/bot${BOT_TOKEN}/sendMessage \
                        -d chat_id=${CHAT_ID} \
                        -d parse_mode=Markdown \
                        -d text="✅ *Job SUCCESS*

                        *Project:* JobFinder Frontend
                        *Job:* ${JOB_NAME}
                        *Build:* #${BUILD_NUMBER}
                        *SonarQube:* Quality Gate PASSED 🎯
                        "
                    """
                }
            }
        }

    }
}
