// Test script to verify split/reconstruction logic
import FirestorePersistence from './src/utils/FirestorePersistence.js';

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
const { outline, phaseTasks } = FirestorePersistence.splitRoadmapData(testRoadmap);

console.log("Original roadmap phases:", testRoadmap.roadmap.phases.length);
console.log("Outline phases:", outline.roadmap.phases.length);
console.log("Phase tasks count:", phaseTasks.length);

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

const reconstructed = FirestorePersistence.reconstructRoadmapData(mockRoadmapData, mockPhaseTasksSnap);

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
