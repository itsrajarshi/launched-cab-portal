"use client";
import { usePathname } from "next/navigation";
import DashboardNav from "@/components/DashboardNav";
import { useAuth } from "@/context/AuthContext";
import DashboardFooter from "@/components/DashboardFooter";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loggingOut } = useAuth();
  const hideNavAndFooter = pathname === "/" || pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register");
  return (
    <>
      {loggingOut && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-blue-200 via-blue-50 to-purple-200 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
          <div className="flex flex-col items-center justify-center min-h-[200px] animate-fadein z-10">
            <div className="text-3xl font-extrabold text-blue-700 dark:text-blue-300 mb-4 animate-bounce drop-shadow-lg">
              Logging out...
            </div>
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-blue-500 h-16 w-16 mb-4 animate-spin"></div>
          </div>
        </div>
      )}
      {!hideNavAndFooter && <DashboardNav role={user?.role || "company"} />}
      <main className="flex-1 flex flex-col w-full">{children}</main>
      {!hideNavAndFooter && (
        <div className="w-full">
          <DashboardFooter />
        </div>
      )}
    </>
  );
}
