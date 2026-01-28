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

# Clone Repository
git clone https://github.com/jokpram/frontend-resik-artha-bank-pencatatan-sampah.git
cd frontend-resik-artha-bank-pencatatan-sampah

# Install & Build
npm install
npm run build
```

Setelah perintah ini, akan muncul folder `dist`. Folder inilah yang akan kita serve.

## 2. Pindahkan Build ke Folder Web (Opsional tapi Rapi)

Disarankan memindahkan hasil build ke `/var/www` agar lebih terstandar.

```bash
# Buat folder tujuan
sudo mkdir -p /var/www/resik-artha

# Copy isi folder dist ke folder tujuan
sudo cp -r dist/* /var/www/resik-artha/

# Atur permission agar Nginx bisa baca
sudo chown -R www-data:www-data /var/www/resik-artha
sudo chmod -R 755 /var/www/resik-artha
```

## 3. Konfigurasi Nginx

Gunakan konfigurasi `nginx.conf` yang ada di repo ini sebagai dasar.

```bash
# Install Nginx
sudo apt install -y nginx

# Buat file config baru
sudo nano /etc/nginx/sites-available/resik-artha
```

Paste konfigurasi berikut:

```nginx
server {
    listen 80;
    server_name resikarthamargodadi.axeoma.my.id;

    # Arahkan root ke folder tempat kita copy file build tadi
    root /var/www/resik-artha;
    
    index index.html;

    # HANDLING REACT ROUTER (PENTING!)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Optimasi Cache Asset
    location ~* \.(?:ico|css|js|gif|jpe?g|png|svg|woff2?|json)$ {
        expires 1y;
        add_header Cache-Control "public";
        access_log off;
    }
}
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
