export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-950">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 dark:border-blue-300 border-solid mb-4"></div>
        <span className="text-blue-700 dark:text-blue-300 font-semibold text-lg">Loading...</span>
      </div>
    </div>
  );
}
