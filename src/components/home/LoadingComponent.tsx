const LoadingHomeComponent = () => (
  <div className="container mx-auto px-4 py-8 max-w-4xl">
    <div className="card bg-base-200 shadow-lg p-6 mb-8 animate-pulse">
      <div className="h-8 bg-base-300 rounded-md w-1/3 mb-4"></div>
      <div className="h-4 bg-base-300 rounded-md w-2/3 mb-6"></div>
      <div className="h-12 bg-base-300 rounded-md w-full"></div>
    </div>

    <div className="flex justify-between items-center mb-4">
      <div className="h-10 bg-base-300 rounded-md w-32"></div>
      <div className="h-10 bg-base-300 rounded-md w-48"></div>
    </div>

    <div className="card bg-base-200 shadow-lg">
      <div className="card-body">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-base-300 rounded-md"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default LoadingHomeComponent;
