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
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-primary/5 via-blue-500/5 to-transparent p-6 rounded-2xl border border-border/50">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Settings className="size-6 text-primary" />
            Cài đặt cửa hàng
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Cấu hình thông tin thương hiệu, giao diện, in ấn và các thông số vận hành.
          </p>
        </div>
      </div>
      <SettingsForm initial={settings} />
    </div>
  );
}
