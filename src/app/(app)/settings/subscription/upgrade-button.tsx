"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { upgradePlan } from "./actions";
import { toast } from "sonner";
import { Loader2, Zap, CheckCircle2, ShieldCheck, Rocket, Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PLAN_DETAILS: Record<string, any> = {
  basic: {
    icon: Rocket,
    color: "text-blue-500",
    bg: "bg-blue-50",
    price: 199000,
    features: ["Quản lý 1 chi nhánh", "Tối đa 500 sản phẩm", "Báo cáo cơ bản"]
  },
  pro: {
    icon: ShieldCheck,
    color: "text-indigo-500",
    bg: "bg-indigo-50",
    price: 499000,
    features: ["Quản lý 3 chi nhánh", "Sản phẩm không giới hạn", "Tùy biến mẫu in", "Báo cáo chuyên sâu"]
  },
  professional: {
    icon: Crown,
    color: "text-amber-500",
    bg: "bg-amber-50",
    price: 999000,
    features: ["Chi nhánh không giới hạn", "Tùy biến mẫu in", "Hỗ trợ ưu tiên 24/7", "Đào tạo 1-1"]
  }
};

export function UpgradeButton({ plan, label, currentPlan }: { plan: string, label: string, currentPlan: string }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [months, setMonths] = useState("1");
  const router = useRouter();

  const details = PLAN_DETAILS[plan];
  const totalPrice = (details?.price || 0) * parseInt(months);

  const handleUpgrade = async () => {
    if (plan === currentPlan) {
      toast.info("Bạn đang sử dụng gói này rồi.");
      return;
    }
    
    setLoading(true);
    const res = await upgradePlan(plan, parseInt(months));
    setLoading(false);
    
    if (res.ok) {
      toast.success(`Chúc mừng! Bạn đã nâng cấp lên gói ${label} thành công.`);
      setOpen(false);
      router.refresh();
    } else {
      toast.error(res.error || "Có lỗi xảy ra.");
    }
  };

  if (plan === currentPlan) {
    return (
      <Button disabled className="w-full font-bold rounded-xl bg-slate-100 text-slate-500 border-none">
        Đang sử dụng
      </Button>
    );
  }

  const PlanIcon = details?.icon || Zap;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button 
            className={plan === "professional" ? "w-full font-bold rounded-xl shadow-lg shadow-amber-500/20" : "w-full font-bold rounded-xl"}
            variant={plan === "professional" ? "default" : "outline"}
          />
        }
      >
        <Zap className="mr-2 size-4" />
        Nâng cấp {label}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] rounded-[24px]">
        <DialogHeader className="items-center text-center">
          <div className={`size-16 rounded-2xl ${details?.bg} flex items-center justify-center mb-4`}>
            <PlanIcon className={`size-8 ${details?.color}`} />
          </div>
          <DialogTitle className="text-2xl font-black">Nâng cấp lên {label}</DialogTitle>
          <DialogDescription>
            Trải nghiệm toàn bộ tính năng cao cấp cho doanh nghiệp của bạn.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Tính năng nổi bật</h4>
            <ul className="space-y-2">
              {details?.features.map((f: string) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold">Thời hạn đăng ký</label>
              <Select value={months} onValueChange={setMonths}>
                <SelectTrigger className="w-[140px] rounded-xl bg-white">
                  <SelectValue placeholder="Chọn thời hạn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Tháng</SelectItem>
                  <SelectItem value="3">3 Tháng (Tiết kiệm 5%)</SelectItem>
                  <SelectItem value="6">6 Tháng (Tiết kiệm 10%)</SelectItem>
                  <SelectItem value="12">12 Tháng (Tiết kiệm 20%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <span className="text-sm text-slate-500">Tổng thanh toán:</span>
              <div className="text-right">
                <div className="text-xl font-black text-blue-600">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}
                </div>
                <div className="text-[10px] text-slate-400">Gia hạn sau {months} tháng</div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-3">
          <Button 
            onClick={handleUpgrade} 
            disabled={loading}
            className="w-full h-12 rounded-xl font-bold text-base shadow-lg shadow-blue-500/20"
          >
            {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Rocket className="mr-2 size-4" />}
            Xác nhận nâng cấp ngay
          </Button>
          <p className="text-[10px] text-center text-slate-400 px-6 leading-relaxed">
            Bằng cách xác nhận, bạn đồng ý với Điều khoản dịch vụ và Chính sách thanh toán của MyPOS.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
