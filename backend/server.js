const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL Connection Pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // XAMPP default password kosong
  database: 'restoran_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ==================== RESTAURANTS CRUD ====================

// GET - Ambil semua restoran dengan reviews dan rating
app.get('/restaurants', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Query untuk ambil restoran dengan jumlah review dan rating rata-rata
    const [restaurants] = await connection.execute(`
      SELECT 
        r.id,
        r.name,
        r.address,
        r.phone,
        r.created_at,
        COUNT(rv.id) as review_count,
        ROUND(AVG(rv.rating), 1) as average_rating
      FROM restaurants r
      LEFT JOIN reviews rv ON r.id = rv.restaurant_id
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `);

    // Ambil reviews untuk setiap restoran
    const restaurantsWithReviews = await Promise.all(
      restaurants.map(async (restaurant) => {
        const [reviews] = await connection.execute(
          'SELECT * FROM reviews WHERE restaurant_id = ? ORDER BY created_at DESC',
          [restaurant.id]
        );
        return {
          ...restaurant,
          reviews: reviews
        };
      })
    );

    connection.release();
    res.json({
      success: true,
      data: restaurantsWithReviews
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET - Ambil restoran berdasarkan ID
app.get('/restaurants/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [restaurant] = await connection.execute(
      'SELECT * FROM restaurants WHERE id = ?',
      [req.params.id]
    );

    if (restaurant.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Restoran tidak ditemukan'
      });
    }

    const [reviews] = await connection.execute(
      'SELECT * FROM reviews WHERE restaurant_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );

    connection.release();
    res.json({
      success: true,
      data: {
        ...restaurant[0],
        reviews: reviews
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST - Tambah restoran baru
app.post('/restaurants', async (req, res) => {
  try {
    const { name, address, phone } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Nama restoran harus diisi'
      });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO restaurants (name, address, phone) VALUES (?, ?, ?)',
      [name, address || '', phone || '']
    );

    connection.release();
    res.status(201).json({
      success: true,
      message: 'Restoran berhasil ditambahkan',
      data: {
        id: result.insertId,
        name,
        address: address || '',
        phone: phone || ''
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PUT - Update restoran
app.put('/restaurants/:id', async (req, res) => {
  try {
    const { name, address, phone } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Nama restoran harus diisi'
      });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'UPDATE restaurants SET name = ?, address = ?, phone = ? WHERE id = ?',
      [name, address || '', phone || '', req.params.id]
    );

    if (result.affectedRows === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Restoran tidak ditemukan'
      });
    }

    connection.release();
    res.json({
      success: true,
      message: 'Restoran berhasil diupdate'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE - Hapus restoran
app.delete('/restaurants/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Hapus reviews terlebih dahulu
    await connection.execute(
      'DELETE FROM reviews WHERE restaurant_id = ?',
      [req.params.id]
    );

    // Hapus restoran
    const [result] = await connection.execute(
      'DELETE FROM restaurants WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Restoran tidak ditemukan'
      });
    }

    connection.release();
    res.json({
      success: true,
      message: 'Restoran berhasil dihapus'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== REVIEWS CRUD ====================

// POST - Tambah review
app.post('/reviews', async (req, res) => {
  try {
    const { restaurant_id, rating, review, visitor_name } = req.body;

    if (!restaurant_id || !rating || !review) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant ID, rating, dan review harus diisi'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating harus antara 1-5'
      });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO reviews (restaurant_id, rating, review, visitor_name) VALUES (?, ?, ?, ?)',
      [restaurant_id, rating, review, visitor_name || 'Anonymous']
    );

    connection.release();
    res.status(201).json({
      success: true,
      message: 'Review berhasil ditambahkan',
      data: {
        id: result.insertId,
        restaurant_id,
        rating,
        review,
        visitor_name: visitor_name || 'Anonymous'
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PUT - Update review
app.put('/reviews/:id', async (req, res) => {
  try {
    const { rating, review } = req.body;

    if (!rating || !review) {
      return res.status(400).json({
        success: false,
        message: 'Rating dan review harus diisi'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating harus antara 1-5'
      });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'UPDATE reviews SET rating = ?, review = ? WHERE id = ?',
      [rating, review, req.params.id]
    );

    if (result.affectedRows === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Review tidak ditemukan'
      });
    }

    connection.release();
    res.json({
      success: true,
      message: 'Review berhasil diupdate'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE - Hapus review
app.delete('/reviews/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'DELETE FROM reviews WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Review tidak ditemukan'
      });
    }

    connection.release();
    res.json({
      success: true,
      message: 'Review berhasil dihapus'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan server'
  });
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
