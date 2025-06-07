import { useEffect } from "react";
import { RoadmapVoteProvider } from "../../context/RoadmapVoteContext";
import RoadmapUpvoteButton from "./RoadmapUpvoteButton";
import StandaloneRoadmapUpvoteButton from "./StandaloneRoadmapUpvoteButton";
import RoadmapVotePersistence from "../../utils/RoadmapVotePersistence";

const RoadmapVotingDemo = () => {
  const mockRoadmaps = [
    {
      id: "demo-roadmap-1",
      title: "Full Stack Web Development",
      description: "Complete guide to becoming a full stack developer",
    },
    {
      id: "demo-roadmap-2",
      title: "Machine Learning Fundamentals",
      description: "Learn the basics of ML and AI development",
    },
    {
      id: "demo-roadmap-3",
      title: "DevOps Engineering Path",
      description: "Master containerization, CI/CD, and cloud platforms",
    },
  ];

  // Add some test votes to demonstrate the system
  useEffect(() => {
    // Add some mock votes to demonstrate the counting system
    const addTestVotes = () => {
      // Add votes for demo-roadmap-1 (3 users)
      const roadmap1Votes = {
        votes: {
          "user-1": "2024-01-15T10:00:00.000Z",
          "user-2": "2024-01-15T11:00:00.000Z",
          "user-3": "2024-01-15T12:00:00.000Z",
        },
        totalVotes: 3,
        lastUpdated: new Date().toISOString(),
      };

      // Add votes for demo-roadmap-2 (5 users)
      const roadmap2Votes = {
        votes: {
          "user-1": "2024-01-15T10:00:00.000Z",
          "user-4": "2024-01-15T11:00:00.000Z",
          "user-5": "2024-01-15T12:00:00.000Z",
          "user-6": "2024-01-15T13:00:00.000Z",
          "user-7": "2024-01-15T14:00:00.000Z",
        },
        totalVotes: 5,
        lastUpdated: new Date().toISOString(),
      };

      // Add votes for demo-roadmap-3 (1 user)
      const roadmap3Votes = {
        votes: {
          "user-8": "2024-01-15T15:00:00.000Z",
        },
        totalVotes: 1,
        lastUpdated: new Date().toISOString(),
      };

      // Update localStorage with test data
      RoadmapVotePersistence.updateRoadmapVotes(
        "demo-roadmap-1",
        roadmap1Votes
      );
      RoadmapVotePersistence.updateRoadmapVotes(
        "demo-roadmap-2",
        roadmap2Votes
      );
      RoadmapVotePersistence.updateRoadmapVotes(
        "demo-roadmap-3",
        roadmap3Votes
      );
    };

    // Only add test votes if they don't already exist
    const existingVotes =
      RoadmapVotePersistence.getRoadmapVotes("demo-roadmap-1");
    if (!existingVotes) {
      addTestVotes();
    }
  }, []);

  const clearTestData = () => {
    RoadmapVotePersistence.clearAllVotes();
    window.location.reload(); // Reload to see the changes
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Roadmap Upvote Feature Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Test the roadmap-level upvote functionality. Click the heart button to
          like roadmaps!
        </p>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={clearTestData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Clear Test Data
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Refresh Page
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
            Demo roadmaps have pre-loaded votes to show the counting system
          </span>
        </div>
      </div>

      <div className="space-y-8">
        {/* Context-based Upvote Buttons (for roadmap detail pages) */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Context-based Upvote Buttons
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            These buttons work within a RoadmapVoteProvider context (used on
            individual roadmap pages):
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockRoadmaps.map((roadmap) => (
              <RoadmapVoteProvider key={roadmap.id} roadmapId={roadmap.id}>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    {roadmap.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {roadmap.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <RoadmapUpvoteButton
                      size="sm"
                      variant="default"
                      iconType="heart"
                      showCount={true}
                    />
                    <RoadmapUpvoteButton
                      size="sm"
                      variant="compact"
                      iconType="heart"
                      showCount={true}
                    />
                    <RoadmapUpvoteButton
                      size="sm"
                      variant="minimal"
                      iconType="heart"
                      showCount={true}
                    />
                  </div>
                </div>
              </RoadmapVoteProvider>
            ))}
          </div>
        </div>

        {/* Standalone Upvote Buttons (for roadmap lists) */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Standalone Upvote Buttons
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            These buttons work independently with just a roadmapId prop (used in
            roadmap lists):
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockRoadmaps.map((roadmap) => (
              <div
                key={roadmap.id}
                className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
              >
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  {roadmap.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {roadmap.description}
                </p>
                <div className="flex justify-between items-center">
                  <StandaloneRoadmapUpvoteButton
                    roadmapId={roadmap.id}
                    size="sm"
                    variant="default"
                    showCount={true}
                  />
                  <StandaloneRoadmapUpvoteButton
                    roadmapId={roadmap.id}
                    size="sm"
                    variant="compact"
                    showCount={true}
                  />
                  <StandaloneRoadmapUpvoteButton
                    roadmapId={roadmap.id}
                    size="sm"
                    variant="minimal"
                    showCount={true}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Different Button Sizes */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Button Sizes & Variants
          </h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-20">
                Extra Small:
              </span>
              <StandaloneRoadmapUpvoteButton
                roadmapId="demo-roadmap-1"
                size="xs"
                variant="default"
              />
              <StandaloneRoadmapUpvoteButton
                roadmapId="demo-roadmap-1"
                size="xs"
                variant="compact"
              />
              <StandaloneRoadmapUpvoteButton
                roadmapId="demo-roadmap-1"
                size="xs"
                variant="minimal"
              />
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-20">
                Small:
              </span>
              <StandaloneRoadmapUpvoteButton
                roadmapId="demo-roadmap-1"
                size="sm"
                variant="default"
              />
              <StandaloneRoadmapUpvoteButton
                roadmapId="demo-roadmap-1"
                size="sm"
                variant="compact"
              />
              <StandaloneRoadmapUpvoteButton
                roadmapId="demo-roadmap-1"
                size="sm"
                variant="minimal"
              />
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-20">
                Medium:
              </span>
              <StandaloneRoadmapUpvoteButton
                roadmapId="demo-roadmap-1"
                size="md"
                variant="default"
              />
              <StandaloneRoadmapUpvoteButton
                roadmapId="demo-roadmap-1"
                size="md"
                variant="compact"
              />
              <StandaloneRoadmapUpvoteButton
                roadmapId="demo-roadmap-1"
                size="md"
                variant="minimal"
              />
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-20">
                Large:
              </span>
              <StandaloneRoadmapUpvoteButton
                roadmapId="demo-roadmap-1"
                size="lg"
                variant="default"
              />
              <StandaloneRoadmapUpvoteButton
                roadmapId="demo-roadmap-1"
                size="lg"
                variant="compact"
              />
              <StandaloneRoadmapUpvoteButton
                roadmapId="demo-roadmap-1"
                size="lg"
                variant="minimal"
              />
            </div>
          </div>
        </div>

        {/* Debug Information */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Debug Information
          </h2>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>
              <strong>Current Vote Counts:</strong>
            </p>
            <ul className="ml-4 space-y-1">
              <li>
                Demo Roadmap 1:{" "}
                {RoadmapVotePersistence.getRoadmapVoteCount("demo-roadmap-1")}{" "}
                votes
              </li>
              <li>
                Demo Roadmap 2:{" "}
                {RoadmapVotePersistence.getRoadmapVoteCount("demo-roadmap-2")}{" "}
                votes
              </li>
              <li>
                Demo Roadmap 3:{" "}
                {RoadmapVotePersistence.getRoadmapVoteCount("demo-roadmap-3")}{" "}
                votes
              </li>
            </ul>
            <p className="mt-4">
              <strong>How it works:</strong>
            </p>
            <p>
              ✅ <strong>Firestore Primary:</strong> All votes stored in
              Firestore as source of truth
            </p>
            <p>
              ✅ <strong>Real-time sync:</strong> Updates every 5 seconds from
              Firestore
            </p>
            <p>
              ✅ <strong>Cross-user visibility:</strong> All users see the same
              vote counts
            </p>
            <p>
              ✅ <strong>Anonymous support:</strong> Works without
              authentication
            </p>
            <p className="mt-4 font-medium text-blue-600 dark:text-blue-400">
              Open this page in multiple browser tabs/windows to test real-time
              sync!
            </p>
          </div>
        </div>

        {/* Data Persistence Info */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Data Persistence
          </h2>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>
              ✅ <strong>localStorage:</strong> Votes are immediately saved
              locally for all users
            </p>
            <p>
              ✅ <strong>Firestore:</strong> Votes sync to cloud when
              authenticated
            </p>
            <p>
              ✅ <strong>Anonymous voting:</strong> Persistent anonymous IDs for
              non-authenticated users
            </p>
            <p>
              ✅ <strong>Data merging:</strong> Local and cloud data are
              intelligently combined
            </p>
            <p>
              ✅ <strong>Real-time updates:</strong> Optimistic UI updates for
              responsive feel
            </p>
            <p className="mt-4 font-medium">
              Try refreshing the page to see that your votes are preserved!
            </p>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Usage Examples
          </h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                In Roadmap Headers (with context):
              </h3>
              <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs overflow-x-auto">
                {`<RoadmapVoteProvider roadmapId={roadmapId}>
  <RoadmapUpvoteButton 
    size="md"
    variant="default"
    iconType="heart"
    showCount={true}
  />
</RoadmapVoteProvider>`}
              </pre>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                In Roadmap Lists (standalone):
              </h3>
              <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs overflow-x-auto">
                {`<StandaloneRoadmapUpvoteButton 
  roadmapId={roadmap.id}
  size="xs"
  variant="minimal"
  showCount={true}
/>`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapVotingDemo;
