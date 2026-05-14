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
        toast.error(res.error || "Có lỗi xảy ra");
      }
    });
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-10">
      {/* Left Column: Device & Service Details */}
      <div className="lg:col-span-8 space-y-6">
        {/* Device Information Card */}
        <Card className="border-none shadow-xl shadow-black/5 bg-card/80 backdrop-blur-md overflow-hidden transition-all hover:shadow-black/10">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <Wrench className="size-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-black tracking-tight uppercase">Thông tin thiết bị</CardTitle>
                <p className="text-xs text-muted-foreground font-medium">Chi tiết về thiết bị khách hàng bàn giao</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Field label="Loại thiết bị" icon={<Wrench className="size-3.5" />}>
                <SelectField
                  value={device.type}
                  onValueChange={(v) => setDev("type", v)}
                  options={DEVICE_TYPES}
                  className="w-full bg-muted/30 border-muted-foreground/10 h-10 rounded-xl"
                />
              </Field>
              <Field label="Hãng máy" required>
                <Input
                  value={device.brand}
                  onChange={(e) => setDev("brand", e.target.value)}
                  placeholder="Apple, Dell, Samsung..."
                  className="bg-muted/30 border-muted-foreground/10 h-10 rounded-xl focus:ring-primary/20"
                  required
                />
              </Field>
              <Field label="Model máy" required>
                <Input
                  value={device.model}
                  onChange={(e) => setDev("model", e.target.value)}
                  placeholder="Latitude 7470, iPhone 13..."
                  className="bg-muted/30 border-muted-foreground/10 h-10 rounded-xl focus:ring-primary/20"
                  required
                />
              </Field>
              <Field label="IMEI / Serial">
                <Input
                  value={device.imei}
                  onChange={(e) => setDev("imei", e.target.value)}
                  placeholder="Nhập IMEI hoặc Serial..."
                  className="font-mono bg-muted/30 border-muted-foreground/10 h-10 rounded-xl focus:ring-primary/20"
                />
              </Field>
              <Field label="Phụ kiện kèm">
                <Input
                  value={device.accessories}
                  onChange={(e) => setDev("accessories", e.target.value)}
                  placeholder="Sạc, cáp, túi chống sốc..."
                  className="bg-muted/30 border-muted-foreground/10 h-10 rounded-xl focus:ring-primary/20"
                />
              </Field>
              <Field label="Ngoại quan">
                <Input
                  value={device.appearance}
                  onChange={(e) => setDev("appearance", e.target.value)}
                  placeholder="Trầy nhẹ, móp góc..."
                  className="bg-muted/30 border-muted-foreground/10 h-10 rounded-xl focus:ring-primary/20"
                />
              </Field>
            </div>
            <Field label="Tình trạng hư hỏng & Yêu cầu của khách" required>
              <Textarea
                value={device.problem}
                onChange={(e) => setDev("problem", e.target.value)}
                rows={4}
                placeholder="Mô tả chi tiết lỗi và yêu cầu sửa chữa từ khách hàng..."
                className="bg-muted/30 border-muted-foreground/10 rounded-xl focus:ring-primary/20 resize-none py-3"
                required
              />
            </Field>
          </CardContent>
        </Card>

        {/* Service Quoting Card */}
        <Card className="border-none shadow-xl shadow-black/5 bg-card/80 backdrop-blur-md overflow-visible transition-all hover:shadow-black/10">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                  <ShoppingCart className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-black tracking-tight uppercase">Báo giá dịch vụ</CardTitle>
                  <p className="text-xs text-muted-foreground font-medium">Linh kiện dự kiến và tiền công sửa chữa</p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="h-9 rounded-xl px-4 font-bold border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
              >
                <Plus className="size-4 mr-1.5" />
                Thêm dịch vụ
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="group relative grid grid-cols-12 gap-3 items-start p-4 rounded-2xl bg-muted/10 border border-transparent hover:border-primary/20 hover:bg-white transition-all"
              >
                <div className="col-span-12 sm:col-span-6">
                  <ProductPickerInput
                    products={products}
                    value={item.description}
                    onTextChange={(text) =>
                      updateItem(item.id, {
                        description: text,
                        productId: null,
                      })
                    }
                    onSelect={(p) =>
                      updateItem(item.id, {
                        productId: p.id,
                        description: p.name,
                        unitPrice: p.price,
                      })
                    }
                    placeholder={
                      idx === 0
                        ? "Tìm linh kiện / dịch vụ..."
                        : "Thêm hạng mục khác..."
                    }
                    className="bg-white border-muted-foreground/10 h-10 rounded-xl"
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(item.id, {
                        quantity: Number(e.target.value) || 1,
                      })
                    }
                    className="bg-white border-muted-foreground/10 h-10 rounded-xl text-center font-bold"
                  />
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      step={1000}
                      value={item.unitPrice || ""}
                      onChange={(e) =>
                        updateItem(item.id, {
                          unitPrice: Number(e.target.value) || 0,
                        })
                      }
                      placeholder="Đơn giá"
                      className="bg-white border-muted-foreground/10 h-10 rounded-xl pr-10 font-bold text-primary"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground opacity-50 uppercase">đ</span>
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    className="size-10 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    disabled={items.length === 1}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-center py-10 border-2 border-dashed border-muted rounded-3xl">
                 <p className="text-sm text-muted-foreground font-medium">Chưa có hạng mục báo giá nào</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Internal Notes Card */}
        <Card className="border-none shadow-xl shadow-black/5 bg-card/80 backdrop-blur-md transition-all hover:shadow-black/10">
          <CardHeader className="pb-3">
             <div className="flex items-center gap-3">
                <div className="p-2.5 bg-muted rounded-xl text-muted-foreground">
                  <ClipboardList className="size-5" />
                </div>
                <CardTitle className="text-sm font-black tracking-tight uppercase">Ghi chú nội bộ</CardTitle>
             </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Thông tin lưu ý cho kỹ thuật viên hoặc bộ phận kho..."
              className="bg-muted/30 border-muted-foreground/10 rounded-xl resize-none focus:ring-primary/20"
            />
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Customer & Totals */}
      <div className="lg:col-span-4 space-y-6">
        {/* Customer Information Card */}
        <Card className="border-none shadow-xl shadow-black/5 bg-card/80 backdrop-blur-md overflow-visible transition-all hover:shadow-black/10 ring-2 ring-primary/5">
          <CardHeader className="bg-primary/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20">
                <User className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-black tracking-tight uppercase">Khách hàng</CardTitle>
                <p className="text-[10px] text-muted-foreground font-bold">Thông tin liên hệ bắt buộc</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <CustomerPhoneField
              customers={customers}
              value={customer}
              onChange={setCustomer}
              label="Tìm kiếm hoặc thêm khách hàng"
              required
            />
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card className="border-none shadow-2xl shadow-primary/10 bg-primary text-primary-foreground overflow-hidden relative">
          <div className="absolute top-0 right-0 p-10 -mr-10 -mt-10 bg-white/10 rounded-full blur-3xl" />
          <CardHeader className="pb-4 relative z-10">
            <CardTitle className="text-sm font-black tracking-widest uppercase opacity-80">Tổng kết phiếu nhận</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <div className="space-y-2">
               <div className="flex items-center justify-between opacity-80 text-xs font-bold uppercase tracking-wider">
                  <span>Tổng dự kiến</span>
                  <Wrench className="size-4" />
               </div>
               <div className="text-4xl font-black tracking-tighter">
                  {formatVND(estimatedCost)}
               </div>
            </div>
            
            <div className="h-px bg-white/20 w-full" />
            
            <div className="grid grid-cols-1 gap-4">
              <Field label="Số tiền đặt cọc (nếu có)" labelColor="text-white/80">
                <div className="relative">
                  <Input
                    type="number"
                    min={0}
                    step={10000}
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                    placeholder="0"
                    className="bg-white/10 border-white/20 h-12 rounded-xl focus:ring-white/40 text-lg font-black placeholder:text-white/30 text-white"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-white/40 uppercase text-xs">đ</span>
                </div>
              </Field>
              
              <Field label="Hẹn ngày trả máy" labelColor="text-white/80">
                <Input
                  type="datetime-local"
                  value={promisedAt}
                  onChange={(e) => setPromisedAt(e.target.value)}
                  className="bg-white/10 border-white/20 h-12 rounded-xl focus:ring-white/40 font-bold text-white [color-scheme:dark]"
                />
              </Field>

              <Field label="Kỹ thuật viên phụ trách" labelColor="text-white/80">
                <SelectField
                  value={assignedToId}
                  onValueChange={setAssignedToId}
                  placeholder="Chọn nhân viên kỹ thuật"
                  options={technicians.map((t) => ({
                    value: t.id,
                    label: t.name,
                  }))}
                  className="bg-white/10 border-white/20 h-12 rounded-xl focus:ring-white/40 font-bold text-white"
                />
              </Field>
            </div>

            <div className="pt-4 space-y-3">
              <Button
                type="submit"
                disabled={pending}
                className="w-full bg-white text-primary hover:bg-white/90 h-14 rounded-2xl font-black uppercase tracking-widest text-base shadow-xl shadow-black/20 transition-all hover:-translate-y-1 active:translate-y-0"
              >
                {pending ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <>
                    <Printer className="size-5 mr-2" />
                    Lưu & In phiếu nhận
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                disabled={pending}
                className="w-full text-white/60 hover:text-white hover:bg-white/10 h-10 rounded-xl font-bold uppercase text-[10px] tracking-widest"
              >
                Huỷ bỏ phiếu này
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
  icon,
  required,
  labelColor = "text-muted-foreground",
}: {
  label: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  required?: boolean;
  labelColor?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 px-1">
        {icon && <span className="opacity-50">{icon}</span>}
        <Label className={cn("text-[11px] font-black uppercase tracking-wider", labelColor)}>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      </div>
      {children}
    </div>
  );
}
