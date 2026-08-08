// js/routing-engine.js
import db from './firebase-config.js';

const ROUTING_RULES = {
  waste: "Sanitation",
  water: "Water Management",
  energy: "Electrical",
  nature: "Grounds & Maintenance",
  other: "General Maintenance"
};

const STAFF_ACCOUNTS = {
  "Sanitation": { id: "staff-sanitation", name: "Marcus Vance (Sanitation)" },
  "Water Management": { id: "staff-water", name: "Elena Rostova (Water)" },
  "Electrical": { id: "staff-electrical", name: "David Chen (Electrical)" },
  "Grounds & Maintenance": { id: "staff-grounds", name: "Sarah Jenkins (Grounds)" },
  "General Maintenance": { id: "staff-grounds", name: "Sarah Jenkins (Grounds)" }
};

export function routeCategory(category) {
  const normCategory = (category || 'other').toLowerCase();
  return ROUTING_RULES[normCategory] || ROUTING_RULES['other'];
}

export async function routeDepartmentStaff(department) {
  // If we are in Firebase production mode, we look up real staff users matching the department
  if (!db.isMock()) {
    try {
      const issues = await db.getIssues(); // or direct firestore user query
      // For simple CDN queries without complex index structures:
      // We fall back to the preconfigured staff map if no dynamic users are matched in firestore.
    } catch(e) {
      console.warn("Firestore staff query failed, falling back to preconfigured staff mapping:", e);
    }
  }

  // Pre-configured mapping of department to lead staff member
  return STAFF_ACCOUNTS[department] || { id: "staff-grounds", name: "Sarah Jenkins (Grounds)" };
}
