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

  const tabs: { key: TabKey; label: string; icon: typeof PackagePlus }[] = [
    { key: "in", label: "Nhập kho", icon: PackagePlus },
    { key: "out", label: "Xuất kho", icon: PackageMinus },
    { key: "adjust", label: "Kiểm kê", icon: ClipboardCheck },
    { key: "history", label: "Lịch sử", icon: History },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý kho</h1>
          <p className="text-sm text-muted-foreground">
            Nhập – xuất – kiểm kê và xem lịch sử biến động tồn kho.
          </p>
        </div>
      </div>

      <div className="flex gap-1.5 border-b">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-1.5 px-3 h-9 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="size-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "in" && <StockInForm products={products} />}
      {tab === "out" && <StockOutForm products={products} />}
      {tab === "adjust" && <StockAdjustForm products={products} />}
      {tab === "history" && <MovementHistory movements={movements} />}
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
    <div className="space-y-2">
      <Label>Sản phẩm *</Label>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo SKU, tên, hãng..."
          className="pl-9"
        />
      </div>
      <div className="border rounded-md divide-y max-h-56 overflow-auto">
        {filtered.length === 0 && (
          <div className="p-3 text-center text-sm text-muted-foreground">
            Không có sản phẩm khớp.
          </div>
        )}
        {filtered.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted/50 ${
              value === p.id ? "bg-primary/5" : ""
            }`}
          >
            <div className="min-w-0">
              <div className="font-medium truncate">{p.name}</div>
              <div className="text-[11px] font-mono text-muted-foreground">
                {p.sku}
                {p.brand ? ` · ${p.brand}` : ""}
              </div>
            </div>
            <Badge variant="outline" className="shrink-0">
              Tồn: {p.stock}
            </Badge>
          </button>
        ))}
      </div>
      {selected && (
        <div className="rounded-md border bg-muted/40 px-3 py-2 text-xs">
          <span className="font-medium">{selected.name}</span>
          <span className="ml-2 font-mono text-muted-foreground">
            {selected.sku}
          </span>
          <span className="ml-2 text-muted-foreground">
            · Tồn hiện tại: <span className="font-medium">{selected.stock}</span>
          </span>
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ArrowDownToLine className="size-4" />
          Nhập kho
        </CardTitle>
        <CardDescription>
          Thêm hàng mới vào kho — vd: NCC giao hàng, hàng trả về.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProductPicker
          products={products}
          value={productId}
          onChange={setProductId}
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Số lượng nhập *</Label>
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label>Giá nhập / đơn vị</Label>
            <Input
              type="number"
              min={0}
              value={unitCost}
              onChange={(e) => setUnitCost(Number(e.target.value) || 0)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Mã / NCC tham chiếu</Label>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="VD: PO-2025-001"
            />
          </div>
          <div>
            <Label>Lý do / ghi chú</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Mua hàng đợt 1"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={submit} disabled={pending}>
            {pending ? "Đang xử lý..." : "Xác nhận nhập kho"}
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ArrowUpFromLine className="size-4" />
          Xuất kho
        </CardTitle>
        <CardDescription>
          Xuất hàng khỏi kho không qua hoá đơn — vd: bảo hành, hư hỏng, tặng.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProductPicker
          products={products}
          value={productId}
          onChange={setProductId}
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Số lượng xuất *</Label>
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label>Mã / phiếu tham chiếu</Label>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="VD: SC00012"
            />
          </div>
        </div>
        <div>
          <Label>Lý do *</Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="VD: Xuất linh kiện sửa chữa, bảo hành đổi mới..."
            rows={2}
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={submit} disabled={pending}>
            {pending ? "Đang xử lý..." : "Xác nhận xuất kho"}
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings2 className="size-4" />
          Kiểm kê
        </CardTitle>
        <CardDescription>
          Điều chỉnh số tồn về đúng thực tế khi kiểm kho định kỳ.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProductPicker
          products={products}
          value={productId}
          onChange={(id) => {
            setProductId(id);
            const p = products.find((p) => p.id === id);
            if (p) setNewStock(p.stock);
          }}
        />
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>Tồn hệ thống</Label>
            <Input value={selected?.stock ?? 0} disabled />
          </div>
          <div>
            <Label>Tồn thực tế *</Label>
            <Input
              type="number"
              min={0}
              value={newStock}
              onChange={(e) => setNewStock(Number(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label>Chênh lệch</Label>
            <Input
              value={delta > 0 ? `+${delta}` : delta}
              disabled
              className={
                delta === 0
                  ? ""
                  : delta > 0
                    ? "text-green-600 font-semibold"
                    : "text-red-600 font-semibold"
              }
            />
          </div>
        </div>
        <div>
          <Label>Lý do điều chỉnh</Label>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="VD: Kiểm kê tháng 5 — mất hàng / phát sinh thêm"
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={submit} disabled={pending || delta === 0}>
            {pending ? "Đang xử lý..." : "Xác nhận điều chỉnh"}
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="size-4" />
          Lịch sử biến động ({movements.length})
        </CardTitle>
        <CardDescription>
          100 phiếu nhập/xuất/kiểm kê gần nhất.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm SKU, sản phẩm, mã tham chiếu..."
              className="pl-8 h-9"
            />
          </div>
          <SelectField
            value={type}
            onValueChange={(v) => setType(v as typeof type)}
            options={[
              { value: "all", label: "Tất cả" },
              { value: "in", label: "Nhập kho" },
              { value: "out", label: "Xuất kho" },
              { value: "adjust", label: "Kiểm kê" },
            ]}
            className="w-40"
          />
        </div>
        <div className="border rounded-md overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs">
              <tr>
                <th className="px-3 py-2 text-left">Thời gian</th>
                <th className="px-3 py-2 text-left">Loại</th>
                <th className="px-3 py-2 text-left">Sản phẩm</th>
                <th className="px-3 py-2 text-right">SL</th>
                <th className="px-3 py-2 text-right">Trước → Sau</th>
                <th className="px-3 py-2 text-right">Giá nhập</th>
                <th className="px-3 py-2 text-left">Lý do / Tham chiếu</th>
                <th className="px-3 py-2 text-left">NV</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-6 text-center text-muted-foreground text-xs"
                  >
                    Chưa có biến động nào.
                  </td>
                </tr>
              )}
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-muted/40">
                  <td className="px-3 py-2 text-xs whitespace-nowrap">
                    {formatDateTime(new Date(m.createdAt))}
                  </td>
                  <td className="px-3 py-2">
                    {m.type === "in" && (
                      <Badge className="bg-green-100 text-green-700 border-green-300">
                        Nhập
                      </Badge>
                    )}
                    {m.type === "out" && (
                      <Badge className="bg-red-100 text-red-700 border-red-300">
                        Xuất
                      </Badge>
                    )}
                    {m.type === "adjust" && (
                      <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                        Kiểm kê
                      </Badge>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{m.productName}</div>
                    <div className="text-[11px] font-mono text-muted-foreground">
                      {m.productSku}
                    </div>
                  </td>
                  <td
                    className={`px-3 py-2 text-right font-mono font-semibold ${
                      m.quantity > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                  </td>
                  <td className="px-3 py-2 text-right text-xs text-muted-foreground">
                    {m.before} → {m.after}
                  </td>
                  <td className="px-3 py-2 text-right text-xs">
                    {m.unitCost > 0 ? formatVND(m.unitCost) : "—"}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {m.reason || "—"}
                    {m.reference && (
                      <span className="ml-1 font-mono text-muted-foreground">
                        ({m.reference})
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {m.userName}
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
