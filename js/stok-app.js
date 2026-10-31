/* ============================================================
   stok-app.js : logika Vue untuk stok.html (Tugas Praktik 2)
   Membutuhkan: Vue 2 (CDN), js/dataBahanAjar.js, js/common.js
   ============================================================ */
var app = new Vue({
  el: '#app',

  /* ---------------- DATA (state) ---------------- */
  data: {
    judulHalaman: 'Informasi Bahan Ajar',
    upbjjList: dataBahanAjar.upbjjList,
    kategoriList: dataBahanAjar.kategoriList,
    stok: SITTA.data.stok(),          // data awal + perubahan pengguna (localStorage)

    // state filter & sort
    filter: { cari: '', upbjj: '', kategori: '', reorderOnly: false, sortBy: 'judul', sortDir: 'asc' },

    // state form (dipakai untuk tambah & edit)
    formTampil: false,
    mode: 'tambah',            // 'tambah' | 'edit'
    form: null,
    errors: {},

    // notifikasi
    pesan: '',
    pesanTipe: 'ok',           // 'ok' | 'warn'

    // sampul yang gambarnya gagal dimuat -> tampilkan kode barang
    coverGagal: {},

    // header
    pengguna: SITTA.auth.nama(),
    inisial: SITTA.auth.inisial(),
    topCari: '',
    menuOpen: false,
    dropdownOpen: false
  },

  /* ---------------- COMPUTED (di-cache: tidak dihitung ulang
     selama dependensinya tidak berubah) ---------------- */
  computed: {
    // Dependent options: kategori hanya yang ada di UT-Daerah terpilih
    kategoriOptions: function () {
      var self = this;
      if (!self.filter.upbjj) return [];
      var hasil = [];
      self.stok.forEach(function (s) {
        if (s.upbjj === self.filter.upbjj && hasil.indexOf(s.kategori) === -1) hasil.push(s.kategori);
      });
      return hasil;
    },

    // Daftar tampil: filter lalu sort. Satu computed untuk semua filter.
    stokTampil: function () {
      var f = this.filter;
      var q = f.cari.trim().toLowerCase();

      var hasil = this.stok.filter(function (s) {
        if (f.upbjj && s.upbjj !== f.upbjj) return false;
        if (f.kategori && s.kategori !== f.kategori) return false;
        if (f.reorderOnly && !(s.qty < s.safety || s.qty === 0)) return false;
        if (q && (s.kode + ' ' + s.judul + ' ' + s.lokasiRak).toLowerCase().indexOf(q) === -1) return false;
        return true;
      });

      var arah = f.sortDir === 'asc' ? 1 : -1;
      var kunci = f.sortBy;
      return hasil.slice().sort(function (a, b) {
        if (kunci === 'judul') return a.judul.localeCompare(b.judul) * arah;
        return (a[kunci] - b[kunci]) * arah;   // qty / harga
      });
    },

    jumlahReorder: function () {
      return this.stok.filter(function (s) { return s.qty < s.safety || s.qty === 0; }).length;
    },
    totalStok: function () {
      return this.stok.reduce(function (jml, s) { return jml + s.qty; }, 0);
    },
    filterAktif: function () {
      var f = this.filter;
      return !!(f.cari || f.upbjj || f.kategori || f.reorderOnly || f.sortBy !== 'judul' || f.sortDir !== 'asc');
    }
  },

  /* ---------------- WATCHERS ---------------- */
  watch: {
    // 1) Ganti UT-Daerah -> kategori lama tidak berlaku lagi, reset
    'filter.upbjj': function () {
      this.filter.kategori = '';
    },

    // 2) Jumlah item reorder bertambah -> tampilkan peringatan
    jumlahReorder: function (baru, lama) {
      if (baru > lama) {
        this.tampilPesan(baru + ' bahan ajar perlu reorder (stok di bawah safety stock).', 'warn');
      }
    },

    // 3) Kode barang di form otomatis huruf kapital
    'form.kode': function (baru) {
      if (this.form && typeof baru === 'string' && baru !== baru.toUpperCase()) {
        this.form.kode = baru.toUpperCase();
      }
    },

    // 4) Setiap perubahan stok disimpan, agar tetap ada setelah halaman
    //    dimuat ulang dan terbaca juga oleh halaman lain
    stok: {
      deep: true,
      handler: function (baru) { SITTA.store.simpan('stok', baru); }
    }
  },

  /* ---------------- METHODS ---------------- */
  methods: {
    /* ----- tampilan ----- */
    formatRupiah: function (n) {
      return SITTA.fmt.rupiah(n);
    },
    statusStok: function (s) {
      if (s.qty === 0) return 'habis';
      if (s.qty < s.safety) return 'menipis';
      return 'aman';
    },
    tampilPesan: function (teks, tipe) {
      var self = this;
      self.pesan = teks;
      self.pesanTipe = tipe || 'ok';
      clearTimeout(self._timerPesan);
      self._timerPesan = setTimeout(function () { self.pesan = ''; }, 4000);
    },
    resetFilter: function () {
      this.filter = { cari: '', upbjj: '', kategori: '', reorderOnly: false, sortBy: 'judul', sortDir: 'asc' };
    },

    /* ----- form tambah / edit ----- */
    formKosong: function () {
      return { kode: '', judul: '', kategori: '', upbjj: '', lokasiRak: '',
               harga: '', qty: 0, safety: 0, catatanHTML: '' };
    },
    bukaTambah: function () {
      if (this.formTampil && this.mode === 'tambah') { this.batal(); return; }
      this.mode = 'tambah';
      this.form = this.formKosong();
      this.errors = {};
      this.formTampil = true;
    },
    bukaEdit: function (item) {
      this.mode = 'edit';
      this.form = Object.assign({}, item);   // salinan; berlaku setelah validasi
      this.errors = {};
      this.formTampil = true;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    batal: function () {
      this.formTampil = false;
      this.form = null;
      this.errors = {};
    },

    // Hanya tag sederhana yang boleh dipakai di catatan (anti-XSS untuk v-html)
    bersihkanCatatan: function (teks) {
      var aman = String(teks || '').trim()
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return aman.replace(/&lt;(\/?)(em|strong|u|i|b)&gt;/gi, '<$1$2>');
    },

    validasi: function () {
      var f = this.form;
      var e = {};

      // kode
      if (!f.kode) e.kode = 'Kode wajib diisi.';
      else if (!/^[A-Z]{4,5}\d{4}$/.test(f.kode)) e.kode = 'Format kode: 4-5 huruf + 4 angka, contoh EKMA4216.';
      else if (this.mode === 'tambah' && this.stok.some(function (s) { return s.kode === f.kode; }))
        e.kode = 'Kode sudah terdaftar.';

      // judul
      var judul = String(f.judul).trim();
      if (!judul) e.judul = 'Judul wajib diisi.';
      else if (judul.length < 3) e.judul = 'Judul minimal 3 karakter.';
      else if (judul.length > 80) e.judul = 'Judul maksimal 80 karakter.';

      if (!f.kategori) e.kategori = 'Pilih kategori.';
      if (!f.upbjj) e.upbjj = 'Pilih UT-Daerah.';

      // lokasi rak
      if (!f.lokasiRak) e.lokasiRak = 'Lokasi rak wajib diisi.';
      else if (!/^R\d+-[A-Z]\d+$/i.test(f.lokasiRak.trim())) e.lokasiRak = 'Format lokasi: R1-A3.';

      // angka
      if (f.harga === '' || !Number.isInteger(f.harga) || f.harga < 1000) e.harga = 'Harga berupa angka bulat minimal 1.000.';
      if (f.qty === '' || !Number.isInteger(f.qty) || f.qty < 0) e.qty = 'Stok berupa angka bulat, minimal 0.';
      if (f.safety === '' || !Number.isInteger(f.safety) || f.safety < 0) e.safety = 'Safety stock berupa angka bulat, minimal 0.';

      if (String(f.catatanHTML).length > 200) e.catatanHTML = 'Catatan maksimal 200 karakter.';

      this.errors = e;
      return Object.keys(e).length === 0;
    },

    simpan: function () {
      if (!this.validasi()) return;
      var data = Object.assign({}, this.form, {
        judul: this.form.judul.trim(),
        lokasiRak: this.form.lokasiRak.trim().toUpperCase(),
        catatanHTML: this.bersihkanCatatan(this.form.catatanHTML)
      });

      if (this.mode === 'tambah') {
        this.stok.push(data);
        this.tampilPesan('Bahan ajar ' + data.kode + ' berhasil ditambahkan.', 'ok');
      } else {
        var idx = this.stok.findIndex(function (s) { return s.kode === data.kode; });
        if (idx > -1) this.$set(this.stok, idx, data);   // $set agar reaktif
        this.tampilPesan('Stok ' + data.kode + ' berhasil diperbarui.', 'ok');
      }
      this.batal();
    },

    /* ----- header ----- */
    cariDariTopbar: function () {
      this.filter.cari = this.topCari;
      var el = document.querySelector('.filters');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    },
    logout: function () {
      SITTA.auth.keluar();
    }
  },

  /* ---------------- LIFECYCLE ---------------- */
  created: function () {
    // ?q=kata : dari kolom cari top bar atau katalog di dashboard
    var q = new URLSearchParams(window.location.search).get('q');
    if (q) this.filter.cari = q;
  },
  mounted: function () {
    var self = this;
    // klik di luar menu Laporan menutup dropdown
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.dropdown')) self.dropdownOpen = false;
    });
  }
});
