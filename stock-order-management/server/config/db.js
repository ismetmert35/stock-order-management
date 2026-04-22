const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// SQLite veritabanı dosyası yolu
const dbPath = path.join(__dirname, '../database.sqlite');

// Veritabanı bağlantısı
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('SQLite veritabanına bağlanırken hata:', err.message);
  } else {
    console.log('SQLite veritabanına başarıyla bağlandı');
  }
});

// Promise tabanlı sorgu fonksiyonu
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve({ rows });
      }
    });
  });
};

// Promise tabanlı run fonksiyonu (INSERT, UPDATE, DELETE için)
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ rows: [{ id: this.lastID }], lastID: this.lastID, changes: this.changes });
      }
    });
  });
};

// Transaction başlatma
const beginTransaction = () => {
  return new Promise((resolve, reject) => {
    db.run('BEGIN TRANSACTION', (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

// Transaction commit
const commit = () => {
  return new Promise((resolve, reject) => {
    db.run('COMMIT', (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

// Transaction rollback
const rollback = () => {
  return new Promise((resolve, reject) => {
    db.run('ROLLBACK', (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

module.exports = {
  query,
  run,
  beginTransaction,
  commit,
  rollback,
  db
};
