// js/reports.js
import db from './firebase-config.js';
import auth from './auth.js';
import { formatCountdown, getCategoryEmoji, getCategoryTitle } from './utils.js';

let allIssues = [];
let filteredIssues = [];
let activeCategoryFilter = "all";
let activeUser = null;

// Initial loading
async function initReports() {
  activeUser = auth.checkPageAccess();
  if (!activeUser) return;
  auth.updateHeaderUI();

  // Adjust navbar link targets based on role
  adjustNavBar();

  // Load staff options for reassign list if admin
  if (activeUser.role === 'admin') {
    loadAdminReassignOptions();
  }

  // Fetch from DB
  const rawIssues = await db.getIssues();
  
  // Filter visible issues by role (students only see their own)
  if (activeUser.role === 'student') {
    allIssues = rawIssues.filter(i => i.reportedBy === activeUser.uid);
  } else {
    allIssues = rawIssues;
  }

  filteredIssues = [...allIssues];
  renderReportsGrid();

  // Check if deep link ?id=EV-XXXX is requested
  const urlParams = new URLSearchParams(window.location.search);
  const deepLinkId = urlParams.get('id');
  if (deepLinkId) {
    openDetailsModal(deepLinkId);
  }
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

// Render issues grid
function renderReportsGrid() {
  const grid = document.getElementById("reports-grid");
  if (!grid) return;

  if (filteredIssues.length === 0) {
    grid.innerHTML = `
      <p style="text-align: center; color: var(--text-dark-secondary); padding: 3rem 0;">No matching workflows found.</p>
    `;
    return;
  }

  grid.innerHTML = "";
  filteredIssues.forEach(issue => {
    const card = document.createElement("div");
    card.className = "issue-card glass-card";
    card.style.cursor = "pointer";
    card.onclick = () => openDetailsModal(issue.id);

    let severityBadge = `<span class="result-badge badge-${(issue.severity || 'medium').toLowerCase()}">${issue.severity || 'MEDIUM'}</span>`;
    let statusBadge = `<span class="status-badge status-${(issue.status || 'open').toLowerCase().replace(/_/g, '-')}">${(issue.status || 'OPEN').replace(/_/g, ' ')}</span>`;
    
    // SLA timer
    const isBreached = issue.slaDeadline && new Date(issue.slaDeadline) < new Date() && issue.status !== 'RESOLVED';
    const slaText = formatCountdown(issue.slaDeadline);
    const slaWidgetHtml = issue.status === 'RESOLVED' 
      ? `<span class="status-badge status-resolved"><i class="fa-solid fa-check"></i> RESOLVED</span>`
      : `<div class="${isBreached ? 'sla-widget breached' : 'sla-widget'}" style="font-size:0.75rem; padding:0.25rem 0.5rem;">
          <i class="fa-regular fa-clock"></i> <span>${slaText}</span>
         </div>`;

    card.innerHTML = `
      <img src="${issue.imageUrl || 'https://via.placeholder.com/150'}" class="issue-card-img" alt="Issue photo">
      <div class="issue-card-details">
        <div class="issue-card-header">
          <span class="issue-id">${issue.id}</span>
          <div style="display:flex; gap:0.5rem; align-items:center;">
            ${severityBadge}
            ${statusBadge}
          </div>
        </div>
        <p class="issue-desc">${issue.description || 'No description provided.'}</p>
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
          <div class="issue-footer-meta">
            <div class="issue-meta-item"><i class="fa-solid fa-location-dot"></i> ${(issue.location || 'other').replace(/_/g, ' ')}</div>
            <div class="issue-meta-item"><i class="fa-solid fa-envelope"></i> ${issue.reportedByName || 'Reporter'}</div>
          </div>
          <div>
            ${slaWidgetHtml}
          </div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Category filter bindings
window.filterCategory = function(category, buttonElem) {
  activeCategoryFilter = category;
  
  // Set active class on buttons
  const buttons = buttonElem.parentElement.querySelectorAll("button");
  buttons.forEach(b => b.classList.remove("active"));
  buttonElem.classList.add("active");

  applyFilters();
};

window.searchReports = function() {
  applyFilters();
};

function applyFilters() {
  const query = document.getElementById("search-input").value.trim().toLowerCase();
  
  filteredIssues = allIssues.filter(issue => {
    const matchesCategory = activeCategoryFilter === "all" || (issue.category || "").toLowerCase() === activeCategoryFilter;
    const matchesSearch = (issue.id || "").toLowerCase().includes(query) || 
                          (issue.description || "").toLowerCase().includes(query) ||
                          (issue.location || "").toLowerCase().includes(query) ||
                          issue.assignedStaffName?.toLowerCase().includes(query) ||
                          (issue.department || "").toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  renderReportsGrid();
}

// Modal management
let activeDetailsId = null;

export async function openDetailsModal(id) {
  activeDetailsId = id;
  const issue = await db.getIssue(id);
  if (!issue) return;

  document.getElementById("det-title").textContent = `Issue ${issue.id}`;
  document.getElementById("det-before-img").src = issue.imageUrl || 'https://via.placeholder.com/150';
  document.getElementById("det-description").textContent = issue.description || "No description provided.";
  document.getElementById("det-category").textContent = getCategoryTitle(issue.category || "other");
  document.getElementById("det-location").textContent = (issue.location || "other").toUpperCase().replace(/_/g, ' ');
  document.getElementById("det-assigned").textContent = issue.assignedStaffName || "Unassigned";
  document.getElementById("det-priority").textContent = `${issue.priorityLevel || "NORMAL"} (Score: ${issue.priorityScore || 0})`;

  // Render after image if resolution is uploaded
  const afterImgContainer = document.getElementById("det-after-img-container");
  const compareBox = afterImgContainer.parentElement;
  if (issue.resolutionImageUrl) {
    document.getElementById("det-after-img").src = issue.resolutionImageUrl;
    afterImgContainer.style.display = "block";
    compareBox.style.gridTemplateColumns = "1fr 1fr";
  } else {
    afterImgContainer.style.display = "none";
    compareBox.style.gridTemplateColumns = "1fr";
  }

  // Render AI Verification block if verified
  const verificationBox = document.getElementById("det-verification-box");
  if (issue.verification) {
    document.getElementById("det-verify-exp").textContent = issue.verification.explanation;
    document.getElementById("det-verify-score").textContent = `${issue.verification.resolutionScore}%`;
    document.getElementById("det-verify-scene").textContent = `${issue.verification.sceneMatch}%`;
    verificationBox.style.display = "block";
  } else {
    verificationBox.style.display = "none";
  }

  // Render SLA details
  const slaContainer = document.getElementById("det-sla-container");
  const slaWidget = document.getElementById("det-sla-widget");
  const slaTextSpan = document.getElementById("det-sla-text");
  
  if (issue.status === 'RESOLVED') {
    slaContainer.style.display = "none";
  } else {
    slaContainer.style.display = "block";
    const isBreached = issue.slaDeadline && new Date(issue.slaDeadline) < new Date();
    slaTextSpan.textContent = formatCountdown(issue.slaDeadline);
    slaWidget.className = isBreached ? "sla-widget breached" : ((issue.priorityLevel || 'NORMAL') === 'CRITICAL' ? "sla-widget alert" : "sla-widget");
  }

  // Load audit timeline logs
  await loadTimeline(issue.id);

  // Load admin overrides panel if admin
  const adminPanel = document.getElementById("admin-actions-panel");
  if (activeUser.role === 'admin') {
    adminPanel.style.display = "block";
    // Set reassign selector to active staff
    document.getElementById("admin-reassign-staff").value = issue.assignedStaff || "";
  } else {
    adminPanel.style.display = "none";
  }

  document.getElementById("details-modal").classList.add("active");
}
window.openDetailsModal = openDetailsModal;

function closeDetailsModal() {
  document.getElementById("details-modal").classList.remove("active");
  activeDetailsId = null;
}
window.closeDetailsModal = closeDetailsModal;

// Render Audit Logs Timeline
async function loadTimeline(issueId) {
  const logs = await db.getWorkflowLogs(issueId);
  const container = document.getElementById("det-timeline");
  if (!container) return;

  container.innerHTML = "";
  if (logs.length === 0) {
    container.innerHTML = "<p style='font-size:0.85rem; color:var(--text-dark-secondary);'>No logs available.</p>";
    return;
  }

  logs.forEach(log => {
    const item = document.createElement("div");
    item.className = "timeline-item";
    
    const timeFormatted = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + 
                          " " + new Date(log.timestamp).toLocaleDateString();

    item.innerHTML = `
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <div style="display:flex; justify-content:space-between; align-items:baseline;">
          <span class="timeline-title">${log.toState.replace(/_/g, ' ')}</span>
          <span class="timeline-time">${timeFormatted}</span>
        </div>
        <div class="timeline-note">${log.note}</div>
        <div style="font-size:0.75rem; color:var(--text-dark-secondary); margin-top:0.15rem; font-style:italic;">By: ${log.actorName}</div>
      </div>
    `;
    container.appendChild(item);
  });
}

// Load staff dropdown
async function loadAdminReassignOptions() {
  const select = document.getElementById("admin-reassign-staff");
  if (!select) return;

  // Query mock users/profiles who are staff
  // We hardcode the preset options for simple local configuration compatibility
  select.innerHTML = `
    <option value="">Unassigned</option>
    <option value="staff-sanitation">Marcus Vance (Sanitation)</option>
    <option value="staff-water">Elena Rostova (Water)</option>
    <option value="staff-electrical">David Chen (Electrical)</option>
    <option value="staff-grounds">Sarah Jenkins (Grounds)</option>
  `;
}

// Admin Action: Reassign Staff member
window.adminReassign = async function() {
  if (!activeDetailsId) return;
  const select = document.getElementById("admin-reassign-staff");
  const staffId = select.value;
  const staffName = select.options[select.selectedIndex].text;

  if (confirm(`Reassign this task to ${staffName}?`)) {
    // Determine department based on staff member
    let department = "General Maintenance";
    if (staffId === "staff-sanitation") department = "Sanitation";
    else if (staffId === "staff-water") department = "Water Management";
    else if (staffId === "staff-electrical") department = "Electrical";
    else if (staffId === "staff-grounds") department = "Grounds & Maintenance";

    await db.updateIssue(activeDetailsId, {
      assignedStaff: staffId,
      assignedStaffName: staffName,
      department: department,
      status: "ASSIGNED"
    });

    showToast("Task reassigned. Workflow log created.", 'success');
    await loadTimeline(activeDetailsId);
    initReports();
  }
};

// Admin Action: Force Resolve issue bypassing AI verification
window.adminForceResolve = async function() {
  if (!activeDetailsId) return;
  if (confirm("Force this issue to RESOLVED status? This will close the workflow.")) {
    await db.updateIssue(activeDetailsId, {
      status: "RESOLVED"
    });
    showToast("Issue status overridden to RESOLVED.", 'success');
    closeDetailsModal();
    initReports();
  }
};

// Admin Action: Reopen issue
window.adminReopen = async function() {
  if (!activeDetailsId) return;
  if (confirm("Reopen this issue and route back to Staff task queue?")) {
    await db.updateIssue(activeDetailsId, {
      status: "REOPENED",
      resolutionImageUrl: null,
      verification: null
    });
    showToast("Issue status reopened.", 'success');
    closeDetailsModal();
    initReports();
  }
};

initReports();
