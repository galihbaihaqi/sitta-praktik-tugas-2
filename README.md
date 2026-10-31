# SITTA Praktik — Aplikasi Pemesanan Bahan Ajar UT

Gabungan **Tugas Praktik 1** (HTML, CSS, JavaScript DOM) dan **Tugas Praktik 2** (Vue.js) dalam satu aplikasi
dengan alur yang sama: **Login → Dashboard → Stok / Tracking**.

## Cara menjalankan
Buka `index.html` di browser (butuh internet untuk Vue dari CDN dan font). Atau jalankan server lokal:
`python -m http.server 8000` lalu buka `http://localhost:8000`.

Akun uji: `rina@ut.ac.id` / `rina123` (akun lain ada di `js/dataBahanAjar.js`). Akun baru bisa dibuat lewat tombol **Daftar**.

## Struktur
```
index.html          Login (Tugas 1)
dashboard.html      Menu utama, greeting, katalog, cari DO, Monitoring / Rekap / Histori (Tugas 1)
stok.html           Informasi Stok Bahan Ajar  — Vue.js (Tugas 2)
tracking.html       Tracking Pengiriman + DO baru — Vue.js (Tugas 2)
css/style.css       Satu tema untuk semua halaman
img/                Logo dan sampul buku
js/
  dataBahanAjar.js  Sumber data tunggal (pengguna, stok, paket, DO)
  common.js         Sesi login & penjaga halaman, penyimpanan, format, tahapan status (objek SITTA)
  login.js          Logika login (JavaScript DOM)
  dashboard.js      Logika dashboard (JavaScript DOM)
  stok-app.js       Vue: filter, sort, dependent option, status stok, tambah/edit + validasi
  tracking-app.js   Vue: cari DO, progres & timeline, form DO baru + validasi
```

## Cara kerja sinkronisasi
- Semua halaman memakai `dataBahanAjar.js` dan `common.js`, jadi data dan fungsi tidak ganda.
- Halaman dalam dijaga: belum login → otomatis kembali ke `index.html`. Tombol **Keluar** ada di semua halaman.
- Stok yang diubah dan DO yang dibuat disimpan di `localStorage` dan langsung terbaca dashboard
  (Monitoring, Rekap, Histori, pencarian DO). Tombol **Setel ulang data contoh** di dashboard mengembalikannya.
- Header dan menu sama di semua halaman; `index.html` tetap halaman login, `dashboard.html` menjadi menu navigasi ke stok dan tracking.

## Pemetaan ke kriteria Tugas 2
| Kriteria | Lokasi |
|---|---|
| Struktur proyek | folder `js/`, `css/`, satu halaman satu file `*-app.js` |
| Data binding & list rendering | `v-for`, `v-model`, `v-bind`, `v-html`, mustache di `stok.html` dan `tracking.html` |
| Conditional | `v-if` / `v-else` / `v-show` (dependent option, status stok, hasil pencarian) |
| Computed / methods | `stokTampil`, `kategoriOptions`, `nomorDOBerikutnya`, `isiPaketTerpilih`, dll. |
| Watcher (minimal 2) | 4 watcher di tiap app (mis. reset kategori saat UT-Daerah berubah, total harga saat paket dipilih) |
| Form & validasi | form stok (tambah/edit) dan form DO baru |
