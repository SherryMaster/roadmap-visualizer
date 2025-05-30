import { useState, useEffect } from "react";
import Tooltip from "./Tooltip";

/**
 * Tooltip Audit Component
 *
 * This component helps identify interactive elements that could benefit from tooltips.
 * It's designed for development use to ensure comprehensive tooltip coverage.
 */
const TooltipAudit = ({ enabled = false }) => {
  const [auditResults, setAuditResults] = useState([]);
  const [showAudit, setShowAudit] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const auditTooltips = () => {
      const results = [];

      // Selectors for elements that should have tooltips
      const selectors = [
        "button:not([data-tooltip-audited])",
        '[role="button"]:not([data-tooltip-audited])',
        'input[type="submit"]:not([data-tooltip-audited])',
        'input[type="button"]:not([data-tooltip-audited])',
        "[aria-label]:not([data-tooltip-audited])",
        ".cursor-pointer:not([data-tooltip-audited])",
        ".hover\\:bg-:not([data-tooltip-audited])", // Tailwind hover classes
        "svg:not([data-tooltip-audited])",
        '[tabindex="0"]:not([data-tooltip-audited])',
      ];

      selectors.forEach((selector) => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach((element, index) => {
            // Check if element already has tooltip
            const hasTooltip =
              element.closest("[data-tooltip]") ||
              element.hasAttribute("title") ||
              element.closest(".tooltip-trigger");

            if (!hasTooltip) {
              const rect = element.getBoundingClientRect();
              const isVisible = rect.width > 0 && rect.height > 0;

              if (isVisible) {
                results.push({
                  element,
                  selector,
                  text:
                    element.textContent?.trim() ||
                    element.getAttribute("aria-label") ||
                    "No text",
                  id: `${selector}-${index}`,
                  rect,
                });
              }
            }

            // Mark as audited to avoid duplicate checks
            element.setAttribute("data-tooltip-audited", "true");
          });
        } catch (error) {
          console.warn(`Tooltip audit error for selector ${selector}:`, error);
        }
      });

      setAuditResults(results);
    };

    // Run audit after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(auditTooltips, 1000);

    return () => {
      clearTimeout(timeoutId);
      // Clean up audit markers
      document.querySelectorAll("[data-tooltip-audited]").forEach((el) => {
        el.removeAttribute("data-tooltip-audited");
      });
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      {/* Audit Toggle Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Tooltip
          content="Toggle tooltip audit overlay to identify missing tooltips"
          position="left"
          maxWidth="250px"
        >
          <button
            onClick={() => setShowAudit(!showAudit)}
            className={`px-4 py-2 rounded-lg shadow-lg transition-colors ${
              showAudit
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {showAudit ? "Hide" : "Show"} Tooltip Audit ({auditResults.length})
          </button>
        </Tooltip>
      </div>

      {/* Audit Overlay */}
      {showAudit && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          {auditResults.map((result, index) => (
            <div
              key={result.id}
              className="absolute border-2 border-red-500 bg-red-500/20 pointer-events-auto"
              style={{
                left: result.rect.left + window.scrollX,
                top: result.rect.top + window.scrollY,
                width: result.rect.width,
                height: result.rect.height,
              }}
            >
              <Tooltip
                content={
                  <div className="space-y-2">
                    <div className="font-semibold text-red-200">
                      Missing Tooltip
                    </div>
                    <div>
                      <strong>Element:</strong> {result.selector}
                    </div>
                    <div>
                      <strong>Text:</strong> {result.text}
                    </div>
                    <div className="text-xs text-gray-300">
                      Consider adding a tooltip to improve user experience
                    </div>
                  </div>
                }
                position="top"
                maxWidth="300px"
              >
                <div className="w-full h-full flex items-center justify-center">
                  <span className="bg-red-600 text-white text-xs px-1 py-0.5 rounded">
                    {index + 1}
                  </span>
                </div>
              </Tooltip>
            </div>
          ))}
        </div>
      )}

      {/* Audit Summary Panel */}
      {showAudit && (
        <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 max-w-sm">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Tooltip Audit Results
          </h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Elements found:
              </span>
              <span className="font-medium">{auditResults.length}</span>
            </div>

            {auditResults.length > 0 && (
              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                <div className="text-yellow-800 dark:text-yellow-200 text-xs">
                  <strong>Recommendations:</strong>
                  <ul className="mt-1 space-y-1 list-disc list-inside">
                    <li>Add tooltips to icon-only buttons</li>
                    <li>Provide context for interactive elements</li>
                    <li>Explain complex UI controls</li>
                    <li>Add help text for form fields</li>
                  </ul>
                </div>
              </div>
            )}

            {auditResults.length === 0 && (
              <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                <div className="text-green-800 dark:text-green-200 text-xs">
                  ✅ Great! No missing tooltips detected on this page.
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowAudit(false)}
            className="mt-3 w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
          >
            Close Audit
          </button>
        </div>
      )}
    </>
  );
};

/**
 * Tooltip Coverage Report Component
 * Provides a summary of tooltip implementation across the application
 */
export const TooltipCoverageReport = () => {
  const [coverage, setCoverage] = useState({
    total: 0,
    withTooltips: 0,
    percentage: 0,
    categories: {},
  });

  useEffect(() => {
    const calculateCoverage = () => {
      // Interactive elements that should have tooltips
      const interactiveSelectors = [
        "button",
        '[role="button"]',
        'input[type="submit"]',
        'input[type="button"]',
        '[tabindex="0"]',
        ".cursor-pointer",
        "a[href]",
      ];

      let total = 0;
      let withTooltips = 0;
      const categories = {};

      interactiveSelectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        const categoryName = selector.replace(/[\[\]"=:]/g, "");

        categories[categoryName] = {
          total: elements.length,
          withTooltips: 0,
        };

        elements.forEach((element) => {
          total++;
          categories[categoryName].total++;

          const hasTooltip =
            element.closest("[data-tooltip]") ||
            element.hasAttribute("title") ||
            element.closest(".tooltip-trigger") ||
            element.getAttribute("aria-label");

          if (hasTooltip) {
            withTooltips++;
            categories[categoryName].withTooltips++;
          }
        });
      });

      setCoverage({
        total,
        withTooltips,
        percentage: total > 0 ? Math.round((withTooltips / total) * 100) : 0,
        categories,
      });
    };

    calculateCoverage();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Tooltip Coverage Report
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {coverage.percentage}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Coverage
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {coverage.withTooltips}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            With Tooltips
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {coverage.total}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Elements
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries(coverage.categories).map(([category, data]) => (
          <div key={category} className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
              {category.replace(/([A-Z])/g, " $1").trim()}
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {data.withTooltips}/{data.total}
              </span>
              <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{
                    width: `${
                      data.total > 0
                        ? (data.withTooltips / data.total) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TooltipAudit;
