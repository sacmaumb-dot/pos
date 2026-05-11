import { cookies } from "next/headers";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { getPlan } from "./plans";
import { cache } from "react";
import { nanoid } from "nanoid";

const SESSION_COOKIE = "shop_session_token";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  isSuperAdmin: boolean;
};

export async function login(
  email: string,
  password: string,
  metadata?: { userAgent: string | null; ipAddress: string | null; tenantSlug: string | null }
): Promise<SessionUser | null | string> {
  const user = await prisma.user.findUnique({ 
    where: { email },
    include: { tenant: true }
  });
  
  if (!user || !user.active) return null;
  
  // Security: Ensure user is logging into their own tenant subdomain
  if (metadata?.tenantSlug && user.tenant.slug !== metadata.tenantSlug && !user.isSuperAdmin) {
    return "Tài khoản không thuộc cửa hàng này.";
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return null;

  // Device Limit Check
  const plan = getPlan(user.tenant.subscriptionPlan);
  const activeSessionCount = await prisma.session.count({
    where: { tenantId: user.tenantId }
  });

  if (activeSessionCount >= plan.maxDevices) {
    return `Gói ${plan.name} giới hạn ${plan.maxDevices} thiết bị đăng nhập đồng thời. Vui lòng đăng xuất ở thiết bị khác.`;
  }

  // Create Database Session
  const token = nanoid(32);
  await prisma.session.create({
    data: {
      token,
      userId: user.id,
      tenantId: user.tenantId,
      userAgent: metadata?.userAgent,
      ipAddress: metadata?.ipAddress,
    }
  });

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { 
      lastLoginAt: new Date(),
      lastIp: metadata?.ipAddress,
      userAgent: metadata?.userAgent
    }
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tenantId: user.tenantId,
    isSuperAdmin: user.isSuperAdmin,
  };
}

export async function logout() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }
  cookieStore.delete(SESSION_COOKIE);
}

export const getSession = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  
  const dbSession = await prisma.session.findUnique({
    where: { token },
    include: { user: true }
  });

  if (!dbSession || !dbSession.user.active) return null;

  // Update last seen (optional, for real-time tracking)
  // await prisma.session.update({ where: { id: dbSession.id }, data: { lastSeen: new Date() } });

  return {
    id: dbSession.user.id,
    email: dbSession.user.email,
    name: dbSession.user.name,
    role: dbSession.user.role,
    tenantId: dbSession.user.tenantId,
    isSuperAdmin: dbSession.user.isSuperAdmin,
  };
});

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
