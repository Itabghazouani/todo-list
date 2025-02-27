const LoadingHomeComponent = () => (
  <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
    <div className="card bg-base-200 shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 animate-pulse">
      <div className="h-6 sm:h-8 bg-base-300 rounded-md w-2/3 sm:w-1/3 mb-3 sm:mb-4"></div>
      <div className="h-3 sm:h-4 bg-base-300 rounded-md w-full sm:w-2/3 mb-4 sm:mb-6"></div>
      <div className="h-10 sm:h-12 bg-base-300 rounded-md w-full"></div>
    </div>

    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
      <div className="h-9 sm:h-10 bg-base-300 rounded-md w-28 sm:w-32"></div>
      <div className="h-9 sm:h-10 bg-base-300 rounded-md w-full sm:w-48"></div>
    </div>

    <div className="card bg-base-200 shadow-lg">
      <div className="card-body p-3 sm:p-6">
        <div className="space-y-2 sm:space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 sm:h-16 bg-base-300 rounded-md"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default LoadingHomeComponent;
