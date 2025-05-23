import { useState } from "react";
import Task from "./Task";

const TaskList = ({ tasks, phaseNumber }) => {
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(null);

  const handleTaskClick = (index) => {
    setSelectedTaskIndex(selectedTaskIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {tasks.map((task, index) => (
        <Task
          key={index}
          task={task}
          isExpanded={selectedTaskIndex === index}
          onClick={() => handleTaskClick(index)}
          phaseNumber={phaseNumber}
          taskIndex={index}
        />
      ))}
    </div>
  );
};

export default TaskList;
