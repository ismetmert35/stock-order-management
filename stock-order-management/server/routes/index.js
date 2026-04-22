const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// API durumu
router.get('/status', async (req, res) => {
  try {
    // Veritabanı bağlantısını kontrol et
    const dbResult = await db.query('SELECT NOW() as time');
    
    res.json({
      status: 'success',
      message: 'API is running',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        time: dbResult.rows[0].time
      },
      environment: process.env.NODE_ENV
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'API error',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Export router
module.exports = router;
