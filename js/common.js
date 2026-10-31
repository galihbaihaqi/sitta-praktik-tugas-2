/* ============================================================
   common.js : fungsi yang dipakai SEMUA halaman SITTA
   ------------------------------------------------------------
   Urutan pemuatan di setiap halaman:
     1. js/dataBahanAjar.js   (data)
     2. js/common.js          (file ini)
     3. skrip khusus halaman  (login.js / dashboard.js /
                               stok-app.js / tracking-app.js)

   Isi (semua lewat objek global SITTA):
   - SITTA.auth   : sesi login, nama pengguna, logout, penjaga halaman
   - SITTA.store  : membaca/menyimpan data kerja di localStorage
   - SITTA.data   : data stok & DO yang sudah digabung dengan localStorage
   - SITTA.status : tahapan pengiriman, persen progres, warna status
   - SITTA.fmt    : format rupiah, tanggal, salam, escape HTML
   ============================================================ */
var SITTA = (function () {
  'use strict';

  var KUNCI_SESI = 'userLogin';       // sessionStorage: email yang login
  var AWALAN     = 'sitta.v2.';       // awalan kunci localStorage

  /* ---------------- Tahapan pengiriman ---------------- */
  var TAHAPAN = [
    'Pesanan Dibuat',        // 0
    'Diproses',              // 1
    'Dikemas',               // 2
    'Dikirim',               // 3
    'Dalam Perjalanan',      // 4
    'Tiba di Kota Tujuan',   // 5
    'Selesai'                // 6
  ];

  var status = {
    daftar: TAHAPAN,
    indeks: function (nama) {
      var i = TAHAPAN.indexOf(nama);
      return i === -1 ? 0 : i;
    },
    // 0 - 100
    persen: function (nama) {
      return Math.round((status.indeks(nama) / (TAHAPAN.length - 1)) * 100);
    },
    // "proses" (oranye) | "perjalanan" (biru) | "selesai" (hijau)
    nada: function (nama) {
      var i = status.indeks(nama);
      if (i >= TAHAPAN.length - 1) return 'selesai';
      if (i >= 3) return 'perjalanan';
      return 'proses';
    }
  };

  /* ---------------- Format ---------------- */
  var fmt = {
    rupiah: function (n) {
      return 'Rp ' + Number(n).toLocaleString('id-ID');
    },
    // "2025-08-25" atau "2025-08-25 10:12:20" -> "25 Agustus 2025[, 10:12]"
    tanggalIndo: function (str) {
      var d = new Date(String(str).replace(' ', 'T'));
      if (isNaN(d)) return str;
      var hasil = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      if (String(str).indexOf(' ') !== -1) {
        hasil += ', ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
      }
      return hasil;
    },
    salam: function (jam) {
      if (jam >= 4 && jam < 11) return 'Selamat pagi';
      if (jam >= 11 && jam < 15) return 'Selamat siang';
      if (jam >= 15 && jam < 18) return 'Selamat sore';
      return 'Selamat malam';
    },
    // tanggal lokal YYYY-MM-DD (untuk <input type="date">)
    hariIni: function () {
      var d = new Date();
      return d.getFullYear() + '-' + dua(d.getMonth() + 1) + '-' + dua(d.getDate());
    },
    // waktu lokal YYYY-MM-DD HH:MM:SS (untuk riwayat perjalanan)
    waktuSekarang: function () {
      var d = new Date();
      return fmt.hariIni() + ' ' + dua(d.getHours()) + ':' + dua(d.getMinutes()) + ':' + dua(d.getSeconds());
    },
    // cegah XSS saat teks disisipkan lewat innerHTML
    esc: function (teks) {
      var el = document.createElement('div');
      el.textContent = teks;
      return el.innerHTML;
    }
  };

  function dua(n) { return ('0' + n).slice(-2); }

  /* ---------------- Penyimpanan (localStorage) ---------------- */
  function salin(x) { return JSON.parse(JSON.stringify(x)); }

  var store = {
    muat: function (kunci, awal) {
      try {
        var s = localStorage.getItem(AWALAN + kunci);
        if (s) return JSON.parse(s);
      } catch (e) { /* abaikan: pakai data awal */ }
      return salin(awal);
    },
    simpan: function (kunci, nilai) {
      try { localStorage.setItem(AWALAN + kunci, JSON.stringify(nilai)); } catch (e) { /* penuh/diblokir */ }
    },
    // kembalikan data kerja ke isi dataBahanAjar.js (akun & sesi tidak disentuh)
    setelUlang: function () {
      try {
        localStorage.removeItem(AWALAN + 'stok');
        localStorage.removeItem(AWALAN + 'tracking');
      } catch (e) { /* abaikan */ }
    }
  };

  // Data kerja = data awal + perubahan pengguna.
  var data = {
    stok:     function () { return store.muat('stok', dataBahanAjar.stok); },
    tracking: function () { return store.muat('tracking', dataBahanAjar.tracking); },
    paket:    function (kode) {
      return dataBahanAjar.paket.find(function (p) { return p.kode === kode; }) || null;
    },
    pengguna: function (nama) {
      return dataPengguna.find(function (p) { return p.nama === nama; }) || null;
    }
  };

  /* ---------------- Sesi & penjaga halaman ---------------- */
  var auth = {
    email: function () {
      try { return sessionStorage.getItem(KUNCI_SESI) || ''; } catch (e) { return ''; }
    },
    masuk: function (email) {
      try { sessionStorage.setItem(KUNCI_SESI, email); } catch (e) { /* abaikan */ }
    },
    keluar: function () {
      try { sessionStorage.removeItem(KUNCI_SESI); } catch (e) { /* abaikan */ }
      window.location.href = 'index.html';
    },
    nama: function () {
      var email = auth.email();
      if (!email) return 'Pengguna';
      var p = dataPengguna.find(function (x) { return x.email === email; });
      if (p && p.nama) return p.nama;
      var depan = email.split('@')[0];                 // admin@email.com -> "Admin"
      return depan.charAt(0).toUpperCase() + depan.slice(1);
    },
    inisial: function () { return auth.nama().charAt(0).toUpperCase(); },

    // Halaman dalam hanya boleh dibuka setelah login.
    // Halaman login menandai dirinya dengan <html data-publik>.
    jaga: function () {
      if (document.documentElement.hasAttribute('data-publik')) return;
      if (!auth.email()) window.location.replace('index.html');
    }
  };

  /* ---------------- Navigasi bersama ---------------- */
  // Kolom cari di top bar -> halaman Informasi Bahan Ajar
  function cariDiStok(kata) {
    var q = String(kata || '').trim();
    window.location.href = 'stok.html' + (q ? '?q=' + encodeURIComponent(q) : '');
  }

  auth.jaga();   // dijalankan segera, sebelum halaman tampil

  return {
    TAHAPAN: TAHAPAN,
    status: status,
    fmt: fmt,
    store: store,
    data: data,
    auth: auth,
    cariDiStok: cariDiStok
  };
})();
