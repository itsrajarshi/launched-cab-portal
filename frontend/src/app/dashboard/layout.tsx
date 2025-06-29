"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/auth/login");
    }
  }, [user, router]);

  if (!user) return null; // Optionally, show a spinner here

  return <main className="w-full flex flex-col min-h-screen bg-transparent">{children}</main>;
}
