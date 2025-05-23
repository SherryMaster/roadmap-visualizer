import { useState } from "react";
import Phase from "./Phase";
import ProgressIndicator from "./ProgressIndicator";

const PhaseList = ({ phases }) => {
  const [expandedPhase, setExpandedPhase] = useState(null);

  // Sort phases by phase_number
  const sortedPhases = [...phases].sort(
    (a, b) => a.phase_number - b.phase_number
  );

  const handlePhaseClick = (phaseNumber) => {
    setExpandedPhase(expandedPhase === phaseNumber ? null : phaseNumber);
  };

  return (
    <div>
      <ProgressIndicator phases={phases} />

      <div className="space-y-6">
        {sortedPhases.map((phase) => (
          <Phase
            key={phase.phase_number}
            phase={phase}
            isExpanded={expandedPhase === phase.phase_number}
            isActive={expandedPhase === phase.phase_number}
            onClick={() => handlePhaseClick(phase.phase_number)}
          />
        ))}
      </div>
    </div>
  );
};

export default PhaseList;
