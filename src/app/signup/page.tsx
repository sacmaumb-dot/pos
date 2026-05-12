import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import SignupForm from "./signup-form";
import { Laptop, Smartphone, Wrench, ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Đăng ký dùng thử MyPOS - Quản lý cửa hàng Laptop & Điện thoại",
  description: "Trải nghiệm 7 ngày dùng thử miễn phí đầy đủ tính năng quản lý bán hàng và sửa chữa chuyên nghiệp.",
};

export default async function SignupPage() {
  // Respect SystemSetting.allowSignup at render time, in addition to the
  // server-action check in actions.ts. This prevents the form from even
  // being shown when signup is disabled, but the action enforces it again
  // on submit (defense in depth) since the form is reachable directly.
  const systemSetting = await prisma.systemSetting.findUnique({
    where: { id: "global" },
  });
  if (systemSetting && systemSetting.allowSignup === false) {
    redirect("/login");
  }
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel - branding */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary via-primary to-blue-700 p-12 text-primary-foreground relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 size-80 rounded-full bg-white/5" />
        <div className="absolute bottom-10 -left-10 size-60 rounded-full bg-white/5" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
            <div className="size-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Laptop className="size-6" />
            </div>
            MyPOS
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Khởi tạo cửa hàng
            <br />
            chỉ trong 30 giây
          </h1>
          <p className="text-lg text-white/80 max-w-md">
            Đăng ký và sử dụng ngay — không cần thẻ tín dụng, không cần cài đặt phức tạp.
            Dùng thử miễn phí 7 ngày đầy đủ tính năng.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4 max-w-md">
            <Feature icon={<Smartphone className="size-5" />} label="POS Bán hàng" />
            <Feature icon={<Wrench className="size-5" />} label="Sửa chữa" />
            <Feature icon={<Laptop className="size-5" />} label="Quản lý kho" />
          </div>
        </div>

        <p className="text-sm text-white/60 relative z-10">
          © {new Date().getFullYear()} MyPOS. All rights reserved.
        </p>
      </div>

      {/* Right panel - form */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-gradient-to-b from-slate-50 to-white">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-2 text-2xl font-bold text-primary">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Laptop className="size-6" />
            </div>
            MyPOS
          </div>
          <div className="space-y-2">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1 font-medium transition-colors mb-4">
              <ArrowLeft className="size-3" />
              Về trang chủ
            </Link>
            <h2 className="text-2xl font-bold tracking-tight">Bắt đầu dùng thử miễn phí</h2>
            <p className="text-muted-foreground text-sm">
              Sở hữu hệ thống quản lý cửa hàng & sửa chữa chuyên nghiệp trong 30 giây.
            </p>
          </div>
          <SignupForm />
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="rounded-xl bg-white/10 backdrop-blur p-4 text-center space-y-2">
      <div className="mx-auto size-10 rounded-lg bg-white/15 flex items-center justify-center">
        {icon}
      </div>
      <div className="text-sm font-medium">{label}</div>
    </div>
  );
}
