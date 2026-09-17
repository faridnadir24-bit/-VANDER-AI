// ============================================================
// VANDER-AI — Smart Adsorbent Monitoring System
// Main Application JavaScript
// ============================================================

(function() {
  'use strict';

  // ============ STATE ============
  const state = {
    startTime: Date.now(),
    totalVolumeIn: 0,
    totalVolumeOut: 0,
    adsorptionCapacity: 85,
    notifications: [],
    notifCount: 0,
    isEmergency: false,
    isPaused: false,
    audioEnabled: false,
    capacityHistory: [],
    thresholds: {
      phMin: 6.5,
      phMax: 8.5,
      turbidity: 25,
      ec: 500,
      flowDrop: 15
    },
    input: {
      flow: 75,
      ph: 3.5,
      turbidity: 420,
      ec: 3200
    },
    output: {
      flow: 70,
      ph: 7.0,
      turbidity: 12,
      ec: 380
    },
    charts: {},
    chartData: {
      labels: [],
      phIn: [], phOut: [],
      turbIn: [], turbOut: [],
      ecIn: [], ecOut: [],
      flowIn: [], flowOut: []
    },
    maxDataPoints: 20
  };

  // ============ UTILITIES ============
  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function formatNumber(num, decimals = 1) {
    return Number(num).toFixed(decimals);
  }

  function formatCurrency(num) {
    return 'Rp ' + Math.round(num).toLocaleString('id-ID');
  }

  function getTimeString() {
    return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  function getShortTime() {
    return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }

  // ============ CLOCK ============
  function updateClock() {
    const now = new Date();
    const options = { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    };
    document.getElementById('clock').textContent = now.toLocaleDateString('id-ID', options);
  }

  // ============ WATER BEAKER ANIMATIONS ============
  function createParticles() {
    const container = document.getElementById('dirtyParticles');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 15; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = rand(3, 8);
      const colors = [
        'rgba(120, 53, 15, 0.7)',
        'rgba(87, 32, 7, 0.6)',
        'rgba(60, 20, 5, 0.5)',
        'rgba(139, 69, 19, 0.6)',
        'rgba(80, 40, 10, 0.7)'
      ];
      p.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        background: ${colors[Math.floor(rand(0, colors.length))]};
        left: ${rand(10, 85)}%;
        top: ${rand(10, 85)}%;
        animation-duration: ${rand(3, 7)}s;
        animation-delay: ${rand(0, 3)}s;
      `;
      container.appendChild(p);
    }
  }

  function createSparkles() {
    const container = document.getElementById('cleanSparkles');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 10; i++) {
      const s = document.createElement('div');
      s.className = 'sparkle';
      s.style.cssText = `
        left: ${rand(10, 90)}%;
        top: ${rand(10, 90)}%;
        animation-delay: ${rand(0, 2)}s;
        animation-duration: ${rand(1.5, 3)}s;
      `;
      container.appendChild(s);
    }
  }

  function createBubbles() {
    ['dirtyBubbles', 'cleanBubbles'].forEach(containerId => {
      const container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = '';
      const count = containerId === 'dirtyBubbles' ? 8 : 12;
      for (let i = 0; i < count; i++) {
        const b = document.createElement('div');
        b.className = 'bubble';
        const size = rand(4, 12);
        b.style.cssText = `
          width: ${size}px;
          height: ${size}px;
          left: ${rand(5, 90)}%;
          bottom: ${rand(5, 40)}%;
          animation-duration: ${rand(3, 8)}s;
          animation-delay: ${rand(0, 5)}s;
        `;
        container.appendChild(b);
      }
    });
  }

  // ============ SIMULATED DATA GENERATION ============
  function generateSensorData() {
    // Input sensors (industrial wastewater - generally stable with small fluctuations)
    state.input.flow = clamp(state.input.flow + rand(-2, 2), 60, 95);
    state.input.ph = clamp(state.input.ph + rand(-0.15, 0.15), 2.5, 5.0);
    state.input.turbidity = clamp(state.input.turbidity + rand(-15, 15), 300, 550);
    state.input.ec = clamp(state.input.ec + rand(-80, 80), 2200, 4500);

    // Output sensors (filtered water - should be much better)
    // As adsorption capacity decreases, output quality gets slightly worse
    const qualityFactor = state.adsorptionCapacity / 100;
    
    state.output.flow = clamp(state.input.flow * rand(0.88, 0.96), 40, 95);
    state.output.ph = clamp(6.5 + (1.0 * qualityFactor) + rand(-0.2, 0.2), 5.5, 9.0);
    state.output.turbidity = clamp((5 + (1 - qualityFactor) * 40) + rand(-3, 3), 2, 80);
    state.output.ec = clamp((200 + (1 - qualityFactor) * 400) + rand(-20, 20), 100, 1200);

    // Adsorption capacity slowly decreases
    state.adsorptionCapacity = clamp(state.adsorptionCapacity - rand(0.02, 0.08), 0, 100);

    // Volume tracking (flow is L/hr, update every 3 seconds = 3/3600 hours)
    const timeIncrement = 3 / 3600;
    state.totalVolumeIn += state.input.flow * timeIncrement;
    state.totalVolumeOut += state.output.flow * timeIncrement;
  }

  // ============ UPDATE DOM ============
  function flashElement(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('flash');
    void el.offsetWidth; // trigger reflow
    el.classList.add('flash');
  }

  function updateSensorPanels() {
    // Input panel
    document.getElementById('inputFlow').textContent = formatNumber(state.input.flow, 1);
    document.getElementById('inputPH').textContent = formatNumber(state.input.ph, 1);
    document.getElementById('inputTurbidity').textContent = formatNumber(state.input.turbidity, 0);
    document.getElementById('inputEC').textContent = formatNumber(state.input.ec, 0);

    // Output panel
    document.getElementById('outputFlow').textContent = formatNumber(state.output.flow, 1);
    document.getElementById('outputPH').textContent = formatNumber(state.output.ph, 1);
    document.getElementById('outputTurbidity').textContent = formatNumber(state.output.turbidity, 0);
    document.getElementById('outputEC').textContent = formatNumber(state.output.ec, 0);

    // Water viz params
    document.getElementById('dirtyPH').textContent = formatNumber(state.input.ph, 1);
    document.getElementById('dirtyNTU').textContent = formatNumber(state.input.turbidity, 0);
    document.getElementById('cleanPH').textContent = formatNumber(state.output.ph, 1);
    document.getElementById('cleanNTU').textContent = formatNumber(state.output.turbidity, 0);

    // Flash animation on key output values
    ['outputPH', 'outputTurbidity', 'outputEC', 'outputFlow'].forEach(flashElement);
  }

  function updateMetricCards() {
    document.getElementById('metricRecycled').textContent = formatNumber(state.totalVolumeOut, 1) + ' L';
    
    const efficiency = state.totalVolumeIn > 0 
      ? ((state.totalVolumeOut / state.totalVolumeIn) * 100) 
      : 0;
    document.getElementById('metricEfficiency').textContent = formatNumber(efficiency, 1) + '%';

    // Uptime
    const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    const hrs = String(Math.floor(elapsed / 3600)).padStart(2, '0');
    const mins = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
    const secs = String(elapsed % 60).padStart(2, '0');
    document.getElementById('metricUptime').textContent = `${hrs}:${mins}:${secs}`;

    document.getElementById('metricCapacity').textContent = formatNumber(state.adsorptionCapacity, 1) + '%';

    // Savings: assume commercial water = Rp 15/liter
    const savings = state.totalVolumeOut * 15;
    document.getElementById('metricSavings').textContent = formatCurrency(savings);

    // CO2: assume 0.3 kg CO2 per 1000L of water treatment avoided
    const co2 = (state.totalVolumeOut / 1000) * 0.3;
    document.getElementById('metricCO2').textContent = formatNumber(co2, 3) + ' kg';
  }

  // ============ AI MODULE: BREAKTHROUGH PREDICTOR ============
  function updateBreakthroughPredictor() {
    const capacity = state.adsorptionCapacity;
    const fill = document.getElementById('capacityFill');
    const percent = document.getElementById('capacityPercent');
    const countdown = document.getElementById('countdownValue');
    const statusEl = document.getElementById('breakthroughStatus');

    fill.style.width = capacity + '%';
    percent.textContent = formatNumber(capacity, 1) + '%';

    // Remove old status classes
    fill.classList.remove('warning', 'critical');
    statusEl.classList.remove('warning', 'critical');

    if (capacity > 50) {
      statusEl.textContent = 'OPTIMAL';
      statusEl.style.background = 'rgba(16, 185, 129, 0.12)';
      statusEl.style.color = '#059669';
    } else if (capacity > 25) {
      statusEl.textContent = 'WARNING';
      statusEl.classList.add('warning');
      fill.classList.add('warning');
    } else {
      statusEl.textContent = 'CRITICAL';
      statusEl.classList.add('critical');
      fill.classList.add('critical');
    }

    // Estimate time until full saturation (0%)
    // Average decrease rate: ~0.05% per 3 seconds = 1% per minute = 60% per hour
    // More realistic: ~0.05% per 3s = 1 per minute
    const ratePerMinute = 1.0; // approximate
    const minutesLeft = capacity / ratePerMinute;
    const hoursLeft = Math.floor(minutesLeft / 60);
    const minsLeft = Math.floor(minutesLeft % 60);
    countdown.textContent = `${hoursLeft} jam ${minsLeft} menit`;

    // Dynamic Kinetic Parameter updates
    const kTau = document.getElementById('kParamTau');
    const kMTZ = document.getElementById('kParamMTZ');
    if (kTau) kTau.textContent = `${formatNumber((capacity / 100) * 58, 1)} jam`;
    if (kMTZ) kMTZ.textContent = `${formatNumber(15 + ((100 - capacity) / 100) * 12, 1)} cm`;

    // Update capacity history
    state.capacityHistory.push(capacity);
    if (state.capacityHistory.length > 20) state.capacityHistory.shift();
  }

  // ============ AI MODULE: MASS BALANCE ============
  function updateMassBalance() {
    document.getElementById('volumeIn').textContent = formatNumber(state.totalVolumeIn, 2) + ' L';
    document.getElementById('volumeOut').textContent = formatNumber(state.totalVolumeOut, 2) + ' L';

    const volEff = state.totalVolumeIn > 0 
      ? ((state.totalVolumeOut / state.totalVolumeIn) * 100) 
      : 0;
    document.getElementById('volEfficiency').textContent = formatNumber(volEff, 1) + '%';

    // Clogging detection
    const flowDrop = ((state.input.flow - state.output.flow) / state.input.flow) * 100;
    const cloggingAlert = document.getElementById('cloggingAlert');
    if (flowDrop > state.thresholds.flowDrop) {
      cloggingAlert.classList.add('visible');
    } else {
      cloggingAlert.classList.remove('visible');
    }
  }

  // ============ AI MODULE: QUALITY ASSURANCE ============
  function updateQualityAssurance() {
    const ph = state.output.ph;
    const turb = state.output.turbidity;
    const ec = state.output.ec;

    let isEmergency = false;

    // pH check
    const qaPH = document.getElementById('qaPH');
    if (ph >= state.thresholds.phMin && ph <= state.thresholds.phMax) {
      qaPH.textContent = 'NOMINAL';
      qaPH.style.color = '#059669';
    } else {
      qaPH.textContent = 'OUT-OF-SPEC';
      qaPH.style.color = '#dc2626';
      isEmergency = true;
    }

    // Turbidity check
    const qaTurb = document.getElementById('qaTurbidity');
    if (turb <= state.thresholds.turbidity) {
      qaTurb.textContent = 'NOMINAL';
      qaTurb.style.color = '#059669';
    } else {
      qaTurb.textContent = 'OUT-OF-SPEC';
      qaTurb.style.color = '#dc2626';
      isEmergency = true;
    }

    // EC check
    const qaEC = document.getElementById('qaEC');
    if (ec <= state.thresholds.ec) {
      qaEC.textContent = 'NOMINAL';
      qaEC.style.color = '#059669';
    } else {
      qaEC.textContent = 'OUT-OF-SPEC';
      qaEC.style.color = '#dc2626';
      isEmergency = true;
    }

    // Valve status
    const valveLight = document.getElementById('valveLight');
    const valveLabel = document.getElementById('valveLabel');
    const valveDetail = document.getElementById('valveDetail');
    const banner = document.getElementById('emergencyBanner');

    if (isEmergency && !state.isEmergency) {
      // Transition to emergency
      valveLight.className = 'valve-light red';
      valveLabel.textContent = 'Katup menuju sungai: DITUTUP';
      valveDetail.textContent = 'Air dialirkan kembali ke tangki retensi';
      banner.classList.add('visible');
      addNotification('emergency', 'EMERGENCY: Kualitas output melewati ambang batas! Katup otomatis ditutup.');
      state.isEmergency = true;
      soundEmergency();
    } else if (!isEmergency && state.isEmergency) {
      // Recovery from emergency
      valveLight.className = 'valve-light green';
      valveLabel.textContent = 'Katup menuju sungai: TERBUKA';
      valveDetail.textContent = 'Air output memenuhi standar baku mutu';
      banner.classList.remove('visible');
      addNotification('info', 'Kualitas output kembali normal. Katup terbuka kembali.');
      state.isEmergency = false;
      soundSuccess();
    }
  }

  // ============ AI MODULE: ECO-EFFICIENCY ============
  function updateEcoEfficiency() {
    document.getElementById('ecoWater').textContent = formatNumber(state.totalVolumeOut, 1);
    document.getElementById('ecoCost').textContent = formatCurrency(state.totalVolumeOut * 15);
    document.getElementById('ecoCO2').textContent = formatNumber((state.totalVolumeOut / 1000) * 0.3, 3);
  }

  function updateRemovalEfficiency() {
    // Turbidity removal
    const turbRemoval = state.input.turbidity > 0
      ? ((state.input.turbidity - state.output.turbidity) / state.input.turbidity * 100)
      : 0;
    const turbEl = document.getElementById('removalTurbidity');
    const turbPct = document.getElementById('removalTurbidityPct');
    if (turbEl && turbPct) {
      turbEl.style.width = clamp(turbRemoval, 0, 100) + '%';
      turbPct.textContent = formatNumber(clamp(turbRemoval, 0, 100), 1) + '%';
    }

    // EC removal
    const ecRemoval = state.input.ec > 0
      ? ((state.input.ec - state.output.ec) / state.input.ec * 100)
      : 0;
    const ecEl = document.getElementById('removalEC');
    const ecPct = document.getElementById('removalECPct');
    if (ecEl && ecPct) {
      ecEl.style.width = clamp(ecRemoval, 0, 100) + '%';
      ecPct.textContent = formatNumber(clamp(ecRemoval, 0, 100), 1) + '%';
    }

    // pH adjustment (how close output is to neutral 7.0)
    const phTarget = 7.0;
    const phInputDist = Math.abs(state.input.ph - phTarget);
    const phOutputDist = Math.abs(state.output.ph - phTarget);
    const phAdj = phInputDist > 0
      ? ((phInputDist - phOutputDist) / phInputDist * 100)
      : 100;
    const phEl = document.getElementById('removalPH');
    const phPct = document.getElementById('removalPHPct');
    if (phEl && phPct) {
      phEl.style.width = clamp(phAdj, 0, 100) + '%';
      phPct.textContent = formatNumber(clamp(phAdj, 0, 100), 1) + '%';
    }
  }

  // ============ GAUGE METERS ============
  function updateGauges() {
    // Gauge arc total length = pi * 80 (radius) = ~251.2
    const arcLength = 251.2;

    // pH Gauge (scale 0-14)
    const phFraction = clamp(state.output.ph / 14, 0, 1);
    const phOffset = arcLength - (phFraction * arcLength);
    document.getElementById('gaugePHArc').setAttribute('stroke-dashoffset', phOffset);
    document.getElementById('gaugePHText').textContent = formatNumber(state.output.ph, 1);

    // Turbidity Gauge (scale 0-500)
    const turbFraction = clamp(state.output.turbidity / 500, 0, 1);
    const turbOffset = arcLength - (turbFraction * arcLength);
    document.getElementById('gaugeTurbidityArc').setAttribute('stroke-dashoffset', turbOffset);
    document.getElementById('gaugeTurbidityText').textContent = formatNumber(state.output.turbidity, 0);

    // EC Gauge (scale 0-5000)
    const ecFraction = clamp(state.output.ec / 5000, 0, 1);
    const ecOffset = arcLength - (ecFraction * arcLength);
    document.getElementById('gaugeECArc').setAttribute('stroke-dashoffset', ecOffset);
    document.getElementById('gaugeECText').textContent = formatNumber(state.output.ec, 0);
  }

  // ============ CHARTS (Chart.js) ============
  function initCharts() {
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 500 },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: { family: 'Inter', size: 11 },
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 16
          }
        },
        tooltip: {
          backgroundColor: 'rgba(14, 20, 36, 0.95)', borderColor: 'rgba(148, 163, 184, 0.2)', borderWidth: 1, titleColor: '#f8fafc', bodyColor: '#cbd5e1',
          titleFont: { family: 'Inter', size: 12 },
          bodyFont: { family: 'Inter', size: 11 },
          cornerRadius: 8,
          padding: 10
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(148, 163, 184, 0.08)' },
          ticks: { font: { family: 'Inter', size: 10 }, color: '#94a3b8', maxRotation: 0 }
        },
        y: {
          grid: { color: 'rgba(148, 163, 184, 0.08)' },
          ticks: { font: { family: 'Inter', size: 10 }, color: '#94a3b8' }
        }
      },
      elements: {
        line: { tension: 0.4, borderWidth: 2 },
        point: { radius: 2, hoverRadius: 5 }
      }
    };

    // pH Chart
    state.charts.ph = new Chart(document.getElementById('chartPH'), {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          { label: 'Input pH', data: [], borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true },
          { label: 'Output pH', data: [], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true }
        ]
      },
      options: { ...commonOptions, scales: { ...commonOptions.scales, y: { ...commonOptions.scales.y, min: 0, max: 14, title: { display: true, text: 'pH', font: { family: 'Inter', size: 11 } } } } }
    });

    // Turbidity Chart
    state.charts.turbidity = new Chart(document.getElementById('chartTurbidity'), {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          { label: 'Input NTU', data: [], borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true },
          { label: 'Output NTU', data: [], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true }
        ]
      },
      options: { ...commonOptions, scales: { ...commonOptions.scales, y: { ...commonOptions.scales.y, min: 0, title: { display: true, text: 'NTU', font: { family: 'Inter', size: 11 } } } } }
    });

    // EC Chart
    state.charts.ec = new Chart(document.getElementById('chartEC'), {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          { label: 'Input µS/cm', data: [], borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true },
          { label: 'Output µS/cm', data: [], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true }
        ]
      },
      options: { ...commonOptions, scales: { ...commonOptions.scales, y: { ...commonOptions.scales.y, min: 0, title: { display: true, text: 'µS/cm', font: { family: 'Inter', size: 11 } } } } }
    });

    // Flow Chart
    state.charts.flow = new Chart(document.getElementById('chartFlow'), {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          { label: 'Input L/jam', data: [], borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true },
          { label: 'Output L/jam', data: [], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true }
        ]
      },
      options: { ...commonOptions, scales: { ...commonOptions.scales, y: { ...commonOptions.scales.y, min: 0, title: { display: true, text: 'L/jam', font: { family: 'Inter', size: 11 } } } } }
    });

    // Capacity mini chart
    state.charts.capacity = new Chart(document.getElementById('capacityChart'), {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Kapasitas %',
          data: [],
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true, backgroundColor: 'rgba(15,23,42,0.9)', cornerRadius: 6 }
        },
        scales: {
          x: { display: false },
          y: { min: 0, max: 100, display: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 9 }, color: '#94a3b8' } }
        }
      }
    });
  }

  function updateCharts() {
    const timeLabel = getShortTime();
    const cd = state.chartData;

    cd.labels.push(timeLabel);
    cd.phIn.push(state.input.ph);
    cd.phOut.push(state.output.ph);
    cd.turbIn.push(state.input.turbidity);
    cd.turbOut.push(state.output.turbidity);
    cd.ecIn.push(state.input.ec);
    cd.ecOut.push(state.output.ec);
    cd.flowIn.push(state.input.flow);
    cd.flowOut.push(state.output.flow);

    // Trim to max points
    if (cd.labels.length > state.maxDataPoints) {
      cd.labels.shift();
      cd.phIn.shift(); cd.phOut.shift();
      cd.turbIn.shift(); cd.turbOut.shift();
      cd.ecIn.shift(); cd.ecOut.shift();
      cd.flowIn.shift(); cd.flowOut.shift();
    }

    // Update pH chart
    state.charts.ph.data.labels = [...cd.labels];
    state.charts.ph.data.datasets[0].data = [...cd.phIn];
    state.charts.ph.data.datasets[1].data = [...cd.phOut];
    state.charts.ph.update('none');

    // Update turbidity chart
    state.charts.turbidity.data.labels = [...cd.labels];
    state.charts.turbidity.data.datasets[0].data = [...cd.turbIn];
    state.charts.turbidity.data.datasets[1].data = [...cd.turbOut];
    state.charts.turbidity.update('none');

    // Update EC chart
    state.charts.ec.data.labels = [...cd.labels];
    state.charts.ec.data.datasets[0].data = [...cd.ecIn];
    state.charts.ec.data.datasets[1].data = [...cd.ecOut];
    state.charts.ec.update('none');

    // Update flow chart
    state.charts.flow.data.labels = [...cd.labels];
    state.charts.flow.data.datasets[0].data = [...cd.flowIn];
    state.charts.flow.data.datasets[1].data = [...cd.flowOut];
    state.charts.flow.update('none');

    // Update capacity mini chart
    const capLabels = state.capacityHistory.map((_, i) => i.toString());
    state.charts.capacity.data.labels = capLabels;
    state.charts.capacity.data.datasets[0].data = [...state.capacityHistory];
    state.charts.capacity.update('none');
  }

  // ============ NOTIFICATIONS ============
  function addNotification(type, message) {
    const time = getTimeString();
    state.notifications.unshift({ type, message, time });
    if (state.notifications.length > 50) state.notifications.pop();
    state.notifCount++;

    renderNotifications();
  }

  function renderNotifications() {
    const list = document.getElementById('notificationsList');
    const countEl = document.getElementById('notifCount');
    countEl.textContent = state.notifCount;

    // Render last 20
    const toShow = state.notifications.slice(0, 20);
    list.innerHTML = toShow.map(n => `
      <div class="notif-item ${n.type}">
        <span class="notif-time">${n.time}</span>
        <span class="notif-text">${n.message}</span>
      </div>
    `).join('');
  }

  function maybeRandomNotification() {
    // 20% chance each cycle
    if (Math.random() > 0.20) return;

    const infoMessages = [
      'Sensor pH input dikalibrasi otomatis.',
      'Data telemetri berhasil disinkronkan ke cloud.',
      'Suhu biochar stabil: 28°C.',
      'Gaya Van der Waals terdeteksi optimal pada permukaan biochar.',
      'Reduksi Cr6+ → Cr3+ berjalan normal.',
      'Gugus fungsi karboksil aktif mengikat ion logam berat.',
      'Backup data sensor berhasil dilakukan.',
      'Kapasitas penyimpanan data: 72% terpakai.',
      'Koneksi MQTT broker stabil (latency: 12ms).',
      'Kemisorpsi pada permukaan biochar terdeteksi aktif.',
      'Luas permukaan spesifik biochar: 287 m²/g — adsorpsi optimal.',
      'Gugus hidroksil (-OH) pada biochar aktif mengikat Cr³⁺.',
      'Model isoterm Langmuir: qmax = 142 mg/g tercapai.',
      'Efisiensi removal zat warna Methylene Blue: 96.3%.',
      'Porositas biochar terdeteksi stabil: 68% mikropori.',
      'Afinitas gugus amina (-NH₂) terhadap ion Cu²⁺ optimal.',
      'Kinetika adsorpsi mengikuti model pseudo-second order.',
      'Suhu pirolisis biochar tercatat: 500°C — karbon aktif stabil.'
    ];

    const warningMessages = [
      'Suhu air limbah sedikit meningkat: 42°C.',
      'Fluktuasi pH input terdeteksi. Memantau lebih lanjut.',
      'Debit air input meningkat 10% dari rata-rata.',
      'Konduktivitas listrik input mendekati batas atas.',
      'Tekanan pada kolom filter sedikit meningkat.',
      'Biochar layer menunjukkan tanda awal kompaksi.'
    ];

    if (Math.random() < 0.75) {
      // INFO notification
      const msg = infoMessages[Math.floor(rand(0, infoMessages.length))];
      addNotification('info', msg);
    } else {
      // WARNING notification
      const msg = warningMessages[Math.floor(rand(0, warningMessages.length))];
      addNotification('warning', msg);
    }
  }

  // ============ WATER BEAKER VISUAL TRANSITIONS ============
  function updateWaterVisuals() {
    const cleanWater = document.getElementById('cleanWater');
    if (!cleanWater) return;

    const turb = state.output.turbidity;
    const isEmerg = state.isEmergency;

    if (isEmerg || turb > state.thresholds.turbidity) {
      // Transition to murky/cloudy water during breakthrough or anomaly
      cleanWater.style.background = 'linear-gradient(180deg, rgba(160, 120, 70, 0.5), rgba(130, 95, 50, 0.6), rgba(95, 65, 30, 0.7))';
      cleanWater.style.boxShadow = 'inset 0 0 30px rgba(130, 95, 50, 0.35)';
    } else if (state.adsorptionCapacity < 35) {
      // Slight haze as biochar capacity is near exhaustion
      cleanWater.style.background = 'linear-gradient(180deg, rgba(160, 210, 230, 0.3), rgba(120, 185, 220, 0.38), rgba(70, 150, 195, 0.45))';
      cleanWater.style.boxShadow = 'inset 0 0 20px rgba(70, 150, 195, 0.2)';
    } else {
      // Pristine crystal clean water
      cleanWater.style.background = 'linear-gradient(180deg, rgba(186, 230, 253, 0.25), rgba(125, 211, 252, 0.32), rgba(56, 189, 248, 0.38), rgba(14, 165, 233, 0.42))';
      cleanWater.style.boxShadow = 'inset 0 0 30px rgba(14, 165, 233, 0.1)';
    }
  }

  // ============ EXPORT TELEMETRY CSV ============
  function exportTelemetryCSV() {
    const cd = state.chartData;
    let csv = 'Waktu,Flow Input (L/jam),pH Input,Turbidity Input (NTU),EC Input (uS/cm),Flow Output (L/jam),pH Output,Turbidity Output (NTU),EC Output (uS/cm),Kapasitas Adsorpsi Biochar (%)\n';
    const len = cd.labels.length;
    for (let i = 0; i < len; i++) {
      const cap = state.capacityHistory[i] !== undefined ? formatNumber(state.capacityHistory[i], 1) : formatNumber(state.adsorptionCapacity, 1);
      csv += `"${cd.labels[i]}",${formatNumber(cd.flowIn[i], 1)},${formatNumber(cd.phIn[i], 1)},${formatNumber(cd.turbIn[i], 0)},${formatNumber(cd.ecIn[i], 0)},${formatNumber(cd.flowOut[i], 1)},${formatNumber(cd.phOut[i], 1)},${formatNumber(cd.turbOut[i], 0)},${formatNumber(cd.ecOut[i], 0)},${cap}\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `VANDER-AI_telemetry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addNotification('info', 'Data telemetri berhasil diekspor ke file CSV.');
  }

  // ============ AUDIO SYNTHESIZER (Web Audio API) ============
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  function playTone(freq, type, duration, gainVal = 0.08) {
    if (!state.audioEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio fallback
    }
  }

  function soundBeep() { playTone(880, 'sine', 0.1, 0.04); }
  function soundEmergency() {
    playTone(440, 'sawtooth', 0.25, 0.08);
    setTimeout(() => playTone(660, 'sawtooth', 0.25, 0.08), 260);
  }
  function soundSuccess() {
    playTone(523.25, 'sine', 0.12, 0.05);
    setTimeout(() => playTone(659.25, 'sine', 0.15, 0.05), 100);
  }

  // ============ AI LIVE ADVISORY HUB ============
  function updateAIAdvisory() {
    const streamEl = document.getElementById('aiReasoningMsg');
    const confEl = document.getElementById('aiConfidenceVal');
    const ribConf = document.getElementById('ribbonConfidence');
    const diagInterlock = document.getElementById('diagInterlock');
    const ribbonLatency = document.getElementById('ribbonLatency');

    if (ribbonLatency) {
      ribbonLatency.innerHTML = `${Math.floor(rand(6, 14))} ms &bull; OPC-UA / TLS 1.3`;
    }

    if (state.isEmergency) {
      if (streamEl) {
        streamEl.innerHTML = `<span style="color:#ef4444;font-weight:700;">[AI EMERGENCY ACTION]:</span> Ambang batas terlampaui (Turbidity: ${formatNumber(state.output.turbidity, 0)} NTU / pH: ${formatNumber(state.output.ph, 1)}). Algoritma interlock otomatis mengisolasi effluent; katup MOV-301 dialihkan ke tangki retensi darurat untuk resirkulasi.`;
      }
      if (confEl) confEl.textContent = '99.8%';
      if (ribConf) ribConf.textContent = '99.8% (ANOMALY DETECTED)';
      if (diagInterlock) {
        diagInterlock.textContent = 'INTERLOCK TRIPPED (BYPASS ACTIVE)';
        diagInterlock.style.color = '#ef4444';
      }
      return;
    }

    // Dynamic AI confidence fluctuation
    const conf = (99.1 + rand(0, 0.6)).toFixed(1);
    if (confEl) confEl.textContent = conf + '%';
    if (ribConf) ribConf.textContent = conf + '% (F1: 0.982)';

    if (diagInterlock) {
      diagInterlock.textContent = 'ARMED & MONITORING';
      diagInterlock.style.color = '#10b981';
    }

    const mtzPct = 100 - state.adsorptionCapacity;
    if (mtzPct > 70) {
      if (streamEl) {
        streamEl.innerHTML = `<span style="color:#f59e0b;font-weight:700;">[AI ADVISORY - WARNING]:</span> Kejenuhan lapisan biochar mencapai ${formatNumber(mtzPct, 1)}%. Kapasitas adsorpsi mendekati titik breakthrough. Disarankan jadwal backwash dalam < 12 jam.`;
      }
    } else if (state.adsorptionCapacity > 50) {
      const messages = [
        `Gaya tarik Van der Waals optimal pada mikropori biochar kotoran ayam (luas spesifik 287 m²/g). Efisiensi penjerapan polutan organik tekstil mencapai 96.8%.`,
        `Gugus karboksil (-COOH) dan hidroksil (-OH) biochar aktif mengkelat kation logam berat Pb²⁺ dan Cd²⁺ secara selektif & stabil.`,
        `Reaksi redoks Cr⁶⁺ → Cr³⁺ berlangsung normal mengikuti kinetika pseudo-second order (k₂: 0.042 g/mg·min). Air limbah tereduksi sempurna.`,
        `Fluks hidrolik stabil (${formatNumber(state.output.flow, 1)} L/jam). Tekanan kolom adsorpsi normal pada 0.18 bar, tidak terdeteksi fouling/clogging.`,
        `Proyeksi kurva kinetika Thomas & Yoon-Nelson memvalidasi sisa masa layan filter masih mencukupi (>40 jam operasi).`
      ];
      if (streamEl && Math.random() < 0.45) {
        streamEl.textContent = messages[Math.floor(rand(0, messages.length))];
      }
    }
  }

  // ============ SCADA DIGITAL TWIN P&ID ============
  function updateSCADADigitalTwin() {
    // 1. Feed Pump P-101
    const pumpSpeed = document.getElementById('pumpSpeed');
    const pumpWrap = document.getElementById('pumpIconWrap');
    const pumpState = document.getElementById('pumpState');
    if (pumpSpeed) pumpSpeed.textContent = `Flow: ${formatNumber(state.input.flow, 1)} L/jam`;
    if (pumpWrap) {
      if (state.input.flow > 0 && !state.isPaused) {
        pumpWrap.classList.add('spinning');
        if (pumpState) { pumpState.textContent = 'RUNNING'; pumpState.className = 'node-state running'; }
      } else {
        pumpWrap.classList.remove('spinning');
        if (pumpState) { pumpState.textContent = 'PAUSED'; pumpState.className = 'node-state'; }
      }
    }

    // 2. Reactor R-201 MTZ Bed saturation
    const mtzBar = document.getElementById('mtzZoneBar');
    const mtzPercent = document.getElementById('mtzPercent');
    const bedPressure = document.getElementById('bedPressure');
    const satPct = clamp(100 - state.adsorptionCapacity, 5, 95);
    if (mtzBar) mtzBar.style.height = `${satPct}%`;
    if (mtzPercent) mtzPercent.textContent = `${formatNumber(satPct, 1)}%`;
    if (bedPressure) {
      const p = 0.15 + (satPct / 100) * 0.12;
      bedPressure.textContent = `${formatNumber(p, 2)} bar`;
    }

    // 3. 3-Way Motorized Control Valve MOV-301
    const valveIcon = document.getElementById('scadaValveIcon');
    const valveState = document.getElementById('scadaValveState');
    const streamRiver = document.getElementById('streamRiver');
    const streamRetention = document.getElementById('streamRetention');

    if (state.isEmergency) {
      if (valveIcon) {
        valveIcon.className = 'valve-visual-symbol diverted';
        valveIcon.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="4 6 12 12 4 18 4 6"/><polygon points="20 6 12 12 20 18 20 6"/><line x1="12" y1="12" x2="12" y2="4"/><circle cx="12" cy="3" r="2"/><line x1="18" y1="6" x2="6" y2="18"/></svg>';
      }
      if (valveState) {
        valveState.textContent = 'RETENTION BYPASS ACTIVE';
        valveState.className = 'node-state closed font-mono';
      }
      if (streamRiver) streamRiver.classList.remove('active');
      if (streamRetention) streamRetention.classList.add('active');
    } else {
      if (valveIcon) {
        valveIcon.className = 'valve-visual-symbol';
        valveIcon.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="4 6 12 12 4 18 4 6"/><polygon points="20 6 12 12 20 18 20 6"/><line x1="12" y1="12" x2="12" y2="4"/><circle cx="12" cy="3" r="2"/></svg>';
      }
      if (valveState) {
        valveState.textContent = 'RIVER DISCHARGE OPEN';
        valveState.className = 'node-state open font-mono';
      }
      if (streamRiver) streamRiver.classList.add('active');
      if (streamRetention) streamRetention.classList.remove('active');
    }
  }

  // ============ NEPHELOMETRIC OPTICAL METRICS ============
  function updateOpticalMetrics() {
    const dirtyText = document.getElementById('dirtyOpticalText');
    const cleanText = document.getElementById('cleanOpticalText');
    const cleanBadge = document.getElementById('cleanOpticalBadge');

    // Dirty water scatter
    const dirtyScatter = clamp(85 + (state.input.turbidity / 550) * 14, 80, 99.5);
    const dirtyTrans = clamp(100 - dirtyScatter, 0.5, 20);
    if (dirtyText) dirtyText.innerHTML = `Hamburan Cahaya: ${formatNumber(dirtyScatter, 1)}% &bull; Transmitansi: ${formatNumber(dirtyTrans, 1)}%`;

    // Clean water scatter
    const cleanScatter = clamp((state.output.turbidity / 50) * 10, 0.3, 80);
    const cleanTrans = clamp(100 - cleanScatter, 20, 99.7);
    if (cleanText) {
      if (state.output.turbidity > state.thresholds.turbidity) {
        cleanText.innerHTML = `Hamburan Cahaya: ${formatNumber(cleanScatter, 1)}% &bull; Transmitansi Rendah: ${formatNumber(cleanTrans, 1)}%`;
        if (cleanBadge) cleanBadge.className = 'optical-badge danger';
      } else {
        cleanText.innerHTML = `Transmitansi Optik: ${formatNumber(cleanTrans, 1)}% &bull; Hamburan Cahaya: ${formatNumber(cleanScatter, 1)}%`;
        if (cleanBadge) cleanBadge.className = 'optical-badge success';
      }
    }
  }

  // ============ LIVE TELEMETRY LOG STREAM ============
  function pushTelemetryPacket() {
    const consoleEl = document.getElementById('telemetryConsole');
    if (!consoleEl) return;

    const pkt = {
      timestamp: Math.floor(Date.now() / 1000),
      plant_id: "CITARUM_TX_04",
      reactor_id: "R-201_BIOCHAR",
      raw_inlet: {
        flow_lph: Number(formatNumber(state.input.flow, 1)),
        ph: Number(formatNumber(state.input.ph, 2)),
        turb_ntu: Math.round(state.input.turbidity),
        ec_us_cm: Math.round(state.input.ec)
      },
      filtered_outlet: {
        flow_lph: Number(formatNumber(state.output.flow, 1)),
        ph: Number(formatNumber(state.output.ph, 2)),
        turb_ntu: Math.round(state.output.turbidity),
        ec_us_cm: Math.round(state.output.ec)
      },
      ai_kinetics: {
        adsorption_cap_pct: Number(formatNumber(state.adsorptionCapacity, 1)),
        mov301_valve_pos: state.isEmergency ? "RETENTION_BYPASS" : "RIVER_DISCHARGE",
        status: state.isEmergency ? "CRITICAL_INTERLOCK" : "OPTIMAL"
      }
    };

    const item = document.createElement('div');
    item.className = 'telemetry-log-item';
    item.innerHTML = `<span class="log-time">[${getTimeString()}]</span> <span class="log-topic">PUB &rarr; citarum/plant04/biochar01/telemetry:</span> <span class="log-json">${JSON.stringify(pkt)}</span>`;
    consoleEl.appendChild(item);

    // Keep max 35 packets in DOM
    while (consoleEl.children.length > 35) {
      consoleEl.removeChild(consoleEl.firstChild);
    }
    consoleEl.scrollTop = consoleEl.scrollHeight;
  }

  // ============ ENTERPRISE & MODAL CONTROLS ============
  function initEnterpriseControls() {
    // Audio toggle
    const btnAudio = document.getElementById('btnAudioToggle');
    const audioIcon = document.getElementById('audioIcon');
    const audioText = document.getElementById('audioText');
    if (btnAudio) {
      btnAudio.addEventListener('click', () => {
        state.audioEnabled = !state.audioEnabled;
        if (state.audioEnabled) {
          if (audioIcon) audioIcon.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
          if (audioText) audioText.textContent = 'Audio FX: ON';
          soundSuccess();
          addNotification('info', '[SCADA-AUDIO] Sistem peringatan akustik diaktifkan.');
        } else {
          if (audioIcon) audioIcon.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';
          if (audioText) audioText.textContent = 'Audio FX: OFF';
          addNotification('info', '[SCADA-AUDIO] Efek suara SCADA dinonaktifkan.');
        }
      });
    }

    // Telemetry Modal
    const modal = document.getElementById('telemetryModal');
    const btnOpen = document.getElementById('btnOpenTelemetry');
    const btnClose = document.getElementById('btnCloseTelemetry');
    const btnClear = document.getElementById('btnClearTelemetry');
    const consoleEl = document.getElementById('telemetryConsole');

    if (btnOpen && modal) {
      btnOpen.addEventListener('click', () => {
        modal.classList.add('open');
        soundBeep();
      });
    }

    if (btnClose && modal) {
      btnClose.addEventListener('click', () => {
        modal.classList.remove('open');
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('open');
        }
      });
    }

    if (btnClear && consoleEl) {
      btnClear.addEventListener('click', () => {
        consoleEl.innerHTML = '';
        soundBeep();
      });
    }
  }

  // ============ LIVE DEMO & SIMULATION CONTROLS ============
  function initDemoControls() {
    // 1. Trigger Emergency / Quality Anomaly
    const btnEmergency = document.getElementById('btnTriggerEmergency');
    if (btnEmergency) {
      btnEmergency.addEventListener('click', () => {
        state.output.turbidity = 85;
        state.output.ph = 9.2;
        state.output.ec = 750;
        updateSensorPanels();
        updateQualityAssurance();
        updateWaterVisuals();
        updateAIAdvisory();
        updateSCADADigitalTwin();
        updateOpticalMetrics();
        updateGauges();
        soundEmergency();
        addNotification('emergency', 'DEMO: Anomali kualitas disimulasikan! Turbidity = 85 NTU (ambang batas: ' + state.thresholds.turbidity + ' NTU). Katup otomatis ditutup.');
      });
    }

    // 2. Trigger Clogging / Flow Drop
    const btnClog = document.getElementById('btnTriggerClog');
    if (btnClog) {
      btnClog.addEventListener('click', () => {
        state.output.flow = Math.round(state.input.flow * 0.70); // 30% drop (>15%)
        updateSensorPanels();
        updateMassBalance();
        updateSCADADigitalTwin();
        soundBeep();
        addNotification('warning', 'DEMO: Penyumbatan pori biochar disimulasikan! Debit output turun >15%. Lakukan backwash!');
      });
    }

    // 3. Reset / Backwash Filter
    const btnReset = document.getElementById('btnResetNormal');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        state.adsorptionCapacity = 95;
        state.output.flow = Math.round(state.input.flow * 0.94);
        state.output.turbidity = 8;
        state.output.ph = 7.1;
        state.output.ec = 350;
        state.isEmergency = false;
        
        const valveLight = document.getElementById('valveLight');
        const valveLabel = document.getElementById('valveLabel');
        const valveDetail = document.getElementById('valveDetail');
        const banner = document.getElementById('emergencyBanner');
        const cloggingAlert = document.getElementById('cloggingAlert');
        
        if (valveLight) valveLight.className = 'valve-light green';
        if (valveLabel) valveLabel.textContent = 'Katup menuju sungai: TERBUKA';
        if (valveDetail) valveDetail.textContent = 'Air output memenuhi standar baku mutu';
        if (banner) banner.classList.remove('visible');
        if (cloggingAlert) cloggingAlert.classList.remove('visible');
        
        updateSensorPanels();
        updateQualityAssurance();
        updateWaterVisuals();
        updateAIAdvisory();
        updateSCADADigitalTwin();
        updateOpticalMetrics();
        updateBreakthroughPredictor();
        updateMassBalance();
        updateGauges();
        soundSuccess();
        addNotification('info', 'DEMO: Backwash selesai! Biochar diregenerasi ke 95%. Katup menuju sungai dibuka kembali.');
      });
    }

    // 4. Toggle Simulation Pause/Resume
    const btnToggle = document.getElementById('btnToggleSim');
    if (btnToggle) {
      btnToggle.addEventListener('click', () => {
        state.isPaused = !state.isPaused;
        const icon = document.getElementById('simIcon');
        const text = document.getElementById('simStatusText');
        soundBeep();
        if (state.isPaused) {
          if (icon) icon.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
          if (text) text.textContent = 'Lanjutkan Telemetri';
          addNotification('info', '[PLC-RUN] Streaming telemetri field bus dijeda.');
        } else {
          if (icon) icon.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
          if (text) text.textContent = 'Jeda Telemetri';
          addNotification('info', '[PLC-RUN] Streaming telemetri field bus dilanjutkan.');
        }
        updateSCADADigitalTwin();
      });
    }

    // 5. Export Telemetry CSV
    const btnExport = document.getElementById('btnExportData');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        soundBeep();
        exportTelemetryCSV();
      });
    }
  }

  // ============ THRESHOLD SETTINGS ============
  function initThresholdListeners() {
    const sliders = [
      { id: 'thresholdPHMin', valId: 'thresholdPHMinVal', key: 'phMin', suffix: '' },
      { id: 'thresholdPHMax', valId: 'thresholdPHMaxVal', key: 'phMax', suffix: '' },
      { id: 'thresholdTurbidity', valId: 'thresholdTurbidityVal', key: 'turbidity', suffix: '' },
      { id: 'thresholdEC', valId: 'thresholdECVal', key: 'ec', suffix: '' },
      { id: 'thresholdFlowDrop', valId: 'thresholdFlowDropVal', key: 'flowDrop', suffix: '%' }
    ];

    sliders.forEach(s => {
      const slider = document.getElementById(s.id);
      const valDisplay = document.getElementById(s.valId);
      if (!slider || !valDisplay) return;

      slider.addEventListener('input', () => {
        const val = parseFloat(slider.value);
        state.thresholds[s.key] = val;
        valDisplay.textContent = val + s.suffix;
        updateQualityAssurance();
        updateMassBalance();
        updateWaterVisuals();
        updateOpticalMetrics();
        updateAIAdvisory();
      });
    });
  }

  // ============ MAIN UPDATE LOOP ============
  function update() {
    if (state.isPaused) return;
    generateSensorData();
    updateSensorPanels();
    updateMetricCards();
    updateBreakthroughPredictor();
    updateMassBalance();
    updateQualityAssurance();
    updateEcoEfficiency();
    updateRemovalEfficiency();
    updateWaterVisuals();
    updateAIAdvisory();
    updateSCADADigitalTwin();
    updateOpticalMetrics();
    updateGauges();
    updateCharts();
    pushTelemetryPacket();
    maybeRandomNotification();
  }

  // ============ INITIALIZATION ============
  function showLoadingScreen() {
    const steps = document.querySelectorAll('.load-step');
    const screen = document.getElementById('loadingScreen');
    if (!screen || steps.length === 0) {
      return Promise.resolve();
    }
    return new Promise(resolve => {
      let current = 0;
      const stepInterval = setInterval(() => {
        if (current > 0 && steps[current - 1]) {
          steps[current - 1].classList.remove('active');
          steps[current - 1].classList.add('done');
        }
        if (current < steps.length) {
          steps[current].classList.add('active');
          current++;
        } else {
          clearInterval(stepInterval);
          setTimeout(() => {
            screen.classList.add('hidden');
            resolve();
          }, 400);
        }
      }, 500);
    });
  }

  function init() {
    updateClock();
    setInterval(updateClock, 1000);

    createParticles();
    createSparkles();
    createBubbles();
    initCharts();
    initThresholdListeners();
    initDemoControls();
    initEnterpriseControls();

    // Show loading screen then start
    showLoadingScreen().then(() => {
      // Initial notifications
      addNotification('info', 'Sistem VANDER-AI Enterprise diinisialisasi. Seluruh sensor aktif.');
      addNotification('info', 'Biochar kotoran ayam siap digunakan sebagai media adsorben (pirolisis 500°C).');
      addNotification('info', 'Monitoring SCADA real-time: gaya Van der Waals & reaksi Redoks dimulai.');
      addNotification('info', 'Inference Engine aktif: model kinetika Yoon-Nelson & Thomas online.');

      // Push first telemetry packets
      pushTelemetryPacket();
      pushTelemetryPacket();

      // Run first update immediately
      update();

      // Then update every 3 seconds
      setInterval(update, 3000);
    });
  }

  // Wait for DOM and Chart.js
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
