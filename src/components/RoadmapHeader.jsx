const RoadmapHeader = ({ title }) => {
  return (
    <div className="mb-10 text-center">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
        {title}
      </h1>
      <div className="w-20 h-1 bg-blue-500 mx-auto"></div>
    </div>
  );
};

export default RoadmapHeader;
