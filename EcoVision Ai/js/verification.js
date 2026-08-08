// js/verification.js

/**
 * Validates the verification result returned by the backend.
 * Checks if the scene match and resolution scores cross the compliance thresholds.
 */
export function evaluateVerificationThresholds(result) {
  const SCENE_MATCH_THRESHOLD = 70; // minimum scene consistency percentage
  const RESOLUTION_THRESHOLD = 80;  // minimum cleaning completion percentage

  const isSceneConsistent = (result.sceneMatch || 0) >= SCENE_MATCH_THRESHOLD;
  const isResolutionSufficient = (result.resolutionScore || 0) >= RESOLUTION_THRESHOLD;

  let computedStatus = "uncertain";
  if (isSceneConsistent && isResolutionSufficient) {
    computedStatus = "likely_resolved";
  } else if (isSceneConsistent && !isResolutionSufficient) {
    computedStatus = "partially_resolved";
  } else if (!isSceneConsistent) {
    computedStatus = "uncertain"; // possible scene mismatch or fake image
  }

  return {
    isSuccess: computedStatus === "likely_resolved",
    status: computedStatus,
    reasons: [
      isSceneConsistent 
        ? `Scene consistency checked: SUCCESS (${result.sceneMatch}% background match).`
        : `Scene consistency checked: WARNING (${result.sceneMatch}% match - camera angle or location mismatch).`,
      isResolutionSufficient
        ? `Remediation quantity checked: SUCCESS (${result.resolutionScore}% issue cleared).`
        : `Remediation quantity checked: WARNING (${result.resolutionScore}% cleared - residual issues remain).`
    ]
  };
}

/**
 * Returns formatted CSS class and icons for verification badges
 */
export function getVerificationStatusBadge(status) {
  const normStatus = (status || 'uncertain').toLowerCase();
  
  let label = "Uncertain";
  let icon = "fa-question-circle";
  let cssClass = "status-badge status-admin-review";

  if (normStatus === "likely_resolved") {
    label = "Likely Resolved";
    icon = "fa-circle-check";
    cssClass = "status-badge status-resolved";
  } else if (normStatus === "partially_resolved") {
    label = "Partially Resolved";
    icon = "fa-circle-exclamation";
    cssClass = "status-badge status-accepted";
  } else if (normStatus === "not_resolved") {
    label = "Not Resolved";
    icon = "fa-circle-xmark";
    cssClass = "status-badge status-admin-review";
  }

  return { label, icon, cssClass };
}
