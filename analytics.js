// Analytics page initialization
function initAnalytics() {
  updateTime();
  initializeDistrictMap();
}

// Initialize district interactions with map
function initializeDistrictMap() {
  // District data with coordinates and information
  const districts = [
    { name: 'Downtown Dubai', coords: [25.1972, 55.2744], usage: 'increasing', cost: 4.82 },
    { name: 'Deira', coords: [25.2708, 55.3161], usage: 'constant', cost: 3.45 },
    { name: 'Bur Dubai', coords: [25.2628, 55.3106], usage: 'decreasing', cost: 2.95 },
    { name: 'Marina', coords: [25.0867, 55.1396], usage: 'increasing', cost: 5.12 },
    { name: 'Business Bay', coords: [25.1881, 55.2706], usage: 'constant', cost: 4.30 },
    { name: 'Jumeirah', coords: [25.1626, 55.1307], usage: 'decreasing', cost: 3.20 },
    { name: 'JBR', coords: [25.0895, 55.1448], usage: 'constant', cost: 4.15 },
    { name: 'Al Barsha', coords: [25.0797, 55.2197], usage: 'increasing', cost: 3.75 },
    { name: 'Dubai Hills Estate', coords: [25.1206, 55.2188], usage: 'constant', cost: 4.60 },
    { name: 'Arabian Ranches', coords: [25.0525, 55.1881], usage: 'decreasing', cost: 3.05 }
  ];

  // Initialize Leaflet map
  const mapContainer = document.getElementById('dubai-map');
  if (!mapContainer) return;

  const map = L.map('dubai-map').setView([25.2048, 55.2708], 11);

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  const detailsPanel = document.getElementById('district-details');
  const districtMarkers = [];

  // Add markers for each district
  districts.forEach(district => {
    let color;
    if (district.usage === 'decreasing') {
      color = '#10b981'; // Green
    } else if (district.usage === 'constant') {
      color = '#f59e0b'; // Yellow
    } else {
      color = '#ef4444'; // Red
    }

    // Create custom marker
    const markerHtml = `
      <div class="custom-marker" style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>
    `;

    const customIcon = L.divIcon({
      html: markerHtml,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      popupAnchor: [0, -13]
    });

    const marker = L.marker(district.coords, { icon: customIcon })
      .bindPopup(`<strong>${district.name}</strong><br>Rate: ${district.cost} AED/kWh`)
      .addTo(map);

    // Add click event to show details
    marker.on('click', () => {
      const hour = new Date().getHours();
      let priceMultiplier = 'Standard';
      if (hour >= 22 || hour < 6) {
        priceMultiplier = 'Off-Peak';
      } else if (hour >= 16 && hour < 22) {
        priceMultiplier = 'Peak';
      }

      detailsPanel.innerHTML = `
        <div class="district-info">
          <div class="district-info-item">
            <span class="district-info-label">District</span>
            <span class="district-info-value">${district.name}</span>
          </div>
          <div class="district-info-item">
            <span class="district-info-label">Current Status</span>
            <span class="usage-badge ${district.usage}">${district.usage.replace('-', ' ')}</span>
          </div>
          <div class="district-info-item">
            <span class="district-info-label">Current Rate</span>
            <span class="district-info-value">${district.cost} AED/kWh</span>
          </div>
          <div class="district-info-item">
            <span class="district-info-label">Time Period</span>
            <span class="district-info-value">${priceMultiplier}</span>
          </div>
          <div class="district-info-item">
            <span class="district-info-label">Est. Daily Cost</span>
            <span class="district-info-value">${(district.cost * 25).toFixed(2)} AED</span>
          </div>
        </div>
      `;
    });

    districtMarkers.push(marker);
  });

  // Resize map to fit container
  setTimeout(() => map.invalidateSize(), 300);

  // Update time periodically
  setInterval(updateTime, 1000);
}

// Initialize analytics when page loads
document.addEventListener('DOMContentLoaded', initAnalytics);
