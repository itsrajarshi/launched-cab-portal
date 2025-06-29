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
      localStorage.setItem("token", result.token);
      login(result.user.email, result.user.role);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Animated video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-60"
      >
        <source src="/cab-bg.mp4" type="video/mp4" />
        {/* Fallback for browsers that don't support video */}
      </video>
      {/* Animated background blobs (optional, can be removed if video is enough) */}
      <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
        <div className="absolute bg-blue-400 opacity-20 rounded-full w-72 h-72 animate-pulse-slow left-[-6rem] top-[-6rem] filter blur-2xl" />
        <div className="absolute bg-purple-400 opacity-20 rounded-full w-96 h-96 animate-pulse-slow right-[-8rem] bottom-[-8rem] filter blur-2xl" />
        <div className="absolute bg-pink-400 opacity-10 rounded-full w-60 h-60 animate-pulse-slow left-1/2 top-1/2 filter blur-2xl" />
      </div>
      <form className="relative z-10 bg-white/90 dark:bg-gray-800/90 p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6 border border-blue-100 dark:border-gray-700 animate-fadein backdrop-blur-md">
        <div className="flex flex-col items-center mb-2">
          <div className="bg-blue-600 dark:bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center mb-2 shadow-lg transition-colors animate-bounce-slow">
            <span className="text-white text-2xl">🚕</span>
          </div>
          <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300 animate-fadein">
            Login
          </h2>
        </div>
        <label className="block text-sm font-medium text-left">
          Role
          <select
            className="w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-200 dark:bg-gray-900 dark:text-white"
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
          className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-200 dark:bg-gray-900 dark:text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-200 dark:bg-gray-900 dark:text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <div className="text-red-500 text-center text-sm mb-2">{error}</div>
        )}
        <button
          type="submit"
          className="w-full bg-blue-600 dark:bg-blue-500 text-white py-2 rounded-lg font-semibold shadow hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition flex items-center justify-center animate-pulse-fast"
        >
          <span className="mr-2">🚗</span>Login
        </button>
        <p className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/register"
            className="text-blue-600 dark:text-blue-300 hover:underline"
          >
            Register
          </Link>
        </p>
        <div className="mt-4 text-xs text-gray-400 dark:text-gray-500 text-center">
          &copy; {new Date().getFullYear()} Rajarshi
        </div>
      </form>
      {/* Custom animation keyframes */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.12);
            opacity: 0.4;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
        @keyframes fadein {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadein {
          animation: fadein 1.2s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2.5s infinite;
        }
        @keyframes pulse-fast {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        .animate-pulse-fast {
          animation: pulse-fast 1.2s infinite;
        }
      `}</style>
    </div>
  );
}
