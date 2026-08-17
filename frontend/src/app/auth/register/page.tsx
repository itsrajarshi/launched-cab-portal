"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { registerUser } from "@/lib/api";
import type { Role } from "@/lib/types";

export default function Register() {
  const [role, setRole] = useState<Role>("company");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const result = await registerUser({ email, password, role, name });
      localStorage.setItem("token", result.token);
      login(result.user.email, result.user.role);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-950 transition-colors">
      <form className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6 border border-blue-100 dark:border-gray-700 animate-fadein" onSubmit={handleSubmit}>
        <div className="flex flex-col items-center mb-2">
          <div className="bg-blue-600 dark:bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center mb-2 shadow-lg transition-colors">
            <span className="text-white text-2xl">🚕</span>
          </div>
          <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            Register
          </h2>
        </div>
        <label className="block text-sm font-medium text-left">
          Role
          <select
            className="w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-200 dark:bg-gray-900 dark:text-white"
            value={role}
            onChange={e => setRole(e.target.value as Role)}
          >
            <option value="company">Company</option>
            <option value="vendor">Vendor</option>
          </select>
        </label>
        <input
          type="text"
          placeholder="Name"
          className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-200 dark:bg-gray-900 dark:text-white"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-200 dark:bg-gray-900 dark:text-white"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-200 dark:bg-gray-900 dark:text-white"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error && <div className="text-red-500 text-center text-sm mb-2">{error}</div>}
        <button
          type="submit"
          className="w-full bg-blue-600 dark:bg-blue-500 text-white py-2 rounded-lg font-semibold shadow hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        >
          Register
        </button>
        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-blue-600 dark:text-blue-300 hover:underline"
          >
            Login
          </Link>
        </p>
        <div className="mt-4 text-xs text-gray-400 dark:text-gray-500 text-center">
          &copy; {new Date().getFullYear()} Rajarshi
        </div>
      </form>
    </div>
  );
}
