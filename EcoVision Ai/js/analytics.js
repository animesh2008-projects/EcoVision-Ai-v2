// js/analytics.js
import db from './firebase-config.js';
import auth from './auth.js';

// Deterministic EcoScore mathematical calculations
export function calculateEcoScore(issues) {
  let score = 100;
  let activeIssues = issues.filter(i => i.status !== 'RESOLVED');
  let resolvedIssues = issues.filter(i => i.status === 'RESOLVED');

  let deductions = 0;
  let additions = 0;
  
  // Deductions based on open issue severity
  activeIssues.forEach(issue => {
    const priority = (issue.priorityLevel || 'MEDIUM').toUpperCase();
    if (priority === 'CRITICAL') deductions += 5.0;
    else if (priority === 'HIGH') deductions += 3.0;
    else if (priority === 'MEDIUM' || priority === 'LOW') deductions += 1.5;
    else deductions += 0.5;
  });

  // Additional deduction for repeated unresolved issues in the same location
  const locationCategoryCounts = {};
  activeIssues.forEach(i => {
    const key = `${i.location}_${i.category}`;
    locationCategoryCounts[key] = (locationCategoryCounts[key] || 0) + 1;
  });
  
  for (const count of Object.values(locationCategoryCounts)) {
    if (count > 1) {
      deductions += (count - 1) * 2.0; // -2.0 for each additional repeated issue
    }
  }

  // Additions for successful resolutions
  resolvedIssues.forEach(issue => {
    // Normal resolved
    additions += 2.0;
    
    // Check SLA resolution speed (e.g. resolved in under 24 hours)
    const resolveTimeMs = new Date(issue.updatedAt) - new Date(issue.createdAt);
    if (resolveTimeMs > 0 && resolveTimeMs <= 24 * 60 * 60 * 1000) {
      additions += 1.0; // speed resolution bonus
    }

    // Nature observations bonus
    if (issue.category === 'nature' && issue.severity === 'normal') {
      additions += 0.5; // positive nature log
    }
  });

  score = Math.round(100 - deductions + additions);
  score = Math.max(0, Math.min(score, 100)); // clamp between 0-100

  return {
    score,
    deductions: parseFloat(deductions.toFixed(1)),
    additions: parseFloat(additions.toFixed(1))
  };
}

// Render Chart.js dashboards if charts elements exist
async function initAnalyticsPage() {
  const activeUser = auth.checkPageAccess();
  if (!activeUser) return;
  auth.updateHeaderUI();

  const issues = await db.getIssues();

  // Draw metrics
  const scoreObj = calculateEcoScore(issues);
  const ecoScoreEl = document.getElementById("an-ecoscore");
  if (ecoScoreEl) ecoScoreEl.textContent = scoreObj.score;

  const totalActive = issues.filter(i => i.status !== 'RESOLVED').length;
  const resolved = issues.filter(i => i.status === 'RESOLVED').length;
  
  // SLA Compliance calculation
  const closedCount = resolved;
  const breachedCount = issues.filter(i => i.status !== 'RESOLVED' && new Date(i.slaDeadline) < new Date()).length;
  const complianceRate = closedCount + breachedCount > 0 
    ? Math.round((closedCount / (closedCount + breachedCount)) * 100) 
    : 100;
  
  const complianceEl = document.getElementById("an-sla-compliance");
  if (complianceEl) complianceEl.textContent = `${complianceRate}%`;

  // Draw category pie/doughnut chart
  drawCategoryChart(issues);

  // Draw location bar chart
  drawLocationChart(issues);

  // Draw trend line chart
  drawTrendChart(issues);

  // Draw hotspots table
  drawHotspotsTable(issues);

  // Draw EcoScore factors
  drawEcoScoreFactors(scoreObj);
}

function drawCategoryChart(issues) {
  const ctx = document.getElementById('category-chart')?.getContext('2d');
  if (!ctx) return;

  const categories = { waste: 0, water: 0, energy: 0, nature: 0 };
  issues.forEach(i => {
    if (categories[i.category] !== undefined) {
      categories[i.category]++;
    }
  });

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Waste', 'Water', 'Energy', 'Nature'],
      datasets: [{
        data: [categories.waste, categories.water, categories.energy, categories.nature],
        backgroundColor: ['#2ecc71', '#3498db', '#f1c40f', '#27ae60'],
        borderColor: 'rgba(18, 28, 24, 0.5)',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { color: '#ccc' }
        }
      }
    }
  });
}

function drawLocationChart(issues) {
  const ctx = document.getElementById('location-chart')?.getContext('2d');
  if (!ctx) return;

  const locations = {};
  issues.forEach(i => {
    const loc = i.location.replace(/_/g, ' ').toUpperCase();
    locations[loc] = (locations[loc] || 0) + 1;
  });

  const labels = Object.keys(locations);
  const data = Object.values(locations);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Issues Count',
        data: data,
        backgroundColor: '#1abc9c',
        borderColor: '#16a085',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { ticks: { color: '#ccc' }, grid: { display: false } },
        y: { ticks: { color: '#ccc' }, grid: { color: 'rgba(255,255,255,0.05)' } }
      }
    }
  });
}

function drawTrendChart(issues) {
  const ctx = document.getElementById('trend-chart')?.getContext('2d');
  if (!ctx) return;

  // Let's create mock weekly trends based on dates
  // Group by date of creation
  const days = {};
  for(let i=6; i>=0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    days[d.toLocaleDateString()] = { reported: 0, resolved: 0 };
  }

  issues.forEach(issue => {
    const dateStr = new Date(issue.createdAt).toLocaleDateString();
    if (days[dateStr]) {
      days[dateStr].reported++;
      if (issue.status === 'RESOLVED') {
        days[dateStr].resolved++;
      }
    }
  });

  const labels = Object.keys(days);
  const reportedData = Object.values(days).map(d => d.reported);
  const resolvedData = Object.values(days).map(d => d.resolved);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Reported Issues',
          data: reportedData,
          borderColor: '#e67e22',
          backgroundColor: 'rgba(230, 126, 34, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Resolved Issues',
          data: resolvedData,
          borderColor: '#2ecc71',
          backgroundColor: 'rgba(46, 204, 113, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#ccc' } }
      },
      scales: {
        x: { ticks: { color: '#ccc' }, grid: { display: false } },
        y: { ticks: { color: '#ccc' }, grid: { color: 'rgba(255,255,255,0.05)' } }
      }
    }
  });
}

function drawHotspotsTable(issues) {
  const body = document.getElementById("an-hotspot-table-body");
  if (!body) return;

  // Group by location
  const locGroups = {};
  issues.forEach(i => {
    if (!locGroups[i.location]) {
      locGroups[i.location] = { total: 0, categories: {} };
    }
    locGroups[i.location].total++;
    locGroups[i.location].categories[i.category] = (locGroups[i.location].categories[i.category] || 0) + 1;
  });

  // Sort by count
  const sorted = Object.entries(locGroups).sort((a,b) => b[1].total - a[1].total).slice(0, 4);

  body.innerHTML = "";
  sorted.forEach(([locKey, data]) => {
    // Find top category
    let topCat = "waste";
    let topCatCount = 0;
    for (const [cat, count] of Object.entries(data.categories)) {
      if (count > topCatCount) { topCatCount = count; topCat = cat; }
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="font-weight:700;">${locKey.toUpperCase().replace(/_/g, ' ')}</td>
      <td>${topCat.toUpperCase()}</td>
      <td>${data.total} reports</td>
      <td><span class="status-badge ${data.total > 3 ? 'status-admin-review' : 'status-accepted'}">${data.total > 3 ? 'HIGH RISK' : 'STABLE'}</span></td>
    `;
    body.appendChild(tr);
  });
}

function drawEcoScoreFactors(scoreObj) {
  const container = document.getElementById("ecoscore-factors-breakdown");
  if (!container) return;

  container.innerHTML = `
    <div class="decision-factor-row">
      <div class="factor-info">
        <span>Base Campus Rating</span>
        <strong>100 / 100</strong>
      </div>
      <div class="factor-progress-bg"><div class="factor-progress-fill" style="width:100%;"></div></div>
    </div>
    
    <div class="decision-factor-row">
      <div class="factor-info">
        <span>Active Issues Deductions</span>
        <strong style="color:var(--accent-red);">- ${scoreObj.deductions} pts</strong>
      </div>
      <div class="factor-progress-bg"><div class="factor-progress-fill" style="width:${Math.max(0, 100 - scoreObj.deductions * 2.5)}%; background-color:var(--accent-red);"></div></div>
    </div>

    <div class="decision-factor-row">
      <div class="factor-info">
        <span>Resolution Closure Additions</span>
        <strong style="color:var(--primary);">+ ${scoreObj.additions} pts</strong>
      </div>
      <div class="factor-progress-bg"><div class="factor-progress-fill" style="width:${Math.min(100, scoreObj.additions * 10)}%;"></div></div>
    </div>
    
    <div class="decision-card" style="margin-top:1.5rem; text-align:center;">
      <h4 style="font-size:0.8rem; text-transform:uppercase; color:var(--text-dark-secondary);">Final Campus Rating</h4>
      <div style="font-size:2.5rem; font-weight:800; color:var(--primary);">${scoreObj.score} / 100</div>
    </div>
  `;
}

// Auto-run if loaded on analytics page
if (document.getElementById("category-chart")) {
  initAnalyticsPage();
}
