"use client";

import { useAuth } from "@/context/AuthContext";
import Card from "@/components/Card";

export default function ProfilePage() {
  const { user } = useAuth();
  return (
    <div className="p-6">
      <Card className="max-w-xl mx-auto p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold shadow-lg bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
            👤
          </span>
          <div>
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your account details
            </p>
          </div>
        </div>
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
      </Card>
    </div>
  );
}