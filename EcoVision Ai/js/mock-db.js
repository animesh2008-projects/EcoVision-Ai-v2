// js/mock-db.js

const MOCK_USERS = [
  { uid: "student-1", email: "student@campus.edu", displayName: "Alex Rivera", role: "student", department: "none", ecoScoreContribution: 82, createdAt: new Date().toISOString() },
  { uid: "staff-sanitation", email: "sanitation@campus.edu", displayName: "Marcus Vance (Sanitation)", role: "staff", department: "Sanitation", ecoScoreContribution: 95, createdAt: new Date().toISOString() },
  { uid: "staff-water", email: "water@campus.edu", displayName: "Elena Rostova (Water)", role: "staff", department: "Water Management", ecoScoreContribution: 90, createdAt: new Date().toISOString() },
  { uid: "staff-electrical", email: "electrical@campus.edu", displayName: "David Chen (Electrical)", role: "staff", department: "Electrical", ecoScoreContribution: 92, createdAt: new Date().toISOString() },
  { uid: "staff-grounds", email: "grounds@campus.edu", displayName: "Sarah Jenkins (Grounds)", role: "staff", department: "Grounds & Maintenance", ecoScoreContribution: 88, createdAt: new Date().toISOString() },
  { uid: "admin-1", email: "admin@campus.edu", displayName: "Director Robert K.", role: "admin", department: "none", ecoScoreContribution: 100, createdAt: new Date().toISOString() }
];

const MOCK_ISSUES = [
  {
    id: "EV-1001",
    reportedBy: "student-1",
    reportedByName: "Alex Rivera",
    imageUrl: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop&q=60",
    category: "waste",
    subcategory: "overflowing_bin",
    description: "Plastic bottles, paper wrappers, and waste overflowing from the main recycling bin near the Canteen.",
    severity: "high",
    confidence: 0.92,
    location: "canteen",
    latitude: 12.9719,
    longitude: 77.5938,
    priorityScore: 82,
    priorityLevel: "HIGH",
    department: "Sanitation",
    assignedStaff: "staff-sanitation",
    assignedStaffName: "Marcus Vance (Sanitation)",
    status: "IN_PROGRESS",
    slaDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hrs remaining
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hrs ago
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    beforeImage: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop&q=60",
    afterImage: null,
    verification: null
  },
  {
    id: "EV-1002",
    reportedBy: "student-1",
    reportedByName: "Alex Rivera",
    imageUrl: "https://images.unsplash.com/photo-1585832770485-e68a5dbfad52?w=600&auto=format&fit=crop&q=60",
    category: "water",
    subcategory: "leaking_pipe",
    description: "Water leaking steadily from the main pipe junction outside the Science Lab Block.",
    severity: "urgent",
    confidence: 0.95,
    location: "science_block",
    latitude: 12.9725,
    longitude: 77.5948,
    priorityScore: 94,
    priorityLevel: "CRITICAL",
    department: "Water Management",
    assignedStaff: "staff-water",
    assignedStaffName: "Elena Rostova (Water)",
    status: "OPEN",
    slaDeadline: new Date(Date.now() + 1.5 * 60 * 60 * 1000).toISOString(), // 1.5 hrs remaining
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    beforeImage: "https://images.unsplash.com/photo-1585832770485-e68a5dbfad52?w=600&auto=format&fit=crop&q=60",
    afterImage: null,
    verification: null
  },
  {
    id: "EV-1003",
    reportedBy: "student-1",
    reportedByName: "Alex Rivera",
    imageUrl: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&auto=format&fit=crop&q=60",
    category: "energy",
    subcategory: "lights_on",
    description: "High-power corridor floodlights left fully on in broad daylight near the Library block.",
    severity: "medium",
    confidence: 0.88,
    location: "library",
    latitude: 12.9712,
    longitude: 77.5955,
    priorityScore: 68,
    priorityLevel: "MEDIUM",
    department: "Electrical",
    assignedStaff: "staff-electrical",
    assignedStaffName: "David Chen (Electrical)",
    status: "ASSIGNED",
    slaDeadline: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(), // 22 hrs remaining
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    beforeImage: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&auto=format&fit=crop&q=60",
    afterImage: null,
    verification: null
  },
  {
    id: "EV-1004",
    reportedBy: "student-1",
    reportedByName: "Alex Rivera",
    imageUrl: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&auto=format&fit=crop&q=60",
    category: "nature",
    subcategory: "broken_branch",
    description: "Large broken tree limb blocking the walkway and damaging younger hedges near Hostel Block B.",
    severity: "low",
    confidence: 0.90,
    location: "hostel",
    latitude: 12.9705,
    longitude: 77.5925,
    priorityScore: 45,
    priorityLevel: "LOW",
    department: "Grounds & Maintenance",
    assignedStaff: "staff-grounds",
    assignedStaffName: "Sarah Jenkins (Grounds)",
    status: "RESOLVED",
    slaDeadline: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    beforeImage: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&auto=format&fit=crop&q=60",
    afterImage: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&auto=format&fit=crop&q=60",
    verification: {
      status: "likely_resolved",
      resolutionScore: 92,
      sceneMatch: 95,
      confidence: 0.90,
      issueResolved: true,
      explanation: "Verification success. The fallen branches have been entirely removed and walkway cleared."
    }
  },
  {
    id: "EV-1005",
    reportedBy: "student-1",
    reportedByName: "Alex Rivera",
    imageUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=60",
    category: "water",
    subcategory: "overflowing_tank",
    description: "Water tank on the roof of the Main Canteen is overflowing, wasting clean water.",
    severity: "high",
    confidence: 0.91,
    location: "canteen",
    latitude: 12.9721,
    longitude: 77.5936,
    priorityScore: 88,
    priorityLevel: "HIGH",
    department: "Water Management",
    assignedStaff: "staff-water",
    assignedStaffName: "Elena Rostova (Water)",
    status: "RESOLUTION_SUBMITTED",
    slaDeadline: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 mins ago staff submitted
    beforeImage: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=60",
    afterImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=60",
    verification: {
      status: "uncertain",
      resolutionScore: 55,
      sceneMatch: 40,
      confidence: 0.72,
      issueResolved: false,
      explanation: "Verification uncertain. The submitted resolution image does not match the roof water tank scene."
    }
  },
  {
    id: "EV-1006",
    reportedBy: "student-1",
    reportedByName: "Alex Rivera",
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=60",
    category: "waste",
    subcategory: "littering",
    description: "Plastic bags and food wrappers thrown around the seating area outside the Library.",
    severity: "medium",
    confidence: 0.89,
    location: "library",
    latitude: 12.9715,
    longitude: 77.5958,
    priorityScore: 72,
    priorityLevel: "MEDIUM",
    department: "Sanitation",
    assignedStaff: "staff-sanitation",
    assignedStaffName: "Marcus Vance (Sanitation)",
    status: "RESOLUTION_SUBMITTED",
    slaDeadline: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    beforeImage: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=60",
    afterImage: "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=600&auto=format&fit=crop&q=60",
    verification: {
      status: "likely_resolved",
      resolutionScore: 89,
      sceneMatch: 90,
      confidence: 0.91,
      issueResolved: true,
      explanation: "Litter removed completely. Benches and walkways are clean."
    }
  },
  {
    id: "EV-1007",
    reportedBy: "student-1",
    reportedByName: "Alex Rivera",
    imageUrl: "https://images.unsplash.com/photo-1621451537084-482c730e3761?w=600&auto=format&fit=crop&q=60",
    category: "energy",
    subcategory: "lights_on",
    description: "AC units running inside an empty seminar hall in Science Lab Block with doors wide open.",
    severity: "high",
    confidence: 0.93,
    location: "science_block",
    latitude: 12.9728,
    longitude: 77.5945,
    priorityScore: 84,
    priorityLevel: "HIGH",
    department: "Electrical",
    assignedStaff: "staff-electrical",
    assignedStaffName: "David Chen (Electrical)",
    status: "REVIEW_REQUIRED", // Admin needs to look at this
    slaDeadline: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // SLA breached
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    beforeImage: "https://images.unsplash.com/photo-1621451537084-482c730e3761?w=600&auto=format&fit=crop&q=60",
    afterImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=60",
    verification: {
      status: "partially_resolved",
      resolutionScore: 45,
      sceneMatch: 85,
      confidence: 0.80,
      issueResolved: false,
      explanation: "Verification failed. The AC units appear to still be switched on (indicator lights visible), though lights are off."
    }
  },
  {
    id: "EV-1008",
    reportedBy: "student-1",
    reportedByName: "Alex Rivera",
    imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&auto=format&fit=crop&q=60",
    category: "nature",
    subcategory: "wilted_plants",
    description: "Heavily wilted and dying ornamental flowerbeds near the main library courtyard.",
    severity: "low",
    confidence: 0.85,
    location: "library",
    latitude: 12.9710,
    longitude: 77.5952,
    priorityScore: 38,
    priorityLevel: "LOW",
    department: "Grounds & Maintenance",
    assignedStaff: "staff-grounds",
    assignedStaffName: "Sarah Jenkins (Grounds)",
    status: "IN_PROGRESS",
    slaDeadline: new Date(Date.now() + 60 * 60 * 1000 * 48).toISOString(),
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    beforeImage: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&auto=format&fit=crop&q=60",
    afterImage: null,
    verification: null
  },
  {
    id: "EV-1009",
    reportedBy: "student-1",
    reportedByName: "Alex Rivera",
    imageUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&auto=format&fit=crop&q=60",
    category: "nature",
    subcategory: "soil_erosion",
    description: "Severe soil erosion exposing tree roots near the Hostel Block B driveway.",
    severity: "medium",
    confidence: 0.90,
    location: "hostel",
    latitude: 12.9702,
    longitude: 77.5928,
    priorityScore: 58,
    priorityLevel: "MEDIUM",
    department: "Grounds & Maintenance",
    assignedStaff: "staff-grounds",
    assignedStaffName: "Sarah Jenkins (Grounds)",
    status: "ACCEPTED",
    slaDeadline: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    beforeImage: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&auto=format&fit=crop&q=60",
    afterImage: null,
    verification: null
  },
  {
    id: "EV-1010",
    reportedBy: "student-1",
    reportedByName: "Alex Rivera",
    imageUrl: "https://images.unsplash.com/photo-1534398079244-67c698abfdb0?w=600&auto=format&fit=crop&q=60",
    category: "water",
    subcategory: "running_tap",
    description: "A water tap in the canteen restroom left fully open and running with no one around.",
    severity: "high",
    confidence: 0.94,
    location: "canteen",
    latitude: 12.9720,
    longitude: 77.5939,
    priorityScore: 85,
    priorityLevel: "HIGH",
    department: "Water Management",
    assignedStaff: "staff-water",
    assignedStaffName: "Elena Rostova (Water)",
    status: "RESOLVED",
    slaDeadline: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    beforeImage: "https://images.unsplash.com/photo-1534398079244-67c698abfdb0?w=600&auto=format&fit=crop&q=60",
    afterImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=60",
    verification: {
      status: "likely_resolved",
      resolutionScore: 98,
      sceneMatch: 95,
      confidence: 0.96,
      issueResolved: true,
      explanation: "Verification success. Tap turned off completely, restroom sink dry."
    }
  },
  {
    id: "EV-1011",
    reportedBy: "student-1",
    reportedByName: "Alex Rivera",
    imageUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&auto=format&fit=crop&q=60",
    category: "nature",
    subcategory: "tree_observation",
    description: "Lush green heritage Banyan tree observation showing rich bird biodiversity.",
    severity: "normal",
    confidence: 0.96,
    location: "other",
    latitude: 12.9732,
    longitude: 77.5950,
    priorityScore: 18,
    priorityLevel: "NORMAL",
    department: "Grounds & Maintenance",
    assignedStaff: "staff-grounds",
    assignedStaffName: "Sarah Jenkins (Grounds)",
    status: "RESOLVED",
    slaDeadline: new Date(Date.now() + 120 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    beforeImage: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&auto=format&fit=crop&q=60",
    afterImage: null,
    verification: {
      status: "likely_resolved",
      resolutionScore: 100,
      sceneMatch: 100,
      confidence: 0.98,
      issueResolved: true,
      explanation: "This is a positive nature observation and requires no remedial actions."
    }
  },
  {
    id: "EV-1012",
    reportedBy: "student-1",
    reportedByName: "Alex Rivera",
    imageUrl: "https://images.unsplash.com/photo-1595275313396-74ab3e89c76f?w=600&auto=format&fit=crop&q=60",
    category: "waste",
    subcategory: "construction_debris",
    description: "Leftover concrete sacks and sharp construction debris piled in the corridor of Science Lab Block.",
    severity: "high",
    confidence: 0.91,
    location: "science_block",
    latitude: 12.9726,
    longitude: 77.5949,
    priorityScore: 85,
    priorityLevel: "HIGH",
    department: "Sanitation",
    assignedStaff: "staff-sanitation",
    assignedStaffName: "Marcus Vance (Sanitation)",
    status: "OPEN",
    slaDeadline: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    beforeImage: "https://images.unsplash.com/photo-1595275313396-74ab3e89c76f?w=600&auto=format&fit=crop&q=60",
    afterImage: null,
    verification: null
  },
  {
    id: "EV-1013",
    reportedBy: "student-1",
    reportedByName: "Alex Rivera",
    imageUrl: "https://images.unsplash.com/photo-1473116763269-25541579ff97?w=600&auto=format&fit=crop&q=60",
    category: "water",
    subcategory: "sprinkler_malfunction",
    description: "Sprinkler system in front of library is spraying high-pressure water directly onto the asphalt road.",
    severity: "medium",
    confidence: 0.89,
    location: "library",
    latitude: 12.9714,
    longitude: 77.5956,
    priorityScore: 62,
    priorityLevel: "MEDIUM",
    department: "Water Management",
    assignedStaff: "staff-water",
    assignedStaffName: "Elena Rostova (Water)",
    status: "ASSIGNED",
    slaDeadline: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    beforeImage: "https://images.unsplash.com/photo-1473116763269-25541579ff97?w=600&auto=format&fit=crop&q=60",
    afterImage: null,
    verification: null
  },
  {
    id: "EV-1014",
    reportedBy: "student-1",
    reportedByName: "Alex Rivera",
    imageUrl: "https://images.unsplash.com/photo-1528127269322-539801943592?w=600&auto=format&fit=crop&q=60",
    category: "energy",
    subcategory: "lights_on",
    description: "High intensity parking lot lights left completely on during normal daylight hours at Canteen lot.",
    severity: "medium",
    confidence: 0.90,
    location: "canteen",
    latitude: 12.9718,
    longitude: 77.5935,
    priorityScore: 69,
    priorityLevel: "MEDIUM",
    department: "Electrical",
    assignedStaff: "staff-electrical",
    assignedStaffName: "David Chen (Electrical)",
    status: "OPEN",
    slaDeadline: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    beforeImage: "https://images.unsplash.com/photo-1528127269322-539801943592?w=600&auto=format&fit=crop&q=60",
    afterImage: null,
    verification: null
  },
  {
    id: "EV-1015",
    reportedBy: "student-1",
    reportedByName: "Alex Rivera",
    imageUrl: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=600&auto=format&fit=crop&q=60",
    category: "waste",
    subcategory: "dumped_furniture",
    description: "Broken chairs and desks dumped in the corridor blocking emergency exit of Science Lab Block.",
    severity: "urgent",
    confidence: 0.93,
    location: "science_block",
    latitude: 12.9727,
    longitude: 77.5947,
    priorityScore: 96,
    priorityLevel: "CRITICAL",
    department: "Sanitation",
    assignedStaff: "staff-sanitation",
    assignedStaffName: "Marcus Vance (Sanitation)",
    status: "ADMIN_REVIEW", // SLA Breached and verification failed/not done yet
    slaDeadline: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), // breached 10 hrs ago
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    beforeImage: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=600&auto=format&fit=crop&q=60",
    afterImage: null,
    verification: null
  }
];

const MOCK_WORKFLOW_LOGS = [];
MOCK_ISSUES.forEach(issue => {
  MOCK_WORKFLOW_LOGS.push({
    issueId: issue.id,
    fromState: "NONE",
    toState: "OPEN",
    actor: issue.reportedBy,
    actorName: issue.reportedByName,
    timestamp: issue.createdAt,
    note: "Issue reported by student and logged into EcoVision system."
  });
  MOCK_WORKFLOW_LOGS.push({
    issueId: issue.id,
    fromState: "OPEN",
    toState: "AI_CLASSIFIED",
    actor: "system-ai",
    actorName: "EcoVision Gemini AI",
    timestamp: new Date(new Date(issue.createdAt).getTime() + 10 * 1000).toISOString(),
    note: `AI classified category as '${issue.category}' with confidence ${Math.round(issue.confidence * 100)}%.`
  });
  MOCK_WORKFLOW_LOGS.push({
    issueId: issue.id,
    fromState: "AI_CLASSIFIED",
    toState: "PRIORITY_ASSIGNED",
    actor: "system-engine",
    actorName: "Decision Engine",
    timestamp: new Date(new Date(issue.createdAt).getTime() + 20 * 1000).toISOString(),
    note: `Priority score evaluated at ${issue.priorityScore}/100. Priority: ${issue.priorityLevel}.`
  });
  MOCK_WORKFLOW_LOGS.push({
    issueId: issue.id,
    fromState: "PRIORITY_ASSIGNED",
    toState: "ASSIGNED",
    actor: "system-routing",
    actorName: "Routing Engine",
    timestamp: new Date(new Date(issue.createdAt).getTime() + 30 * 1000).toISOString(),
    note: `Automatically assigned to ${issue.department} Department. Lead: ${issue.assignedStaffName}.`
  });

  if (issue.status !== "OPEN" && issue.status !== "ASSIGNED") {
    MOCK_WORKFLOW_LOGS.push({
      issueId: issue.id,
      fromState: "ASSIGNED",
      toState: "ACCEPTED",
      actor: issue.assignedStaff,
      actorName: issue.assignedStaffName,
      timestamp: new Date(new Date(issue.createdAt).getTime() + 15 * 60 * 1000).toISOString(),
      note: "Task claimed and accepted by staff member."
    });
  }

  if (issue.status === "IN_PROGRESS" || issue.status === "RESOLUTION_SUBMITTED" || issue.status === "REVIEW_REQUIRED" || issue.status === "ADMIN_REVIEW" || issue.status === "RESOLVED") {
    MOCK_WORKFLOW_LOGS.push({
      issueId: issue.id,
      fromState: "ACCEPTED",
      toState: "IN_PROGRESS",
      actor: issue.assignedStaff,
      actorName: issue.assignedStaffName,
      timestamp: new Date(new Date(issue.createdAt).getTime() + 30 * 60 * 1000).toISOString(),
      note: "Staff initiated remediation work on-site."
    });
  }

  if (issue.status === "RESOLUTION_SUBMITTED" || issue.status === "REVIEW_REQUIRED" || issue.status === "ADMIN_REVIEW" || issue.status === "RESOLVED") {
    MOCK_WORKFLOW_LOGS.push({
      issueId: issue.id,
      fromState: "IN_PROGRESS",
      toState: "RESOLUTION_SUBMITTED",
      actor: issue.assignedStaff,
      actorName: issue.assignedStaffName,
      timestamp: issue.updatedAt,
      note: "Staff completed work and submitted resolution image for verification."
    });
  }

  if (issue.status === "RESOLVED" || issue.status === "REVIEW_REQUIRED" || issue.status === "ADMIN_REVIEW") {
    MOCK_WORKFLOW_LOGS.push({
      issueId: issue.id,
      fromState: "RESOLUTION_SUBMITTED",
      toState: "AI_VERIFICATION",
      actor: "system-ai",
      actorName: "EcoVision Gemini AI",
      timestamp: new Date(new Date(issue.updatedAt).getTime() + 10 * 1000).toISOString(),
      note: `AI verification complete. Status: ${issue.verification?.status || "uncertain"}, Confidence: ${Math.round((issue.verification?.confidence || 0) * 100)}%.`
    });

    if (issue.status === "RESOLVED") {
      MOCK_WORKFLOW_LOGS.push({
        issueId: issue.id,
        fromState: "AI_VERIFICATION",
        toState: "RESOLVED",
        actor: "system-workflow",
        actorName: "Workflow Auto-Closure",
        timestamp: new Date(new Date(issue.updatedAt).getTime() + 15 * 1000).toISOString(),
        note: `Workflow automatically closed successfully based on positive AI verification (${issue.verification?.resolutionScore}% resolved).`
      });
    } else {
      MOCK_WORKFLOW_LOGS.push({
        issueId: issue.id,
        fromState: "AI_VERIFICATION",
        toState: issue.status,
        actor: "system-workflow",
        actorName: "Workflow Engine",
        timestamp: new Date(new Date(issue.updatedAt).getTime() + 15 * 1000).toISOString(),
        note: `Verification failed or uncertain. Issue routed to Admin Review Queue.`
      });
    }
  }
});

const MOCK_NOTIFICATIONS = [
  { id: "notif-1", userId: "staff-sanitation", text: "🚨 New high priority waste issue reported at Canteen: EV-1001", read: false, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: "notif-2", userId: "staff-water", text: "🚨 New CRITICAL water leakage reported near Science Lab Block: EV-1002", read: false, createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
  { id: "notif-3", userId: "admin-1", text: "⚠️ Issue EV-1005 requires manual review: AI Verification returned 'uncertain'", read: false, createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
  { id: "notif-4", userId: "admin-1", text: "🔥 SLA breached for Critical Issue EV-1015 at Science Lab Block", read: false, createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString() }
];

const mockDb = {
  init() {
    if (!localStorage.getItem("ecovision_seeded")) {
      localStorage.setItem("ecovision_users", JSON.stringify(MOCK_USERS));
      localStorage.setItem("ecovision_issues", JSON.stringify(MOCK_ISSUES));
      localStorage.setItem("ecovision_workflow_logs", JSON.stringify(MOCK_WORKFLOW_LOGS));
      localStorage.setItem("ecovision_notifications", JSON.stringify(MOCK_NOTIFICATIONS));
      localStorage.setItem("ecovision_seeded", "true");
    }
    console.log("Mock Database initialized successfully.");
  },

  resetData() {
    localStorage.removeItem("ecovision_seeded");
    this.init();
    window.location.reload();
  },

  // Auth Operations
  login(email, password) {
    const users = JSON.parse(localStorage.getItem("ecovision_users")) || [];
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      // For demo, we accept any password
      localStorage.setItem("ecovision_current_user", JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, error: "User not found in demo database. Try standard demo logins." };
  },

  register(name, email, password, role, department = "none") {
    const users = JSON.parse(localStorage.getItem("ecovision_users")) || [];
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: "Email already registered." };
    }
    const newUser = {
      uid: "user-" + Math.random().toString(36).substr(2, 9),
      email,
      displayName: name,
      role,
      department: role === "staff" ? department : "none",
      ecoScoreContribution: 50,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem("ecovision_users", JSON.stringify(users));
    localStorage.setItem("ecovision_current_user", JSON.stringify(newUser));
    return { success: true, user: newUser };
  },

  getCurrentUser() {
    const userJson = localStorage.getItem("ecovision_current_user");
    return userJson ? JSON.parse(userJson) : null;
  },

  logout() {
    localStorage.removeItem("ecovision_current_user");
  },

  // Issues Operations
  getIssues() {
    return JSON.parse(localStorage.getItem("ecovision_issues")) || [];
  },

  getIssue(id) {
    const issues = this.getIssues();
    return issues.find(i => i.id === id) || null;
  },

  createIssue(issueData) {
    const issues = this.getIssues();
    const newId = "EV-" + (1000 + issues.length + 1);
    const newIssue = {
      id: newId,
      reportedBy: issueData.reportedBy || "student-1",
      reportedByName: issueData.reportedByName || "Student Reporter",
      imageUrl: issueData.imageUrl,
      category: issueData.category,
      subcategory: issueData.subcategory || "other",
      description: issueData.description,
      severity: issueData.severity || "medium",
      confidence: issueData.confidence || 0.90,
      location: issueData.location || "other",
      latitude: issueData.latitude || 12.9715,
      longitude: issueData.longitude || 77.5946,
      priorityScore: issueData.priorityScore || 50,
      priorityLevel: issueData.priorityLevel || "MEDIUM",
      department: issueData.department || "General Maintenance",
      assignedStaff: issueData.assignedStaff || "staff-grounds",
      assignedStaffName: issueData.assignedStaffName || "Sarah Jenkins (Grounds)",
      status: issueData.status || "OPEN",
      slaDeadline: issueData.slaDeadline || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      beforeImage: issueData.imageUrl,
      afterImage: null,
      verification: null
    };

    issues.unshift(newIssue);
    localStorage.setItem("ecovision_issues", JSON.stringify(issues));

    // Log the creation events
    this.addWorkflowLog({
      issueId: newId,
      fromState: "NONE",
      toState: "OPEN",
      actor: newIssue.reportedBy,
      actorName: newIssue.reportedByName,
      note: "Issue reported by student."
    });
    this.addWorkflowLog({
      issueId: newId,
      fromState: "OPEN",
      toState: "AI_CLASSIFIED",
      actor: "system-ai",
      actorName: "EcoVision Gemini AI",
      note: `AI classified category as '${newIssue.category}' with confidence ${Math.round(newIssue.confidence * 100)}%.`
    });
    this.addWorkflowLog({
      issueId: newId,
      fromState: "AI_CLASSIFIED",
      toState: "PRIORITY_ASSIGNED",
      actor: "system-engine",
      actorName: "Decision Engine",
      note: `Priority score evaluated at ${newIssue.priorityScore}/100. Priority: ${newIssue.priorityLevel}.`
    });
    this.addWorkflowLog({
      issueId: newId,
      fromState: "PRIORITY_ASSIGNED",
      toState: "ASSIGNED",
      actor: "system-routing",
      actorName: "Routing Engine",
      note: `Automatically assigned to ${newIssue.department} Department. Lead: ${newIssue.assignedStaffName}.`
    });

    // Notify staff
    this.addNotification({
      userId: newIssue.assignedStaff,
      text: `🚨 New ${newIssue.priorityLevel} task assigned: ${newId} - ${newIssue.description.substring(0, 30)}...`
    });

    return newIssue;
  },

  updateIssue(id, updates) {
    const issues = this.getIssues();
    const index = issues.findIndex(i => i.id === id);
    if (index !== -1) {
      const oldStatus = issues[index].status;
      issues[index] = { ...issues[index], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem("ecovision_issues", JSON.stringify(issues));

      // If status changed, log it
      if (updates.status && updates.status !== oldStatus) {
        let note = `Workflow transitioned from ${oldStatus} to ${updates.status}.`;
        let actor = "system";
        let actorName = "Workflow Engine";

        const curUser = this.getCurrentUser();
        if (curUser) {
          actor = curUser.uid;
          actorName = curUser.displayName;
        }

        if (updates.status === "ACCEPTED") {
          note = "Task accepted by staff. SLA countdown active.";
        } else if (updates.status === "IN_PROGRESS") {
          note = "Staff started remediation works on site.";
        } else if (updates.status === "RESOLUTION_SUBMITTED") {
          note = "Remediation completed. Resolution photo submitted for AI verification.";
        } else if (updates.status === "RESOLVED") {
          note = "Issue resolved and closed.";
        } else if (updates.status === "REOPENED") {
          note = "Issue reopened by administrator. Redirected to staff queue.";
        }

        this.addWorkflowLog({
          issueId: id,
          fromState: oldStatus,
          toState: updates.status,
          actor,
          actorName,
          note
        });

        // Trigger notifications
        if (updates.status === "RESOLVED") {
          this.addNotification({
            userId: issues[index].reportedBy,
            text: `✅ Your reported issue ${id} has been resolved! EcoScore updated.`
          });
        } else if (updates.status === "ADMIN_REVIEW" || updates.status === "REVIEW_REQUIRED") {
          this.addNotification({
            userId: "admin-1",
            text: `⚠️ Issue ${id} verification uncertain or failed. Routed to Admin review.`
          });
        }
      }

      return issues[index];
    }
    return null;
  },

  // Workflow Logs
  getWorkflowLogs(issueId) {
    const logs = JSON.parse(localStorage.getItem("ecovision_workflow_logs")) || [];
    return logs.filter(l => l.issueId === issueId).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  },

  addWorkflowLog(logData) {
    const logs = JSON.parse(localStorage.getItem("ecovision_workflow_logs")) || [];
    const newLog = {
      id: "log-" + Math.random().toString(36).substr(2, 9),
      issueId: logData.issueId,
      fromState: logData.fromState,
      toState: logData.toState,
      actor: logData.actor || "system",
      actorName: logData.actorName || "System Engine",
      timestamp: new Date().toISOString(),
      note: logData.note || ""
    };
    logs.push(newLog);
    localStorage.setItem("ecovision_workflow_logs", JSON.stringify(logs));
    return newLog;
  },

  // Notifications
  getNotifications(userId) {
    const notifs = JSON.parse(localStorage.getItem("ecovision_notifications")) || [];
    return notifs.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  addNotification(notificationData) {
    const notifs = JSON.parse(localStorage.getItem("ecovision_notifications")) || [];
    const newNotif = {
      id: "notif-" + Math.random().toString(36).substr(2, 9),
      userId: notificationData.userId,
      text: notificationData.text,
      read: false,
      createdAt: new Date().toISOString()
    };
    notifs.push(newNotif);
    localStorage.setItem("ecovision_notifications", JSON.stringify(notifs));
    return newNotif;
  },

  markNotificationsRead(userId) {
    const notifs = JSON.parse(localStorage.getItem("ecovision_notifications")) || [];
    notifs.forEach(n => {
      if (n.userId === userId) n.read = true;
    });
    localStorage.setItem("ecovision_notifications", JSON.stringify(notifs));
  },

  // Firebase Config Helpers
  saveFirebaseConfig(config) {
    localStorage.setItem("ecovision_firebase_config", JSON.stringify(config));
    localStorage.setItem("ecovision_db_mode", "firebase");
  },

  getFirebaseConfig() {
    const config = localStorage.getItem("ecovision_firebase_config");
    if (config) return JSON.parse(config);
    // User credentials fallback
    return {
      apiKey: "AIzaSyBeSXXkb87NEXyl3OcKNj5XTb5_pKOKESU",
      authDomain: "ecovision-ai-46d25.firebaseapp.com",
      projectId: "ecovision-ai-46d25",
      storageBucket: "ecovision-ai-46d25.firebasestorage.app",
      messagingSenderId: "182517139819",
      appId: "1:182517139819:web:0ea423c90791ed8db4a42e",
      measurementId: "G-GJPERQ2BD5"
    };
  },

  clearFirebaseConfig() {
    localStorage.removeItem("ecovision_firebase_config");
    localStorage.setItem("ecovision_db_mode", "mock");
  },

  getDbMode() {
    return localStorage.getItem("ecovision_db_mode") || "mock";
  },

  getMockUsers() { return MOCK_USERS; },
  getMockIssues() { return MOCK_ISSUES; },
  getMockLogs() { return MOCK_WORKFLOW_LOGS; },
  getMockNotifs() { return MOCK_NOTIFICATIONS; }
};

window.mockDb = mockDb;
export default mockDb;
