import LoadingSpinner from '@/components/ui/LoadingSpinner';

const LoadingPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size={48} />
    </div>
  );
};

export default LoadingPage;
