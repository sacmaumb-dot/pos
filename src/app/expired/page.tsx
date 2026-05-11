import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CreditCard, MessageSquare, ArrowLeft } from "lucide-react";
import { logoutAction } from "@/app/(app)/actions";

export default function ExpiredPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <div className="size-20 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 animate-pulse">
            <AlertTriangle className="size-10" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Gói dùng thử đã hết hạn</h1>
          <p className="text-slate-600">
            Cảm ơn bạn đã trải nghiệm 14 ngày dùng thử MyPOS. Để tiếp tục sử dụng hệ thống, vui lòng kích hoạt gói dịch vụ chính thức.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Button className="h-12 text-base font-bold rounded-xl shadow-xl shadow-primary/20">
            <CreditCard className="mr-2 size-5" />
            Nâng cấp gói dịch vụ ngay
          </Button>
          
          <Button variant="outline" className="h-12 text-base font-bold rounded-xl border-slate-200">
            <MessageSquare className="mr-2 size-5" />
            Liên hệ hỗ trợ 24/7
          </Button>
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col items-center gap-4">
           <p className="text-xs text-muted-foreground italic">
             Mọi dữ liệu của bạn vẫn được lưu giữ an toàn trong 30 ngày tới.
           </p>
           
           <form action={logoutAction}>
             <Button variant="ghost" type="submit" className="text-sm text-slate-500 hover:text-primary">
               <ArrowLeft className="mr-2 size-4" />
               Đăng xuất
             </Button>
           </form>
        </div>
      </div>
    </div>
  );
}
