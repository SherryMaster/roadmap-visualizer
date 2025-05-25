// Test script to verify tags functionality in Roadmap Assembler
import MultiSchemaValidator from "./src/utils/MultiSchemaValidator.js";
import RoadmapMerger from "./src/utils/RoadmapMerger.js";
import { readFileSync } from "fs";

// Load JSON schemas
const skeletonSchema = JSON.parse(
  readFileSync("./src/data/roadmap_skeleton_schema.json", "utf8")
);
const tasksSchema = JSON.parse(
  readFileSync("./src/data/skeleton_tasks_schema.json", "utf8")
);
const finalSchema = JSON.parse(readFileSync("./src/data/schema.json", "utf8"));

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

const invalidSkeletonWithBadTags = {
  ...validSkeletonWithTags,
  tags: ["valid-tag", "", 123, null],
};

const skeletonWithoutTags = {
  ...validSkeletonWithTags,
};
delete skeletonWithoutTags.tags;

// Initialize validator
const validator = new MultiSchemaValidator({
  skeleton: skeletonSchema,
  tasks: tasksSchema,
  final: finalSchema,
});

console.log("🧪 Testing Tags Functionality in Roadmap Assembler\n");

// Test 1: Valid skeleton with tags
console.log("Test 1: Valid skeleton with tags");
const result1 = validator.validateSkeleton(validSkeletonWithTags);
console.log("✅ Valid skeleton result:", result1.isValid ? "PASS" : "FAIL");
if (!result1.isValid) {
  console.log("❌ Errors:", result1.errors);
}

// Test 2: Invalid skeleton with bad tags
console.log("\nTest 2: Invalid skeleton with bad tags");
const result2 = validator.validateSkeleton(invalidSkeletonWithBadTags);
console.log("✅ Invalid tags caught:", !result2.isValid ? "PASS" : "FAIL");
if (!result2.isValid) {
  console.log("✅ Expected errors:", result2.errors);
}

// Test 3: Skeleton without tags (should fail since tags is required)
console.log("\nTest 3: Skeleton without tags");
const result3 = validator.validateSkeleton(skeletonWithoutTags);
console.log("✅ Missing tags caught:", !result3.isValid ? "PASS" : "FAIL");
if (!result3.isValid) {
  console.log("✅ Expected errors:", result3.errors);
}

// Test 4: Tags extraction (skeleton only)
console.log("\nTest 4: Tags extraction (skeleton only)");
try {
  const merged = RoadmapMerger.merge(validSkeletonWithTags, [validTasks]);
  console.log("✅ Merge successful:", merged ? "PASS" : "FAIL");

  if (merged) {
    console.log("✅ Merged tags:", merged.tags);
    console.log(
      "✅ Contains skeleton tags only:",
      merged.tags.includes("test") &&
        merged.tags.includes("validation") &&
        merged.tags.includes("assembler")
        ? "PASS"
        : "FAIL"
    );
    console.log(
      "✅ Does NOT contain task tags:",
      !merged.tags.includes("task-test") &&
        !merged.tags.includes("implementation")
        ? "PASS"
        : "FAIL"
    );
    console.log(
      "✅ Does NOT contain project level tag:",
      !merged.tags.includes("beginner") ? "PASS" : "FAIL"
    );
    console.log(
      "✅ Task-level tags preserved in tasks:",
      merged.roadmap.phases[0].phase_tasks[0].task_tags.includes("task-test") &&
        merged.roadmap.phases[0].phase_tasks[0].task_tags.includes(
          "implementation"
        )
        ? "PASS"
        : "FAIL"
    );
  }
} catch (error) {
  console.log("❌ Merge failed:", error.message);
}

console.log("\n🎉 Tags functionality testing complete!");
