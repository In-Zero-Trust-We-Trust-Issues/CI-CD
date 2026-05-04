pipeline {
    agent any
    options {
        disableConcurrentBuilds()
    }
    environment {
        JOB_BASE_NAME  = "${JOB_NAME.split('/').last()}"
        IMAGE_NAME     = "${JOB_BASE_NAME}"
        IMAGE_TAG      = "${BUILD_NUMBER}"
        IMAGE_PREV_TAG = "${BUILD_NUMBER.toInteger() - 1}"
        CONTAINER_NAME = "${JOB_BASE_NAME}-app"
        APP_PORT       = "8082"
        DEPLOY_USER    = "kelompok2"
        DEPLOY_HOST    = "10.34.100.179"
        SSH_KEY_ID     = "deploy-ssh-kelompok2"
    }
    stages {
        stage('Clone') {
            steps {
                checkout scm
            }
        }
        stage('Debug') {
            steps {
                sh 'pwd'
                sh 'ls -R'
            }
        }

        stage('Transfer Env') {
            steps {
                sshagent(credentials: [SSH_KEY_ID]) {
                    sh """
                        scp -o StrictHostKeyChecking=no \
                            ${DEPLOY_USER}@${DEPLOY_HOST}:~/halotamu/.env \
                            ./app/.env
                    """
                }
            }
        }

        stage('Build') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ./app"
            }
        }
        stage('Test') {
            steps {
                echo "Frontend project — skipping backend test"
                sh "docker run --rm ${IMAGE_NAME}:${IMAGE_TAG} nginx -t"
            }
        }
        stage('Transfer Image') {
            steps {
                sshagent(credentials: [SSH_KEY_ID]) {
                    sh """
                        docker save ${IMAGE_NAME}:${IMAGE_TAG} | \
                        ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} \
                        'docker load'
                    """
                }
            }
        }
        stage('Deploy') {
            steps {
                sshagent(credentials: [SSH_KEY_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} '
                            docker stop ${CONTAINER_NAME} || true
                            docker rm   ${CONTAINER_NAME} || true
                            docker run -d \
                                --name ${CONTAINER_NAME} \
                                -p ${APP_PORT}:80 \
                                ${IMAGE_NAME}:${IMAGE_TAG}
                        '
                    """
                }
            }
        }
        stage('Cleanup') {
            steps {
                script {
                    def prevTag = BUILD_NUMBER.toInteger() - 1
                    sh "docker rmi ${IMAGE_NAME}:${prevTag} || true"
                    sshagent(credentials: [SSH_KEY_ID]) {
                        sh """
                            ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} \
                            'docker rmi ${IMAGE_NAME}:${prevTag} || true'
                        """
                    }
                }
            }
        }
    }
    post {
        success {
            echo "Deploy ${JOB_NAME} build #${BUILD_NUMBER} berhasil! Akses di port ${APP_PORT}"
        }
        failure {
            echo "Build ${JOB_NAME} #${BUILD_NUMBER} gagal. Periksa log di atas."
            sshagent(credentials: [SSH_KEY_ID]) {
                sh """
                    ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} '
                        docker stop ${CONTAINER_NAME} || true
                        docker rm   ${CONTAINER_NAME} || true
                    '
                """
            }
        }
    }
}
