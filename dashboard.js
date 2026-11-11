// Dashboard-specific initialization
function initDashboard() {
  let energyData = generateMockData();
  let currentHour = updateTime();
  
  // Update gauge (using current hour usage)
  updateGauge(energyData.hourlyUsage[currentHour], 10);
  
  // Update timeline
  updateTimeline(energyData.hourlyUsage, currentHour);
  
  // Calculate and update summary
  const totalUsage = energyData.hourlyUsage.reduce((sum, usage) => sum + usage, 0);
  updateSummary(totalUsage, totalUsage * 0.12, totalUsage * 0.45);
  
  // Set up real-time updates
  setInterval(() => {
    currentHour = updateTime();
    
    // Simulate data updates every 30 seconds
    if (new Date().getSeconds() % 30 === 0) {
      energyData = generateMockData();
    }
    
    updateGauge(energyData.hourlyUsage[currentHour], 10);
    updateTimeline(energyData.hourlyUsage, currentHour);
  }, 1000);
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', initDashboard);
