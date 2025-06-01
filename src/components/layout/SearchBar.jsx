import { useState } from "react";
import Tooltip from "../tooltips/Tooltip";

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setSearchTerm("");
    onSearch("");
  };

  return (
    <div className="relative mb-6">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg
          className="w-5 h-5 text-gray-500 dark:text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>
      </div>

      <input
        type="search"
        className="block w-full p-3 sm:p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        placeholder="Search tasks, phases..."
        value={searchTerm}
        onChange={handleSearch}
      />

      {searchTerm && (
        <Tooltip
          content="Clear search and show all phases and tasks"
          position="top"
          maxWidth="200px"
        >
          <button
            type="button"
            className="absolute right-2 sm:right-2.5 bottom-2 sm:bottom-2.5 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium rounded-lg text-xs sm:text-sm px-3 sm:px-4 py-2 transition-colors min-h-[40px] sm:min-h-auto"
            onClick={clearSearch}
            aria-label="Clear search"
          >
            Clear
          </button>
        </Tooltip>
      )}
    </div>
  );
};

export default SearchBar;
