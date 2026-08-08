// tests/run_tests.js
/**
 * Automated Unit Test Suite for EcoVision AI
 * Tests: Decision Engine, SLA Engine, Haversine Distance, Input Sanitization
 */

import { calculateDistance, LOCATION_WEIGHTS } from '../js/decision-engine-helpers.js';
import { getSlaDeadline } from '../js/sla-engine-helpers.js';
import { escapeHTML } from '../js/utils.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log("\n🧪 Running EcoVision AI Unit Test Suite...\n");

// 1. Haversine Spatial Distance Calculations
console.log("🔹 Testing Haversine Distance Calculation:");
const dist = calculateDistance(12.9716, 77.5946, 12.9718, 77.5948);
assert(dist > 0 && dist < 50, `Distance between close points calculated accurately (${dist.toFixed(2)}m)`);

const zeroDist = calculateDistance(12.9716, 77.5946, 12.9716, 77.5946);
assert(Math.round(zeroDist) === 0, `Identical coordinates yield 0m distance`);

// 2. Location Impact Weights
console.log("\n🔹 Testing Location Weight Mappings:");
assert(LOCATION_WEIGHTS.canteen === 100, "Canteen carries maximum location weight (100)");
assert(LOCATION_WEIGHTS.library === 90, "Library carries high location weight (90)");
assert(LOCATION_WEIGHTS.other === 30, "Default/other carries lower weight (30)");

// 3. SLA Deadline Calculations
console.log("\n🔹 Testing SLA Deadline Generator Engine:");
const urgentSla = getSlaDeadline('urgent');
const lowSla = getSlaDeadline('low');
const now = Date.now();
const urgentDiffHrs = (new Date(urgentSla).getTime() - now) / (1000 * 60 * 60);
const lowDiffHrs = (new Date(lowSla).getTime() - now) / (1000 * 60 * 60);

assert(urgentDiffHrs >= 1.9 && urgentDiffHrs <= 2.1, `Urgent SLA computes 2 hour deadline (~${urgentDiffHrs.toFixed(1)}h)`);
assert(lowDiffHrs >= 47.9 && lowDiffHrs <= 48.1, `Low SLA computes 48 hour deadline (~${lowDiffHrs.toFixed(1)}h)`);

// 4. Security HTML Sanitization & XSS Protection
console.log("\n🔹 Testing Security & XSS HTML Sanitization:");
const malScript = '<script>alert("xss")</script>';
const escapedScript = escapeHTML(malScript);
assert(!escapedScript.includes('<script>'), "Sanitizer strips raw script tags");
assert(escapedScript.includes('&lt;script&gt;'), "Sanitizer converts angle brackets to &lt; &gt;");

const malAttr = 'Test "><img src=x onerror=alert(1)>';
const escapedAttr = escapeHTML(malAttr);
assert(!escapedAttr.includes('"'), "Sanitizer converts double quotes to &quot;");

// Summary
console.log("\n==========================================");
console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
console.log("==========================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
