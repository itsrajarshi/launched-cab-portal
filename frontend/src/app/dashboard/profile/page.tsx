"use client";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();
  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-900/90 dark:text-white p-8 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2 mt-1 bg-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-700"
            value={user?.email || ""}
            disabled
            placeholder="Email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Role</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 mt-1 bg-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-700"
            value={user?.role || ""}
            disabled
            placeholder="Role"
          />
        </div>
        <button
          className="bg-blue-600 text-white dark:bg-blue-500 dark:text-gray-900 px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-400"
          type="button"
          disabled
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
