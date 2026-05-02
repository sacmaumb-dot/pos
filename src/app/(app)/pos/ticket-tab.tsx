"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2, Printer, User, Wrench, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ProductPickerInput,
  type PickerProduct,
} from "@/components/product-picker-input";
import { ServiceStatusBadge } from "@/components/service-status-badge";
import { ServiceStatusActions } from "../service/[id]/service-status-actions";
import { ServiceUpdateForm } from "../service/[id]/service-update-form";
import { ReturnDialog } from "../service/[id]/return-dialog";
import {
  getTicketForTab,
  addServiceItems,
  removeServiceItem,
} from "../service/actions";
import { formatVND, formatDateTime } from "@/lib/format";
import { printInBackground } from "@/lib/print";

type Technician = { id: string; name: string };
type Product = {
  id: string;
  sku: string;
  name: string;
  brand: string | null;
  price: number;
  stock: number;
  categoryType: string;
  categoryId: string;
};

const DEVICE_LABELS: Record<string, string> = {
  phone: "Điện thoại",
  laptop: "Laptop",
  tablet: "Máy tính bảng",
  other: "Khác",
};

type TicketData = NonNullable<
  Awaited<ReturnType<typeof getTicketForTab>> extends infer R
    ? R extends { ok: true; ticket: infer T }
      ? T
      : never
    : never
>;

export function TicketTab({
  ticketId,
  technicians,
  products,
  onClosed,
}: {
  ticketId: string;
  technicians: Technician[];
  products: Product[];
  onClosed: () => void;
}) {
  const [data, setData] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let alive = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    getTicketForTab(ticketId).then((res) => {
      if (!alive) return;
      if (res.ok) {
        setData(res.ticket);
        setError(null);
      } else {
        setError(res.error || "Không tải được phiếu");
      }
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [ticketId, version]);

  useEffect(() => {
    if (data && data.status === "delivered") {
      const t = setTimeout(() => onClosed(), 800);
      return () => clearTimeout(t);
    }
  }, [data, onClosed]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
        <Loader2 className="size-5 animate-spin" />
        <span className="text-sm">Đang tải phiếu...</span>
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
        {error || "Không tải được phiếu"}
      </div>
    );
  }

  const ticket = data;
  const isDelivered = ticket.status === "delivered";
  const itemsTotal = ticket.items.reduce((s, i) => s + i.subtotal, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-3">
        <Card>
          <CardHeader className="border-b pb-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Wrench className="size-4 text-primary" />
                  <CardTitle className="text-base">
                    Phiếu {ticket.code}
                  </CardTitle>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Tiếp nhận {formatDateTime(new Date(ticket.receivedAt))}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ServiceStatusBadge status={ticket.status} />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    printInBackground(`/service/${ticket.id}/intake`)
                  }
                >
                  <Printer className="size-3.5" />
                  In phiếu nhận
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
              <Info icon={<User className="size-3.5" />} label="Khách hàng">
                <div className="font-medium">{ticket.customer.name}</div>
                <div className="text-xs text-muted-foreground">
                  {ticket.customer.phone}
                </div>
              </Info>
              <Info label="Mã KH">
                <span className="font-mono text-xs">
                  {ticket.customer.code}
                </span>
              </Info>
              <Info label="Loại máy">
                {DEVICE_LABELS[ticket.deviceType] || ticket.deviceType}
              </Info>
              <Info label="Hãng / Model" className="sm:col-span-2">
                {[ticket.deviceBrand, ticket.deviceModel]
                  .filter(Boolean)
                  .join(" ") || "—"}
              </Info>
              <Info label="IMEI / Serial">
                <span className="font-mono text-xs">
                  {ticket.imei || "—"}
                </span>
              </Info>
            </div>
            <Separator />
            <div>
              <div className="text-[11px] uppercase text-muted-foreground tracking-wide mb-1">
                Yêu cầu / Lỗi
              </div>
              <p className="text-sm whitespace-pre-wrap">{ticket.problem}</p>
            </div>
            <Separator />
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-[11px] uppercase text-muted-foreground tracking-wide">
                  Báo giá ({ticket.items.length} mục) ·{" "}
                  {formatVND(itemsTotal)}
                </div>
              </div>
              {ticket.items.length > 0 ? (
                <div className="rounded-md border divide-y text-xs">
                  {ticket.items.map((it) => (
                    <div
                      key={it.id}
                      className="flex items-center gap-3 px-2.5 py-1.5"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">
                          {it.description}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {it.quantity} × {formatVND(it.unitPrice)}
                        </div>
                      </div>
                      <div className="font-semibold shrink-0">
                        {formatVND(it.subtotal)}
                      </div>
                      {!isDelivered && (
                        <button
                          type="button"
                          onClick={async () => {
                            const r = await removeServiceItem(it.id);
                            if (r.ok) {
                              toast.success("Đã xoá");
                              setVersion((v) => v + 1);
                            } else {
                              toast.error(r.error || "Lỗi");
                            }
                          }}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label="Xoá"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground italic">
                  Chưa có dịch vụ nào.
                </div>
              )}
              {!isDelivered && (
                <AddItemRow
                  ticketId={ticket.id}
                  products={products}
                  onAdded={() => setVersion((v) => v + 1)}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {!isDelivered && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                Cập nhật chẩn đoán & báo giá
              </CardTitle>
              <CardDescription className="text-xs">
                Cập nhật trong quá trình sửa chữa.
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
                  promisedAt: ticket.promisedAt,
                  note: ticket.note,
                }}
                technicians={technicians}
              />
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-3">
        {!isDelivered && (
          <Card className="border-primary/40 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Trả máy & Thanh toán</CardTitle>
              <CardDescription className="text-xs">
                Có thể thêm dịch vụ/sản phẩm phát sinh khi tất toán.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReturnDialog
                ticketId={ticket.id}
                ticketCode={ticket.code}
                existingItems={ticket.items.map((i) => ({
                  id: i.id,
                  description: i.description,
                  quantity: i.quantity,
                  unitPrice: i.unitPrice,
                  subtotal: i.subtotal,
                }))}
                deposit={ticket.deposit}
                initialFinalCost={
                  ticket.finalCost ||
                  ticket.items.reduce((s, i) => s + i.subtotal, 0)
                }
                initialPaid={ticket.paid}
                products={products}
              />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Trạng thái phiếu</CardTitle>
          </CardHeader>
          <CardContent>
            <ServiceStatusActions
              ticketId={ticket.id}
              currentStatus={ticket.status}
            />
          </CardContent>
        </Card>

        {!isDelivered && (
          <button
            type="button"
            onClick={() => setVersion((v) => v + 1)}
            className="text-xs text-muted-foreground hover:text-foreground w-full text-center"
          >
            Tải lại phiếu
          </button>
        )}
      </div>
    </div>
  );
}

function Info({
  label,
  children,
  icon,
  className,
}: {
  label: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-[10px] uppercase text-muted-foreground tracking-wide flex items-center gap-1 mb-0.5">
        {icon}
        {label}
      </div>
      <div className="text-xs">{children}</div>
    </div>
  );
}

function AddItemRow({
  ticketId,
  products,
  onAdded,
}: {
  ticketId: string;
  products: PickerProduct[];
  onAdded: () => void;
}) {
  const [productId, setProductId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [pending, startTransition] = useTransition();

  function reset() {
    setProductId(null);
    setDescription("");
    setQuantity(1);
    setUnitPrice(0);
  }

  function handleAdd() {
    if (!description.trim()) {
      toast.error("Chọn dịch vụ hoặc nhập tên");
      return;
    }
    startTransition(async () => {
      const r = await addServiceItems(ticketId, [
        { productId, description: description.trim(), quantity, unitPrice },
      ]);
      if (r.ok) {
        toast.success("Đã thêm");
        reset();
        onAdded();
      } else {
        toast.error(r.error || "Lỗi");
      }
    });
  }

  return (
    <div className="mt-2 grid grid-cols-12 gap-1.5 items-start">
      <div className="col-span-12 sm:col-span-6">
        <ProductPickerInput
          products={products}
          value={description}
          onTextChange={(t) => {
            setDescription(t);
            setProductId(null);
          }}
          onSelect={(p) => {
            setProductId(p.id);
            setDescription(p.name);
            setUnitPrice(p.price);
          }}
          placeholder="Tìm dịch vụ / sản phẩm trong kho..."
        />
      </div>
      <div className="col-span-3 sm:col-span-2">
        <Input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value) || 1)}
          placeholder="SL"
        />
      </div>
      <div className="col-span-5 sm:col-span-3">
        <Input
          type="number"
          min={0}
          step={1000}
          value={unitPrice || ""}
          onChange={(e) => setUnitPrice(Number(e.target.value) || 0)}
          placeholder="Đơn giá"
        />
      </div>
      <div className="col-span-4 sm:col-span-1">
        <Button
          type="button"
          size="icon"
          onClick={handleAdd}
          disabled={pending}
          aria-label="Thêm dịch vụ"
          className="w-full"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
