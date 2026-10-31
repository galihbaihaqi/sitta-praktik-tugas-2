/* ============================================================
   tracking-app.js : logika Vue untuk tracking.html (Tugas Praktik 2)
   Membutuhkan: Vue 2 (CDN), js/dataBahanAjar.js, js/common.js
   ============================================================ */
var app = new Vue({
  el: '#app',

  /* ---------------- DATA (state) ---------------- */
  data: {
    pengirimanList: dataBahanAjar.pengirimanList,
    paketList: dataBahanAjar.paket,
    stok: SITTA.data.stok(),
    tracking: SITTA.data.tracking(),     // data awal + DO baru (localStorage)

    // pencarian
    kodeCari: '',
    kodeHasil: '',       // nomor DO yang sedang ditampilkan
    sudahCari: false,

    // form DO baru
    form: { nim: '', nama: '', ekspedisi: '', paket: '', tanggal: '', total: 0 },
    errors: {},
    pesan: '',

    // header
    pengguna: SITTA.auth.nama(),
    inisial: SITTA.auth.inisial(),
    topCari: '',
    menuOpen: false,
    dropdownOpen: false
  },

  /* ---------------- COMPUTED ---------------- */
  computed: {
    // Objek -> array agar bisa di-v-for, DO terbaru di atas
    daftarDO: function () {
      var t = this.tracking;
      return Object.keys(t).sort().reverse().map(function (no) {
        return Object.assign({ noDO: no }, t[no]);
      });
    },

    // Nomor DO otomatis: "DO" + tahun berjalan + "-" + urutan 3 digit
    nomorDOBerikutnya: function () {
      var maks = 0;
      Object.keys(this.tracking).forEach(function (no) {
        var n = parseInt(no.split('-')[1], 10);
        if (n > maks) maks = n;
      });
      var seq = String(maks + 1);
      while (seq.length < 3) seq = '0' + seq;
      return 'DO' + new Date().getFullYear() + '-' + seq;
    },

    paketTerpilih: function () {
      var kode = this.form.paket;
      return this.paketList.find(function (p) { return p.kode === kode; }) || null;
    },

    // isi paket -> pasangan kode + judul dari data stok
    isiPaketTerpilih: function () {
      if (!this.paketTerpilih) return [];
      var stok = this.stok;
      return this.paketTerpilih.isi.map(function (kode) {
        var item = stok.find(function (s) { return s.kode === kode; });
        return { kode: kode, judul: item ? item.judul : '(judul tidak ditemukan)' };
      });
    },

    // hasil pencarian (null jika belum cari / tidak ketemu)
    hasil: function () {
      if (!this.kodeHasil) return null;
      var d = this.tracking[this.kodeHasil];
      return d ? Object.assign({ noDO: this.kodeHasil }, d) : null;
    },
    paketHasil: function () {
      if (!this.hasil) return '';
      var p = this.paketList.find(function (x) { return x.kode === this.hasil.paket; }, this);
      return p ? p.kode + ' — ' + p.nama : this.hasil.paket;
    },
    // status, persen, dan warna progres untuk DO yang ditampilkan
    statusHasil: function () {
      if (!this.hasil) return null;
      return {
        label: this.hasil.status,
        persen: SITTA.status.persen(this.hasil.status),
        nada: SITTA.status.nada(this.hasil.status)
      };
    },
    // perjalanan paket, terbaru di atas
    perjalananTerbaru: function () {
      return this.hasil ? this.hasil.perjalanan.slice().reverse() : [];
    },
    // lokasi pemesan bila namanya ada di data pengguna
    lokasiPemesan: function () {
      if (!this.hasil) return '';
      var p = SITTA.data.pengguna(this.hasil.nama);
      return p ? p.lokasi + ' (' + p.role + ')' : '';
    }
  },

  /* ---------------- WATCHERS ---------------- */
  watch: {
    // 1) Pilih paket -> total harga otomatis dari data paket
    'form.paket': function () {
      this.form.total = this.paketTerpilih ? this.paketTerpilih.harga : 0;
      if (this.paketTerpilih) this.$delete(this.errors, 'paket');
    },

    // 2) NIM hanya boleh angka (dibersihkan saat mengetik)
    'form.nim': function (baru) {
      var bersih = String(baru).replace(/\D/g, '').slice(0, 15);
      if (bersih !== baru) this.form.nim = bersih;
    },

    // 3) Kolom cari dikosongkan -> hasil lama ikut hilang
    kodeCari: function (baru) {
      if (!baru.trim()) { this.kodeHasil = ''; this.sudahCari = false; }
    },

    // 4) DO baru disimpan, agar tetap ada setelah halaman dimuat ulang
    //    dan ikut tampil di Monitoring / Rekap / Histori dashboard
    tracking: {
      deep: true,
      handler: function (baru) { SITTA.store.simpan('tracking', baru); }
    }
  },

  /* ---------------- METHODS ---------------- */
  methods: {
    formatRupiah: function (n) {
      return SITTA.fmt.rupiah(n);
    },
    tanggalIndo: function (s) {
      return SITTA.fmt.tanggalIndo(s);
    },
    nadaStatus: function (status) {
      return SITTA.status.nada(status);
    },
    hariIni: function () {
      return SITTA.fmt.hariIni();
    },

    /* ----- pencarian ----- */
    cari: function () {
      this.kodeHasil = this.kodeCari.trim().toUpperCase();
      this.sudahCari = true;
    },
    lihat: function (noDO) {
      this.kodeCari = noDO;
      this.cari();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    /* ----- form DO baru ----- */
    resetForm: function () {
      this.form = { nim: '', nama: '', ekspedisi: '', paket: '', tanggal: this.hariIni(), total: 0 };
      this.errors = {};
    },
    validasi: function () {
      var f = this.form, e = {};
      if (!f.nim) e.nim = 'NIM wajib diisi.';
      else if (f.nim.length < 8) e.nim = 'NIM minimal 8 digit angka.';

      var nama = f.nama.trim();
      if (!nama) e.nama = 'Nama wajib diisi.';
      else if (nama.length < 3) e.nama = 'Nama minimal 3 karakter.';
      else if (!/^[A-Za-z .'-]+$/.test(nama)) e.nama = 'Nama hanya boleh huruf dan spasi.';

      if (!f.ekspedisi) e.ekspedisi = 'Pilih ekspedisi.';
      if (!f.paket) e.paket = 'Pilih paket bahan ajar.';
      if (!f.tanggal) e.tanggal = 'Tanggal kirim wajib diisi.';

      this.errors = e;
      return Object.keys(e).length === 0;
    },
    simpan: function () {
      if (!this.validasi()) return;
      var no = this.nomorDOBerikutnya;
      var f = this.form;
      this.$set(this.tracking, no, {
        nim: f.nim,
        nama: f.nama.trim(),
        status: 'Pesanan Dibuat',
        ekspedisi: f.ekspedisi,
        tanggalKirim: f.tanggal,
        paket: f.paket,
        total: f.total,
        pembayaran: 'Menunggu Pembayaran',
        perjalanan: [{ waktu: SITTA.fmt.waktuSekarang(), keterangan: 'Pesanan dibuat, menunggu pembayaran' }]
      });
      this.pesan = 'DO ' + no + ' berhasil dibuat.';
      this.lihat(no);
      this.resetForm();
    },

    /* ----- header ----- */
    cariDariTopbar: function () {
      SITTA.cariDiStok(this.topCari);
    },
    logout: function () {
      SITTA.auth.keluar();
    }
  },

  /* ---------------- LIFECYCLE ---------------- */
  created: function () {
    this.form.tanggal = this.hariIni();
    // ?do=DO2025-001 : dari dashboard (hasil pencarian / tombol Detail)
    var no = new URLSearchParams(window.location.search).get('do');
    if (no) { this.kodeCari = no; this.cari(); }
  },
  mounted: function () {
    var self = this;
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.dropdown')) self.dropdownOpen = false;
    });
  }
});
