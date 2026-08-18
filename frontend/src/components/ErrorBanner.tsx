"use client";

export default function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-200 px-4 py-3 text-sm flex items-start gap-2 mb-4">
      <span className="text-base leading-none">⚠️</span>
      <div>
        <div className="font-semibold">Something went wrong</div>
        <div>{message}</div>
      </div>
    </div>
  );
}