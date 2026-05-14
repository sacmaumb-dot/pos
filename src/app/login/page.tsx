import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { Laptop, Smartphone, Wrench } from "lucide-react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSettings } from "@/lib/settings";

export default async function LoginPage() {
  const user = await getSession();
  
  // If already logged in, go to dashboard
  if (user) {
    redirect("/pos");
  }

  const settings = await getSettings();
  const shopName = settings.shopName || "MyPOS";

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary via-primary to-blue-700 p-12 text-primary-foreground">
        <div className="flex items-center gap-2 text-2xl font-bold">
          <div className="size-10 rounded-xl bg-white/15 flex items-center justify-center">
            <Laptop className="size-6" />
          </div>
          {shopName}
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Hệ thống quản lý cửa hàng
            <br />
            {settings.shopTagline || "Laptop & Điện thoại"}
          </h1>
          <p className="text-lg text-white/80 max-w-md">
            Quản lý bán hàng, sửa chữa, dịch vụ, kho hàng và khách hàng
            chuyên nghiệp trong một nơi duy nhất.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4 max-w-md">
            <Feature icon={<Smartphone className="size-5" />} label="POS" />
            <Feature icon={<Wrench className="size-5" />} label="Sửa chữa" />
            <Feature icon={<Laptop className="size-5" />} label="Kho hàng" />
          </div>
        </div>
        <p className="text-sm text-white/60">
          © {new Date().getFullYear()} {shopName}. All rights reserved.
        </p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-2 text-2xl font-bold text-primary">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Laptop className="size-6" />
            </div>
            {shopName}
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              Đăng nhập
            </h2>
            <p className="text-muted-foreground text-sm">
              Truy cập vào hệ thống quản lý của {shopName}.
            </p>
          </div>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
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
