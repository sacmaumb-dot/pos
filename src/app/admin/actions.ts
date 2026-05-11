"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function broadcastNotification(data: { title: string; body: string; type: string }) {
  try {
    const session = await getSession();
    if (!session || !session.isSuperAdmin) throw new Error("Unauthorized");

    // Get all shop owners (admins) in the system
    const users = await prisma.user.findMany({ 
      where: { role: "admin" },
      select: { id: true } 
    });

    // Create notifications for admins
    await prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        title: data.title,
        body: data.body,
        type: data.type || "system_announcement",
      })),
    });

    return { ok: true, recipientCount: users.length };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Không thể gửi thông báo" };
  }
}

export async function updateSystemSettings(data: { 
  maintenanceMode: boolean; 
  allowSignup: boolean;
  platformName: string;
  supportEmail: string;
}) {
  try {
    const session = await getSession();
    if (!session || !session.isSuperAdmin) throw new Error("Unauthorized");

    await prisma.systemSetting.upsert({
      where: { id: "global" },
      update: data,
      create: { id: "global", ...data },
    });

    revalidatePath("/admin/settings");
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Không thể cập nhật cài đặt" };
  }
}
