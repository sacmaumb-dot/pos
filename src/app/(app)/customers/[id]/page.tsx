import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatVND, formatDate, formatDateTime } from "@/lib/format";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShoppingCart,
  Wrench,
  TrendingUp,
  StickyNote,
  Receipt,
} from "lucide-react";
import { ServiceStatusBadge } from "@/components/service-status-badge";
import { CustomerRowActions } from "../customer-actions";

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Tiền mặt",
  card: "Thẻ NH",
  transfer: "Chuyển khoản",
  wallet: "Ví ĐT",
};

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      sales: {
        orderBy: { createdAt: "desc" },
        include: { items: true },
      },
      serviceTickets: {
        orderBy: { createdAt: "desc" },
        include: { assignedTo: true },
      },
    },
  });
  if (!customer) notFound();

  const totalSpent = customer.sales.reduce((s, x) => s + x.total, 0);
  const totalRepair = customer.serviceTickets
    .filter((t) => t.status === "delivered")
    .reduce((s, x) => s + x.finalCost, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/customers"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ArrowLeft className="size-4" />
          Quay lại
        </Link>
        <CustomerRowActions
          customer={{
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            address: customer.address,
            note: customer.note,
          }}
          variant="label"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card className="lg:col-span-1">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="size-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                {customer.name
                  .split(" ")
                  .filter(Boolean)
                  .slice(-2)
                  .map((p) => p[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-base truncate">
                  {customer.name}
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {customer.code}
                </Badge>
              </div>
            </div>
            <div className="space-y-1.5 text-sm">
              <Row
                icon={<Phone className="size-3.5" />}
                label="SĐT"
                value={customer.phone}
                mono
              />
              <Row
                icon={<Mail className="size-3.5" />}
                label="Email"
                value={customer.email || "—"}
              />
              <Row
                icon={<MapPin className="size-3.5" />}
                label="Địa chỉ"
                value={customer.address || "—"}
              />
              <Row
                icon={<Calendar className="size-3.5" />}
                label="Tham gia"
                value={formatDate(customer.createdAt)}
              />
              {customer.note && (
                <Row
                  icon={<StickyNote className="size-3.5" />}
                  label="Ghi chú"
                  value={customer.note}
                />
              )}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat
              icon={<ShoppingCart className="size-4" />}
              label="Hoá đơn"
              value={String(customer.sales.length)}
            />
            <Stat
              icon={<Wrench className="size-4" />}
              label="Phiếu SC"
              value={String(customer.serviceTickets.length)}
            />
            <Stat
              icon={<TrendingUp className="size-4" />}
              label="Tiền bán hàng"
              value={formatVND(totalSpent)}
              tone="primary"
            />
            <Stat
              icon={<Receipt className="size-4" />}
              label="Tiền sửa chữa"
              value={formatVND(totalRepair)}
            />
          </div>

          <Card>
            <CardHeader className="border-b pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShoppingCart className="size-4" />
                Lịch sử bán hàng ({customer.sales.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {customer.sales.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  Chưa có hoá đơn bán hàng nào.
                </div>
              ) : (
                <table className="w-full text-xs">
                  <thead className="bg-muted/30">
                    <tr className="text-left">
                      <th className="px-3 py-2 font-medium">Mã</th>
                      <th className="px-3 py-2 font-medium">Thời gian</th>
                      <th className="px-3 py-2 font-medium">Số mục</th>
                      <th className="px-3 py-2 font-medium">TT</th>
                      <th className="px-3 py-2 font-medium text-right">
                        Tổng tiền
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.sales.map((s) => (
                      <tr key={s.id} className="border-t hover:bg-muted/20">
                        <td className="px-3 py-2">
                          <Link
                            href={`/sales/${s.id}`}
                            className="font-mono font-medium text-primary hover:underline"
                          >
                            {s.code}
                          </Link>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {formatDateTime(s.createdAt)}
                        </td>
                        <td className="px-3 py-2">{s.items.length}</td>
                        <td className="px-3 py-2">
                          {PAYMENT_LABELS[s.paymentMethod] || s.paymentMethod}
                        </td>
                        <td className="px-3 py-2 text-right font-medium">
                          {formatVND(s.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Wrench className="size-4" />
                Lịch sử sửa chữa ({customer.serviceTickets.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {customer.serviceTickets.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  Chưa có phiếu sửa chữa nào.
                </div>
              ) : (
                <table className="w-full text-xs">
                  <thead className="bg-muted/30">
                    <tr className="text-left">
                      <th className="px-3 py-2 font-medium">Mã</th>
                      <th className="px-3 py-2 font-medium">Thiết bị</th>
                      <th className="px-3 py-2 font-medium">KTV</th>
                      <th className="px-3 py-2 font-medium">Trạng thái</th>
                      <th className="px-3 py-2 font-medium text-right">
                        Chi phí
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.serviceTickets.map((t) => (
                      <tr key={t.id} className="border-t hover:bg-muted/20">
                        <td className="px-3 py-2">
                          <Link
                            href={`/service/${t.id}`}
                            className="font-mono font-medium text-primary hover:underline"
                          >
                            {t.code}
                          </Link>
                        </td>
                        <td className="px-3 py-2">
                          <div className="font-medium">
                            {[t.deviceBrand, t.deviceModel]
                              .filter(Boolean)
                              .join(" ") || t.deviceType}
                          </div>
                          <div className="text-[10px] text-muted-foreground line-clamp-1">
                            {t.problem}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          {t.assignedTo?.name || "—"}
                        </td>
                        <td className="px-3 py-2">
                          <ServiceStatusBadge status={t.status} />
                        </td>
                        <td className="px-3 py-2 text-right font-medium">
                          {t.status === "delivered"
                            ? formatVND(t.finalCost)
                            : t.estimatedCost > 0
                              ? formatVND(t.estimatedCost)
                              : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
          {label}
        </div>
        <div className={`text-sm ${mono ? "font-mono" : ""} break-words`}>
          {value}
        </div>
      </div>
    </div>
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
    <Card>
      <CardContent className="p-3 flex items-center gap-2.5">
        <div
          className={`size-9 rounded-md flex items-center justify-center ${
            tone === "primary"
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
            {label}
          </div>
          <div className="text-sm font-bold truncate">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
