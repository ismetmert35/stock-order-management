const app = require('./app');
const db = require('./config/db');

// Set port
const PORT = process.env.PORT || 5000;

// Veritabanı bağlantısını test et
db.query('SELECT sqlite_version()', [])
  .then(() => {
    console.log('✅ SQLite veritabanı bağlantısı başarılı');
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log(`✅ Sunucu ${PORT} portunda çalışıyor`);
      console.log(`🔗 http://localhost:${PORT}`);
      console.log(`🔗 http://localhost:${PORT}/health`);
      console.log(`🔗 http://localhost:${PORT}/api/test`);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM sinyali alındı. Sunucu kapatılıyor...');
      server.close(() => {
        console.log('Sunucu kapatıldı');
        process.exit(0);
      });
    });
  })
  .catch(err => {
    console.error('❌ Veritabanı bağlantı hatası:', err.message);
    process.exit(1);
  });
