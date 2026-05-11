import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, TrendingUp, Users, DollarSign, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { getPlan } from "@/lib/plans";
import { formatDate } from "@/lib/format";

export default async function SubscriptionsPage() {
  const tenants = await prisma.tenant.findMany();
  
  const stats = {
    totalRevenue: tenants.reduce((acc, t) => acc + (getPlan(t.subscriptionPlan).price), 0),
    planCounts: {
      trial: tenants.filter(t => t.subscriptionPlan === "trial").length,
      basic: tenants.filter(t => t.subscriptionPlan === "basic").length,
      pro: tenants.filter(t => t.subscriptionPlan === "pro").length,
      professional: tenants.filter(t => t.subscriptionPlan === "professional").length,
    }
  };

  const upcomingRenewals = tenants
    .filter(t => t.subscriptionExpiresAt)
    .sort((a, b) => new Date(a.subscriptionExpiresAt!).getTime() - new Date(b.subscriptionExpiresAt!).getTime())
    .slice(0, 5);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gói dịch vụ & Doanh thu</h1>
        <p className="text-slate-500 font-medium">Theo dõi tình hình kinh doanh của toàn bộ hệ thống.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<DollarSign className="size-6 text-emerald-600" />} 
          label="Tổng doanh thu tháng" 
          value={`${stats.totalRevenue.toLocaleString()}đ`} 
          trend="+12.5%" 
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard 
          icon={<Users className="size-6 text-blue-600" />} 
          label="Thuê bao trả phí" 
          value={stats.planCounts.basic + stats.planCounts.pro + stats.planCounts.professional} 
          trend="+3" 
          color="bg-blue-50 text-blue-600"
        />
        <StatCard 
          icon={<Activity className="size-6 text-purple-600" />} 
          label="Gói dùng thử" 
          value={stats.planCounts.trial} 
          trend="-2" 
          color="bg-purple-50 text-purple-600"
        />
        <StatCard 
          icon={<TrendingUp className="size-6 text-amber-600" />} 
          label="Tỷ lệ chuyển đổi" 
          value="8.2%" 
          trend="+1.2%" 
          color="bg-amber-50 text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-black text-slate-900">Danh sách Cửa hàng & Gói dịch vụ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tenants.map((tenant) => (
                <div key={tenant.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                       <CreditCard className="size-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{tenant.name}</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{tenant.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <Badge className={`rounded-full px-3 py-1 font-black text-[10px] border-none ${
                      tenant.subscriptionPlan === "professional" ? "bg-purple-500" : 
                      tenant.subscriptionPlan === "pro" ? "bg-blue-500" : "bg-slate-500"
                    }`}>
                      {getPlan(tenant.subscriptionPlan).name}
                    </Badge>
                    <p className="text-sm font-black text-slate-900 min-w-[100px] text-right">
                      {getPlan(tenant.subscriptionPlan).price.toLocaleString()}đ/th
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-black text-slate-900">Gia hạn sắp tới</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {upcomingRenewals.map((tenant) => (
                <div key={tenant.id} className="flex items-start gap-4">
                  <div className="size-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-bold text-slate-900 leading-none">{tenant.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                       Hết hạn: {formatDate(tenant.subscriptionExpiresAt!)}
                    </p>
                  </div>
                </div>
              ))}
              {upcomingRenewals.length === 0 && (
                <p className="text-center text-slate-400 font-medium py-8 italic">Không có kỳ gia hạn nào sắp tới.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend, color }: { icon: React.ReactNode, label: string, value: string | number, trend: string, color: string }) {
  return (
    <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl bg-white p-6 hover:-translate-y-1 transition-all duration-300">
      <div className="flex flex-col gap-4">
        <div className={`size-12 rounded-2xl ${color} flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-2xl font-black text-slate-900 tracking-tight leading-none">{value}</p>
            <span className={`text-[10px] font-bold ${trend.startsWith("+") ? "text-emerald-500" : "text-rose-500"}`}>
               {trend}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
