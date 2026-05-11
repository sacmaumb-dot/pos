"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNavLink({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));

  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
        active 
          ? "bg-primary text-white shadow-lg shadow-primary/20" 
          : "hover:bg-slate-800 hover:text-white text-slate-400"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
