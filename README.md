# 🍽️ Rekomendasi Tempat Makan

Aplikasi web sederhana yang menampilkan daftar restoran dan memungkinkan pengguna untuk memberikan review singkat terkait tempat makan tersebut. Project ini dibuat sebagai bagian dari Ujian Pemrograman Web.

---

## 📌 Fitur Utama

✅ **CRUD Restoran**
- Tambah restoran baru
- Edit informasi restoran
- Hapus restoran
- Lihat detail restoran dengan rating

✅ **CRUD Review**
- Tambah review dengan rating 1-5
- Edit review yang sudah ada
- Hapus review
- Lihat semua review per restoran

✅ **Statistik & Rating**
- Rating rata-rata per restoran
- Jumlah total review
- Sorting by popularity

✅ **UI/UX **
- Design responsif (mobile-friendly)
- Gradasi warna 
- Animasi smooth
- User-friendly interface

## 🛠️ Tech Stack
**Frontend:**
- React.js
- CSS3 dengan animations
**Backend:**
- Node.js
- Express.js
- MySQL
**Database:**
- XAMPP (Apache + MySQL)

## 🚀 Quick Start
### 1. Setup Database
- Buka XAMPP, start Apache dan MySQL
- Akses phpMyAdmin di `http://localhost/phpmyadmin`

-- Buat Database
CREATE DATABASE IF NOT EXISTS restoran_db;
USE restoran_db;

-- Tabel Restoran
CREATE TABLE IF NOT EXISTS restaurants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT NOT NULL,
  visitor_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- Data Sampel
INSERT INTO restaurants (name, address, phone) VALUES
('Gondes', 'Kelapa Dua', '089926564812');

-- Sample Reviews untuk restoran pertama
INSERT INTO reviews (restaurant_id, rating, review, visitor_name) VALUES
(1, 4, 'Gondes, ambil sepuasnya', 'Ara');

### 2. Run Backend
```bash
cd backend
npm install
npm start
```
Server akan berjalan di `http://localhost:3001`

### 3. Run Frontend
```bash
cd frontend
npm install
npm start
```
Aplikasi akan buka di `http://localhost:3000`

## 🔧 API Endpoints
### Restaurants
- `GET /restaurants` - Ambil semua
- `POST /restaurants` - Tambah
- `PUT /restaurants/:id` - Update
- `DELETE /restaurants/:id` - Hapus
### Reviews
- `POST /reviews` - Tambah
- `PUT /reviews/:id` - Update
- `DELETE /reviews/:id` - Hapus

## 💡 Customization
### Change Port
Edit di `backend/server.js`:
```javascript
const PORT = 3001; // Ubah ke port lain
```
### Change Colors
Edit di `App.css` - ubah color values
### Add More Fields
1. Update MySQL table schema
2. Update React form di `app.js`
3. Update API di `backend/server.js`

## 🤝 Support
Jika ada error:
1. Check browser console (F12)
2. Check terminal backend
3. Pastikan MySQL running
4. Pastikan port tidak conflict

- Tambah review dengan rating
- Edit & hapus review
