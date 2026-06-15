// --- 1. DATA DARI GOOGLE SHEETS (API) ---
// Masukin URL hasil Deploy dari Google Apps Script lu!
const GAS_URL = 'https://script.google.com/macros/s/AKfycbw4wFlZj816RRjcX9xmQrzjhQv-Hte_kOyi1j1rpQvM-goLSoZA5WfFkXK_7kI5uHXnmg/exec'; 

let mockData = {}; 

async function fetchLeaderboardData() {
  try {
    document.getElementById('leaderboard-container').innerHTML = '<h2 class="text-2xl text-forest font-bold text-center w-full">Loading ... ⏳</h2>';

    const response = await fetch(GAS_URL);
    const data = await response.json();
    mockData = data;

    renderLeaderboard();
    startTypewriter();
    startPolaroidSlideshow();
    
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('leaderboard-container').innerHTML = '<h2 class="text-2xl text-red font-bold text-center w-full">Gagal muat data! Cek lagi link GAS-nya ya. ☠️</h2>';
  }
}

window.onload = () => {
  fetchLeaderboardData(); 
  // Auto-refresh layar setiap 30 detik biar data suporter dan poin update terus
  setInterval(fetchLeaderboardData, 30000);
};

// --- 2. RENDER LEADERBOARD ---
function renderLeaderboard() {
  const container = document.getElementById('leaderboard-container');
  container.innerHTML = '';
  
  if (!mockData.GLOBAL_LEADERBOARD || mockData.GLOBAL_LEADERBOARD.length === 0) {
    container.innerHTML = '<h2 class="text-xl text-red">Data GLOBAL_LEADERBOARD kosong nih, cek tab di Sheet lo!</h2>';
    return;
  }

  // Tarik data pakai nama Header Kolom yang bener ('Total Poin')
  const sortedClasses = [...mockData.GLOBAL_LEADERBOARD].sort((a, b) => b['Total Poin'] - a['Total Poin']);

  sortedClasses.forEach((cls, index) => {
    const rank = index + 1;
    const isRank1 = rank === 1 ? 'card-rank-1' : '';
    
    container.innerHTML += `
      <div class="bg-white border-4 border-forest scrapbook-shadow p-4 cursor-pointer relative hover:bg-orange/10 ${isRank1}" onclick="openClassModal('${cls['Kelas']}')">
        <div class="flex items-center gap-4">
          <div class="flex-1">
            <h3 class="text-2xl font-extrabold text-forest uppercase">${cls['Kelas']} ${cls['Nama Pasukan']}</h3>
            <div class="text-sm font-helvetica text-gray-600">Total Points: <b>${cls['Total Poin']}</b></div>
          </div>
        </div>
      </div>
    `;
  });
}

// --- 3. MODAL LOGIC (Roster, History, Supporter) ---
const classModal = document.getElementById('class-modal');

function openClassModal(className) {
  document.getElementById('modal-classname').innerText = className;
  
  // A. Render Roster Pemain
  const rosterDiv = document.getElementById('modal-roster');
  rosterDiv.innerHTML = '';
  
  const rosterList = mockData.ROSTER_PEMAIN ? mockData.ROSTER_PEMAIN.filter(r => r['Kelas'] === className) : [];
  if (rosterList.length > 0) {
    rosterList.forEach(roster => {
      let playersHTML = '';
      const sport = roster['Cabang Lomba'];
      
      if (sport === 'Kasti') {
        playersHTML = `<p class="font-extrabold text-red text-lg italic">"MASSIVE DEPLOYMENT: FULL SQUAD" 🚀</p>`;
      } else {
        const players = [
          roster['Nama Pemain 1 (C)'], roster['Nama Pemain 2'], roster['Nama Pemain 3'], 
          roster['Nama Pemain 4'], roster['Nama Pemain 5'], roster['Nama Pemain 6']
        ].filter(p => p && p !== '-');
        
        playersHTML = `<p class="font-helvetica text-gray-700">${players.join(', ')} <br> <span class="text-sm italic font-bold text-gray-500">Cadangan: ${roster['Cadangan'] || '-'}</span></p>`;
      }
      
      rosterDiv.innerHTML += `
        <div class="mb-3">
          <h4 class="font-bold text-orange border-b border-orange/30">${sport}</h4>
          ${playersHTML}
        </div>
      `;
    });
  } else {
     rosterDiv.innerHTML = '<p class="text-gray-600">Data roster belum diinput panitia.</p>';
  }

  // B. Render Match History
  const historyDiv = document.getElementById('modal-history');
  historyDiv.innerHTML = '';
  
  const historyList = mockData.MATCH_HISTORY ? mockData.MATCH_HISTORY.filter(m => m['Kelas 1'] === className || m['Kelas 2'] === className) : [];
  if (historyList.length > 0) {
    historyList.forEach(match => {
      const isWin = match['Pemenang'] === className;
      const isSeri = match['Pemenang'] === 'Seri';
      const resultText = isWin ? 'WIN' : (isSeri ? 'DRAW' : 'LOSE');
      const resultColor = isWin ? 'text-forest' : (isSeri ? 'text-orange' : 'text-red');
      
      historyDiv.innerHTML += `
        <div class="flex justify-between items-center border-b border-gray-300 py-2">
          <div><span class="font-bold text-forest">${match['Cabang']}</span> vs ${match['Kelas 1'] === className ? match['Kelas 2'] : match['Kelas 1']}</div>
          <div class="text-right">
            <span class="font-bold ${resultColor}">${resultText} (${match['Skor 1']} - ${match['Skor 2']})</span>
          </div>
        </div>
      `;
    });
  } else {
    historyDiv.innerHTML = '<p class="text-gray-600">Belum ada riwayat tanding.</p>';
  }

  // C. Render Supporter Log
  const supporterDiv = document.getElementById('modal-supporter');
  supporterDiv.innerHTML = '';
  
  const supporterLogs = mockData.SUPPORTER_LOGS ? mockData.SUPPORTER_LOGS.filter(s => s['Kelas'] === className) : [];
  if (supporterLogs.length > 0) {
    supporterLogs.forEach(log => {
      const pointColor = log['Poin (Angka)'] > 0 ? 'text-forest' : 'text-red';
      supporterDiv.innerHTML += `
        <div class="border-b border-gray-200 py-2 flex justify-between gap-4">
          <span class="text-gray-700">${log['Deskripsi (Tampil di Web)']}</span>
          <span class="font-bold ${pointColor}">${log['Poin (Angka)'] > 0 ? '+' : ''}${log['Poin (Angka)']}</span>
        </div>
      `;
    });
  } else {
     supporterDiv.innerHTML = `<p class="text-gray-600 italic">Belum ada log suporter untuk kelas ini. Keep it clean!</p>`;
  }

  classModal.classList.remove('hidden');
  classModal.classList.add('flex');
  setTimeout(() => classModal.classList.remove('opacity-0'), 10);
  switchModalTab('roster');
}

function closeModal() {
  classModal.classList.add('opacity-0');
  setTimeout(() => {
    classModal.classList.add('hidden');
    classModal.classList.remove('flex');
  }, 300);
}

function switchModalTab(tabName) {
  document.querySelectorAll('.modal-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.modal-tab-btn').forEach(el => {
    el.classList.remove('active', 'border-b-4', 'border-orange', 'text-orange');
    el.classList.add('text-forest');
  });
  
  document.getElementById(`modal-${tabName}`).classList.remove('hidden');
  const activeBtn = Array.from(document.querySelectorAll('.modal-tab-btn')).find(el => el.innerText.toLowerCase().includes(tabName));
  if(activeBtn) {
    activeBtn.classList.add('active', 'border-b-4', 'border-orange', 'text-orange');
    activeBtn.classList.remove('text-forest');
  }
}

// --- 4. TABS & SCHEDULES UI ---
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.nav-btn').forEach(el => {
    el.classList.replace('bg-orange', 'bg-white');
    el.classList.replace('text-white', 'text-forest');
  });

  document.getElementById(`tab-${tabId}`).classList.remove('hidden');
  event.target.classList.replace('bg-white', 'bg-orange');
  event.target.classList.replace('text-forest', 'text-white');
}

function switchBracket(sport) {
  document.querySelectorAll('.bracket-btn').forEach(el => {
    el.classList.remove('text-red', 'underline');
    el.classList.add('text-forest');
  });
  event.target.classList.add('text-red', 'underline');
  event.target.classList.remove('text-forest');
  document.getElementById('bracket-title').innerText = `${sport} BRACKET`;
}

function showSchedule(sport) {
  const modal = document.getElementById('schedule-modal');
  document.getElementById('schedule-title').innerText = sport;
  const list = document.getElementById('schedule-list');
  list.innerHTML = '';
  
  const schedules = mockData.SCHEDULE_POPUP ? mockData.SCHEDULE_POPUP.filter(s => s['Cabang Lomba'] === sport) : [];
  
  if(schedules.length > 0) {
    schedules.forEach(sch => {
      list.innerHTML += `<li class="border-b border-gray-200 py-2">
        ⏰ <b>${sch['Waktu']}</b> (${sch['Status']}) <br> 
        <span class="text-orange font-bold">${sch['Matchup (Tim A vs Tim B)']}</span>
      </li>`;
    });
  } else {
    list.innerHTML = `<li>Belum ada jadwal tertulis hari ini.</li>`;
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  setTimeout(() => modal.classList.remove('opacity-0'), 10);
}

function closeSchedule() {
  const modal = document.getElementById('schedule-modal');
  modal.classList.add('opacity-0');
  setTimeout(() => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }, 300);
}

// --- 5. ANIMASI (Typewriter & Polaroid) ---
function startTypewriter() {
  const logEl = document.getElementById('typewriter-text');
  
  // Tarik dari kolom 'Deskripsi (Tampil di Web)' di tab SUPPORTER_LOGS
  const logs = mockData.SUPPORTER_LOGS && mockData.SUPPORTER_LOGS.length > 0 
    ? mockData.SUPPORTER_LOGS.map(log => log['Deskripsi (Tampil di Web)']).filter(text => text)
    : [];

  if (logs.length === 0) logs.push("Aman terkendali. Belum ada pergerakan aneh dari suporter...");

  let logIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function type() {
    const currentText = logs[logIndex];
    if (isDeleting) {
      logEl.innerText = currentText.substring(0, charIndex - 1);
      charIndex--;
    } else {
      logEl.innerText = currentText.substring(0, charIndex + 1);
      charIndex++;
    }

    let typeSpeed = isDeleting ? 30 : 100;

    if (!isDeleting && charIndex === currentText.length) {
      typeSpeed = 3000; 
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      logIndex = (logIndex + 1) % logs.length;
      typeSpeed = 500;
    }
    setTimeout(type, typeSpeed);
  }
  type();
}

function startPolaroidSlideshow() {
  const imgEl = document.getElementById('polaroid-img');
  const textEl = document.getElementById('polaroid-text');
  
  // Tarik dari tab MATCH_HISTORY yang kolom URL Fotonya ga kosong
  const mvpList = mockData.MATCH_HISTORY 
    ? mockData.MATCH_HISTORY.filter(m => m['Foto POTM (URL)'] && m['Foto POTM (URL)'].trim() !== '')
    : [];

  if (mvpList.length === 0) {
    textEl.innerText = "Belum ada MVP terpilih!";
    return;
  }

  let photoIndex = 0;
  
  imgEl.src = mvpList[photoIndex]['Foto POTM (URL)'];
  textEl.innerText = `⭐ MVP ${mvpList[photoIndex]['Cabang']}: ${mvpList[photoIndex]['Player of the Match']}`;

  if (mvpList.length > 1) {
    setInterval(() => {
      imgEl.style.opacity = 0;
      textEl.style.opacity = 0;
      
      setTimeout(() => {
        photoIndex = (photoIndex + 1) % mvpList.length;
        imgEl.src = mvpList[photoIndex]['Foto POTM (URL)'];
        textEl.innerText = `⭐ MVP ${mvpList[photoIndex]['Cabang']}: ${mvpList[photoIndex]['Player of the Match']}`;
        
        imgEl.style.opacity = 1;
        textEl.style.opacity = 1;
      }, 500); 
    }, 6000);
  }
}
