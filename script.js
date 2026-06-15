// MASUKIN URL SAKTI LU DI SINI
const GAS_URL = 'https://script.google.com/macros/s/AKfycbw4wFlZj816RRjcX9xmQrzjhQv-Hte_kOyi1j1rpQvM-goLSoZA5WfFkXK_7kI5uHXnmg/exec'; 

let mockData = {}; 

// FUNGSI SAKTI: Ngubah link GDrive biasa jadi link Foto Mentah
function fixGoogleDriveLink(url) {
  if (!url) return '';
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }
  return url; 
}

async function fetchLeaderboardData() {
  try {
    document.getElementById('leaderboard-container').innerHTML = '<h2 class="text-2xl font-bold text-center w-full">Sabar cuy, lagi loading data... ⏳</h2>';

    const response = await fetch(GAS_URL);
    mockData = await response.json();

    renderLeaderboard();
    renderGroups(); // Nampilin Grup 7 & 8
    startTypewriter();
    startPolaroidSlideshow();
    
  } catch (error) {
    document.getElementById('leaderboard-container').innerHTML = '<h2 class="text-2xl text-red-600 font-bold text-center w-full">Gagal muat data! Cek lagi link GAS-nya ya. ☠️</h2>';
  }
}

window.onload = () => {
  fetchLeaderboardData(); 
  setInterval(fetchLeaderboardData, 30000);
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
    
    // Misahin berdasarkan karakter pertama (7 atau 8)
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
  
  // A. Render Roster
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

  // B. Render History
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

  // C. Render Supporter
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
  document.getElementById(`tab-${tabId}`).classList.remove('hidden');
}

function showSchedule(sport) {
  document.getElementById('schedule-title').innerText = `Jadwal ${sport}`;
  const list = document.getElementById('schedule-list');
  list.innerHTML = '';
  
  // Pake logic toLowerCase() dan trim() biar kebal dari typo spasi di Google Sheets
  const schedules = mockData.SCHEDULE_POPUP ? mockData.SCHEDULE_POPUP.filter(s => s['Cabang Lomba'] && s['Cabang Lomba'].toString().trim().toLowerCase() === sport.toLowerCase()) : [];
  
  if(schedules.length > 0) {
    schedules.forEach(sch => {
      list.innerHTML += `<li class="border-b border-gray-200 py-2">⏰ <b>${sch['Waktu']}</b><br><span class="text-[#BA6A4C] font-bold">${sch['Matchup (Tim A vs Tim B)']}</span></li>`;
    });
  } else {
    list.innerHTML = `<li>Belum ada jadwal hari ini.</li>`;
  }

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

// --- ANIMASI Y2K ---
function startTypewriter() {
  const logEl = document.getElementById('typewriter-text');
  const logs = mockData.SUPPORTER_LOGS && mockData.SUPPORTER_LOGS.length > 0 
    ? mockData.SUPPORTER_LOGS.map(log => log['Deskripsi (Tampil di Web)']).filter(text => text)
    : ["Aman terkendali. Belum ada pergerakan aneh..."];

  let logIndex = 0, charIndex = 0, isDeleting = false;

  function type() {
    const currentText = logs[logIndex];
    if (isDeleting) charIndex--; else charIndex++;
    
    logEl.innerText = currentText.substring(0, charIndex);
    let speed = isDeleting ? 30 : 100;

    if (!isDeleting && charIndex === currentText.length) { speed = 3000; isDeleting = true; } 
    else if (isDeleting && charIndex === 0) { isDeleting = false; logIndex = (logIndex + 1) % logs.length; speed = 500; }
    
    setTimeout(type, speed);
  }
  type();
}

function startPolaroidSlideshow() {
  const imgEl = document.getElementById('polaroid-img');
  const textEl = document.getElementById('polaroid-text');
  
  const mvpList = mockData.MATCH_HISTORY ? mockData.MATCH_HISTORY.filter(m => m['Foto POTM (URL)'] && m['Foto POTM (URL)'].trim() !== '') : [];

  if (mvpList.length === 0) return;

  let photoIndex = 0;
  
  // Pake fungsi sakti buat benerin link fotonya
  imgEl.src = fixGoogleDriveLink(mvpList[photoIndex]['Foto POTM (URL)']);
  textEl.innerText = `⭐ MVP ${mvpList[photoIndex]['Cabang']}: ${mvpList[photoIndex]['Player of the Match']}`;

  if (mvpList.length > 1) {
    setInterval(() => {
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
// --- LOGIC GANTI CABOR DI TAB BRACKET ---
function switchBracket(sport) {
  // 1. Ganti style tombol yang lagi aktif
  document.querySelectorAll('.bracket-btn').forEach(el => {
    el.classList.remove('text-[#7B2525]', 'underline', 'decoration-4', 'underline-offset-8');
    el.classList.add('text-[#607456]');
  });
  event.target.classList.add('text-[#7B2525]', 'underline', 'decoration-4', 'underline-offset-8');
  event.target.classList.remove('text-[#607456]');
  
  // 2. Ganti Judul Utama
  document.getElementById('bracket-title').innerText = `${sport.toUpperCase()} STAGE`;

  // 3. Logic Nyembunyiin Juara 3 (Kasti & Voli ga dapet!)
  const bronzeMatch = document.getElementById('bronze-match');
  if (sport.toUpperCase() === 'FUTSAL' || sport.toUpperCase() === 'MLBB') {
    bronzeMatch.classList.remove('hidden');
  } else {
    bronzeMatch.classList.add('hidden');
  }
}
