// Browser console test for tags functionality
// Copy and paste this into the browser console on the assembler page

// Test data
const validSkeletonWithTags = {
  roadmap_title: "Test Roadmap with Tags",
  roadmap_description: "A test roadmap to verify tags functionality.",
  num_of_phases: 1,
  project_level: "beginner",
  phases: [
    {
      phase_title: "Phase 1: Test",
      phase_summary: "Test phase",
      phase_id: "P1_TEST",
      num_of_tasks: 1,
      phase_details: ["Test phase details"],
      phase_number: 1,
      phase_dependencies: [],
      key_milestones: ["Test milestone"],
      success_indicators: ["Test indicator"],
    },
  ],
  tags: ["test", "validation", "assembler"],
};

const validTasks = {
  tasks: [
    {
      phase_id: "P1_TEST",
      task_id: "T1_TEST",
      task_difficulty: "easy",
      task_title: "Test Task",
      task_summary: "A test task",
      task_detail: ["Test task details"],
      code_blocks: [],
      difficulty_reason: "Simple test",
      prerequisites_needed: [],
      task_dependencies: [],
      est_time: {
        min_time: { amount: 30, unit: "minutes" },
        max_time: { amount: 60, unit: "minutes" },
        factors_affecting_time: [],
      },
      resource_links: [],
      task_priority: "mid",
      task_tags: ["task-test", "implementation"],
    },
  ],
};

console.log("🧪 Testing Tags Functionality");

// Test if the classes are available
if (typeof MultiSchemaValidator !== "undefined") {
  console.log("✅ MultiSchemaValidator is available");
} else {
  console.log("❌ MultiSchemaValidator not found");
}

if (typeof RoadmapMerger !== "undefined") {
  console.log("✅ RoadmapMerger is available");
} else {
  console.log("❌ RoadmapMerger not found");
}

// Test the validation and merging if classes are available
// Note: This assumes the classes are globally available or can be imported
console.log("📝 To test manually:");
console.log("1. Upload the test_skeleton_with_tags.json file");
console.log("2. Upload the test_tasks_with_tags.json file");
console.log("3. Check that validation passes");
console.log("4. Check that the merged roadmap contains ONLY skeleton tags");
console.log(
  "5. Try uploading test_skeleton_invalid_tags.json to see error handling"
);
console.log(
  "6. Try uploading test_skeleton_no_tags.json to see missing tags error"
);

console.log("\n🎯 Expected behavior:");
console.log("- Valid files should pass validation");
console.log("- Invalid tags should trigger validation errors");
console.log("- Missing tags should trigger validation errors");
console.log("- Merged roadmap should contain ONLY tags from skeleton file");
console.log(
  "- Task-level tags should be preserved in individual tasks, not roadmap level"
);
