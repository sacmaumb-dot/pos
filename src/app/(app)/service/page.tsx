import { getTenantPrismaServer } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";
import { requireSession } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { formatVND, formatDateTime } from "@/lib/format";
import {
  Wrench,
  Plus,
  Smartphone,
  Laptop,
  Tablet,
  Phone,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Package,
  Search,
  User,
  Zap
} from "lucide-react";
import { ServiceStatusBadge } from "@/components/service-status-badge";
import { ServiceFilter } from "./service-filter";
import { cn } from "@/lib/utils";

const DEVICE_ICONS: Record<string, React.ReactNode> = {
  phone: <Smartphone className="size-5" />,
  laptop: <Laptop className="size-5" />,
  tablet: <Tablet className="size-5" />,
  other: <Package className="size-5" />,
};

export default async function ServicePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const session = await requireSession();
  const tenantPrisma = await getTenantPrismaServer();
  const where: Prisma.ServiceTicketWhereInput = {};

  if (sp.status && sp.status !== "all") {
    where.status = sp.status;
  }

  if (sp.q) {
    where.OR = [
      { code: { contains: sp.q } },
      { deviceModel: { contains: sp.q } },
      { imei: { contains: sp.q } },
      { customer: { name: { contains: sp.q } } },
      { customer: { phone: { contains: sp.q } } },
    ];
  }

  const tickets = await tenantPrisma.serviceTicket.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { customer: true, assignedTo: true },
    take: 200,
  });

  const counts = await tenantPrisma.serviceTicket.groupBy({
    by: ["status"],
    _count: true,
  });
  const countMap: Record<string, number> = {};
  counts.forEach((c) => (countMap[c.status] = c._count));
  const totalActive =
    (countMap.received || 0) +
    (countMap.diagnosing || 0) +
    (countMap.waiting_parts || 0) +
    (countMap.repairing || 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header section matched with Customers style */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-primary/5 via-blue-500/5 to-transparent p-6 rounded-2xl border border-border/50">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Wrench className="size-6 text-primary" />
            Phiếu sửa chữa
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý tiếp nhận, chẩn đoán, báo giá và bàn giao máy cho khách hàng.
          </p>
        </div>
        <Link href="/pos" className={cn(buttonVariants({ size: "sm" }), "rounded-xl px-5 h-10 font-bold shadow-lg shadow-primary/10")}>
          <Plus className="size-4 mr-2" />
          Tiếp nhận máy mới
        </Link>
      </div>

      {/* KPI Stats matched with Customers style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi
          icon={<Clock className="size-5" />}
          label="Đang xử lý"
          value={String(totalActive)}
          subValue="Cần KTV kiểm tra"
          gradient="from-amber-400 to-orange-600"
        />
        <Kpi
          icon={<AlertCircle className="size-5" />}
          label="Chờ trả khách"
          value={String(countMap.completed || 0)}
          subValue="Đã sửa xong"
          gradient="from-blue-500 to-indigo-600"
        />
        <Kpi
          icon={<CheckCircle2 className="size-5" />}
          label="Đã bàn giao"
          value={String(countMap.delivered || 0)}
          subValue="Đơn hoàn tất"
          gradient="from-emerald-400 to-teal-600"
        />
        <Kpi
          icon={<XCircle className="size-5" />}
          label="Đã huỷ/Trả"
          value={String(countMap.cancelled || 0)}
          subValue="Không sửa được"
          gradient="from-rose-400 to-red-600"
        />
      </div>

      {/* List Section matched with Customers style */}
      <Card className="border border-border/80 shadow-lg rounded-2xl overflow-hidden bg-card/65 backdrop-blur-sm">
        <CardHeader className="border-b border-border/60 pb-4 px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Wrench className="size-4 text-primary" />
            Danh sách phiếu sửa ({tickets.length})
          </CardTitle>
          <div className="w-full md:w-80">
            <ServiceFilter />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {tickets.length === 0 ? (
            <div className="py-20 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
               <Search className="size-10 text-muted-foreground/40 animate-pulse" />
               <span>Chưa tìm thấy phiếu sửa chữa nào phù hợp.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {tickets.map((t) => (
                <TicketCard key={t.id} ticket={t} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TicketCard({ ticket }: { ticket: any }) {
  return (
    <Link
      href={`/service/${ticket.id}`}
      className="rounded-xl border border-border/80 bg-card/80 hover:border-primary/40 hover:shadow-md transition-all duration-300 p-4 group relative flex flex-col justify-between"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-tr from-amber-50 to-orange-50 border border-amber-100 text-amber-600 flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm">
            {DEVICE_ICONS[ticket.deviceType] ?? <Wrench className="size-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-black text-foreground">{ticket.code}</span>
              <ServiceStatusBadge status={ticket.status} className="h-4 px-1.5 text-[9px] shadow-none rounded-md" />
            </div>
            <div className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
              <Clock className="size-3" />
              {formatDateTime(ticket.receivedAt)}
            </div>
          </div>
        </div>
        <ChevronRight className="size-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
      </div>

      <div className="flex-1 space-y-4">
        <div className="space-y-1">
          <div className="text-sm font-bold text-foreground flex items-center gap-1.5 group-hover:text-primary transition-colors">
            {ticket.customer.name}
            <span className="text-[10px] text-muted-foreground font-mono">({ticket.customer.phone})</span>
          </div>
          <div className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md inline-block">
             {[ticket.deviceBrand, ticket.deviceModel].filter(Boolean).join(" ") || ticket.deviceType}
          </div>
          {ticket.imei && (
            <div className="text-[10px] text-muted-foreground font-mono block">IMEI: {ticket.imei}</div>
          )}
        </div>

        <div className="p-2.5 rounded-xl bg-amber-50/20 border border-amber-100/50">
           <div className="text-[9px] uppercase tracking-widest font-black text-amber-600/70 mb-1">Tình trạng</div>
           <p className="text-[11px] text-slate-600 line-clamp-2 font-medium leading-relaxed">
              {ticket.problem}
           </p>
        </div>

        <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
             <User className="size-3" />
             {ticket.assignedTo?.name ?? "Chưa giao KTV"}
          </div>
          <div className="text-right">
             <div className="text-[9px] uppercase tracking-widest font-black text-muted-foreground/50">Dự kiến</div>
             <div className="text-sm font-black text-primary">
                {ticket.estimatedCost > 0 ? formatVND(ticket.estimatedCost) : "Liên hệ"}
             </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function Kpi({
  icon,
  label,
  value,
  subValue,
  gradient,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue: string;
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
          <div className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider">
            {label}
          </div>
          <div className="text-lg font-black text-foreground mt-0.5 truncate">{value}</div>
          <div className="text-[10px] text-muted-foreground font-medium">{subValue}</div>
        </div>
      </CardContent>
    </Card>
  );
}
