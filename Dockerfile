# Menggunakan image Node.js versi 18 berbasis Alpine Linux (ringan)
FROM node:18-alpine

# Menentukan direktori kerja di dalam container
WORKDIR /usr/src/app

# Menyalin file package.json dan package-lock.json terlebih dahulu
COPY package*.json ./

# Menginstal dependensi aplikasi (Express, SQLite3)
RUN npm install

# Menyalin seluruh kode sumber (termasuk app.js dan config.js) ke dalam container
COPY . .

# Membuka port 3000 agar aplikasi bisa diakses
EXPOSE 3000

# Perintah untuk menjalankan aplikasi
CMD [ "node", "app.js" ]