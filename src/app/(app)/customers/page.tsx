import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserPlus,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  Wrench,
  ShoppingCart,
} from "lucide-react";
import { formatVND, formatDate } from "@/lib/format";
import { CustomerSearch } from "./customer-search";
import { NewCustomerButton, CustomerRowActions } from "./customer-actions";
import Link from "next/link";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const where: Prisma.CustomerWhereInput = {};
  if (sp.q) {
    where.OR = [
      { name: { contains: sp.q } },
      { phone: { contains: sp.q } },
      { code: { contains: sp.q } },
      { email: { contains: sp.q } },
    ];
  }

  const [customers, totalCount, monthCount] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        sales: { select: { total: true } },
        serviceTickets: { select: { id: true } },
      },
      take: 200,
    }),
    prisma.customer.count(),
    prisma.customer.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)),
        },
      },
    }),
  ]);

  const totalSpent = customers.reduce(
    (s, c) => s + c.sales.reduce((ss, x) => ss + x.total, 0),
    0,
  );
  const totalSC = customers.reduce((s, c) => s + c.serviceTickets.length, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header section */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-primary/5 via-blue-500/5 to-transparent p-5 rounded-2xl border border-border/50">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="size-6 text-primary" />
            Khách hàng
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý cơ sở dữ liệu khách hàng, theo dõi chi tiêu và tra cứu lịch sử sửa chữa thiết bị.
          </p>
        </div>
        <NewCustomerButton />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi
          icon={<Users className="size-5" />}
          label="Tổng khách hàng"
          value={String(totalCount)}
          gradient="from-blue-500 to-indigo-600"
        />
        <Kpi
          icon={<UserPlus className="size-5" />}
          label="Mới (30 ngày)"
          value={String(monthCount)}
          gradient="from-emerald-400 to-teal-600"
        />
        <Kpi
          icon={<TrendingUp className="size-5" />}
          label="Tổng chi tiêu"
          value={formatVND(totalSpent)}
          gradient="from-amber-400 to-orange-600"
        />
        <Kpi
          icon={<Wrench className="size-5" />}
          label="Phiếu sửa chữa"
          value={String(totalSC)}
          gradient="from-violet-500 to-fuchsia-600"
        />
      </div>

      <Card className="border border-border/80 shadow-lg rounded-2xl overflow-hidden bg-card/65 backdrop-blur-sm">
        <CardHeader className="border-b border-border/60 pb-4 px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Users className="size-4 text-primary" />
            Danh bạ khách hàng ({customers.length})
          </CardTitle>
          <div className="w-full md:w-80">
            <CustomerSearch />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {customers.length === 0 ? (
            <div className="py-20 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
              <Users className="size-10 text-muted-foreground/40 animate-pulse" />
              <span>Chưa tìm thấy thông tin khách hàng nào phù hợp.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {customers.map((c) => {
                const spent = c.sales.reduce((s, x) => s + x.total, 0);
                const initials = c.name
                  .split(" ")
                  .filter(Boolean)
                  .slice(-2)
                  .map((p) => p[0])
                  .join("")
                  .toUpperCase();
                return (
                  <div
                    key={c.id}
                    className="rounded-xl border border-border/80 bg-card/80 hover:border-primary/40 hover:shadow-md transition-all duration-300 p-4 group relative flex flex-col justify-between"
                  >
                    <Link
                      href={`/customers/${c.id}`}
                      className="absolute inset-0 rounded-xl"
                      aria-label={`Xem ${c.name}`}
                    />
                    
                    {/* Action buttons appear on hover */}
                    <div className="absolute right-3 top-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <CustomerRowActions
                        customer={{
                          id: c.id,
                          name: c.name,
                          phone: c.phone,
                          email: c.email,
                          address: c.address,
                          note: c.note,
                        }}
                      />
                    </div>

                    <div className="flex items-start gap-3.5 relative pointer-events-none">
                      {/* Avatar initials with a beautiful blue gradient */}
                      <div className="size-11 shrink-0 rounded-full bg-gradient-to-tr from-primary/10 to-blue-500/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-sm shadow-sm">
                        {initials || <Users className="size-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground truncate max-w-[130px] sm:max-w-[150px]">
                            {c.name}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[9px] h-4 px-1 rounded-md font-mono bg-muted/40 font-semibold border-border/80"
                          >
                            {c.code}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-mono mt-1">
                          <Phone className="size-3 text-muted-foreground/75" />
                          {c.phone}
                        </div>
                        {c.email && (
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 truncate mt-0.5">
                            <Mail className="size-3 shrink-0 text-muted-foreground/75" />
                            <span className="truncate">{c.email}</span>
                          </div>
                        )}
                        {c.address && (
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 truncate mt-0.5">
                            <MapPin className="size-3 shrink-0 text-muted-foreground/75" />
                            <span className="truncate">{c.address}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-border/50 grid grid-cols-3 gap-2 relative pointer-events-none">
                      <Stat
                        icon={<ShoppingCart className="size-3 text-primary" />}
                        label="Hoá đơn"
                        value={String(c.sales.length)}
                      />
                      <Stat
                        icon={<Wrench className="size-3 text-violet-500" />}
                        label="Sửa chữa"
                        value={String(c.serviceTickets.length)}
                      />
                      <Stat
                        icon={<TrendingUp className="size-3 text-emerald-500" />}
                        label="Chi tiêu"
                        value={
                          spent > 0 ? formatVND(spent).replace(" ₫", "") : "0"
                        }
                        tone="primary"
                      />
                    </div>
                    
                    <div className="mt-3 text-[9px] font-semibold text-muted-foreground/70 uppercase tracking-wider relative pointer-events-none">
                      Gia nhập: {formatDate(c.createdAt)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  gradient,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  gradient: string;
}) {
  return (
    <Card className="border border-border/80 shadow-md rounded-2xl overflow-hidden bg-card/65 backdrop-blur-sm group hover:border-primary/30 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-5 flex items-center gap-4">
        <div
          className={`size-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-tr ${gradient} shadow-lg shadow-primary/5 group-hover:scale-105 transition-transform duration-300`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider">
            {label}
          </div>
          <div className="text-lg font-black text-foreground mt-0.5 truncate">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "primary";
}) {
  return (
    <div
      className={`rounded-xl border px-2 py-1.5 flex flex-col justify-center ${
        tone === "primary" ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-border/60"
      }`}
    >
      <div className="text-[9px] text-muted-foreground/90 uppercase font-bold tracking-wider flex items-center gap-1 mb-0.5">
        {icon}
        <span>{label}</span>
      </div>
      <div
        className={`text-xs font-black truncate ${
          tone === "primary" ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

