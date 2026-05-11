import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BlockedPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="size-24 rounded-3xl bg-rose-500/20 flex items-center justify-center text-rose-500">
            <ShieldAlert className="size-12" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-4xl font-black text-white tracking-tight">Cửa hàng đã bị khóa</h1>
          <p className="text-slate-400 font-medium">
            Truy cập của bạn vào cửa hàng này đã bị tạm dừng bởi quản trị viên hệ thống. 
            Vui lòng liên hệ bộ phận hỗ trợ nếu có thắc mắc.
          </p>
        </div>

        <div className="pt-8">
          <Button asChild variant="outline" className="rounded-2xl font-black px-8 py-6 h-auto text-white border-white/20 hover:bg-white/5">
            <Link href="/">Quay lại trang chủ</Link>
          </Button>
        </div>
        
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
          © 2024 MyPOS SaaS Platform
        </p>
      </div>
    </div>
  );
}
