"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SelectField } from "@/components/ui/select-field";
import {
  CustomerPhoneField,
  type CustomerSelection,
} from "@/components/customer-phone-field";
import {
  ProductPickerInput,
  type PickerProduct,
} from "@/components/product-picker-input";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Wrench, Printer, User, ShoppingCart, ClipboardList } from "lucide-react";
import { createServiceTicket } from "./actions";
import { formatVND } from "@/lib/format";
import { printInBackground } from "@/lib/print";

type Customer = { id: string; code: string; name: string; phone: string };
type Technician = { id: string; name: string };

type ServiceItemDraft = {
  id: string;
  productId: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
};

const DEVICE_TYPES = [
  { value: "phone", label: "Điện thoại" },
  { value: "laptop", label: "Laptop" },
  { value: "tablet", label: "Máy tính bảng" },
  { value: "other", label: "Khác" },
];

export function ServiceForm({
  customers,
  technicians,
  products,
  onCreated,
}: {
  customers: Customer[];
  technicians: Technician[];
  products: PickerProduct[];
  onCreated?: (info: { id: string; code: string; print: boolean }) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [customer, setCustomer] = useState<CustomerSelection>({ mode: "none" });
  const [device, setDevice] = useState({
    type: "phone",
    brand: "",
    model: "",
    imei: "",
    accessories: "",
    appearance: "",
    problem: "",
  });
  const [items, setItems] = useState<ServiceItemDraft[]>([
    {
      id: crypto.randomUUID(),
      productId: null,
      description: "",
      quantity: 1,
      unitPrice: 0,
    },
  ]);
  const [deposit, setDeposit] = useState<string>("");
  const [assignedToId, setAssignedToId] = useState<string>("");
  const [promisedAt, setPromisedAt] = useState(() => defaultPromisedAt());
  const [note, setNote] = useState("");

  function setDev<K extends keyof typeof device>(k: K, v: string) {
    setDevice((d) => ({ ...d, [k]: v }));
  }

  function addItem() {
    setItems((curr) => [
      ...curr,
      {
        id: crypto.randomUUID(),
        productId: null,
        description: "",
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  }
  function updateItem(id: string, patch: Partial<ServiceItemDraft>) {
    setItems((curr) => curr.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }
  function removeItem(id: string) {
    setItems((curr) => curr.filter((i) => i.id !== id));
  }

  const validItems = items.filter(
    (i) => i.description.trim() && i.quantity > 0,
  );
  const estimatedCost = validItems.reduce(
    (s, i) => s + i.unitPrice * i.quantity,
    0,
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (customer.mode === "none") {
      toast.error("Vui lòng nhập SĐT khách hàng");
      return;
    }
    if (customer.mode === "new" && !customer.name.trim()) {
      toast.error("Vui lòng nhập tên khách hàng mới");
      return;
    }
    if (!device.brand.trim()) {
      toast.error("Vui lòng nhập hãng máy");
      return;
    }
    if (!device.model.trim()) {
      toast.error("Vui lòng nhập model máy");
      return;
    }
    if (!device.problem.trim()) {
      toast.error("Vui lòng mô tả tình trạng / yêu cầu");
      return;
    }

    const payload = {
      customer:
        customer.mode === "existing"
          ? { id: customer.customer.id }
          : { name: customer.name.trim(), phone: customer.phone.trim() },
      device: {
        type: device.type,
        brand: device.brand.trim() || null,
        model: device.model.trim() || null,
        imei: device.imei.trim() || null,
        accessories: device.accessories.trim() || null,
        appearance: device.appearance.trim() || null,
        problem: device.problem.trim(),
      },
      items: validItems.map((i) => ({
        productId: i.productId,
        description: i.description.trim(),
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      estimatedCost,
      deposit: Number(deposit) || 0,
      assignedToId: assignedToId || null,
      promisedAt: promisedAt || null,
      note: note.trim() || null,
    };

    startTransition(async () => {
      const res = await createServiceTicket(payload);
      if (res.ok) {
        toast.success(`Tạo phiếu ${res.code} thành công!`);
        await printInBackground(`/service/${res.id}/intake`);
        if (onCreated) {
          onCreated({ id: res.id, code: res.code, print: true });
        } else {
          router.push(`/service/${res.id}`);
        }
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-5 pb-10">
      {/* Left Column */}
      <div className="lg:col-span-8 space-y-5">
        <Card className="shadow-sm border-border/60">
          <CardHeader className="border-b bg-muted/5 py-4">
            <div className="flex items-center gap-2">
              <Wrench className="size-4 text-primary" />
              <CardTitle className="text-sm font-bold uppercase tracking-tight">Thông tin thiết bị</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Loại thiết bị" required>
                <SelectField
                  value={device.type}
                  onValueChange={(v) => setDev("type", v)}
                  options={DEVICE_TYPES}
                  className="w-full h-9"
                />
              </Field>
              <Field label="Hãng máy" required>
                <Input
                  value={device.brand}
                  onChange={(e) => setDev("brand", e.target.value)}
                  placeholder="Apple, Dell, Samsung..."
                  className="h-9"
                  required
                />
              </Field>
              <Field label="Model máy" required>
                <Input
                  value={device.model}
                  onChange={(e) => setDev("model", e.target.value)}
                  placeholder="VD: iPhone 13 Pro Max..."
                  className="h-9"
                  required
                />
              </Field>
              <Field label="IMEI / Serial">
                <Input
                  value={device.imei}
                  onChange={(e) => setDev("imei", e.target.value)}
                  placeholder="Nhập IMEI/Serial..."
                  className="h-9 font-mono"
                />
              </Field>
              <Field label="Phụ kiện kèm">
                <Input
                  value={device.accessories}
                  onChange={(e) => setDev("accessories", e.target.value)}
                  placeholder="Sạc, cáp, túi..."
                  className="h-9"
                />
              </Field>
              <Field label="Ngoại quan">
                <Input
                  value={device.appearance}
                  onChange={(e) => setDev("appearance", e.target.value)}
                  placeholder="Trầy xước, móp..."
                  className="h-9"
                />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Tình trạng hư hỏng & Yêu cầu của khách" required>
                <Textarea
                  value={device.problem}
                  onChange={(e) => setDev("problem", e.target.value)}
                  rows={3}
                  placeholder="Mô tả chi tiết lỗi và yêu cầu từ khách hàng..."
                  className="resize-none mt-1"
                  required
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/60 overflow-visible">
          <CardHeader className="border-b bg-muted/5 py-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="size-4 text-primary" />
              <CardTitle className="text-sm font-bold uppercase tracking-tight">Báo giá dịch vụ</CardTitle>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              className="h-8 gap-1"
            >
              <Plus className="size-3.5" />
              Thêm dòng
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {items.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-12 gap-3 p-4 items-start bg-white hover:bg-muted/5 transition-colors">
                  <div className="col-span-12 sm:col-span-6">
                    <ProductPickerInput
                      products={products}
                      value={item.description}
                      onTextChange={(text) => updateItem(item.id, { description: text, productId: null })}
                      onSelect={(p) => updateItem(item.id, { productId: p.id, description: p.name, unitPrice: p.price })}
                      placeholder={idx === 0 ? "Tên linh kiện / dịch vụ..." : "Hạng mục khác..."}
                      className="h-9"
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) || 1 })}
                      className="h-9 text-center"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <div className="relative">
                      <Input
                        type="number"
                        min={0}
                        step={1000}
                        value={item.unitPrice || ""}
                        onChange={(e) => updateItem(item.id, { unitPrice: Number(e.target.value) || 0 })}
                        placeholder="Đơn giá"
                        className="h-9 pr-7"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground uppercase">đ</span>
                    </div>
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="h-9 w-9 text-muted-foreground hover:text-destructive"
                      disabled={items.length === 1}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/60">
          <CardHeader className="py-3 border-b bg-muted/5">
            <div className="flex items-center gap-2">
              <ClipboardList className="size-4 text-muted-foreground" />
              <CardTitle className="text-xs font-bold uppercase tracking-tight text-muted-foreground">Ghi chú nội bộ</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Ghi chú cho kỹ thuật viên..."
              className="resize-none h-16 border-none focus-visible:ring-0 p-0 shadow-none"
            />
          </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className="lg:col-span-4 space-y-5">
        <Card className="shadow-sm border-border/60 overflow-visible">
          <CardHeader className="border-b bg-muted/5 py-4">
            <div className="flex items-center gap-2">
              <User className="size-4 text-primary" />
              <CardTitle className="text-sm font-bold uppercase tracking-tight">Khách hàng</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <CustomerPhoneField
              customers={customers}
              value={customer}
              onChange={setCustomer}
              label="Số điện thoại / Tên khách"
              required
            />
          </CardContent>
        </Card>

        <Card className="shadow-md border-primary/20 overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground py-4">
             <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-90">Thanh toán & Hẹn trả</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg border border-border/40">
               <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Tổng dự kiến chi phí</div>
               <div className="text-2xl font-black text-primary tracking-tight">
                  {formatVND(estimatedCost)}
               </div>
            </div>

            <div className="space-y-4">
              <Field label="Số tiền đặt cọc">
                <div className="relative">
                  <Input
                    type="number"
                    min={0}
                    step={10000}
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                    placeholder="0"
                    className="h-10 pr-7 font-bold"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">đ</span>
                </div>
              </Field>
              
              <Field label="Ngày hẹn trả">
                <Input
                  type="datetime-local"
                  value={promisedAt}
                  onChange={(e) => setPromisedAt(e.target.value)}
                  className="h-10 font-medium"
                />
              </Field>

              <Field label="Kỹ thuật phụ trách">
                <SelectField
                  value={assignedToId}
                  onValueChange={setAssignedToId}
                  placeholder="Chưa phân công"
                  options={technicians.map((t) => ({ value: t.id, label: t.name }))}
                  className="h-10 w-full"
                />
              </Field>
            </div>

            <div className="pt-2 space-y-2">
              <Button
                type="submit"
                disabled={pending}
                className="w-full h-11 text-sm font-bold uppercase tracking-wider"
              >
                {pending ? <Loader2 className="size-4 animate-spin" /> : <><Printer className="size-4 mr-2" /> Lưu & In phiếu</>}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                disabled={pending}
                className="w-full h-9 text-xs text-muted-foreground"
              >
                Hủy bỏ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}

function defaultPromisedAt() {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  d.setHours(17, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}
