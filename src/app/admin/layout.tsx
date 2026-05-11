import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Shield, LayoutDashboard, Store, CreditCard, Users, Settings, LogOut, Bell, Megaphone } from "lucide-react";
import { logoutAction } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";

import { AdminNavLink } from "./nav-link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || !session.isSuperAdmin) {
    redirect("/admin-login");
  }

  return (
    <div className="flex h-screen bg-[#f8fafc]">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
        <div className="p-6">
          <Link href="/admin" className="flex items-center gap-3 text-white font-black tracking-tight text-xl">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
              <Shield className="size-5" />
            </div>
            <span>MyPOS <span className="text-primary text-[10px] uppercase font-bold tracking-widest block leading-none">System Admin</span></span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <AdminNavLink href="/admin" icon={<LayoutDashboard className="size-4" />} label="Tổng quan" />
          <AdminNavLink href="/admin/tenants" icon={<Store className="size-4" />} label="Quản lý Cửa hàng" />
          <AdminNavLink href="/admin/subscriptions" icon={<CreditCard className="size-4" />} label="Gói dịch vụ & Doanh thu" />
          <AdminNavLink href="/admin/announcements" icon={<Megaphone className="size-4" />} label="Thông báo hệ thống" />
          <AdminNavLink href="/admin/users" icon={<Users className="size-4" />} label="Quản trị viên" />
          <div className="pt-8 pb-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hệ thống</div>
          <AdminNavLink href="/admin/settings" icon={<Settings className="size-4" />} label="Cài đặt hệ thống" />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <form action={logoutAction}>
            <button className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-800 hover:text-white transition-all text-slate-400">
              <LogOut className="size-4" />
              Đăng xuất
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shrink-0">
          <div className="text-sm font-medium text-slate-500">
             Chào mừng trở lại, <span className="text-slate-900 font-bold">{session.name}</span>
          </div>
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" className="rounded-full relative">
                <Bell className="size-5 text-slate-500" />
                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white" />
             </Button>
             <div className="size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase">
                {session.name.slice(0, 2)}
             </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
