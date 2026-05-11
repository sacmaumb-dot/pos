import { getTenantPrismaServer } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ServiceStatusBadge } from "@/components/service-status-badge";
import { formatVND, formatDateTime } from "@/lib/format";
import Link from "next/link";
import {
  ArrowLeft,
  Smartphone,
  Laptop,
  Tablet,
  User,
  Wrench,
  Printer,
  PackageCheck,
} from "lucide-react";
import { ServiceStatusActions } from "./service-status-actions";
import { ServiceUpdateForm } from "./service-update-form";
import { ReturnDialog } from "./return-dialog";

const DEVICE_LABELS: Record<string, string> = {
  phone: "Điện thoại",
  laptop: "Laptop",
  tablet: "Máy tính bảng",
  other: "Khác",
};

const DEVICE_ICONS: Record<string, React.ReactNode> = {
  phone: <Smartphone className="size-4" />,
  laptop: <Laptop className="size-4" />,
  tablet: <Tablet className="size-4" />,
};

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Tiền mặt",
  transfer: "Chuyển khoản",
};

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [ticket, technicians, products] = await Promise.all([
    (await getTenantPrismaServer()).serviceTicket.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: true,
        assignedTo: true,
        items: { include: { product: true } },
        history: { orderBy: { createdAt: "desc" } },
      },
    }),
    (await getTenantPrismaServer()).user.findMany({
      where: { active: true, role: { in: ["technician", "admin"] } },
      orderBy: { name: "asc" },
    }),
    (await getTenantPrismaServer()).product.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!ticket) notFound();

  const itemsTotal = ticket.items.reduce((s, i) => s + i.subtotal, 0);
  const due =
    (ticket.status === "delivered" ? ticket.finalCost : itemsTotal) -
    ticket.paid -
    ticket.deposit;
  const isDelivered = ticket.status === "delivered";

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/service"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ArrowLeft className="size-4" />
          Quay lại
        </Link>
        <div className="flex gap-2">
          <Link
            href={`/service/${id}/intake`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Printer className="size-4" />
            Phiếu nhận
          </Link>
          {isDelivered && (
            <Link
              href={`/service/${id}/return`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Printer className="size-4" />
              Phiếu trả
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="border-b pb-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Wrench className="size-5 text-primary" />
                    <CardTitle>Phiếu sửa chữa {ticket.code}</CardTitle>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tiếp nhận {formatDateTime(ticket.receivedAt)} ·{" "}
                    {ticket.createdBy.name}
                  </p>
                </div>
                <ServiceStatusBadge status={ticket.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              <Section title="Khách hàng" icon={<User className="size-4" />}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <Info label="Họ tên" value={ticket.customer.name} />
                  <Info label="SĐT" value={ticket.customer.phone} />
                  <Info label="Mã KH" value={ticket.customer.code} mono />
                </div>
              </Section>

              <Separator />

              <Section
                title="Thiết bị"
                icon={
                  DEVICE_ICONS[ticket.deviceType] || (
                    <Laptop className="size-4" />
                  )
                }
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <Info
                    label="Loại"
                    value={
                      DEVICE_LABELS[ticket.deviceType] || ticket.deviceType
                    }
                  />
                  <Info label="Hãng" value={ticket.deviceBrand} />
                  <Info label="Model" value={ticket.deviceModel} />
                  <Info label="IMEI / Serial" value={ticket.imei} mono />
                  {ticket.accessories && (
                    <Info
                      label="Phụ kiện đi kèm"
                      value={ticket.accessories}
                      className="sm:col-span-2"
                    />
                  )}
                  {ticket.appearance && (
                    <Info
                      label="Tình trạng máy"
                      value={ticket.appearance}
                      className="sm:col-span-2"
                    />
                  )}
                </div>
              </Section>

              <Separator />

              <Section title="Yêu cầu / Lỗi">
                <p className="text-sm whitespace-pre-wrap">{ticket.problem}</p>
                {ticket.diagnosis && (
                  <div className="mt-3">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                      Chẩn đoán
                    </div>
                    <p className="text-sm whitespace-pre-wrap">
                      {ticket.diagnosis}
                    </p>
                  </div>
                )}
                {ticket.solution && (
                  <div className="mt-3">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                      Đã thực hiện
                    </div>
                    <p className="text-sm whitespace-pre-wrap">
                      {ticket.solution}
                    </p>
                  </div>
                )}
              </Section>

              {ticket.items.length > 0 && (
                <>
                  <Separator />
                  <Section title="Dịch vụ & vật tư">
                    <div className="rounded-md border divide-y text-sm">
                      {ticket.items.map((it) => (
                        <div
                          key={it.id}
                          className="flex items-center justify-between gap-3 px-3 py-2"
                        >
                          <div className="min-w-0">
                            <div className="font-medium truncate">
                              {it.description}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {it.quantity} × {formatVND(it.unitPrice)}
                            </div>
                          </div>
                          <div className="font-semibold shrink-0">
                            {formatVND(it.subtotal)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>
                </>
              )}
            </CardContent>
          </Card>

          {!isDelivered && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Cập nhật chẩn đoán & báo giá
                </CardTitle>
                <CardDescription>
                  Kỹ thuật viên cập nhật thông tin trong quá trình sửa chữa.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ServiceUpdateForm
                  ticket={{
                    id: ticket.id,
                    diagnosis: ticket.diagnosis,
                    solution: ticket.solution,
                    estimatedCost: ticket.estimatedCost,
                    finalCost: ticket.finalCost,
                    paid: ticket.paid,
                    warranty: ticket.warranty,
                    assignedToId: ticket.assignedToId,
                    promisedAt: ticket.promisedAt
                      ? ticket.promisedAt.toISOString().slice(0, 16)
                      : null,
                    note: ticket.note,
                  }}
                  technicians={technicians.map((t) => ({
                    id: t.id,
                    name: t.name,
                  }))}
                />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          {!isDelivered && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <PackageCheck className="size-4 text-primary" />
                  Trả máy
                </CardTitle>
                <CardDescription className="text-xs">
                  Có thể thêm dịch vụ/sản phẩm phát sinh khi tất toán.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={null}>
                  <ReturnDialog
                    ticketId={ticket.id}
                    ticketCode={ticket.code}
                    existingItems={ticket.items.map((it) => ({
                      id: it.id,
                      description: it.description,
                      quantity: it.quantity,
                      unitPrice: it.unitPrice,
                      subtotal: it.subtotal,
                    }))}
                    deposit={ticket.deposit}
                    initialFinalCost={ticket.finalCost}
                    initialPaid={ticket.paid}
                    products={products
                      .filter((p) => p.category.type !== "service")
                      .map((p) => ({
                        id: p.id,
                        sku: p.sku,
                        name: p.name,
                        price: p.price,
                        stock: p.stock,
                        categoryType: p.category.type,
                      }))}
                  />
                </Suspense>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-sm">
              <Row
                label="Báo giá"
                value={formatVND(ticket.estimatedCost || itemsTotal)}
              />
              {ticket.deposit > 0 && (
                <Row
                  label="Đặt cọc"
                  value={formatVND(ticket.deposit)}
                  color="text-emerald-600"
                />
              )}
              {isDelivered && (
                <Row
                  label="Tổng chi phí cuối"
                  value={formatVND(ticket.finalCost)}
                  bold
                />
              )}
              {ticket.paid > 0 && (
                <Row label="Đã thanh toán" value={formatVND(ticket.paid)} />
              )}
              {ticket.paymentMethod && (
                <Row
                  label="Phương thức"
                  value={
                    PAYMENT_LABELS[ticket.paymentMethod] || ticket.paymentMethod
                  }
                />
              )}
              {(due !== 0 || isDelivered) && (
                <>
                  <Separator />
                  <Row
                    label={due > 0 ? "Còn lại" : "Đủ thanh toán"}
                    value={due > 0 ? formatVND(due) : "0 đ"}
                    color={
                      due > 0 ? "text-destructive" : "text-emerald-600"
                    }
                    bold
                  />
                </>
              )}
            </CardContent>
          </Card>

          {!isDelivered && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Trạng thái</CardTitle>
              </CardHeader>
              <CardContent>
                <ServiceStatusActions
                  ticketId={ticket.id}
                  currentStatus={ticket.status}
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Thông tin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-sm">
              <Row
                label="Tiếp nhận"
                value={formatDateTime(ticket.receivedAt)}
              />
              {ticket.promisedAt && (
                <Row
                  label="Hẹn trả"
                  value={formatDateTime(ticket.promisedAt)}
                />
              )}
              {ticket.completedAt && (
                <Row
                  label="Hoàn tất"
                  value={formatDateTime(ticket.completedAt)}
                />
              )}
              {ticket.deliveredAt && (
                <Row
                  label="Đã trả"
                  value={formatDateTime(ticket.deliveredAt)}
                />
              )}
              <Separator />
              <Row label="Người nhận" value={ticket.createdBy.name} />
              <Row
                label="KTV phụ trách"
                value={ticket.assignedTo?.name || "—"}
              />
              {ticket.warranty > 0 && (
                <Row label="Bảo hành" value={`${ticket.warranty} tháng`} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Lịch sử</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ticket.history.map((h) => (
                <div key={h.id} className="flex gap-2 text-sm">
                  <div className="size-2 rounded-full bg-primary mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <ServiceStatusBadge status={h.status} />
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(h.createdAt)}
                      </span>
                    </div>
                    {h.note && (
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {h.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

function Info({
  label,
  value,
  mono,
  className = "",
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={mono ? "font-mono" : ""}>{value || "—"}</div>
    </div>
  );
}

function Row({
  label,
  value,
  color,
  bold,
}: {
  label: string;
  value: string;
  color?: string;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`${color || ""} ${bold ? "font-semibold" : ""}`}>
        {value}
      </span>
    </div>
  );
}
