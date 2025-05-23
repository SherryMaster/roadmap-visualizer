const CodeBlock = ({
  code,
  code_blocks,
  showLanguage = true,
  showComplexity = true,
  showExplanation = true,
}) => {
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

        return (
          <div
            key={index}
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
          >
            {/* Header with language and complexity */}
            {(showLanguage || showComplexity) &&
              (block.language || block.complexity) && (
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  {showLanguage && block.language && (
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {block.language}
                    </span>
                  )}

                  {showComplexity && block.complexity && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getComplexityColor(
                        block.complexity
                      )}`}
                    >
                      {block.complexity}
                    </span>
                  )}
                </div>
              )}

            {/* Code content */}
            <div className="relative">
              <pre className="bg-gray-800 text-gray-200 p-4 overflow-x-auto text-sm font-mono">
                <code>{formattedCode}</code>
              </pre>
            </div>

            {/* Explanation */}
            {showExplanation && block.explanation && (
              <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Explanation:</strong> {block.explanation}
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
