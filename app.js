// ==========================================================================
// Agri-Slot Application Engine
// Multilingual, Dynamic Slot Management, KisanAI Assistant & View Controller
// ==========================================================================

let currentLang = 'en';
let currentCropId = 'rice';
let currentSlotFilter = 'All';

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  // Setup Language Selector Listener
  const langSelect = document.getElementById('langSelect');
  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      setLanguage(e.target.value);
    });
  }

  // Setup Navigation Tabs
  document.querySelectorAll('.tab-item').forEach(tab => {
    tab.addEventListener('click', () => {
      const viewName = tab.getAttribute('data-view');
      switchView(viewName);
    });
  });

  // Render initial datasets
  renderWeather();
  renderFeaturedCrops();
  renderDashboardStats();
  renderTasks();
  renderActiveSlots();
  renderServices();
  renderAnalytics();
  renderCropDetails(currentCropId);
  renderAIPromptChips();

  // Apply default language translations
  setLanguage(currentLang);
}

// Switch Active View
function switchView(viewName) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));

  const targetView = document.getElementById(`view-${viewName}`);
  const targetTab = document.querySelector(`.tab-item[data-view="${viewName}"]`);

  if (targetView) targetView.classList.add('active');
  if (targetTab) targetTab.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Multilingual i18n Translation Engine
function setLanguage(lang) {
  if (!i18nTranslations[lang]) return;
  currentLang = lang;

  const dict = i18nTranslations[lang];
  document.querySelectorAll('[data-i18n]').forEach(elem => {
    const key = elem.getAttribute('data-i18n');
    if (dict[key]) {
      if (elem.tagName === 'INPUT' && elem.hasAttribute('placeholder')) {
        elem.placeholder = dict[key];
      } else {
        elem.textContent = dict[key];
      }
    }
  });

  showToast(`Language set to ${getLanguageName(lang)}`);
}

function getLanguageName(code) {
  const names = { en: 'English', te: 'తెలుగు (Telugu)', hi: 'हिंदी (Hindi)', ta: 'தமிழ் (Tamil)', kn: 'ಕನ್ನಡ (Kannada)' };
  return names[code] || code;
}

// Render Weather Telemetry
function renderWeather() {
  const container = document.getElementById('weatherGrid');
  if (!container) return;

  const w = AgriData.weather;
  container.innerHTML = `
    <div class="weather-metric-box">
      <span class="weather-metric-label" data-i18n="tempLabel">Temp</span>
      <span class="weather-metric-val">🌡️ ${w.temp}</span>
    </div>
    <div class="weather-metric-box">
      <span class="weather-metric-label" data-i18n="humidityLabel">Humidity</span>
      <span class="weather-metric-val">💧 ${w.humidity}</span>
    </div>
    <div class="weather-metric-box">
      <span class="weather-metric-label" data-i18n="rainLabel">Rain Prob</span>
      <span class="weather-metric-val">🌧️ ${w.rainProb}</span>
    </div>
    <div class="weather-metric-box">
      <span class="weather-metric-label" data-i18n="soilMoistureLabel">Soil Moisture</span>
      <span class="weather-metric-val">🌱 ${w.soilMoisture}</span>
    </div>
  `;

  const adv = document.getElementById('weatherAdvisoryText');
  if (adv) adv.textContent = w.recommendation;
}

// Render Dashboard Summary Metrics
function renderDashboardStats() {
  const container = document.getElementById('dashboardMetricsGrid');
  if (!container) return;

  const stats = AgriData.dashboardStats;
  container.innerHTML = `
    <div class="dash-metric-card">
      <div class="dash-metric-icon">🌾</div>
      <div class="dash-metric-data">
        <p data-i18n="totalAcreage">Total Land</p>
        <h3>${stats.totalLand}</h3>
      </div>
    </div>
    <div class="dash-metric-card">
      <div class="dash-metric-icon">📅</div>
      <div class="dash-metric-data">
        <p data-i18n="activeSlots">Booked Slots</p>
        <h3>${stats.activeSlots} Slots</h3>
      </div>
    </div>
    <div class="dash-metric-card">
      <div class="dash-metric-icon">⏳</div>
      <div class="dash-metric-data">
        <p data-i18n="harvestCountdown">Next Harvest</p>
        <h3>${stats.harvestCountdown}</h3>
      </div>
    </div>
    <div class="dash-metric-card">
      <div class="dash-metric-icon">🚜</div>
      <div class="dash-metric-data">
        <p data-i18n="equipmentRented">Rented Tools</p>
        <h3>${stats.equipmentRented} Units</h3>
      </div>
    </div>
  `;
}

// Render Featured Crops
function renderFeaturedCrops() {
  const container = document.getElementById('featuredCropsContainer');
  if (!container) return;

  container.innerHTML = AgriData.featuredCrops.map(crop => `
    <div class="crop-card">
      <div class="crop-card-top">
        <div class="crop-card-title-group">
          <div class="crop-avatar">${crop.image}</div>
          <div>
            <div class="crop-name-heading">${crop.name}</div>
            <div class="crop-variety-sub">${crop.variety} • ${crop.acres} Acres (${crop.field})</div>
          </div>
        </div>
        <span class="badge badge-green">${crop.health}</span>
      </div>
      <div>
        <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
          <span style="color:var(--text-muted);">${crop.stage}</span>
          <span style="font-weight:700; color:var(--primary-green);">${crop.stagePercent}%</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: ${crop.stagePercent}%;"></div>
        </div>
      </div>
      <div style="display:flex; gap:8px; margin-top:4px;">
        <button class="btn-secondary" style="flex:1; padding:8px;" onclick="openCropDetails('${crop.id}')" data-i18n="viewDetails">View Details</button>
        <button class="btn-primary" style="flex:1; padding:8px;" onclick="openBookingModal('${crop.name}')" data-i18n="quickBookSlot">Book Slot</button>
      </div>
    </div>
  `).join('');
}

// Render Tasks
function renderTasks() {
  const container = document.getElementById('tasksListContainer');
  if (!container) return;

  container.innerHTML = AgriData.tasks.map(task => `
    <div class="task-item">
      <div class="task-left">
        <div class="task-checkbox ${task.status === 'Completed' ? 'checked' : ''}" onclick="toggleTaskStatus('${task.id}')">
          ${task.status === 'Completed' ? '✓' : ''}
        </div>
        <div class="task-info">
          <h4 style="${task.status === 'Completed' ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${task.title}</h4>
          <p>${task.field} • ${task.date} (${task.type})</p>
        </div>
      </div>
      <span class="badge ${task.status === 'Completed' ? 'badge-blue' : 'badge-amber'}">${task.status}</span>
    </div>
  `).join('');
}

function toggleTaskStatus(taskId) {
  const task = AgriData.tasks.find(t => t.id === taskId);
  if (task) {
    task.status = task.status === 'Completed' ? 'Upcoming' : 'Completed';
    renderTasks();
    showToast(`Task marked as ${task.status}`);
  }
}

// Render Saved Fields & Active Slots
function renderActiveSlots() {
  const container = document.getElementById('slotsGridContainer');
  if (!container) return;

  const filtered = AgriData.activeSlots.filter(s => {
    if (currentSlotFilter === 'All') return true;
    return s.status.toLowerCase() === currentSlotFilter.toLowerCase();
  });

  container.innerHTML = filtered.map(slot => `
    <div class="glass-card">
      <div class="card-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:22px;">🏷️</span>
          <div>
            <h4 style="font-size:15px; font-weight:700;">${slot.serviceName}</h4>
            <p style="font-size:11px; color:var(--text-muted);">${slot.id} • ${slot.field}</p>
          </div>
        </div>
        <span class="badge badge-green">${slot.status}</span>
      </div>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; font-size:12px; margin-bottom:12px; background:rgba(0,0,0,0.3); padding:10px; border-radius:var(--radius-md);">
        <div><span style="color:var(--text-muted);">Date:</span> <strong>${slot.date}</strong></div>
        <div><span style="color:var(--text-muted);">Time:</span> <strong>${slot.time}</strong></div>
        <div><span style="color:var(--text-muted);">Operator:</span> <strong>${slot.operator}</strong></div>
        <div><span style="color:var(--text-muted);">Cost:</span> <strong style="color:var(--accent-amber);">${slot.cost}</strong></div>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn-secondary" style="flex:1; padding:6px; font-size:12px;" onclick="cancelSlot('${slot.id}')">Cancel Slot</button>
        <button class="btn-primary" style="flex:1; padding:6px; font-size:12px;" onclick="openBookingModal('${slot.serviceName}')">Reschedule</button>
      </div>
    </div>
  `).join('');
}

function filterSlots(category) {
  currentSlotFilter = category;
  document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
  const btn = document.querySelector(`.filter-pill[data-filter="${category}"]`);
  if (btn) btn.classList.add('active');
  renderActiveSlots();
}

function cancelSlot(slotId) {
  AgriData.activeSlots = AgriData.activeSlots.filter(s => s.id !== slotId);
  renderActiveSlots();
  renderDashboardStats();
  showToast(`Slot ${slotId} cancelled successfully`);
}

// Render Services Marketplace
function renderServices() {
  const container = document.getElementById('servicesGridContainer');
  if (!container) return;

  container.innerHTML = AgriData.services.map(s => `
    <div class="glass-card">
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
        <div style="width:44px; height:44px; border-radius:var(--radius-md); background:rgba(34,197,94,0.15); display:flex; align-items:center; justify-content:center; font-size:24px;">${s.icon}</div>
        <div style="flex:1;">
          <h4 style="font-size:15px; font-weight:700;">${s.name}</h4>
          <span style="font-size:12px; font-weight:700; color:var(--accent-amber);">${s.rate}</span>
        </div>
      </div>
      <p style="font-size:12px; color:var(--text-muted); margin-bottom:12px;">${s.desc}</p>
      <button class="btn-primary" style="width:100%; padding:8px;" onclick="openBookingModal('${s.name}')">Reserve Slot Now</button>
    </div>
  `).join('');
}

// Render Crop Details View
function openCropDetails(cropId) {
  currentCropId = cropId;
  switchView('crops');
  renderCropDetails(cropId);
}

function renderCropDetails(cropId) {
  const crop = AgriData.featuredCrops.find(c => c.id === cropId) || AgriData.featuredCrops[0];
  const container = document.getElementById('cropDetailsContainer');
  if (!container) return;

  container.innerHTML = `
    <div class="glass-card">
      <div style="display:flex; align-items:center; gap:16px; margin-bottom:14px;">
        <div style="width:60px; height:60px; border-radius:var(--radius-lg); background:rgba(34,197,94,0.2); display:flex; align-items:center; justify-content:center; font-size:36px;">${crop.image}</div>
        <div>
          <h2 style="font-size:20px; font-weight:800;">${crop.name}</h2>
          <p style="font-size:12px; color:var(--text-muted);">${crop.variety} • ${crop.acres} Acres (${crop.field})</p>
          <span class="badge badge-green" style="margin-top:4px;">${crop.health}</span>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:12px; margin-bottom:16px; background:rgba(0,0,0,0.3); padding:12px; border-radius:var(--radius-md);">
        <div><span style="color:var(--text-muted);">Sowing Date:</span> <strong>${crop.sowingDate}</strong></div>
        <div><span style="color:var(--text-muted);">Est. Harvest:</span> <strong>${crop.harvestDate}</strong></div>
        <div><span style="color:var(--text-muted);">Water Demand:</span> <strong>${crop.waterRequirement}</strong></div>
        <div><span style="color:var(--text-muted);">Pest Status:</span> <strong style="color:var(--primary-green);">${crop.pestRisk}</strong></div>
      </div>

      <h3 class="card-title" style="margin-bottom:12px;" data-i18n="growthTimelineTitle">5-Stage Growth Cycle</h3>
      <div class="stages-timeline">
        <div class="timeline-step completed">
          <div class="timeline-bullet"></div>
          <div class="timeline-step-title" data-i18n="stageSowing">Sowing & Germination</div>
          <div class="timeline-step-desc">Completed on ${crop.sowingDate} with certified seeds.</div>
        </div>
        <div class="timeline-step completed">
          <div class="timeline-bullet"></div>
          <div class="timeline-step-title" data-i18n="stageVegetative">Vegetative Growth</div>
          <div class="timeline-step-desc">NPK 19:19:19 bio-fertilizer applied via drone slot.</div>
        </div>
        <div class="timeline-step active">
          <div class="timeline-bullet"></div>
          <div class="timeline-step-title" data-i18n="stageFlowering">Flowering & Podding</div>
          <div class="timeline-step-desc">Currently in progress (${crop.stagePercent}% complete). Maintain regular micro-irrigation.</div>
        </div>
        <div class="timeline-step">
          <div class="timeline-bullet"></div>
          <div class="timeline-step-title" data-i18n="stageMaturation">Maturation Stage</div>
          <div class="timeline-step-desc">Expected in 14 days. Reserve harvester slot early.</div>
        </div>
        <div class="timeline-step">
          <div class="timeline-bullet"></div>
          <div class="timeline-step-title" data-i18n="stageHarvest">Harvesting & Sorting</div>
          <div class="timeline-step-desc">Target harvest date: ${crop.harvestDate}.</div>
        </div>
      </div>
    </div>
  `;
}

// Render Analytics
function renderAnalytics() {
  const container = document.getElementById('analyticsContainer');
  if (!container) return;

  const a = AgriData.analytics;
  container.innerHTML = `
    <div class="glass-card">
      <h3 class="card-title" style="margin-bottom:16px;" data-i18n="analyticsTitle">Farm Yield & Financial Analytics</h3>
      <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:12px; margin-bottom:16px;">
        <div class="weather-metric-box">
          <span class="weather-metric-label" data-i18n="yieldProjected">Projected Yield</span>
          <span class="weather-metric-val" style="color:var(--primary-green);">${a.projectedYield}</span>
        </div>
        <div class="weather-metric-box">
          <span class="weather-metric-label" data-i18n="revenueLabel">Est. Revenue</span>
          <span class="weather-metric-val" style="color:var(--accent-amber);">${a.estimatedRevenue}</span>
        </div>
        <div class="weather-metric-box">
          <span class="weather-metric-label" data-i18n="expenditureLabel">Expenses</span>
          <span class="weather-metric-val" style="color:var(--accent-orange);">${a.totalExpenses}</span>
        </div>
        <div class="weather-metric-box">
          <span class="weather-metric-label">Net Profit</span>
          <span class="weather-metric-val" style="color:var(--primary-green);">${a.netProfit}</span>
        </div>
      </div>
    </div>
  `;
}

// KisanAI Assistant Drawer Logic
function toggleAIDrawer() {
  const drawer = document.getElementById('aiDrawer');
  if (drawer) drawer.classList.toggle('active');
}

function renderAIPromptChips() {
  const container = document.getElementById('aiPromptChips');
  if (!container) return;

  container.innerHTML = AgriData.aiPrompts.map(p => `
    <div class="prompt-chip" onclick="sendAIPrompt('${p}')">${p}</div>
  `).join('');
}

function sendAIPrompt(text) {
  const input = document.getElementById('aiInput');
  const query = text || (input ? input.value : '');
  if (!query.trim()) return;

  if (input) input.value = '';

  const messagesContainer = document.getElementById('aiMessagesContainer');
  if (!messagesContainer) return;

  // Append User message
  messagesContainer.innerHTML += `
    <div class="ai-message-bubble user">${query}</div>
  `;

  // Generate Assistant response
  setTimeout(() => {
    const response = getAIResponse(query);
    messagesContainer.innerHTML += `
      <div class="ai-message-bubble assistant">${response}</div>
    `;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, 600);

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function getAIResponse(query) {
  const q = query.toLowerCase();
  if (q.includes('slot') || q.includes('book') || q.includes('machinery')) {
    return "💡 <strong>Slot Recommendation:</strong> For optimal field efficiency, book tractor tillage between 06:00 AM - 09:00 AM before soil temperature rises. Would you like me to auto-fill a drone spraying slot for tomorrow?";
  }
  if (q.includes('paddy') || q.includes('rice') || q.includes('spray')) {
    return "🌾 <strong>Paddy Agronomy Advice:</strong> During grain filling stage, apply Zinc Sulfate (2g/L) via drone slot. Weather telemetry shows light winds tomorrow morning, ideal for drone spraying.";
  }
  if (q.includes('pest') || q.includes('cotton') || q.includes('bollworm')) {
    return "🐛 <strong>Pest Management:</strong> For Bt Cotton bollworm alert, install pheromone traps (5/acre) and consider a neem-based formulation spray slot in East Field Plot-B.";
  }
  return "🤖 <strong>KisanAI Advice:</strong> Your overall soil moisture is optimal at 72%. All active crop schedules are on track. You can reserve equipment slots anytime directly from the Services tab.";
}

// Modal Controllers
function openBookingModal(serviceName = '') {
  const modal = document.getElementById('modalBookSlot');
  if (modal) {
    modal.classList.add('active');
    const input = document.getElementById('modalServiceName');
    if (input && serviceName) input.value = serviceName;
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

function handleSlotBookingSubmit(e) {
  e.preventDefault();
  const service = document.getElementById('modalServiceName').value || 'Equipment Slot';
  const date = document.getElementById('modalSlotDate').value || 'Aug 20, 2026';
  const time = document.getElementById('modalSlotTime').value || '07:00 AM - 09:00 AM';
  const field = document.getElementById('modalFieldName').value || 'North Field Plot-A';

  const newSlot = {
    id: `SLOT-${Math.floor(1000 + Math.random() * 9000)}`,
    serviceName: service,
    category: 'Booked',
    date: date,
    time: time,
    field: field,
    operator: 'Verified Partner',
    status: 'Confirmed',
    cost: '₹1,500',
    badgeColor: '#22C55E'
  };

  AgriData.activeSlots.unshift(newSlot);
  AgriData.dashboardStats.activeSlots++;

  renderActiveSlots();
  renderDashboardStats();
  closeModal('modalBookSlot');
  showToast(`✅ Slot reserved successfully for ${service}!`);
}

function handleAddTaskSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('taskTitleInput').value || 'Field Activity';
  const field = document.getElementById('taskFieldInput').value || 'North Field Plot-A';
  const date = document.getElementById('taskDateInput').value || 'Aug 21';

  const newTask = {
    id: `task-${Date.now()}`,
    cropId: 'rice',
    title: title,
    date: date,
    field: field,
    type: 'Scheduled',
    status: 'Upcoming',
    priority: 'Medium'
  };

  AgriData.tasks.unshift(newTask);
  renderTasks();
  closeModal('modalAddTask');
  showToast(`✅ Task "${title}" scheduled successfully!`);
}

// Toast Notifications
function showToast(message) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.3s ease-in reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
