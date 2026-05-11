import { prisma } from "./prisma";

type CreateInput = {
  tenantId: string;
  userId: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
};

export async function createNotification(input: CreateInput) {
  if (!input.userId || !input.tenantId) return;
  try {
    // Defense-in-depth: ensure the recipient actually belongs to the caller's
    // tenant before writing the notification. Without this check a server
    // action could be coerced into creating a notification for a user of
    // another tenant by passing a guessed userId.
    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      select: { tenantId: true },
    });
    if (!user || user.tenantId !== input.tenantId) {
      return;
    }
    await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body || null,
        link: input.link || null,
      },
    });
  } catch (e) {
    console.error("createNotification failed", e);
  }
}

export async function notifyAdmins(
  input: Omit<CreateInput, "userId">,
) {
  if (!input.tenantId) return;
  const admins = await prisma.user.findMany({
    where: { role: "admin", active: true, tenantId: input.tenantId },
    select: { id: true },
  });
  await Promise.all(
    admins.map((u) =>
      createNotification({ ...input, userId: u.id }).catch(() => null),
    ),
  );
}
