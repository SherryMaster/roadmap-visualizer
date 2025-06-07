import CodeBlock from "../ui/CodeBlock";
import ContentRenderer from "../ui/ContentRenderer";
import DifficultyIndicator from "./DifficultyIndicator";
import EstimatedTime from "./EstimatedTime";
import ResourceLinks from "./ResourceLinks";
import TaskDependencies from "./TaskDependencies";
import TagsList from "./TagsList";
import OutcomesList from "./OutcomesList";
import SubtasksList from "./SubtasksList";
import PriorityBadge from "./PriorityBadge";
import TaskNotes from "./TaskNotes";
import configManager from "../../utils/ConfigManager";
import schemaMapper from "../../utils/SchemaMapper";

const TaskDetail = ({
  detail,
  task,
  taskId,
  phaseNumber,
  allPhases,
  isPublicView = false,
}) => {
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
  // Handle new schema format with content and format fields

  // Extract content and format from the explanation object
  let contentData = "";
  let contentFormat = "plaintext";

  if (taskDetail?.explanation && typeof taskDetail.explanation === "object") {
    // New format: taskDetail.explanation = {content: "...", format: "..."}
    if (taskDetail.explanation.content) {
      contentData = taskDetail.explanation.content;
      contentFormat = taskDetail.explanation.format || "plaintext";
    }
  } else if (
    taskDetail?.explanation &&
    typeof taskDetail.explanation === "string"
  ) {
    // Legacy format: taskDetail.explanation is a string
    contentData = taskDetail.explanation;
    contentFormat = "plaintext";
  } else if (taskDetail?.detail && typeof taskDetail.detail === "string") {
    // Legacy format: taskDetail.detail is a string
    contentData = taskDetail.detail;
    contentFormat = "plaintext";
  } else if (Array.isArray(taskDetail?.detail)) {
    // Legacy format: taskDetail.detail is an array
    contentData = taskDetail.detail.join(" ");
    contentFormat = "plaintext";
  }

  const difficulty = taskDetail?.difficulty;
  const estTime = taskDetail?.est_time;
  const resourceLinks = taskDetail?.resource_links;
  const codeBlocks = taskDetail?.code_blocks;
  const outcomes = taskDetail?.outcomes;
  const subtasks = taskDetail?.subtasks;
  const notes = taskDetail?.notes;

  // Legacy code support
  const legacyCode = taskDetail?.code;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Primary indicators - Responsive grid with mobile-first approach */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {difficulty && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700 h-fit min-h-[100px] sm:min-h-[120px] flex flex-col">
            <DifficultyIndicator
              difficulty={difficulty}
              showReason={difficultyConfig.showReason}
              showPrerequisites={difficultyConfig.showPrerequisites}
              compact={false}
            />
          </div>
        )}
        {estTime && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700 h-fit min-h-[100px] sm:min-h-[120px] flex flex-col">
            <EstimatedTime
              est_time={estTime}
              showRange={timeConfig.showRange}
              showFactors={timeConfig.showFactors}
            />
          </div>
        )}
        {priority && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700 h-fit min-h-[100px] sm:min-h-[120px] flex flex-col">
            <PriorityBadge
              priority={priority}
              showIcon={priorityConfig.showIcon}
              style={priorityConfig.style}
            />
          </div>
        )}
      </div>

      {/* Tags - Compact display with overflow handling */}
      {tags && tags.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <svg
              className="w-4 h-4 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            Tags
          </h4>
          <TagsList
            tags={tags}
            clickable={tagConfig.clickable}
            colorCoded={tagConfig.colorCoded}
            maxDisplay={tagConfig.maxDisplay || 4}
            compact={false}
          />
        </div>
      )}

      {/* Main content with format-aware rendering */}
      {contentData && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <svg
              className="w-4 h-4 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
            Task Details
          </h4>
          <ContentRenderer
            content={contentData}
            format={contentFormat}
            showFormatIndicator={true}
            collapsible={contentData.length > 500}
            maxHeight={300}
          />
        </div>
      )}

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
          isPublicView={isPublicView}
        />
      )}

      {/* Notes - Only show for owners */}
      {!isPublicView && (
        <TaskNotes
          taskId={taskId}
          phaseNumber={phaseNumber}
          initialNotes={notes}
        />
      )}
    </div>
  );
};

export default TaskDetail;
