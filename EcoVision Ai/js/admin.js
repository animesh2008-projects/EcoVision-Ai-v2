// js/admin.js
import db from './firebase-config.js';
import auth from './auth.js';
import { formatCountdown } from './utils.js';
import { setupNotifications } from './notifications.js';

let activeUser = null;

async function initAdmin() {
  activeUser = auth.checkPageAccess();
  if (!activeUser) return;
  auth.updateHeaderUI();
  setupNotifications(activeUser.uid);

  const issues = await db.getIssues();

  // 1. Calculate and render metrics
  const activeCount = issues.filter(i => i.status !== 'RESOLVED').length;
  const criticalCount = issues.filter(i => i.status !== 'RESOLVED' && i.priorityLevel === 'CRITICAL').length;
  const breachedCount = issues.filter(i => i.status !== 'RESOLVED' && new Date(i.slaDeadline) < new Date()).length;
  const reviewCount = issues.filter(i => i.status === 'ADMIN_REVIEW' || i.status === 'REVIEW_REQUIRED').length;

  document.getElementById("adm-active-count").textContent = activeCount;
  document.getElementById("adm-critical-count").textContent = criticalCount;
  document.getElementById("adm-breached-count").textContent = breachedCount;
  document.getElementById("adm-review-count").textContent = reviewCount;

  // 2. Render high priority queue
  renderPriorityQueue(issues);

  // 3. Render review queue list
  renderReviewQueue(issues);

  // 4. Render hotspots list
  renderHotspotsList(issues);
}

function renderPriorityQueue(issues) {
  const tbody = document.getElementById("admin-priority-table-body");
  if (!tbody) return;

  const activeIssues = issues.filter(i => i.status !== 'RESOLVED');
  // Sort by priorityScore desc
  const sorted = activeIssues.sort((a,b) => b.priorityScore - a.priorityScore);

  if (sorted.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; color: var(--text-dark-secondary); padding: 2rem 0;">No active tasks. Campus operations are fully normalized!</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = "";
  sorted.forEach(issue => {
    const tr = document.createElement("tr");
    tr.style.cursor = "pointer";
    tr.onclick = (e) => {
      if (e.target.closest("button")) return;
      window.location.href = `reports.html?id=${issue.id}`;
    };

    const isBreached = issue.slaDeadline && new Date(issue.slaDeadline) < new Date();
    const slaText = formatCountdown(issue.slaDeadline);
    const slaHtml = isBreached 
      ? `<span class="status-badge status-admin-review" style="font-size:0.7rem;">BREACHED</span>` 
      : `<span style="font-size:0.8rem; font-weight:600;">${slaText === "No deadline" ? "No deadline" : slaText.split(" ")[0] + " remaining"}</span>`;

    const categoryText = (issue.category || 'other').toUpperCase();
    const locationText = (issue.location || 'other').replace(/_/g, ' ').toUpperCase();
    const priorityLevelText = issue.priorityLevel || 'NORMAL';
    const priorityClass = priorityLevelText.toLowerCase();
    const statusText = (issue.status || 'OPEN').replace(/_/g, ' ');
    const statusClass = (issue.status || 'open').toLowerCase().replace(/_/g, '-');

    tr.innerHTML = `
      <td style="font-weight:700; color:var(--primary);">${issue.id}</td>
      <td>${categoryText}</td>
      <td>${locationText}</td>
      <td style="font-weight:bold;">${issue.priorityScore || 0}/100</td>
      <td><span class="result-badge badge-${priorityClass}" style="padding:0.15rem 0.5rem; font-size:0.7rem;">${priorityLevelText}</span></td>
      <td><span class="status-badge status-${statusClass}">${statusText}</span></td>
      <td>${slaHtml}</td>
      <td><button class="btn btn-secondary" onclick="window.location.href='reports.html?id=${issue.id}'" style="padding:3px 8px; font-size:0.7rem; border-radius:4px; height:auto;">Workflow</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function renderReviewQueue(issues) {
  const container = document.getElementById("admin-review-queue-list");
  if (!container) return;

  const reviewIssues = issues.filter(i => i.status === 'ADMIN_REVIEW' || i.status === 'REVIEW_REQUIRED');

  if (reviewIssues.length === 0) {
    container.innerHTML = `
      <p style="color: var(--text-dark-secondary); font-size: 0.9rem; text-align: center; padding: 2rem 0;">No unresolved AI verifications.</p>
    `;
    return;
  }

  container.innerHTML = "";
  reviewIssues.forEach(issue => {
    const item = document.createElement("div");
    item.className = "review-item";
    
    // Check verification status
    const status = issue.verification?.status || "uncertain";
    const score = issue.verification?.resolutionScore || 50;

    item.innerHTML = `
      <div>
        <div style="font-weight:700; color:var(--primary); font-size:0.9rem;">Issue ${issue.id}</div>
        <div style="font-size:0.8rem; color:var(--text-dark-secondary); margin-top:0.15rem;">
          Verification: <strong>${status.toUpperCase()} (${score}%)</strong><br>
          Dept: ${issue.department}
        </div>
      </div>
      <button class="btn btn-primary" onclick="window.location.href='reports.html?id=${issue.id}'" style="padding:0.4rem 0.8rem; font-size:0.75rem; border-radius:var(--radius-sm); height:auto;">Review</button>
    `;
    container.appendChild(item);
  });
}

function renderHotspotsList(issues) {
  const container = document.getElementById("admin-hotspots-list");
  if (!container) return;

  const locCounts = {};
  issues.forEach(i => {
    const loc = i.location || "other";
    locCounts[loc] = (locCounts[loc] || 0) + 1;
  });

  const sorted = Object.entries(locCounts).sort((a,b) => b[1] - a[1]).slice(0, 4);

  container.innerHTML = "";
  sorted.forEach(([locKey, count]) => {
    const labelClass = count > 3 ? "badge-urgent" : "badge-medium";
    const item = document.createElement("div");
    item.className = "glass-card";
    item.style.padding = "0.75rem 1rem";
    item.style.display = "flex";
    item.style.justify = "space-between";
    item.style.alignItems = "center";
    item.style.fontSize = "0.85rem";

    item.innerHTML = `
      <div style="font-weight:700;">${locKey.toUpperCase().replace(/_/g, ' ')}</div>
      <span class="result-badge ${labelClass}" style="padding:0.25rem 0.5rem; font-size:0.75rem;">${count} INCIDENTS</span>
    `;
    container.appendChild(item);
  });
}

// Modal Scenario Trigger binds
function triggerDemoScenarioModal() {
  document.getElementById("demo-scenario-modal").classList.add("active");
}
window.triggerDemoScenarioModal = triggerDemoScenarioModal;

function closeDemoScenarioModal() {
  document.getElementById("demo-scenario-modal").classList.remove("active");
}
window.closeDemoScenarioModal = closeDemoScenarioModal;

window.runScenario = async function(scenarioKey) {
  closeDemoScenarioModal();
  
  if (scenarioKey === 'waste_report') {
    // Scenario A: Waste Scanner Detection
    await db.createIssue({
      reportedBy: "student-1",
      reportedByName: "Alex Rivera",
      imageUrl: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop&q=60",
      category: "waste",
      subcategory: "overflowing_bin",
      description: "Overflowing plastic trash and paper wrappers surrounding the canteen seating bench area.",
      severity: "high",
      confidence: 0.92,
      location: "canteen",
      priorityScore: 82,
      priorityLevel: "HIGH",
      department: "Sanitation",
      assignedStaff: "staff-sanitation",
      assignedStaffName: "Marcus Vance (Sanitation)",
      status: "OPEN",
      slaDeadline: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
    });
    showToast("Scenario A Activated: Waste issue logged in Open status at Canteen. Dispatched to Sanitation.", 'info');
  } 
  else if (scenarioKey === 'water_leak') {
    // Scenario B: Critical Water Leak
    await db.createIssue({
      reportedBy: "student-1",
      reportedByName: "Alex Rivera",
      imageUrl: "https://images.unsplash.com/photo-1585832770485-e68a5dbfad52?w=600&auto=format&fit=crop&q=60",
      category: "water",
      subcategory: "leaking_pipe",
      description: "Severe main line pipe rupture near Science Lab Block wall pouring massive clean water volumes.",
      severity: "urgent",
      confidence: 0.95,
      location: "science_block",
      priorityScore: 94,
      priorityLevel: "CRITICAL",
      department: "Water Management",
      assignedStaff: "staff-water",
      assignedStaffName: "Elena Rostova (Water)",
      status: "OPEN",
      slaDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
    });
    showToast("Scenario B Activated: Critical Water Leak logged near Science Lab. Dispatched to Water Management.", 'info');
  } 
  else if (scenarioKey === 'sla_breach') {
    // Scenario C: SLA Breach Escalation
    // We look for an open issue and simulate breach by setting creation time to 12 hours ago
    const issues = await db.getIssues();
    const target = issues.find(i => i.status !== 'RESOLVED');
    if (target) {
      await db.updateIssue(target.id, {
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        slaDeadline: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // breached 4 hours ago
      });
      showToast(`Scenario C Activated: SLA for Issue ${target.id} set to Expired. Escalation triggered.`, 'info');
    } else {
      showToast("No active issues found to simulate breach. Run Scenario A or B first.", 'success');
    }
  } 
  else if (scenarioKey === 'failed_verification') {
    // Scenario D: Failed AI verification
    // Simulates staff completing task but verification failing (e.g. they uploaded an unrelated image)
    const newIssue = await db.createIssue({
      reportedBy: "student-1",
      reportedByName: "Alex Rivera",
      imageUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=60",
      category: "water",
      subcategory: "overflowing_tank",
      description: "Water tank on canteen roof overflowing.",
      severity: "high",
      confidence: 0.91,
      location: "canteen",
      priorityScore: 88,
      priorityLevel: "HIGH",
      department: "Water Management",
      assignedStaff: "staff-water",
      assignedStaffName: "Elena Rostova (Water)",
      status: "RESOLUTION_SUBMITTED",
      slaDeadline: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
    });

    await db.updateIssue(newIssue.id, {
      resolutionImageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=60", // unrelated image
      status: "ADMIN_REVIEW",
      verification: {
        status: "uncertain",
        resolutionScore: 45,
        sceneMatch: 35,
        confidence: 0.70,
        issueResolved: false,
        explanation: "AI verification uncertain. The scene match is low (35%). The resolution photo appears to depict a server room instead of a rooftop water tank."
      }
    });

    showToast(`Scenario D Activated: Issue ${newIssue.id} resolution submitted with low scene match rate. Routed to Admin Review queue.`, 'info');
  }

  // Refresh admin UI
  initAdmin();
};

initAdmin();
