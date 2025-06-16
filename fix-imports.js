const fs = require('fs');
const path = require('path');

// Define the mapping of old import patterns to new ones
const importMappings = {
  // Tooltip imports
  'import Tooltip from "./Tooltip"': 'import Tooltip from "../tooltips/Tooltip"',
  'import { InfoTooltip, SuccessTooltip } from "./EnhancedTooltip"': 'import { InfoTooltip, SuccessTooltip } from "../tooltips/EnhancedTooltip"',
  'import { SuccessTooltip } from "./EnhancedTooltip"': 'import { SuccessTooltip } from "../tooltips/EnhancedTooltip"',
  
  // Task imports
  'import TaskDetail from "./TaskDetail"': 'import TaskDetail from "./TaskDetail"',
  'import TaskList from "./TaskList"': 'import TaskList from "../task/TaskList"',
  
  // Context imports
  'import { useTaskCompletion } from "../context/TaskCompletionContext"': 'import { useTaskCompletion } from "../../context/TaskCompletionContext"',
  'import { useEditor } from "../context/EditorContext"': 'import { useEditor } from "../../context/EditorContext"',
  
  // Utils imports
  'import configManager from "../utils/ConfigManager"': 'import configManager from "../../utils/ConfigManager"',
  
  // Component imports from wrong relative paths
  'import DragDropTaskList from "./DragDropTaskList"': 'import DragDropTaskList from "../forms/DragDropTaskList"',
  'import VirtualTaskList from "./VirtualTaskList"': 'import VirtualTaskList from "../modals/VirtualTaskList"',
  'import BatchOperations from "./BatchOperations"': 'import BatchOperations from "../forms/BatchOperations"',
  'import QuickTaskForm from "./QuickTaskForm"': 'import QuickTaskForm from "../forms/QuickTaskForm"',
  'import TaskCreationDropdown from "./TaskCreationDropdown"': 'import TaskCreationDropdown from "../forms/TaskCreationDropdown"',
  'import { Toast, FadeIn, SlideIn } from "./VisualFeedback"': 'import { Toast, FadeIn, SlideIn } from "../ui/VisualFeedback"',
  'import { HelpIcon, InfoPanel } from "./ContextualHelp"': 'import { HelpIcon, InfoPanel } from "../feedback/ContextualHelp"',
};

// Function to recursively find all .jsx files
function findJsxFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      results = results.concat(findJsxFiles(filePath));
    } else if (file.endsWith('.jsx')) {
      results.push(filePath);
    }
  });
  
  return results;
}

// Function to fix imports in a file
function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  Object.entries(importMappings).forEach(([oldImport, newImport]) => {
    if (content.includes(oldImport)) {
      content = content.replace(new RegExp(oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newImport);
      modified = true;
      console.log(`Fixed import in ${filePath}: ${oldImport} -> ${newImport}`);
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
  
  return modified;
}

// Main execution
const componentsDir = './src/components';
const jsxFiles = findJsxFiles(componentsDir);

console.log(`Found ${jsxFiles.length} JSX files to check...`);

let totalFixed = 0;
jsxFiles.forEach(file => {
  if (fixImportsInFile(file)) {
    totalFixed++;
  }
});

console.log(`Fixed imports in ${totalFixed} files.`);
