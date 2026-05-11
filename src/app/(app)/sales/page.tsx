import { getTenantPrismaServer } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { formatVND, formatDateTime } from "@/lib/format";
import {
  ShoppingCart,
  Plus,
  Wrench,
  Receipt,
  TrendingUp,
  ChevronRight,
  Search,
  Filter,
  Calendar,
  CreditCard,
  Banknote,
  Wallet,
  ArrowRight
} from "lucide-react";
import { SalesFilter } from "./sales-filter";
import { cn } from "@/lib/utils";

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Tiền mặt",
  card: "Thẻ NH",
  transfer: "Chuyển khoản",
  wallet: "Ví ĐT",
};

const PAYMENT_ICONS: Record<string, any> = {
  cash: Banknote,
  card: CreditCard,
  transfer: Wallet,
  wallet: Wallet,
};

type Row = {
  id: string;
  code: string;
  type: "sale" | "service";
  createdAt: Date;
  customerName: string | null;
  customerPhone: string | null;
  itemCount: number;
  paymentMethod: string | null;
  total: number;
  href: string;
  device?: string;
};

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const type = sp.type ?? "all";

  const wantSale = type === "all" || type === "sale";
  const wantService = type === "all" || type === "service";

  const [sales, tickets] = await Promise.all([
    wantSale
      ? (await getTenantPrismaServer()).sale.findMany({
          orderBy: { createdAt: "desc" },
          include: {
            customer: { select: { name: true, phone: true } },
            items: { select: { id: true } },
          },
          take: 200,
        })
      : Promise.resolve([]),
    wantService
      ? (await getTenantPrismaServer()).serviceTicket.findMany({
          where: { status: "delivered" },
          orderBy: { deliveredAt: "desc" },
          include: {
            customer: { select: { name: true, phone: true } },
            items: { select: { id: true } },
          },
          take: 200,
        })
      : Promise.resolve([]),
  ]);

  const rows: Row[] = [
    ...sales.map((s) => ({
      id: s.id,
      code: s.code,
      type: "sale" as const,
      createdAt: s.createdAt,
      customerName: s.customer?.name ?? null,
      customerPhone: s.customer?.phone ?? null,
      itemCount: s.items.length,
      paymentMethod: s.paymentMethod,
      total: s.total,
      href: `/sales/${s.id}`,
    })),
    ...tickets.map((t) => ({
      id: t.id,
      code: t.code.replace(/^SC/, "HDSC"),
      type: "service" as const,
      createdAt: t.deliveredAt ?? t.createdAt,
      customerName: t.customer?.name ?? null,
      customerPhone: t.customer?.phone ?? null,
      itemCount: t.items.length,
      paymentMethod: t.paymentMethod,
      total: t.finalCost,
      href: `/service/${t.id}`,
      device: [t.deviceBrand, t.deviceModel].filter(Boolean).join(" ") || undefined,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const filtered = q
    ? rows.filter((r) => {
        const s = q.toLowerCase();
        return (
          r.code.toLowerCase().includes(s) ||
          (r.customerName ?? "").toLowerCase().includes(s) ||
          (r.customerPhone ?? "").toLowerCase().includes(s) ||
          (r.device ?? "").toLowerCase().includes(s)
        ) || false;
      })
    : rows;

  const totalRevenue = filtered.reduce((s, r) => s + r.total, 0);
  const saleCount = filtered.filter((r) => r.type === "sale").length;
  const serviceCount = filtered.filter((r) => r.type === "service").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header section matched with Customers style */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-primary/5 via-blue-500/5 to-transparent p-6 rounded-2xl border border-border/50">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Receipt className="size-6 text-primary" />
            Lịch sử Hoá đơn
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý và tra cứu tất cả giao dịch bán hàng & sửa chữa toàn hệ thống.
          </p>
        </div>
        <Link href="/pos" className={cn(buttonVariants({ size: "sm" }), "rounded-xl px-5 h-10 font-bold shadow-lg shadow-primary/10")}>
          <Plus className="size-4 mr-2" />
          Tạo hoá đơn mới
        </Link>
      </div>

      {/* KPI Stats matched with Customers style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi
          icon={<Receipt className="size-5" />}
          label="Tổng hoá đơn"
          value={String(filtered.length)}
          subValue="Dữ liệu lọc"
          gradient="from-blue-500 to-indigo-600"
        />
        <Kpi
          icon={<TrendingUp className="size-5" />}
          label="Tổng doanh thu"
          value={formatVND(totalRevenue)}
          subValue="Doanh số thực"
          gradient="from-emerald-400 to-teal-600"
        />
        <Kpi
          icon={<ShoppingCart className="size-5" />}
          label="Đơn bán lẻ"
          value={String(saleCount)}
          subValue="Thiết bị & Linh kiện"
          gradient="from-indigo-400 to-blue-600"
        />
        <Kpi
          icon={<Wrench className="size-5" />}
          label="Đơn sửa chữa"
          value={String(serviceCount)}
          subValue="Dịch vụ kỹ thuật"
          gradient="from-amber-400 to-orange-600"
        />
      </div>

      {/* List Section matched with Customers style */}
      <Card className="border border-border/80 shadow-lg rounded-2xl overflow-hidden bg-card/65 backdrop-blur-sm">
        <CardHeader className="border-b border-border/60 pb-4 px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Receipt className="size-4 text-primary" />
            Danh sách giao dịch ({filtered.length})
          </CardTitle>
          <div className="w-full md:w-80">
            <SalesFilter />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {filtered.length === 0 ? (
            <div className="py-20 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
               <Search className="size-10 text-muted-foreground/40 animate-pulse" />
               <span>Chưa tìm thấy giao dịch nào phù hợp.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((r) => (
                <InvoiceCard key={`${r.type}-${r.id}`} row={r} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InvoiceCard({ row }: { row: Row }) {
  const PaymentIcon = PAYMENT_ICONS[row.paymentMethod ?? ""] || Banknote;
  
  return (
    <Link
      href={row.href}
      className="rounded-xl border border-border/80 bg-card/80 hover:border-primary/40 hover:shadow-md transition-all duration-300 p-4 group relative flex flex-col justify-between"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "size-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
            row.type === "sale" ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-amber-50 text-amber-600 border border-amber-100"
          )}>
            {row.type === "sale" ? <ShoppingCart className="size-5" /> : <Wrench className="size-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-black text-foreground">{row.code}</span>
              <Badge variant="outline" className={cn(
                "text-[9px] h-4 px-1.5 font-bold uppercase tracking-wider rounded-md",
                row.type === "sale" ? "border-blue-200 text-blue-600 bg-blue-50/50" : "border-amber-200 text-amber-600 bg-amber-50/50"
              )}>
                {row.type === "sale" ? "Bán lẻ" : "Sửa chữa"}
              </Badge>
            </div>
            <div className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
              <Calendar className="size-3" />
              {formatDateTime(row.createdAt)}
            </div>
          </div>
        </div>
        <ChevronRight className="size-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
      </div>

      <div className="flex-1 space-y-3">
        <div className="space-y-0.5">
          <div className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
            {row.customerName || "Khách lẻ"}
          </div>
          {row.customerPhone && (
            <div className="text-[11px] text-muted-foreground font-mono">{row.customerPhone}</div>
          )}
          {row.device && (
            <div className="text-[10px] text-primary/70 font-bold truncate bg-primary/5 px-2 py-0.5 rounded-md inline-block mt-1 border border-primary/10">
              {row.device}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-widest font-black text-muted-foreground/60">Tổng cộng</span>
            <span className="text-base font-black text-primary">{formatVND(row.total)}</span>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[10px] text-muted-foreground font-medium">{row.itemCount} sp</span>
             <div className="flex items-center gap-1 text-[10px] font-bold text-foreground/80">
                <PaymentIcon className="size-3" />
                {PAYMENT_LABELS[row.paymentMethod ?? ""] || "Khác"}
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
