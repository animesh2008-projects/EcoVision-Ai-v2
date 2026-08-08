// js/map.js
import db from './firebase-config.js';
import auth from './auth.js';

let map = null;
let markerLayer = null;
let activeUser = null;

async function initMap() {
  activeUser = auth.checkPageAccess();
  if (!activeUser) return;
  auth.updateHeaderUI();

  // Route navbar link targets based on role
  adjustNavBar();

  // Campus coordinates: Center of the clustered mock locations
  const campusCenter = [12.9715, 77.5946];
  
  // Initialize Leaflet map
  map = L.map('map').setView(campusCenter, 17);

  // Set OpenStreetMap tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  markerLayer = L.layerGroup().addTo(map);

  // Initial draw
  await drawMarkers();
}

function adjustNavBar() {
  const dashLink = document.getElementById("nav-dash-link");
  const scanLink = document.getElementById("nav-scan-link");
  
  if (activeUser.role === 'staff') {
    if (dashLink) {
      dashLink.textContent = "My Tasks";
      dashLink.href = "staff.html";
    }
    if (scanLink) scanLink.style.display = "none";
  } else if (activeUser.role === 'admin') {
    if (dashLink) {
      dashLink.textContent = "Overview";
      dashLink.href = "admin.html";
    }
    if (scanLink) scanLink.style.display = "none";
  }
}

async function drawMarkers() {
  markerLayer.clearLayers();
  
  const issues = await db.getIssues();
  const categoryFilter = document.getElementById("filter-category").value;
  const statusFilter = document.getElementById("filter-status").value;

  issues.forEach(issue => {
    // 1. Filter checks
    const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'active') {
      matchesStatus = issue.status !== 'RESOLVED';
    } else if (statusFilter === 'resolved') {
      matchesStatus = issue.status === 'RESOLVED';
    }

    if (!matchesCategory || !matchesStatus) return;

    // 2. Select color based on workflow status
    let markerColor = "#e74c3c"; // Default Red (Critical/Open)
    if (issue.status === 'RESOLVED') {
      markerColor = "#2ecc71"; // Green
    } else if (issue.status === 'IN_PROGRESS' || issue.status === 'REOPENED') {
      markerColor = "#3498db"; // Blue
    } else if (issue.status === 'ASSIGNED' || issue.status === 'ACCEPTED' || issue.status === 'RESOLUTION_SUBMITTED') {
      markerColor = "#f1c40f"; // Yellow
    }

    // Use a custom divIcon to avoid loading external Leaflet marker image assets (Demo safety!)
    const customIcon = L.divIcon({
      html: `<div style="background-color: ${markerColor}; width: 14px; height: 14px; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
      className: "custom-leaflet-icon",
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    const lat = issue.latitude || 12.9715;
    const lng = issue.longitude || 77.5946;

    // 3. Popup detail string
    const popupContent = `
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width:180px;">
        <h4 style="margin: 0 0 5px 0; color: var(--primary); font-family:'Outfit'; font-weight:700;">Issue ${issue.id}</h4>
        <div style="font-size: 0.8rem; margin-bottom: 5px;">
          <strong>Category:</strong> ${issue.category.toUpperCase()}<br>
          <strong>Priority:</strong> ${issue.priorityLevel}<br>
          <strong>Status:</strong> ${issue.status.replace(/_/g, ' ')}<br>
          <strong>Dept:</strong> ${issue.department}
        </div>
        <button onclick="window.location.href='reports.html?id=${issue.id}'" 
                class="btn btn-primary" 
                style="padding: 3px 8px; font-size: 0.75rem; width:100%; border-radius:4px; margin-top:5px; height:auto;">
          View Workflow
        </button>
      </div>
    `;

    L.marker([lat, lng], { icon: customIcon })
      .bindPopup(popupContent)
      .addTo(markerLayer);
  });
}

window.applyMapFilters = function() {
  drawMarkers();
};

initMap();
