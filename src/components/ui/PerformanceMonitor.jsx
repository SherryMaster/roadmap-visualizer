import { useState, useEffect, useRef } from "react";

const PerformanceMonitor = ({ enabled = process.env.NODE_ENV === 'development' }) => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    memoryUsage: 0,
    componentCount: 0,
    lastUpdate: Date.now()
  });
  const [isVisible, setIsVisible] = useState(false);
  const renderStartTime = useRef(Date.now());
  const frameCount = useRef(0);
  const lastFrameTime = useRef(Date.now());

  useEffect(() => {
    if (!enabled) return;

    const updateMetrics = () => {
      const now = Date.now();
      const renderTime = now - renderStartTime.current;
      
      // Memory usage (if available)
      let memoryUsage = 0;
      if (performance.memory) {
        memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
      }

      // Component count estimation
      const componentCount = document.querySelectorAll('[data-reactroot], [data-react-component]').length;

      setMetrics({
        renderTime,
        memoryUsage,
        componentCount,
        lastUpdate: now
      });

      frameCount.current++;
      lastFrameTime.current = now;
    };

    // Update metrics every second
    const interval = setInterval(updateMetrics, 1000);

    // Performance observer for paint timing
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'paint') {
            console.log(`${entry.name}: ${entry.startTime}ms`);
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['paint', 'measure'] });
      } catch (e) {
        console.warn('Performance Observer not fully supported');
      }

      return () => {
        clearInterval(interval);
        observer.disconnect();
      };
    }

    return () => clearInterval(interval);
  }, [enabled]);

  // Mark render start
  useEffect(() => {
    renderStartTime.current = Date.now();
  });

  if (!enabled) return null;

  const getPerformanceStatus = () => {
    if (metrics.renderTime < 16) return { color: 'green', status: 'Excellent' };
    if (metrics.renderTime < 33) return { color: 'yellow', status: 'Good' };
    return { color: 'red', status: 'Needs Optimization' };
  };

  const performanceStatus = getPerformanceStatus();

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-20 right-4 w-12 h-12 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors z-40 flex items-center justify-center"
        title="Performance Monitor"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </button>

      {/* Performance Panel */}
      {isVisible && (
        <div className="fixed bottom-32 right-4 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Performance Monitor
              </h3>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                performanceStatus.color === 'green' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : performanceStatus.color === 'yellow'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              }`}>
                {performanceStatus.status}
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="p-4 space-y-4">
            {/* Render Performance */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Render Time
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {metrics.renderTime}ms
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    metrics.renderTime < 16 
                      ? 'bg-green-500' 
                      : metrics.renderTime < 33 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, (metrics.renderTime / 50) * 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>0ms</span>
                <span>50ms</span>
              </div>
            </div>

            {/* Memory Usage */}
            {metrics.memoryUsage > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Memory Usage
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {metrics.memoryUsage}MB
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      metrics.memoryUsage < 50 
                        ? 'bg-green-500' 
                        : metrics.memoryUsage < 100 
                        ? 'bg-yellow-500' 
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, (metrics.memoryUsage / 200) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>0MB</span>
                  <span>200MB</span>
                </div>
              </div>
            )}

            {/* Component Count */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                DOM Elements
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {metrics.componentCount}
              </span>
            </div>

            {/* FPS Estimate */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Est. FPS
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round(1000 / Math.max(metrics.renderTime, 16))}
              </span>
            </div>

            {/* Last Update */}
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2 border-t border-gray-200 dark:border-gray-600">
              Last updated: {new Date(metrics.lastUpdate).toLocaleTimeString()}
            </div>
          </div>

          {/* Performance Tips */}
          {performanceStatus.color !== 'green' && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Performance Tips:
              </h4>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                {metrics.renderTime > 33 && (
                  <li>• Consider using virtual scrolling for large lists</li>
                )}
                {metrics.memoryUsage > 100 && (
                  <li>• High memory usage detected - check for memory leaks</li>
                )}
                {metrics.componentCount > 1000 && (
                  <li>• Large DOM tree - consider component optimization</li>
                )}
                <li>• Use React DevTools Profiler for detailed analysis</li>
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  if (window.gc) {
                    window.gc();
                    console.log('Manual garbage collection triggered');
                  } else {
                    console.log('Manual GC not available');
                  }
                }}
                className="flex-1 px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Force GC
              </button>
              <button
                onClick={() => {
                  performance.mark('user-action-start');
                  console.log('Performance mark set');
                }}
                className="flex-1 px-3 py-2 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Mark
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="px-3 py-2 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PerformanceMonitor;
