"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function DashboardHome() {
  const [showGreeting, setShowGreeting] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => setShowGreeting(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  if (!user) return null;

  // Show fullscreen welcome overlay if showGreeting is true
  if (showGreeting) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-blue-200 via-blue-50 to-purple-200 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
          <div className="absolute w-96 h-96 bg-blue-300/30 dark:bg-blue-900/30 rounded-full blur-3xl animate-pulse-slow left-[-10%] top-[-10%]" />
          <div className="absolute w-80 h-80 bg-purple-300/30 dark:bg-purple-900/30 rounded-full blur-2xl animate-pulse-slow right-[-10%] bottom-[-10%]" />
          <div className="absolute w-40 h-40 bg-yellow-200/30 dark:bg-yellow-700/30 rounded-full blur-2xl animate-pulse-slow left-[60%] top-[60%]" />
        </div>
        <div className="flex flex-col items-center justify-center min-h-[200px] animate-fadein z-10">
          <div className="text-4xl font-extrabold text-blue-700 dark:text-blue-300 mb-4 animate-bounce drop-shadow-lg">
            Welcome! 👋
          </div>
          <div className="text-lg text-gray-600 dark:text-gray-300 mb-2">
            Glad to see you on the dashboard.
          </div>
          <div className="text-base text-gray-500 dark:text-gray-400 italic">
            Your all-in-one cab booking portal
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-blue-200 via-blue-50 to-purple-200 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute w-96 h-96 bg-blue-300/30 dark:bg-blue-900/30 rounded-full blur-3xl animate-pulse-slow left-[-10%] top-[-10%]" />
        <div className="absolute w-80 h-80 bg-purple-300/30 dark:bg-purple-900/30 rounded-full blur-2xl animate-pulse-slow right-[-10%] bottom-[-10%]" />
        <div className="absolute w-40 h-40 bg-yellow-200/30 dark:bg-yellow-700/30 rounded-full blur-2xl animate-pulse-slow left-[60%] top-[60%]" />
      </div>
      <main className="flex-1 flex flex-col items-center justify-center z-10 w-full">
        {/* Role-based intro section */}
        <div className="w-full max-w-2xl mb-8">
          <div className="mx-auto rounded-2xl bg-white/70 dark:bg-gray-900/90 shadow-[0_4px_32px_0_rgba(31,41,55,0.10)] border border-blue-200 dark:border-blue-800 backdrop-blur-md px-8 py-6 flex flex-col items-center gap-2 neumorphic-card transition-colors">
            {/* Logo/avatar for branding */}
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`rounded-full w-12 h-12 flex items-center justify-center text-3xl font-bold shadow-lg ${
                  user.role === "company"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                    : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200"
                } transition-colors`}
              >
                {user.role === "company" ? "🏢" : "🚖"}
              </span>
              <span className="text-lg font-semibold text-blue-700 dark:text-blue-200">
                {user.role === "company" ? "Company" : "Vendor"}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-1 drop-shadow transition-colors">
              {user.role === "company"
                ? "Welcome, Company User!"
                : "Welcome, Vendor Partner!"}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 text-center transition-colors">
              {user.role === "company"
                ? "Book, manage, and track all your corporate cab needs. Access real-time bookings, invoices, and more—all in one place."
                : "Manage your fleet, drivers, and bookings. Accept open market trips, complete rides, and handle invoices with ease."}
            </p>
            <p className="text-base text-blue-500 dark:text-blue-300 text-center mt-2 transition-colors">
              {user.role === "company"
                ? "Empowering smarter, safer, and more efficient corporate travel."
                : "Grow your business and deliver premium service to top corporate clients."}
            </p>
          </div>
        </div>
        {/* Colored Section Divider */}
        <div className="w-full max-w-2xl flex items-center mb-8">
          <div className="flex-1 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 dark:from-blue-700 dark:via-purple-700 dark:to-pink-700 rounded-full shadow-md opacity-70 transition-colors" />
        </div>
        {/* Redirect boxes (cards) with entrance animation */}
        <div className="flex flex-col items-center gap-8 w-full max-w-2xl animate-fadein z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
            {/* Bookings card (all roles) */}
            <Link
              href="/dashboard/bookings"
              className="rounded-2xl bg-white/70 dark:bg-gray-900/90 shadow-[0_4px_32px_0_rgba(31,41,55,0.10)] border border-blue-200 dark:border-blue-800 backdrop-blur-md p-8 flex flex-col items-center hover:scale-105 hover:bg-blue-100/80 dark:hover:bg-blue-900/80 transition-all group cursor-pointer neumorphic-card focus:ring-2 focus:ring-blue-400 focus:outline-none card-animate"
              aria-label="Bookings"
            >
              <span className="text-3xl font-bold text-blue-600 dark:text-blue-300 mb-2 group-hover:scale-110 transition-transform">
                📅
              </span>
              <span className="text-xl font-semibold mb-1">Bookings</span>
              <span className="text-gray-500 dark:text-gray-400 text-center">
                View, create, and manage all your cab bookings in one place.
              </span>
            </Link>
            {/* Vendor-only cards */}
            {user.role === "vendor" && (
              <>
                <Link
                  href="/dashboard/drivers"
                  className="rounded-2xl bg-white/70 dark:bg-gray-900/90 shadow-[0_4px_32px_0_rgba(16,185,129,0.10)] border border-green-200 dark:border-green-800 backdrop-blur-md p-8 flex flex-col items-center hover:scale-105 hover:bg-green-100/80 dark:hover:bg-green-900/80 transition-all group cursor-pointer neumorphic-card focus:ring-2 focus:ring-green-400 focus:outline-none card-animate"
                  aria-label="Drivers"
                >
                  <span className="text-3xl font-bold text-green-600 dark:text-green-300 mb-2 group-hover:scale-110 transition-transform">
                    🧑‍✈️
                  </span>
                  <span className="text-xl font-semibold mb-1">Drivers</span>
                  <span className="text-gray-500 dark:text-gray-400 text-center">
                    Add, edit, and manage your drivers and their details.
                  </span>
                </Link>
                <Link
                  href="/dashboard/vehicles"
                  className="rounded-2xl bg-white/70 dark:bg-gray-900/90 shadow-[0_4px_32px_0_rgba(251,191,36,0.10)] border border-yellow-200 dark:border-yellow-800 backdrop-blur-md p-8 flex flex-col items-center hover:scale-105 hover:bg-yellow-100/80 dark:hover:bg-yellow-900/80 transition-all group cursor-pointer neumorphic-card focus:ring-2 focus:ring-yellow-400 focus:outline-none card-animate"
                  aria-label="Vehicles"
                >
                  <span className="text-3xl font-bold text-yellow-600 dark:text-yellow-300 mb-2 group-hover:scale-110 transition-transform">
                    🚗
                  </span>
                  <span className="text-xl font-semibold mb-1">Vehicles</span>
                  <span className="text-gray-500 dark:text-gray-400 text-center">
                    Manage your fleet, add new vehicles, and track availability.
                  </span>
                </Link>
                <Link
                  href="/dashboard/manual-booking"
                  className="rounded-2xl bg-white/70 dark:bg-gray-900/90 shadow-[0_4px_32px_0_rgba(236,72,153,0.10)] border border-pink-200 dark:border-pink-800 backdrop-blur-md p-8 flex flex-col items-center hover:scale-105 hover:bg-pink-100/80 dark:hover:bg-pink-900/80 transition-all group cursor-pointer neumorphic-card focus:ring-2 focus:ring-pink-400 focus:outline-none card-animate"
                  aria-label="Manual Booking"
                >
                  <span className="text-3xl font-bold text-pink-600 dark:text-pink-300 mb-2 group-hover:scale-110 transition-transform">
                    ✍️
                  </span>
                  <span className="text-xl font-semibold mb-1">Manual Booking</span>
                  <span className="text-gray-500 dark:text-gray-400 text-center">
                    Add a manual booking directly to the system.
                  </span>
                </Link>
              </>
            )}
            {/* Invoices card (all roles) */}
            <Link
              href="/dashboard/invoices"
              className="rounded-2xl bg-white/70 dark:bg-gray-900/90 shadow-[0_4px_32px_0_rgba(168,85,247,0.10)] border border-purple-200 dark:border-purple-800 backdrop-blur-md p-8 flex flex-col items-center hover:scale-105 hover:bg-purple-100/80 dark:hover:bg-purple-900/80 transition-all group cursor-pointer neumorphic-card focus:ring-2 focus:ring-purple-400 focus:outline-none card-animate"
              aria-label="Invoices"
            >
              <span className="text-3xl font-bold text-purple-600 dark:text-purple-300 mb-2 group-hover:scale-110 transition-transform">
                🧾
              </span>
              <span className="text-xl font-semibold mb-1">Invoices</span>
              <span className="text-gray-500 dark:text-gray-400 text-center">
                View and submit invoices, track payments, and download reports.
              </span>
            </Link>
            {/* Company-only: Profile card */}
            {user.role === "company" && (
              <Link
                href="/dashboard/profile"
                className="rounded-2xl bg-white/70 dark:bg-gray-900/90 shadow-[0_4px_32px_0_rgba(59,130,246,0.10)] border border-blue-200 dark:border-blue-800 backdrop-blur-md p-8 flex flex-col items-center hover:scale-105 hover:bg-blue-100/80 dark:hover:bg-blue-900/80 transition-all group cursor-pointer neumorphic-card focus:ring-2 focus:ring-blue-400 focus:outline-none card-animate"
                aria-label="Profile"
              >
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-300 mb-2 group-hover:scale-110 transition-transform">
                  👤
                </span>
                <span className="text-xl font-semibold mb-1">Profile</span>
                <span className="text-gray-500 dark:text-gray-400 text-center">
                  View your company profile and details.
                </span>
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
