import { useState, useEffect } from "react";
import Phase from "./Phase";
import ProgressIndicator from "../ui/ProgressIndicator";

const PhaseList = ({ phases }) => {
  const [expandedPhases, setExpandedPhases] = useState(new Set());

  // Sort phases by phase_number and ensure unique keys
  const sortedPhases = [...phases].sort(
    (a, b) => a.phase_number - b.phase_number
  );

  const handlePhaseClick = (phaseNumber) => {
    setExpandedPhases((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(phaseNumber)) {
        newSet.delete(phaseNumber);
      } else {
        newSet.add(phaseNumber);
      }
      return newSet;
    });
  };

  // Function to expand a specific phase (for dependency navigation)
  const expandPhase = (phaseNumber) => {
    setExpandedPhases((prev) => new Set(prev).add(phaseNumber));
  };

  // Listen for navigation events that require phase expansion
  useEffect(() => {
    const handleNavigateToTask = (event) => {
      const { phaseId, taskId } = event.detail;

      // Find the phase number from phase_id
      const targetPhase = sortedPhases.find(
        (phase) => phase.phase_id === phaseId
      );

      if (targetPhase) {
        const wasExpanded = expandedPhases.has(targetPhase.phase_number);

        if (!wasExpanded) {
          expandPhase(targetPhase.phase_number);

          // Emit a phase expansion event to notify Phase components
          setTimeout(() => {
            const phaseExpandedEvent = new CustomEvent("phaseExpanded", {
              detail: {
                phaseId,
                taskId,
                phaseNumber: targetPhase.phase_number,
              },
              bubbles: true,
            });
            document.dispatchEvent(phaseExpandedEvent);
          }, 100);
        } else {
          // Phase already expanded, immediately notify Phase components
          const phaseExpandedEvent = new CustomEvent("phaseExpanded", {
            detail: { phaseId, taskId, phaseNumber: targetPhase.phase_number },
            bubbles: true,
          });
          document.dispatchEvent(phaseExpandedEvent);
        }
      }
    };

    document.addEventListener("navigateToTask", handleNavigateToTask);
    return () => {
      document.removeEventListener("navigateToTask", handleNavigateToTask);
    };
  }, [sortedPhases, expandedPhases]);

  return (
    <div>
      <ProgressIndicator phases={phases} />

      <div className="space-y-6">
        {sortedPhases.map((phase, index) => {
          // Create a robust unique key using multiple identifiers
          const uniqueKey =
            phase.phase_id ||
            `phase-${phase.phase_number}` ||
            `phase-index-${index}`;

          return (
            <Phase
              key={uniqueKey}
              phase={phase}
              isExpanded={expandedPhases.has(phase.phase_number)}
              isActive={expandedPhases.has(phase.phase_number)}
              onClick={() => handlePhaseClick(phase.phase_number)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default PhaseList;
