/**
 * Component to verify all task content is displaying correctly
 */
import { useEffect, useState } from 'react';

const TaskContentVerifier = () => {
  const [verificationResults, setVerificationResults] = useState([]);

  useEffect(() => {
    if (window.roadmapData) {
      const results = [];
      
      window.roadmapData.roadmap.forEach((phase, phaseIndex) => {
        phase.phase_tasks.forEach((task, taskIndex) => {
          const taskResult = {
            phaseTitle: phase.phase_title,
            taskTitle: task.task_title,
            taskId: task.task_id,
            hasContent: {
              dependencies: task.task_dependencies && task.task_dependencies.length > 0,
              tags: task.task_tags && task.task_tags.length > 0,
              priority: !!task.task_priority,
              detail: !!task.task_detail,
              explanation: !!(task.task_detail?.detail || task.task_detail?.explanation),
              difficulty: !!task.task_detail?.difficulty,
              estTime: !!task.task_detail?.est_time,
              resourceLinks: task.task_detail?.resource_links && task.task_detail.resource_links.length > 0,
              codeBlocks: task.task_detail?.code_blocks && task.task_detail.code_blocks.length > 0,
              legacyCode: !!task.task_detail?.code
            }
          };
          
          // Count how many content types this task has
          const contentCount = Object.values(taskResult.hasContent).filter(Boolean).length;
          taskResult.contentCount = contentCount;
          
          if (contentCount > 3) { // Only show tasks with substantial content
            results.push(taskResult);
          }
        });
      });
      
      setVerificationResults(results);
    }
  }, []);

  const getContentIcon = (hasContent) => hasContent ? '✅' : '❌';

  return (
    <div className="p-4 bg-green-50 border border-green-300 rounded mb-4">
      <h3 className="font-bold text-lg mb-3">Task Content Verification</h3>
      
      <div className="mb-4">
        <p><strong>Tasks with substantial content:</strong> {verificationResults.length}</p>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {verificationResults.slice(0, 5).map((task, index) => (
          <div key={index} className="bg-white p-3 rounded border">
            <div className="font-medium text-green-800 mb-2">
              {task.taskTitle} ({task.taskId})
            </div>
            <div className="text-sm text-gray-600 mb-2">
              Phase: {task.phaseTitle}
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                {getContentIcon(task.hasContent.dependencies)} Dependencies
              </div>
              <div>
                {getContentIcon(task.hasContent.tags)} Tags
              </div>
              <div>
                {getContentIcon(task.hasContent.priority)} Priority
              </div>
              <div>
                {getContentIcon(task.hasContent.explanation)} Explanation
              </div>
              <div>
                {getContentIcon(task.hasContent.difficulty)} Difficulty
              </div>
              <div>
                {getContentIcon(task.hasContent.estTime)} Est. Time
              </div>
              <div>
                {getContentIcon(task.hasContent.resourceLinks)} Resources
              </div>
              <div>
                {getContentIcon(task.hasContent.codeBlocks || task.hasContent.legacyCode)} Code
              </div>
            </div>
            
            <div className="text-xs text-gray-500 mt-2">
              Content types: {task.contentCount}/8
            </div>
          </div>
        ))}
        
        {verificationResults.length > 5 && (
          <div className="text-sm text-gray-600 text-center">
            ... and {verificationResults.length - 5} more tasks with content
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-gray-100 rounded">
        <h4 className="font-semibold mb-2">Content Summary:</h4>
        <div className="text-sm space-y-1">
          <div>Tasks with dependencies: {verificationResults.filter(t => t.hasContent.dependencies).length}</div>
          <div>Tasks with tags: {verificationResults.filter(t => t.hasContent.tags).length}</div>
          <div>Tasks with difficulty: {verificationResults.filter(t => t.hasContent.difficulty).length}</div>
          <div>Tasks with time estimates: {verificationResults.filter(t => t.hasContent.estTime).length}</div>
          <div>Tasks with resources: {verificationResults.filter(t => t.hasContent.resourceLinks).length}</div>
          <div>Tasks with code: {verificationResults.filter(t => t.hasContent.codeBlocks || t.hasContent.legacyCode).length}</div>
        </div>
      </div>
    </div>
  );
};

export default TaskContentVerifier;
