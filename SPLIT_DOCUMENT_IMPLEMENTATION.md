# Split Document Implementation for Large Roadmaps

## Problem
Firestore has a document size limit of 1MB (1,048,576 bytes). Large roadmaps with detailed task information were exceeding this limit, causing save failures.

## Solution
Implemented a split document approach that divides roadmap data into smaller, manageable documents:

### Document Structure

#### 1. **Roadmap Outline** (`/roadmaps/{roadmapId}`)
- Contains basic roadmap information and phase structure
- **Excludes** detailed task information to keep size small
- Fields: `id`, `userId`, `outline`, `originalData`, `isPublic`, timestamps, `version`, `tags`, `projectLevel`

#### 2. **Phase Tasks** (`/phaseTasks/{roadmapId}_phase_{phaseNumber}`)
- Separate documents for each phase's tasks
- Contains only the task details for that specific phase
- Fields: `roadmapId`, `phaseId`, `phaseNumber`, `tasks`, timestamps

#### 3. **Metadata** (`/roadmapMetadata/{roadmapId}`)
- Lightweight document for efficient querying and listing
- Contains summary information without full content
- Fields: `id`, `userId`, `title`, `description`, `projectLevel`, `tags`, `isPublic`, timestamps, counts, progress

### Implementation Details

#### Data Splitting (`splitRoadmapData`)
```javascript
// Separates roadmap into outline and phase tasks
const { outline, phaseTasks } = this.splitRoadmapData(roadmapData);
```

#### Data Reconstruction (`reconstructRoadmapData`)
```javascript
// Rebuilds full roadmap from split documents
const fullRoadmapData = await this.reconstructRoadmapData(roadmapData, phaseTasksSnap);
```

#### Batch Operations
- All related documents are saved/updated/deleted in atomic batch operations
- Ensures data consistency across multiple documents

### Security Rules
Updated Firestore security rules to handle the new `phaseTasks` collection:
- Users can only access phase tasks for roadmaps they own or that are public
- Proper validation for phase task data structure
- Maintains existing security model for roadmaps and metadata

### Benefits
1. **No Size Limits**: Can handle roadmaps of any size by distributing data across multiple documents
2. **Efficient Queries**: Metadata collection enables fast listing without loading full content
3. **Selective Loading**: Can load only specific phases when needed (future optimization)
4. **Atomic Operations**: Batch writes ensure data consistency
5. **Backward Compatibility**: Handles both old and new data formats

### File Changes
- `src/utils/FirestorePersistence.js`: Complete rewrite of save/load/update/delete methods
- `firestore.rules`: Added security rules for `phaseTasks` collection
- `firebase.json`: Created Firebase configuration file
- `firestore.indexes.json`: Added indexes for efficient querying

### Testing
The implementation maintains the same API interface, so existing components continue to work without changes. The split/reconstruction happens transparently in the persistence layer.

### Future Optimizations
1. **Lazy Loading**: Load phase tasks on-demand when viewing specific phases
2. **Caching**: Cache frequently accessed phase data
3. **Compression**: Compress task data before storage
4. **Pagination**: Load phases in batches for very large roadmaps
