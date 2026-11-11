// Charts for storing references
let trendChart, hourlyChart, forecastChart;

// Initialize Usage Report Page (now runs fully client-side)
function initUsageReport() {
  updateTime();
  // Generate and load local mock data
  loadEnergyData();
  loadUserStats();
  loadRewards();
  loadTips();
  setupEventListeners();

  // Update time every second
  setInterval(updateTime, 1000);
}

// Local data generators (mirror earlier server behavior)
function generateHistoricalData() {
  const data = [];
  const baseUsage = 28.5;
  const now = new Date();

  for (let i = 30; i > 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const variation = (Math.random() - 0.5) * 10;
    const usage = Math.max(8, baseUsage + variation);
    data.push({ date: date.toISOString().split('T')[0], usage: Math.round(usage * 100) / 100 });
  }

  // store locally
  window.historicalData = data;
  return data;
}

function generateHourlyData() {
  const hourly = [];
  for (let hour = 0; hour < 24; hour++) {
    let base = 2;
    if (hour >= 6 && hour <= 9) {
      base = 6 + Math.random() * 2;
    } else if (hour >= 17 && hour <= 21) {
      base = 7 + Math.random() * 2;
    } else if (hour >= 10 && hour <= 16) {
      base = 4 + Math.random() * 1.5;
    } else {
      base = 1 + Math.random();
    }

    hourly.push({ hour: `${String(hour).padStart(2, '0')}:00`, actual: Math.round(base * 100) / 100, projected: Math.round(base * 0.95 * 100) / 100 });
  }

  window.hourlyData = hourly;
  return hourly;
}

function generateProjection(days = 7) {
  const projection = [];
  const now = new Date();
  for (let i = 1; i <= days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    const trend = 0.97 - (i * 0.01);
    const projected = Math.max(8, 28.5 * trend + (Math.random() - 0.5) * 4);
    projection.push({ date: date.toISOString().split('T')[0], projected_usage: Math.round(projected * 100) / 100 });
  }
  window.projectionData = projection;
  return projection;
}

// Load energy data from local generators
async function loadEnergyData() {
  try {
    const historical = window.historicalData || generateHistoricalData();
    const hourly = window.hourlyData || generateHourlyData();
    const projection = window.projectionData || generateProjection();

    updateTrendChart(historical);
    updateHourlyChart(hourly);
    updateForecastChart(projection);

    // Compute current usage
    const currentUsage = hourly.reduce((sum, h) => sum + h.actual, 0);
    window.currentUsage = Math.round(currentUsage * 100) / 100;
  } catch (error) {
    console.error('Error generating local energy data:', error);
    showError('Failed to generate local energy data');
  }
}

// Load user statistics locally
async function loadUserStats() {
  try {
    const historical = window.historicalData || generateHistoricalData();
    const avg7 = historical.slice(-7).reduce((sum, d) => sum + d.usage, 0) / Math.min(7, historical.length);
    const avg30 = historical.reduce((sum, d) => sum + d.usage, 0) / historical.length;

    const stats = {
      target: (window.userStats && window.userStats.target) || 20,
      previous_avg: 28.5,
      avg_7_day: Math.round(avg7 * 100) / 100,
      avg_30_day: Math.round(avg30 * 100) / 100
    };

    document.getElementById('avg-7day').textContent = `${stats.avg_7_day} kWh`;
    document.getElementById('avg-30day').textContent = `${stats.avg_30_day} kWh`;
    document.getElementById('current-target').textContent = `${stats.target} kWh`;

    const savings = stats.previous_avg - stats.avg_7_day;
    const achievement = Math.max(0, (savings / stats.previous_avg) * 100);
    document.getElementById('monthly-achievement').textContent = `${Math.round(achievement)}%`;

    window.userStats = stats;
  } catch (error) {
    console.error('Error computing local user stats:', error);
  }
}

// Local rewards calculation
function calculateRewards(currentUsage, previousAvg, target) {
  const savings = previousAvg - currentUsage;
  if (savings >= 5) {
    return { earned: Math.round(savings * 10), message: `Excellent! You saved ${savings.toFixed(1)} kWh. Earned ${Math.round(savings * 10)} AED in rewards!`, tier: 'gold' };
  } else if (savings >= 2) {
    return { earned: Math.round(savings * 8), message: `Good job! You saved ${savings.toFixed(1)} kWh. Earned ${Math.round(savings * 8)} AED in rewards!`, tier: 'silver' };
  } else if (savings >= 0) {
    return { earned: Math.round(savings * 5), message: `You saved ${savings.toFixed(1)} kWh. Earned ${Math.round(savings * 5)} AED in rewards!`, tier: 'bronze' };
  } else {
    return { earned: 0, message: `Usage increased by ${Math.abs(savings).toFixed(1)} kWh. Focus on the tips to reduce consumption.`, tier: 'none' };
  }
}

async function loadRewards() {
  try {
    const currentUsage = window.currentUsage || 24;
    const prevAvg = window.userStats?.previous_avg || 28.5;
    const target = window.userStats?.target || 20;

    const rewards = calculateRewards(currentUsage, prevAvg, target);
    // store rewards locally
    window.rewardsBalance = (window.rewardsBalance || 0) + rewards.earned;

    document.getElementById('total-rewards').textContent = `${window.rewardsBalance} AED`;
    document.getElementById('reward-text').textContent = rewards.message;
    const rewardMessage = document.getElementById('reward-message');
    rewardMessage.className = `reward-message tier-${rewards.tier}`;

    if (window.rewardsBalance <= 0) document.getElementById('redeem-btn').disabled = true;
    else document.getElementById('redeem-btn').disabled = false;
  } catch (error) {
    console.error('Error computing rewards:', error);
  }
}

// Load AI tips using client-side OpenAI REST call (requires config.js to set window.OPENAI_API_KEY)
async function loadTips() {
  const tipsContainer = document.getElementById('tips-container');
  tipsContainer.innerHTML = '';

  const currentUsage = window.currentUsage || 24;
  const target = window.userStats?.target || 20;
  const historical = window.historicalData || generateHistoricalData();

  if (!window.OPENAI_API_KEY) {
    // No key provided — show fallback tips and instruction
    tipsContainer.innerHTML = `
      <p class="loading">No OpenAI key found. Create a <strong>config.js</strong> with your OpenAI key or use the fallback tips below.</p>`;
    const fallback = [
      { tip: 'Use natural lighting during the day', potential_saving: '1-2 kWh' },
      { tip: 'Set AC to 24°C instead of 21°C', potential_saving: '2-3 kWh' },
      { tip: 'Turn off appliances when not in use', potential_saving: '1-2 kWh' }
    ];
    fallback.forEach((tip, i) => {
      const el = document.createElement('div'); el.className = 'tip-item';
      el.innerHTML = `<div class="tip-number">${i+1}</div><div class="tip-content"><p class="tip-text">${tip.tip}</p><p class="tip-saving">Potential saving: <strong>${tip.potential_saving}</strong></p></div>`;
      tipsContainer.appendChild(el);
    });
    return;
  }

  const last7 = historical.slice(-7);
  const avgUsage = last7.length ? last7.reduce((s,d) => s + d.usage, 0) / last7.length : 28.5;

  const prompt = `You are an energy efficiency expert. Based on the following data, provide 3-4 specific, actionable tips to reduce energy consumption.\n\nCurrent daily average usage: ${avgUsage.toFixed(1)} kWh\nUser's target: ${target} kWh\nCurrent usage today: ${currentUsage.toFixed(1)} kWh\nHistorical 7-day average: ${avgUsage.toFixed(1)} kWh\n\nProvide practical, specific tips that can help reach the target. Format your response as a JSON object like {"tips": [{"tip": "...", "potential_saving": "..."}, ...]}. Keep the JSON valid and avoid extra commentary.`;

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${window.OPENAI_API_KEY}`
      },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 500 })
    });

    const json = await resp.json();
    const responseText = json.choices && json.choices[0] && (json.choices[0].message?.content || json.choices[0].text || '');

    if (responseText) {
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}') + 1;
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        const jsonStr = responseText.substring(jsonStart, jsonEnd);
        try {
          const tipsData = JSON.parse(jsonStr);
          if (tipsData.tips && tipsData.tips.length) {
            tipsData.tips.forEach((tip, index) => {
              const tipElement = document.createElement('div');
              tipElement.className = 'tip-item';
              tipElement.innerHTML = `
                <div class="tip-number">${index + 1}</div>
                <div class="tip-content">
                  <p class="tip-text">${tip.tip}</p>
                  <p class="tip-saving">Potential saving: <strong>${tip.potential_saving}</strong></p>
                </div>`;
              tipsContainer.appendChild(tipElement);
            });
            return;
          }
        } catch (parseErr) {
          console.warn('Failed to parse OpenAI JSON, falling back to raw text.', parseErr);
        }
      }
    }

    // If we reach here, fallback to plain text or default tips
    if (responseText) {
      const el = document.createElement('div'); el.className = 'tip-item';
      el.innerHTML = `<div class="tip-content"><p class="tip-text">${responseText}</p></div>`;
      tipsContainer.appendChild(el);
    } else {
      tipsContainer.innerHTML = '<p class="error">No tips returned from OpenAI</p>';
    }
  } catch (err) {
    console.error('Error calling OpenAI from client:', err);
    tipsContainer.innerHTML = '<p class="error">Failed to fetch tips from OpenAI</p>';
  }
}

// Update Trend Chart (30 days)
function updateTrendChart(historical) {
  const ctx = document.getElementById('trend-chart').getContext('2d');
  
  if (trendChart) {
    trendChart.destroy();
  }
  
  const dates = historical.map(d => d.date.slice(5));
  const usage = historical.map(d => d.usage);
  
  // Calculate target line
  const target = window.userStats?.target || 20;
  const targetLine = new Array(usage.length).fill(target);
  
  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        {
          label: 'Actual Usage',
          data: usage,
          borderColor: '#6ee7b7',
          backgroundColor: 'rgba(110, 231, 183, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 3,
          pointBackgroundColor: '#6ee7b7'
        },
        {
          label: 'Daily Target',
          data: targetLine,
          borderColor: '#ef4444',
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: { color: '#cbd5e1' }
        }
      },
      scales: {
        y: {
          ticks: { color: '#cbd5e1' },
          grid: { color: 'rgba(100, 116, 139, 0.1)' }
        },
        x: {
          ticks: { color: '#cbd5e1' },
          grid: { color: 'rgba(100, 116, 139, 0.1)' }
        }
      }
    }
  });
}

// Update Hourly Chart (Today)
function updateHourlyChart(hourly) {
  const ctx = document.getElementById('hourly-chart').getContext('2d');
  
  if (hourlyChart) {
    hourlyChart.destroy();
  }
  
  const hours = hourly.map(h => h.hour);
  const actual = hourly.map(h => h.actual);
  const projected = hourly.map(h => h.projected);
  
  hourlyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: hours,
      datasets: [
        {
          label: 'Actual',
          data: actual,
          backgroundColor: 'rgba(110, 231, 183, 0.6)',
          borderColor: '#6ee7b7',
          borderWidth: 1
        },
        {
          label: 'Projected (AI)',
          data: projected,
          backgroundColor: 'rgba(245, 158, 11, 0.6)',
          borderColor: '#f59e0b',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: { color: '#cbd5e1' }
        }
      },
      scales: {
        y: {
          ticks: { color: '#cbd5e1' },
          grid: { color: 'rgba(100, 116, 139, 0.1)' }
        },
        x: {
          ticks: { color: '#cbd5e1' },
          grid: { color: 'rgba(100, 116, 139, 0.1)' }
        }
      }
    }
  });
}

// Update Forecast Chart (7 days)
function updateForecastChart(projection) {
  const ctx = document.getElementById('forecast-chart').getContext('2d');
  
  if (forecastChart) {
    forecastChart.destroy();
  }
  
  const dates = projection.map(p => p.date.slice(5));
  const projected = projection.map(p => p.projected_usage);
  
  forecastChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        {
          label: 'Projected Usage',
          data: projected,
          borderColor: '#34d399',
          backgroundColor: 'rgba(52, 211, 153, 0.2)',
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: '#34d399'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: { color: '#cbd5e1' }
        }
      },
      scales: {
        y: {
          ticks: { color: '#cbd5e1' },
          grid: { color: 'rgba(100, 116, 139, 0.1)' }
        },
        x: {
          ticks: { color: '#cbd5e1' },
          grid: { color: 'rgba(100, 116, 139, 0.1)' }
        }
      }
    }
  });
}

// Setup event listeners
function setupEventListeners() {
  // Set Target Button
  document.getElementById('set-target-btn').addEventListener('click', async () => {
    const target = parseFloat(document.getElementById('target-input').value);
    if (target > 0) {
      try {
        const response = await fetch(`${API_BASE}/set-target`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target })
        });
        const result = await response.json();
        if (result.success) {
          showSuccess(result.message);
          loadUserStats();
          loadEnergyData();
        }
      } catch (error) {
        showError('Failed to set target');
      }
    }
  });

  // Redeem Button
  document.getElementById('redeem-btn').addEventListener('click', async () => {
    const amount = parseFloat(document.getElementById('redeem-amount').value);
    const storeInput = document.querySelector('input[name="store"]:checked');
    
    if (!storeInput) {
      showError('Please select a store');
      return;
    }
    
    if (!amount || amount <= 0) {
      showError('Please enter a valid amount');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/redeem-reward`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: Math.round(amount), 
          store: storeInput.value 
        })
      });
      const result = await response.json();
      
      if (result.success) {
        // Show gift card code
        document.getElementById('code-display').textContent = result.code;
        document.getElementById('redemption-result').style.display = 'block';
        
        // Reset form
        document.getElementById('redeem-amount').value = '';
        storeInput.checked = false;
        
        // Reload rewards
        loadRewards();
        showSuccess(result.message);
      } else {
        showError(result.message);
      }
    } catch (error) {
      showError('Failed to redeem reward');
    }
  });

  // Copy Code Button
  document.getElementById('copy-btn').addEventListener('click', () => {
    const code = document.getElementById('code-display').textContent;
    navigator.clipboard.writeText(code).then(() => {
      showSuccess('Code copied to clipboard!');
    });
  });
}

// Show success message
function showSuccess(message) {
  const msg = document.createElement('div');
  msg.className = 'notification success';
  msg.textContent = message;
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 3000);
}

// Show error message
function showError(message) {
  const msg = document.createElement('div');
  msg.className = 'notification error';
  msg.textContent = message;
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 3000);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initUsageReport);
