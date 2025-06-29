import React, { useState } from "react";

export default function CompanyLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    // Dummy login logic
    setTimeout(() => {
      setLoading(false);
      if (email === "company" && password === "company") {
        window.location.href = "/dashboard/bookings";
      } else {
        setError("Invalid credentials");
      }
    }, 1200);
  }

  return (
    <div className="min-h-screen flex items-center justify-center login-gradient-bg relative overflow-hidden">
      <form
        onSubmit={handleLogin}
        className="relative z-10 bg-white/10 dark:bg-gray-900/80 backdrop-blur-md rounded-xl shadow-xl p-8 w-full max-w-md flex flex-col items-center border border-gray-700"
      >
        <h2 className="text-3xl font-bold mb-6 text-gray-100 dark:text-white tracking-wide animate-fade-in">Company Login</h2>
        <input
          type="text"
          placeholder="Email or Username"
          className="w-full mb-4 px-4 py-2 rounded bg-gray-800 text-gray-100 dark:text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-300 dark:placeholder-gray-400"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoFocus
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 px-4 py-2 rounded bg-gray-800 text-gray-100 dark:text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-300 dark:placeholder-gray-400"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error && <div className="text-red-400 mb-4">{error}</div>}
        <button
          type="submit"
          className="w-full py-2 rounded bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold text-lg shadow-lg hover:scale-105 transition-transform duration-200 flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <span className="animate-spin mr-2">🔄</span>
          ) : (
            <span className="animate-bounce">🏢</span>
          )}
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <style jsx>{`
        .login-gradient-bg {
          background: linear-gradient(135deg, #1e3a8a 0%, #6d28d9 60%, #111827 100%) !important;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1.2s cubic-bezier(0.4,0,0.2,1) both;
        }
      `}</style>
    </div>
  );
}
