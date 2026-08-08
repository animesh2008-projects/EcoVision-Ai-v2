// js/theme.js

// 1. Immediately apply theme preference as soon as body is parsed (zero-flash)
const savedTheme = localStorage.getItem("ecovision_theme") || "dark";

if (savedTheme === "light") {
  // If user prefers Light Mode, strip dark-theme class the microsecond body is created
  if (document.body) {
    document.body.classList.remove("dark-theme");
  } else {
    const observer = new MutationObserver(() => {
      if (document.body) {
        document.body.classList.remove("dark-theme");
        observer.disconnect();
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
}

// 2. Set up toggle event listener once DOM is fully parsed
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("theme-toggle-btn");
  if (!toggleBtn) return;

  // Set initial icon/text and colors based on active theme
  const currentActiveTheme = document.body.classList.contains("dark-theme") ? "dark" : "light";
  updateToggleIcon(toggleBtn, currentActiveTheme);

  toggleBtn.addEventListener("click", () => {
    const isDark = document.body.classList.contains("dark-theme");
    const newTheme = isDark ? "light" : "dark";
    
    if (newTheme === "dark") {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
    
    localStorage.setItem("ecovision_theme", newTheme);
    updateToggleIcon(toggleBtn, newTheme);
  });
});

function updateToggleIcon(btn, theme) {
  const icon = btn.querySelector("i");
  if (icon) {
    if (theme === "dark") {
      icon.className = "fa-solid fa-sun";
      btn.title = "Switch to Light Mode";
      icon.style.color = "#2ecc71"; // neon green
    } else {
      icon.className = "fa-solid fa-moon";
      btn.title = "Switch to Dark Mode";
      icon.style.color = "#1a4d2e"; // dark forest green
    }
  }
}

// Global Custom Toast Notification system
window.showToast = function(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  
  let iconClass = "fa-circle-check";
  if (type === "error") iconClass = "fa-circle-xmark";
  else if (type === "info") iconClass = "fa-circle-info";
  
  toast.innerHTML = `
    <i class="fa-solid ${iconClass}"></i>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  
  // Slide out and remove after 4s
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(60px)";
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
};
