# Panduan Deployment ke VPS (Nginx Only)

Metode ini lebih efisien karena Nginx langsung melayani file statis (`.html`, `.js`, `.css`) tanpa perlu menjalankan server Node.js/PM2 di background.

## 1. Persiapan Build di VPS

Upload kodingan dan build project untuk menghasilkan folder `dist`.

```bash
# Update Server
sudo apt update

# Install Node.js (Hanya untuk proses build)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

## 1. Persiapan Build di VPS

Masuk ke folder project Anda di VPS:

```bash
cd /var/resikartha/pwa/frontend-resik-artha-bank-pencatatan-sampah

# Update code terbaru dari git (jika ada perubahan)
git pull origin main

# Install & Build
npm install
npm run build
```

Setelah perintah ini, akan muncul folder `dist` di dalam folder project tersebut (`/var/resikartha/pwa/frontend-resik-artha-bank-pencatatan-sampah/dist`).

## 2. Konfigurasi Nginx

Tidak perlu memindahkan folder build. Kita bisa langsung arahkan Nginx ke folder `dist` di lokasi tersebut.

```bash
# Install Nginx (jika belum)
sudo apt install -y nginx

# Buat file config baru
sudo nano /etc/nginx/sites-available/resik-artha
```

Paste konfigurasi berikut:

```nginx
server {
    listen 80;
    server_name resikarthamargodadi.axeoma.my.id;

    # Root diarahkan langsung ke folder dist project
    root /var/resikartha/pwa/frontend-resik-artha-bank-pencatatan-sampah/dist;
    
    index index.html;

    # HANDLING REACT ROUTER
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Optimasi Cache Asset
    location ~* \.(?:ico|css|js|gif|jpe?g|png|svg|woff2?|json)$ {
        expires 1y;
        add_header Cache-Control "public";
        access_log off;
    }

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;
}
```

## 3. Atur Permission (Opsional tapi Penting)

Pastikan user Nginx (`www-data`) bisa membaca folder tersebut. JIKA website menampilkan `403 Forbidden` error, jalankan ini:

```bash
# Tambahkan user www-data ke group root (atau owner folder) agar bisa baca
sudo chmod 755 -R /var/resikartha/pwa/frontend-resik-artha-bank-pencatatan-sampah
```

## 4. Aktifkan Website

```bash
# Buat symbolic link
sudo ln -s /etc/nginx/sites-available/resik-artha /etc/nginx/sites-enabled/

# Cek apakah config error
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## 5. Pasang SSL (HTTPS)

Agar website aman dan PWA bisa diinstall (Wajib HTTPS untuk PWA).

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Request Certificate
sudo certbot --nginx -d resikarthamargodadi.axeoma.my.id
```

Sekarang akses **https://resikarthamargodadi.axeoma.my.id**, website sudah live tanpa beban Node.js di server!
