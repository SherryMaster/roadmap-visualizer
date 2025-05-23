import CodeBlock from "./CodeBlock";
import DifficultyIndicator from "./DifficultyIndicator";
import EstimatedTime from "./EstimatedTime";
import ResourceLinks from "./ResourceLinks";
import TaskDependencies from "./TaskDependencies";
import TagsList from "./TagsList";
import OutcomesList from "./OutcomesList";
import SubtasksList from "./SubtasksList";
import PriorityBadge from "./PriorityBadge";
import TaskNotes from "./TaskNotes";
import configManager from "../utils/ConfigManager";
import schemaMapper from "../utils/SchemaMapper";

const TaskDetail = ({ detail, task, taskId, phaseNumber, allPhases }) => {
  // Get component configurations
  const difficultyConfig = configManager.getComponentConfig("difficulty");
  const timeConfig = configManager.getComponentConfig("estimatedTime");
  const resourceConfig = configManager.getComponentConfig("resourceLinks");
  const dependencyConfig = configManager.getComponentConfig("taskDependencies");
  const tagConfig = configManager.getComponentConfig("tags");
  const priorityConfig = configManager.getComponentConfig("priority");
  const codeConfig = configManager.getComponentConfig("codeBlocks");

  // Handle both old format (detail object) and new format (task object)
  // If we have a task object, use its task_detail, otherwise use the detail prop
  const taskDetail = task?.task_detail || detail;

  // Extract properties from the correct locations
  // Task-level properties (from task object)
  const taskDependencies = task?.task_dependencies || [];
  const tags = task?.task_tags || [];
  const priority = task?.task_priority || "mid";

  // Task detail properties (from task_detail object)
  const detailText = taskDetail?.detail || taskDetail?.explanation || "";
  const difficulty = taskDetail?.difficulty;
  const estTime = taskDetail?.est_time;
  const resourceLinks = taskDetail?.resource_links;
  const codeBlocks = taskDetail?.code_blocks;
  const outcomes = taskDetail?.outcomes;
  const subtasks = taskDetail?.subtasks;
  const notes = taskDetail?.notes;

  // Legacy code support
  const legacyCode = taskDetail?.code;

  // Split detail text into sections based on newlines
  const paragraphs = detailText
    ? detailText.split("\n").filter((p) => p.trim() !== "")
    : [];

  return (
    <div className="space-y-4">
      {/* Primary indicators */}
      <div className="flex flex-wrap gap-2 mb-4">
        {difficulty && (
          <DifficultyIndicator
            difficulty={difficulty}
            showReason={difficultyConfig.showReason}
            showPrerequisites={difficultyConfig.showPrerequisites}
          />
        )}
        {estTime && (
          <EstimatedTime
            est_time={estTime}
            showRange={timeConfig.showRange}
            showFactors={timeConfig.showFactors}
          />
        )}
        {priority && (
          <PriorityBadge
            priority={priority}
            showIcon={priorityConfig.showIcon}
            style={priorityConfig.style}
          />
        )}
      </div>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <TagsList
          tags={tags}
          clickable={tagConfig.clickable}
          colorCoded={tagConfig.colorCoded}
          maxDisplay={tagConfig.maxDisplay}
        />
      )}

      {/* Main content */}
      <div className="mt-4">
        {paragraphs.map((p, index) => (
          <p key={index} className="text-gray-700 dark:text-gray-300 mb-3">
            {p}
          </p>
        ))}
      </div>

      {/* Code blocks */}
      {(codeBlocks || legacyCode) && (
        <div className="mt-4">
          <CodeBlock
            code_blocks={codeBlocks}
            code={legacyCode}
            showLanguage={codeConfig.showLanguage}
            showComplexity={codeConfig.showComplexity}
            showExplanation={true}
          />
        </div>
      )}

      {/* Outcomes */}
      {outcomes && <OutcomesList outcomes={outcomes} />}

      {/* Resource links */}
      {resourceLinks && (
        <ResourceLinks
          resource_links={resourceLinks}
          showType={resourceConfig.showType}
          groupByType={resourceConfig.groupByType}
          highlightEssential={resourceConfig.highlightEssential}
        />
      )}

      {/* Task dependencies */}
      {taskDependencies && (
        <TaskDependencies
          dependencies={taskDependencies}
          allPhases={allPhases}
          showType={dependencyConfig.showType}
          allowNavigation={dependencyConfig.allowNavigation}
        />
      )}

      {/* Subtasks */}
      {subtasks && (
        <SubtasksList
          subtasks={subtasks}
          taskId={taskId}
          phaseNumber={phaseNumber}
        />
      )}

      {/* Notes */}
      <TaskNotes
        taskId={taskId}
        phaseNumber={phaseNumber}
        initialNotes={notes}
      />
    </div>
  );
};

export default TaskDetail;
