/* ============================================================
   dashboard.js : logika halaman Dashboard (dashboard.html)
   Membutuhkan: js/dataBahanAjar.js dan js/common.js
   Fitur: greeting + jam, katalog bahan ajar, cari Delivery Order,
          panel Monitoring DO, Rekap Bahan Ajar, Histori Transaksi.
   Semua data berasal dari sumber yang sama dengan halaman Stok
   dan Tracking (SITTA.data), jadi perubahan di sana ikut tampil.
   ============================================================ */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var fmt = SITTA.fmt;
  var TAHAPAN = SITTA.TAHAPAN;

  var tracking = SITTA.data.tracking();   // { "DO2025-001": {...}, ... }
  var stok     = SITTA.data.stok();

  /* ---------------- Helper data ---------------- */
  function namaPaket(kode) {
    var p = SITTA.data.paket(kode);
    return p ? p.nama : kode;
  }
  function jumlahModul(d) {
    var p = SITTA.data.paket(d.paket);
    return p ? p.isi.length : 0;
  }
  function nomorDO() {
    return Object.keys(tracking).sort();
  }
  // Satu DO = satu transaksi. Status pembayaran disimpan di DO.
  function daftarHistori() {
    return nomorDO().map(function (no) {
      var d = tracking[no];
      var awal = d.perjalanan.length ? d.perjalanan[0].waktu.slice(0, 10) : d.tanggalKirim;
      var urut = no.split('-')[1] || '0';
      return {
        id: 'TRX-' + ('0000' + urut).slice(-4),
        tgl: awal,
        noDO: no,
        nama: d.nama,
        ket: namaPaket(d.paket),
        total: d.total,
        status: d.pembayaran || 'Lunas'
      };
    });
  }

  /* ---------------- Header: pengguna, menu, dropdown ---------------- */
  function isiInfoPengguna() {
    $('topNama').textContent = SITTA.auth.nama();
    $('topAvatar').textContent = SITTA.auth.inisial();
  }

  function setDropdown(buka) {
    var dd = $('dropLaporan');
    dd.classList.toggle('open', buka);
    dd.querySelector('.drop-btn').setAttribute('aria-expanded', String(buka));
  }

  function initHeader() {
    isiInfoPengguna();

    var toggle = $('toggle');
    var menu = $('menu');
    toggle.addEventListener('click', function () {
      toggle.setAttribute('aria-expanded', String(menu.classList.toggle('open')));
    });

    $('dropLaporan').querySelector('.drop-btn').addEventListener('click', function (e) {
      e.stopPropagation();
      setDropdown(!$('dropLaporan').classList.contains('open'));
    });
    document.addEventListener('click', function () { setDropdown(false); });

    document.querySelector('[data-aksi="logout"]').addEventListener('click', SITTA.auth.keluar);

    $('topCari').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') SITTA.cariDiStok(this.value);
    });
  }

  /* ---------------- Greeting + jam ---------------- */
  function updateWaktu() {
    var now = new Date();
    $('greeting').textContent = fmt.salam(now.getHours()) + ', ' + SITTA.auth.nama() + '!';
    $('clock').textContent =
      now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) +
      ' — ' +
      now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':') +
      ' WIB';
  }

  /* ---------------- Katalog sampul ---------------- */
  function buatEl(tag, attrs, teks) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (teks !== undefined) e.textContent = teks;
    return e;
  }

  function renderKatalog() {
    var wadah = $('katalog');
    wadah.textContent = '';
    stok.filter(function (b) { return b.cover; }).forEach(function (b) {
      var a = buatEl('a', { 'class': 'buku', href: 'stok.html?q=' + encodeURIComponent(b.kode) });
      var sampul = buatEl('div', { 'class': 'buku-cover' });
      var img = buatEl('img', { src: b.cover, alt: 'Sampul ' + b.judul, loading: 'lazy' });
      img.addEventListener('error', function () { img.remove(); sampul.textContent = b.kode; });
      sampul.append(img);
      a.append(
        sampul,
        buatEl('strong', null, b.judul),
        buatEl('span', null, b.kode + ' · Stok ' + Number(b.qty).toLocaleString('id-ID'))
      );
      wadah.append(a);
    });
  }

  /* ---------------- Cari Delivery Order ---------------- */
  function renderHasil(no, d) {
    var tahap  = SITTA.status.indeks(d.status);
    var nada   = SITTA.status.nada(d.status);
    var persen = SITTA.status.persen(d.status);
    var p      = SITTA.data.paket(d.paket);

    var stepper = TAHAPAN.map(function (label, i) {
      var kelas = i < tahap ? 'done' : i === tahap ? 'current' : 'todo';
      return '<li class="step ' + kelas + '">' +
               '<span class="step-dot">' + (i < tahap ? '✓' : '') + '</span>' +
               '<span class="step-label">' + fmt.esc(label) + '</span>' +
             '</li>';
    }).join('');

    var riwayat = d.perjalanan.slice().reverse().map(function (r, i) {
      return '<li class="' + (i === 0 ? 'latest' : '') + '">' +
               '<time>' + fmt.esc(fmt.tanggalIndo(r.waktu)) + '</time>' +
               '<span>' + fmt.esc(r.keterangan) + '</span>' +
             '</li>';
    }).join('');

    $('hasilDO').innerHTML =
      '<div class="do-card">' +
        '<div class="do-head">' +
          '<div>' +
            '<p class="do-label">Nama Mahasiswa</p>' +
            '<h3 class="do-nama">' + fmt.esc(d.nama) + '</h3>' +
            '<p class="do-nim">NIM ' + fmt.esc(d.nim) + ' · ' + fmt.esc(no) + '</p>' +
          '</div>' +
          '<span class="badge badge-' + nada + '">' + fmt.esc(d.status) + '</span>' +
        '</div>' +
        '<div class="do-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100"' +
             ' aria-valuenow="' + persen + '" aria-label="Progres pengiriman ' + persen + ' persen">' +
          '<div class="bar"><div class="bar-fill bar-' + nada + '" style="width:0%" data-target="' + persen + '"></div></div>' +
          '<span class="bar-persen">' + persen + '%</span>' +
        '</div>' +
        '<ol class="stepper">' + stepper + '</ol>' +
        '<table class="do-table"><tbody>' +
          '<tr><th>Ekspedisi</th><td>' + fmt.esc(d.ekspedisi) + '</td></tr>' +
          '<tr><th>Tanggal Kirim</th><td>' + fmt.esc(fmt.tanggalIndo(d.tanggalKirim)) + '</td></tr>' +
          '<tr><th>Jenis Paket</th><td>' + fmt.esc(p ? p.kode + ' — ' + p.nama : d.paket) + '</td></tr>' +
          '<tr><th>Total Pembayaran</th><td class="harga">' + fmt.rupiah(d.total) + '</td></tr>' +
        '</tbody></table>' +
        '<h4 class="riwayat-judul">Riwayat perjalanan paket</h4>' +
        '<ul class="riwayat">' + riwayat + '</ul>' +
        '<p class="do-lanjut"><a href="tracking.html?do=' + encodeURIComponent(no) + '">Buka di halaman Tracking Pengiriman</a></p>' +
      '</div>';

    requestAnimationFrame(function () {
      var fill = $('hasilDO').querySelector('.bar-fill');
      if (fill) fill.style.width = fill.dataset.target + '%';
    });
  }

  function renderError(pesan) {
    $('hasilDO').innerHTML = '<div class="do-error" role="alert">' + fmt.esc(pesan) + '</div>';
  }

  function cariDO() {
    var input = $('inputDO');
    var no = input.value.trim().toUpperCase();

    if (!no) {
      renderError('Nomor Delivery Order belum diisi. Masukkan nomor DO lalu tekan Cari.');
      input.focus();
      return;
    }
    if (!/^DO\d{4}-\d{3,}$/.test(no)) {
      renderError('Format nomor DO tidak valid. Contoh yang benar: DO2025-001.');
      input.focus();
      return;
    }

    var tombol = $('btnCari');
    tombol.disabled = true;
    tombol.textContent = 'Mencari…';
    $('hasilDO').innerHTML = '<div class="do-loading">Mencari data pengiriman…</div>';

    // simulasi request ke server (~0,6 detik)
    setTimeout(function () {
      var d = tracking[no];
      if (d) renderHasil(no, d);
      else renderError('Nomor DO ' + no + ' tidak ditemukan. Periksa kembali nomor yang Anda masukkan.');
      tombol.disabled = false;
      tombol.textContent = 'Cari';
    }, 600);
  }

  /* ---------------- Panel: Monitoring ---------------- */
  function renderMonitoring() {
    var q  = ($('monCari').value || '').trim().toLowerCase();
    var st = $('monStatus').value;
    var semua = nomorDO();

    var rows = semua.filter(function (no) {
      var d = tracking[no];
      if (st && SITTA.status.nada(d.status) !== st) return false;
      return !q || no.toLowerCase().indexOf(q) !== -1 || d.nama.toLowerCase().indexOf(q) !== -1;
    });

    $('monBody').innerHTML = rows.length ? rows.map(function (no) {
      var d = tracking[no];
      var nada = SITTA.status.nada(d.status);
      var p = SITTA.status.persen(d.status);
      return '<tr>' +
        '<td>' + fmt.esc(no) + '</td>' +
        '<td>' + fmt.esc(d.nama) + '</td>' +
        '<td>' + fmt.esc(d.ekspedisi) + '</td>' +
        '<td><span class="badge badge-' + nada + '">' + fmt.esc(d.status) + '</span></td>' +
        '<td class="kolom-progres"><div class="progres-mini">' +
          '<div class="bar"><div class="bar-fill bar-' + nada + '" style="width:' + p + '%"></div></div>' +
          '<span>' + p + '%</span></div></td>' +
        '<td><button type="button" class="btn-detail" data-do="' + fmt.esc(no) + '">Detail</button></td>' +
      '</tr>';
    }).join('') : '<tr><td colspan="6" class="kosong">Tidak ada DO yang cocok dengan pencarian.</td></tr>';

    $('monInfo').textContent = rows.length + ' dari ' + semua.length + ' DO ditampilkan.';
  }

  /* ---------------- Panel: Rekap ---------------- */
  function renderRekap() {
    var list = nomorDO().map(function (no) { return tracking[no]; })
      .filter(function (d) { return d.pembayaran !== 'Dibatalkan'; });   // DO batal tidak dihitung

    var totalModul = list.reduce(function (s, d) { return s + jumlahModul(d); }, 0);
    var totalNilai = list.reduce(function (s, d) { return s + d.total; }, 0);
    var diterima = list.filter(function (d) { return SITTA.status.nada(d.status) === 'selesai'; }).length;

    function stat(label, nilai) {
      return '<div class="stat"><span class="stat-nilai">' + nilai + '</span><span class="stat-label">' + label + '</span></div>';
    }
    $('rekapStats').innerHTML =
      stat('Total DO aktif', list.length) +
      stat('Total modul', totalModul) +
      stat('DO sudah diterima', diterima + ' dari ' + list.length) +
      stat('Total nilai', fmt.rupiah(totalNilai));

    var eks = {};
    list.forEach(function (d) {
      eks[d.ekspedisi] = eks[d.ekspedisi] || { jml: 0, modul: 0, nilai: 0 };
      eks[d.ekspedisi].jml++;
      eks[d.ekspedisi].modul += jumlahModul(d);
      eks[d.ekspedisi].nilai += d.total;
    });
    $('rekapEkspedisi').innerHTML = Object.keys(eks).sort().map(function (n) {
      return '<tr><td>' + fmt.esc(n) + '</td><td>' + eks[n].jml + '</td><td>' + eks[n].modul +
             '</td><td>' + fmt.rupiah(eks[n].nilai) + '</td></tr>';
    }).join('');

    var pkt = {};
    list.forEach(function (d) {
      var nama = namaPaket(d.paket);
      pkt[nama] = pkt[nama] || { jml: 0, nilai: 0 };
      pkt[nama].jml++;
      pkt[nama].nilai += d.total;
    });
    $('rekapPaket').innerHTML = Object.keys(pkt).sort().map(function (n) {
      return '<tr><td>' + fmt.esc(n) + '</td><td>' + pkt[n].jml + '</td><td>' + fmt.rupiah(pkt[n].nilai) + '</td></tr>';
    }).join('');

    $('rekapStatus').innerHTML = TAHAPAN.map(function (nama) {
      var n = list.filter(function (d) { return d.status === nama; }).length;
      return '<tr><td>' + fmt.esc(nama) + '</td><td>' + n + '</td></tr>';
    }).join('');
  }

  /* ---------------- Panel: Histori ---------------- */
  function filterHistori() {
    var q  = ($('histCari').value || '').trim().toLowerCase();
    var st = $('histStatus').value;
    return daftarHistori().filter(function (t) {
      if (st && t.status !== st) return false;
      return !q || [t.id, t.noDO, t.nama, t.ket].join(' ').toLowerCase().indexOf(q) !== -1;
    }).sort(function (a, b) { return b.tgl.localeCompare(a.tgl) || b.id.localeCompare(a.id); });
  }

  function renderHistori() {
    var rows = filterHistori();
    var kelas = { 'Lunas': 'selesai', 'Menunggu Pembayaran': 'proses', 'Dibatalkan': 'batal' };

    $('histBody').innerHTML = rows.length ? rows.map(function (t) {
      return '<tr>' +
        '<td>' + fmt.esc(t.id) + '</td>' +
        '<td>' + fmt.esc(fmt.tanggalIndo(t.tgl)) + '</td>' +
        '<td>' + fmt.esc(t.noDO) + '</td>' +
        '<td>' + fmt.esc(t.nama) + '</td>' +
        '<td>' + fmt.esc(t.ket) + '</td>' +
        '<td class="angka">' + fmt.rupiah(t.total) + '</td>' +
        '<td><span class="badge badge-' + kelas[t.status] + '">' + fmt.esc(t.status) + '</span></td>' +
      '</tr>';
    }).join('') : '<tr><td colspan="7" class="kosong">Tidak ada transaksi yang cocok.</td></tr>';

    var lunas = rows.filter(function (t) { return t.status === 'Lunas'; })
                    .reduce(function (s, t) { return s + t.total; }, 0);
    $('histInfo').textContent = rows.length + ' transaksi ditampilkan. Total pembayaran lunas: ' + fmt.rupiah(lunas) + '.';
  }

  function unduhHistori() {
    function q(v) { return '"' + String(v).replace(/"/g, '""') + '"'; }
    var baris = [['ID Transaksi', 'Tanggal', 'No. DO', 'Mahasiswa', 'Keterangan', 'Total', 'Status']]
      .concat(filterHistori().map(function (t) {
        return [t.id, t.tgl, t.noDO, t.nama, t.ket, t.total, t.status];
      }));
    var csv = '\uFEFF' + baris.map(function (r) { return r.map(q).join(','); }).join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'histori-transaksi.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  }

  /* ---------------- Pengatur panel ---------------- */
  var PANEL = { monitoring: renderMonitoring, rekap: renderRekap, histori: renderHistori };

  function showPanel(nama) {
    if (!PANEL[nama]) return;
    Object.keys(PANEL).forEach(function (k) { $('panel-' + k).hidden = (k !== nama); });
    PANEL[nama]();
    try { history.replaceState(null, '', '#' + nama); } catch (e) { /* abaikan */ }
    $('panel-' + nama).scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function tutupPanel() {
    Object.keys(PANEL).forEach(function (k) { $('panel-' + k).hidden = true; });
    try { history.replaceState(null, '', location.pathname); } catch (e) { /* abaikan */ }
  }

  function initPanels() {
    document.addEventListener('click', function (e) {
      var pemicu = e.target.closest('[data-panel]');
      if (pemicu) {
        e.preventDefault();
        showPanel(pemicu.dataset.panel);
        setDropdown(false);
        $('menu').classList.remove('open');
        return;
      }
      if (e.target.closest('[data-close-panel]')) { tutupPanel(); return; }

      var detail = e.target.closest('[data-do]');
      if (detail) {
        $('inputDO').value = detail.dataset.do;
        cariDO();
        $('judulDO').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    $('monCari').addEventListener('input', renderMonitoring);
    $('monStatus').addEventListener('change', renderMonitoring);
    $('histCari').addEventListener('input', renderHistori);
    $('histStatus').addEventListener('change', renderHistori);
    $('btnUnduhHistori').addEventListener('click', unduhHistori);

    var awal = location.hash.slice(1);        // #monitoring / #rekap / #histori
    if (PANEL[awal]) showPanel(awal);
    window.addEventListener('hashchange', function () {
      var h = location.hash.slice(1);
      if (PANEL[h]) showPanel(h);
    });
  }

  /* ---------------- Mulai ---------------- */
  initHeader();
  renderKatalog();
  updateWaktu();
  setInterval(updateWaktu, 1000);

  $('btnCari').addEventListener('click', cariDO);
  $('inputDO').addEventListener('keydown', function (e) { if (e.key === 'Enter') cariDO(); });

  $('btnSetelUlang').addEventListener('click', function () {
    if (window.confirm('Kembalikan stok dan Delivery Order ke data contoh? Perubahan yang Anda buat akan hilang.')) {
      SITTA.store.setelUlang();
      window.location.reload();
    }
  });

  initPanels();
})();
