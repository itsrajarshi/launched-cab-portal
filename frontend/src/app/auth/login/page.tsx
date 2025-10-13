// This file was moved from login.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { loginUser } from "@/lib/api";

export default function Login() {
  const [role, setRole] = useState("company");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const result = await loginUser({ email, password });
      if (result.user.role !== role) {
        setError(`You are not registered as a ${role}.`);
        return;
      }
      localStorage.setItem("token", result.token);
      login(result.user.email, result.user.role);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center relative transition-colors duration-500 overflow-hidden ${
        role === "company" ? "login-bg-company" : "login-bg-vendor"
      }`}
    >
      {/* Animated wallpaper backgrounds for each role */}
      {role === "company" ? (
        <>
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-200 via-blue-50 to-purple-200 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 animate-gradient-x" />
          <div className="absolute top-0 left-0 w-full h-40 bg-blue-400/20 blur-2xl animate-fadein" />
          <div className="absolute bottom-0 right-0 w-1/2 h-1/3 bg-purple-300/30 blur-2xl rounded-full animate-float-slow" />
          <div className="absolute left-10 top-1/3 w-24 h-24 bg-blue-200/40 rounded-full blur-2xl animate-float" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-200 dark:from-gray-900 dark:via-gray-800 dark:to-pink-900 animate-gradient-y" />
          <div className="absolute top-0 right-0 w-1/2 h-40 bg-pink-300/30 blur-2xl rounded-full animate-fadein" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/3 bg-yellow-200/30 blur-2xl rounded-full animate-float-slow" />
          <div className="absolute right-10 top-1/4 w-24 h-24 bg-pink-200/40 rounded-full blur-2xl animate-float" />
        </>
      )}
      <form
        className={`translucent p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6 border login-animate z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md ${
          role === "company"
            ? "border-blue-100 dark:border-blue-700"
            : "border-pink-200 dark:border-pink-700"
        }`}
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col items-center mb-2">
          <div
            className={`rounded-full w-16 h-16 flex items-center justify-center mb-2 shadow-lg transition-colors animate-bounce-slow ${
              role === "company"
                ? "bg-blue-600 dark:bg-blue-500"
                : "bg-pink-500 dark:bg-pink-400"
            }`}
          >
            <span className="text-white text-3xl animate-spin-slow">
              {role === "company" ? "🚕" : "🚖"}
            </span>
          </div>
          <h2
            className={`text-2xl font-bold animate-fadein ${
              role === "company"
                ? "text-blue-700 dark:text-blue-300"
                : "text-pink-700 dark:text-pink-300"
            }`}
          >
            {role === "company" ? "Company Login" : "Vendor Login"}
          </h2>
          <div
            className={`text-sm mt-1 font-medium ${
              role === "company" ? "text-blue-500" : "text-pink-500"
            } animate-fadein`}
          >
            {role === "company"
              ? "For corporate clients and employees"
              : "For trusted cab vendors and partners"}
          </div>
        </div>
        <label className="block text-sm font-medium text-left">
          Login as
          <select
            className="w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-200 dark:bg-gray-900 dark:text-white login-input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="company">Company</option>
            <option value="vendor">Vendor</option>
          </select>
        </label>
        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-200 dark:bg-gray-900 dark:text-white login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-200 dark:bg-gray-900 dark:text-white login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <div className="text-red-500 text-center text-sm mb-2 animate-fadein">
            {error}
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-blue-600 dark:bg-blue-500 text-white py-2 rounded-lg font-semibold shadow login-btn"
        >
          Login
        </button>
        <p className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/register"
            className="text-red-500 dark:text-red-400 hover:underline"
          >
            Register
          </Link>
        </p>
        <div className="mt-4 text-xs text-gray-400 dark:text-gray-500 text-center">
          &copy; {new Date().getFullYear()} Rajarshi
        </div>
      </form>
    </div>
  );
}
