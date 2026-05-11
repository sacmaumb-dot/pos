import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getTenantPrismaServer } from "@/lib/prisma";
import { headers } from "next/headers";
import { getSettings, getTenantFromHeader } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) redirect("/login");

  // Multi-tenant SaaS subscription check
  const headersList = await headers();
  const slug = headersList.get("x-tenant-slug");
  const tenant = await getTenantFromHeader();

  // If a subdomain is used but no tenant is found, it's an invalid subdomain
  if (slug && !tenant) {
    const isLocalhost = headersList.get("host")?.includes("localhost");
    const rootDomain = isLocalhost ? "http://localhost:3000" : "https://mypos.vn";
    redirect(rootDomain);
  }

  // GLOBAL MAINTENANCE & BLOCKED TENANT CHECK
  const systemSettings = await (await import("@/lib/prisma")).prisma.systemSetting.findUnique({ where: { id: "global" } });
  if (systemSettings?.maintenanceMode && !user.isSuperAdmin) {
    redirect("/maintenance");
  }

  if (tenant && !tenant.active && !user.isSuperAdmin) {
    redirect("/blocked");
  }

  let trialDaysLeft: number | null = null;
  if (tenant) {
    const now = new Date();
    const expiry = new Date(tenant.trialExpiresAt);
    const isTrialExpired = now > expiry;
    const hasActiveSubscription = tenant.subscriptionExpiresAt 
      ? now <= new Date(tenant.subscriptionExpiresAt) 
      : false;

    if (isTrialExpired && !hasActiveSubscription) {
      redirect("/expired");
    }

    if (tenant.subscriptionPlan === "trial") {
      trialDaysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }
  }

  const settings = await getSettings();

  const tickets = await (await getTenantPrismaServer()).serviceTicket.findMany({
    where: {
      status: { notIn: ["delivered", "cancelled"] },
    },
    orderBy: { createdAt: "desc" },
    include: { customer: true },
    take: 30,
  });

  const pendingTickets = tickets.map((t) => ({
    id: t.id,
    code: t.code,
    customerName: t.customer.name,
    customerPhone: t.customer.phone,
    deviceLabel: [t.deviceBrand, t.deviceModel].filter(Boolean).join(" ") ||
      t.deviceType,
    status: t.status,
  }));

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col">
        <AppHeader
          user={user}
          pendingTickets={pendingTickets}
          shopName={settings.shopName}
          shopTagline={settings.shopTagline}
          logoUrl={settings.logoUrl}
          trialDaysLeft={trialDaysLeft}
        />
        <main className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-4 sm:p-5 max-w-[1600px] w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
