# Panduan Deployment ke VPS (PM2 + Nginx)

Berikut adalah langkah-langkah untuk mendeploy aplikasi Frontend React (Vite) ke VPS Ubuntu menggunakan PM2 dan Nginx.

## 1. Persiapan di VPS

Pastikan Anda sudah menginstall **Node.js**, **NPM**, **PM2**, dan **Nginx**.

```bash
# Update Server
sudo apt update && sudo apt upgrade -y

# Install Node.js (via NVM atau source setup)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 secara global
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

## 2. Setup Project di VPS

Upload kodingan ke VPS (bisa via git clone).

```bash
# Clone Repository (contoh)
git clone https://github.com/jokpram/frontend-resik-artha-bank-pencatatan-sampah.git
cd frontend-resik-artha-bank-pencatatan-sampah

# Install Dependencies
npm install

# Build Project (Menghasilkan folder dist)
npm run build
```

## 3. Jalankan dengan PM2

Kita akan menggunakan fitur `serve` bawaan PM2 untuk menjalankan folder statis `dist`.
File `ecosystem.config.cjs` sudah disiapkan di root folder project.

```bash
# Jalankan PM2
pm2 start ecosystem.config.cjs

# Simpan konfigurasi agar auto-start saat restart server
pm2 save
pm2 startup
```

Sekarang aplikasi berjalan di **http://localhost:5173**.

## 4. Konfigurasi Nginx

Gunakan file konfigurasi yang sudah dibuatkan (`nginx.conf`) sebagai referensi.

```bash
# Buat file konfigurasi baru di Nginx
sudo nano /etc/nginx/sites-available/resik-artha

# Paste isi dari file 'nginx.conf' yang ada di project ini
# (Pastikan server_name sudah sesuai: resikarthamargodadi.axeoma.my.id)
```

Isi Nginx Config:
```nginx
server {
    listen 80;
    server_name resikarthamargodadi.axeoma.my.id;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Aktifkan konfigurasi:

```bash
# Buat symlink
sudo ln -s /etc/nginx/sites-available/resik-artha /etc/nginx/sites-enabled/

# Cek konfigurasi
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## 5. Pasang SSL (HTTPS)

Gunakan Certbot agar website aman (gembok hijau).

```bash
# Install Certbot (jika belum ada)
sudo apt install -y certbot python3-certbot-nginx

# Request Certificate
sudo certbot --nginx -d resikarthamargodadi.axeoma.my.id
```

Selesai! Aplikasi Anda sekarang dapat diakses di `https://resikarthamargodadi.axeoma.my.id`.
