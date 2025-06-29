import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-950 transition-colors">
      <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl max-w-xl w-full text-center border border-blue-100 dark:border-gray-700 animate-fadein">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-600 dark:bg-blue-500 rounded-full w-16 h-16 flex items-center justify-center mb-2 shadow-lg transition-colors">
            <span className="text-white text-3xl">🚕</span>
          </div>
          <h1 className="text-3xl font-extrabold mb-2 text-blue-700 dark:text-blue-300 tracking-tight">
            Corporate Cab Booking
          </h1>
        </div>
        <p className="mb-8 text-gray-600 dark:text-gray-300 text-lg">
          The all-in-one portal for corporate cab bookings, vendor management, and
          real-time trip tracking.
        </p>
        <div className="flex flex-col gap-4">
          <Link
            href="/auth/login"
            className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            className="border border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-300 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          >
            Register
          </Link>
        </div>
        <div className="mt-8 text-xs text-gray-400 dark:text-gray-500">
          &copy; {new Date().getFullYear()} Rajarshi
        </div>
      </div>
    </main>
  );
}
