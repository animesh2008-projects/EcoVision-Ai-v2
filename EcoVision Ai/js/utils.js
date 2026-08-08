// js/utils.js

export function formatTimeAgo(isoString) {
  const date = new Date(isoString);
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval + " years ago";
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval + " months ago";
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + (interval === 1 ? " day ago" : " days ago");
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + (interval === 1 ? " hour ago" : " hours ago");
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + (interval === 1 ? " minute ago" : " minutes ago");
  return "just now";
}

export function getHoursRemaining(isoDeadlineString) {
  if (!isoDeadlineString) return 0;
  const deadline = new Date(isoDeadlineString);
  if (isNaN(deadline.getTime())) return 0;
  const differenceMs = deadline - new Date();
  return differenceMs / (1000 * 60 * 60); // Return fractional hours
}

export function formatCountdown(isoDeadlineString) {
  if (!isoDeadlineString) return "No deadline";
  const deadline = new Date(isoDeadlineString);
  if (isNaN(deadline.getTime())) return "No deadline";
  const differenceMs = deadline - new Date();
  
  if (differenceMs <= 0) {
    return "SLA BREACHED";
  }
  
  const totalSeconds = Math.floor(differenceMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m remaining`;
}

export function getCategoryEmoji(category) {
  switch (category.toLowerCase()) {
    case 'waste': return '🗑️';
    case 'water': return '💧';
    case 'energy': return '⚡';
    case 'nature': return '🌱';
    default: return '⚠️';
  }
}

export function getCategoryTitle(category) {
  switch (category.toLowerCase()) {
    case 'waste': return 'Waste Management';
    case 'water': return 'Water Conservation';
    case 'energy': return 'Energy Efficiency';
    case 'nature': return 'Grounds & Nature';
    default: return 'General Operations';
  }
}

export function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), 
      n = bstr.length, 
      u8arr = new Uint8Array(n);
  while(n--){
      u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, {type:mime});
}

/**
 * Escapes raw strings into HTML entities to prevent XSS injection attacks.
 */
export function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
