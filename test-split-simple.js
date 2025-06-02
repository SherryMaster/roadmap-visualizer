// Simple test of split logic without Firebase dependencies

// Copy the split logic from FirestorePersistence
function splitRoadmapData(roadmapData) {
  // Create outline without task details
  const outline = {
    title: roadmapData.title,
    description: roadmapData.description,
    tags: roadmapData.tags,
    project_level: roadmapData.project_level,
    roadmap: {
      phases: [],
    },
  };

  const phaseTasks = [];

  // Handle both UI format (roadmap.phases) and direct phases array
  let phases = null;
  if (roadmapData.roadmap && roadmapData.roadmap.phases) {
    phases = roadmapData.roadmap.phases;
  } else if (roadmapData.phases) {
    phases = roadmapData.phases;
  }

  if (phases) {
    phases.forEach((phase, index) => {
      // Create phase outline without tasks
      const phaseOutline = {
        phase_id: phase.phase_id,
        phase_title: phase.phase_title,
        phase_summary: phase.phase_summary,
        phase_details: phase.phase_details,
        phase_number: phase.phase_number || index + 1,
        phase_dependencies: phase.phase_dependencies,
        key_milestones: phase.key_milestones,
        success_indicators: phase.success_indicators,
        // Store task count but not the actual tasks
        task_count: (phase.phase_tasks || phase.tasks || []).length,
      };

      outline.roadmap.phases.push(phaseOutline);

      // Store tasks separately
      if (phase.phase_tasks || phase.tasks) {
        phaseTasks.push({
          phase_id: phase.phase_id,
          phase_tasks: phase.phase_tasks || phase.tasks || [],
        });
      }
    });
  }

  return { outline, phaseTasks };
}

// Copy the reconstruction logic
function reconstructRoadmapData(roadmapData, phaseTasksSnap) {
  // Get phase tasks data
  const phaseTasksMap = new Map();
  phaseTasksSnap.forEach((doc) => {
    const data = doc.data();
    // Use the correct field name - we store as 'tasks' not 'data.tasks'
    phaseTasksMap.set(data.phaseId, data.tasks);
  });

  // Reconstruct full roadmap using assembler-style merging
  const fullData = {
    ...roadmapData.outline,
    roadmap: {
      phases: roadmapData.outline.roadmap.phases.map((phase) => {
        // Remove task_count field and add actual tasks
        const { task_count, ...phaseWithoutCount } = phase;
        return {
          ...phaseWithoutCount,
          phase_tasks: phaseTasksMap.get(phase.phase_id) || [],
        };
      }),
    },
  };

  console.log("🔄 Reconstructed roadmap data:", {
    phasesCount: fullData.roadmap.phases.length,
    totalTasks: fullData.roadmap.phases.reduce(
      (sum, phase) => sum + phase.phase_tasks.length,
      0
    ),
    phaseTasksMapSize: phaseTasksMap.size,
  });

  return {
    id: roadmapData.id,
    data: fullData,
    originalData: fullData,
    isPublic: roadmapData.isPublic,
    userId: roadmapData.userId,
    createdAt: roadmapData.createdAt,
    updatedAt: roadmapData.updatedAt,
    lastAccessed: roadmapData.lastAccessed,
  };
}

// Test data
const testRoadmap = {
  "title": "Test Split Document Roadmap",
  "description": "A test roadmap to verify split document functionality",
  "tags": ["test", "split-document"],
  "project_level": "beginner",
  "roadmap": {
    "phases": [
      {
        "phase_id": "phase_1",
        "phase_title": "Phase 1: Setup",
        "phase_summary": "Initial setup phase",
        "phase_details": ["Set up development environment"],
        "phase_number": 1,
        "phase_dependencies": [],
        "key_milestones": ["Environment ready"],
        "success_indicators": ["All tools installed"],
        "phase_tasks": [
          {
            "task_id": "task_1_1",
            "task_title": "Install Node.js",
            "task_description": "Install Node.js runtime",
            "task_number": 1,
            "difficulty": "beginner",
            "estimated_time": "30 minutes"
          },
          {
            "task_id": "task_1_2",
            "task_title": "Setup Git",
            "task_description": "Configure Git for version control",
            "task_number": 2,
            "difficulty": "beginner",
            "estimated_time": "15 minutes"
          }
        ]
      },
      {
        "phase_id": "phase_2",
        "phase_title": "Phase 2: Development",
        "phase_summary": "Main development phase",
        "phase_details": ["Build the application"],
        "phase_number": 2,
        "phase_dependencies": ["phase_1"],
        "key_milestones": ["First feature complete"],
        "success_indicators": ["Tests passing"],
        "phase_tasks": [
          {
            "task_id": "task_2_1",
            "task_title": "Create React App",
            "task_description": "Initialize React application",
            "task_number": 1,
            "difficulty": "intermediate",
            "estimated_time": "1 hour"
          }
        ]
      }
    ]
  }
};

// Test split logic
console.log("🧪 Testing split logic...");
const { outline, phaseTasks } = splitRoadmapData(testRoadmap);

console.log("Original roadmap phases:", testRoadmap.roadmap.phases.length);
console.log("Outline phases:", outline.roadmap.phases.length);
console.log("Phase tasks count:", phaseTasks.length);

console.log("\nOutline structure:");
console.log(JSON.stringify(outline, null, 2));

console.log("\nPhase tasks structure:");
console.log(JSON.stringify(phaseTasks, null, 2));

// Simulate phase tasks documents
const mockPhaseTasksSnap = {
  forEach: (callback) => {
    phaseTasks.forEach((phaseTask, index) => {
      callback({
        data: () => ({
          roadmapId: "test-roadmap-id",
          phaseId: phaseTask.phase_id,
          phaseNumber: index + 1,
          tasks: phaseTask.phase_tasks,
        })
      });
    });
  }
};

// Test reconstruction logic
console.log("\n🔄 Testing reconstruction logic...");
const mockRoadmapData = {
  id: "test-roadmap-id",
  outline: outline,
  isPublic: false,
  userId: "test-user",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastAccessed: new Date(),
};

const reconstructed = reconstructRoadmapData(mockRoadmapData, mockPhaseTasksSnap);

console.log("Reconstructed phases:", reconstructed.data.roadmap.phases.length);
console.log("Total tasks in reconstructed:", reconstructed.data.roadmap.phases.reduce((sum, phase) => sum + phase.phase_tasks.length, 0));

// Verify data integrity
const originalTotalTasks = testRoadmap.roadmap.phases.reduce((sum, phase) => sum + phase.phase_tasks.length, 0);
const reconstructedTotalTasks = reconstructed.data.roadmap.phases.reduce((sum, phase) => sum + phase.phase_tasks.length, 0);

console.log("\n✅ Verification:");
console.log("Original total tasks:", originalTotalTasks);
console.log("Reconstructed total tasks:", reconstructedTotalTasks);
console.log("Data integrity:", originalTotalTasks === reconstructedTotalTasks ? "✅ PASS" : "❌ FAIL");

// Check phase structure
console.log("\n📋 Phase structure comparison:");
testRoadmap.roadmap.phases.forEach((originalPhase, index) => {
  const reconstructedPhase = reconstructed.data.roadmap.phases[index];
  console.log(`Phase ${index + 1}:`);
  console.log(`  Original tasks: ${originalPhase.phase_tasks.length}`);
  console.log(`  Reconstructed tasks: ${reconstructedPhase.phase_tasks.length}`);
  console.log(`  Phase ID match: ${originalPhase.phase_id === reconstructedPhase.phase_id ? "✅" : "❌"}`);
});

console.log("\nReconstructed roadmap structure:");
console.log(JSON.stringify(reconstructed.data, null, 2));
