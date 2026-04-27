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

        // Tambah ini — sesuaikan dengan VM deploy kamu
        DEPLOY_USER    = "kelompok2"           // user SSH di VM deploy
        DEPLOY_HOST    = "10.34.100.179"      // IP VM deploy
        SSH_KEY_ID     = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC6pG9C7fpRSVQwpnxTLVJSK1UptJ/GEzgJERo05F2nLCecpjwDN9H279jJchgZoRyYQrHdmCCYC83pK5Mk7xzw6msZW1ch0uvRAaUPu9XuC/xIv9qKoGZxdyKysnWEAL/JYCWAa6iCp7EEGmBI4jZk3NT5gsxjJ+Vowtl3UtzYb2e9mCgEdHsumtKS06PIkAaRQiAO3aFAlWXj7aiYitcRh0AEc9obu/T7H75b6Gkt18Dndonxev0u9qa7szSLcwfJy4Mvu1xM3kcUfE3AS0D5Ljl0bMO22B+9ocsMa4B6hUBlQ/VkpSn0y8V5F4lQ3STo2ZowfshVC1PFYGRvr1WgjINDfRkX/Zhg7Y1su4Y3pxTHHyPkXFT38WrfUWdayhXndY/Se6/Se2PdsJYkcZRIfnFczru7faoCokUVpOuJIizCDc5h1SnlfgQYc4u9kWyt6az9O/tjYgeTNwdTocSVSOjlyOS71YlEVSGpeEv3T9KbwCp4mecTpbdsxjEod9A42Mwz2Q89k+mZCo7X8KwurII+vqjoaGDlL0GvOOIg/VMRADcZ7yo0W8AACHCTP4VrF1xppDsVPFZAev66RVMu9GX0V79VmH2g7x126pgBIeo1R9vW8X8IMl+i1K7r40fJ354Ga07A7upNBTnTdSo6xtwIMhWCEUWwzHbsAJv+ZQ== jenkins-kelompok2"    // ID credential SSH di Jenkins
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
        stage('Build') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ./app"
            }
        }
        stage('Test') {
            steps {
                sh "docker run --rm ${IMAGE_NAME}:${IMAGE_TAG} python -m pytest /app/tests/ -v"
            }
        }

        // Tambah stage: kirim image ke VM deploy via docker save + scp
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

        //  Deploy sekarang jalan di VM deploy via SSH
        stage('Deploy') {
            steps {
                sshagent(credentials: [SSH_KEY_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} '
                            docker stop ${CONTAINER_NAME} || true
                            docker rm   ${CONTAINER_NAME} || true
                            docker run -d \
                                --name ${CONTAINER_NAME} \
                                -p ${APP_PORT}:5000 \
                                ${IMAGE_NAME}:${IMAGE_TAG}
                        '
                    """
                }
            }
        }

        // Cleanup image lama — di kedua server
        stage('Cleanup') {
            steps {
                script {
                    def prevTag = BUILD_NUMBER.toInteger() - 1

                    // Hapus image lama di Jenkins server
                    sh "docker rmi ${IMAGE_NAME}:${prevTag} || true"

                    // Hapus image lama di VM deploy juga
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
            echo " Deploy ${JOB_NAME} build #${BUILD_NUMBER} berhasil! Akses di port ${APP_PORT}"
        }
        failure {
            echo "Build ${JOB_NAME} #${BUILD_NUMBER} gagal. Periksa log di atas."
            sh "docker stop ${CONTAINER_NAME} || true"
            sh "docker rm   ${CONTAINER_NAME} || true"
        }
    }
}
