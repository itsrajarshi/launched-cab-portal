"use client";
import { ReactNode } from "react";

export default function Modal({ open, onClose, title, children }: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200/40 via-white/30 to-blue-400/40 dark:from-gray-900/60 dark:via-gray-800/40 dark:to-blue-900/40 backdrop-blur-md animate-fadein">
      <div className="modal-pop bg-white/80 dark:bg-gray-900/90 rounded-2xl shadow-2xl w-full max-w-xl min-w-[320px] sm:min-w-[400px] p-8 relative border border-blue-100 dark:border-gray-700 backdrop-blur-xl">
        <button
          className="absolute top-2 right-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl transition-transform duration-200 hover:scale-125"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-extrabold mb-4 text-blue-700 dark:text-blue-300 tracking-tight animate-fadein">{title}</h2>
        {children}
      </div>
    </div>
  );
}
