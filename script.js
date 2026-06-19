// MASUKIN URL SAKTI LU DI SINI
const GAS_URL = 'https://script.google.com/macros/s/AKfycbw4wFlZj816RRjcX9xmQrzjhQv-Hte_kOyi1j1rpQvM-goLSoZA5WfFkXK_7kI5uHXnmg/exec'; 
// ==========================================
// 🏆 DATABASE BRACKET (EDIT NAMA KELAS DI SINI)
// ==========================================
const DATA_BRACKET = {
  "Futsal": {
    "g7_match": "7C vs 7A | 7A vs 7B | 7B vs 7C",
    "g7_r1": "7B", "g7_r2": "7C", "g7_r3": "7A",
    "g8_match": "8B vs 8A | 8C vs 8B | 8A vs 8C",
    "g8_r1": "8C", "g8_r2": "8A", "g8_r3": "8B",
    "m1_p1": "7B", "m1_p2": "8A",
    "m2_p1": "8A", "m2_p2": "7C",
    "m3_p1": "WINNER M1", "m3_p2": "WINNER M2",
    "m4_p1": "LOSER M1", "m4_p2": "LOSER M2",
    "champ": "[ TBD ]", "third": "[ TBD ]"
  },
  "MLBB": {
    "g7_match": "7B vs 7C | 7C vs 7A | 7A vs 7B",
    "g7_r1": "7B", "g7_r2": "7C", "g7_r3": "7A",
    "g8_match": "8C vs 8A | 8A vs 8B | 8B vs 8C",
    "g8_r1": "8C", "g8_r2": "8B", "g8_r3": "8A",
    "m1_p1": "7B", "m1_p2": "8B",
    "m2_p1": "8C", "m2_p2": "7C",
    "m3_p1": "WINNER M1", "m3_p2": "WINNER M2",
    "m4_p1": "LOSER M1", "m4_p2": "LOSER M2",
    "champ": "[ TBD ]", "third": "[ TBD ]"
  },
  "Voli": {
    "g7_match": "7B vs 7C | 7C vs 7A | 7A vs 7B",
    "g7_r1": "7B", "g7_r2": "7C", "g7_r3": "7A",
    "g8_match": "8A vs 8B | 8B vs 8C | 8C vs 8A",
    "g8_r1": "8A", "g8_r2": "8C", "g8_r3": "8B",
    "m1_p1": "7B", "m1_p2": "8C",
    "m2_p1": "8A", "m2_p2": "7C",
    "m3_p1": "8C", "m3_p2": "WINNER M2",
    "m4_p1": "-", "m4_p2": "-", "champ": "[ TBD ]", "third": "-"
  },
  "Kasti": {
    "g7_match": "7B vs 7C | 7C vs 7A | 7A vs 7B",
    "g7_r1": "7C", "g7_r2": "7B", "g7_r3": "7A",
    "g8_match": "8B vs 8A | 8C vs 8B | 8A vs 8C",
    "g8_r1": "8B", "g8_r2": "8A", "g8_r3": "8C",
    "m1_p1": "7C", "m1_p2": "8A",
    "m2_p1": "8B", "m2_p2": "7B",
    "m3_p1": "8A", "m3_p2": "WINNER M2",
    "m4_p1": "-", "m4_p2": "-", "champ": "[ TBD ]", "third": "-"
  }
};
// ==========================================
let mockData = {}; 

// VARIABEL REM TANGAN BUAT ANIMASI
let typeTimeout; 
let polaroidInterval; 

// FUNGSI SAKTI: Ngubah link GDrive biasa jadi link Foto Mentah
function fixGoogleDriveLink(url) {
  if (!url) return '';
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
  }
  return url; 
}

async function fetchLeaderboardData() {
  try {
    // CUMA munculin loading text pas pertama kali buka web (biar ga kedap-kedip di TV tiap 30 dtk)
    if (Object.keys(mockData).length === 0) {
      document.getElementById('leaderboard-container').innerHTML = '<h2 class="text-2xl font-bold text-center w-full">Loading ... ⏳</h2>';
    }

    const response = await fetch(GAS_URL);
    mockData = await response.json();

    renderLeaderboard();
    renderGroups(); 
    startTypewriter();
    startPolaroidSlideshow();
    
  } catch (error) {
    console.log("Wah gagal narik data background: ", error);
  }
}

window.onload = () => {
  fetchLeaderboardData(); 
  setInterval(fetchLeaderboardData, 30000);
  
  // Tambahin ini biar bracket futsal langsung muncul duluan
  setTimeout(() => switchBracket('Futsal'), 1000); 
};

// --- RENDER LEADERBOARD UTAMA ---
function renderLeaderboard() {
  const container = document.getElementById('leaderboard-container');
  container.innerHTML = '';
  
  if (!mockData.GLOBAL_LEADERBOARD || mockData.GLOBAL_LEADERBOARD.length === 0) return;

  const sortedClasses = [...mockData.GLOBAL_LEADERBOARD].sort((a, b) => b['Total Poin'] - a['Total Poin']);

  sortedClasses.forEach((cls, index) => {
    const isRank1 = index === 0 ? 'border-[#BA6A4C] shadow-[0_0_15px_#BA6A4C]' : 'border-[#607456]';
    const logoImg = fixGoogleDriveLink(cls['Logo URL']);
    
    container.innerHTML += `
      <div class="bg-white border-4 scrapbook-shadow p-4 cursor-pointer relative hover:bg-[#EEE0CC] transition ${isRank1}" onclick="openClassModal('${cls['Kelas']}', '${logoImg}')">
        <div class="flex items-center gap-4">
          ${logoImg ? `<img src="${logoImg}" class="w-16 h-16 object-contain">` : `<div class="w-16 h-16 bg-gray-200 flex items-center justify-center font-bold text-xl">${index+1}</div>`}
          <div class="flex-1">
            <h3 class="text-2xl font-extrabold text-[#607456] uppercase">${cls['Kelas']}</h3>
            <div class="text-sm text-gray-600 font-bold">${cls['Nama Pasukan']}</div>
            <div class="text-lg font-bold text-[#BA6A4C] mt-1">${cls['Total Poin']} PTS</div>
          </div>
        </div>
      </div>
    `;
  });
}

// --- RENDER TAB GRUP 7 & 8 ---
function renderGroups() {
  const container7 = document.getElementById('group-7-container');
  const container8 = document.getElementById('group-8-container');
  if(!container7 || !container8) return; // Mencegah error kalo lagi ga di tab bracket
  
  container7.innerHTML = ''; container8.innerHTML = '';

  const sortedClasses = [...mockData.GLOBAL_LEADERBOARD].sort((a, b) => b['Total Poin'] - a['Total Poin']);

  sortedClasses.forEach((cls) => {
    const logoImg = fixGoogleDriveLink(cls['Logo URL']);
    const htmlCard = `
      <div class="flex items-center gap-4 bg-[#EEE0CC] p-3 border-2 border-[#607456] scrapbook-shadow">
        ${logoImg ? `<img src="${logoImg}" class="w-10 h-10 object-contain">` : ``}
        <div class="flex-1 font-bold text-[#7B2525] text-xl">${cls['Kelas']}</div>
        <div class="font-extrabold text-2xl text-[#BA6A4C]">${cls['Total Poin']}</div>
      </div>
    `;
    
    if (cls['Kelas'].startsWith('7')) {
      container7.innerHTML += htmlCard;
    } else if (cls['Kelas'].startsWith('8')) {
      container8.innerHTML += htmlCard;
    }
  });
}

// --- MODAL LOGIC ---
const classModal = document.getElementById('class-modal');

function openClassModal(className, logoUrl) {
  document.getElementById('modal-classname').innerText = className;
  
  const logoEl = document.getElementById('modal-logo');
  if (logoUrl) {
    logoEl.src = logoUrl;
    logoEl.classList.remove('hidden');
  } else {
    logoEl.classList.add('hidden');
  }
  
  const rosterDiv = document.getElementById('modal-roster');
  rosterDiv.innerHTML = '';
  const rosterList = mockData.ROSTER_PEMAIN ? mockData.ROSTER_PEMAIN.filter(r => r['Kelas'] === className) : [];
  
  if (rosterList.length > 0) {
    rosterList.forEach(roster => {
      const sport = roster['Cabang Lomba'];
      let playersHTML = sport === 'Kasti' 
        ? `<p class="font-extrabold text-[#7B2525] italic">"MASSIVE DEPLOYMENT: FULL SQUAD" 🚀</p>`
        : `<p class="font-semibold">${[roster['Nama Pemain 1 (C)'], roster['Nama Pemain 2'], roster['Nama Pemain 3'], roster['Nama Pemain 4'], roster['Nama Pemain 5'], roster['Nama Pemain 6']].filter(p => p && p !== '-').join(', ')} <br> <span class="text-sm italic text-gray-500">Cadangan: ${roster['Cadangan'] || '-'}</span></p>`;
      
      rosterDiv.innerHTML += `<div class="mb-3 border-l-4 border-[#BA6A4C] pl-3"><h4 class="font-bold text-[#BA6A4C]">${sport}</h4>${playersHTML}</div>`;
    });
  } else {
     rosterDiv.innerHTML = '<p class="text-gray-500">Belum diinput panitia.</p>';
  }

  const historyDiv = document.getElementById('modal-history');
  historyDiv.innerHTML = '';
  const historyList = mockData.MATCH_HISTORY ? mockData.MATCH_HISTORY.filter(m => m['Kelas 1'] === className || m['Kelas 2'] === className) : [];
  
  if (historyList.length > 0) {
    historyList.forEach(m => {
      historyDiv.innerHTML += `
        <div class="flex justify-between border-b border-gray-300 py-2">
          <div><span class="font-bold text-[#607456]">${m['Cabang']}</span> vs ${m['Kelas 1'] === className ? m['Kelas 2'] : m['Kelas 1']}</div>
          <div class="font-bold">${m['Skor 1']} - ${m['Skor 2']}</div>
        </div>
      `;
    });
  } else {
    historyDiv.innerHTML = '<p class="text-gray-500">Belum ada tanding.</p>';
  }

  const supporterDiv = document.getElementById('modal-supporter');
  supporterDiv.innerHTML = '';
  const supLogs = mockData.SUPPORTER_LOGS ? mockData.SUPPORTER_LOGS.filter(s => s['Kelas'] === className) : [];
  
  if (supLogs.length > 0) {
    supLogs.forEach(log => {
      supporterDiv.innerHTML += `<div class="border-b border-gray-300 py-2 flex justify-between gap-4"><span class="text-gray-700">${log['Deskripsi (Tampil di Web)']}</span><span class="font-bold text-[#7B2525]">${log['Poin (Angka)']}</span></div>`;
    });
  } else {
     supporterDiv.innerHTML = `<p class="text-gray-500 italic">Belum ada log suporter.</p>`;
  }

  classModal.classList.remove('hidden');
  classModal.classList.add('flex');
  setTimeout(() => classModal.classList.remove('opacity-0'), 10);
  switchModalTab('roster');
}

function closeModal() {
  classModal.classList.add('opacity-0');
  setTimeout(() => { classModal.classList.add('hidden'); classModal.classList.remove('flex'); }, 300);
}

function switchModalTab(tabName) {
  document.querySelectorAll('.modal-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.modal-tab-btn').forEach(el => {
    el.classList.remove('text-[#BA6A4C]', 'border-[#BA6A4C]');
    el.classList.add('text-[#607456]');
  });
  document.getElementById(`modal-${tabName}`).classList.remove('hidden');
  event.target.classList.add('text-[#BA6A4C]', 'border-[#BA6A4C]');
  event.target.classList.remove('text-[#607456]');
}

// --- TAB & SCHEDULE NAVIGATION ---
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden', 'md:flex'));
  
  const bracketEl = document.getElementById('tab-bracket');
  if(bracketEl && tabId !== 'bracket') bracketEl.classList.add('hidden');
  
  document.getElementById(`tab-${tabId}`).classList.remove('hidden');
}

// --- LOGIC GANTI CABOR DI TAB BRACKET ---
function switchBracket(sport) {
  // 1. Ganti style tombol
  document.querySelectorAll('.bracket-btn').forEach(el => {
    el.classList.remove('text-[#7B2525]', 'underline', 'decoration-4', 'underline-offset-8');
    el.classList.add('text-[#607456]');
  });
  event.target.classList.add('text-[#7B2525]', 'underline', 'decoration-4', 'underline-offset-8');
  event.target.classList.remove('text-[#607456]');
  
  // 2. Ganti Judul
  document.getElementById('bracket-title').innerText = `BRACKET ${sport.toUpperCase()}`;

  // 3. Hide/Show Juara 3 (Kasti & Voli ga dapet!)
  const isBronze = (sport.toUpperCase() === 'FUTSAL' || sport.toUpperCase() === 'MLBB');
  document.getElementById('bronze-match')?.classList.toggle('hidden', !isBronze);
  document.querySelector('.bronze-arrow')?.classList.toggle('hidden', !isBronze);
  document.querySelector('.bronze-winner')?.classList.toggle('hidden', !isBronze);

  // 4. MASUKIN DATA DARI MINI-SPREADSHEET KE HTML
  const data = DATA_BRACKET[sport];
  if (data) {
    document.getElementById('br-g7-match').innerText = data.g7_match;
    document.getElementById('br-g7-r1').innerText = data.g7_r1;
    document.getElementById('br-g7-r2').innerText = data.g7_r2;
    document.getElementById('br-g7-r3').innerText = data.g7_r3;
    document.getElementById('br-g8-match').innerText = data.g8_match;
    document.getElementById('br-g8-r1').innerText = data.g8_r1;
    document.getElementById('br-g8-r2').innerText = data.g8_r2;
    document.getElementById('br-g8-r3').innerText = data.g8_r3;
    
    document.getElementById('br-m1-p1').innerText = data.m1_p1;
    document.getElementById('br-m1-p2').innerText = data.m1_p2;
    document.getElementById('br-m2-p1').innerText = data.m2_p1;
    document.getElementById('br-m2-p2').innerText = data.m2_p2;
    
    document.getElementById('br-m3-p1').innerText = data.m3_p1;
    document.getElementById('br-m3-p2').innerText = data.m3_p2;
    document.getElementById('br-m4-p1').innerText = data.m4_p1;
    document.getElementById('br-m4-p2').innerText = data.m4_p2;
    
    document.getElementById('br-champ').innerText = data.champ;
    document.getElementById('br-3rd').innerText = data.third;
  }
}
// --- JADWAL POPUP (VERSI REAL-TIME HARI INI) ---
function showSchedule(sport) {
  
  // 1. Tarik tanggal asli hari ini dari sistem
  const today = new Date();
  const dateString = today.toLocaleDateString('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  }); // Hasilnya bakal persis "17/06/2026"

  // UBAH JUDUL POPUP JADI ADA TANGGALNYA
  document.getElementById('schedule-title').innerText = `${sport} (${dateString})`;
  
  const list = document.getElementById('schedule-list');
  list.innerHTML = '';
  
  // 2. Filter data dari satelit OSIS
  const schedules = mockData.SCHEDULE_POPUP ? mockData.SCHEDULE_POPUP.filter(s => {
    // Cocokin cabornya
    const isSportMatch = s['Cabang Lomba'] && s['Cabang Lomba'].toString().trim().toLowerCase() === sport.toLowerCase();
    // Cocokin tanggalnya sama hari ini ("17/06/2026")
    const isDateMatch = s['Tanggal'] && s['Tanggal'].toString().trim() === dateString;
    return isSportMatch && isDateMatch;
  }) : [];
  
  // 3. Nampilin ke layar
  if(schedules.length > 0) {
    schedules.forEach(sch => {
      // Pastiin kolomnya bernama 'Jam' di Google Sheets
      if(sch['Jam'] && sch['Matchup (Tim A vs Tim B)'] && sch['Jam'].toString().trim() !== '') {
        list.innerHTML += `
          <li class="border-b border-[#EEE0CC] py-3">
            ⏰ <b class="text-[#607456]">${sch['Jam']}</b><br>
            <span class="text-[#BA6A4C] font-extrabold text-lg tracking-wide">${sch['Matchup (Tim A vs Tim B)']}</span>
          </li>
        `;
      }
    });
  } else {
    // Kalo kosong
    list.innerHTML = `
      <li class="text-gray-500 italic text-center py-4">
        Belum ada jadwal tanding untuk hari ini. <br> 
        <span class="text-sm">Silakan cek lagi besok! 🏕️</span>
      </li>
    `;
  }

  // Munculin Animasi Modal
  const modal = document.getElementById('schedule-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  setTimeout(() => modal.classList.remove('opacity-0'), 10);
}

function closeSchedule() {
  const modal = document.getElementById('schedule-modal');
  modal.classList.add('opacity-0');
  setTimeout(() => { modal.classList.add('hidden'); modal.classList.remove('flex'); }, 300);
}

// --- ANIMASI Y2K FIXED (Pake Rem Tangan) ---
function startTypewriter() {
  // REM TANGAN: Bersihin memori ngetik yang lama biar ga tumpang tindih
  clearTimeout(typeTimeout); 

  const logEl = document.getElementById('typewriter-text');
  const logs = mockData.SUPPORTER_LOGS && mockData.SUPPORTER_LOGS.length > 0 
    ? mockData.SUPPORTER_LOGS.map(log => log['Deskripsi (Tampil di Web)']).filter(text => text && text.trim() !== '')
    : ["Aman terkendali. Belum ada pergerakan aneh..."];

  let logIndex = 0, charIndex = 0, isDeleting = false;

  function type() {
    if (!logs || logs.length === 0) return;
    
    const currentText = logs[logIndex];
    if (isDeleting) charIndex--; else charIndex++;
    
    logEl.innerText = currentText.substring(0, charIndex);
    let speed = isDeleting ? 30 : 100;

    if (!isDeleting && charIndex === currentText.length) { speed = 3000; isDeleting = true; } 
    else if (isDeleting && charIndex === 0) { isDeleting = false; logIndex = (logIndex + 1) % logs.length; speed = 500; }
    
    // Simpen ke variabel rem tangan
    typeTimeout = setTimeout(type, speed); 
  }
  type();
}

function startPolaroidSlideshow() {
  // REM TANGAN: Bersihin memori slideshow yang lama
  clearInterval(polaroidInterval); 

  const imgEl = document.getElementById('polaroid-img');
  const textEl = document.getElementById('polaroid-text');
  
  const mvpList = mockData.MATCH_HISTORY ? mockData.MATCH_HISTORY.filter(m => m['Foto POTM (URL)'] && m['Foto POTM (URL)'].trim() !== '') : [];

  if (mvpList.length === 0) return;

  let photoIndex = 0;
  imgEl.src = fixGoogleDriveLink(mvpList[photoIndex]['Foto POTM (URL)']);
  textEl.innerText = `⭐ MVP ${mvpList[photoIndex]['Cabang']}: ${mvpList[photoIndex]['Player of the Match']}`;

  if (mvpList.length > 1) {
    // Simpen ke variabel rem tangan
    polaroidInterval = setInterval(() => {
      imgEl.style.opacity = 0; textEl.style.opacity = 0;
      setTimeout(() => {
        photoIndex = (photoIndex + 1) % mvpList.length;
        imgEl.src = fixGoogleDriveLink(mvpList[photoIndex]['Foto POTM (URL)']);
        textEl.innerText = `⭐ MVP ${mvpList[photoIndex]['Cabang']}: ${mvpList[photoIndex]['Player of the Match']}`;
        imgEl.style.opacity = 1; textEl.style.opacity = 1;
      }, 500); 
    }, 6000);
  }
}
