import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Store, Calendar, Users, Package, MoreVertical, Search, Filter, ShieldCheck, ShieldAlert } from "lucide-react";
import { formatDate } from "@/lib/format";
import { getPlan } from "@/lib/plans";
import { Input } from "@/components/ui/input";

import { TenantActions } from "./tenant-actions";
import { CreateTenantDialog } from "./create-tenant-dialog";

export default async function TenantsPage() {
  const tenants = await prisma.tenant.findMany({
    include: {
      _count: {
        select: {
          users: true,
          products: true,
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Quản lý Cửa hàng</h1>
          <p className="text-slate-500 font-medium">Danh sách tất cả các shop trong hệ thống.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input placeholder="Tìm kiếm shop..." className="pl-10 w-64 rounded-xl border-slate-200 bg-white" />
          </div>
          <Button variant="outline" className="rounded-xl h-10 px-4 gap-2 font-bold border-slate-200">
            <Filter className="size-4" /> Lọc
          </Button>
          <CreateTenantDialog />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tenants.map((tenant) => {
          const plan = getPlan(tenant.subscriptionPlan);
          const isExpired = tenant.subscriptionExpiresAt && new Date(tenant.subscriptionExpiresAt) < new Date();
          const isTrial = tenant.subscriptionPlan === "trial";

          return (
            <Card key={tenant.id} className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white hover:ring-2 hover:ring-primary/20 transition-all group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="size-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <Store className="size-7" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-slate-900 leading-none">{tenant.name}</h3>
                        <Badge variant="outline" className="rounded-full text-[10px] font-bold border-slate-100 bg-slate-50 text-slate-500 py-0 uppercase">
                          {tenant.slug}.localhost
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400 font-bold">
                        <span className="flex items-center gap-1"><Users className="size-3" /> {tenant._count.users} Nhân viên</span>
                        <span className="flex items-center gap-1"><Package className="size-3" /> {tenant._count.products} Sản phẩm</span>
                        <span className="flex items-center gap-1"><Calendar className="size-3" /> Tham gia {formatDate(tenant.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gói dịch vụ</p>
                       <div className="flex items-center justify-end gap-2 mt-1">
                          <Badge className={`rounded-full px-3 py-1 font-black text-[10px] border-none shadow-sm ${
                            tenant.subscriptionPlan === "professional" ? "bg-purple-500" : 
                            tenant.subscriptionPlan === "pro" ? "bg-blue-500" : "bg-slate-500"
                          }`}>
                            {plan.name}
                          </Badge>
                          {isTrial && <Badge className="bg-amber-500 rounded-full text-[10px] font-black border-none px-3 py-1">TRIAL</Badge>}
                       </div>
                       <p className="text-[10px] font-bold text-slate-400 mt-1">
                         Hết hạn: {tenant.subscriptionExpiresAt 
                           ? formatDate(tenant.subscriptionExpiresAt) 
                           : (tenant.subscriptionPlan === "trial" 
                              ? formatDate(tenant.trialExpiresAt) 
                              : "Không thời hạn")}
                       </p>
                    </div>

                    <div className="flex items-center gap-2">
                       {tenant.active ? (
                         <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50 font-bold gap-1 px-3 py-1.5 rounded-xl shadow-none">
                            <ShieldCheck className="size-3.5" /> Hoạt động
                         </Badge>
                       ) : (
                         <Badge className="bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-50 font-bold gap-1 px-3 py-1.5 rounded-xl shadow-none">
                            <ShieldAlert className="size-3.5" /> Bị khóa
                         </Badge>
                       )}
                       <TenantActions 
                         tenantId={tenant.id} 
                         active={tenant.active} 
                         currentPlan={tenant.subscriptionPlan} 
                         slug={tenant.slug} 
                       />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
