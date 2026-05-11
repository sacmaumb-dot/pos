import { prisma } from "@/lib/prisma";
import { AnnouncementForm } from "./announcement-form";
import { Megaphone } from "lucide-react";

export default async function AnnouncementsPage() {
  const adminCount = await prisma.user.count({ where: { role: "admin" } });

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Megaphone className="size-8 text-primary" />
          Thông báo Hệ thống
        </h1>
        <p className="text-slate-500 font-medium">Gửi tin nhắn broadcast đến tất cả chủ cửa hàng trên toàn nền tảng.</p>
      </div>

      <AnnouncementForm adminCount={adminCount} />
    </div>
  );
}
