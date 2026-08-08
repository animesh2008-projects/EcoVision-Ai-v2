// js/sla-engine.js

const SLA_HOURS = {
  "CRITICAL": 2,
  "HIGH": 6,
  "MEDIUM": 24,
  "LOW": 72,
  "NORMAL": 168
};

export function getSlaDeadline(priorityLevel) {
  const normLevel = (priorityLevel || 'MEDIUM').toUpperCase();
  const hours = SLA_HOURS[normLevel] || SLA_HOURS["MEDIUM"];
  
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + hours);
  return deadline.toISOString();
}

export function evaluateSlaStatus(createdAtIso, status, priorityLevel) {
  // If already resolved, it's frozen
  if (status === 'RESOLVED') {
    return { breached: false, expired: false, label: "RESOLVED" };
  }

  const deadline = calculateDeadlineDate(createdAtIso, priorityLevel);
  const isBreached = new Date() > deadline;

  return {
    breached: isBreached,
    deadline: deadline.toISOString(),
    hoursRemaining: (deadline - new Date()) / (1000 * 60 * 60)
  };
}

function calculateDeadlineDate(createdAtIso, priorityLevel) {
  const normLevel = (priorityLevel || 'MEDIUM').toUpperCase();
  const hours = SLA_HOURS[normLevel] || SLA_HOURS["MEDIUM"];
  
  const createdDate = new Date(createdAtIso);
  createdDate.setHours(createdDate.getHours() + hours);
  return createdDate;
}
