// js/workflow-engine.js
import db from './firebase-config.js';
import { formatCountdown } from './utils.js';
import { verifyResolution } from './gemini.js';

export async function claimTask(issueId, staffId, staffName) {
  return db.updateIssue(issueId, {
    status: "ACCEPTED",
    assignedStaff: staffId,
    assignedStaffName: staffName
  });
}

export async function startTask(issueId, staffId, staffName) {
  return db.updateIssue(issueId, {
    status: "IN_PROGRESS",
    assignedStaff: staffId,
    assignedStaffName: staffName
  });
}

export async function submitResolution(issueId, file) {
  const issue = await db.getIssue(issueId);
  if (!issue) throw new Error("Issue not found");

  // 1. Upload resolution photo
  const resolutionImageUrl = await db.uploadImage(file, "resolutions");
  
  // Update state to RESOLUTION_SUBMITTED first
  await db.updateIssue(issueId, {
    status: "RESOLUTION_SUBMITTED",
    resolutionImageUrl: resolutionImageUrl
  });

  // 2. Call Gemini before/after verification
  try {
    const result = await verifyResolution(issue.imageUrl, resolutionImageUrl, issue.category, issue.description);
    
    // Save verification details to issue
    await db.updateIssue(issueId, {
      verification: {
        status: result.status,
        resolutionScore: result.resolutionScore,
        sceneMatch: result.sceneMatch,
        confidence: result.confidence,
        issueResolved: result.issueResolved,
        explanation: result.explanation
      }
    });

    // 3. Automated close / routing
    if (result.status === "likely_resolved") {
      await db.updateIssue(issueId, { status: "RESOLVED" });
    } else {
      await db.updateIssue(issueId, { status: "ADMIN_REVIEW" });
    }
  } catch(e) {
    console.error("AI verification failed, routing to Admin Review:", e);
    // Graceful fallback to admin review
    await db.updateIssue(issueId, {
      status: "ADMIN_REVIEW",
      verification: {
        status: "uncertain",
        resolutionScore: 50,
        sceneMatch: 50,
        confidence: 0.50,
        issueResolved: false,
        explanation: "AI verification service encountered an error. Manual review required."
      }
    });
  }
}

// Render dynamic staff tasks queue
export async function updateTaskQueue(currentUser) {
  const tasksContainer = document.getElementById("staff-tasks-queue");
  if (!tasksContainer) return;

  const issues = await db.getIssues();

  // Filter tasks: assigned to staff's department AND active (not resolved)
  const activeTasks = issues.filter(i => i.department === currentUser.department && i.status !== "RESOLVED");
  const completedTasks = issues.filter(i => i.department === currentUser.department && i.status === "RESOLVED");

  // Calculate stat counts
  let urgentCount = 0;
  let breachedCount = 0;

  activeTasks.forEach(t => {
    if (t.priorityLevel === "CRITICAL" || t.priorityLevel === "HIGH") urgentCount++;
    if (new Date(t.slaDeadline) < new Date()) breachedCount++;
  });

  // Write stats to DOM
  const assignedEl = document.getElementById("staff-assigned-count");
  const urgentEl = document.getElementById("staff-urgent-count");
  const breachedEl = document.getElementById("staff-breached-count");
  const completedEl = document.getElementById("staff-completed-count");

  if (assignedEl) assignedEl.textContent = activeTasks.length;
  if (urgentEl) urgentEl.textContent = urgentCount;
  if (breachedEl) breachedEl.textContent = breachedCount;
  if (completedEl) completedEl.textContent = completedTasks.length;

  if (activeTasks.length === 0) {
    tasksContainer.innerHTML = `
      <p style="text-align: center; color: var(--text-dark-secondary); padding: 3rem 0;">No active tasks assigned to your department. Great job!</p>
    `;
    return;
  }

  tasksContainer.innerHTML = "";
  activeTasks.forEach(task => {
    const card = document.createElement("div");
    card.className = "issue-card glass-card";
    
    // SLA timers
    const isBreached = new Date(task.slaDeadline) < new Date();
    const slaText = formatCountdown(task.slaDeadline);
    const slaClass = isBreached ? "sla-widget breached" : (task.priorityLevel === 'CRITICAL' ? "sla-widget alert" : "sla-widget");

    let buttonHtml = "";
    if (task.status === "ASSIGNED" || task.status === "OPEN" || !task.assignedStaff) {
      buttonHtml = `<button class="btn btn-primary" onclick="actionClaim('${task.id}')"><i class="fa-solid fa-check"></i> Claim Task</button>`;
    } else if (task.status === "ACCEPTED") {
      buttonHtml = `<button class="btn btn-primary" onclick="actionStart('${task.id}')"><i class="fa-solid fa-play"></i> Start Work</button>`;
    } else if (task.status === "IN_PROGRESS" || task.status === "REOPENED") {
      buttonHtml = `<button class="btn btn-primary" onclick="openTaskDetailsModal('${task.id}')"><i class="fa-solid fa-clipboard-check"></i> Submit Resolution</button>`;
    } else if (task.status === "RESOLUTION_SUBMITTED") {
      buttonHtml = `<span style="font-size:0.85rem; font-weight:600; color:var(--primary);"><i class="fa-solid fa-spinner fa-spin"></i> Verifying...</span>`;
    } else {
      buttonHtml = `<button class="btn btn-secondary" onclick="openTaskDetailsModal('${task.id}')">View Details</button>`;
    }

    card.innerHTML = `
      <img src="${task.imageUrl || 'https://via.placeholder.com/150'}" class="issue-card-img" alt="Task photo">
      <div class="issue-card-details">
        <div class="issue-card-header">
          <span class="issue-id">${task.id}</span>
          <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
            <span class="result-badge badge-${task.severity.toLowerCase()}">${task.severity}</span>
            <span class="status-badge status-${task.status.toLowerCase().replace(/_/g, '-')}">${task.status.replace(/_/g, ' ')}</span>
          </div>
        </div>
        <p class="issue-desc">${task.description}</p>
        <div class="issue-footer-meta" style="margin-bottom:0.75rem;">
          <div class="issue-meta-item"><i class="fa-solid fa-location-dot"></i> ${task.location.replace(/_/g, ' ')}</div>
          <div class="issue-meta-item"><i class="fa-regular fa-clock"></i> Reported ${new Date(task.createdAt).toLocaleDateString()}</div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
          <div class="${slaClass}">
            <i class="fa-regular fa-hourglass-half"></i>
            <span>${slaText}</span>
          </div>
          <div class="task-actions">
            ${buttonHtml}
          </div>
        </div>
      </div>
    `;

    // Clicking details card trigger modal
    card.addEventListener("click", (e) => {
      // Prevent click if clicking direct action buttons
      if (e.target.closest("button")) return;
      openTaskDetailsModal(task.id);
    });

    tasksContainer.appendChild(card);
  });
}

// Open task details modal
export async function openTaskDetailsModal(id) {
  const task = await db.getIssue(id);
  if (!task) return;

  document.getElementById("task-title").textContent = task.id;
  document.getElementById("task-before-img").src = task.imageUrl;
  document.getElementById("task-description").textContent = task.description;
  document.getElementById("task-location").textContent = task.location.toUpperCase().replace(/_/g, ' ');
  
  const statusBadge = document.getElementById("task-status-badge");
  statusBadge.textContent = task.status.replace(/_/g, ' ');
  statusBadge.className = `status-badge status-${task.status.toLowerCase().replace(/_/g, '-')}`;

  document.getElementById("task-priority-text").textContent = `${task.priorityLevel} (${task.priorityScore}/100)`;

  // SLA details
  const slaText = formatCountdown(task.slaDeadline);
  const isBreached = new Date(task.slaDeadline) < new Date();
  const slaWidget = document.getElementById("task-sla-widget");
  const slaSpan = document.getElementById("task-sla-text");
  
  if (slaWidget && slaSpan) {
    slaSpan.textContent = slaText;
    slaWidget.className = isBreached ? "sla-widget breached" : (task.priorityLevel === 'CRITICAL' ? "sla-widget alert" : "sla-widget");
  }

  // Set action buttons inside modal
  const actionSection = document.getElementById("workflow-action-section");
  const uploadSection = document.getElementById("resolution-upload-section");
  
  actionSection.innerHTML = "";
  uploadSection.style.display = "none";

  if (task.status === "ASSIGNED" || task.status === "OPEN" || !task.assignedStaff) {
    actionSection.innerHTML = `
      <button class="btn btn-primary" style="width:100%;" onclick="actionClaim('${task.id}')"><i class="fa-solid fa-check"></i> Accept & Claim Task</button>
    `;
  } else if (task.status === "ACCEPTED") {
    actionSection.innerHTML = `
      <button class="btn btn-primary" style="width:100%;" onclick="actionStart('${task.id}')"><i class="fa-solid fa-play"></i> Start Work on Site</button>
    `;
  } else if (task.status === "IN_PROGRESS" || task.status === "REOPENED") {
    uploadSection.style.display = "block";
  }

  // Open modal container
  document.getElementById("task-modal").classList.add("active");
}
window.openTaskDetailsModal = openTaskDetailsModal;
