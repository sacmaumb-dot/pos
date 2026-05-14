"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  const user = await requireSession();
  const items = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  const unread = await prisma.notification.count({
    where: { userId: user.id, read: false },
  });
  return {
    ok: true as const,
    unread,
    items: items.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      link: n.link,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    })),
  };
}

export async function markNotificationRead(id: string) {
  const user = await requireSession();
  await prisma.notification.updateMany({
    where: { id, userId: user.id },
    data: { read: true },
  });
  revalidatePath("/");
  return { ok: true as const };
}

export async function markAllNotificationsRead() {
  const user = await requireSession();
  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });
  revalidatePath("/");
  return { ok: true as const };
}
