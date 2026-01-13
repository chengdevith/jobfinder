@Library('share_lib') _
pipeline {
    agent any
    environment {
        FULL_IMAGE = "benz3528/jobfinder:latest"
    }
    stages {
        stage('Build') {
            steps {
                buildDocker(
                    image: FULL_IMAGE
                )
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
    }
}
