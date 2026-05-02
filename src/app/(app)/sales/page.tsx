import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
} from "lucide-react";
import { SalesFilter } from "./sales-filter";

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Tiền mặt",
  card: "Thẻ NH",
  transfer: "Chuyển khoản",
  wallet: "Ví ĐT",
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
      ? prisma.sale.findMany({
          orderBy: { createdAt: "desc" },
          include: {
            customer: { select: { name: true, phone: true } },
            items: { select: { id: true } },
          },
          take: 200,
        })
      : Promise.resolve([]),
    wantService
      ? prisma.serviceTicket.findMany({
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
        );
      })
    : rows;

  const total = filtered.reduce((s, r) => s + r.total, 0);
  const saleCount = filtered.filter((r) => r.type === "sale").length;
  const serviceCount = filtered.filter((r) => r.type === "service").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hoá đơn</h1>
          <p className="text-sm text-muted-foreground">
            HD bán hàng và HDSC sửa chữa đã hoàn tất.
          </p>
        </div>
        <Link href="/pos" className={buttonVariants()}>
          <Plus className="size-4" />
          Tạo phiếu mới
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi
          icon={<Receipt className="size-4" />}
          label="Tổng HĐ"
          value={String(filtered.length)}
        />
        <Kpi
          icon={<TrendingUp className="size-4" />}
          label="Tổng doanh thu"
          value={formatVND(total)}
          tone="primary"
        />
        <Kpi
          icon={<ShoppingCart className="size-4" />}
          label="Bán hàng"
          value={String(saleCount)}
        />
        <Kpi
          icon={<Wrench className="size-4" />}
          label="Sửa chữa"
          value={String(serviceCount)}
        />
      </div>

      <Card>
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="size-4" />
            Danh sách ({filtered.length})
          </CardTitle>
          <SalesFilter />
        </CardHeader>
        <CardContent className="p-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              Không có hoá đơn nào.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
              {filtered.map((r) => (
                <Link
                  key={`${r.type}-${r.id}`}
                  href={r.href}
                  className="rounded-md border bg-card hover:border-primary/60 hover:shadow-sm transition-all p-3 group"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`size-9 shrink-0 rounded flex items-center justify-center ${
                        r.type === "sale"
                          ? "bg-primary/10 text-primary"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {r.type === "sale" ? (
                        <ShoppingCart className="size-4" />
                      ) : (
                        <Wrench className="size-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-sm font-semibold">
                          {r.code}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[9px] h-4 px-1"
                        >
                          {r.type === "sale" ? "Bán hàng" : "Sửa chữa"}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {formatDateTime(r.createdAt)}
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                  </div>
                  <div className="mt-2 flex items-end justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate">
                        {r.customerName || "Khách lẻ"}
                      </div>
                      {r.customerPhone && (
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {r.customerPhone}
                        </div>
                      )}
                      {r.device && (
                        <div className="text-[11px] text-muted-foreground truncate">
                          {r.device}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-primary">
                        {formatVND(r.total)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {r.itemCount} mục •{" "}
                        {PAYMENT_LABELS[r.paymentMethod ?? ""] ||
                          r.paymentMethod ||
                          "—"}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
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
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "primary";
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div
          className={`size-10 rounded-md flex items-center justify-center ${
            tone === "primary"
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
            {label}
          </div>
          <div className="text-base font-bold truncate">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
