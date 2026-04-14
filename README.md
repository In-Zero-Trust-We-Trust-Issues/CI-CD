# Hands-On CI/CD dengan Jenkins & Docker

> Mata Kuliah: DevSecOps | Universitas Brawijaya  
> Topik: Continuous Integration / Continuous Deployment

---

## Deskripsi Lab

Pada lab ini, kamu akan membangun pipeline CI/CD menggunakan **Jenkins** untuk men-deploy aplikasi web berbasis container ke beberapa server secara otomatis.

### Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────────┐
│                        Developer                                │
│                    (push code ke Git)                           │
└──────────────────────────┬──────────────────────────────────────┘
                           │ webhook / polling
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              VM-0: Jenkins Server (10.34.100.200)              │
│  ┌──────────────┐  ┌────────────────┐  ┌────────────────────┐  │
│  │   Jenkins    │  │  Docker        │  │  SSH Key / Agent   │  │
│  │  (port 8080) │  │  (build image) │  │  (deploy ke VMs)   │  │
│  └──────────────┘  └────────────────┘  └────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ SSH Deploy
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   VM-1       │  │   VM-2       │  │   VM-3       │
│ App Server 1 │  │ App Server 2 │  │ App Server 3 │
│10.34.100.178│  │10.34.100.179│  │10.34.100.180│
│ Docker       │  │ Docker       │  │ Docker       │
│ [web-app]    │  │ [web-app]    │  │ [web-app]    │
└──────────────┘  └──────────────┘  └──────────────┘
          
          ┌──────────────┐
          │   VM-4       │
          │ App Server 4 │
          │10.34.100.181│
          │ Docker       │
          │ [web-app]    │
          └──────────────┘
```

### Spesifikasi VM

| VM   | Nama Host          | IP Address       | RAM  | CPU | Peran              |
|------|--------------------|------------------|------|-----|--------------------|
| VM-0 | jenkins-server     | 10.34.100.200   | 2 GB | 2   | Jenkins CI/CD      |
| VM-1 | app-server-1       | 10.34.100.178   | 1 GB | 1   | App Node 1         |
| VM-2 | app-server-2       | 10.34.100.179   | 1 GB | 1   | App Node 2         |
| VM-3 | app-server-3       | 10.34.100.180   | 1 GB | 1   | App Node 3         |
| VM-4 | app-server-4       | 10.34.100.181   | 1 GB | 1   | App Node 4         |

> OS: Ubuntu 22.04 LTS (semua VM)

---

## Alur CI/CD Pipeline

```
Code Push
    │
    ▼
[Stage 1: Checkout]
    │  Clone repo dari Git
    ▼
[Stage 2: Build]
    │  Build Docker image
    ▼
[Stage 3: Test]
    │  Jalankan unit test dalam container
    ▼
[Stage 4: Push Image]
    │  Push image ke Docker Hub / Registry
    ▼
[Stage 5: Deploy]
    │  SSH ke 4 VM, pull & run container baru
    ▼
[Stage 6: Health Check]
    │  Verifikasi container berjalan
    ▼
[Notifikasi Selesai]
```

---

## Struktur File Lab

```
CI:CD/
├── README.md                    ← Dokumen ini
├── 01-setup-jenkins.md          ← Panduan instalasi Jenkins
├── 02-setup-app-servers.md      ← Panduan setup App Server
├── 03-jenkins-configuration.md  ← Konfigurasi Jenkins & credentials
├── 04-pipeline-walkthrough.md   ← Penjelasan pipeline & Jenkinsfile
├── app/
│   ├── Dockerfile               ← Docker image untuk web app
│   ├── app.py                   ← Aplikasi web (Flask)
│   ├── requirements.txt         ← Python dependencies
│   ├── templates/
│   │   └── index.html           ← Halaman web
│   └── tests/
│       └── test_app.py          ← Unit tests
├── jenkins/
│   ├── Jenkinsfile              ← Pipeline script
│   └── jenkins-plugins.txt      ← Daftar plugin Jenkins
└── scripts/
    ├── setup-jenkins.sh         ← Script otomatis setup Jenkins VM
    ├── setup-appserver.sh       ← Script otomatis setup App VM
    └── deploy.sh                ← Script deploy ke App VM
```

---

## Prasyarat

- Hypervisor: VirtualBox / VMware / Proxmox / cloud (GCP/AWS)
- 5 VM Ubuntu 22.04 LTS sudah berjalan dan bisa saling berkomunikasi
- Akses internet dari semua VM
- Akun Docker Hub (gratis)
- Akun GitHub / GitLab (gratis)

---

## Mulai Dari Sini

1. [01 - Setup Jenkins Server](01-setup-jenkins.md)
2. [02 - Setup App Servers](02-setup-app-servers.md)
3. [03 - Konfigurasi Jenkins](03-jenkins-configuration.md)
4. [04 - Pipeline Walkthrough](04-pipeline-walkthrough.md)
