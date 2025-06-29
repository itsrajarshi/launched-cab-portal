import React from "react";

export default function DashboardFooter() {
  return (
    <footer className="w-full bg-gray-900 dark:bg-gray-950 text-gray-200 dark:text-gray-300 py-3 px-4 flex items-center justify-between border-t border-gray-800 dark:border-gray-700 mt-auto z-20 transition-colors">
      <div className="flex items-center gap-2">
        <span className="font-bold text-blue-400 dark:text-blue-300">CabCorp</span>
        <span className="text-xs text-gray-400 dark:text-gray-500">© {new Date().getFullYear()} All rights reserved.</span>
      </div>
      <div className="flex items-center gap-3">
        <a href="mailto:support@cabcorp.com" aria-label="Email" className="hover:text-blue-400 dark:hover:text-blue-300 transition-colors">
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.94 4.94A8 8 0 1116.97 16.97 8 8 0 012.94 4.94zm1.41 1.41a6 6 0 108.49 8.49l-1.41-1.41a4 4 0 11-5.66-5.66l1.41 1.41a2 2 0 102.83 2.83l1.41-1.41a6 6 0 00-8.49-8.49z"></path>
          </svg>
        </a>
        <a href="https://twitter.com/" aria-label="Twitter" className="hover:text-blue-400 dark:hover:text-blue-300 transition-colors">
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.316 6.246c.008.176.008.353.008.53 0 5.39-4.104 11.61-11.61 11.61-2.307 0-4.453-.676-6.26-1.84.32.037.637.053.965.053 1.92 0 3.687-.653 5.096-1.753a4.09 4.09 0 01-3.82-2.84c.254.037.508.06.77.06.373 0 .747-.05 1.096-.144a4.086 4.086 0 01-3.276-4.01v-.053a4.13 4.13 0 001.847.52 4.09 4.09 0 01-1.82-3.41c0-.747.202-1.445.553-2.047a11.6 11.6 0 008.42 4.27c-.07-.298-.11-.61-.11-.93a4.09 4.09 0 014.09-4.09c1.18 0 2.25.5 3 1.3a8.13 8.13 0 002.6-.99 4.09 4.09 0 01-1.8 2.26 8.19 8.19 0 002.35-.64 8.8 8.8 0 01-2.05 2.12z"></path>
          </svg>
        </a>
        <a href="https://linkedin.com/" aria-label="LinkedIn" className="hover:text-blue-400 dark:hover:text-blue-300 transition-colors">
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
            <path d="M16.5 3A2.5 2.5 0 0119 5.5v9A2.5 2.5 0 0116.5 17h-13A2.5 2.5 0 011 14.5v-9A2.5 2.5 0 013.5 3h13zm-8.25 12V8.75H5.25V15h3zm-1.5-7.25a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zm9.25 7.25v-3.25c0-.97-.78-1.75-1.75-1.75s-1.75.78-1.75 1.75V15h3zm-1.5-7.25a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z"></path>
          </svg>
        </a>
      </div>
    </footer>
  );
}
