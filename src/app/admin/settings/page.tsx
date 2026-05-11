import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./settings-form";

export default async function AdminSettingsPage() {
  const settings = await prisma.systemSetting.findUnique({ where: { id: "global" } });
  
  const initialData = {
    maintenanceMode: settings?.maintenanceMode ?? false,
    allowSignup: settings?.allowSignup ?? true,
    platformName: settings?.platformName ?? "MyPOS SaaS",
    supportEmail: settings?.supportEmail ?? "support@mypos.vn",
  };

  return (
    <div className="p-8 space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Cài đặt hệ thống</h1>
        <p className="text-slate-500 font-medium">Cấu hình tham số toàn cục cho nền tảng MyPOS.</p>
      </div>

      <SettingsForm initialData={initialData} />
    </div>
  );
}
