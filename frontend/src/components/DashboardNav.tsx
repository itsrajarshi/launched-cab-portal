'use client';
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { FaUserTie, FaCarSide, FaFileInvoice, FaUser, FaSignOutAlt, FaClipboardList, FaHome } from "react-icons/fa";

export default function DashboardNav({ role }: { role: "company" | "vendor" }) {
  const { logout } = useAuth();
  const pathname = usePathname();

  // Role-based nav links
  const companyLinks = [
    { href: "/dashboard", label: "Dashboard", icon: <FaHome /> },
    { href: "/dashboard/bookings", label: "Bookings", icon: <FaClipboardList /> },
    { href: "/dashboard/invoices", label: "Invoices", icon: <FaFileInvoice /> },
    { href: "/dashboard/profile", label: "Profile", icon: <FaUser /> },
  ];
  const vendorLinks = [
    { href: "/dashboard", label: "Dashboard", icon: <FaHome /> },
    { href: "/dashboard/bookings", label: "Bookings", icon: <FaClipboardList /> },
    { href: "/dashboard/drivers", label: "Drivers", icon: <FaUserTie /> },
    { href: "/dashboard/vehicles", label: "Vehicles", icon: <FaCarSide /> },
    { href: "/dashboard/invoices", label: "Invoices", icon: <FaFileInvoice /> },
    { href: "/dashboard/profile", label: "Profile", icon: <FaUser /> },
  ];
  const links = role === "vendor" ? vendorLinks : companyLinks;

  return (
    <header className="backdrop-blur-md bg-white/60 dark:bg-gray-900/80 border-b border-blue-100 dark:border-gray-800 shadow-lg sticky top-0 z-30 transition-colors">
      <nav className="flex items-center justify-between px-8 py-3">
        <div className="flex items-center gap-3 font-extrabold text-xl text-blue-700 dark:text-blue-300">
          <span className="bg-white text-blue-700 dark:bg-gray-800 dark:text-blue-300 rounded-full w-10 h-10 flex items-center justify-center shadow-lg text-2xl transition-colors">🚕</span>
          Cab Portal
        </div>
        <ul className="flex gap-2 md:gap-4 items-center">
          {links.map(link => (
            <li key={link.href}>
              <Link href={link.href} className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all duration-200 ${pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href)) ? "bg-blue-600 text-white dark:bg-blue-500 dark:text-gray-900 shadow-md" : "hover:bg-blue-100 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-blue-300"}`}>
                <span className="text-lg">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        <button onClick={logout} className="flex items-center gap-2 bg-blue-700 dark:bg-blue-500 text-white dark:text-gray-900 px-4 py-2 rounded-full font-semibold hover:bg-blue-800 dark:hover:bg-blue-400 transition">
          <FaSignOutAlt /> Logout
        </button>
      </nav>
    </header>
  );
}
