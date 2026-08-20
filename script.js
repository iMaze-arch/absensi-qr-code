
function showToast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2400);
}
function todayStr(){ return new Date().toISOString().slice(0,10); }
document.getElementById('sesiTanggal').value = todayStr();
document.getElementById('rekapTanggal').value = todayStr();

/* live clock */
function tickClock(){
  document.getElementById('liveClock').textContent = new Date().toLocaleTimeString('id-ID');
}
tickClock(); setInterval(tickClock,1000);
setInterval(()=>{ renderSesiAktifList(); renderJadwalMhs(); }, 15000);

/* tabs */
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

/* ============ LOGIN / SESI PENGGUNA ============ */
// Kredensial admin demo (client-side only — untuk pemakaian produksi, ganti dengan autentikasi server sungguhan).
const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' };
let currentUser = null; // {role:'admin'} atau {role:'mahasiswa', nim, nama}

const loginScreen = document.getElementById('loginScreen');
const appWrap = document.getElementById('appWrap');

const LOGIN_PANEL_MAP = { admin:'loginPanelAdmin', mahasiswa:'loginPanelMhs', daftar:'loginPanelDaftar' };
function switchLoginTab(role){
  document.querySelectorAll('.login-tab-btn').forEach(b=>b.classList.toggle('active', b.dataset.role===role));
  document.querySelectorAll('.login-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById(LOGIN_PANEL_MAP[role]).classList.add('active');
}
document.querySelectorAll('.login-tab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=> switchLoginTab(btn.dataset.role));
});
document.getElementById('linkKeDaftar').addEventListener('click', (e)=>{ e.preventDefault(); switchLoginTab('daftar'); });

document.getElementById('btnLoginAdmin').addEventListener('click', ()=>{
  const user = document.getElementById('loginAdminUser').value.trim();
  const pass = document.getElementById('loginAdminPass').value;
  const err = document.getElementById('loginAdminError');
  if(user===ADMIN_CREDENTIALS.username && pass===ADMIN_CREDENTIALS.password){
    err.classList.remove('show');
    currentUser = { role:'admin' };
    afterLogin();
  } else {
    err.classList.add('show');
  }
});

document.getElementById('btnLoginMhs').addEventListener('click', ()=>{
  const nim = document.getElementById('loginMhsNim').value.trim();
  const nama = document.getElementById('loginMhsNama').value.trim();
  const err = document.getElementById('loginMhsError');
  const m = mahasiswa.find(x=>x.nim.toLowerCase()===nim.toLowerCase() && x.nama.toLowerCase()===nama.toLowerCase());
  if(nim && nama && m){
    err.classList.remove('show');
    currentUser = { role:'mahasiswa', nim:m.nim, nama:m.nama };
    afterLogin();
  } else {
    err.classList.add('show');
  }
});

document.getElementById('btnDaftarMhs').addEventListener('click', ()=>{
  const nim = document.getElementById('daftarNim').value.trim();
  const nama = document.getElementById('daftarNama').value.trim();
  const prodi = document.getElementById('daftarProdi').value.trim();
  const pts = document.getElementById('daftarPts').value.trim();
  const err = document.getElementById('loginDaftarError');

  if(!nim || !nama || !prodi || !pts){
    err.textContent = 'Semua kolom wajib diisi.';
    err.classList.add('show');
    return;
  }
  if(mahasiswa.some(m=>m.nim.toLowerCase()===nim.toLowerCase())){
    err.textContent = 'NIM sudah terdaftar. Gunakan menu Mahasiswa untuk login.';
    err.classList.add('show');
    return;
  }
  err.classList.remove('show');

  mahasiswa.push({ id: nextMhsId++, nim, nama, prodi, pts });
  renderMhs();

  currentUser = { role:'mahasiswa', nim, nama };
  document.getElementById('daftarNim').value='';
  document.getElementById('daftarNama').value='';
  document.getElementById('daftarProdi').value='';
  document.getElementById('daftarPts').value='';
  afterLogin();
});

// izinkan tekan Enter untuk login
document.getElementById('loginAdminPass').addEventListener('keydown', e=>{ if(e.key==='Enter') document.getElementById('btnLoginAdmin').click(); });
document.getElementById('loginMhsNama').addEventListener('keydown', e=>{ if(e.key==='Enter') document.getElementById('btnLoginMhs').click(); });
document.getElementById('daftarPts').addEventListener('keydown', e=>{ if(e.key==='Enter') document.getElementById('btnDaftarMhs').click(); });

function afterLogin(){
  loginScreen.style.display='none';
  appWrap.style.display='block';
  applyRoleUI();

  const roleTag = document.getElementById('userRoleTag');
  const whoText = document.getElementById('userWhoText');
  if(currentUser.role==='admin'){
    roleTag.textContent='ADMIN'; roleTag.className='role-tag admin';
    whoText.textContent='Administrator';
    activateTab('tabMhs');
  } else {
    roleTag.textContent='MAHASISWA'; roleTag.className='role-tag mhs';
    whoText.textContent = currentUser.nim + ' — ' + currentUser.nama;
    activateTab('tabQr');
    renderRiwayat();
    renderJadwalMhs();
  }
  showToast('Berhasil masuk sebagai ' + (currentUser.role==='admin' ? 'Administrator' : currentUser.nama) + '.');
}

function activateTab(tabId){
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.toggle('active', b.dataset.tab===tabId));
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.toggle('active', p.id===tabId));
}

function applyRoleUI(){
  if(!currentUser) return;
  document.querySelectorAll('[data-role-only]').forEach(el=>{
    el.classList.toggle('role-hide', el.dataset.roleOnly !== currentUser.role);
  });
}

document.getElementById('btnLogout').addEventListener('click', ()=>{
  currentUser = null;
  stopScan();
  document.getElementById('absenForm').style.display='none';
  document.getElementById('manualToken').value='';
  document.getElementById('loginAdminUser').value='';
  document.getElementById('loginAdminPass').value='';
  document.getElementById('loginMhsNim').value='';
  document.getElementById('loginMhsNama').value='';
  document.getElementById('daftarNim').value='';
  document.getElementById('daftarNama').value='';
  document.getElementById('daftarProdi').value='';
  document.getElementById('daftarPts').value='';
  document.getElementById('loginAdminError').classList.remove('show');
  document.getElementById('loginMhsError').classList.remove('show');
  document.getElementById('loginDaftarError').classList.remove('show');
  switchLoginTab('admin');
  appWrap.style.display='none';
  loginScreen.style.display='flex';
  showToast('Anda telah keluar.');
});

/* ============ DATA MAHASISWA (master) ============ */
let mahasiswa = [];
let nextMhsId = 1;
let editingMhsId = null;

const mhsForm = document.getElementById('mhsForm');
const mhsTableBody = document.getElementById('mhsTableBody');
const mhsEmptyState = document.getElementById('mhsEmptyState');
const mhsCount = document.getElementById('mhsCount');
const mhsSubmitBtn = document.getElementById('mhsSubmitBtn');
const mhsFormTitle = document.getElementById('mhsFormTitle');
const mhsCancelEditBtn = document.getElementById('mhsCancelEdit');

function renderMhs(){
  mhsTableBody.innerHTML='';
  if(mahasiswa.length===0){
    mhsEmptyState.style.display='block';
  } else {
    mhsEmptyState.style.display='none';
    mahasiswa.forEach((m,i)=>{
      const tr=document.createElement('tr');
      if(m.id===editingMhsId) tr.classList.add('editing-row');
      tr.innerHTML=`<td>${i+1}</td><td>${m.nim}</td><td>${m.nama}</td><td>${m.prodi||'-'}</td><td>${m.pts||'-'}</td>
        <td><div class="row-actions">
          <button class="edit-btn" data-id="${m.id}">Edit</button>
          <button class="del-btn" data-id="${m.id}">Hapus</button>
        </div></td>`;
      mhsTableBody.appendChild(tr);
    });
  }
  mhsCount.textContent = mahasiswa.length;
  refreshNimDropdowns();
  refreshProdiFilter();
}

mhsForm.addEventListener('submit', function(e){
  e.preventDefault();
  const nim = document.getElementById('mhsNim').value.trim();
  const nama = document.getElementById('mhsNama').value.trim();
  const prodi = document.getElementById('mhsProdi').value.trim();
  const pts = document.getElementById('mhsPts').value.trim();
  if(!nim || !nama){ showToast('NIM dan Nama wajib diisi.'); return; }

  if(editingMhsId!==null){
    const idx = mahasiswa.findIndex(m=>m.id===editingMhsId);
    if(idx!==-1) mahasiswa[idx] = {...mahasiswa[idx], nim, nama, prodi, pts};
    showToast('Data mahasiswa diperbarui.');
    cancelEditMhs();
  } else {
    if(mahasiswa.some(m=>m.nim===nim)){ showToast('NIM sudah terdaftar.'); return; }
    mahasiswa.push({id:nextMhsId++, nim, nama, prodi, pts});
    showToast('Mahasiswa ditambahkan.');
    mhsForm.reset();
  }
  renderMhs();
});

function enterEditMhs(m){
  editingMhsId = m.id;
  document.getElementById('mhsNim').value = m.nim;
  document.getElementById('mhsNama').value = m.nama;
  document.getElementById('mhsProdi').value = m.prodi;
  document.getElementById('mhsPts').value = m.pts;
  mhsSubmitBtn.textContent = '✓ Update Mahasiswa';
  mhsFormTitle.textContent = '✎ Edit Mahasiswa';
  mhsCancelEditBtn.style.display='inline-block';
  renderMhs();
}
function cancelEditMhs(){
  editingMhsId=null;
  mhsForm.reset();
  mhsSubmitBtn.textContent='+ Simpan Mahasiswa';
  mhsFormTitle.textContent='✦ Tambah Mahasiswa';
  mhsCancelEditBtn.style.display='none';
  renderMhs();
}
mhsCancelEditBtn.addEventListener('click', cancelEditMhs);

mhsTableBody.addEventListener('click', function(e){
  const id = Number(e.target.dataset.id);
  if(e.target.classList.contains('edit-btn')){
    const m = mahasiswa.find(x=>x.id===id); if(m) enterEditMhs(m);
  }
  if(e.target.classList.contains('del-btn')){
    mahasiswa = mahasiswa.filter(x=>x.id!==id);
    if(editingMhsId===id) cancelEditMhs();
    renderMhs();
    showToast('Data mahasiswa dihapus.');
  }
});

function refreshNimDropdowns(){
  const opts = '<option value="">-- pilih NIM --</option>' + mahasiswa.map(m=>`<option value="${m.nim}">${m.nim} — ${m.nama}</option>`).join('');
  document.getElementById('absenNimSelect').innerHTML = opts;
  document.getElementById('rekapNim').innerHTML = opts;
}
function refreshProdiFilter(){
  const prodiList = [...new Set(mahasiswa.map(m=>m.prodi).filter(Boolean))];
  document.getElementById('filterProdi').innerHTML = '<option value="">Semua</option>' + prodiList.map(p=>`<option value="${p}">${p}</option>`).join('');
}

/* ============ MATA KULIAH (dikelola admin) ============ */
let matkulList = [];
let nextMatkulId = 1;
let editingMatkulId = null;

const matkulForm = document.getElementById('matkulForm');
const matkulTableBody = document.getElementById('matkulTableBody');
const matkulEmptyState = document.getElementById('matkulEmptyState');
const matkulSubmitBtn = document.getElementById('matkulSubmitBtn');
const matkulFormTitle = document.getElementById('matkulFormTitle');
const matkulCancelEditBtn = document.getElementById('matkulCancelEdit');

function renderMatkul(){
  matkulTableBody.innerHTML='';
  if(matkulList.length===0){
    matkulEmptyState.style.display='block';
  } else {
    matkulEmptyState.style.display='none';
    matkulList.forEach(mk=>{
      const tr=document.createElement('tr');
      if(mk.id===editingMatkulId) tr.classList.add('editing-row');
      tr.innerHTML=`<td>${mk.nama}</td><td>${mk.jamMulai}–${mk.jamSelesai}</td>
        <td><div class="row-actions">
          <button class="edit-btn" data-id="${mk.id}">Edit</button>
          <button class="del-btn" data-id="${mk.id}">Hapus</button>
        </div></td>`;
      matkulTableBody.appendChild(tr);
    });
  }
  refreshMatkulDropdowns();
}

matkulForm.addEventListener('submit', function(e){
  e.preventDefault();
  const nama = document.getElementById('matkulNama').value.trim();
  const jamMulai = document.getElementById('matkulJamMulai').value;
  const jamSelesai = document.getElementById('matkulJamSelesai').value;
  if(!nama || !jamMulai || !jamSelesai){ showToast('Lengkapi nama dan jam mata kuliah.'); return; }
  if(jamSelesai <= jamMulai){ showToast('Jam selesai harus setelah jam mulai.'); return; }

  if(editingMatkulId!==null){
    const idx = matkulList.findIndex(m=>m.id===editingMatkulId);
    if(idx!==-1) matkulList[idx] = {...matkulList[idx], nama, jamMulai, jamSelesai};
    showToast('Mata kuliah diperbarui.');
    cancelEditMatkul();
  } else {
    matkulList.push({id:nextMatkulId++, nama, jamMulai, jamSelesai});
    showToast('Mata kuliah ditambahkan.');
    matkulForm.reset();
  }
  renderMatkul();
});

function enterEditMatkul(mk){
  editingMatkulId = mk.id;
  document.getElementById('matkulNama').value = mk.nama;
  document.getElementById('matkulJamMulai').value = mk.jamMulai;
  document.getElementById('matkulJamSelesai').value = mk.jamSelesai;
  matkulSubmitBtn.textContent = '✓ Update Mata Kuliah';
  matkulFormTitle.textContent = '✎ Edit Mata Kuliah';
  matkulCancelEditBtn.style.display='inline-block';
  renderMatkul();
}
function cancelEditMatkul(){
  editingMatkulId=null;
  matkulForm.reset();
  matkulSubmitBtn.textContent='+ Simpan Mata Kuliah';
  matkulFormTitle.textContent='✦ Kelola Mata Kuliah & Jadwal';
  matkulCancelEditBtn.style.display='none';
  renderMatkul();
}
matkulCancelEditBtn.addEventListener('click', cancelEditMatkul);

matkulTableBody.addEventListener('click', function(e){
  const id = Number(e.target.dataset.id);
  if(e.target.classList.contains('edit-btn')){
    const mk = matkulList.find(x=>x.id===id); if(mk) enterEditMatkul(mk);
  }
  if(e.target.classList.contains('del-btn')){
    matkulList = matkulList.filter(x=>x.id!==id);
    if(editingMatkulId===id) cancelEditMatkul();
    renderMatkul();
    showToast('Mata kuliah dihapus.');
  }
});

function refreshMatkulDropdowns(){
  const opts = '<option value="">-- pilih mata kuliah --</option>' + matkulList.map(mk=>`<option value="${mk.id}">${mk.nama} (${mk.jamMulai}–${mk.jamSelesai})</option>`).join('');
  document.getElementById('sesiPilihMatkul').innerHTML = opts;
  document.getElementById('rekapMatkulSelect').innerHTML = opts;
}

/* ============ SESI ABSEN AKTIF (dibuat admin per mata kuliah) ============ */
let activeSessions = []; // {id, tanggal, matkulId, matkulNama, jamMulai, jamSelesai, token}
let nextSesiId = 1;
let selectedSession = null; // sesi yang sedang diverifikasi untuk konfirmasi kehadiran

function getSesiStatus(sesi){
  if(sesi.tanggal !== todayStr()) return sesi.tanggal < todayStr() ? 'selesai' : 'akan';
  const now = new Date();
  const [hM,mM] = sesi.jamMulai.split(':').map(Number);
  const [hS,mS] = sesi.jamSelesai.split(':').map(Number);
  const mulai = new Date(now); mulai.setHours(hM,mM,0,0);
  const selesai = new Date(now); selesai.setHours(hS,mS,0,0);
  if(now < mulai) return 'akan';
  if(now > selesai) return 'selesai';
  return 'berlangsung';
}
function sesiStatusLabel(st){
  return st==='akan' ? 'Akan Berlangsung' : st==='berlangsung' ? 'Sedang Berlangsung' : 'Selesai';
}

document.getElementById('btnBuatQr').addEventListener('click', function(){
  const tanggal = document.getElementById('sesiTanggal').value || todayStr();
  const matkulId = Number(document.getElementById('sesiPilihMatkul').value);
  const mk = matkulList.find(m=>m.id===matkulId);
  if(!mk){ showToast('Pilih mata kuliah terlebih dahulu.'); return; }
  const rand = Math.random().toString(36).slice(2,8).toUpperCase();
  const token = `ABSEN|${tanggal}|${mk.nama}|${rand}`;
  const sesi = { id: nextSesiId++, tanggal, matkulId: mk.id, matkulNama: mk.nama, jamMulai: mk.jamMulai, jamSelesai: mk.jamSelesai, token };
  activeSessions.push(sesi);
  displaySesiQr(sesi);
  renderSesiAktifList();
  renderJadwalMhs();
  showToast('QR sesi absensi "' + mk.nama + '" dibuat. Tampilkan ke mahasiswa.');
});

function displaySesiQr(sesi){
  const qrContainer = document.getElementById('qrContainer');
  qrContainer.innerHTML = '';
  new QRCode(qrContainer, { text: sesi.token, width:220, height:220, colorDark:"#1e1b4b", colorLight:"#ffffff" });

  document.getElementById('sesiTokenText').textContent = sesi.token;
  document.getElementById('sesiPillTanggal').textContent = sesi.tanggal;
  document.getElementById('sesiPillSesi').textContent = sesi.matkulNama + ' (' + sesi.jamMulai + '–' + sesi.jamSelesai + ')';
  document.getElementById('sesiPillSesi').className = 'pill status-' + getSesiStatus(sesi);
  document.getElementById('sesiInfo').style.display='block';
}

function renderSesiAktifList(){
  const box = document.getElementById('sesiAktifList');
  const todays = activeSessions.filter(s=>s.tanggal===todayStr()).slice().sort((a,b)=> a.jamMulai < b.jamMulai ? -1 : 1);
  if(todays.length===0){
    box.innerHTML = '<div class="sesi-list-empty">Belum ada sesi absensi dibuat hari ini.</div>';
    return;
  }
  box.innerHTML = todays.map(s=>{
    const st = getSesiStatus(s);
    return `<div class="sesi-item">
      <div class="info">
        <b>${s.matkulNama}</b>
        <span>${s.jamMulai}–${s.jamSelesai} · Kode: ${s.token}</span>
      </div>
      <div class="actions">
        <span class="pill status-${st}">${sesiStatusLabel(st)}</span>
        <button type="button" class="edit-btn" data-showqr="${s.id}">Tampilkan QR</button>
        <button type="button" class="del-btn" data-hapussesi="${s.id}">Hapus</button>
      </div>
    </div>`;
  }).join('');
}
document.getElementById('sesiAktifList').addEventListener('click', function(e){
  const showId = Number(e.target.dataset.showqr);
  const delId = Number(e.target.dataset.hapussesi);
  if(showId){
    const s = activeSessions.find(x=>x.id===showId); if(s) displaySesiQr(s);
  }
  if(delId){
    activeSessions = activeSessions.filter(x=>x.id!==delId);
    renderSesiAktifList();
    renderJadwalMhs();
    showToast('Sesi absensi dihapus.');
  }
});

/* ============ JADWAL UNTUK MAHASISWA (pilih sesi sesuai jam) ============ */
function renderJadwalMhs(){
  if(!currentUser || currentUser.role!=='mahasiswa') return;
  const box = document.getElementById('jadwalMhsList');
  const todays = activeSessions.filter(s=>s.tanggal===todayStr()).slice().sort((a,b)=> a.jamMulai < b.jamMulai ? -1 : 1);
  if(todays.length===0){
    box.innerHTML = '<div class="sesi-list-empty">Belum ada jadwal absensi mata kuliah hari ini. Hubungi admin/dosen.</div>';
    return;
  }
  const sudahAbsen = new Set(absensi.filter(a=>a.nim===currentUser.nim && a.tanggal===todayStr()).map(a=>a.token));
  box.innerHTML = todays.map(s=>{
    const st = getSesiStatus(s);
    const done = sudahAbsen.has(s.token);
    return `<div class="sesi-item">
      <div class="info">
        <b>${s.matkulNama}</b>
        <span>${s.jamMulai}–${s.jamSelesai}</span>
      </div>
      <div class="actions">
        <span class="pill status-${st}">${sesiStatusLabel(st)}</span>
        <button type="button" class="btn-primary" data-pilihsesi="${s.id}" ${done?'disabled':''}>${done?'✓ Sudah Absen':'Absen'}</button>
      </div>
    </div>`;
  }).join('');
}
document.getElementById('jadwalMhsList').addEventListener('click', function(e){
  const id = Number(e.target.dataset.pilihsesi);
  if(!id) return;
  const s = activeSessions.find(x=>x.id===id);
  if(s) handleScannedToken(s.token);
  document.getElementById('absenForm').scrollIntoView({behavior:'smooth', block:'center'});
});

/* ============ SCAN QR (kamera) ============ */
let scanning = false;
let videoStream = null;
const scanVideo = document.getElementById('scanVideo');
const scanCanvas = document.getElementById('scanCanvas');
const scanStatus = document.getElementById('scanStatus');

document.getElementById('btnStartScan').addEventListener('click', async function(){
  try{
    videoStream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:'environment' } });
    scanVideo.srcObject = videoStream;
    scanVideo.style.display='block';
    document.getElementById('btnStartScan').style.display='none';
    document.getElementById('btnStopScan').style.display='inline-block';
    scanning = true;
    setScanStatus('idle','Kamera aktif — arahkan ke QR sesi absensi...');
    requestAnimationFrame(scanLoop);
  } catch(err){
    setScanStatus('bad','Tidak bisa mengakses kamera. Gunakan input kode manual di bawah.');
  }
});

document.getElementById('btnStopScan').addEventListener('click', stopScan);

function stopScan(){
  scanning = false;
  if(videoStream){ videoStream.getTracks().forEach(t=>t.stop()); videoStream=null; }
  scanVideo.style.display='none';
  document.getElementById('btnStartScan').style.display='inline-block';
  document.getElementById('btnStopScan').style.display='none';
}

function scanLoop(){
  if(!scanning) return;
  if(scanVideo.readyState === scanVideo.HAVE_ENOUGH_DATA && typeof jsQR !== 'undefined'){
    scanCanvas.width = scanVideo.videoWidth;
    scanCanvas.height = scanVideo.videoHeight;
    const ctx = scanCanvas.getContext('2d');
    ctx.drawImage(scanVideo, 0, 0, scanCanvas.width, scanCanvas.height);
    const imageData = ctx.getImageData(0,0,scanCanvas.width, scanCanvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if(code && code.data){
      handleScannedToken(code.data);
      stopScan();
      return;
    }
  }
  requestAnimationFrame(scanLoop);
}

function setScanStatus(type, msg){
  scanStatus.className = 'scan-status ' + type;
  scanStatus.textContent = msg;
}

function handleScannedToken(token){
  const sesi = activeSessions.find(s=>s.token===token);
  if(!sesi){
    setScanStatus('bad','Kode QR/sesi tidak ditemukan atau sudah dihapus. Minta admin membuat ulang QR.');
    return;
  }
  selectedSession = sesi;
  const identityBox = document.getElementById('absenMhsIdentity');
  if(currentUser && currentUser.role==='mahasiswa'){
    setScanStatus('ok','Sesi "' + sesi.matkulNama + '" terverifikasi! Konfirmasi kehadiran Anda di bawah.');
    identityBox.textContent = 'NIM: ' + currentUser.nim + ' — Nama: ' + currentUser.nama + ' — MK: ' + sesi.matkulNama;
    identityBox.style.display='block';
  } else {
    setScanStatus('ok','Sesi "' + sesi.matkulNama + '" terverifikasi! Silakan pilih NIM untuk konfirmasi.');
    identityBox.style.display='none';
  }
  document.getElementById('absenForm').style.display='block';
}

document.getElementById('btnVerifyManual').addEventListener('click', function(){
  const val = document.getElementById('manualToken').value.trim();
  if(!val){ showToast('Masukkan kode sesi terlebih dahulu.'); return; }
  handleScannedToken(val);
});

/* ============ REKAP KEHADIRAN ============ */
let absensi = [];
let nextAbsenId = 1;
let editingAbsenId = null;

function hitungStatus(sesi){
  if(!sesi || !sesi.jamSelesai) return 'Hadir';
  const now = new Date();
  const [h,m] = sesi.jamSelesai.split(':').map(Number);
  const cutoff = new Date(now);
  cutoff.setHours(h, m, 0, 0);
  return now > cutoff ? 'Tidak Hadir' : 'Hadir';
}

document.getElementById('btnKonfirmasiAbsen').addEventListener('click', function(){
  if(!selectedSession){ showToast('Sesi belum diverifikasi.'); return; }
  const nim = (currentUser && currentUser.role==='mahasiswa') ? currentUser.nim : document.getElementById('absenNimSelect').value;
  const mhs = mahasiswa.find(m=>m.nim===nim);
  if(!mhs){ showToast('Pilih NIM Anda terlebih dahulu.'); return; }
  const dup = absensi.find(a=>a.token===selectedSession.token && a.nim===nim);
  if(dup){ showToast('Anda sudah tercatat hadir untuk mata kuliah ini.'); return; }

  const now = new Date();
  const jam = now.toLocaleTimeString('id-ID');
  const status = hitungStatus(selectedSession);

  absensi.push({
    id: nextAbsenId++, tanggal: selectedSession.tanggal, matkul: selectedSession.matkulNama, token: selectedSession.token,
    nim: mhs.nim, nama: mhs.nama, prodi: mhs.prodi, pts: mhs.pts, jam, status
  });
  renderRekap();
  renderRiwayat();
  renderJadwalMhs();
  showToast(status==='Hadir' ? 'Absen berhasil — Hadir ✅' : 'Absen tercatat lewat batas jam — Tidak Hadir ⚠');

  document.getElementById('absenForm').style.display='none';
  document.getElementById('absenNimSelect').value='';
  document.getElementById('absenMhsIdentity').style.display='none';
  document.getElementById('manualToken').value='';
  selectedSession = null;
  setScanStatus('idle','Kamera belum aktif. Pilih jadwal di atas, arahkan ke QR di layar admin, atau masukkan kode sesi manual di bawah.');
});

/* ============ RIWAYAT SAYA (MAHASISWA) ============ */
function renderRiwayat(){
  if(!currentUser || currentUser.role!=='mahasiswa') return;
  const body = document.getElementById('riwayatTableBody');
  const empty = document.getElementById('riwayatEmptyState');
  const rows = absensi.filter(a=>a.nim===currentUser.nim).slice().sort((a,b)=> (a.tanggal+a.jam) < (b.tanggal+b.jam) ? 1 : -1);
  body.innerHTML='';
  if(rows.length===0){
    empty.style.display='block';
  } else {
    empty.style.display='none';
    rows.forEach((row,i)=>{
      const tr=document.createElement('tr');
      const statusBadge = row.status==='Hadir' ? `<span class="badge hadir">Hadir</span>` : `<span class="badge tidakhadir">Tidak Hadir</span>`;
      tr.innerHTML = `<td>${i+1}</td><td>${row.tanggal}</td><td><span class="badge sesi">${row.matkul}</span></td><td>${row.jam}</td><td>${statusBadge}</td>`;
      body.appendChild(tr);
    });
  }
  document.getElementById('riwayatCount').textContent = rows.length;
}

function simpanRekapManual(e){
  e.preventDefault();
  const tanggal = document.getElementById('rekapTanggal').value;
  const matkulId = Number(document.getElementById('rekapMatkulSelect').value);
  const mk = matkulList.find(m=>m.id===matkulId);
  const nim = document.getElementById('rekapNim').value;
  const jam = document.getElementById('rekapJam').value.trim();
  const status = document.getElementById('rekapStatus').value;
  const mhs = mahasiswa.find(m=>m.nim===nim);

  if(!nim || !mhs){ showToast('Pilih NIM mahasiswa.'); return; }
  if(!tanggal || !mk){ showToast('Lengkapi tanggal dan mata kuliah.'); return; }

  if(editingAbsenId!==null){
    const idx = absensi.findIndex(a=>a.id===editingAbsenId);
    if(idx!==-1){
      absensi[idx] = {...absensi[idx], tanggal, matkul:mk.nama, nim:mhs.nim, nama:mhs.nama, prodi:mhs.prodi, pts:mhs.pts, jam: jam || absensi[idx].jam, status};
    }
    showToast('Data kehadiran diperbarui.');
    cancelEditRekap();
  } else {
    absensi.push({
      id: nextAbsenId++, tanggal, matkul:mk.nama, token:'manual-'+nextAbsenId, nim:mhs.nim, nama:mhs.nama, prodi:mhs.prodi, pts:mhs.pts,
      jam: jam || new Date().toLocaleTimeString('id-ID'), status
    });
    showToast('Data kehadiran ditambahkan.');
    document.getElementById('rekapJam').value='';
    document.getElementById('rekapNim').value='';
  }
  renderRekap();
  renderRiwayat();
}

function enterEditRekap(row){
  editingAbsenId = row.id;
  document.getElementById('rekapTanggal').value = row.tanggal;
  const mk = matkulList.find(m=>m.nama===row.matkul);
  document.getElementById('rekapMatkulSelect').value = mk ? mk.id : '';
  document.getElementById('rekapNim').value = row.nim;
  document.getElementById('rekapJam').value = row.jam;
  document.getElementById('rekapStatus').value = row.status;
  document.getElementById('rekapSubmitBtn').textContent = '✓ Update Data';
  document.getElementById('rekapCancelEdit').style.display='inline-block';
  document.getElementById('tabRekap').scrollIntoView({behavior:'smooth', block:'start'});
  renderRekap();
}
function cancelEditRekap(){
  editingAbsenId = null;
  document.getElementById('rekapSubmitBtn').textContent = '+ Simpan Data';
  document.getElementById('rekapCancelEdit').style.display='none';
  document.getElementById('rekapJam').value='';
  document.getElementById('rekapNim').value='';
  renderRekap();
}
document.getElementById('rekapCancelEdit').addEventListener('click', cancelEditRekap);

const filterSearch = document.getElementById('filterSearch');
const filterTanggal = document.getElementById('filterTanggal');
const filterMatkul = document.getElementById('filterMatkul');
const filterStatus = document.getElementById('filterStatus');
const filterProdi = document.getElementById('filterProdi');

function refreshMatkulFilter(){
  const current = filterMatkul.value;
  const namaList = [...new Set(absensi.map(a=>a.matkul).filter(Boolean))];
  filterMatkul.innerHTML = '<option value="">Semua</option>' + namaList.map(n=>`<option value="${n}">${n}</option>`).join('');
  if(namaList.includes(current)) filterMatkul.value = current;
}

function getFilteredRekap(){
  const q = filterSearch.value.trim().toLowerCase();
  return absensi.filter(row=>{
    if(filterTanggal.value && row.tanggal !== filterTanggal.value) return false;
    if(filterMatkul.value && row.matkul !== filterMatkul.value) return false;
    if(filterStatus.value && row.status !== filterStatus.value) return false;
    if(filterProdi.value && row.prodi !== filterProdi.value) return false;
    if(q && !(row.nama.toLowerCase().includes(q) || row.nim.toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderRekap(){
  const rekapTableBody = document.getElementById('rekapTableBody');
  const rekapEmptyState = document.getElementById('rekapEmptyState');
  refreshMatkulFilter();
  const filtered = getFilteredRekap();
  rekapTableBody.innerHTML='';

  if(absensi.length===0){
    rekapEmptyState.style.display='block';
    rekapEmptyState.innerHTML = '<span class="emoji">🗂</span><b>Belum ada data kehadiran</b>Absen lewat tab "Absensi QR" atau isi manual di atas.';
  } else if(filtered.length===0){
    rekapEmptyState.style.display='block';
    rekapEmptyState.innerHTML = '<span class="emoji">🔍</span><b>Tidak ditemukan</b>Coba ubah kata kunci atau reset filter.';
  } else {
    rekapEmptyState.style.display='none';
    filtered.forEach((row,i)=>{
      const tr=document.createElement('tr');
      if(row.id===editingAbsenId) tr.classList.add('editing-row');
      const statusBadge = row.status==='Hadir' ? `<span class="badge hadir">Hadir</span>` : `<span class="badge tidakhadir">Tidak Hadir</span>`;
      tr.innerHTML = `<td>${i+1}</td><td>${row.tanggal}</td><td><span class="badge sesi">${row.matkul}</span></td>
        <td>${row.nim}</td><td>${row.nama}</td><td>${row.prodi||'-'}</td><td>${row.pts||'-'}</td>
        <td>${row.jam}</td><td>${statusBadge}</td>
        <td><div class="row-actions">
          <button class="edit-btn" data-id="${row.id}">Edit</button>
          <button class="del-btn" data-id="${row.id}">Hapus</button>
        </div></td>`;
      rekapTableBody.appendChild(tr);
    });
  }
  document.getElementById('rowCount').textContent = filtered.length;
  document.getElementById('rowTotal').textContent = absensi.length;
}

document.getElementById('rekapTableBody').addEventListener('click', function(e){
  const id = Number(e.target.dataset.id);
  if(e.target.classList.contains('edit-btn')){
    const row = absensi.find(a=>a.id===id); if(row) enterEditRekap(row);
  }
  if(e.target.classList.contains('del-btn')){
    absensi = absensi.filter(a=>a.id!==id);
    if(editingAbsenId===id) cancelEditRekap();
    renderRekap();
    showToast('Data kehadiran dihapus.');
  }
});

[filterSearch, filterTanggal, filterMatkul, filterStatus, filterProdi].forEach(el=>{
  el.addEventListener('input', renderRekap);
  el.addEventListener('change', renderRekap);
});
document.getElementById('filterClear').addEventListener('click', function(){
  filterSearch.value=''; filterTanggal.value=''; filterMatkul.value=''; filterStatus.value=''; filterProdi.value='';
  renderRekap();
});

/* ============ UNDUH DATA ============ */
function buildAoA(){
  const header = ['No','Tanggal','Mata Kuliah','NIM','Nama','Prodi','Perguruan Tinggi (PTS)','Jam Absen','Status'];
  const rows = getFilteredRekap().map((r,i)=>[i+1, r.tanggal, r.matkul, r.nim, r.nama, r.prodi||'-', r.pts||'-', r.jam, r.status]);
  return [header, ...rows];
}
document.getElementById('downloadXlsx').addEventListener('click', function(){
  if(absensi.length===0){ showToast('Belum ada data untuk diunduh.'); return; }
  const aoa = buildAoA();
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols']=[{wch:5},{wch:12},{wch:10},{wch:14},{wch:20},{wch:20},{wch:26},{wch:12},{wch:12}];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Kehadiran');
  XLSX.writeFile(wb, `rekap-absensi-${todayStr()}.xlsx`);
  showToast('File Excel diunduh.');
});
document.getElementById('downloadCsv').addEventListener('click', function(){
  if(absensi.length===0){ showToast('Belum ada data untuk diunduh.'); return; }
  const aoa = buildAoA();
  const csv = aoa.map(row=>row.map(v=>{
    const s=String(v);
    return s.includes(',')||s.includes('"') ? '"'+s.replace(/"/g,'""')+'"' : s;
  }).join(',')).join('\n');
  const blob = new Blob(['\uFEFF'+csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href=url; a.download=`rekap-absensi-${todayStr()}.csv`; a.click();
  URL.revokeObjectURL(url);
  showToast('File CSV diunduh.');
});

/* init */
renderMhs();
renderMatkul();
renderSesiAktifList();
renderRekap();