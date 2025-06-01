import ThemeSelector from "./ThemeSelector";
import Breadcrumb from "./Breadcrumb";

const PageLayout = ({ 
  title, 
  subtitle, 
  showBreadcrumb = false, 
  breadcrumbProps = {}, 
  actions = null,
  children 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        {/* Consistent Page Header */}
        <div className="mb-6">
          {/* Breadcrumb Section */}
          {showBreadcrumb && (
            <div className="mb-4">
              <Breadcrumb {...breadcrumbProps} />
            </div>
          )}

          {/* Page Title and Theme Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            <div className="flex-shrink-0">
              <ThemeSelector />
            </div>
          </div>

          {/* Action Buttons Section */}
          {actions && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 mb-6">
              {actions}
            </div>
          )}
        </div>

        {/* Page Content */}
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
