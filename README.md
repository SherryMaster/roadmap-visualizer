# 🗺️ Roadmap Visualizer

A modern, interactive web application for creating, visualizing, and tracking learning roadmaps with comprehensive progress management and dependency navigation.

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Getting Started](#-getting-started)
- [Core Features Documentation](#-core-features-documentation)
- [Technical Architecture](#-technical-architecture)
- [File Structure](#-file-structure)
- [Usage Examples](#-usage-examples)
- [Development Guidelines](#-development-guidelines)
- [Troubleshooting](#-troubleshooting)

## 🎯 Project Overview

The **Roadmap Visualizer** is a comprehensive React-based application designed to help users create, visualize, and track learning roadmaps. It provides an intuitive interface for managing complex learning paths with task dependencies, progress tracking, and interactive navigation.

### What it does:

- **Displays interactive learning roadmaps** with expandable phases and tasks
- **Tracks completion progress** with persistent state management
- **Visualizes task dependencies** with smart navigation
- **Assembles roadmaps** from modular JSON files with schema validation
- **Provides search and filtering** capabilities across roadmap content
- **Supports multiple themes** (Light/Dark/System) with localStorage persistence

## ✨ Key Features

### 🔍 **Roadmap Visualization**

- Interactive phase and task display with expand/collapse functionality
- Visual progress indicators and completion tracking
- Dependency visualization with cross-phase navigation
- Smart highlighting and focus management

### 📊 **Progress Tracking**

- Persistent task completion state across browser sessions
- Real-time progress calculations and visual feedback
- Phase-level and overall roadmap progress indicators
- Completion statistics and analytics

### 🔧 **Roadmap Assembly**

- Upload and merge skeleton + task JSON files
- Comprehensive schema validation with detailed error reporting
- Save & View workflow for seamless roadmap creation
- Schema download functionality for reference

### 🎨 **User Experience**

- Responsive design with Tailwind CSS 4.1
- Dark/Light/System theme support
- Advanced search and filtering capabilities
- Keyboard navigation and accessibility compliance

### 📋 **Schema System**

- Modular schema architecture for flexible roadmap creation
- Strict validation with cross-file contamination prevention
- Downloadable schema references for developers

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **Package Manager**: npm, yarn, or pnpm
- **Modern Browser**: Chrome, Firefox, Safari, or Edge

### Installation

1. **Clone the repository:**

```bash
git clone <repository-url>
cd roadmap-visualizer
```

2. **Install dependencies:**

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Start the development server:**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

### Build and Deployment

**Build for production:**

```bash
npm run build
# or
yarn build
# or
pnpm build
```

**Preview production build:**

```bash
npm run preview
# or
yarn preview
# or
pnpm preview
```

**Lint code:**

```bash
npm run lint
# or
yarn lint
# or
pnpm lint
```

## 📚 Core Features Documentation

### 🗺️ Roadmap Visualizer

The main visualization component provides:

- **Interactive Phase Display**: Expandable phases with task lists
- **Progress Tracking**: Visual indicators for completion status
- **Dependency Navigation**: Click dependencies to navigate to related tasks
- **Search & Filter**: Real-time content filtering
- **Multi-expansion**: Multiple phases and tasks can be expanded simultaneously

**Key Components:**

- `RoadmapVisualizer.jsx` - Main container component
- `PhaseList.jsx` - Renders phase collection
- `Phase.jsx` - Individual phase component
- `TaskList.jsx` - Task collection within phases
- `Task.jsx` - Individual task component

### 🔧 Roadmap Assembler

Upload and merge JSON files to create complete roadmaps:

**Workflow:**

1. **Upload Skeleton File** - Contains roadmap structure and phases
2. **Upload Task Files** - Contains detailed task information
3. **Validation** - Strict schema validation with error reporting
4. **Merge** - Combines files into complete roadmap
5. **Save & View** - Saves to localStorage and opens in visualizer

**Key Features:**

- Schema validation with detailed error messages
- Cross-file contamination prevention
- Retry functionality with smart restart points
- Schema download for reference

### 📋 Schema System

**Modular Architecture:**

- `roadmap_skeleton_schema.json` - Defines roadmap structure
- `skeleton_tasks_schema.json` - Defines task file format
- `schema.json` - Complete roadmap schema for validation

**Schema Features:**

- OpenAPI 3.0.3 compliant
- AI-optimized for structured output generation
- Comprehensive validation rules
- Extensible design for future enhancements

### 🎨 Theme System

**Three-option theme control:**

- **Light Mode** - Clean, bright interface
- **Dark Mode** - Easy on the eyes for extended use
- **System Mode** - Follows OS preference with manual override

**Implementation:**

- Tailwind CSS 4.1 with proper dark mode classes
- localStorage persistence across sessions
- Context-based state management
- Smooth transitions between themes

### 📊 Progress Tracking

**Features:**

- Task completion state management
- Phase-level progress calculation
- Overall roadmap progress indicators
- Persistent storage across browser sessions

**Implementation:**

- Context API for global state management
- localStorage for persistence
- Real-time progress calculations
- Visual feedback with progress bars

## 🏗️ Technical Architecture

### Core Technologies

- **React 18** - Modern React with concurrent features
- **React Router 7.6** - Declarative routing with nested routes
- **Tailwind CSS 4.1** - Utility-first CSS with dark mode
- **Vite 6.3** - Fast development and building
- **Context API** - State management for themes and progress

### Component Architecture

**Hierarchical Structure:**

```
App
├── Router (AppRouter.jsx)
├── Theme Context (ThemeContext.jsx)
├── Task Completion Context (TaskCompletionContext.jsx)
└── Pages
    ├── HomePage
    ├── RoadmapVisualizer
    ├── RoadmapAssembler
    └── NotFoundPage
```

**Design Patterns:**

- **Component Composition** - Reusable, focused components
- **Context for Global State** - Theme and progress management
- **Custom Hooks** - Shared logic extraction
- **Utility Classes** - Consistent styling patterns

### State Management

**Context API Usage:**

- `ThemeContext` - Theme selection and persistence
- `TaskCompletionContext` - Progress tracking and task state

**Local State:**

- Component-specific UI state
- Form handling and validation
- Temporary display states

### Data Flow

1. **Roadmap Loading** - From localStorage or sample data
2. **Schema Validation** - Multi-schema validation system
3. **Component Rendering** - Hierarchical component tree
4. **User Interactions** - Event handling and state updates
5. **Persistence** - localStorage for progress and preferences

## 📁 File Structure

```
roadmap-visualizer/
├── public/                     # Static assets
├── src/
│   ├── components/            # React components
│   │   ├── HomePage.jsx       # Landing page
│   │   ├── RoadmapVisualizer.jsx  # Main visualizer
│   │   ├── RoadmapAssembler.jsx   # File assembly tool
│   │   ├── Phase.jsx          # Phase display component
│   │   ├── Task.jsx           # Task display component
│   │   └── ...               # Other UI components
│   ├── context/              # React Context providers
│   │   ├── ThemeContext.jsx   # Theme management
│   │   └── TaskCompletionContext.jsx  # Progress tracking
│   ├── data/                 # Schema and sample data
│   │   ├── roadmap_skeleton_schema.json
│   │   ├── skeleton_tasks_schema.json
│   │   ├── schema.json
│   │   └── game_project_roadmaps/  # Sample roadmaps
│   ├── hooks/                # Custom React hooks
│   ├── router/               # Routing configuration
│   ├── utils/                # Utility functions
│   │   ├── RoadmapPersistence.js   # localStorage management
│   │   ├── MultiSchemaValidator.js # Schema validation
│   │   ├── RoadmapMerger.js       # File merging logic
│   │   └── ...               # Other utilities
│   ├── index.css            # Global styles and Tailwind
│   └── main.jsx             # Application entry point
├── package.json             # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── README.md               # This file
```

### Key Configuration Files

- **`vite.config.js`** - Vite build configuration
- **`tailwind.config.js`** - Tailwind CSS customization
- **`package.json`** - Dependencies and npm scripts
- **`eslint.config.js`** - Code linting rules

### Schema Files

- **`roadmap_skeleton_schema.json`** - Roadmap structure validation
- **`skeleton_tasks_schema.json`** - Task file validation
- **`schema.json`** - Complete roadmap validation

## 💡 Usage Examples

### Loading Existing Roadmaps

1. **Navigate to Home Page** (`/`)
2. **Select from Recent Roadmaps** or use the default sample
3. **Click "View Roadmap"** to open in visualizer
4. **Explore phases and tasks** by expanding sections

### Creating New Roadmaps

1. **Navigate to Assembler** (`/assembler`)
2. **Download schema files** for reference (optional)
3. **Upload skeleton file** - Contains roadmap structure
4. **Upload task files** - Contains detailed task information
5. **Review merged roadmap** in results section
6. **Click "Save & View"** to save and open in visualizer

### Using Schema Files

**Download schemas from assembler:**

```javascript
// Example skeleton file structure
{
  "roadmap_title": "My Learning Path",
  "project_title": "Project Name",
  "num_of_phases": 3,
  "phases": [
    {
      "phase_title": "Phase 1: Foundation",
      "phase_id": "P1_Foundation",
      "order_id": 1,
      "num_of_tasks": 5,
      "phase_detail": "Learn the basics..."
    }
  ]
}
```

**Task file structure:**

```javascript
{
  "tasks": [
    {
      "phase_id": "P1_Foundation",
      "task_id": "P1T1",
      "task_title": "Setup Environment",
      "task_difficulty": "easy",
      "est_time": {
        "min_time": {"amount": 1, "unit": "hours"},
        "max_time": {"amount": 2, "unit": "hours"}
      },
      "task_detail": ["Step by step instructions..."],
      "resource_links": [
        {
          "display_text": "Official Documentation",
          "link": "https://example.com"
        }
      ]
    }
  ]
}
```

### Progress Tracking

1. **Click task checkboxes** to mark completion
2. **View progress bars** at phase and roadmap level
3. **Progress persists** across browser sessions
4. **Navigate via dependencies** to see related tasks

### Theme Management

1. **Click theme selector** in top navigation
2. **Choose Light/Dark/System** preference
3. **Setting persists** across sessions
4. **System mode** follows OS preference

## 🛠️ Development Guidelines

### Code Organization

**Component Structure:**

- One component per file
- Clear, descriptive naming
- Props documentation with PropTypes or TypeScript
- Consistent export patterns

**Styling Approach:**

- Tailwind CSS utility classes
- Dark mode variants for all components
- Responsive design patterns
- Consistent spacing and typography

**State Management:**

- Context for global state (theme, progress)
- Local state for component-specific data
- Custom hooks for shared logic
- Immutable state updates

### Schema Validation

**Validation Strategy:**

- Multi-schema validation system
- Strict cross-file contamination prevention
- Detailed error reporting
- Graceful error handling

**Schema Design:**

- OpenAPI 3.0.3 compliance
- AI-optimized structure
- Extensible patterns
- Clear documentation

### Testing Recommendations

**Unit Testing:**

- Component rendering tests
- Utility function tests
- Schema validation tests
- Context provider tests

**Integration Testing:**

- User workflow tests
- File upload and validation
- Navigation and routing
- Progress persistence

**E2E Testing:**

- Complete user journeys
- Cross-browser compatibility
- Accessibility compliance
- Performance benchmarks

## 🔧 Troubleshooting

### Common Issues

**Schema Validation Errors:**

```
Error: "This appears to be a task file, not a skeleton file"
Solution: Ensure you're uploading the correct file type to the correct upload zone
```

**File Upload Problems:**

```
Error: "JSON parsing failed"
Solution: Validate your JSON syntax using a JSON validator
```

**Navigation Issues:**

```
Error: "Page not found" after Save & View
Solution: Check browser console for errors, ensure roadmap was saved correctly
```

**Progress Not Saving:**

```
Issue: Task completion not persisting
Solution: Check if localStorage is enabled in your browser
```

**Theme Not Applying:**

```
Issue: Dark mode not working
Solution: Clear localStorage and refresh, check for CSS conflicts
```

### Development Issues

**Hot Reload Problems:**

```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

**Build Failures:**

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Linting Errors:**

```bash
# Fix auto-fixable issues
npm run lint -- --fix
```

### Performance Issues

**Large Roadmaps:**

- Use virtualization for very large task lists
- Implement lazy loading for task details
- Consider pagination for extensive roadmaps

**Memory Usage:**

- Monitor Context re-renders
- Optimize component memoization
- Check for memory leaks in useEffect

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:

- Check the troubleshooting section above
- Review existing GitHub issues
- Create a new issue with detailed information

---

**Built with ❤️ using React, Tailwind CSS, and modern web technologies.**
