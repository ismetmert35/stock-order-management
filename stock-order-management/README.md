# Stok ve Sipariş Yönetim Sistemi

Bu proje, stok ve sipariş yönetimi için geliştirilmiş bir full-stack web uygulamasıdır.

## Teknolojiler

- **Frontend**: React
- **Backend**: Node.js, Express
- **Veritabanı**: SQLite

## Kurulum

### Gereksinimler

- Node.js (v14 veya üzeri)
- npm

### Adımlar

1. Projeyi klonlayın:
   ```
   git clone https://github.com/ismetmert35/stock-order-management.git
   cd stock-order-management
   ```

2. Backend için bağımlılıkları yükleyin:
   ```
   cd server
   npm install
   ```

3. SQLite tablolarını oluşturun:
   ```
   node utils/createTables.js
   ```

4. Backend sunucusunu başlatın:
   ```
   npm run dev
   ```
   

5. Frontend bağımlılıklarını yükleyin
   ```
   cd ../client
   npm install
   ```
6. Frontend uygulamasını başlatın
   ```
   npm start
   ```
## Özellikler

- Dashboard görünümü
- Ürün listeleme
- Ürün ekleme
- Sipariş listeleme
- Sipariş oluşturma
- Temel stok takibi
