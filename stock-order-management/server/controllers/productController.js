const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Tüm ürünleri getir
exports.getAllProducts = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM products ORDER BY rowid DESC');
    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      data: {
        products: result.rows
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Ürünler getirilirken bir hata oluştu'
    });
  }
};

// Belirli bir ürünü getir
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Bu ID ile ürün bulunamadı'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        product: result.rows[0]
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Ürün getirilirken bir hata oluştu'
    });
  }
};

// Yeni ürün oluştur
exports.createProduct = async (req, res) => {
  try {
    const { name, description, category, price, stock = 0, imageUrl } = req.body;
    
    const productId = uuidv4();
    const result = await db.run(
      'INSERT INTO products (id, name, description, category, price, stock, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [productId, name, description, category, price, stock, imageUrl]
    );
    
    // Eklenen ürünü getir
    const newProduct = await db.query('SELECT * FROM products WHERE id = ?', [productId]);

    res.status(201).json({
      status: 'success',
      data: {
        product: newProduct.rows[0]
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Ürün oluşturulurken bir hata oluştu'
    });
  }
};

// Ürün güncelle
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, price, stock, imageUrl } = req.body;
    
    const result = await db.run(
      'UPDATE products SET name = ?, description = ?, category = ?, price = ?, stock = ?, imageUrl = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, description, category, price, stock, imageUrl, id]
    );
    
    // Güncellenen ürünü getir
    const updatedProduct = await db.query('SELECT * FROM products WHERE id = ?', [id]);

    if (updatedProduct.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Bu ID ile ürün bulunamadı'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        product: updatedProduct.rows[0]
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Ürün güncellenirken bir hata oluştu'
    });
  }
};

// Ürün sil
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Önce ürünü kontrol et
    const checkResult = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Bu ID ile ürün bulunamadı'
      });
    }
    
    // Ürünü sil
    await db.run('DELETE FROM products WHERE id = ?', [id]);

    res.status(200).json({
    status: 'success',
    message: 'Ürün silindi'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Ürün silinirken bir hata oluştu'
    });
  }
};
