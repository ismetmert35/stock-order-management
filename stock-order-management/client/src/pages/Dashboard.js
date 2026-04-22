import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const productsResponse = await fetch('http://localhost:5000/api/products');
      const productsData = await productsResponse.json();
      
      const ordersResponse = await fetch('http://localhost:5000/api/orders');
      const ordersData = await ordersResponse.json();
      
      if (productsData.status === 'success' && ordersData.status === 'success') {
        const orders = ordersData.data.orders || [];
        setStats({
          totalProducts: productsData.results || 0,
          totalOrders: ordersData.results || 0,
          pendingOrders: orders.filter(order => order.status === 'pending').length,
          completedOrders: orders.filter(order => order.status === 'delivered').length
        });
      }
    } catch (err) {
      setError('Veri yüklenirken hata oluştu');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Toplam Ürün</h3>
            <p className="stat-number">{stats.totalProducts}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Toplam Sipariş</h3>
            <p className="stat-number">{stats.totalOrders}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Bekleyen Siparişler</h3>
            <p className="stat-number">{stats.pendingOrders}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Tamamlanan Siparişler</h3>
            <p className="stat-number">{stats.completedOrders}</p>
          </div>
        </div>
      </div>
      
      <div className="dashboard-actions">
        <button className="action-btn primary" onClick={() => window.location.href = '/products'}>
          Ürünleri Görüntüle
        </button>
        <button className="action-btn secondary" onClick={() => window.location.href = '/orders'}>
          Siparişleri Görüntüle
        </button>
      </div>
    </div>
  );
};

export default Dashboard;