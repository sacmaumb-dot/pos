import { getTenantFromHeader } from "@/lib/settings";
import { getPlan } from "@/lib/plans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CreditCard, Zap, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { UpgradeButton } from "./upgrade-button";

export default async function SubscriptionPage() {
  const tenant = await getTenantFromHeader();
  if (!tenant) return null;

  const plan = getPlan(tenant.subscriptionPlan);
  const now = new Date();
  
  // Get current usage
  const productCount = await prisma.product.count({ where: { tenantId: tenant.id } });
  const userCount = await prisma.user.count({ where: { tenantId: tenant.id } });
  const customerCount = await prisma.customer.count({ where: { tenantId: tenant.id } });

  const isTrial = tenant.subscriptionPlan === "trial";
  const trialDaysLeft = Math.ceil((new Date(tenant.trialExpiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const expiryDate = tenant.subscriptionExpiresAt ? new Date(tenant.subscriptionExpiresAt) : new Date(tenant.trialExpiresAt);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-primary/5 via-blue-500/5 to-transparent p-6 rounded-2xl border border-border/50">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="size-6 text-primary" />
            Gói dịch vụ & Đăng ký
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý gói dịch vụ, hạn sử dụng và theo dõi hạn mức tài nguyên của bạn.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Plan Info */}
        <Card className="lg:col-span-2 border border-border/80 shadow-lg rounded-xl overflow-hidden bg-card/65 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-primary/5 via-blue-500/5 to-transparent border-b border-border/60">
            <div className="flex items-center justify-between">
               <CardTitle className="text-base font-bold flex items-center gap-2.5">
                  <Zap className="size-4 text-primary" />
                  Gói hiện tại: <span className="text-primary">{plan.name}</span>
               </CardTitle>
               <Badge variant={isTrial ? "secondary" : "default"} className="font-bold">
                 {isTrial ? `Còn ${trialDaysLeft} ngày dùng thử` : "Đang hoạt động"}
               </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-l-2 border-primary pl-2">Thông tin hạn dùng</h3>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/50">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Clock className="size-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Hết hạn vào ngày</p>
                      <p className="text-sm font-black text-foreground">
                        {format(expiryDate, "dd 'tháng' MM, yyyy", { locale: vi })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 pt-2">
                    <p className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="size-3 text-green-500" />
                      Tính năng bao gồm:
                    </p>
                    <ul className="grid grid-cols-1 gap-2">
                      {plan.features.map((f, i) => (
                        <li key={i} className="text-[13px] text-slate-600 flex items-center gap-2">
                          <div className="size-1.5 rounded-full bg-primary/40" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
               </div>

               <div className="space-y-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-l-2 border-primary pl-2">Sử dụng tài nguyên</h3>
                  
                  <UsageItem 
                    label="Sản phẩm" 
                    current={productCount} 
                    max={plan.maxProducts} 
                  />
                  <UsageItem 
                    label="Nhân viên (Tài khoản)" 
                    current={userCount} 
                    max={plan.maxUsers} 
                  />
                  <UsageItem 
                    label="Khách hàng" 
                    current={customerCount} 
                    max={plan.maxCustomers} 
                  />
               </div>
            </div>

            <div className="pt-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
               <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="size-4 shrink-0" />
                  <p className="text-xs font-medium">Bạn có muốn mở rộng hạn mức hoặc thêm tính năng chuyên sâu?</p>
               </div>
               <UpgradeButton 
                  plan="pro" 
                  label="Gói Pro" 
                  currentPlan={tenant.subscriptionPlan} 
               />
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Options Preview */}
        <div className="space-y-6">
           <Card className="border border-border/80 shadow-md rounded-xl bg-primary text-primary-foreground overflow-hidden">
             <CardContent className="p-6 space-y-4">
               <div className="size-12 rounded-2xl bg-white/20 flex items-center justify-center">
                 <Zap className="size-6 fill-current" />
               </div>
               <h3 className="text-xl font-black leading-tight">Gói Chuyên Nghiệp</h3>
               <p className="text-sm text-white/80">
                 Không giới hạn sản phẩm, khách hàng. Quản lý chuỗi cửa hàng và hỗ trợ ưu tiên.
               </p>
               <div className="pt-2 pb-4">
                  <div className="text-2xl font-black">150.000 đ <span className="text-sm font-medium opacity-70">/ tháng</span></div>
               </div>
               <UpgradeButton 
                  plan="professional" 
                  label="Chuyên Nghiệp" 
                  currentPlan={tenant.subscriptionPlan} 
               />
             </CardContent>
           </Card>

           <div className="rounded-2xl border border-dashed border-border p-6 text-center space-y-3 bg-muted/20">
              <p className="text-xs font-medium text-muted-foreground">Cần tư vấn gói giải pháp riêng cho chuỗi cửa hàng lớn?</p>
              <Button variant="outline" className="w-full rounded-xl border-primary/30 text-primary font-bold">
                 Liên hệ hỗ trợ 24/7
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}

function UsageItem({ label, current, max }: { label: string; current: number; max: number }) {
  const percentage = Math.min((current / max) * 100, 100);
  const isNearLimit = percentage > 80;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-[13px] font-bold text-slate-700">{label}</span>
        <span className="text-xs font-mono text-muted-foreground">
          <span className={isNearLimit ? "text-amber-600 font-bold" : "text-foreground font-bold"}>{current}</span>
          / {max >= 9999 ? "∞" : max}
        </span>
      </div>
      <Progress 
        value={percentage} 
        className="h-1.5 bg-muted" 
        indicatorClassName={isNearLimit ? "bg-amber-500" : "bg-primary"}
      />
    </div>
  );
}
