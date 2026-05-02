import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";
import { TooltipProvider } from "@/components/ui/tooltip";
import { prisma } from "@/lib/prisma";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) redirect("/login");

  const tickets = await prisma.serviceTicket.findMany({
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
        <AppHeader user={user} pendingTickets={pendingTickets} />
        <main className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-4 sm:p-5 max-w-[1600px] w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
