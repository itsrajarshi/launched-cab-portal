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
    <div className="min-h-screen flex items-center justify-center relative transition-colors duration-500 overflow-hidden login-bg-company">
      {/* Animated wallpaper backgrounds for company login */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-200 via-blue-50 to-purple-200 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 animate-gradient-x" />
      <div className="absolute top-0 left-0 w-full h-40 bg-blue-400/20 blur-2xl animate-fadein" />
      <div className="absolute bottom-0 right-0 w-1/2 h-1/3 bg-purple-300/30 blur-2xl rounded-full animate-float-slow" />
      <div className="absolute left-10 top-1/3 w-24 h-24 bg-blue-200/40 rounded-full blur-2xl animate-float" />
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
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1.2s cubic-bezier(0.4,0,0.2,1) both;
        }
        @keyframes gradient-x {
          0%, 100% { background-position: left; }
          50% { background-position: right; }
        }
        .animate-gradient-x {
          animation: gradient-x 8s ease-in-out infinite alternate;
        }
        @keyframes fadein {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadein {
          animation: fadein 2s ease-in both;
        }
        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float-slow {
          0% { transform: translateY(0); }
          50% { transform: translateY(-40px); }
          100% { transform: translateY(0); }
        }
        .animate-float-slow {
          animation: float-slow 12s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
