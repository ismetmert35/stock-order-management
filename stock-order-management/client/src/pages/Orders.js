import React, { useState, useEffect } from 'react';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    shippingAddress: '',
    notes: '',
    items: [{ productId: '', quantity: 1, price: 0 }]
  });

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/orders');
      const data = await response.json();

      if (data.status === 'success') {
        setOrders(data.data.orders || []);
      } else {
        setError('Siparişler yüklenemedi');
      }
    } catch (err) {
      setError('Bağlantı hatası');
      console.error('Orders fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();

      if (data.status === 'success') {
        setProducts(data.data.products || []);
      }
    } catch (err) {
      console.error('Products fetch error:', err);
    }
  };

 const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    });

    const data = await response.json();

    if (data.status === 'success') {
      fetchOrders();
    } else {
      alert('Sipariş durumu güncellenirken hata oluştu');
    }
  } catch (err) {
    alert('Bağlantı hatası');
    console.error('Order status update error:', err);
  }
};

  const deleteOrder = async (orderId) => {
    if (!window.confirm('Bu siparişi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.status === 'success') {
        fetchOrders();
      } else {
        alert('Sipariş silinirken hata oluştu');
      }
    } catch (err) {
      alert('Bağlantı hatası');
      console.error('Order delete error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const orderData = {
        customerName: formData.customerName.trim(),
        shippingAddress: formData.shippingAddress.trim(),
        notes: formData.notes.trim(),
        items: formData.items.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          price: Number(item.price)
        }))
      };

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (data.status === 'success') {
        setShowForm(false);
        setFormData({
          customerName: '',
          shippingAddress: '',
          notes: '',
          items: [{ productId: '', quantity: 1, price: 0 }]
        });
        fetchOrders();
        fetchProducts();
      } else {
        alert('Sipariş oluşturulurken hata oluştu: ' + (data.message || ''));
      }
    } catch (err) {
      alert('Bağlantı hatası');
      console.error('Order create error:', err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;

    if (field === 'productId') {
      const selectedProduct = products.find((p) => p.id === value);
      if (selectedProduct) {
        newItems[index].price = parseFloat(selectedProduct.price) || 0;
      }
    }

    setFormData({
      ...formData,
      items: newItems
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', quantity: 1, price: 0 }]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        items: newItems
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#f39c12';
      case 'processing':
        return '#3498db';
      case 'shipped':
        return '#9b59b6';
      case 'delivered':
        return '#27ae60';
      case 'cancelled':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Bekliyor';
      case 'processing':
        return 'İşleniyor';
      case 'shipped':
        return 'Kargoda';
      case 'delivered':
        return 'Teslim Edildi';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="orders-loading">Yükleniyor...</div>;
  }

  return (
    <div className="orders">
      <div className="orders-header">
        <h1>Siparişler</h1>
        <div className="orders-actions">
          <button
            className="btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'İptal' : 'Yeni Sipariş Oluştur'}
          </button>
          <div className="orders-stats">
            <span>Toplam: {orders.length}</span>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="order-form">
          <h3>Yeni Sipariş Oluştur</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <input
                type="text"
                name="customerName"
                placeholder="Müşteri Adı"
                value={formData.customerName}
                onChange={handleInputChange}
                required
              />
            </div>

            <textarea
              name="shippingAddress"
              placeholder="Teslimat Adresi"
              value={formData.shippingAddress}
              onChange={handleInputChange}
              rows="3"
              required
            />

            <textarea
              name="notes"
              placeholder="Notlar (opsiyonel)"
              value={formData.notes}
              onChange={handleInputChange}
              rows="2"
            />

            <div className="items-section">
              <h4>Sipariş Kalemleri</h4>
              {formData.items.map((item, index) => (
                <div key={index} className="item-row">
                  <select
                    value={item.productId}
                    onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                    required
                  >
                    <option value="">Ürün Seçin</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - ₺{product.price} (Stok: {product.stock || 0})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    placeholder="Adet"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value, 10) || 1)}
                    min="1"
                    required
                  />

                  <input
                    type="number"
                    placeholder="Birim Fiyat"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                    step="0.01"
                    min="0"
                    required
                  />

                  <span className="item-total">
                    ₺{(item.quantity * item.price).toFixed(2)}
                  </span>

                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeItem(index)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              <button type="button" className="btn-add-item" onClick={addItem}>
                + Kalem Ekle
              </button>

              <div className="order-total">
                <strong>
                  Toplam: ₺{formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2)}
                </strong>
              </div>
            </div>

            <button type="submit" className="btn-primary">Sipariş Oluştur</button>
          </form>
        </div>
      )}

      <div className="orders-list">
        {orders.length === 0 ? (
          <div className="no-orders">Henüz sipariş bulunmuyor</div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-id">
                  <strong>#{order.id.substring(0, 8)}</strong>
                </div>
                <div
                  className="order-status"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {getStatusText(order.status)}
                </div>
              </div>

              <div className="order-content">
                <div className="order-info">
                  <p><strong>Müşteri:</strong> {order.customer_name}</p>
                  <p><strong>Toplam Tutar:</strong> ₺{order.total_amount}</p>
                  <p><strong>Teslimat Adresi:</strong> {order.shipping_address}</p>
                  {order.notes && <p><strong>Notlar:</strong> {order.notes}</p>}
                  <p><strong>Oluşturulma:</strong> {formatDate(order.created_at)}</p>
                </div>

                <div className="order-actions">
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className="status-select"
                  >
                    <option value="pending">Bekliyor</option>
                    <option value="processing">İşleniyor</option>
                    <option value="shipped">Kargoda</option>
                    <option value="delivered">Teslim Edildi</option>
                    <option value="cancelled">İptal Edildi</option>
                  </select>

                  <button
                    className="btn-danger"
                    onClick={() => deleteOrder(order.id)}
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;