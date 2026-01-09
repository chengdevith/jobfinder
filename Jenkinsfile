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
        stage('Run Test') {
            steps {
                script {
                    if (params.RUN_TEST) {
                        sh """
                        npm ci
                        npm run test:ci
                        """
                    } else {
                        echo "Skip Run Test stage"
                    }
                }
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
                emailext(
                subject: "✅ SUCCESS: ${JOB_NAME} #${BUILD_NUMBER}",
                to: "chengdevith5@gmail.com",
                mimeType: 'text/html',
                body: """
                <h2>Build Success 🎉</h2>
                <p><b>Project:</b> JobFinder Frontend</p>
                <p><b>Job:</b> ${JOB_NAME}</p>
                <p><b>Build:</b> #${BUILD_NUMBER}</p>
                <p><a href="${BUILD_URL}">View Build</a></p>
                """
                )
                withCredentials([
                    string(credentialsId: 'DISCORD_WEBHOOK_URL', variable: 'DISCORD_WEBHOOK')
                ]) {
                    sh """
                    curl -H "Content-Type: application/json" \
                    -X POST \
                    -d '{
                    "username": "Jenkins",
                    "content": "✅ **Job SUCCESS** 🚀\\n\\n\
                    **Project:** JobFinder Frontend\\n\
                    **Job:** ${JOB_NAME}\\n\
                    **Build:** #${BUILD_NUMBER}\\n\
                    **SonarQube:** Quality Gate PASSED 🎯\\n\
                    🔗 ${BUILD_URL}"
                    }' \
                    ${DISCORD_WEBHOOK}
                    """
                }

            }
            failure {

                /* Telegram */
                withCredentials([
                    string(credentialsId: 'TELEGRAM_BOT_TOKEN', variable: 'BOT_TOKEN'),
                    string(credentialsId: 'TELEGRAM_CHAT_ID', variable: 'CHAT_ID')
                ]) {
                    sh """
                    curl -s -X POST https://api.telegram.org/bot${BOT_TOKEN}/sendMessage \
                    -d chat_id=${CHAT_ID} \
                    -d parse_mode=Markdown \
                    -d text="❌ *Job FAILED*
                    *Project:* JobFinder Frontend
                    *Job:* ${JOB_NAME}
                    *Build:* #${BUILD_NUMBER}
                    *Status:* FAILED 💥
                    🔗 ${BUILD_URL}"
                    """
                }

                /* Email */
                emailext(
                    subject: "❌ FAILED: ${JOB_NAME} #${BUILD_NUMBER}",
                    to: "chengdevith5@gmail.com",
                    mimeType: 'text/html',
                    body: """
                    <h2 style="color:red;">Build Failed ❌</h2>
                    <p><b>Project:</b> JobFinder Frontend</p>
                    <p><b>Job:</b> ${JOB_NAME}</p>
                    <p><b>Build:</b> #${BUILD_NUMBER}</p>
                    <p><a href="${BUILD_URL}">Check Logs</a></p>
                    """
                )

                /* Discord */
                withCredentials([
                    string(credentialsId: 'DISCORD_WEBHOOK_URL', variable: 'DISCORD_WEBHOOK')
                ]) {
                    sh """
                    curl -H "Content-Type: application/json" -X POST \
                    -d '{
                        "username": "Jenkins",
                        "content": "❌ **Job FAILED** 💥\\n\\n\
                    **Project:** JobFinder Frontend\\n\
                    **Job:** ${JOB_NAME}\\n\
                    **Build:** #${BUILD_NUMBER}\\n\
                    🔗 ${BUILD_URL}"
                                }' \
                    ${DISCORD_WEBHOOK}
                    """
                }
            }
    }
    
    
}
