import { useState } from "react";
import ReactMarkdown from "react-markdown";
import DOMPurify from "dompurify";
import { useTheme } from "../context/ThemeContext";

/**
 * ContentRenderer Component
 * Renders content based on format (markdown, html, plaintext)
 * with proper sanitization and styling
 */
const ContentRenderer = ({
  content,
  format = "plaintext",
  showFormatIndicator = true,
  className = "",
  maxHeight = null,
  collapsible = false,
}) => {
  const { darkMode } = useTheme();
  const [isExpanded, setIsExpanded] = useState(!collapsible);

  // Handle empty or invalid content
  if (!content || typeof content !== "string" || content.trim() === "") {
    return null;
  }

  // Determine if content should be collapsible
  const shouldBeCollapsible = collapsible && content.length > 500;
  const displayContent =
    shouldBeCollapsible && !isExpanded
      ? content.substring(0, 500) + "..."
      : content;

  // Format indicator configuration
  const formatConfig = {
    markdown: {
      label: "Markdown",
      icon: "📝",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    },
    html: {
      label: "HTML",
      icon: "🌐",
      color:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    },
    plaintext: {
      label: "Text",
      icon: "📄",
      color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    },
  };

  const currentFormat = formatConfig[format] || formatConfig.plaintext;

  // Render content based on format
  const renderContent = () => {
    switch (format) {
      case "markdown":
        return (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              skipHtml={false}
              components={{
                // Custom components for better styling
                h1: ({ children }) => (
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-3 space-y-1">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 mb-3 space-y-1">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-gray-700 dark:text-gray-300">
                    {children}
                  </li>
                ),
                code: ({ children, className, node, ...props }) => {
                  // More reliable way to detect inline vs block code
                  // Block code usually has a parent that's a pre element or has a language class
                  const parent = node?.parent;
                  const isBlock =
                    parent?.tagName === "pre" ||
                    className?.startsWith("language-");

                  if (isBlock) {
                    return (
                      <code
                        className={`block bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono text-gray-900 dark:text-gray-100 overflow-x-auto whitespace-pre ${
                          className || ""
                        }`}
                      >
                        {children}
                      </code>
                    );
                  } else {
                    // Inline code
                    return (
                      <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono text-gray-900 dark:text-gray-100 inline">
                        {children}
                      </code>
                    );
                  }
                },
                pre: ({ children, ...props }) => {
                  // For block code wrapped in pre
                  return (
                    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono text-gray-900 dark:text-gray-100 overflow-x-auto whitespace-pre mb-3">
                      {children}
                    </pre>
                  );
                },
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-400 mb-3">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {displayContent}
            </ReactMarkdown>
          </div>
        );

      case "html":
        return (
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(displayContent, {
                ALLOWED_TAGS: [
                  "p",
                  "br",
                  "strong",
                  "em",
                  "u",
                  "h1",
                  "h2",
                  "h3",
                  "h4",
                  "h5",
                  "h6",
                  "ul",
                  "ol",
                  "li",
                  "a",
                  "code",
                  "pre",
                  "blockquote",
                  "div",
                  "span",
                ],
                ALLOWED_ATTR: ["href", "target", "rel", "class"],
                ALLOW_DATA_ATTR: false,
              }),
            }}
          />
        );

      case "plaintext":
      default:
        // Split content into paragraphs and render with proper spacing
        const paragraphs = displayContent
          .split("\n")
          .filter((p) => p.trim() !== "");

        return (
          <div className="space-y-3">
            {paragraphs.map((paragraph, index) => (
              <p
                key={`paragraph-${index}-${paragraph.slice(0, 20)}`}
                className="text-gray-700 dark:text-gray-300 leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
          </div>
        );
    }
  };

  return (
    <div className={`content-renderer ${className}`}>
      {/* Format indicator */}
      {showFormatIndicator && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${currentFormat.color}`}
            >
              <span className="mr-1">{currentFormat.icon}</span>
              {currentFormat.label}
            </span>
          </div>

          {/* Expand/Collapse button */}
          {shouldBeCollapsible && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200"
              aria-label={isExpanded ? "Collapse content" : "Expand content"}
            >
              {isExpanded ? "Show Less" : "Show More"}
            </button>
          )}
        </div>
      )}

      {/* Content container with relative positioning for the fade overlay */}
      <div className="relative">
        <div
          className={`content-container ${
            maxHeight && !isExpanded
              ? `max-h-[${maxHeight}px] overflow-hidden`
              : ""
          }`}
          style={
            maxHeight && !isExpanded
              ? { maxHeight: `${maxHeight}px`, overflow: "hidden" }
              : {}
          }
        >
          {renderContent()}
        </div>

        {/* Fade overlay for collapsed content - now properly contained */}
        {maxHeight && !isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pointer-events-none" />
        )}
      </div>
    </div>
  );
};

export default ContentRenderer;
