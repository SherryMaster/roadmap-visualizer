import { useState, useEffect } from "react";
import EnhancedPhase from "./EnhancedPhase";
import ProgressIndicator from "../ui/ProgressIndicator";

const EnhancedPhaseList = ({ 
  phases, 
  roadmapData,
  progressiveLoader,
  onRetryLoad
}) => {
  const [expandedPhases, setExpandedPhases] = useState(new Set());

  // Auto-expand first phase on initial load
  useEffect(() => {
    if (phases.length > 0 && expandedPhases.size === 0) {
      setExpandedPhases(new Set([phases[0].phase_number]));
    }
  }, [phases, expandedPhases.size]);

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

  // Sort phases by phase_number
  const sortedPhases = [...phases].sort((a, b) => {
    const aNum = parseInt(a.phase_number) || 0;
    const bNum = parseInt(b.phase_number) || 0;
    return aNum - bNum;
  });

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

          const isExpanded = expandedPhases.has(phase.phase_number);
          const isLoading = progressiveLoader?.isItemLoading(phase.phase_id) || phase._isLoading;
          const isLoaded = progressiveLoader?.isItemLoaded(phase.phase_id) || 
                          (phase.phase_tasks && phase.phase_tasks.length > 0);
          const hasError = progressiveLoader?.hasItemError(phase.phase_id);
          const error = progressiveLoader?.getItemError(phase.phase_id);

          return (
            <EnhancedPhase
              key={uniqueKey}
              phase={phase}
              isExpanded={isExpanded}
              isActive={isExpanded}
              onClick={() => handlePhaseClick(phase.phase_number)}
              isLoading={isLoading}
              isLoaded={isLoaded}
              hasError={hasError}
              error={error}
              onRetryLoad={onRetryLoad}
              expectedTaskCount={phase._taskCount || phase.task_count || 0}
            />
          );
        })}
      </div>
    </div>
  );
};

export default EnhancedPhaseList;
