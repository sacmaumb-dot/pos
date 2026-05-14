import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { SettingsForm } from "./settings-form";

import { Settings } from "lucide-react";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/");
  const settings = await getSettings();

  return (
    <div className="space-y-6 pb-12">
      {/* Header section matched with Customers style */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-br from-primary/10 via-background to-background p-8 rounded-[2rem] border border-border/60 shadow-sm mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
              <Settings className="size-6" />
            </div>
            Cấu hình hệ thống
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium ml-1">
            Quản lý nhận diện thương hiệu, phương thức thanh toán và các thông số vận hành cốt lõi.
          </p>
        </div>
      </div>
      <SettingsForm initial={settings} />
    </div>
  );
}
