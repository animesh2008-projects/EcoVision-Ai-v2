// js/sla-engine-helpers.js

export const SLA_HOURS = {
  urgent: 2,
  high: 6,
  medium: 24,
  low: 48
};

export function getSlaDeadline(severityStr) {
  const sev = (severityStr || 'medium').toLowerCase();
  const hrs = SLA_HOURS[sev] || 24;
  return new Date(Date.now() + hrs * 60 * 60 * 1000).toISOString();
}
