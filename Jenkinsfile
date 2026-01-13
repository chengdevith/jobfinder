@Library('share_lib') _

pipeline {
    agent any

    parameters {
        booleanParam(name: 'NEXT', defaultValue: true, description: 'Next.js project')
        booleanParam(name: 'SPRING', defaultValue: false, description: 'Spring project')
        choice(name: 'ENV', choices: ['dev', 'prod'], description: 'Environment')
    }

    stages {
        stage('Build') {
            steps {
                buildDocker(
                    image: "jobfinder:${BUILD_NUMBER}",
                    env: params.ENV,
                    next: params.NEXT,
                    spring: params.SPRING
                )
            }
        }
    }
}
