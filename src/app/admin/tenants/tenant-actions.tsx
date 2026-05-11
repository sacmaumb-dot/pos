"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from "@/components/ui/dropdown-menu";
import { MoreVertical, ShieldAlert, ShieldCheck, CreditCard, ExternalLink, Loader2 } from "lucide-react";
import { toggleTenantStatus, updateTenantPlan } from "./actions";
import { toast } from "sonner";

export function TenantActions({ tenantId, active, currentPlan, slug }: { tenantId: string, active: boolean, currentPlan: string, slug: string }) {
  const [pending, startTransition] = useTransition();

  const handleToggleStatus = () => {
    startTransition(async () => {
      const res = await toggleTenantStatus(tenantId, active);
      if (res.ok) {
        toast.success(active ? "Đã khóa cửa hàng" : "Đã kích hoạt cửa hàng");
      } else {
        toast.error("Lỗi: " + res.error);
      }
    });
  };

  const handleUpdatePlan = (plan: string) => {
    startTransition(async () => {
      const res = await updateTenantPlan(tenantId, plan);
      if (res.ok) {
        toast.success("Đã cập nhật gói dịch vụ: " + plan);
      } else {
        toast.error("Lỗi: " + res.error);
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        render={
          <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <MoreVertical className="size-4" />}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-slate-100 shadow-xl">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2">Quản lý Shop</DropdownMenuLabel>
          
          <DropdownMenuItem 
            className="rounded-xl px-3 py-2.5 gap-3 font-bold cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => window.open(`http://${slug}.localhost:3000`, "_blank")}
          >
            <ExternalLink className="size-4 text-slate-400" />
            Truy cập Shop
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-slate-50" />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="rounded-xl px-3 py-2.5 gap-3 font-bold cursor-pointer hover:bg-slate-50 transition-colors">
            <CreditCard className="size-4 text-slate-400" />
            Thay đổi gói
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="rounded-2xl p-2 border-slate-100 shadow-xl ml-2">
            <DropdownMenuItem 
              className={`rounded-xl px-3 py-2 font-bold cursor-pointer ${currentPlan === 'basic' ? 'bg-primary/5 text-primary' : ''}`}
              onClick={() => handleUpdatePlan('basic')}
            >
              Gói Cơ bản
            </DropdownMenuItem>
            <DropdownMenuItem 
              className={`rounded-xl px-3 py-2 font-bold cursor-pointer ${currentPlan === 'pro' ? 'bg-primary/5 text-primary' : ''}`}
              onClick={() => handleUpdatePlan('pro')}
            >
              Gói Pro
            </DropdownMenuItem>
            <DropdownMenuItem 
              className={`rounded-xl px-3 py-2 font-bold cursor-pointer ${currentPlan === 'professional' ? 'bg-primary/5 text-primary' : ''}`}
              onClick={() => handleUpdatePlan('professional')}
            >
              Gói Chuyên nghiệp
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem 
          className={`rounded-xl px-3 py-2.5 gap-3 font-bold cursor-pointer transition-colors mt-1 ${active ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
          onClick={handleToggleStatus}
        >
          {active ? (
            <>
              <ShieldAlert className="size-4" />
              Khóa cửa hàng
            </>
          ) : (
            <>
              <ShieldCheck className="size-4" />
              Mở khóa cửa hàng
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
