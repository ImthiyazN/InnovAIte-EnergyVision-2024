// Menu bar functionality
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const menuItems = document.querySelector('.menu-items');
  const menuLinks = document.querySelectorAll('.menu-link');

  // Toggle mobile menu
  menuToggle.addEventListener('click', () => {
    menuItems.classList.toggle('active');
  });

  // Close menu when link is clicked
  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuItems.classList.remove('active');
      // Remove active class from all links
      menuLinks.forEach(l => l.classList.remove('active'));
      // Add active class to clicked link
      link.classList.add('active');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu-bar')) {
      menuItems.classList.remove('active');
    }
  });
});

// Generate mock energy data
function generateMockData() {
  const hourlyUsage = Array(24).fill(0).map((_, hour) => {
    let baseUsage = 2;
    
    if (hour >= 6 && hour <= 9) {
      baseUsage = 6 + Math.random() * 3;
    } else if (hour >= 17 && hour <= 21) {
      baseUsage = 7 + Math.random() * 4;
    } else if (hour >= 10 && hour <= 16) {
      baseUsage = 4 + Math.random() * 2;
    } else {
      baseUsage = 1 + Math.random() * 1.5;
    }
    
    return Math.max(0.5, baseUsage + (Math.random() - 0.5) * 1.5);
  });
  
  return { hourlyUsage };
}

// Update gauge progress
function updateGauge(usage, maxUsage) {
  const percentage = Math.min(100, (usage / maxUsage) * 100);
  const strokeDasharray = 2 * Math.PI * 90;
  const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;
  
  const progressCircle = document.getElementById('progress-circle');
  if (progressCircle) {
    progressCircle.style.strokeDasharray = strokeDasharray;
    progressCircle.style.strokeDashoffset = strokeDashoffset;
  }
  
  const currentUsage = document.getElementById('current-usage');
  if (currentUsage) {
    currentUsage.textContent = usage.toFixed(1);
  }
}

// Update timeline
function updateTimeline(hourlyUsage, currentHour) {
  const timeline = document.querySelector('.timeline');
  if (!timeline) return;
  
  timeline.innerHTML = '';
  
  const maxUsage = Math.max(...hourlyUsage, 1);
  
  hourlyUsage.forEach((usage, index) => {
    const hourElement = document.createElement('div');
    hourElement.className = 'timeline-hour';
    
    const heightPercentage = (usage / maxUsage) * 100;
    
    hourElement.innerHTML = `
      <div class="hour-label">${index}:00</div>
      <div class="hour-bar ${index === currentHour ? 'active' : ''}" 
           style="height: ${Math.max(20, heightPercentage)}%"></div>
      <div class="hour-value">${usage.toFixed(1)}</div>
    `;
    
    timeline.appendChild(hourElement);
  });
}

// Update summary values
function updateSummary(totalUsage, cost, carbon) {
  const summaryItems = document.querySelectorAll('.summary-item');
  if (summaryItems.length >= 3) {
    summaryItems[0].querySelector('.summary-value').textContent = `${totalUsage.toFixed(1)} kWh`;
    summaryItems[1].querySelector('.summary-value').textContent = `$${cost.toFixed(2)}`;
    summaryItems[2].querySelector('.summary-value').textContent = `${carbon.toFixed(1)} kg`;
  }
}

// Update time display
function updateTime() {
  const now = new Date();
  const currentTimeEl = document.getElementById('current-time');
  if (currentTimeEl) {
    currentTimeEl.textContent = now.toLocaleTimeString();
  }
  return now.getHours();
}
