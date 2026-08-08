// js/notifications.js
import db from './firebase-config.js';
import { formatTimeAgo } from './utils.js';

export function setupNotifications(userId) {
  const bell = document.getElementById("notif-bell");
  const panel = document.getElementById("notifications-panel");

  if (!bell || !panel) return;

  // Toggle notifications panel
  bell.addEventListener("click", (e) => {
    e.stopPropagation();
    panel.classList.toggle("active");
    
    if (panel.classList.contains("active")) {
      markNotifsRead(userId);
    }
  });

  // Close panel on body click
  document.body.addEventListener("click", () => {
    panel.classList.remove("active");
  });

  panel.addEventListener("click", (e) => {
    e.stopPropagation(); // prevent closing when clicking inside panel
  });

  // Pull notifications initially and start polling/updates
  updateNotificationsUI(userId);
  setInterval(() => updateNotificationsUI(userId), 15000); // refresh every 15s
}

async function updateNotificationsUI(userId) {
  const countBadge = document.getElementById("notif-count");
  const listContainer = document.getElementById("notif-list-container");
  if (!listContainer) return;

  const notifs = await db.getNotifications(userId);
  const unreadCount = notifs.filter(n => !n.read).length;

  // Render badge
  if (unreadCount > 0) {
    countBadge.textContent = unreadCount;
    countBadge.style.display = "flex";
  } else {
    countBadge.style.display = "none";
  }

  // Render list
  if (notifs.length === 0) {
    listContainer.innerHTML = `
      <p style="text-align: center; font-size: 0.85rem; padding: 1.5rem 0; color: var(--text-dark-secondary);">No new notifications.</p>
    `;
    return;
  }

  listContainer.innerHTML = "";
  notifs.forEach(n => {
    const item = document.createElement("div");
    item.className = n.read ? "notif-item" : "notif-item unread";
    
    // Redirect click to reports deep link if it's an issue report
    const match = n.text.match(/EV-\d{4}/);
    if (match) {
      item.onclick = () => {
        window.location.href = `reports.html?id=${match[0]}`;
      };
    }

    item.innerHTML = `
      <div>${n.text}</div>
      <span class="notif-time">${formatTimeAgo(n.createdAt)}</span>
    `;
    listContainer.appendChild(item);
  });
}

async function markNotifsRead(userId) {
  await db.markNotificationsRead(userId);
  const countBadge = document.getElementById("notif-count");
  if (countBadge) countBadge.style.display = "none";
}

window.clearNotifs = function() {
  const user = db.getCurrentUser();
  if (user) {
    markNotifsRead(user.uid).then(() => updateNotificationsUI(user.uid));
  }
};
