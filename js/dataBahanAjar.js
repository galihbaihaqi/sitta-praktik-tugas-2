/* ============================================================
   dataBahanAjar.js : SUMBER DATA TUNGGAL aplikasi SITTA
   ------------------------------------------------------------
   Dipakai bersama oleh SEMUA halaman (login, dashboard, stok,
   tracking) sehingga Tugas Praktik 1 dan 2 selalu sinkron.
   Dimuat PALING AWAL (sebelum common.js dan skrip halaman).

   Isi:
   - dataPengguna   : akun untuk login (Tugas 1)
   - dataBahanAjar  : upbjjList, kategoriList, pengirimanList,
                      paket, stok, tracking (Tugas 2)

   Catatan:
   - "tracking" = daftar Delivery Order (kunci = nomor DO).
     Monitoring, Rekap, dan Histori Transaksi di dashboard
     dihitung dari data ini, jadi DO baru dari halaman Tracking
     otomatis ikut muncul di sana.
   - 5 bahan ajar terakhir pada "stok" berasal dari data Tugas 1
     (ada gambar sampul); kolom upbjj, lokasiRak, harga, dan safety
     untuk 5 item itu adalah nilai contoh.
   - Perubahan dari pengguna (tambah/edit stok, DO baru) disimpan
     di localStorage; tombol "Setel ulang data contoh" di dashboard
     mengembalikannya ke isi file ini.
   ============================================================ */

var dataPengguna = [
  {"id": 1, "nama": "Rina Wulandari", "email": "rina@ut.ac.id", "password": "rina123", "role": "UPBJJ-UT", "lokasi": "UPBJJ Jakarta"},
  {"id": 2, "nama": "Agus Pranoto", "email": "agus@ut.ac.id", "password": "agus123", "role": "UPBJJ-UT", "lokasi": "UPBJJ Makassar"},
  {"id": 3, "nama": "Siti Marlina", "email": "siti@ut.ac.id", "password": "siti123", "role": "Puslaba", "lokasi": "Pusat"},
  {"id": 4, "nama": "Doni Setiawan", "email": "doni@ut.ac.id", "password": "doni123", "role": "Fakultas", "lokasi": "FISIP"},
  {"id": 5, "nama": "Admin SITTA", "email": "admin@ut.ac.id", "password": "admin123", "role": "Administrator", "lokasi": "Pusat"},
  {"id": 6, "nama": "Galih", "email": "galih@email.com", "password": "052977562", "role": "Mahasiswa", "lokasi": "Demo"}
];

var dataBahanAjar = {
  upbjjList: ["Jakarta", "Surabaya", "Makassar", "Padang", "Denpasar", "Bandung", "Malang"],
  kategoriList: ["MK Wajib", "MK Pilihan", "Praktikum", "Problem-Based"],
  pengirimanList: [{"kode": "REG", "nama": "Reguler (3-5 hari)"}, {"kode": "EXP", "nama": "Ekspres (1-2 hari)"}],

  paket: [
    {"kode": "PAKET-UT-001", "nama": "PAKET IPS Dasar", "isi": ["EKMA4116", "EKMA4115"], "harga": 120000},
    {"kode": "PAKET-UT-002", "nama": "PAKET IPA Dasar", "isi": ["BIOL4201", "FISIP4001"], "harga": 140000},
    {"kode": "PAKET-UT-003", "nama": "PAKET Komunikasi dan Manajemen", "isi": ["ASIP4301", "EKMA4216", "EKMA4310"], "harga": 210000},
    {"kode": "PAKET-UT-004", "nama": "PAKET Sains dan Pendidikan Anak", "isi": ["BIOL4211", "PAUD4401"], "harga": 150000}
  ],

  stok: [
    {"kode": "EKMA4116", "judul": "Pengantar Manajemen", "kategori": "MK Wajib", "upbjj": "Jakarta", "lokasiRak": "R1-A3", "harga": 65000, "qty": 28, "safety": 20, "catatanHTML": "<em>Edisi 2024, cetak ulang</em>"},
    {"kode": "EKMA4115", "judul": "Pengantar Akuntansi", "kategori": "MK Wajib", "upbjj": "Jakarta", "lokasiRak": "R1-A4", "harga": 60000, "qty": 7, "safety": 15, "catatanHTML": "<strong>Cover baru</strong>"},
    {"kode": "BIOL4201", "judul": "Biologi Umum (Praktikum)", "kategori": "Praktikum", "upbjj": "Surabaya", "lokasiRak": "R3-B2", "harga": 80000, "qty": 12, "safety": 10, "catatanHTML": "Butuh <u>pendingin</u> untuk kit basah"},
    {"kode": "FISIP4001", "judul": "Dasar-Dasar Sosiologi", "kategori": "MK Pilihan", "upbjj": "Makassar", "lokasiRak": "R2-C1", "harga": 55000, "qty": 2, "safety": 8, "catatanHTML": "Stok <i>menipis</i>, prioritaskan reorder"},
    {"kode": "ASIP4301", "judul": "Pengantar Ilmu Komunikasi", "kategori": "MK Wajib", "upbjj": "Jakarta", "lokasiRak": "R4-A1", "harga": 70000, "qty": 548, "safety": 200, "catatanHTML": "BMP, <em>edisi 2</em>", "cover": "img/pengantar_komunikasi.jpg"},
    {"kode": "EKMA4216", "judul": "Manajemen Keuangan", "kategori": "MK Wajib", "upbjj": "Jakarta", "lokasiRak": "R4-A2", "harga": 75000, "qty": 392, "safety": 200, "catatanHTML": "BMP, <em>edisi 3</em>", "cover": "img/manajemen_keuangan.jpg"},
    {"kode": "EKMA4310", "judul": "Kepemimpinan", "kategori": "MK Pilihan", "upbjj": "Surabaya", "lokasiRak": "R5-B1", "harga": 65000, "qty": 278, "safety": 200, "catatanHTML": "BMP, <em>edisi 1</em>", "cover": "img/kepemimpinan.jpg"},
    {"kode": "BIOL4211", "judul": "Mikrobiologi Dasar", "kategori": "Praktikum", "upbjj": "Malang", "lokasiRak": "R5-B2", "harga": 85000, "qty": 165, "safety": 200, "catatanHTML": "BMP, <em>edisi 2</em>", "cover": "img/mikrobiologi.jpg"},
    {"kode": "PAUD4401", "judul": "Perkembangan Anak Usia Dini", "kategori": "MK Pilihan", "upbjj": "Bandung", "lokasiRak": "R6-C1", "harga": 70000, "qty": 204, "safety": 200, "catatanHTML": "BMP, <em>edisi 4</em>", "cover": "img/paud_perkembangan.jpg"}
  ],

  // Delivery Order. status = salah satu dari SITTA.TAHAPAN (common.js)
  // pembayaran = "Lunas" | "Menunggu Pembayaran" | "Dibatalkan"
  tracking: {
    "DO2025-001": {
      "nim": "123456789", "nama": "Rina Wulandari", "status": "Dalam Perjalanan", "ekspedisi": "JNE", "tanggalKirim": "2025-08-25", "paket": "PAKET-UT-001", "total": 120000, "pembayaran": "Lunas",
      "perjalanan": [
        {"waktu": "2025-08-25 10:12:20", "keterangan": "Penerimaan di Loket: TANGSEL"},
        {"waktu": "2025-08-25 14:07:56", "keterangan": "Tiba di Hub: JAKSEL"},
        {"waktu": "2025-08-26 08:44:01", "keterangan": "Diteruskan ke Kantor Tujuan"}
      ]
    },
    "DO2025-002": {
      "nim": "049123456", "nama": "Budi Santoso", "status": "Selesai", "ekspedisi": "JNE Express", "tanggalKirim": "2025-03-10", "paket": "PAKET-UT-003", "total": 210000, "pembayaran": "Lunas",
      "perjalanan": [
        {"waktu": "2025-03-08 09:15:00", "keterangan": "Pesanan diterima sistem"},
        {"waktu": "2025-03-09 13:40:00", "keterangan": "Bahan ajar dikemas di gudang UT"},
        {"waktu": "2025-03-10 08:05:00", "keterangan": "Paket diserahkan ke JNE"},
        {"waktu": "2025-03-11 17:30:00", "keterangan": "Paket dalam perjalanan ke kota tujuan"},
        {"waktu": "2025-03-13 10:20:00", "keterangan": "Paket tiba di kantor cabang tujuan"},
        {"waktu": "2025-03-14 14:00:00", "keterangan": "Paket diterima oleh Budi Santoso"}
      ]
    },
    "DO2025-003": {
      "nim": "049234567", "nama": "Siti Rahmawati", "status": "Dikirim", "ekspedisi": "JNE Reguler (3-5 hari)", "tanggalKirim": "2025-03-12", "paket": "PAKET-UT-002", "total": 140000, "pembayaran": "Lunas",
      "perjalanan": [
        {"waktu": "2025-03-10 10:00:00", "keterangan": "Pesanan diterima sistem"},
        {"waktu": "2025-03-11 15:20:00", "keterangan": "Bahan ajar dikemas di gudang UT"},
        {"waktu": "2025-03-12 09:45:00", "keterangan": "Paket diserahkan ke JNE"},
        {"waktu": "2025-03-13 19:10:00", "keterangan": "Paket dalam perjalanan ke kota tujuan"}
      ]
    },
    "DO2025-004": {
      "nim": "049345678", "nama": "Andi Prasetyo", "status": "Diproses", "ekspedisi": "JNE Reguler (3-5 hari)", "tanggalKirim": "2025-03-14", "paket": "PAKET-UT-001", "total": 120000, "pembayaran": "Lunas",
      "perjalanan": [
        {"waktu": "2025-03-13 11:30:00", "keterangan": "Pesanan diterima sistem"}
      ]
    },
    "DO2025-005": {
      "nim": "049456789", "nama": "Dewi Lestari", "status": "Tiba di Kota Tujuan", "ekspedisi": "JNE Express", "tanggalKirim": "2025-03-09", "paket": "PAKET-UT-004", "total": 150000, "pembayaran": "Lunas",
      "perjalanan": [
        {"waktu": "2025-03-07 08:50:00", "keterangan": "Pesanan diterima sistem"},
        {"waktu": "2025-03-08 14:15:00", "keterangan": "Bahan ajar dikemas di gudang UT"},
        {"waktu": "2025-03-09 10:00:00", "keterangan": "Paket diserahkan ke JNE"},
        {"waktu": "2025-03-10 21:40:00", "keterangan": "Paket dalam perjalanan ke kota tujuan"},
        {"waktu": "2025-03-12 09:05:00", "keterangan": "Paket tiba di kantor cabang tujuan"}
      ]
    },
    "DO2025-006": {
      "nim": "049567890", "nama": "Rizky Maulana", "status": "Dikemas", "ekspedisi": "JNE Express", "tanggalKirim": "2025-03-15", "paket": "PAKET-UT-003", "total": 210000, "pembayaran": "Lunas",
      "perjalanan": [
        {"waktu": "2025-03-13 16:20:00", "keterangan": "Pesanan diterima sistem"},
        {"waktu": "2025-03-14 10:10:00", "keterangan": "Pesanan sedang diproses gudang"},
        {"waktu": "2025-03-15 08:30:00", "keterangan": "Bahan ajar dikemas di gudang UT"}
      ]
    },
    "DO2025-007": {
      "nim": "049678901", "nama": "Maya Putri", "status": "Selesai", "ekspedisi": "JNE Reguler (3-5 hari)", "tanggalKirim": "2025-03-11", "paket": "PAKET-UT-002", "total": 140000, "pembayaran": "Lunas",
      "perjalanan": [
        {"waktu": "2025-03-09 09:00:00", "keterangan": "Pesanan diterima sistem"},
        {"waktu": "2025-03-10 11:25:00", "keterangan": "Bahan ajar dikemas di gudang UT"},
        {"waktu": "2025-03-11 09:15:00", "keterangan": "Paket diserahkan ke JNE"},
        {"waktu": "2025-03-12 20:00:00", "keterangan": "Paket dalam perjalanan ke kota tujuan"},
        {"waktu": "2025-03-14 08:45:00", "keterangan": "Paket tiba di kantor cabang tujuan"},
        {"waktu": "2025-03-14 16:30:00", "keterangan": "Paket diterima oleh Maya Putri"}
      ]
    },
    "DO2025-008": {
      "nim": "049789012", "nama": "Hendra Wijaya", "status": "Dikirim", "ekspedisi": "JNE Reguler (3-5 hari)", "tanggalKirim": "2025-03-13", "paket": "PAKET-UT-001", "total": 120000, "pembayaran": "Lunas",
      "perjalanan": [
        {"waktu": "2025-03-11 13:00:00", "keterangan": "Pesanan diterima sistem"},
        {"waktu": "2025-03-12 10:30:00", "keterangan": "Bahan ajar dikemas di gudang UT"},
        {"waktu": "2025-03-13 09:00:00", "keterangan": "Paket diserahkan ke JNE"},
        {"waktu": "2025-03-14 18:20:00", "keterangan": "Paket dalam perjalanan ke kota tujuan"}
      ]
    },
    "DO2025-009": {
      "nim": "049890123", "nama": "Lina Marlina", "status": "Pesanan Dibuat", "ekspedisi": "JNE Reguler (3-5 hari)", "tanggalKirim": "2025-03-15", "paket": "PAKET-UT-004", "total": 150000, "pembayaran": "Menunggu Pembayaran",
      "perjalanan": [
        {"waktu": "2025-03-15 08:00:00", "keterangan": "Pesanan diterima sistem, menunggu pembayaran"}
      ]
    },
    "DO2025-010": {
      "nim": "049901234", "nama": "Fajar Nugroho", "status": "Pesanan Dibuat", "ekspedisi": "JNE Express", "tanggalKirim": "2025-03-14", "paket": "PAKET-UT-002", "total": 140000, "pembayaran": "Menunggu Pembayaran",
      "perjalanan": [
        {"waktu": "2025-03-14 08:00:00", "keterangan": "Pesanan diterima sistem, menunggu pembayaran"}
      ]
    },
    "DO2025-011": {
      "nim": "049012345", "nama": "Tono Hartono", "status": "Pesanan Dibuat", "ekspedisi": "JNE Reguler (3-5 hari)", "tanggalKirim": "2025-03-06", "paket": "PAKET-UT-003", "total": 210000, "pembayaran": "Dibatalkan",
      "perjalanan": [
        {"waktu": "2025-03-06 08:00:00", "keterangan": "Pesanan diterima sistem, menunggu pembayaran"},
        {"waktu": "2025-03-07 08:00:00", "keterangan": "Pesanan dibatalkan karena pembayaran tidak diterima"}
      ]
    }
  }
};
