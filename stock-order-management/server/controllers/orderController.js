const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Tüm siparişleri getir
exports.getAllOrders = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM sales_orders ORDER BY created_at DESC');
    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      data: {
        orders: result.rows
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Siparişler getirilirken bir hata oluştu'
    });
  }
};

// Belirli bir siparişi getir
exports.getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const orderResult = await db.query('SELECT * FROM sales_orders WHERE id = ?', [id]);
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Bu ID ile sipariş bulunamadı'
      });
    }

    const itemsResult = await db.query('SELECT * FROM sales_order_items WHERE sales_order_id = ?', [id]);

    res.status(200).json({
      status: 'success',
      data: {
        order: orderResult.rows[0],
        items: itemsResult.rows
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Sipariş getirilirken bir hata oluştu'
    });
  }
};

// Yeni sipariş oluştur
exports.createOrder = async (req, res) => {
  try {
    const customerName =
      req.body.customer_name ||
      req.body.customerName ||
      req.body.customer ||
      '';

    const shippingAddress =
      req.body.shipping_address ||
      req.body.shippingAddress ||
      '';

    const notes = req.body.notes || '';

    const items = Array.isArray(req.body.items) ? req.body.items : [];

    if (!customerName.trim()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Müşteri adı zorunludur'
      });
    }

    if (items.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'En az bir sipariş kalemi eklenmelidir'
      });
    }

    await db.beginTransaction();

    const orderId = uuidv4();

    let totalAmount = 0;

    for (const item of items) {
      const productId = item.product_id || item.productId;
      const quantity = Number(item.quantity) || 0;

      const stockCheck = await db.query(
        'SELECT id, name, price, stock FROM products WHERE id = ?',
        [productId]
      );

      if (stockCheck.rows.length === 0) {
        throw new Error(`Ürün bulunamadı: ${productId}`);
      }

      const product = stockCheck.rows[0];
      const currentStock = Number(product.stock) || 0;
      const unitPrice = Number(item.price ?? product.price) || 0;

      if (quantity <= 0) {
        throw new Error('Ürün miktarı 0’dan büyük olmalıdır');
      }

      if (currentStock < quantity) {
        throw new Error(`Yetersiz stok. Ürün: ${product.name}, Mevcut: ${currentStock}, İstenen: ${quantity}`);
      }

      totalAmount += quantity * unitPrice;
    }

   await db.run(
  `INSERT INTO sales_orders (
    id,
    customer_name,
    order_date,
    status,
    shipping_address,
    total_amount,
    notes
  ) VALUES (?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?)`,
  [orderId, customerName, 'pending', shippingAddress, totalAmount, notes]
);

    for (const item of items) {
      const productId = item.product_id || item.productId;
      const quantity = Number(item.quantity) || 0;

      const productResult = await db.query(
        'SELECT price, stock FROM products WHERE id = ?',
        [productId]
      );

      const product = productResult.rows[0];
      const unitPrice = Number(item.price ?? product.price) || 0;
      const itemId = uuidv4();

      await db.run(
        'INSERT INTO sales_order_items (id, sales_order_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?, ?)',
        [itemId, orderId, productId, quantity, unitPrice, quantity * unitPrice]
      );

      await db.run(
        'UPDATE products SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [quantity, productId]
      );
    }

    await db.commit();

    const orderResult = await db.query('SELECT * FROM sales_orders WHERE id = ?', [orderId]);

    res.status(201).json({
      status: 'success',
      data: {
        order: orderResult.rows[0]
      }
    });
  } catch (err) {
    await db.rollback();
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: err.message || 'Sipariş oluşturulurken bir hata oluştu'
    });
  }
};


// Sipariş durumunu güncelle
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await db.run(
      'UPDATE sales_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );
    
    // Güncellenen siparişi getir
    const updatedOrder = await db.query('SELECT * FROM sales_orders WHERE id = ?', [id]);
    
    if (updatedOrder.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Bu ID ile sipariş bulunamadı'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        order: updatedOrder.rows[0]
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Sipariş durumu güncellenirken bir hata oluştu'
    });
  }
};

// Sipariş sil
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Transaction başlat
    await db.beginTransaction();
    
    // Önce siparişi kontrol et
    const checkResult = await db.query('SELECT * FROM sales_orders WHERE id = ?', [id]);
    
    if (checkResult.rows.length === 0) {
      await db.rollback();
      return res.status(404).json({
        status: 'fail',
        message: 'Bu ID ile sipariş bulunamadı'
      });
    }

    // Sipariş kalemlerini sil
    await db.run('DELETE FROM sales_order_items WHERE sales_order_id = ?', [id]);
    
    // Siparişi sil
    await db.run('DELETE FROM sales_orders WHERE id = ?', [id]);
    
    // Transaction tamamla
    await db.commit();

    res.status(200).json({
    status: 'success',
    message: 'Sipariş silindi'
    });
  } catch (err) {
    // Hata durumunda transaction'ı geri al
    await db.rollback();
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Sipariş silinirken bir hata oluştu'
    });
  }
};
