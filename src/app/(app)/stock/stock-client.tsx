"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  PackagePlus,
  PackageMinus,
  ClipboardCheck,
  History,
  Search,
  ArrowDownToLine,
  ArrowUpFromLine,
  Settings2,
  Box,
  LayoutGrid,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SelectField } from "@/components/ui/select-field";
import { formatVND, formatDateTime } from "@/lib/format";
import { stockIn, stockOut, stockAdjust } from "./actions";
import { cn } from "@/lib/utils";

type Product = {
  id: string;
  sku: string;
  name: string;
  brand: string | null;
  stock: number;
  costPrice: number;
  categoryName: string;
};

type Movement = {
  id: string;
  type: string;
  quantity: number;
  before: number;
  after: number;
  unitCost: number;
  reason: string | null;
  reference: string | null;
  createdAt: string;
  productSku: string;
  productName: string;
  userName: string;
};

type TabKey = "in" | "out" | "adjust" | "history";

export function StockClient({
  products,
  movements: initialMovements,
}: {
  products: Product[];
  movements: Movement[];
}) {
  const [tab, setTab] = useState<TabKey>("in");
  const [movements] = useState(initialMovements);

  const tabs: { key: TabKey; label: string; icon: any; color: string }[] = [
    { key: "in", label: "Nhập kho", icon: PackagePlus, color: "emerald" },
    { key: "out", label: "Xuất kho", icon: PackageMinus, color: "rose" },
    { key: "adjust", label: "Kiểm kê", icon: ClipboardCheck, color: "blue" },
    { key: "history", label: "Lịch sử biến động", icon: History, color: "slate" },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header section matched with Customers style */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-primary/5 via-blue-500/5 to-transparent p-6 rounded-2xl border border-border/50">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Box className="size-6 text-primary" />
            Điều phối kho hàng
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Theo dõi dòng chảy hàng hóa, linh kiện và quản lý xuất nhập tồn kho chuyên nghiệp.
          </p>
        </div>
      </div>

      {/* Modern Tabs styled as a segmented control */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-muted/30 backdrop-blur-sm border border-border/60 rounded-2xl w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
              tab === t.key
                ? "bg-card text-foreground shadow-md ring-1 ring-border/40 scale-105"
                : "text-muted-foreground hover:text-foreground hover:bg-card/40"
            )}
          >
            <t.icon className={cn(
              "size-4",
              tab === t.key && (
                t.color === "emerald" ? "text-emerald-500" :
                t.color === "rose" ? "text-rose-500" :
                t.color === "blue" ? "text-blue-500" : "text-primary"
              )
            )} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {tab === "in" && <StockInForm products={products} />}
        {tab === "out" && <StockOutForm products={products} />}
        {tab === "adjust" && <StockAdjustForm products={products} />}
        {tab === "history" && <MovementHistory movements={movements} />}
      </div>
    </div>
  );
}

function ProductPicker({
  products,
  value,
  onChange,
}: {
  products: Product[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return products.slice(0, 20);
    return products
      .filter(
        (p) =>
          p.sku.toLowerCase().includes(s) ||
          p.name.toLowerCase().includes(s) ||
          (p.brand || "").toLowerCase().includes(s),
      )
      .slice(0, 20);
  }, [products, q]);

  const selected = products.find((p) => p.id === value);

  return (
    <div className="space-y-3">
      <Label className="text-sm font-bold text-slate-700">Chọn sản phẩm cần xử lý *</Label>
      <div className="relative group">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-primary transition-colors" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nhập mã SKU, tên sản phẩm hoặc hãng..."
          className="pl-11 h-12 rounded-xl border-slate-200 focus:border-primary/50 focus:ring-primary/10 transition-all"
        />
      </div>
      <div className="border border-slate-100 rounded-2xl divide-y divide-slate-50 max-h-72 overflow-auto bg-slate-50/30">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
            <Box className="size-8 text-slate-200" />
            <p className="text-xs text-slate-400 font-medium">Không tìm thấy sản phẩm khớp.</p>
          </div>
        )}
        {filtered.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            className={cn(
              "w-full flex items-center justify-between gap-4 px-4 py-3 text-left transition-all hover:bg-white",
              value === p.id ? "bg-white ring-1 ring-primary/20" : ""
            )}
          >
            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-900 truncate group-hover:text-primary">{p.name}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{p.sku}</span>
                {p.brand && <span className="text-[10px] text-slate-400">· {p.brand}</span>}
              </div>
            </div>
            <div className="flex flex-col items-end shrink-0">
               <Badge variant={p.stock <= 5 ? "destructive" : "secondary"} className="text-[10px] font-black h-5 px-2 rounded-lg">
                 Tồn: {p.stock}
               </Badge>
               <span className="text-[10px] text-slate-400 mt-1 font-medium">{p.categoryName}</span>
            </div>
          </button>
        ))}
      </div>
      {selected && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 animate-in zoom-in-95 duration-300">
           <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                 <Box className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                 <div className="text-sm font-black text-slate-900 truncate">{selected.name}</div>
                 <div className="text-[11px] font-bold text-primary/70">Đang chọn để thực hiện giao dịch kho</div>
              </div>
              <div className="text-right">
                 <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Tồn hiện tại</div>
                 <div className="text-lg font-black text-primary">{selected.stock}</div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function StockInForm({ products }: { products: Product[] }) {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitCost, setUnitCost] = useState(0);
  const [reason, setReason] = useState("");
  const [reference, setReference] = useState("");
  const [pending, start] = useTransition();

  const submit = () => {
    if (!productId) return toast.error("Chọn sản phẩm");
    if (quantity <= 0) return toast.error("SL phải > 0");
    start(async () => {
      const res = await stockIn({
        productId,
        quantity,
        unitCost,
        reason: reason || undefined,
        reference: reference || undefined,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(`Đã nhập ${quantity} (${res.before} → ${res.after})`);
      setQuantity(1);
      setUnitCost(0);
      setReason("");
      setReference("");
      setProductId("");
    });
  };

  return (
    <Card className="border border-border/80 shadow-lg rounded-2xl overflow-hidden bg-card/65 backdrop-blur-sm">
      <CardHeader className="bg-emerald-50/10 border-b border-border/60 py-5 px-6">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 shadow-sm">
             <ArrowDownToLine className="size-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-foreground">Nhập kho hàng hóa</CardTitle>
            <CardDescription className="text-xs">Tăng số lượng tồn kho — vd: NCC giao hàng, hàng hoàn trả.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 md:p-8 space-y-8">
        <ProductPicker
          products={products}
          value={productId}
          onChange={setProductId}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700">Số lượng nhập *</Label>
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value) || 0)}
              className="h-12 rounded-xl border-slate-200 text-lg font-bold"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700">Giá nhập / đơn vị (VND)</Label>
            <Input
              type="number"
              min={0}
              value={unitCost}
              onChange={(e) => setUnitCost(Number(e.target.value) || 0)}
              className="h-12 rounded-xl border-slate-200 text-lg font-bold text-primary"
            />
            {unitCost > 0 && <p className="text-[11px] font-bold text-emerald-600">Thành tiền: {formatVND(unitCost * quantity)}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700">Số phiếu / NCC tham chiếu</Label>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="VD: PO-2025-001 hoặc Tên NCC"
              className="h-11 rounded-xl border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700">Lý do / Ghi chú</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Mua hàng linh kiện đợt 1"
              className="h-11 rounded-xl border-slate-200"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={submit} disabled={pending} className="h-12 px-8 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all">
            {pending ? "Đang xử lý..." : "Xác nhận nhập kho ngay"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StockOutForm({ products }: { products: Product[] }) {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [reference, setReference] = useState("");
  const [pending, start] = useTransition();

  const submit = () => {
    if (!productId) return toast.error("Chọn sản phẩm");
    if (quantity <= 0) return toast.error("SL phải > 0");
    start(async () => {
      const res = await stockOut({
        productId,
        quantity,
        reason: reason || undefined,
        reference: reference || undefined,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(`Đã xuất ${quantity} (${res.before} → ${res.after})`);
      setQuantity(1);
      setReason("");
      setReference("");
      setProductId("");
    });
  };

  return (
    <Card className="border border-border/80 shadow-lg rounded-2xl overflow-hidden bg-card/65 backdrop-blur-sm">
      <CardHeader className="bg-rose-50/10 border-b border-border/60 py-5 px-6">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center border border-rose-500/20 shadow-sm">
             <ArrowUpFromLine className="size-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-foreground">Xuất kho hàng hóa</CardTitle>
            <CardDescription className="text-xs">Giảm số lượng tồn — vd: bảo hành, hư hỏng, tiêu hao nội bộ.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 md:p-8 space-y-8">
        <ProductPicker
          products={products}
          value={productId}
          onChange={setProductId}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700">Số lượng xuất *</Label>
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value) || 0)}
              className="h-12 rounded-xl border-slate-200 text-lg font-bold"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700">Mã phiếu / Tham chiếu</Label>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="VD: SC00012 hoặc Mã bảo hành"
              className="h-12 rounded-xl border-slate-200"
            />
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t border-slate-50">
          <Label className="text-sm font-bold text-slate-700">Lý do xuất kho *</Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="VD: Xuất linh kiện thay thế cho khách hàng bảo hành, máy lỗi không thể sử dụng..."
            rows={3}
            className="rounded-xl border-slate-200 resize-none focus:ring-rose-500/10"
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={submit} disabled={pending} className="h-12 px-8 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all">
            {pending ? "Đang xử lý..." : "Xác nhận xuất kho ngay"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StockAdjustForm({ products }: { products: Product[] }) {
  const [productId, setProductId] = useState("");
  const [newStock, setNewStock] = useState(0);
  const [reason, setReason] = useState("");
  const [pending, start] = useTransition();

  const selected = products.find((p) => p.id === productId);
  const delta = selected ? newStock - selected.stock : 0;

  const submit = () => {
    if (!productId) return toast.error("Chọn sản phẩm");
    if (newStock < 0) return toast.error("Tồn kho không thể âm");
    start(async () => {
      const res = await stockAdjust({
        productId,
        newStock,
        reason: reason || undefined,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(`Đã cập nhật tồn (${res.before} → ${res.after})`);
      setNewStock(0);
      setReason("");
      setProductId("");
    });
  };

  return (
    <Card className="border border-border/80 shadow-lg rounded-2xl overflow-hidden bg-card/65 backdrop-blur-sm">
      <CardHeader className="bg-blue-50/10 border-b border-border/60 py-5 px-6">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-500/20 shadow-sm">
             <Settings2 className="size-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-foreground">Kiểm kê & Điều chỉnh</CardTitle>
            <CardDescription className="text-xs">Đồng bộ số tồn hệ thống với thực tế kiểm kho.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 md:p-8 space-y-8">
        <ProductPicker
          products={products}
          value={productId}
          onChange={(id) => {
            setProductId(id);
            const p = products.find((p) => p.id === id);
            if (p) setNewStock(p.stock);
          }}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700">Tồn hệ thống</Label>
            <div className="h-12 px-4 rounded-xl border border-slate-100 bg-slate-50 text-slate-500 font-bold flex items-center">
               {selected?.stock ?? 0}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700">Tồn thực tế *</Label>
            <Input
              type="number"
              min={0}
              value={newStock}
              onChange={(e) => setNewStock(Number(e.target.value) || 0)}
              className="h-12 rounded-xl border-slate-200 text-lg font-bold focus:ring-blue-500/10"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700">Chênh lệch</Label>
            <div className={cn(
              "h-12 px-4 rounded-xl border font-black flex items-center",
              delta === 0 ? "bg-slate-50 text-slate-400 border-slate-100" :
              delta > 0 ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
              "bg-rose-50 text-rose-600 border-rose-100"
            )}>
               {delta > 0 ? `+${delta}` : delta}
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t border-slate-50">
          <Label className="text-sm font-bold text-slate-700">Lý do điều chỉnh</Label>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="VD: Kiểm kê định kỳ tháng 5 — phát hiện mất hàng"
            className="h-12 rounded-xl border-slate-200"
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={submit} disabled={pending || delta === 0} className="h-12 px-8 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
            {pending ? "Đang xử lý..." : "Cập nhật tồn kho thực tế"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function MovementHistory({ movements }: { movements: Movement[] }) {
  const [type, setType] = useState<"all" | "in" | "out" | "adjust">("all");
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return movements.filter((m) => {
      if (type !== "all" && m.type !== type) return false;
      if (!s) return true;
      return (
        m.productName.toLowerCase().includes(s) ||
        m.productSku.toLowerCase().includes(s) ||
        (m.reference || "").toLowerCase().includes(s) ||
        (m.reason || "").toLowerCase().includes(s)
      );
    });
  }, [movements, type, q]);

  return (
    <Card className="border border-border/80 shadow-lg rounded-2xl overflow-hidden bg-card/65 backdrop-blur-sm">
      <CardHeader className="border-b border-border/60 py-4 px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2">
             <History className="size-4 text-primary" />
             Nhật ký biến động kho
          </CardTitle>
          <CardDescription className="text-xs">Xem lại 100 lần nhập/xuất/kiểm kho gần nhất.</CardDescription>
        </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative group min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm sản phẩm, mã SKU..."
                className="pl-9 h-10 rounded-xl border-slate-200 text-xs font-medium"
              />
            </div>
            <SelectField
              value={type}
              onValueChange={(v) => setType(v as typeof type)}
              options={[
                { value: "all", label: "Tất cả nghiệp vụ" },
                { value: "in", label: "Nhập kho" },
                { value: "out", label: "Xuất kho" },
                { value: "adjust", label: "Kiểm kê" },
              ]}
              className="w-44 h-10 rounded-xl text-xs font-bold"
            />
          </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] uppercase font-black text-slate-400 tracking-widest">Thời gian</th>
                <th className="px-6 py-4 text-left text-[10px] uppercase font-black text-slate-400 tracking-widest">Nghiệp vụ</th>
                <th className="px-6 py-4 text-left text-[10px] uppercase font-black text-slate-400 tracking-widest">Sản phẩm</th>
                <th className="px-6 py-4 text-right text-[10px] uppercase font-black text-slate-400 tracking-widest">Số lượng</th>
                <th className="px-6 py-4 text-right text-[10px] uppercase font-black text-slate-400 tracking-widest">Tồn (Trước → Sau)</th>
                <th className="px-6 py-4 text-left text-[10px] uppercase font-black text-slate-400 tracking-widest">Chi tiết / Nhân viên</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                       <History className="size-12 text-slate-100" />
                       <p className="text-slate-400 font-medium">Chưa có dữ liệu biến động kho nào.</p>
                    </div>
                  </td>
                </tr>
              )}
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs font-bold text-slate-700">{formatDateTime(new Date(m.createdAt))}</div>
                  </td>
                  <td className="px-6 py-4">
                    {m.type === "in" && (
                      <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50 font-bold px-2 py-0.5 text-[10px]">
                        NHẬP KHO
                      </Badge>
                    )}
                    {m.type === "out" && (
                      <Badge className="bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-50 font-bold px-2 py-0.5 text-[10px]">
                        XUẤT KHO
                      </Badge>
                    )}
                    {m.type === "adjust" && (
                      <Badge className="bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-50 font-bold px-2 py-0.5 text-[10px]">
                        KIỂM KÊ
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 group-hover:text-primary transition-colors">{m.productName}</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">{m.productSku}</div>
                  </td>
                  <td className={cn(
                    "px-6 py-4 text-right font-black text-base",
                    m.quantity > 0 ? "text-emerald-500" : "text-rose-500"
                  )}>
                    {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-xs font-bold text-slate-500">{m.before} <ArrowRightLeft className="inline size-2 mx-1" /> {m.after}</div>
                    {m.unitCost > 0 && <div className="text-[10px] text-emerald-600 font-bold mt-0.5">{formatVND(m.unitCost)}/sp</div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-medium text-slate-600 leading-relaxed">
                      {m.reason || "—"}
                      {m.reference && <Badge variant="outline" className="ml-1.5 font-mono text-[9px] border-slate-100 text-slate-400 bg-slate-50">{m.reference}</Badge>}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest flex items-center gap-1">
                       <LayoutGrid className="size-2.5" />
                       {m.userName}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
