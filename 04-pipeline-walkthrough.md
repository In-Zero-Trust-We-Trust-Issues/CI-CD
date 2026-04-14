# 04 - Pipeline Walkthrough

Penjelasan lengkap tentang Jenkinsfile dan alur setiap stage pada pipeline CI/CD.

---

## Struktur Jenkinsfile

```groovy
pipeline {
    agent any
    
    environment { ... }   // Variabel global
    
    stages {
        stage('Checkout')    { ... }  // Stage 1: Clone repo
        stage('Build')       { ... }  // Stage 2: Build Docker image
        stage('Test')        { ... }  // Stage 3: Jalankan test
        stage('Push Image')  { ... }  // Stage 4: Push ke Docker Hub
        stage('Deploy')      { ... }  // Stage 5: Deploy ke 4 App Server
        stage('Health Check'){ ... }  // Stage 6: Verifikasi deployment
    }
    
    post { ... }  // Notifikasi & cleanup
}
```

---

## Penjelasan Per Stage

### Stage 1: Checkout
Jenkins meng-clone repository dari Git. Karena kita menggunakan "Pipeline script from SCM", clone terjadi secara otomatis sebelum pipeline dimulai. Stage ini digunakan untuk menampilkan informasi commit.

### Stage 2: Build
Membangun Docker image dari `Dockerfile` yang ada di `app/`. Tag image menggunakan `BUILD_NUMBER` Jenkins sehingga setiap build memiliki versi yang unik.

### Stage 3: Test
Menjalankan container sementara dari image yang baru dibangun untuk mengeksekusi unit test. Container dihapus setelah test selesai (`--rm`).

### Stage 4: Push Image
Login ke Docker Hub menggunakan credential yang tersimpan di Jenkins, lalu push image dengan dua tag: versi spesifik (`BUILD_NUMBER`) dan `latest`.

### Stage 5: Deploy
SSH ke setiap App Server secara berurutan, lalu:
1. Pull image terbaru dari Docker Hub
2. Hentikan dan hapus container lama (jika ada)
3. Jalankan container baru dengan image terbaru

### Stage 6: Health Check
Menunggu beberapa detik agar container selesai startup, lalu memverifikasi bahwa container berjalan dan endpoint `/health` merespons dengan HTTP 200.

---

## File Jenkinsfile

Lihat file lengkap di: [jenkins/Jenkinsfile](jenkins/Jenkinsfile)

---

## Memahami Docker dalam Pipeline

```
Jenkins Server (VM-0)
│
├── docker build -t username/webapp:42 ./app
│   └── Membaca Dockerfile, membuat image
│
├── docker run --rm username/webapp:42 python -m pytest
│   └── Jalankan test dalam container, hapus setelah selesai
│
├── docker push username/webapp:42
│   └── Upload image ke Docker Hub
│
└── SSH ke tiap App Server → docker pull → docker run
    └── App Server download & jalankan image terbaru
```

---

## Alur Data Pipeline

```
Git Repo                Jenkins Server              Docker Hub
   │                         │                          │
   │ 1. webhook/poll          │                          │
   │────────────────────────► │                          │
   │                         │                          │
   │ 2. git clone             │                          │
   │◄──────────────────────── │                          │
   │                         │                          │
   │                         │ 3. docker build          │
   │                         │─────────────────────────►│... (local)
   │                         │                          │
   │                         │ 4. docker run (test)      │
   │                         │─────────────────────(lokal, sementara)
   │                         │                          │
   │                         │ 5. docker push           │
   │                         │─────────────────────────►│
   │                         │                          │
   │              App Server 1-4          Docker Hub    │
   │                 │                        │         │
   │                 │ 6. docker pull         │         │
   │                 │◄───────────────────────┘         │
   │                 │                                  │
   │                 │ 7. docker run (container hidup)  │
   │                 │──────────────────────────────────┘
```

---

## Tips & Best Practices

1. **Gunakan TAG spesifik** — jangan hanya `latest` agar bisa rollback
2. **Simpan credentials di Jenkins** — jangan hardcode password di Jenkinsfile
3. **Gunakan `sshagent`** — lebih aman daripada expose private key langsung
4. **Health check setelah deploy** — deteksi kegagalan sebelum user terdampak
5. **`post { always { ... } }`** — selalu cleanup dan beri notifikasi

---

## Rollback Manual

Jika deploy terbaru bermasalah, rollback ke versi sebelumnya:

```bash
# Di setiap App Server, ganti TAG dengan build number sebelumnya
ssh deploy@10.34.100.178
docker stop webapp
docker rm webapp
docker run -d --name webapp -p 80:5000 username/webapp:41  # gunakan BUILD_NUMBER lama
```

Atau trigger Jenkins build ulang dari commit/tag yang stabil.
