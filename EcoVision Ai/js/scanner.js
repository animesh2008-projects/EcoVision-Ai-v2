// js/scanner.js
import db from './firebase-config.js';
import { analyzeImage } from './gemini.js';
import { runDecisionEngine } from './decision-engine.js';
import { routeCategory, routeDepartmentStaff } from './routing-engine.js';
import { getSlaDeadline } from './sla-engine.js';
import { dataURLtoFile } from './utils.js';

// DOM elements
const videoStream = document.getElementById("video-stream");
const capturePreview = document.getElementById("capture-preview");
const uploadDropzone = document.getElementById("upload-dropzone");
const fileInput = document.getElementById("file-input");
const viewfinder = document.getElementById("scanner-viewfinder");

const captureBtn = document.getElementById("capture-btn");
const uploadBtn = document.getElementById("upload-btn");
const retakeBtn = document.getElementById("retake-btn");
const analyzeBtn = document.getElementById("analyze-btn");

const analysisLoader = document.getElementById("analysis-loader");
const loaderStatus = document.getElementById("loader-status");
const loaderStep = document.getElementById("loader-step");

// State variables
let activeStream = null;
let capturedFile = null;
let aiAnalysisResult = null;
let computedDecision = null;
let currentLatitude = 12.9715; // default campus center (lat)
let currentLongitude = 77.5946; // default campus center (lng)

// Initialize camera or fallback dropzone
async function initCamera() {
  // Try loading geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        currentLatitude = pos.coords.latitude;
        currentLongitude = pos.coords.longitude;
      },
      (err) => console.warn("Geolocation failed, using default campus center coordinates.")
    );
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false
    });
    activeStream = stream;
    videoStream.srcObject = stream;
    videoStream.style.display = "block";
    uploadDropzone.style.display = "none";
    viewfinder.style.display = "flex";
  } catch (err) {
    console.warn("Camera permission denied or unavailable, showing file upload dropzone:", err);
    showUploadFallback();
  }
}

function showUploadFallback() {
  if (activeStream) {
    activeStream.getTracks().forEach(track => track.stop());
  }
  videoStream.style.display = "none";
  viewfinder.style.display = "none";
  uploadDropzone.style.display = "flex";
  
  captureBtn.style.display = "none";
  uploadBtn.style.display = "inline-flex";
  retakeBtn.style.display = "none";
  analyzeBtn.style.display = "none";
}

// Drag & drop logic
uploadDropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadDropzone.style.borderColor = "var(--primary)";
});

uploadDropzone.addEventListener("dragleave", () => {
  uploadDropzone.style.borderColor = "var(--border-light)";
});

uploadDropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadDropzone.style.borderColor = "var(--border-light)";
  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
    handleUploadedFile(e.dataTransfer.files[0]);
  }
});

uploadDropzone.addEventListener("click", () => {
  fileInput.click();
});

uploadBtn.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", (e) => {
  if (e.target.files && e.target.files[0]) {
    handleUploadedFile(e.target.files[0]);
  }
});

function handleUploadedFile(file) {
  capturedFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    capturePreview.src = e.target.result;
    capturePreview.style.display = "block";
    uploadDropzone.style.display = "none";
    videoStream.style.display = "none";
    viewfinder.style.display = "none";
    captureBtn.style.display = "none";
    
    uploadBtn.style.display = "none";
    retakeBtn.style.display = "inline-flex";
    analyzeBtn.style.display = "inline-flex";
  };
  reader.readAsDataURL(file);
}

// Capture button event
captureBtn.addEventListener("click", () => {
  const canvas = document.createElement("canvas");
  canvas.width = videoStream.videoWidth || 640;
  canvas.height = videoStream.videoHeight || 480;
  const ctx = canvas.getContext("2d");
  
  // Draw current frame (with mirroring check)
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(videoStream, 0, 0, canvas.width, canvas.height);
  
  const base64Img = canvas.toDataURL("image/jpeg");
  capturePreview.src = base64Img;
  capturePreview.style.display = "block";
  videoStream.style.display = "none";
  viewfinder.style.display = "none";
  
  capturedFile = dataURLtoFile(base64Img, "captured_scene.jpg");
  
  captureBtn.style.display = "none";
  retakeBtn.style.display = "inline-flex";
  analyzeBtn.style.display = "inline-flex";
});

// Retake button event
retakeBtn.addEventListener("click", () => {
  capturePreview.style.display = "none";
  capturedFile = null;
  
  retakeBtn.style.display = "none";
  analyzeBtn.style.display = "none";

  if (activeStream) {
    videoStream.style.display = "block";
    viewfinder.style.display = "flex";
    captureBtn.style.display = "inline-flex";
  } else {
    uploadDropzone.style.display = "flex";
    uploadBtn.style.display = "inline-flex";
  }
});

// Run AI analysis triggers loader updates and queries model
analyzeBtn.addEventListener("click", async () => {
  if (!capturedFile) return;

  // Show analysis loader
  analysisLoader.classList.add("active");
  updateLoaderText("Analyzing pixels...", "Reading raw image matrix");
  
  try {
    // Stage 1: Call Gemini classification
    updateLoaderText("Invoking Gemini...", "Uploading visual scene to Google AI LLM");
    const aiResult = await analyzeImage(capturedFile);
    aiAnalysisResult = aiResult;

    // Stage 2: Run priority decision engine
    updateLoaderText("Running Decision Engine...", "Evaluating historical logs and traffic indexes");
    // Generate location ID based on classification or default
    const locationId = aiResult.locationHint || "other";
    const decision = await runDecisionEngine(aiResult, locationId, currentLatitude, currentLongitude);
    computedDecision = decision;

    // Stage 3: Routing department staff
    updateLoaderText("Routing work order...", "Determining department and assigning crew");
    const targetDept = routeCategory(aiResult.category);
    const assignedStaff = await routeDepartmentStaff(targetDept);

    // Render results
    renderAnalysisResults(aiResult, decision, targetDept, assignedStaff);

    // Hide loader and shift views
    analysisLoader.classList.remove("active");
    document.getElementById("scan-view").style.display = "none";
    document.getElementById("result-view").style.display = "block";
    
    // Stop camera stream to release hardware resources
    if (activeStream) {
      activeStream.getTracks().forEach(track => track.stop());
    }
  } catch (err) {
    console.error("AI Scanner execution failed:", err);
    showToast("AI Analysis temporarily unavailable. System will fall back to manual creation.", 'info');
    analysisLoader.classList.remove("active");
  }
});

function updateLoaderText(status, step) {
  loaderStatus.textContent = status;
  loaderStep.textContent = step;
}

// Render computed data on result screen
function renderAnalysisResults(aiResult, decision, department, staff) {
  // Before Photo preview
  document.getElementById("res-image").src = capturePreview.src;

  // Severity Badge
  const severityBadge = document.getElementById("res-severity-badge");
  severityBadge.textContent = aiResult.severity.toUpperCase();
  severityBadge.className = `result-badge badge-${aiResult.severity.toLowerCase()}`;

  // Classification info
  document.getElementById("res-description").textContent = aiResult.description || aiResult.observation;
  document.getElementById("res-category").textContent = aiResult.category.toUpperCase();
  document.getElementById("res-subcategory").textContent = (aiResult.subcategory || "Other").replace(/_/g, ' ');

  // Priority Score
  document.getElementById("res-score").textContent = decision.score;
  const priorityLabel = document.getElementById("res-priority-label");
  priorityLabel.textContent = `Priority Level: ${decision.priorityLevel}`;
  priorityLabel.className = `result-meta-label badge-${decision.priorityLevel.toLowerCase()}`;

  // Progress weights
  document.getElementById("f-severity").textContent = `${decision.raw.severity.toFixed(1)} / 30`;
  document.getElementById("f-severity-progress").style.width = `${(decision.raw.severity / 30) * 100}%`;

  document.getElementById("f-frequency").textContent = `${decision.raw.frequency.toFixed(1)} / 20`;
  document.getElementById("f-frequency-progress").style.width = `${(decision.raw.frequency / 20) * 100}%`;

  document.getElementById("f-unresolved").textContent = `${decision.raw.unresolved.toFixed(1)} / 20`;
  document.getElementById("f-unresolved-progress").style.width = `${(decision.raw.unresolved / 20) * 100}%`;

  document.getElementById("f-location").textContent = `${decision.raw.location.toFixed(1)} / 15`;
  document.getElementById("f-location-progress").style.width = `${(decision.raw.location / 15) * 100}%`;

  document.getElementById("f-confidence").textContent = `${decision.raw.confidence.toFixed(1)} / 15`;
  document.getElementById("f-confidence-progress").style.width = `${(decision.raw.confidence / 15) * 100}%`;

  // Explanations list
  const reasonList = document.getElementById("res-reasons-list");
  reasonList.innerHTML = "";
  decision.reasons.forEach(reason => {
    const li = document.createElement("li");
    li.textContent = reason;
    reasonList.appendChild(li);
  });

  // Routing info
  document.getElementById("res-department").textContent = department;
  
  // Calculate SLA countdown hours
  const hoursMap = { CRITICAL: 2, HIGH: 6, MEDIUM: 24, LOW: 72, NORMAL: 168 };
  const hours = hoursMap[decision.priorityLevel] || 24;
  document.getElementById("res-sla").textContent = `${hours} Hours`;

  // Adjust button view: if category is nature observation (low severity/no issues), show Save Nature button
  const confirmBtn = document.getElementById("confirm-workflow-btn");
  const saveObsBtn = document.getElementById("save-observation-btn");

  if (aiResult.category.toLowerCase() === "nature" && aiResult.severity.toLowerCase() === "normal") {
    confirmBtn.style.display = "none";
    saveObsBtn.style.display = "inline-flex";
  } else {
    confirmBtn.style.display = "inline-flex";
    saveObsBtn.style.display = "none";
  }
}

// Confirm & Create Workflow Action
document.getElementById("confirm-workflow-btn").addEventListener("click", async () => {
  if (!aiAnalysisResult || !computedDecision) return;
  
  const submitBtn = document.getElementById("confirm-workflow-btn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Creating ticket...";

  try {
    const user = db.getCurrentUser();
    const targetDept = routeCategory(aiAnalysisResult.category);
    const assignedStaff = await routeDepartmentStaff(targetDept);

    // Upload image to serverless storage or get blob
    const imgUrl = await db.uploadImage(capturedFile, "reports");

    // Write to Firestore / LocalStorage
    await db.createIssue({
      reportedBy: user ? user.uid : "student-1",
      reportedByName: user ? user.displayName : "Alex Rivera",
      imageUrl: imgUrl,
      category: aiAnalysisResult.category,
      subcategory: aiAnalysisResult.subcategory || "other",
      description: aiAnalysisResult.description || aiAnalysisResult.observation,
      severity: aiAnalysisResult.severity,
      confidence: aiAnalysisResult.confidence,
      location: aiAnalysisResult.locationHint || "other",
      latitude: currentLatitude,
      longitude: currentLongitude,
      priorityScore: computedDecision.score,
      priorityLevel: computedDecision.priorityLevel,
      department: targetDept,
      assignedStaff: assignedStaff.id,
      assignedStaffName: assignedStaff.name,
      status: "OPEN",
      slaDeadline: getSlaDeadline(computedDecision.priorityLevel)
    });

    showToast("Environmental Workflow successfully created! Dispatching task to operations staff.", 'success');
    window.location.href = "dashboard.html";
  } catch(e) {
    console.error("Create workflow error:", e);
    showToast("Workflow creation failed: " + e.message, 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = "CONFIRM & CREATE WORKFLOW";
  }
});

// Save Observation Action
document.getElementById("save-observation-btn").addEventListener("click", async () => {
  if (!aiAnalysisResult || !computedDecision) return;

  const saveObsBtn = document.getElementById("save-observation-btn");
  saveObsBtn.disabled = true;
  saveObsBtn.textContent = "Saving observations...";

  try {
    const user = db.getCurrentUser();
    const imgUrl = await db.uploadImage(capturedFile, "observations");

    // Save as resolved immediately
    await db.createIssue({
      reportedBy: user ? user.uid : "student-1",
      reportedByName: user ? user.displayName : "Alex Rivera",
      imageUrl: imgUrl,
      category: aiAnalysisResult.category,
      subcategory: aiAnalysisResult.subcategory || "other",
      description: aiAnalysisResult.description || aiAnalysisResult.observation,
      severity: "normal",
      confidence: aiAnalysisResult.confidence,
      location: aiAnalysisResult.locationHint || "other",
      latitude: currentLatitude,
      longitude: currentLongitude,
      priorityScore: computedDecision.score,
      priorityLevel: "NORMAL",
      department: "Grounds & Maintenance",
      assignedStaff: "staff-grounds",
      assignedStaffName: "Sarah Jenkins (Grounds)",
      status: "RESOLVED"
    });

    showToast("Nature observation logged! Environmental contribution saved.", 'success');
    window.location.href = "dashboard.html";
  } catch(e) {
    showToast("Saving observation failed: " + e.message, 'error');
    saveObsBtn.disabled = false;
    saveObsBtn.textContent = "SAVE NATURE OBSERVATION";
  }
});

// Scan again refresh
document.getElementById("scan-again-btn").addEventListener("click", () => {
  window.location.reload();
});

// Load camera on startup
initCamera();
