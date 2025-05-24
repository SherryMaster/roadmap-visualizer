# Modular Roadmap Schema System

## Overview

This modular schema system is designed to support generating extremely large roadmaps (50+ phases with 25+ tasks each) by breaking the AI generation process into manageable chunks while maintaining data integrity and relationships.

## Schema Components

### 1. Roadmap Skeleton Schema (`roadmap-skeleton.json`)

**Purpose**: Generate high-level roadmap structure with phase outlines only.

**Key Features**:
- Contains roadmap metadata (title, description, tags, project level)
- Defines phase structure with IDs, titles, dependencies, and summaries
- Includes estimated durations and task counts
- Excludes individual task details to keep generation focused

**Use Case**: First step in roadmap generation - establishes the overall structure and learning path.

**Generated Content**:
- Roadmap title and description
- Phase outlines with dependencies
- Key milestones and success indicators
- Duration estimates
- Phase complexity levels

### 2. Phase Tasks Schema (`phase-tasks.json`)

**Purpose**: Generate detailed task lists for specific phases.

**Key Features**:
- References parent roadmap and specific phase via IDs
- Creates task lists with basic properties (title, summary, difficulty, time)
- Includes task dependencies and relationships
- Excludes detailed task content (subtasks, code examples, resources)

**Use Case**: Second step - generates comprehensive task breakdowns for individual phases.

**Generated Content**:
- Task titles and summaries
- Difficulty levels and time estimates
- Task dependencies and priorities
- Prerequisites and expected outcomes
- Task categorization and tags

### 3. Task Details Schema (`task-details.json`)

**Purpose**: Generate comprehensive content for specific tasks.

**Key Features**:
- References parent roadmap, phase, and specific task via IDs
- Contains detailed explanations, subtasks, and learning materials
- Includes code examples, resources, and troubleshooting guidance
- Provides complete learning content for individual tasks

**Use Case**: Final step - creates detailed learning content for specific tasks as needed.

**Generated Content**:
- Detailed explanations and step-by-step guidance
- Learning objectives and difficulty analysis
- Subtasks with duration estimates
- Code examples with explanations
- Resource links and references

## ID System and Relationships

### Unique Identifiers
- **roadmap_id**: Unique identifier for the entire roadmap
- **phase_id**: Unique identifier for each phase within a roadmap
- **task_id**: Unique identifier for each task within a phase

### Linking Structure
```
roadmap_skeleton.json
├── roadmap_id: "roadmap_001"
└── phases[]
    ├── phase_id: "P1_Setup"
    ├── phase_id: "P2_Development"
    └── phase_id: "P3_Testing"

phase-tasks.json
├── roadmap_id: "roadmap_001" (reference)
├── target_phase_id: "P1_Setup" (reference)
└── phase_tasks[]
    ├── task_id: "P1T1_Environment"
    ├── task_id: "P1T2_Tools"
    └── task_id: "P1T3_Planning"

task-details.json
├── roadmap_id: "roadmap_001" (reference)
├── target_phase_id: "P1_Setup" (reference)
├── target_task_id: "P1T1_Environment" (reference)
└── task_detail: { detailed content }
```

## Schema Validation and Compatibility

### OpenAPI 3.0.3 Compliance
- All schemas follow OpenAPI 3.0.3 Schema Object specification
- Compatible with AI structured output APIs (Google Gemini, OpenAI, Anthropic)
- No `$schema` declarations to ensure maximum compatibility
- Consistent property naming and type definitions

### Independent Validation
- Each schema can be validated independently
- Schema metadata enables type detection and validation
- Context objects ensure data consistency across schemas

### Seamless Merging
- Consistent ID systems enable automatic data linking
- Reference fields ensure proper parent-child relationships
- Metadata fields support intelligent content insertion

## Generation Workflow

### Step 1: Generate Roadmap Skeleton
```json
{
  "schema_metadata": {
    "schema_type": "roadmap_skeleton",
    "roadmap_id": "unique_roadmap_id",
    "generation_target": "skeleton_only"
  },
  // ... roadmap structure with phase outlines
}
```

### Step 2: Generate Phase Tasks (per phase)
```json
{
  "schema_metadata": {
    "schema_type": "phase_tasks", 
    "roadmap_id": "unique_roadmap_id",
    "target_phase_id": "specific_phase_id",
    "generation_target": "phase_tasks_only"
  },
  // ... detailed task list for the specified phase
}
```

### Step 3: Generate Task Details (per task)
```json
{
  "schema_metadata": {
    "schema_type": "task_details",
    "roadmap_id": "unique_roadmap_id", 
    "target_phase_id": "specific_phase_id",
    "target_task_id": "specific_task_id",
    "generation_target": "task_details_only"
  },
  // ... comprehensive content for the specified task
}
```

## Benefits

### AI Generation Efficiency
- Breaks large roadmaps into manageable generation chunks
- Reduces token usage and improves generation quality
- Enables focused content generation for specific components
- Supports iterative refinement of individual sections

### Data Integrity
- Consistent ID systems prevent data corruption
- Reference validation ensures proper relationships
- Context objects maintain consistency across schemas
- Metadata enables intelligent merging and validation

### Scalability
- Supports roadmaps of any size without overwhelming AI capabilities
- Enables parallel generation of different components
- Allows selective regeneration of specific sections
- Facilitates incremental roadmap building

### Future Integration
- Designed for "Roadmap Builder" feature integration
- Supports intelligent content insertion based on schema type
- Enables dynamic roadmap assembly from modular components
- Facilitates content management and version control

## Usage Guidelines

1. **Always start with roadmap skeleton** to establish structure
2. **Generate phase tasks incrementally** for better quality control
3. **Create task details on-demand** to optimize resource usage
4. **Validate references** when merging schemas
5. **Use consistent ID naming conventions** for maintainability
6. **Include context objects** to ensure data consistency
7. **Leverage metadata fields** for intelligent processing
