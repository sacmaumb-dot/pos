"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SelectField } from "@/components/ui/select-field";
import { toast } from "sonner";
import { Loader2, PackageCheck, Plus, Trash2, Search } from "lucide-react";
import { formatVND } from "@/lib/format";
import { printInBackground } from "@/lib/print";
import { deliverService } from "../actions";

type Product = {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  categoryType: string;
};

type ExistingItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

type ExtraDraft = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  productId: string | null;
};

const PAYMENT_OPTIONS = [
  { value: "cash", label: "Tiền mặt" },
  { value: "transfer", label: "Chuyển khoản" },
];

export function ReturnDialog({
  ticketId,
  ticketCode,
  existingItems,
  deposit,
  initialFinalCost,
  initialPaid,
  products,
}: {
  ticketId: string;
  ticketCode: string;
  existingItems: ExistingItem[];
  deposit: number;
  initialFinalCost: number;
  initialPaid: number;
  products: Product[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [extras, setExtras] = useState<ExtraDraft[]>([]);
  const [solution, setSolution] = useState("");
  const [warranty, setWarranty] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [productPicker, setProductPicker] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const matchedProducts = useMemo(() => {
    if (!productPicker.trim()) return [];
    const q = productPicker.toLowerCase().trim();
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [productPicker, products]);

  function addCustomLine() {
    setExtras((curr) => [
      ...curr,
      {
        id: crypto.randomUUID(),
        description: "",
        quantity: 1,
        unitPrice: 0,
        productId: null,
      },
    ]);
  }

  function addProduct(p: Product) {
    setExtras((curr) => {
      const idx = curr.findIndex((x) => x.productId === p.id);
      if (idx >= 0) {
        const next = [...curr];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [
        ...curr,
        {
          id: crypto.randomUUID(),
          description: p.name,
          quantity: 1,
          unitPrice: p.price,
          productId: p.id,
        },
      ];
    });
    setProductPicker("");
    setShowPicker(false);
  }

  function updateExtra(id: string, patch: Partial<ExtraDraft>) {
    setExtras((curr) =>
      curr.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    );
  }
  function removeExtra(id: string) {
    setExtras((curr) => curr.filter((x) => x.id !== id));
  }

  const validExtras = extras.filter(
    (x) => x.description.trim() && x.quantity > 0,
  );
  const extrasTotal = validExtras.reduce(
    (s, x) => s + x.unitPrice * x.quantity,
    0,
  );
  const existingTotal = existingItems.reduce((s, x) => s + x.subtotal, 0);
  const finalCost = existingTotal + extrasTotal;
  const due = Math.max(0, finalCost - deposit - initialPaid);
  const [paidNow, setPaidNow] = useState<string>("");
  const paidThisTime = Number(paidNow) || due;
  const totalPaid = initialPaid + paidThisTime;

  function submit() {
    if (paidThisTime < 0) {
      toast.error("Số tiền không hợp lệ");
      return;
    }
    startTransition(async () => {
      const res = await deliverService({
        ticketId,
        extraItems: validExtras.map((x) => ({
          description: x.description.trim(),
          quantity: x.quantity,
          unitPrice: x.unitPrice,
          productId: x.productId,
        })),
        paymentMethod,
        paid: totalPaid,
        warranty: Number(warranty) || 0,
        solution: solution.trim(),
        note: "",
      });
      if (res.ok) {
        toast.success(`Đã trả máy phiếu ${ticketCode}`);
        setOpen(false);
        await printInBackground(`/service/${ticketId}/return`);
        router.refresh();
      } else {
        toast.error(res.error || "Có lỗi xảy ra");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="w-full" size="lg" />}>
        <PackageCheck className="size-4" />
        Trả máy & Thanh toán
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Trả máy & Thanh toán</DialogTitle>
          <DialogDescription>
            Phiếu <span className="font-mono">{ticketCode}</span> · thêm dịch
            vụ/sản phẩm phát sinh (nếu có) trước khi tất toán.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {existingItems.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs">Dịch vụ trên phiếu</Label>
              <div className="rounded-md border divide-y text-sm">
                {existingItems.map((it) => (
                  <div
                    key={it.id}
                    className="flex justify-between px-3 py-2"
                  >
                    <span>
                      {it.description}
                      {it.quantity > 1 && (
                        <span className="text-muted-foreground">
                          {" "}
                          × {it.quantity}
                        </span>
                      )}
                    </span>
                    <span className="font-medium">
                      {formatVND(it.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Phát sinh thêm (nếu có)</Label>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPicker((s) => !s)}
                  className="h-7 text-xs"
                >
                  <Search className="size-3" />
                  Sản phẩm
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomLine}
                  className="h-7 text-xs"
                >
                  <Plus className="size-3" />
                  Dịch vụ
                </Button>
              </div>
            </div>

            {showPicker && (
              <div className="rounded-md border bg-muted/30 p-2 space-y-2">
                <Input
                  autoFocus
                  placeholder="Tìm sản phẩm theo tên hoặc SKU..."
                  value={productPicker}
                  onChange={(e) => setProductPicker(e.target.value)}
                  className="h-8"
                />
                {matchedProducts.length > 0 && (
                  <div className="max-h-48 overflow-y-auto rounded-md border bg-popover divide-y">
                    {matchedProducts.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => addProduct(p)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="font-medium truncate">{p.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {p.sku} · Còn {p.stock}
                          </div>
                        </div>
                        <span className="text-sm font-medium text-primary shrink-0">
                          {formatVND(p.price)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {extras.length === 0 ? (
              <div className="rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">
                Không có phát sinh
              </div>
            ) : (
              <div className="space-y-1.5">
                {extras.map((x) => (
                  <div
                    key={x.id}
                    className="grid grid-cols-12 gap-1.5 items-start"
                  >
                    <Input
                      value={x.description}
                      onChange={(e) =>
                        updateExtra(x.id, { description: e.target.value })
                      }
                      placeholder="Dịch vụ / sản phẩm"
                      className="col-span-6 h-8"
                    />
                    <Input
                      type="number"
                      min={1}
                      value={x.quantity}
                      onChange={(e) =>
                        updateExtra(x.id, {
                          quantity: Number(e.target.value) || 1,
                        })
                      }
                      className="col-span-2 h-8 text-center"
                    />
                    <Input
                      type="number"
                      min={0}
                      step={1000}
                      value={x.unitPrice || ""}
                      onChange={(e) =>
                        updateExtra(x.id, {
                          unitPrice: Number(e.target.value) || 0,
                        })
                      }
                      placeholder="Đơn giá"
                      className="col-span-3 h-8"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeExtra(x.id)}
                      className="col-span-1 size-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Đã thực hiện</Label>
            <Textarea
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              rows={2}
              placeholder="Mô tả những gì đã sửa / thay thế..."
            />
          </div>

          <div className="rounded-md border bg-muted/20 p-3 space-y-1.5 text-sm">
            <Row label="Tổng dịch vụ trên phiếu" value={formatVND(existingTotal)} />
            {extrasTotal > 0 && (
              <Row label="Phát sinh" value={formatVND(extrasTotal)} />
            )}
            <Separator />
            <Row label="Tổng chi phí" value={formatVND(finalCost)} bold />
            {deposit > 0 && (
              <Row
                label="Đặt cọc"
                value={`-${formatVND(deposit)}`}
                color="text-emerald-600"
              />
            )}
            {initialPaid > 0 && (
              <Row
                label="Đã thanh toán trước"
                value={`-${formatVND(initialPaid)}`}
                color="text-emerald-600"
              />
            )}
            <Separator />
            <Row
              label="Còn phải thu"
              value={formatVND(due)}
              color={due > 0 ? "text-destructive" : "text-emerald-600"}
              bold
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="space-y-1.5 sm:col-span-1">
              <Label className="text-xs">Phương thức</Label>
              <SelectField
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                options={PAYMENT_OPTIONS}
                className="w-full"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-1">
              <Label className="text-xs">Bảo hành (tháng)</Label>
              <Input
                type="number"
                min={0}
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-1">
              <Label className="text-xs">Khách trả lần này</Label>
              <Input
                type="number"
                min={0}
                step={1000}
                value={paidNow}
                onChange={(e) => setPaidNow(e.target.value)}
                placeholder={String(due)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Huỷ
          </Button>
          <Button onClick={() => submit()} disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            <PackageCheck className="size-4" />
            Hoàn tất & In phiếu trả
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
