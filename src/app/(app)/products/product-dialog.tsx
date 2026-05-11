"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SelectField } from "@/components/ui/select-field";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createProduct, updateProduct } from "./actions";

type Category = { id: string; name: string; type: string };

type ExistingProduct = {
  id: string;
  sku: string;
  name: string;
  brand: string | null;
  categoryId: string;
  price: number;
  costPrice: number;
  stock: number;
  warranty: number;
  description: string | null;
};

export function ProductDialog({
  categories,
  product,
  trigger,
  open: openProp,
  onOpenChange,
}: {
  categories: Category[];
  product?: ExistingProduct;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = (v: boolean) => {
    setInternalOpen(v);
    onOpenChange?.(v);
  };
  const isEdit = !!product;
  const [pending, startTransition] = useTransition();
  const initial = () => ({
    sku: product?.sku ?? "",
    name: product?.name ?? "",
    brand: product?.brand ?? "",
    categoryId: product?.categoryId ?? categories[0]?.id ?? "",
    price: product ? String(product.price) : "",
    costPrice: product ? String(product.costPrice) : "",
    stock: product ? String(product.stock) : "",
    warranty: product ? String(product.warranty) : "",
    description: product?.description ?? "",
  });
  const [form, setForm] = useState(initial);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
    if (open) setForm(initial());
  }, [open, product?.id]);

  function set<K extends keyof ReturnType<typeof initial>>(
    k: K,
    v: string | null,
  ) {
    setForm((f) => ({ ...f, [k]: v ?? "" }));
  }

  function submit() {
    if (!form.name || !form.categoryId) {
      toast.error("Vui lòng nhập tên và danh mục");
      return;
    }
    if (isEdit && !form.sku) {
      toast.error("SKU không được để trống");
      return;
    }
    startTransition(async () => {
      const payload = {
        sku: form.sku,
        name: form.name,
        brand: form.brand,
        categoryId: form.categoryId,
        price: Number(form.price) || 0,
        costPrice: Number(form.costPrice) || 0,
        stock: Number(form.stock) || 0,
        warranty: Number(form.warranty) || 0,
        description: form.description,
      };
      const res = isEdit && product
        ? await updateProduct(product.id, payload)
        : await createProduct(payload);
      if (res.ok) {
        toast.success(isEdit ? "Đã lưu thay đổi" : "Đã thêm sản phẩm");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Lỗi");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger render={trigger as React.ReactElement}>
        </DialogTrigger>
      ) : !isEdit && openProp === undefined ? (
        <DialogTrigger render={<Button />}>
          <Plus className="size-4" />
          Thêm sản phẩm
        </DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>SKU {isEdit ? "*" : "(tự động)"}</Label>
              {isEdit ? (
                <Input
                  value={form.sku}
                  onChange={(e) => set("sku", e.target.value)}
                  placeholder="LP006"
                  required
                  readOnly
                  className="bg-muted/50 cursor-not-allowed font-mono"
                />
              ) : (
                <div className="h-9 px-3 flex items-center rounded-md border border-dashed border-border bg-muted/30 text-xs text-muted-foreground font-mono">
                  Sẽ tự động tạo theo loại hình
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Loại hình *</Label>
              <SelectField
                value={form.categoryId}
                onValueChange={(v) => set("categoryId", v)}
                placeholder="Chọn loại hình"
                options={categories.map((c) => ({ value: c.id, label: `${c.name} (${(c as any).skuPrefix || c.type})` }))}
                className="w-full"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tên sản phẩm *</Label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="VD: MacBook Pro 16 M3 Max..."
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Hãng</Label>
            <Input
              value={form.brand}
              onChange={(e) => set("brand", e.target.value)}
              placeholder="Apple, Dell, Samsung..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Giá bán (VND)</Label>
              <Input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Giá nhập (VND)</Label>
              <Input
                type="number"
                min={0}
                value={form.costPrice}
                onChange={(e) => set("costPrice", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tồn kho</Label>
              <Input
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => set("stock", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Bảo hành (tháng)</Label>
              <Input
                type="number"
                min={0}
                value={form.warranty}
                onChange={(e) => set("warranty", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Mô tả</Label>
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Huỷ
          </Button>
          <Button onClick={submit} disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? "Lưu thay đổi" : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
