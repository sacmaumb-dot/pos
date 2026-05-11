import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Store, Users, Zap, Search, MoreHorizontal, CheckCircle2, Clock, TrendingUp, AlertCircle, Activity } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { TenantActions } from "./tenants/tenant-actions";
import { Button } from "@/components/ui/button";

import { CreateTenantDialog } from "./tenants/create-tenant-dialog";

export default async function SuperAdminPage() {
  const tenants = await prisma.tenant.findMany({
    include: {
      _count: {
        select: {
          users: true,
          products: true,
          customers: true,
          sessions: true,
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const totalRevenue = tenants.reduce((acc, t) => {
    if (t.subscriptionPlan === "pro") return acc + 100000;
    if (t.subscriptionPlan === "professional") return acc + 150000;
    if (t.subscriptionPlan === "basic") return acc + 50000;
    return acc;
  }, 0);

  const thisMonth = new Date();
  thisMonth.setDate(1);
  const signupsThisMonth = tenants.filter(t => new Date(t.createdAt) >= thisMonth).length;

  return (
    <div className="p-8 space-y-8">
      {/* Top Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Hệ thống Tổng quan</h2>
          <p className="text-slate-500 font-medium">Báo cáo tình hình kinh doanh và vận hành của tất cả khách hàng MyPOS.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-xl border-slate-200 font-bold text-xs h-10 px-6">
              Xuất báo cáo
           </Button>
           <CreateTenantDialog />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          icon={<Store className="size-6 text-blue-600" />} 
          label="Tổng cửa hàng" 
          value={tenants.length} 
          trend={`${signupsThisMonth} mới tháng này`}
          color="bg-blue-50"
        />
        <StatCard 
          icon={<TrendingUp className="size-6 text-emerald-600" />} 
          label="Doanh thu dự tính" 
          value={totalRevenue.toLocaleString("vi-VN") + "đ"} 
          trend="Hàng tháng"
          color="bg-emerald-50"
        />
        <StatCard 
          icon={<Users className="size-6 text-purple-600" />} 
          label="Tổng nhân sự" 
          value={tenants.reduce((s, t) => s + t._count.users, 0)} 
          trend="Trên toàn sàn"
          color="bg-purple-50"
        />
        <StatCard 
          icon={<Activity className="size-6 text-amber-500" />} 
          label="Thiết bị Online" 
          value={tenants.reduce((s, t) => s + t._count.sessions, 0)} 
          trend="Thời điểm hiện tại"
          color="bg-amber-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main List */}
        <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/60 rounded-3xl overflow-hidden bg-white">
          <CardHeader className="border-b px-8 py-6">
             <div className="flex flex-wrap items-center justify-between gap-4">
               <CardTitle className="text-lg font-bold flex items-center gap-2">
                 <Activity className="size-5 text-primary" />
                 Đối tác đang hoạt động
               </CardTitle>
               <div className="relative w-full max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100 border-none text-sm focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Tìm tên shop, subdomain..." />
               </div>
             </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-b border-slate-100">
                  <TableHead className="px-8 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Cửa hàng</TableHead>
                  <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">Gói & Trạng thái</TableHead>
                  <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">Tài nguyên</TableHead>
                  <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">Hạn dùng</TableHead>
                  <TableHead className="text-right pr-8 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((t) => (
                  <TableRow key={t.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                    <TableCell className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{t.name}</span>
                        <span className="text-xs text-slate-400 font-mono tracking-tight">{t.slug}.mypos.vn</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5">
                        <Badge className={`w-fit font-bold uppercase text-[9px] px-2 py-0.5 rounded-full ${
                          t.subscriptionPlan === "professional" ? "bg-purple-500/10 text-purple-600 border-purple-500/20" :
                          t.subscriptionPlan === "pro" ? "bg-primary/10 text-primary border-primary/20" :
                          t.subscriptionPlan === "basic" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                          "bg-slate-500/10 text-slate-600 border-slate-500/20"
                        }`}>
                          {t.subscriptionPlan}
                        </Badge>
                        <span className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="size-2.5" /> Active
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                             <Package className="size-3 text-slate-400" /> {t._count.products} SP
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                             <Users className="size-3 text-slate-400" /> {t._count.users} Users
                          </div>
                       </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-800">
                          {format(t.subscriptionExpiresAt || t.trialExpiresAt, "dd/MM/yyyy")}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                           <Clock className="size-2.5" />
                           {Math.ceil((new Date(t.subscriptionExpiresAt || t.trialExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} ngày
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                       <TenantActions 
                         tenantId={t.id} 
                         active={t.active} 
                         currentPlan={t.subscriptionPlan} 
                         slug={t.slug} 
                       />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Sidebar Info */}
        <div className="space-y-8">
           <Card className="border-none shadow-xl shadow-slate-200/60 rounded-3xl bg-slate-900 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Zap className="size-32 rotate-12" />
              </div>
              <CardContent className="p-8 space-y-4 relative z-10">
                <h3 className="text-lg font-black leading-tight">Yêu cầu hỗ trợ mới</h3>
                <p className="text-slate-400 text-xs">Hiện có 3 đối tác đang cần hỗ trợ kỹ thuật về mẫu in và nhập kho.</p>
                <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-bold py-6">
                   Xem yêu cầu
                </Button>
              </CardContent>
           </Card>

           <Card className="border-none shadow-xl shadow-slate-200/60 rounded-3xl bg-white overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <AlertCircle className="size-4 text-amber-500" />
                  Sắp hết hạn (7 ngày)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y divide-slate-50">
                    {tenants.slice(0, 3).map((t, i) => (
                      <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-900">{t.name}</span>
                          <span className="text-[10px] text-slate-400">{t.slug}</span>
                        </div>
                        <Badge variant="outline" className="text-[9px] border-amber-200 text-amber-600 bg-amber-50">3 ngày</Badge>
                      </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend, color }: { icon: React.ReactNode, label: string, value: number | string, trend: string, color: string }) {
  return (
    <Card className="border-none shadow-xl shadow-slate-200/60 rounded-3xl bg-white p-6 hover:-translate-y-1 transition-all duration-300">
      <div className="flex flex-col gap-4">
        <div className={`size-12 rounded-2xl ${color} flex items-center justify-center text-xl`}>
          {icon}
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
          </div>
          <p className="text-[10px] font-bold text-slate-500 mt-2 flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-slate-300" />
            {trend}
          </p>
        </div>
      </div>
    </Card>
  );
}

function Package({ className, ...props }: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
      <path d="M12 22V12" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22 4.05 17.42" />
      <path d="M12 12 20.05 7.42" />
    </svg>
  );
}
