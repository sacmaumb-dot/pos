import { prisma } from "./prisma";

type CreateInput = {
  userId: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
};

export async function createNotification(input: CreateInput) {
  if (!input.userId) return;
  try {
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

export async function notifyAdmins(input: Omit<CreateInput, "userId">) {
  const admins = await prisma.user.findMany({
    where: { role: "admin", active: true },
    select: { id: true },
  });
  await Promise.all(
    admins.map((u) =>
      createNotification({ ...input, userId: u.id }).catch(() => null),
    ),
  );
}
