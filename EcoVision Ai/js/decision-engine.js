// js/decision-engine.js
import db from './firebase-config.js';

// Haversine formula to compute distance in meters between two lat/lng coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // in meters
}

const LOCATION_WEIGHTS = {
  canteen: 100,
  library: 90,
  hostel: 85,
  science_block: 80,
  classroom: 60,
  corridor: 40,
  other: 30
};

export async function runDecisionEngine(aiResult, locationId, latitude, longitude) {
  const issues = await db.getIssues();

  // 1. Severity Score (30%)
  let severityVal = 10; // normal
  const severityStr = (aiResult.severity || 'normal').toLowerCase();
  if (severityStr === 'urgent') severityVal = 100;
  else if (severityStr === 'high') severityVal = 75;
  else if (severityStr === 'medium') severityVal = 50;
  else if (severityStr === 'low') severityVal = 25;
  
  const severityScore = severityVal * 0.30;

  // 2. Frequency Modifier (20%)
  // Count similar category issues within 50m in the last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  let nearbyCount = 0;
  issues.forEach(issue => {
    if (issue.category === aiResult.category && new Date(issue.createdAt) >= sevenDaysAgo) {
      if (latitude && longitude && issue.latitude && issue.longitude) {
        const dist = calculateDistance(latitude, longitude, issue.latitude, issue.longitude);
        if (dist <= 50) {
          nearbyCount++;
        }
      }
    }
  });

  const frequencyMultiplier = Math.min(nearbyCount * 10, 100);
  const frequencyScore = frequencyMultiplier * 0.20;

  // 3. Unresolved Department modifier (20%)
  // Get routed department
  const { routeCategory } = await import('./routing-engine.js');
  const targetDept = routeCategory(aiResult.category);
  const unresolvedCount = issues.filter(i => i.department === targetDept && i.status !== 'RESOLVED').length;
  
  const unresolvedMultiplier = Math.min(unresolvedCount * 15, 100);
  const unresolvedScore = unresolvedMultiplier * 0.20;

  // 4. Location weight (15%)
  const locKey = (locationId || 'other').toLowerCase();
  const locationVal = LOCATION_WEIGHTS[locKey] || LOCATION_WEIGHTS['other'];
  const locationScore = locationVal * 0.15;

  // 5. Confidence score (15%)
  const confidenceMultiplier = (aiResult.confidence || 0.90) * 100;
  const confidenceScore = confidenceMultiplier * 0.15;

  // Final priority sum
  const finalScore = Math.round(severityScore + frequencyScore + unresolvedScore + locationScore + confidenceScore);

  // Map to Priority Levels
  let priorityLevel = 'NORMAL';
  if (finalScore >= 90) priorityLevel = 'CRITICAL';
  else if (finalScore >= 75) priorityLevel = 'HIGH';
  else if (finalScore >= 50) priorityLevel = 'MEDIUM';
  else if (finalScore >= 25) priorityLevel = 'LOW';

  // Build Explanations & Transparency logs
  const explanations = [];
  explanations.push(`Severity weight is ${severityScore.toFixed(1)}/30 based on AI-assessed '${severityStr.toUpperCase()}' category severity.`);
  
  if (nearbyCount > 0) {
    explanations.push(`Frequency modifier added ${frequencyScore.toFixed(1)}/20 (+${frequencyMultiplier}%) due to ${nearbyCount} similar issues reported within 50 meters in the past 7 days.`);
  } else {
    explanations.push(`Frequency modifier added 0/20. No same-category issues reported nearby in the past 7 days.`);
  }

  if (unresolvedCount > 0) {
    explanations.push(`Unresolved modifier added ${unresolvedScore.toFixed(1)}/20 (+${unresolvedMultiplier}%) reflecting ${unresolvedCount} active unresolved tasks currently queued in the '${targetDept}' department.`);
  } else {
    explanations.push(`Unresolved modifier added 0/20. Department queue is currently clear.`);
  }

  explanations.push(`Location multiplier added ${locationScore.toFixed(1)}/15 based on zone impact factor: ${locKey.toUpperCase()} (${locationVal} pts).`);
  explanations.push(`Confidence parameter added ${confidenceScore.toFixed(1)}/15 reflecting ${Math.round(confidenceMultiplier)}% AI evaluation confidence.`);

  return {
    score: finalScore,
    priorityLevel,
    reasons: explanations,
    raw: {
      severity: severityScore,
      frequency: frequencyScore,
      unresolved: unresolvedScore,
      location: locationScore,
      confidence: confidenceScore
    }
  };
}
