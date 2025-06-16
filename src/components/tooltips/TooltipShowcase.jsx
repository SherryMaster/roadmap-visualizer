import Tooltip from "./Tooltip";
import EnhancedTooltip, { 
  GlassTooltip, 
  MinimalTooltip, 
  RichTooltip, 
  SuccessTooltip, 
  WarningTooltip, 
  ErrorTooltip, 
  InfoTooltip 
} from "./EnhancedTooltip";
import { 
  BasicTooltipContent, 
  RichTooltipContent, 
  StatusTooltipContent, 
  ShortcutTooltipContent, 
  ProgressTooltipContent 
} from "./TooltipContent";

/**
 * Tooltip Showcase Component
 * Demonstrates the enhanced tooltip system with various styles and content types
 * This component can be used for testing and as a reference for developers
 */
const TooltipShowcase = () => {
  return (
    <div className="p-8 space-y-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Enhanced Tooltip System
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Professional, accessible, and beautifully animated tooltips for modern web applications.
        </p>

        {/* Basic Tooltips */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Basic Tooltips
          </h2>
          <div className="flex flex-wrap gap-4">
            <Tooltip content="This is a standard tooltip with enhanced styling">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Standard Tooltip
              </button>
            </Tooltip>

            <Tooltip 
              content="Tooltip positioned on the right side"
              position="right"
            >
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Right Position
              </button>
            </Tooltip>

            <Tooltip 
              content="Bottom positioned tooltip with custom width"
              position="bottom"
              maxWidth="300px"
            >
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Bottom Position
              </button>
            </Tooltip>
          </div>
        </section>

        {/* Enhanced Tooltip Variants */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Enhanced Variants
          </h2>
          <div className="flex flex-wrap gap-4">
            <GlassTooltip content="Beautiful glass morphism effect with backdrop blur">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Glass Effect
              </button>
            </GlassTooltip>

            <MinimalTooltip content="Clean and minimal design for subtle interactions">
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                Minimal Style
              </button>
            </MinimalTooltip>

            <SuccessTooltip content="Perfect for positive feedback and confirmations">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Success Style
              </button>
            </SuccessTooltip>

            <WarningTooltip content="Ideal for warnings and important notices">
              <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
                Warning Style
              </button>
            </WarningTooltip>

            <ErrorTooltip content="Clear error messaging with appropriate styling">
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Error Style
              </button>
            </ErrorTooltip>

            <InfoTooltip content="Informational tooltips for helpful context">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Info Style
              </button>
            </InfoTooltip>
          </div>
        </section>

        {/* Rich Content Tooltips */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Rich Content Tooltips
          </h2>
          <div className="flex flex-wrap gap-4">
            <RichTooltip
              content={
                <BasicTooltipContent
                  icon="🚀"
                  title="Quick Action"
                  description="This action will immediately process your request and update the interface."
                />
              }
            >
              <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
                Basic Content
              </button>
            </RichTooltip>

            <RichTooltip
              content={
                <RichTooltipContent
                  icon="⚙️"
                  title="Advanced Settings"
                  description="Configure advanced options for your workflow"
                  badge="Pro"
                  sections={[
                    {
                      title: "Features",
                      items: [
                        "Custom automation rules",
                        "Advanced filtering options",
                        "Priority task management"
                      ]
                    }
                  ]}
                  footer="Available in Pro plan"
                />
              }
            >
              <button className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
                Rich Content
              </button>
            </RichTooltip>

            <Tooltip
              content={
                <StatusTooltipContent
                  status="success"
                  message="Task Completed"
                  details="All dependencies have been resolved and the task is ready for review."
                  timestamp="2 minutes ago"
                />
              }
            >
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                Status Content
              </button>
            </Tooltip>

            <Tooltip
              content={
                <ShortcutTooltipContent
                  action="Save Document"
                  shortcuts={["Ctrl", "S"]}
                  description="Quickly save your current progress"
                />
              }
            >
              <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                Keyboard Shortcut
              </button>
            </Tooltip>

            <Tooltip
              content={
                <ProgressTooltipContent
                  label="Project Progress"
                  current={7}
                  total={10}
                  percentage={70}
                  details="3 tasks remaining to complete this milestone"
                />
              }
            >
              <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                Progress Content
              </button>
            </Tooltip>
          </div>
        </section>

        {/* Interactive Elements */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Interactive Elements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Tooltip content="Click to expand task details and view dependencies">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
                <h3 className="font-medium text-gray-900 dark:text-white">Task Card</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Hover to see tooltip
                </p>
              </div>
            </Tooltip>

            <InfoTooltip content="This icon provides additional context about the feature">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400">ℹ</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Info Icon</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Hover the icon</p>
                </div>
              </div>
            </InfoTooltip>

            <SuccessTooltip content="All systems operational and running smoothly">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Status Indicator</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">System healthy</p>
                </div>
              </div>
            </SuccessTooltip>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TooltipShowcase;
