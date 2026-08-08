// js/firebase-config.js
import mockDb from './mock-db.js';

// Unified db adapter routing operations exclusively to Mock DB (LocalStorage)
const db = {
  isMock() {
    return true;
  },

  getMode() {
    return "mock";
  },

  async login(email, password) {
    return mockDb.login(email, password);
  },

  async register(name, email, password, role, department = "none") {
    return mockDb.register(name, email, password, role, department);
  },

  getCurrentUser() {
    return mockDb.getCurrentUser();
  },

  async logout() {
    mockDb.logout();
    window.location.href = "login.html";
  },

  // Issues operations
  async getIssues() {
    return mockDb.getIssues();
  },

  async getIssue(id) {
    return mockDb.getIssue(id);
  },

  async createIssue(issueData) {
    return mockDb.createIssue(issueData);
  },

  async updateIssue(id, updates) {
    return mockDb.updateIssue(id, updates);
  },

  // Workflow Logs
  async getWorkflowLogs(issueId) {
    return mockDb.getWorkflowLogs(issueId);
  },

  async addWorkflowLog(logData) {
    return mockDb.addWorkflowLog(logData);
  },

  // Notifications
  async getNotifications(userId) {
    return mockDb.getNotifications(userId);
  },

  async addNotification(notificationData) {
    return mockDb.addNotification(notificationData);
  },

  async markNotificationsRead(userId) {
    return mockDb.markNotificationsRead(userId);
  },

  // Image Upload helper (converts to base64 Object URLs locally)
  async uploadImage(file, path = "reports") {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  },

  saveFirebaseConfig(config) {
    mockDb.saveFirebaseConfig(config);
  },
  getFirebaseConfig() {
    return mockDb.getFirebaseConfig();
  },
  clearFirebaseConfig() {
    mockDb.clearFirebaseConfig();
  },
  getDbMode() {
    return "mock";
  },
  resetDemoData() {
    mockDb.resetData();
  }
};

// Seed local storage mock data on first load
mockDb.init();

window.db = db;
export default db;

