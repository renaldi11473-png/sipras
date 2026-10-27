import { getSession } from "@/lib/auth";
import { getInventarisList, getLembaga } from "@/lib/data";

export const dynamic = "force-dynamic";

const HTML_PAGE = `<!DOCTYPE html>
<html>
<head>
<base target="_top">
<style>
  body{font-family:Arial,Helvetica,sans-serif;background:#f6f2e8;color:#12302a;margin:0;padding:24px}
  .card{max-width:980px;margin:0 auto;background:#fff;border:1px solid #d8ebe2;border-radius:14px;padding:24px}
  h1{font-size:22px;margin:0 0 4px} h2{font-size:16px;margin:20px 0 10px}
  .muted{color:#5b7a70;font-size:12px}
  label{display:block;font-size:11px;font-weight:bold;text-transform:uppercase;margin:10px 0 4px;color:#226755}
  input,select,textarea{width:100%;padding:8px 10px;border:1px solid #cfe0d8;border-radius:8px;font-size:13px;box-sizing:border-box}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  button{background:#1c5345;color:#fff;border:0;border-radius:8px;padding:10px 16px;font-weight:bold;cursor:pointer;margin-top:14px}
  button.gold{background:#d99f3d;color:#12302a}
  table{width:100%;border-collapse:collapse;margin-top:12px;font-size:12px}
  th,td{border:1px solid #cfe0d8;padding:6px 8px;text-align:left}
  th{background:#eef6f2;color:#12302a}
  .right{text-align:right}
  .login{max-width:360px;margin:8vh auto}
  .hide{display:none}
  .danger{background:#fdeaea;color:#a12a2a;border:1px solid #f5c2c2;border-radius:8px;padding:10px;font-size:12px;margin-top:10px}
</style>
</head>
<body>
<div id="loginView" class="card login">
  <h1>SIPRAS · SMPS IT Mutiara</h1>
  <p class="muted">Masuk untuk mengelola inventaris</p>
  <div id="loginError"></div>
  <label>Username</label><input id="username" value="admin">
  <label>Password</label><input id="password" type="password" value="admin">
  <button onclick="doLogin()">Masuk</button>
</div>

<div id="appView" class="hide">
  <div class="card">
    <h1>SIPRAS · SMPS IT Mutiara</h1>
    <p class="muted">Sistem Informasi Sarana &amp; Prasarana</p>
    <p class="muted">Input data inventaris lalu cetak laporan register aset lembaga.</p>
    <div class="grid">
      <div><label>Nama Barang</label><input id="namaBarang"></div>
      <div><label>Kategori</label><select id="kategori"><option>Buku &amp; Literasi</option><option>Meja</option><option>Kursi</option><option>Lemari &amp; Rak</option><option>Elektronik</option><option>Alat Peraga</option><option>Alat Musik</option><option>Perlengkapan</option><option>Lainnya</option></select></div>
      <div><label>Jumlah</label><input id="jumlah" type="number" value="1"></div>
      <div><label>Satuan</label><select id="satuan"><option>bh</option><option>Unit</option><option>Set</option><option>Paket</option><option>Rim</option></select></div>
      <div><label>Tahun Anggaran</label><input id="tahunAnggaran" type="number" value="${new Date().getFullYear()}"></div>
      <div><label>Sumber Perolehan</label><select id="sumberPerolehan"><option>BOS</option><option>BOP</option><option>Bantuan operasional</option><option>Yayasan</option><option>Hibah</option><option>Kantor</option></select></div>
      <div><label>Nilai Total (Rp)</label><input id="nilai" type="number" value="0"></div>
      <div><label>Lokasi / Ruang</label><input id="lokasi" value="Ruang Kelas 1"></div>
      <div><label>Kondisi</label><select id="kondisi"><option value="B">B - Baik</option><option value="RR">RR - Rusak Ringan</option><option value="RB">RB - Rusak Berat</option><option value="TA">TA - Tidak Ada</option></select></div>
      <div><label>Keterangan</label><input id="keterangan"></div>
    </div>
    <button onclick="simpan()">Simpan Inventaris</button>
    <button class="gold" onclick="cetak()">Cetak Laporan</button>
    <button class="gold" onclick="google.script.run.withSuccessHandler(function(){}).logout()">Keluar</button>
    <h2>Data Inventaris</h2>
    <table><thead><tr><th>No</th><th>Kode Barang</th><th>Nama Barang</th><th>Jml</th><th>Satuan</th><th>Tahun</th><th>Sumber</th><th class="right">Nilai</th><th>Lokasi</th><th>Kondisi</th><th>Aksi</th></tr></thead><tbody id="rows"></tbody></table>
  </div>
</div>
<script>
var SESSION = false;
function doLogin(){
  var u = document.getElementById('username').value;
  var p = document.getElementById('password').value;
  if (u === 'admin' && p === 'admin') { SESSION = true; document.getElementById('loginView').className='hide'; document.getElementById('appView').className=''; muat(); }
  else { document.getElementById('loginError').innerHTML = '<div class="danger">Username atau password salah.</div>'; }
}
function muat(){
  google.script.run.withSuccessHandler(function(rows){
    var html = '';
    for (var i=0;i<rows.length;i++){
      var r = rows[i];
      html += '<tr><td>'+(i+1)+'</td><td>'+r.kodeBarang+'</td><td>'+r.namaBarang+'</td><td>'+r.jumlah+'</td><td>'+r.satuan+'</td><td>'+r.tahunAnggaran+'</td><td>'+r.sumberPerolehan+'</td><td class="right">'+Number(r.nilai).toLocaleString('id-ID')+'</td><td>'+r.lokasi+'</td><td>'+r.kondisi+'</td><td><a href="#" onclick="hapus('+r.row+');return false;">Hapus</a></td></tr>';
    }
    document.getElementById('rows').innerHTML = html;
  }).getData();
}
function simpan(){
  var payload = {
    namaBarang: document.getElementById('namaBarang').value,
    kategori: document.getElementById('kategori').value,
    jumlah: document.getElementById('jumlah').value,
    satuan: document.getElementById('satuan').value,
    tahunAnggaran: document.getElementById('tahunAnggaran').value,
    sumberPerolehan: document.getElementById('sumberPerolehan').value,
    nilai: document.getElementById('nilai').value,
    lokasi: document.getElementById('lokasi').value,
    kondisi: document.getElementById('kondisi').value,
    keterangan: document.getElementById('keterangan').value
  };
  if (!payload.namaBarang) { alert('Nama barang wajib diisi'); return; }
  google.script.run.withSuccessHandler(function(){ document.getElementById('namaBarang').value=''; document.getElementById('nilai').value='0'; muat(); }).simpanBarang(payload);
}
function hapus(row){
  if (!confirm('Hapus data ini?')) return;
  google.script.run.withSuccessHandler(muat).hapusBarang(row);
}
function cetak(){ google.script.run.buatLaporan(); }
</script>
</body>
</html>`;

function buildScript(initialJson: string, namaLembaga: string, kodeLembaga: string) {
  return `/**
 * SIPRAS SMPS IT Mutiara - Sarana & Prasarana
 * Jembatan (bridge) Google Sheets <-> aplikasi SIPRAS.
 * Aplikasi Google Apps Script: input inventaris, laporan, dan login admin/admin.
 *
 * CARA PASANG:
 * 1. Buat Google Spreadsheet baru, lalu buka menu Extensions > Apps Script.
 * 2. Ganti seluruh isi Code.gs dengan berkas ini.
 * 3. Buat file HTML baru bernama "Index" dan tempel isi INDEX_HTML di bawah.
 * 4. Jalankan fungsi setup() satu kali (izinkan akses), lalu Deploy > New deployment > Web app.
 *
 * Login aplikasi: username "admin", password "admin".
 */

var LEMBAGA = ${JSON.stringify({ nama: namaLembaga, kode: kodeLembaga })};
var APP_NAME = 'SIPRAS SMPS IT Mutiara';
var SHEET_NAME = 'Inventaris';
var HEADERS = ['Kode Barang','Nama Barang','Kategori','Jumlah','Satuan','Tahun Anggaran','Sumber Perolehan','Nilai','Lokasi','Kondisi','Keterangan'];
var INITIAL_DATA = ${initialJson};

function jsonOutput(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Web App endpoint.
 * - GET  ?action=list           -> JSON { ok:true, values:[...] }  (dipakai SIPRAS untuk tarik data)
 * - GET  (tanpa action)         -> tampilan aplikasi HTML
 */
function doGet(e) {
  var action = e && e.parameter ? e.parameter.action : '';
  if (action === 'list') {
    return jsonOutput({ ok: true, values: getMatrix() });
  }
  return HtmlService.createHtmlOutput(INDEX_HTML)
    .setTitle('SIPRAS SMPS IT Mutiara - Sarana & Prasarana')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Dipakai SIPRAS untuk MENGIRIM data ke spreadsheet.
 * Body JSON: { action:'replace', sheetName:'Inventaris', values:[[...],[...]] }
 */
function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (body.action !== 'replace' || !body.values) {
      return jsonOutput({ ok: false, message: 'Aksi tidak dikenali. Gunakan action replace.' });
    }
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var name = body.sheetName || SHEET_NAME;
    var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
    sheet.clear();
    var values = body.values;
    var width = 1;
    for (var i = 0; i < values.length; i++) {
      if (values[i].length > width) width = values[i].length;
    }
    var normalized = values.map(function (row) {
      var result = row.slice();
      while (result.length < width) result.push('');
      return result;
    });
    if (normalized.length > 0) {
      sheet.getRange(1, 1, normalized.length, width).setValues(normalized);
    }
    sheet.getRange(1, 1, 1, width).setFontWeight('bold').setBackground('#1c5345').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    return jsonOutput({ ok: true, message: 'Berhasil menulis ' + Math.max(0, normalized.length - 1) + ' baris ke sheet ' + name });
  } catch (err) {
    return jsonOutput({ ok: false, message: String(err) });
  }
}

function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  sheet.clear();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold').setBackground('#1c5345').setFontColor('#ffffff');
  if (INITIAL_DATA.length > 0) {
    sheet.getRange(2, 1, INITIAL_DATA.length, HEADERS.length).setValues(INITIAL_DATA);
  }
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, HEADERS.length);
  return 'Setup selesai. Data awal: ' + INITIAL_DATA.length + ' baris.';
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) { setup(); sheet = ss.getSheetByName(SHEET_NAME); }
  return sheet;
}

function getMatrix() {
  var sheet = getSheet();
  var range = sheet.getDataRange();
  return range.getValues();
}

function getData() {
  var sheet = getSheet();
  var last = sheet.getLastRow();
  if (last < 2) return [];
  var values = sheet.getRange(2, 1, last - 1, HEADERS.length).getValues();
  return values.map(function (row, index) {
    return {
      row: index + 2,
      kodeBarang: row[0], namaBarang: row[1], kategori: row[2],
      jumlah: row[3], satuan: row[4], tahunAnggaran: row[5],
      sumberPerolehan: row[6], nilai: row[7], lokasi: row[8],
      kondisi: row[9], keterangan: row[10]
    };
  });
}

function nextKode(tahun, kategori, lokasi) {
  var sheet = getSheet();
  var data = getData();
  var nomor = data.filter(function (item) { return String(item.tahunAnggaran) === String(tahun); }).length + 1;
  var kodeKategori = { 'Buku & Literasi':'BKU','Meja':'MJA','Kursi':'KRS','Lemari & Rak':'LMR','Elektronik':'ELK','Alat Peraga':'APR','Alat Musik':'AMS','Perlengkapan':'PLK' }[kategori] || 'LLN';
  var ruang = String(lokasi || 'ALL').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) || 'ALL';
  var urut = ('000' + nomor).slice(-4);
  return LEMBAGA.kode + '/' + kodeKategori + '/' + ruang + '/' + urut + '/' + tahun;
}

function simpanBarang(data) {
  var sheet = getSheet();
  var kode = nextKode(data.tahunAnggaran, data.kategori, data.lokasi);
  sheet.appendRow([
    kode, data.namaBarang, data.kategori, Number(data.jumlah) || 1, data.satuan,
    Number(data.tahunAnggaran), data.sumberPerolehan, Number(data.nilai) || 0,
    data.lokasi, data.kondisi, data.keterangan
  ]);
  return getData();
}

function hapusBarang(row) {
  var sheet = getSheet();
  sheet.deleteRow(row);
  return getData();
}

function buatLaporan() {
  var data = getData();
  if (data.length === 0) { SpreadsheetApp.getUi().alert('Belum ada data inventaris.'); return; }
  var doc = DocumentApp.create('Daftar Inventaris Barang - ' + LEMBAGA.nama);
  var body = doc.getBody();
  body.appendParagraph('DAFTAR INVENTARIS BARANG').setAlignment(DocumentApp.HorizontalAlignment.CENTER).setBold(true);
  body.appendParagraph('(REGISTER ASET TINGKAT LEMBAGA)').setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  body.appendParagraph('Nama Lembaga: ' + LEMBAGA.nama);
  body.appendParagraph('Kode Lembaga: ' + LEMBAGA.kode + ' | Keadaan per: ' + Utilities.formatDate(new Date(), 'Asia/Jakarta', 'dd MMMM yyyy'));
  body.appendParagraph(' ');
  var rows = [['No','Kode Barang','Nama Barang','Jml','Satuan','Tahun','Sumber','Nilai (Rp)','Lokasi/Ruang','Kondisi','Ket.']];
  var totalNilai = 0;
  for (var i = 0; i < data.length; i++) {
    var item = data[i];
    totalNilai += Number(item.nilai) || 0;
    rows.push([String(i + 1), item.kodeBarang, item.namaBarang, String(item.jumlah), item.satuan, String(item.tahunAnggaran), item.sumberPerolehan, Number(item.nilai).toLocaleString('id-ID'), item.lokasi, item.kondisi, item.keterangan]);
  }
  rows.push(['','','JUMLAH','','','','', totalNilai.toLocaleString('id-ID'),'','','']);
  body.appendTable(rows);
  body.appendParagraph(' ');
  body.appendParagraph('Sumber Perolehan: BOS = dana bantuan operasional sekolah; BOP = dana bantuan operasional pendidikan; Yayasan = pendapatan yayasan; Hibah = sumbangan pihak lain.');
  body.appendParagraph('Kondisi: B = Baik; RR = Rusak Ringan; RB = Rusak Berat; TA = Tidak Ada.');
  body.appendParagraph(' ');
  body.appendParagraph('Mengetahui, Kepala ' + LEMBAGA.nama + '                        Pengurus Barang / Penyusun,');
  body.appendParagraph(' ');
  body.appendParagraph('(……………………………………)                                    (……………………………………)');
  doc.saveAndClose();
  var file = DriveApp.getFileById(doc.getId());
  SpreadsheetApp.getUi().alert('Laporan dibuat: ' + file.getUrl());
}

var INDEX_HTML = ${JSON.stringify(HTML_PAGE)};
`;
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  const [lembaga, data] = await Promise.all([getLembaga(), getInventarisList()]);

  const initial = data.map((item) => [
    item.kodeBarang,
    item.namaBarang,
    item.kategori,
    item.jumlah,
    item.satuan,
    item.tahunAnggaran,
    item.sumberPerolehan,
    item.nilai,
    item.lokasi,
    item.kondisi,
    item.keterangan,
  ]);

  const script = buildScript(
    JSON.stringify(initial, null, 2),
    lembaga.nama,
    lembaga.kodeLembaga,
  );

  return new Response(script, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": 'attachment; filename="Code.gs"',
      "Cache-Control": "no-store",
    },
  });
}
