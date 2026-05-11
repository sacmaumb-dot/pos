"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SelectField } from "@/components/ui/select-field";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as Icons from "lucide-react";
import {
  Search,
  Plus,
  Minus,
  X,
  ShoppingCart,
  Trash2,
  Receipt,
  Loader2,
  ChevronDown,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatVND } from "@/lib/format";
import { printInBackground } from "@/lib/print";
import { toast } from "sonner";
import { createSale } from "./actions";
import {
  CustomerPhoneField,
  type CustomerSelection,
} from "@/components/customer-phone-field";

type Product = {
  id: string;
  sku: string;
  name: string;
  brand: string | null;
  price: number;
  stock: number;
  categoryType: string;
  categoryIcon: string;
  categoryId: string;
};

type Category = { id: string; name: string; type: string; icon: string };
type Customer = { id: string; name: string; phone: string; code: string };

type CartItem = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  imei?: string;
};

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const pascalName = name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  const IconComponent = (Icons as any)[pascalName] || Icons.Package;
  return <IconComponent className={className} />;
}

const PAYMENT_OPTIONS = [
  { value: "cash", label: "Tiền mặt" },
  { value: "transfer", label: "Chuyển khoản" },
];

export function PosClient({
  products,
  categories,
  customers,
  onCreated,
  showHeader = true,
}: {
  products: Product[];
  categories: Category[];
  customers: Customer[];
  onCreated?: (info: { id: string; code: string; print: boolean }) => void;
  showHeader?: boolean;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<CustomerSelection>({ mode: "none" });
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [discount, setDiscount] = useState<number>(0);
  const [note, setNote] = useState("");
  const [openCheckout, setOpenCheckout] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (activeCat !== "all" && p.categoryId !== activeCat) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.brand || "").toLowerCase().includes(q)
      );
    });
  }, [products, search, activeCat]);

  function addToCart(p: Product) {
    if (p.stock <= 0 && p.categoryType !== "service") {
      toast.error("Sản phẩm đã hết hàng");
      return;
    }
    setCart((curr) => {
      const idx = curr.findIndex((c) => c.productId === p.id);
      if (idx >= 0) {
        const next = [...curr];
        if (next[idx].quantity >= p.stock && p.categoryType !== "service") {
          toast.error("Vượt quá số lượng tồn kho");
          return curr;
        }
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [
        ...curr,
        {
          productId: p.id,
          name: p.name,
          unitPrice: p.price,
          quantity: 1,
          discount: 0,
        },
      ];
    });
  }

  function updateQty(productId: string, qty: number) {
    if (qty <= 0) {
      setCart((curr) => curr.filter((c) => c.productId !== productId));
      return;
    }
    setCart((curr) =>
      curr.map((c) => (c.productId === productId ? { ...c, quantity: qty } : c)),
    );
  }

  function updateImei(productId: string, imei: string) {
    setCart((curr) =>
      curr.map((c) => (c.productId === productId ? { ...c, imei } : c)),
    );
  }

  function removeItem(productId: string) {
    setCart((curr) => curr.filter((c) => c.productId !== productId));
  }

  const subtotal = cart.reduce(
    (s, c) => s + c.unitPrice * c.quantity - c.discount,
    0,
  );
  const total = Math.max(0, subtotal - discount);
  const itemCount = cart.reduce((s, c) => s + c.quantity, 0);

  function handleCheckout() {
    if (cart.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }
    if (customer.mode === "none") {
      toast.error("Vui lòng nhập SĐT khách hàng");
      return;
    }
    if (customer.mode === "new" && !customer.name.trim()) {
      toast.error("Vui lòng nhập tên khách hàng mới");
      return;
    }
    setOpenCheckout(true);
  }

  function confirmCheckout() {
    startTransition(async () => {
      const customerPayload =
        customer.mode === "existing"
          ? { customerId: customer.customer.id }
          : customer.mode === "new"
            ? {
                newCustomer: {
                  name: customer.name.trim(),
                  phone: customer.phone.trim(),
                },
              }
            : {};
      const res = await createSale({
        items: cart,
        ...customerPayload,
        paymentMethod,
        discount,
        note,
      });
      if (res.ok) {
        toast.success(`Tạo hoá đơn ${res.code} thành công!`);
        setCart([]);
        setDiscount(0);
        setNote("");
        setCustomer({ mode: "none" });
        setOpenCheckout(false);
        setOpenCart(false);
        await printInBackground(`/sales/${res.id}`);
        if (onCreated) {
          onCreated({ id: res.id, code: res.code, print: true });
        } else {
          router.refresh();
          router.push(`/sales/${res.id}`);
        }
      } else {
        toast.error(res.error || "Có lỗi xảy ra");
      }
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 lg:h-[calc(100vh-140px)]">
      {/* Left Column: Product Selection */}
      <div className="flex flex-col gap-4 min-w-0 min-h-0">
        {/* Search & Categories Bar */}
        <div className="bg-card/65 backdrop-blur-sm border border-border/80 rounded-2xl p-4 shadow-sm flex flex-col gap-4">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Tìm theo tên, mã SKU, thương hiệu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 bg-background/50 border-border/60 rounded-xl focus-visible:ring-primary/20"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
             <button
                onClick={() => setActiveCat("all")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border",
                  activeCat === "all" 
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                    : "bg-background/50 text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground"
                )}
             >
                Tất cả
             </button>
             {categories.map((c) => (
               <button
                  key={c.id}
                  onClick={() => setActiveCat(c.id)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border flex items-center gap-2",
                    activeCat === c.id 
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                      : "bg-background/50 text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground"
                  )}
               >
                  <DynamicIcon name={c.icon || "package"} className="size-3.5" />
                  {c.name}
               </button>
             ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:pr-1 content-start pb-20 lg:pb-0">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              disabled={p.stock <= 0 && p.categoryType !== "service"}
              className="group relative flex flex-col text-left disabled:opacity-50 disabled:cursor-not-allowed w-full bg-white border border-slate-200 rounded-2xl p-4 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="size-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    <DynamicIcon name={p.categoryIcon} className="size-5" />
                  </div>
                  <span className="text-[11px] font-bold text-muted-foreground/60 font-mono tracking-tight uppercase">
                    {p.sku}
                  </span>
                </div>
                {p.categoryType !== "service" && (
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm border",
                      p.stock <= 0
                        ? "bg-rose-50 text-rose-500 border-rose-100"
                        : "bg-emerald-50 text-emerald-600 border-emerald-100"
                    )}
                  >
                    {p.stock <= 0 ? "Hết" : `Kho: ${p.stock}`}
                  </span>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-between gap-4">
                <h3 className="text-[14px] font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-primary transition-colors min-h-[2.5rem]">
                  {p.name}
                </h3>

                <div className="flex items-center justify-between">
                  <span className="text-[17px] font-black text-primary">
                    {formatVND(p.price)}
                  </span>
                  <div className="size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-300">
                    <Plus className="size-5" />
                  </div>
                </div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-24 flex flex-col items-center gap-4 bg-card/40 rounded-3xl border border-dashed border-border/60">
              <div className="size-16 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground/30">
                <Search className="size-8" />
              </div>
              <p className="text-sm font-medium text-muted-foreground/60">
                Không tìm thấy sản phẩm phù hợp.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Cart Panel */}
      <div className="hidden lg:block h-full">
        <CartPanel
          cart={cart}
          subtotal={subtotal}
          total={total}
          discount={discount}
          setDiscount={setDiscount}
          updateQty={updateQty}
          updateImei={updateImei}
          removeItem={removeItem}
          customers={customers}
          customer={customer}
          setCustomer={setCustomer}
          onCheckout={handleCheckout}
        />
      </div>

      {/* Mobile Cart Floating Bar */}
      <div className="lg:hidden fixed bottom-6 left-4 right-4 z-40">
        <Sheet open={openCart} onOpenChange={setOpenCart}>
          <SheetTrigger
            nativeButton={false}
            render={
              <div
                role="button"
                tabIndex={0}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full rounded-2xl shadow-2xl h-16 px-6 bg-slate-900 hover:bg-slate-800 border-t border-white/10 ring-1 ring-white/10 cursor-pointer"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <ShoppingCart className="size-6 text-white" />
                      {itemCount > 0 && (
                        <span className="absolute -top-2 -right-2 size-5 bg-primary text-primary-foreground text-[10px] font-black rounded-full flex items-center justify-center border-2 border-slate-900">
                          {itemCount}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Tổng tiền
                      </span>
                      <span className="text-lg font-black text-white">
                        {formatVND(total)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">
                      Xem giỏ hàng
                    </span>
                    <ChevronDown
                      className={cn(
                        "size-5 text-slate-400 transition-transform",
                        openCart && "rotate-180"
                      )}
                    />
                  </div>
                </div>
              </div>
            }
          />
          <SheetContent side="bottom" className="h-[90vh] p-0 rounded-t-[2.5rem] overflow-hidden border-t-0">
            <CartPanel
              cart={cart}
              subtotal={subtotal}
              total={total}
              discount={discount}
              setDiscount={setDiscount}
              updateQty={updateQty}
              updateImei={updateImei}
              removeItem={removeItem}
              customers={customers}
              customer={customer}
              setCustomer={setCustomer}
              onCheckout={handleCheckout}
              className="border-0 shadow-none rounded-none h-full"
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={openCheckout} onOpenChange={setOpenCheckout}>
        <DialogContent className="sm:max-w-md rounded-[2rem] border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black flex items-center gap-2">
               <Receipt className="size-5 text-primary" />
               Xác nhận thanh toán
            </DialogTitle>
            <DialogDescription>
              Vui lòng kiểm tra lại thông tin trước khi tạo hoá đơn.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-2xl bg-slate-50 p-4 space-y-3 border border-slate-100">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">Số lượng hàng</span>
                <span className="font-bold">{itemCount} sản phẩm</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">Tạm tính</span>
                <span className="font-bold">{formatVND(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">Giảm giá thêm</span>
                <span className="font-bold text-destructive">
                  -{formatVND(discount)}
                </span>
              </div>
              <Separator className="bg-slate-200" />
              <div className="flex justify-between items-center">
                <span className="font-black text-slate-900 uppercase tracking-wider text-xs">Tổng cộng</span>
                <span className="text-2xl font-black text-primary">
                  {formatVND(total)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phương thức thanh toán</Label>
                <SelectField
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  options={PAYMENT_OPTIONS}
                  className="w-full h-11 rounded-xl border-slate-200 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Ghi chú đơn hàng</Label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Giao hàng tận nơi, khuyến mãi đặc biệt..."
                  className="rounded-xl border-slate-200 focus-visible:ring-primary/20"
                  rows={3}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-3 sm:gap-0 sm:flex-row flex-col">
            <Button variant="ghost" onClick={() => setOpenCheckout(false)} className="rounded-xl h-12 font-bold flex-1">
              Quay lại
            </Button>
            <Button 
              onClick={() => confirmCheckout()} 
              disabled={pending}
              className="rounded-xl h-12 font-black flex-1 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              {pending ? <Loader2 className="size-4 animate-spin mr-2" /> : <Receipt className="size-4 mr-2" />}
              XÁC NHẬN & IN BILL
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CartPanel({
  cart,
  subtotal,
  total,
  discount,
  setDiscount,
  updateQty,
  updateImei,
  removeItem,
  customers,
  customer,
  setCustomer,
  onCheckout,
  className = "",
}: {
  cart: CartItem[];
  subtotal: number;
  total: number;
  discount: number;
  setDiscount: (v: number) => void;
  updateQty: (productId: string, qty: number) => void;
  updateImei: (productId: string, imei: string) => void;
  removeItem: (productId: string) => void;
  customers: Customer[];
  customer: CustomerSelection;
  setCustomer: (s: CustomerSelection) => void;
  onCheckout: () => void;
  className?: string;
}) {
  return (
    <Card
      className={`flex flex-col h-full max-h-[calc(100vh-140px)] border border-border/80 shadow-lg rounded-3xl overflow-hidden bg-card/65 backdrop-blur-sm ${className}`}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <ShoppingCart className="size-4" />
          </div>
          <span className="font-bold text-sm tracking-tight">Giỏ hàng</span>
        </div>
        <Badge variant="secondary" className="rounded-lg font-bold px-2 py-0.5 bg-background border shadow-sm">
          {cart.length} mặt hàng
        </Badge>
      </div>

      {/* Customer Selection */}
      <div className="p-4 border-b border-border/60 bg-muted/30">
        <CustomerPhoneField
          customers={customers}
          value={customer}
          onChange={setCustomer}
        />
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 [scrollbar-width:thin]">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 gap-4 opacity-50">
            <div className="size-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
               <ShoppingCart className="size-10" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-slate-500">Giỏ hàng đang trống</p>
              <p className="text-xs text-slate-400">Chọn sản phẩm bên trái để bắt đầu thanh toán.</p>
            </div>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.productId}
              className="group relative rounded-2xl border border-border/60 p-3.5 space-y-3 bg-white/50 hover:bg-white hover:border-primary/20 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-slate-800 leading-snug line-clamp-2">
                    {item.name}
                  </div>
                  <div className="text-[11px] font-bold text-primary mt-1">
                    {formatVND(item.unitPrice)}
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="size-7 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors flex items-center justify-center"
                  aria-label="Xoá"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>

              <div className="relative group/imei">
                 <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                    <Smartphone className="size-3" />
                 </div>
                 <Input
                    placeholder="IMEI / Serial number..."
                    value={item.imei || ""}
                    onChange={(e) => updateImei(item.productId, e.target.value)}
                    className="h-8 pl-8 text-[11px] rounded-lg bg-background/50 border-border/40 focus-visible:ring-primary/20"
                 />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center bg-muted/50 rounded-xl border border-border/40 p-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-lg hover:bg-white shadow-sm"
                    onClick={() => updateQty(item.productId, item.quantity - 1)}
                  >
                    <Minus className="size-3" />
                  </Button>
                  <div className="w-10 text-center text-xs font-black">
                    {item.quantity}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-lg hover:bg-white shadow-sm"
                    onClick={() => updateQty(item.productId, item.quantity + 1)}
                  >
                    <Plus className="size-3" />
                  </Button>
                </div>
                <div className="text-sm font-black text-slate-900">
                  {formatVND(item.unitPrice * item.quantity)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer / Summary */}
      <div className="border-t border-border/60 p-5 bg-gradient-to-b from-transparent to-primary/5 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
             <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Giảm giá trực tiếp</Label>
             {discount > 0 && (
                <button onClick={() => setDiscount(0)} className="text-[10px] font-bold text-primary hover:underline">Xoá giảm giá</button>
             )}
          </div>
          <div className="relative">
             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                <Minus className="size-3" />
             </div>
             <Input
                type="number"
                min={0}
                value={discount || ""}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                placeholder="Nhập số tiền giảm..."
                className="h-10 pl-8 rounded-xl bg-background/50 border-border/60 font-bold text-sm text-red-600 focus-visible:ring-primary/20"
             />
          </div>
        </div>

        <div className="space-y-2 py-2">
          <div className="flex justify-between text-xs font-bold text-slate-500">
            <span>Tạm tính</span>
            <span>{formatVND(subtotal)}</span>
          </div>
          <div className="flex justify-between text-xs font-bold text-red-500">
            <span>Giảm giá</span>
            <span>-{formatVND(discount)}</span>
          </div>
          <div className="pt-2 flex justify-between items-center">
            <span className="font-black text-slate-900 uppercase tracking-widest text-[11px]">Tổng cộng</span>
            <span className="text-2xl font-black text-primary tracking-tight">{formatVND(total)}</span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2">
          <Button
            variant="outline"
            className="col-span-2 h-12 rounded-xl border-border/60 font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
            onClick={() => {
               if (window.confirm("Bạn có muốn xoá toàn bộ giỏ hàng?")) {
                  cart.forEach((c) => removeItem(c.productId));
                  setDiscount(0);
               }
            }}
            disabled={cart.length === 0}
          >
            <X className="size-4 mr-2" />
            Huỷ đơn
          </Button>
          <Button 
            className="col-span-3 h-12 rounded-xl font-black bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
            onClick={onCheckout} 
            disabled={cart.length === 0}
          >
            <Receipt className="size-4 mr-2" />
            THANH TOÁN
          </Button>
        </div>
      </div>
    </Card>
  );
}
