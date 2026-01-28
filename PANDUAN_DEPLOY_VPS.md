# Panduan Deployment ke VPS (Nginx Only)

Metode ini lebih efisien karena Nginx langsung melayani file statis (`.html`, `.js`, `.css`) tanpa perlu menjalankan server Node.js/PM2 di background.

## 1. Persiapan Build di VPS

# Panduan Deployment FULL (Frontend + Backend)

Panduan ini akan menggabungkan **Frontend (Static)** dan **Backend (Express Port 7000)** dalam satu domain Nginx.

## 1. Persiapan Folder

Pastikan Frontend dan Backend ada di VPS.
Asumsi path:
- **Frontend**: `/var/resikartha/pwa/frontend-resik-artha-bank-pencatatan-sampah`
- **Backend**: (Sesuaikan dengan lokasi backend, misal `/var/resikartha/pwa/backend` atau satu folder dengan frontend jika di-monorepo).

**Build Frontend:**
```bash
cd /var/resikartha/pwa/frontend-resik-artha-bank-pencatatan-sampah
git pull origin main
npm install
npm run build
```
*(Hasil build ada di folder `dist`)*

**Pastikan Backend Jalan:**
Pastikan backend Anda berjalan di port **7000** (misal menggunakan PM2).
```bash
pm2 start server.js --name "backend-resik"
```

## 2. Update Konfigurasi Nginx (GABUNGAN)

Karena file `/etc/nginx/sites-available/resik-artha` sudah ada, kita akan **EDIT** file tersebut agar melayani KEDUANYA.

```bash
sudo nano /etc/nginx/sites-available/resik-artha
```

**HAPUS SEMUA ISINYA**, lalu **PASTE** konfigurasi berikut:

```nginx
server {
    listen 80;
    server_name resikarthamargodadi.axeoma.my.id;

    # =========================================
    # 1. FRONTEND CONFIG
    # =========================================
    # Path folder dist (Frontend Build)
    root /var/resikartha/pwa/frontend-resik-artha-bank-pencatatan-sampah/dist;
    index index.html;

    # React Router Handler
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Frontend Assets Cache
    location ~* \.(?:ico|css|js|gif|jpe?g|png|svg|woff2?|json)$ {
        expires 1y;
        add_header Cache-Control "public";
        access_log off;
    }

    # =========================================
    # 2. BACKEND API PROXY
    # =========================================
    # Mengarahkan /api ke Backend (Port 7000)
    location /api/ {
        proxy_pass http://localhost:7000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Proxy Uploads (jika backend menyimpan file gambar)
    location /uploads/ {
        proxy_pass http://localhost:7000;
    }

    # =========================================
    # 3. GLOBAL
    # =========================================
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;
}
```

## 3. Restart dan Cek

1.  Cek apakah config valid:
    ```bash
    sudo nginx -t
    ```
2.  Restart Nginx:
    ```bash
    sudo systemctl restart nginx
    ```

Sekarang domain `resikarthamargodadi.axeoma.my.id` melayani:
-   **Frontend**: Saat akses halaman utama `/`
-   **Backend**: Saat akses `/api/...`

## 4. Fix Permission Error (403)

Jika Frontend muncul "403 Forbidden", jalankan:
```bash
sudo chmod 755 -R /var/resikartha/pwa/frontend-resik-artha-bank-pencatatan-sampah
```
