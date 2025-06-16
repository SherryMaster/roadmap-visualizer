import { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "../../context/ThemeContext";

const CodeBlock = ({
  code,
  code_blocks,
  showLanguage = true,
  showComplexity = true,
  showExplanation = true,
  showLineNumbers = true,
  maxHeight = 400,
  collapsible = true,
}) => {
  const { darkMode } = useTheme();
  const [copiedStates, setCopiedStates] = useState({});
  const [expandedStates, setExpandedStates] = useState({});

  // Handle both old format (code string) and new format (code_blocks array)
  const codeData =
    code_blocks ||
    (code
      ? [{ code, language: "text", explanation: "", complexity: "basic" }]
      : []);

  if (!codeData || codeData.length === 0) {
    return null;
  }

  // Process the code to handle escaped newlines and preserve formatting
  const processCode = (rawCode) => {
    if (!rawCode || rawCode.trim() === "") return "";

    // Replace escaped newlines with actual newlines
    let processed = rawCode.replace(/\\n/g, "\n");

    // Remove common leading whitespace to preserve indentation but avoid excessive space
    const lines = processed.split("\n");
    const nonEmptyLines = lines.filter((line) => line.trim() !== "");

    if (nonEmptyLines.length === 0) return "";

    // Find minimum leading whitespace
    const leadingSpaces = nonEmptyLines.map((line) => {
      const match = line.match(/^\s*/);
      return match ? match[0].length : 0;
    });

    const minLeadingSpace = Math.min(...leadingSpaces);

    // Remove common leading whitespace
    if (minLeadingSpace > 0) {
      processed = lines
        .map((line) => {
          return line.slice(
            Math.min(minLeadingSpace, line.match(/^\s*/)[0].length)
          );
        })
        .join("\n");
    }

    return processed;
  };

  // Language mapping for syntax highlighter
  const getLanguageForHighlighter = (language) => {
    if (!language) return "text";

    const langMap = {
      gdscript: "python", // GDScript is similar to Python
      javascript: "javascript",
      js: "javascript",
      python: "python",
      py: "python",
      html: "html",
      css: "css",
      json: "json",
      bash: "bash",
      shell: "bash",
      sql: "sql",
      c: "c",
      cpp: "cpp",
      "c++": "cpp",
      java: "java",
      csharp: "csharp",
      "c#": "csharp",
      php: "php",
      ruby: "ruby",
      go: "go",
      rust: "rust",
      swift: "swift",
      kotlin: "kotlin",
      typescript: "typescript",
      ts: "typescript",
      yaml: "yaml",
      yml: "yaml",
      xml: "xml",
      markdown: "markdown",
      md: "markdown",
    };

    return langMap[language.toLowerCase()] || "text";
  };

  // Copy to clipboard functionality
  const copyToClipboard = async (text, blockIndex) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates((prev) => ({ ...prev, [blockIndex]: true }));

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [blockIndex]: false }));
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        setCopiedStates((prev) => ({ ...prev, [blockIndex]: true }));
        setTimeout(() => {
          setCopiedStates((prev) => ({ ...prev, [blockIndex]: false }));
        }, 2000);
      } catch (fallbackErr) {
        console.error("Fallback copy failed: ", fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+C or Cmd+C when focused on code block
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.closest(".code-block-container")) {
          const blockIndex = activeElement.getAttribute("data-block-index");
          if (blockIndex !== null) {
            const block = codeData[parseInt(blockIndex)];
            if (block) {
              e.preventDefault();
              copyToClipboard(processCode(block.code), parseInt(blockIndex));
            }
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [codeData]);

  // Toggle expand/collapse for long code blocks
  const toggleExpanded = (blockIndex) => {
    setExpandedStates((prev) => ({
      ...prev,
      [blockIndex]: !prev[blockIndex],
    }));
  };

  // Check if code block should be collapsible
  const shouldBeCollapsible = (code) => {
    if (!collapsible) return false;
    const lines = code.split("\n");
    return lines.length > 15; // Collapse if more than 15 lines
  };

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case "basic":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="space-y-4">
      {codeData.map((block, index) => {
        const formattedCode = processCode(block.code);
        const isCollapsible = shouldBeCollapsible(formattedCode);
        const isExpanded = expandedStates[index] || false;
        const isCopied = copiedStates[index] || false;
        const language = getLanguageForHighlighter(block.language);

        // Truncate code for collapsed view
        const displayCode =
          isCollapsible && !isExpanded
            ? formattedCode.split("\n").slice(0, 10).join("\n") + "\n..."
            : formattedCode;

        return (
          <div
            key={index}
            className="code-block-container border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
            data-block-index={index}
            tabIndex={0}
            role="region"
            aria-label={`Code block ${index + 1}${
              block.language ? ` in ${block.language}` : ""
            }`}
          >
            {/* Header with language, complexity, and controls */}
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                {showLanguage && block.language && (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {block.language}
                    </span>
                  </div>
                )}

                {showComplexity && block.complexity && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${getComplexityColor(
                      block.complexity
                    )}`}
                  >
                    {block.complexity}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {/* Expand/Collapse button */}
                {isCollapsible && (
                  <button
                    onClick={() => toggleExpanded(index)}
                    className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-150"
                    aria-label={isExpanded ? "Collapse code" : "Expand code"}
                    title={isExpanded ? "Collapse code" : "Expand code"}
                  >
                    <svg
                      className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                )}

                {/* Copy button */}
                <button
                  onClick={() => copyToClipboard(formattedCode, index)}
                  className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-150 relative"
                  aria-label="Copy code to clipboard"
                  title="Copy code (Ctrl+C)"
                >
                  {isCopied ? (
                    <svg
                      className="w-4 h-4 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-gray-600 dark:text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}

                  {/* Copy feedback */}
                  {isCopied && (
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 text-xs px-2 py-1 rounded whitespace-nowrap animate-fade-in">
                      Copied!
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Code content with syntax highlighting */}
            <div className="relative">
              <SyntaxHighlighter
                language={language}
                style={darkMode ? oneDark : oneLight}
                showLineNumbers={showLineNumbers}
                customStyle={{
                  margin: 0,
                  borderRadius: 0,
                  fontSize: "0.875rem",
                  maxHeight:
                    isCollapsible && !isExpanded ? "300px" : `${maxHeight}px`,
                  overflow: "auto",
                }}
                codeTagProps={{
                  style: {
                    fontFamily:
                      'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                  },
                }}
                lineNumberStyle={{
                  minWidth: "3em",
                  paddingRight: "1em",
                  color: darkMode ? "#6b7280" : "#9ca3af",
                  borderRight: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
                  marginRight: "1em",
                }}
              >
                {displayCode}
              </SyntaxHighlighter>
            </div>

            {/* Explanation */}
            {showExplanation && block.explanation && (
              <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>💡 Explanation:</strong> {block.explanation}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CodeBlock;
