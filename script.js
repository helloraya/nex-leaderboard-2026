// --- 1. DATA DARI GOOGLE SHEETS (API) ---
// Masukin URL hasil Deploy dari Google Apps Script lo ke dalam tanda kutip di bawah:
const GAS_URL = 'https://script.google.com/macros/s/AKfycbw4wFlZj816RRjcX9xmQrzjhQv-Hte_kOyi1j1rpQvM-goLSoZA5WfFkXK_7kI5uHXnmg/exec';

// Variabel ini disiapin kosong dulu, nanti otomatis keisi sama data dari Sheets
let mockData = {}; 

async function fetchLeaderboardData() {
  try {
    // Ngasih tau user kalo data lagi dimuat (biar layarnya nggak blank)
    document.getElementById('leaderboard-container').innerHTML = '<h2 class="text-2xl text-forest font-bold text-center w-full">Sabar cuy, lagi loading data... ⏳</h2>';

    // Proses narik data dari link GAS
    const response = await fetch(GAS_URL);
    const data = await response.json();
    
    // Timpa variabel kosong tadi dengan data asli dari Sheets
    mockData = data;

    // Kalo data udah masuk, baru jalanin animasi dan nampilin kartu leaderboard-nya
    renderLeaderboard();
    startTypewriter();
    startPolaroidSlideshow();
    
  } catch (error) {
    console.error('Waduh, error ngambil datanya:', error);
    document.getElementById('leaderboard-container').innerHTML = '<h2 class="text-2xl text-red font-bold text-center w-full">Gagal muat data! Cek lagi link GAS-nya ya. ☠️</h2>';
  }
}

// Bikin webnya langsung otomatis narik data pas pertama kali dibuka
window.onload = () => {
  fetchLeaderboardData(); 
};

// --- 2. RENDER LEADERBOARD ---
function renderLeaderboard() {
  const container = document.getElementById('leaderboard-container');
  container.innerHTML = '';
  
  // Ambil data langsung dari key hasil looping GAS (GLOBAL_LEADERBOARD)
  const sortedClasses = [...mockData.GLOBAL_LEADERBOARD].sort((a, b) => b.Points - a.Points);

  sortedClasses.forEach((cls, index) => {
    // PASTIIN NAMA KOLOM DI SHEETS LO PERSIS SAMA (Case sensitive!)
    // Misal di Sheet kolomnya "Name", "Points", "Logo"
    const cardHTML = `
      <div class="bg-white border-4 border-forest scrapbook-shadow p-4 cursor-pointer relative hover:bg-orange/10" onclick="openClassModal('${cls.Name}')">
        <div class="flex items-center gap-4">
          <div class="text-4xl font-bold text-red border-r-2 border-dashed border-gray-300 pr-4">#${index + 1}</div>
          <div class="text-3xl">${cls.Logo}</div>
          <div class="flex-1">
            <h3 class="text-xl font-extrabold text-forest uppercase">${cls.Name}</h3>
            <div class="text-sm font-helvetica text-gray-600">Total Points: <span class="font-bold text-orange">${cls.Points}</span></div>
          </div>
        </div>
      </div>
    `;
    container.innerHTML += cardHTML;
  });
}

// --- 3. MODAL LOGIC (Roster, History, Supporter) ---
const classModal = document.getElementById('class-modal');

function openClassModal(className) {
  document.getElementById('modal-classname').innerText = className;
  
  // Render Roster
  const rosterDiv = document.getElementById('modal-roster');
  rosterDiv.innerHTML = '';
  const rosterData = mockData.roster[className] || mockData.roster['8A Nania']; // Fallback for mockup
  
  for (const [sport, players] of Object.entries(rosterData)) {
    let playersHTML = '';
    if (sport === 'Kasti') {
      playersHTML = `<p class="font-extrabold text-red text-lg italic">"MASSIVE DEPLOYMENT: FULL SQUAD" 🚀</p>`;
    } else if (sport === 'Voli') {
      playersHTML = `<p class="font-helvetica text-gray-700">${players.slice(0,6).join(', ')}</p>`;
    } else {
      playersHTML = `<p class="font-helvetica text-gray-700">${players.join(', ')}</p>`;
    }
    rosterDiv.innerHTML += `
      <div class="mb-3">
        <h4 class="font-bold text-orange border-b border-orange/30">${sport}</h4>
        ${playersHTML}
      </div>
    `;
  }

  // Render History
  const historyDiv = document.getElementById('modal-history');
  historyDiv.innerHTML = '';
  const historyData = mockData.matchHistory[className] || mockData.matchHistory['8A Nania'];
  historyData.forEach(match => {
    historyDiv.innerHTML += `
      <div class="flex justify-between items-center border-b border-gray-300 py-2">
        <div><span class="font-bold text-forest">${match.sport}</span> vs ${match.vs}</div>
        <div class="text-right">
          <span class="font-bold ${match.result === 'WIN' ? 'text-forest' : 'text-red'}">${match.result} (${match.score})</span>
          <span class="ml-2 text-orange font-mono">${match.points}</span>
        </div>
      </div>
    `;
  });

  // Render Supporter (Mockup generic)
  document.getElementById('modal-supporter').innerHTML = `<p class="text-gray-600 italic">No specific infractions/logs recorded for this class yet. Keep it clean!</p>`;

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

// --- 4. TABS & SCHEDULES ---
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
  
  if(mockData.schedules[sport]) {
    mockData.schedules[sport].forEach(sch => {
      list.innerHTML += `<li class="border-b border-gray-200 py-1">⏰ ${sch}</li>`;
    });
  } else {
    list.innerHTML = `<li>No match scheduled today.</li>`;
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
  let logIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function type() {
    const currentText = mockData.supporterLogs[logIndex];
    if (isDeleting) {
      logEl.innerText = currentText.substring(0, charIndex - 1);
      charIndex--;
    } else {
      logEl.innerText = currentText.substring(0, charIndex + 1);
      charIndex++;
    }

    let typeSpeed = isDeleting ? 30 : 100;

    if (!isDeleting && charIndex === currentText.length) {
      typeSpeed = 2000; // Pause at end
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      logIndex = (logIndex + 1) % mockData.supporterLogs.length;
      typeSpeed = 500;
    }
    setTimeout(type, typeSpeed);
  }
  type();
}

function startPolaroidSlideshow() {
  const imgEl = document.getElementById('polaroid-img');
  const textEl = document.getElementById('polaroid-text');
  let photoIndex = 0;

  setInterval(() => {
    // Fade out
    imgEl.style.opacity = 0;
    textEl.style.opacity = 0;
    
    setTimeout(() => {
      photoIndex = (photoIndex + 1) % mockData.mvpPhotos.length;
      imgEl.src = mockData.mvpPhotos[photoIndex].url;
      textEl.innerText = mockData.mvpPhotos[photoIndex].text;
      
      // Fade in
      imgEl.style.opacity = 1;
      textEl.style.opacity = 1;
    }, 500); // Wait for fade out to complete
  }, 6000); // Ganti setiap 6 detik
}
