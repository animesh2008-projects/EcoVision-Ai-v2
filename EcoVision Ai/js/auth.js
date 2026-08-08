// js/auth.js
import db from './firebase-config.js';

const auth = {
  getCurrentUser() {
    return db.getCurrentUser();
  },

  async login(email, password) {
    const result = await db.login(email, password);
    if (result.success) {
      this.redirectByRole(result.user.role);
    }
    return result;
  },

  async register(name, email, password, role, department = "none") {
    const result = await db.register(name, email, password, role, department);
    if (result.success) {
      this.redirectByRole(result.user.role);
    }
    return result;
  },

  async logout() {
    await db.logout();
  },

  redirectByRole(role) {
    if (role === "student") {
      window.location.href = "dashboard.html";
    } else if (role === "staff") {
      window.location.href = "staff.html";
    } else if (role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "index.html";
    }
  },

  checkPageAccess() {
    const user = this.getCurrentUser();
    const currentPage = window.location.pathname.split("/").pop();

    // Pages that don't require authentication
    const publicPages = ["index.html", "login.html", "register.html", ""];
    
    if (!user) {
      if (!publicPages.includes(currentPage)) {
        console.warn("Unauthorized access. Redirecting to login.html");
        window.location.href = "login.html";
      }
      return null;
    }

    // If logged in, prevent accessing login/register
    if (currentPage === "login.html" || currentPage === "register.html") {
      this.redirectByRole(user.role);
      return user;
    }

    // Role-specific guards
    if (user.role === "student") {
      const allowedStudentPages = ["dashboard.html", "scanner.html", "reports.html", "map.html"];
      if (!allowedStudentPages.includes(currentPage)) {
        console.warn("Student unauthorized for this page. Redirecting to Student Dashboard.");
        window.location.href = "dashboard.html";
      }
    } else if (user.role === "staff") {
      const allowedStaffPages = ["staff.html", "map.html", "reports.html"];
      if (!allowedStaffPages.includes(currentPage)) {
        console.warn("Staff unauthorized for this page. Redirecting to Staff Dashboard.");
        window.location.href = "staff.html";
      }
    } else if (user.role === "admin") {
      const allowedAdminPages = ["admin.html", "map.html", "analytics.html", "reports.html"];
      if (!allowedAdminPages.includes(currentPage)) {
        console.warn("Admin unauthorized for this page. Redirecting to Admin Dashboard.");
        window.location.href = "admin.html";
      }
    }

    return user;
  },

  updateHeaderUI() {
    const user = this.getCurrentUser();
    if (!user) return;

    // Set user names and badges in dashboard headers if elements exist
    const userNameEl = document.getElementById("header-user-name");
    const userRoleEl = document.getElementById("header-user-role");
    const logoutBtn = document.getElementById("header-logout-btn");

    if (userNameEl) userNameEl.textContent = user.displayName;
    if (userRoleEl) {
      userRoleEl.textContent = user.role.toUpperCase();
      userRoleEl.className = `role-badge badge-${user.role}`;
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.logout();
      });
    }

    // Show Demo Mode indicator if db is in mock state
    if (db.isMock()) {
      const demoIndicator = document.createElement("div");
      demoIndicator.id = "demo-badge";
      demoIndicator.innerHTML = `
        <span class="pulse-dot"></span>
        <span>DEMO MODE ACTIVE</span>
        <button id="reset-demo-data-btn" title="Reset Demo Data" style="background:none;border:none;color:inherit;cursor:pointer;margin-left:8px;font-weight:bold;">🔄 Reset</button>
      `;
      document.body.appendChild(demoIndicator);

      const resetBtn = document.getElementById("reset-demo-data-btn");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          if (confirm("Reset local storage mock data back to 15 default records? Any changes will be lost.")) {
            db.resetDemoData();
          }
        });
      }
    }
  }
};

window.auth = auth;
export default auth;
