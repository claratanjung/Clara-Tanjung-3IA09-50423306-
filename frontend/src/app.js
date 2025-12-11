import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State untuk form tambah restoran
  const [showAddRestaurant, setShowAddRestaurant] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState({ name: "", address: "", phone: "" });
  
  // State untuk form tambah review
  const [showAddReview, setShowAddReview] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [newReview, setNewReview] = useState({ rating: 5, review: "", visitor_name: "" });
  
  // State untuk edit
  const [editingReview, setEditingReview] = useState(null);
  const [editingRestaurant, setEditingRestaurant] = useState(null);

  // Fetch restoran saat pertama kali load
  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/restaurants");
      const data = await response.json();
      if (data.success) {
        setRestaurants(data.data);
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      alert("Gagal mengambil data restoran");
    } finally {
      setLoading(false);
    }
  };

  // ==================== RESTAURANT CRUD ====================

  const handleAddRestaurant = async () => {
    if (!newRestaurant.name.trim()) {
      alert("Nama restoran harus diisi!");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRestaurant)
      });
      const data = await response.json();
      
      if (data.success) {
        alert("Restoran berhasil ditambahkan!");
        setNewRestaurant({ name: "", address: "", phone: "" });
        setShowAddRestaurant(false);
        fetchRestaurants();
      } else {
        alert("Gagal menambahkan restoran: " + data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan saat menambahkan restoran");
    }
  };

  const handleUpdateRestaurant = async () => {
    if (!editingRestaurant.name.trim()) {
      alert("Nama restoran harus diisi!");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/restaurants/${editingRestaurant.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingRestaurant.name,
          address: editingRestaurant.address,
          phone: editingRestaurant.phone
        })
      });
      const data = await response.json();
      
      if (data.success) {
        alert("Restoran berhasil diupdate!");
        setEditingRestaurant(null);
        fetchRestaurants();
      } else {
        alert("Gagal mengupdate restoran: " + data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan saat mengupdate restoran");
    }
  };

  const handleDeleteRestaurant = async (id) => {
    if (!window.confirm("Yakin ingin menghapus restoran ini? Reviews akan ikut terhapus.")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/restaurants/${id}`, {
        method: "DELETE"
      });
      const data = await response.json();
      
      if (data.success) {
        alert("Restoran berhasil dihapus!");
        fetchRestaurants();
      } else {
        alert("Gagal menghapus restoran: " + data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan saat menghapus restoran");
    }
  };

  // ==================== REVIEW CRUD ====================

  const handleAddReview = async () => {
    if (!newReview.review.trim()) {
      alert("Review tidak boleh kosong!");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant_id: selectedRestaurantId,
          rating: parseInt(newReview.rating),
          review: newReview.review,
          visitor_name: newReview.visitor_name || "Anonymous"
        })
      });
      const data = await response.json();
      
      if (data.success) {
        alert("Review berhasil ditambahkan!");
        setNewReview({ rating: 5, review: "", visitor_name: "" });
        setShowAddReview(false);
        setSelectedRestaurantId(null);
        fetchRestaurants();
      } else {
        alert("Gagal menambahkan review: " + data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan saat menambahkan review");
    }
  };

  const handleUpdateReview = async () => {
    if (!editingReview.review.trim()) {
      alert("Review tidak boleh kosong!");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/reviews/${editingReview.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: parseInt(editingReview.rating),
          review: editingReview.review
        })
      });
      const data = await response.json();
      
      if (data.success) {
        alert("Review berhasil diupdate!");
        setEditingReview(null);
        fetchRestaurants();
      } else {
        alert("Gagal mengupdate review: " + data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan saat mengupdate review");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Yakin ingin menghapus review ini?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/reviews/${reviewId}`, {
        method: "DELETE"
      });
      const data = await response.json();
      
      if (data.success) {
        alert("Review berhasil dihapus!");
        fetchRestaurants();
      } else {
        alert("Gagal menghapus review: " + data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan saat menghapus review");
    }
  };

  const renderStars = (rating) => {
    return "⭐".repeat(rating) + "☆".repeat(5 - rating);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🍽️ Rekomendasi Tempat Makan</h1>
        <p>Bagikan dan temukan restoran favorit Anda</p>
      </header>

      <div className="container">
        {/* Button Tambah Restoran */}
        <div className="action-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddRestaurant(!showAddRestaurant)}
          >
            {showAddRestaurant ? "❌ Batal" : "➕ Tambah Restoran"}
          </button>
        </div>

        {/* Form Tambah Restoran */}
        {showAddRestaurant && (
          <div className="form-container">
            <h3>Tambah Restoran Baru</h3>
            <div className="form-group">
              <label>Nama Restoran *</label>
              <input 
                type="text"
                placeholder="Contoh: Warung Makan Enak"
                value={newRestaurant.name}
                onChange={(e) => setNewRestaurant({...newRestaurant, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Alamat</label>
              <input 
                type="text"
                placeholder="Contoh: Jl. Merdeka No. 123"
                value={newRestaurant.address}
                onChange={(e) => setNewRestaurant({...newRestaurant, address: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Nomor Telepon</label>
              <input 
                type="text"
                placeholder="Contoh: 081234567890"
                value={newRestaurant.phone}
                onChange={(e) => setNewRestaurant({...newRestaurant, phone: e.target.value})}
              />
            </div>
            <button className="btn btn-success" onClick={handleAddRestaurant}>
              Simpan Restoran
            </button>
          </div>
        )}

        {/* Form Edit Restoran */}
        {editingRestaurant && (
          <div className="form-container">
            <h3>Edit Restoran</h3>
            <div className="form-group">
              <label>Nama Restoran *</label>
              <input 
                type="text"
                value={editingRestaurant.name}
                onChange={(e) => setEditingRestaurant({...editingRestaurant, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Alamat</label>
              <input 
                type="text"
                value={editingRestaurant.address}
                onChange={(e) => setEditingRestaurant({...editingRestaurant, address: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Nomor Telepon</label>
              <input 
                type="text"
                value={editingRestaurant.phone}
                onChange={(e) => setEditingRestaurant({...editingRestaurant, phone: e.target.value})}
              />
            </div>
            <div className="button-group">
              <button className="btn btn-success" onClick={handleUpdateRestaurant}>
                Update Restoran
              </button>
              <button className="btn btn-secondary" onClick={() => setEditingRestaurant(null)}>
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && <p className="loading">Sedang memuat data...</p>}

        {/* Daftar Restoran */}
        {!loading && restaurants.length === 0 && (
          <p className="no-data">Belum ada restoran. Tambahkan restoran baru!</p>
        )}

        {!loading && restaurants.map((restaurant) => (
          <div key={restaurant.id} className="restaurant-card">
            <div className="restaurant-header">
              <div>
                <h2>{restaurant.name}</h2>
                <p className="restaurant-info">📍 {restaurant.address || "Alamat tidak tersedia"}</p>
                <p className="restaurant-info">📞 {restaurant.phone || "Telepon tidak tersedia"}</p>
              </div>
              <div className="restaurant-stats">
                <div className="stat">
                  <strong>{restaurant.average_rating || "0"}</strong>
                  <small>Rating</small>
                </div>
                <div className="stat">
                  <strong>{restaurant.review_count || "0"}</strong>
                  <small>Reviews</small>
                </div>
              </div>
            </div>

            <div className="restaurant-actions">
              <button 
                className="btn btn-small btn-info"
                onClick={() => setEditingRestaurant({...restaurant})}
              >
                ✏️ Edit
              </button>
              <button 
                className="btn btn-small btn-danger"
                onClick={() => handleDeleteRestaurant(restaurant.id)}
              >
                🗑️ Hapus
              </button>
              <button 
                className="btn btn-small btn-success"
                onClick={() => {
                  setSelectedRestaurantId(restaurant.id);
                  setShowAddReview(true);
                }}
              >
                ➕ Tambah Review
              </button>
            </div>

            {/* Form Tambah Review */}
            {showAddReview && selectedRestaurantId === restaurant.id && (
              <div className="review-form">
                <h4>Tambah Review untuk {restaurant.name}</h4>
                <div className="form-group">
                  <label>Nama Pengunjung</label>
                  <input 
                    type="text"
                    placeholder="Nama Anda (opsional)"
                    value={newReview.visitor_name}
                    onChange={(e) => setNewReview({...newReview, visitor_name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Rating *</label>
                  <select 
                    value={newReview.rating}
                    onChange={(e) => setNewReview({...newReview, rating: e.target.value})}
                  >
                    <option value="1">1 ⭐ Sangat Buruk</option>
                    <option value="2">2 ⭐ Buruk</option>
                    <option value="3">3 ⭐ Cukup</option>
                    <option value="4">4 ⭐ Bagus</option>
                    <option value="5">5 ⭐ Sangat Bagus</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Review *</label>
                  <textarea 
                    placeholder="Tulis review Anda di sini..."
                    value={newReview.review}
                    onChange={(e) => setNewReview({...newReview, review: e.target.value})}
                    rows="4"
                  ></textarea>
                </div>
                <div className="button-group">
                  <button className="btn btn-success" onClick={handleAddReview}>
                    Kirim Review
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowAddReview(false);
                      setSelectedRestaurantId(null);
                      setNewReview({ rating: 5, review: "", visitor_name: "" });
                    }}
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* Daftar Reviews */}
            <div className="reviews-section">
              <h4>📝 Reviews ({restaurant.reviews?.length || 0})</h4>
              {restaurant.reviews && restaurant.reviews.length > 0 ? (
                <div className="reviews-list">
                  {restaurant.reviews.map((review) => (
                    <div key={review.id} className="review-item">
                      {editingReview?.id === review.id ? (
                        <div className="review-edit">
                          <div className="form-group">
                            <label>Rating</label>
                            <select 
                              value={editingReview.rating}
                              onChange={(e) => setEditingReview({...editingReview, rating: e.target.value})}
                            >
                              <option value="1">1 ⭐</option>
                              <option value="2">2 ⭐</option>
                              <option value="3">3 ⭐</option>
                              <option value="4">4 ⭐</option>
                              <option value="5">5 ⭐</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Review</label>
                            <textarea 
                              value={editingReview.review}
                              onChange={(e) => setEditingReview({...editingReview, review: e.target.value})}
                              rows="3"
                            ></textarea>
                          </div>
                          <div className="button-group">
                            <button className="btn btn-success btn-small" onClick={handleUpdateReview}>
                              Update
                            </button>
                            <button 
                              className="btn btn-secondary btn-small"
                              onClick={() => setEditingReview(null)}
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="review-header">
                            <div>
                              <strong>{review.visitor_name}</strong>
                              <span className="rating">{renderStars(review.rating)}</span>
                            </div>
                            <div className="review-actions">
                              <button 
                                className="btn btn-small btn-info"
                                onClick={() => setEditingReview({...review})}
                              >
                                ✏️
                              </button>
                              <button 
                                className="btn btn-small btn-danger"
                                onClick={() => handleDeleteReview(review.id)}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                          <p className="review-text">{review.review}</p>
                          <p className="review-date">
                            {new Date(review.created_at).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-reviews">Belum ada review. Jadilah yang pertama meninggalkan review!</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
