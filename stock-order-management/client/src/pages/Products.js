import React, { useState, useEffect } from 'react';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    stock: '',
    imageUrl: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();

      if (data.status === 'success') {
        setProducts(data.data.products || []);
      } else {
        setError('Ürünler yüklenemedi');
      }
    } catch (err) {
      setError('Bağlantı hatası');
      console.error('Products fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
        imageUrl: formData.imageUrl.trim()
      };

      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (data.status === 'success') {
        setShowForm(false);
        setFormData({
          name: '',
          description: '',
          category: '',
          price: '',
          stock: '',
          imageUrl: ''
        });
        fetchProducts();
      } else {
        alert('Ürün eklenirken hata oluştu: ' + (data.message || ''));
      }
    } catch (err) {
      alert('Bağlantı hatası');
      console.error('Product create error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.status === 'success') {
        fetchProducts();
      } else {
        alert('Ürün silinirken hata oluştu');
      }
    } catch (err) {
      alert('Bağlantı hatası');
      console.error('Product delete error:', err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return <div className="products-loading">Yükleniyor...</div>;
  }

  return (
    <div className="products">
      <div className="products-header">
        <h1>Ürünler</h1>
        <button
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'İptal' : 'Yeni Ürün Ekle'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="product-form">
          <h3>Yeni Ürün Ekle</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <input
                type="text"
                name="name"
                placeholder="Ürün Adı"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="category"
                placeholder="Kategori"
                value={formData.category}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-row">
              <input
                type="number"
                name="price"
                placeholder="Fiyat"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                required
              />
              <input
                type="number"
                name="stock"
                placeholder="Stok Miktarı"
                value={formData.stock}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>

            <textarea
              name="description"
              placeholder="Açıklama"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
            />

            <input
              type="url"
              name="imageUrl"
              placeholder="Resim URL (opsiyonel)"
              value={formData.imageUrl}
              onChange={handleInputChange}
            />

            <button type="submit" className="btn-primary">Ürün Ekle</button>
          </form>
        </div>
      )}

      <div className="products-grid">
        {products.length === 0 ? (
          <div className="no-products">Henüz ürün bulunmuyor</div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="product-card">
              {product.imageUrl && (
                <img src={product.imageUrl} alt={product.name} className="product-image" />
              )}
              <div className="product-content">
                <h3>{product.name}</h3>
                {product.description && (
                  <p className="product-description">{product.description}</p>
                )}
                <div className="product-prices">
                  <span className="price">₺{product.price}</span>
                </div>
                <div className="product-stock">
                  <span className={`stock ${(product.stock || 0) < 10 ? 'low-stock' : ''}`}>
                    Stok: {product.stock || 0}
                  </span>
                </div>
                <button
                  className="btn-danger"
                  onClick={() => handleDelete(product.id)}
                >
                  Sil
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Products;