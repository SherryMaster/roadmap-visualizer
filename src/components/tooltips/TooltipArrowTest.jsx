import Tooltip from "./Tooltip";
import { GlassTooltip, SuccessTooltip, ErrorTooltip } from "./EnhancedTooltip";

/**
 * Tooltip Arrow Test Component
 * Specifically designed to test arrow positioning when tooltips switch positions
 * due to viewport boundaries
 */
const TooltipArrowTest = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Tooltip Arrow Positioning Test
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-12 text-center">
          Test tooltip arrow positioning when tooltips switch positions due to viewport boundaries.
          Move your mouse to the edges of the screen and hover over the buttons.
        </p>

        {/* Top edge test */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Top Edge Test (should flip to bottom)
          </h2>
          <div className="flex justify-center gap-4 pt-2">
            <Tooltip 
              content="This tooltip should appear below when near the top edge, with arrow pointing up"
              position="top"
            >
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Top Edge Button 1
              </button>
            </Tooltip>
            
            <GlassTooltip 
              content="Glass tooltip that should flip to bottom position with proper arrow alignment"
              position="top"
            >
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Top Edge Button 2
              </button>
            </GlassTooltip>
          </div>
        </div>

        {/* Left edge test */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Left Edge Test (should flip to right)
          </h2>
          <div className="flex flex-col gap-4 items-start pl-2">
            <Tooltip 
              content="This tooltip should appear on the right when near the left edge, with arrow pointing left"
              position="left"
            >
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Left Edge Button 1
              </button>
            </Tooltip>
            
            <SuccessTooltip 
              content="Success tooltip that should flip to right position with proper arrow alignment"
              position="left"
            >
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                Left Edge Button 2
              </button>
            </SuccessTooltip>
          </div>
        </div>

        {/* Right edge test */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Right Edge Test (should flip to left)
          </h2>
          <div className="flex flex-col gap-4 items-end pr-2">
            <Tooltip 
              content="This tooltip should appear on the left when near the right edge, with arrow pointing right"
              position="right"
            >
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Right Edge Button 1
              </button>
            </Tooltip>
            
            <ErrorTooltip 
              content="Error tooltip that should flip to left position with proper arrow alignment"
              position="right"
            >
              <button className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700">
                Right Edge Button 2
              </button>
            </ErrorTooltip>
          </div>
        </div>

        {/* Bottom edge test */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Bottom Edge Test (should flip to top)
          </h2>
          <div className="flex justify-center gap-4 pb-2">
            <Tooltip 
              content="This tooltip should appear above when near the bottom edge, with arrow pointing down"
              position="bottom"
            >
              <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                Bottom Edge Button 1
              </button>
            </Tooltip>
            
            <GlassTooltip 
              content="Glass tooltip that should flip to top position with proper arrow alignment"
              position="bottom"
            >
              <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                Bottom Edge Button 2
              </button>
            </GlassTooltip>
          </div>
        </div>

        {/* Corner tests */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Corner Tests (complex positioning)
          </h2>
          <div className="relative h-96 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            {/* Top-left corner */}
            <div className="absolute top-2 left-2">
              <Tooltip 
                content="Top-left corner tooltip - should find best position with proper arrow"
                position="top"
              >
                <button className="px-3 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700">
                  Top-Left
                </button>
              </Tooltip>
            </div>

            {/* Top-right corner */}
            <div className="absolute top-2 right-2">
              <Tooltip 
                content="Top-right corner tooltip - should find best position with proper arrow"
                position="top"
              >
                <button className="px-3 py-2 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700">
                  Top-Right
                </button>
              </Tooltip>
            </div>

            {/* Bottom-left corner */}
            <div className="absolute bottom-2 left-2">
              <Tooltip 
                content="Bottom-left corner tooltip - should find best position with proper arrow"
                position="bottom"
              >
                <button className="px-3 py-2 bg-pink-600 text-white rounded text-sm hover:bg-pink-700">
                  Bottom-Left
                </button>
              </Tooltip>
            </div>

            {/* Bottom-right corner */}
            <div className="absolute bottom-2 right-2">
              <Tooltip 
                content="Bottom-right corner tooltip - should find best position with proper arrow"
                position="bottom"
              >
                <button className="px-3 py-2 bg-teal-600 text-white rounded text-sm hover:bg-teal-700">
                  Bottom-Right
                </button>
              </Tooltip>
            </div>

            {/* Center */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Tooltip 
                content="Center tooltip - should maintain preferred position with proper arrow"
                position="top"
              >
                <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                  Center
                </button>
              </Tooltip>
            </div>
          </div>
        </div>

        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>Hover over buttons and observe arrow positioning when tooltips switch positions.</p>
          <p className="mt-2">The arrow should always point toward the trigger element regardless of tooltip position.</p>
        </div>
      </div>
    </div>
  );
};

export default TooltipArrowTest;
