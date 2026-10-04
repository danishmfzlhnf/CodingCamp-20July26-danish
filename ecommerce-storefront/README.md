# E-Commerce Dynamic Landing Page / Storefront (Shopee-like Experience)

Aplikasi web storefront e-commerce komprehensif, modern, dan interaktif yang merefleksikan pengalaman belanja digital super-app bergaya **Shopee Indonesia**. Dibangun berdasarkan **Product Requirements Document (PRD)** dengan optimasi **Mobile-First Responsive Design**, elemen urgensi konversi (Flash Sale), sistem voucher interaktif, pencarian pintar, dan rekomendasi produk bergaya *infinite scroll*.

---

## 📸 Fitur Utama Sesuai PRD

### A. Global Header & Navigasi (Sticky)
- **Top Bar (Desktop):** Tautan cepat unduh aplikasi Shopee (dengan modal QR Code), pendaftaran penjual, dompet voucher pengguna real-time, bantuan, dan status akun member.
- **Smart Search Bar:** 
  - Kolom pencarian dinamis dengan *auto-suggest* produk secara *real-time*.
  - Riwayat pencarian (*search history*) yang tersimpan di `localStorage` dengan opsi hapus satuan atau hapus semua.
  - Rekomendasi kata kunci tren (*trending searches*) berperingkat.
  - *Highlight* kata kunci pencarian yang cocok.
- **Shopping Cart Icon:** Dilengkapi *badge counter* dinamis yang menganimasikan jumlah produk di keranjang secara *real-time*. Mengklik membuka **Cart Drawer** samping.
- **Notification & Message Icon:** Akses cepat ke notifikasi promo diskon, update status pesanan, dan simulasi pesan penjual.

### B. Hero Section (Promosi Utama)
- **Auto-Rotating Banner Carousel:** 5 kampanye promosi besar (11.11 Mega Shopping Day, Gratis Ongkir XTRA, Shopee Live 50%, Super Brand Festival, Gajian Sale).
  - Rotasi otomatis setiap 4 detik.
  - Jeda otomatis saat kursor diarahkan (*pause on hover*).
  - Navigasi tombol panah kiri/kanan dan indikator titik (*dot indicators*).
  - Dukungan *touch swipe* gestur jari di perangkat seluler / *smartphone*.
- **Desktop Mini Side Banners:** 2 kartu promosi samping bergaya layout Shopee desktop (Elektronik Murah Lebay & ShopeeFood).

### C. Shortcut Icon Grid Menu (10 Ikon, 2 Baris)
- Grid menu navigasi esensial berdesain modern dengan efek hover:
  1. **ShopeeFood** (Diskon 60%)
  2. **Pulsa & Tagihan** (Cashback 50%)
  3. **Gratis Ongkir** (Min. Belanja Rp0)
  4. **Shopee Mall** (100% Produk Original)
  5. **Koin Shopee** (Klaim Harian)
  6. **Murah Lebay** (Jaminan Termurah)
  7. **Shopee Live** (Diskon 50%)
  8. **Pilih Lokal** (Produk UMKM Indonesia)
  9. **SPayLater** (Bunga 0% Cicilan)
  10. **Elektronik** (Gadget & Aksesoris)

### D. Urgency & Conversion Boosters
- **Flash Sale Section:**
  - *Live Countdown Timer* (Jam : Menit : Detik) yang menghitung mundur setiap detik secara akurat.
  - *Horizontal scrollable track* dengan tombol navigasi geser kiri/kanan di desktop dan *touch scroll-snap* di mobile.
  - Informasi detail kartu: Foto produk rasio 1:1, label diskon tajam (s/d -70%), harga coret asli vs harga promo flash sale, serta *animated fire stock bar* (misal: "SEGERA HABIS", "TERJUAL 92%").
  - Tombol aksi instan "Beli Sekarang".
- **Klaim Voucher (Voucher Wallet):**
  - Kartu voucher bergaya tiket (*scalloped ticket cutouts*).
  - Pilihan voucher: Gratis Ongkir Rp0, Diskon 50%, Cashback Koin 10%, dan Diskon Pengguna Baru Rp25.000.
  - Interaksi tombol "Klaim" yang bertransisi menjadi "✓ Terklaim", tersimpan di `localStorage`, memperbarui jumlah voucher di header, dan memunculkan *toast notification*.

### E. Kategori & Kurasi
- **Kategori Pilihan:** Komponen geser horizontal berisi kategori populer (Elektronik, Fashion Pria, Fashion Wanita, Kecantikan, Perlengkapan Rumah, Makanan, dsb).
- **Pencarian Populer / Top Searches:** Menampilkan kartu tren produk teratas dengan lencana peringkat (#1, #2, #3), foto produk, dan total volume pencarian.

### F. Rekomendasi Produk "Rekomendasi Untukmu" (Infinite Scroll)
- Memakan porsi utama panjang halaman dengan pemuatan dinamis bertahap (*lazy loading*).
- **Tab Filter Kategori Cepat:** "Semua", "Elektronik", "Fashion", "Kecantikan", "Rumah Tangga", "Makanan & Minuman".
- **Dropdown Urutkan (Sorting):** Terkait, Paling Banyak Terjual, Penilaian Tertinggi, Harga Terendah, dan Harga Tertinggi.
- **Product Card Specs Sesuai PRD:**
  - Gambar produk resolusi tajam dengan rasio 1:1 dan efek hover zoom halus.
  - Lencana dinamis: `Shopee Mall`, `Star+`, `Iklan`, `Gratis Ongkir XTRA`.
  - Judul nama produk dengan batasan maksimal 2 baris (*line-clamp* 2 baris).
  - Format harga Rupiah jelas (misal: `Rp159.000`).
  - Rating bintang (⭐ 4.8 / 4.9) dan jumlah penjualan terformat (misal: `10RB+ Terjual`).
  - Asal kota pengiriman (misal: `Kota Jakarta Selatan`, `Kota Bandung`, `Kota Surabaya`).
  - Tombol aksi cepat tambah keranjang (`+`) dan klik kartu untuk membuka **Quick View Modal**.
- **Infinite Scroll Engine:**
  - Memanfaatkan `IntersectionObserver` modern untuk mendeteksi scroll pengguna tanpa membebani performa browser.
  - Indikator pemuatan berputar (*spinner loader*).
  - Penghitung jumlah produk yang sedang ditampilkan (*counter*).
  - Pesan konfirmasi saat seluruh produk telah termuat lengkap.

### G. Modals & Drawers Interaktif
- **Shopping Cart Drawer:**
  - Panel geser samping dari kanan (*slide-in drawer*) dengan latar belakang gelap (*backdrop*).
  - Menampilkan daftar barang, kontrol kuantitas (`-` dan `+`), tombol hapus barang, dan kalkulasi total otomatis.
  - **Free Shipping Progress Bar:** Menghitung sisa belanja yang dibutuhkan untuk mendapatkan promo Gratis Ongkir Rp0 ("Tambah RpXX.XXX lagi untuk Gratis Ongkir!").
  - Tombol checkout interaktif dengan respon notifikasi.
- **Quick View Modal:**
  - Pop-up detail lengkap produk dengan galeri foto, ulasan, garansi resmi Shopee Mall, pemilihan jumlah barang, serta tombol "Masukkan Keranjang" dan "Beli Sekarang".
- **Notification Drawer:** Notifikasi promo flash sale, resi pengiriman SPX Express, dan voucher belanja.
- **QR Code Modal:** Pop-up kode QR untuk memindai aplikasi Shopee di ponsel.
- **Toast Notifications:** Pemberitahuan mengambang di atas layar (*floating pill*) saat voucher diklaim, produk ditambahkan, atau pencarian dilakukan.

### H. Sticky Bottom Navigation (Mobile View)
- Bar navigasi yang selalu menempel di bagian bawah layar smartphone (lebar layar < 768px):
  - **Beranda** (status aktif)
  - **Live / Feed** (dengan lampu indikator merah berkedip *pulsating*)
  - **Notifikasi** (dengan *badge* pesan baru)
  - **Keranjang** (dengan *badge counter* keranjang *real-time*)
  - **Saya / Profil** (informasi saldo ShopeePay & Koin)

---

## 🛠️ Arsitektur & Struktur Berkas

```
ecommerce-storefront/
├── index.html              # Struktur semantic HTML5, SEO Schema, dan accessibility
├── css/
│   └── style.css           # Styling terintegrasi, CSS custom variables Shopee, mobile-first
├── js/
│   ├── products-data.js    # Dataset mock: 36+ produk rekomendasi, flash sale, voucher, kategori
│   ├── carousel.js         # Hero banner carousel dengan auto-rotate & touch swipe
│   ├── flash-sale.js       # Countdown timer real-time & horizontal track scroll
│   ├── vouchers.js         # Manajemen klaim voucher wallet & persistensi localStorage
│   ├── search.js           # Smart search bar, auto-suggest, riwayat pencarian
│   ├── cart.js             # State keranjang belanja, drawer, & kalkulasi gratis ongkir
│   ├── quick-view.js       # Modal pop-up detail produk interaktif
│   ├── infinite-scroll.js  # Engine infinite scroll IntersectionObserver & filter tab
│   └── app.js              # Orchestrator utama, mobile bottom nav, drawers, & toast
└── README.md               # Dokumentasi lengkap proyek
```

---

## 🚀 Cara Menjalankan Proyek

Aplikasi ini dibangun menggunakan teknologi web murni (**Vanilla HTML5, CSS3 Modern, & JavaScript ES6+**) tanpa memerlukan kompilasi *bundler* atau instalasi dependensi pihak ketiga yang berat:

### Cara 1: Langsung Buka di Browser
Cukup buka berkas `ecommerce-storefront/index.html` dengan klik dua kali di file explorer atau klik kanan lalu pilih **Open with Google Chrome / Microsoft Edge / Firefox**.

### Cara 2: Menjalankan via Local Web Server
Jika Anda memiliki server lokal (misalnya menggunakan ekstensi *Live Server* di VS Code, atau Python/Node):
```bash
# Contoh menggunakan npx serve (jika Node tersedia):
npx serve ecommerce-storefront

# Atau menggunakan PowerShell / browser langsung:
Start-Process "c:\Users\Danish\OneDrive\CodingCamp-20July26-danish\ecommerce-storefront\index.html"
```

---

## 📱 Kepatuhan Desain & Kinerja (Non-Functional Requirements)

1. **Mobile-First Responsive Design:**
   - Grid layout yang secara dinamis menyesuaikan: **2 kolom pada smartphone**, **4 kolom pada tablet**, dan **6 kolom pada desktop**.
   - Ukuran *touch target* minimal **44x44 piksel** untuk seluruh tombol, ikon, dan tautan interaktif guna meminimalisir salah klik di layar sentuh.
2. **Kinerja & Kecepatan Muat:**
   - Semua gambar produk menggunakan atribut `loading="lazy"` untuk *lazy loading* alami browser.
   - Pemuatan produk menggunakan *IntersectionObserver* ber-batch (12 produk per pemanggilan) sehingga halaman tetap ringan dan waktu muat awal berada di bawah **1 detik**.
   - Dilengkapi *fallback handler* gambar berbasis SVG vector murni sehingga antarmuka tetap tampil elegan bahkan saat jaringan lambat atau offline.
3. **Psikologi Desain E-Commerce (Shopee Brand Identity):**
   - Dominasi warna oranye khas Shopee (`#EE4D2D`), aksen merah FOMO (`#D0011B`), kuning keemasan bintang ulasan (`#FFBF00`), dan hijau gratis ongkir (`#00BFA5`).
   - Hirarki visual tegas: Foto produk 1:1 dan label harga merah tebal adalah fokus pandangan mata pertama pengguna.
4. **Optimasi SEO & Aksesibilitas:**
   - Tag heading semantik lengkap (`<h1>`, `<h2>`, `<article>`, `<section>`, `<header>`, `<nav>`, `<footer>`).
   - Dukungan *screen reader* via class `.sr-only` dan atribut `aria-label`, `aria-modal`, `aria-roledescription`.
   - Structured Data Schema.org bertipe `WebSite` dan `SearchAction` dalam format JSON-LD.
