/* ============================================================
   login.js : logika halaman Login (index.html)
   Membutuhkan: js/dataBahanAjar.js dan js/common.js
   Fitur: login, lupa password (modal), daftar (modal), pop-up pesan
   ============================================================ */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var KUNCI_AKUN = 'akun';           // localStorage: akun yang didaftarkan di browser ini

  // Sudah login? langsung ke dashboard.
  if (SITTA.auth.email()) {
    window.location.replace('dashboard.html');
    return;
  }

  /* ---------------- Akun ---------------- */
  function emailValid(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  function akunTersimpan() {
    try { return JSON.parse(localStorage.getItem(KUNCI_AKUN) || '[]'); } catch (e) { return []; }
  }

  // Akun dari dataPengguna + akun hasil pendaftaran
  function semuaAkun() {
    var dariData = dataPengguna.map(function (p) { return { email: p.email, password: p.password }; });
    return dariData.concat(akunTersimpan());
  }

  function simpanAkun(akun) {
    var daftar = akunTersimpan();
    daftar.push(akun);
    try { localStorage.setItem(KUNCI_AKUN, JSON.stringify(daftar)); } catch (e) { /* abaikan */ }
  }

  /* ---------------- Modal ---------------- */
  function buka(id)  { $(id).classList.add('show'); }
  function tutup(id) { $(id).classList.remove('show'); }

  function tampilPesan(tipe, judul, isi, setelahOk) {
    $('boxPesan').className = 'modal ' + tipe;
    $('pesanJudul').textContent = judul;
    $('pesanIsi').textContent = isi;
    // tombol OK: tutup, lalu jalankan aksi lanjutan bila ada
    $('pesanOk').onclick = function () {
      tutup('modalPesan');
      if (setelahOk) setelahOk();
    };
    buka('modalPesan');
    $('pesanOk').focus();
  }

  document.querySelectorAll('[data-close]').forEach(function (el) {
    el.addEventListener('click', function () { tutup(el.dataset.close); });
  });
  document.querySelectorAll('.overlay').forEach(function (ov) {
    ov.addEventListener('click', function (e) { if (e.target === ov) ov.classList.remove('show'); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.overlay').forEach(function (o) { o.classList.remove('show'); });
  });

  /* ---------------- Login ---------------- */
  $('formLogin').addEventListener('submit', function (e) {
    e.preventDefault();
    var email = $('email').value.trim();
    var password = $('password').value;

    if (!email || !password) {
      tampilPesan('error', 'Login gagal', 'Email dan password wajib diisi.');
      return;
    }
    var cocok = semuaAkun().some(function (a) { return a.email === email && a.password === password; });
    if (!cocok) {
      tampilPesan('error', 'Login gagal', 'Email/password yang anda masukkan salah.');
      return;
    }

    SITTA.auth.masuk(email);
    tampilPesan('success', 'Login berhasil', 'Selamat datang, ' + SITTA.auth.nama() + '!', function () {
      window.location.href = 'dashboard.html';
    });
  });

  /* ---------------- Lupa password ---------------- */
  $('btnLupa').addEventListener('click', function () {
    $('lupaMsg').textContent = '';
    $('formLupa').reset();
    buka('modalLupa');
    $('lupaEmail').focus();
  });

  $('formLupa').addEventListener('submit', function (e) {
    e.preventDefault();
    var msg = $('lupaMsg');
    var email = $('lupaEmail').value.trim();
    if (!emailValid(email)) {
      msg.className = 'msg err';
      msg.textContent = 'Masukkan alamat email yang valid.';
      return;
    }
    msg.className = 'msg ok';
    msg.textContent = 'Tautan reset password telah dikirim ke ' + email + '.';
  });

  /* ---------------- Daftar ---------------- */
  $('btnDaftar').addEventListener('click', function () {
    $('daftarMsg').textContent = '';
    $('formDaftar').reset();
    buka('modalDaftar');
    $('daftarEmail').focus();
  });

  $('formDaftar').addEventListener('submit', function (e) {
    e.preventDefault();
    var msg = $('daftarMsg');
    var email = $('daftarEmail').value.trim();
    var p1 = $('daftarPass').value;
    var p2 = $('daftarPass2').value;

    function gagal(teks) { msg.className = 'msg err'; msg.textContent = teks; }

    if (!emailValid(email)) return gagal('Masukkan alamat email yang valid.');
    if (p1.length < 6) return gagal('Password minimal 6 karakter.');
    if (p1 !== p2) return gagal('Password dan ulangi password tidak sama.');
    if (semuaAkun().some(function (a) { return a.email === email; })) return gagal('Email sudah terdaftar.');

    simpanAkun({ email: email, password: p1 });
    tutup('modalDaftar');
    tampilPesan('success', 'Pendaftaran berhasil', 'Akun dibuat. Silakan login dengan email dan password Anda.');
    $('email').value = email;
    $('password').value = '';
  });
})();
