"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import { Loader2, Upload, Trash2, Store, Printer, Zap } from "lucide-react";
import { toast } from "sonner";
import type { AppSettings } from "@/lib/settings";
import { updateSettings, uploadAsset, clearAsset } from "./actions";

export function SettingsForm({ initial }: { initial: AppSettings }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    shopName: initial.shopName,
    siteTitle: initial.siteTitle,
    shopTagline: initial.shopTagline,
    shopAddress: initial.shopAddress ?? "",
    shopPhone: initial.shopPhone ?? "",
    shopEmail: initial.shopEmail ?? "",
    printSize: initial.printSize,
    bankId: initial.bankId ?? "",
    bankAccount: initial.bankAccount ?? "",
    bankAccountName: initial.bankAccountName ?? "",
  });

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit() {
    if (!form.shopName || !form.siteTitle) {
      toast.error("Vui lòng nhập tên cửa hàng & tiêu đề trang");
      return;
    }
    startTransition(async () => {
      const res = await updateSettings(form);
      if (res.ok) {
        toast.success("Đã lưu cài đặt cửa hàng");
        router.refresh();
      } else {
        toast.error(res.error || "Lỗi");
      }
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 border border-border/80 shadow-lg rounded-xl overflow-hidden bg-card/65 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-primary/5 via-blue-500/5 to-transparent border-b border-border/60 pb-4 px-6">
          <CardTitle className="text-base font-bold flex items-center gap-2.5 text-foreground">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Store className="size-4" />
            </div>
            Cấu hình thông tin cửa hàng
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90 border-l-2 border-primary pl-2">Thông tin cơ bản</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Tên cửa hàng *">
                <Input
                  value={form.shopName}
                  onChange={(e) => set("shopName", e.target.value)}
                  className="rounded-lg border-border/80 focus-visible:ring-primary/20"
                />
              </Field>
              <Field label="Slogan / Tagline">
                <Input
                  value={form.shopTagline}
                  onChange={(e) => set("shopTagline", e.target.value)}
                  placeholder="Laptop & Điện thoại"
                  className="rounded-lg border-border/80 focus-visible:ring-primary/20"
                />
              </Field>
            </div>
            <Field label="Tiêu đề trang web (Hiển thị trên tab trình duyệt) *">
              <Input
                value={form.siteTitle}
                onChange={(e) => set("siteTitle", e.target.value)}
                className="rounded-lg border-border/80 focus-visible:ring-primary/20"
              />
            </Field>
          </div>

          {/* Section 2: Contact & Invoicing Address */}
          <div className="space-y-4 pt-4 border-t border-border/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90 border-l-2 border-primary pl-2">Liên hệ & Địa chỉ hoá đơn</h3>
            <Field label="Địa chỉ cửa hàng (Sẽ in trực tiếp trên hoá đơn)">
              <Input
                value={form.shopAddress}
                onChange={(e) => set("shopAddress", e.target.value)}
                placeholder="123 Lê Lợi, Q.1, TP.HCM"
                className="rounded-lg border-border/80 focus-visible:ring-primary/20"
              />
            </Field>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="SĐT cửa hàng (Sẽ in trực tiếp trên hoá đơn)">
                <Input
                  value={form.shopPhone}
                  onChange={(e) => set("shopPhone", e.target.value)}
                  placeholder="1900 1234"
                  className="rounded-lg border-border/80 focus-visible:ring-primary/20"
                />
              </Field>
              <Field label="Email cửa hàng">
                <Input
                  type="email"
                  value={form.shopEmail}
                  onChange={(e) => set("shopEmail", e.target.value)}
                  className="rounded-lg border-border/80 focus-visible:ring-primary/20"
                />
              </Field>
            </div>
          </div>

          {/* Section: Bank Account & VietQR */}
          <div className="space-y-4 pt-4 border-t border-border/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90 border-l-2 border-primary pl-2">Tài khoản ngân hàng & Thanh toán QR</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Ngân hàng nhận chuyển khoản">
                <SelectField
                  value={form.bankId}
                  onValueChange={(v) => set("bankId", v ?? "")}
                  options={[
                    { value: "", label: "-- Chọn ngân hàng --" },
                    { value: "vietcombank", label: "Vietcombank (VCB)" },
                    { value: "mbbank", label: "MBBank (MB)" },
                    { value: "bidv", label: "BIDV" },
                    { value: "vietinbank", label: "VietinBank" },
                    { value: "techcombank", label: "Techcombank (TCB)" },
                    { value: "acb", label: "ACB" },
                    { value: "tpb", label: "TPBank (TPB)" },
                    { value: "vpb", label: "VPBank (VPB)" },
                    { value: "sacombank", label: "Sacombank" },
                    { value: "agribank", label: "Agribank" },
                  ]}
                  className="w-full rounded-lg border-border/80"
                />
              </Field>
              <Field label="Số tài khoản ngân hàng">
                <Input
                  value={form.bankAccount}
                  onChange={(e) => set("bankAccount", e.target.value)}
                  placeholder="Ví dụ: 0123456789"
                  className="rounded-lg border-border/80 focus-visible:ring-primary/20"
                />
              </Field>
              <Field label="Tên chủ tài khoản (Không dấu)">
                <Input
                  value={form.bankAccountName}
                  onChange={(e) => set("bankAccountName", e.target.value.toUpperCase())}
                  placeholder="Ví dụ: NGUYEN VAN A"
                  className="rounded-lg border-border/80 focus-visible:ring-primary/20"
                />
              </Field>
            </div>
            <p className="text-[11px] text-muted-foreground/80 leading-relaxed italic bg-blue-500/5 p-3 rounded-lg border border-blue-500/10">
              * Hệ thống VietQR sẽ tự động tạo QR Code thanh toán kèm theo số tiền thực tế và mã đơn hàng tương ứng khi khách hàng chọn hình thức thanh toán "Chuyển khoản". Đảm bảo bạn nhập chính xác Số tài khoản để tiền về đúng nơi!
            </p>
          </div>

          {/* Section 3: Print Settings */}
          <div className="space-y-4 pt-4 border-t border-border/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90 border-l-2 border-primary pl-2">Cấu hình hoá đơn & In ấn</h3>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 p-4 rounded-xl bg-accent/30 border border-border/40">
              <div className="flex-1 max-w-md">
                <Field label="Khổ giấy in mặc định">
                  <SelectField
                    value={form.printSize}
                    onValueChange={(v) => set("printSize", v ?? "A4")}
                    options={[
                      { value: "A4", label: "A4 (Giấy thường văn phòng)" },
                      { value: "80mm", label: "80mm (Giấy nhiệt cuộn K80)" },
                    ]}
                    className="w-full rounded-lg border-border/80"
                  />
                </Field>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="rounded-lg border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all font-semibold"
                  onClick={() => router.push("/settings/templates")}
                >
                  <Printer className="size-4 mr-2 text-primary" />
                  Tùy biến mẫu in
                </Button>
                <Button
                  variant="outline"
                  className="rounded-lg border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all font-semibold"
                  onClick={() => router.push("/settings/subscription")}
                >
                  <Zap className="size-4 mr-2 text-primary" />
                  Gói dịch vụ
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border/50">
            <Button onClick={submit} disabled={pending} className="px-6 py-2 rounded-lg font-semibold shadow-md shadow-primary/15 hover:shadow-primary/25 transition-all">
              {pending ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <Store className="size-4 mr-2" />
              )}
              Lưu cấu hình
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <AssetCard
          kind="logo"
          label="Logo cửa hàng"
          hint="Hiển thị trên header trang quản trị và mẫu hoá đơn in ấn. Định dạng PNG, JPG, SVG, tối đa 2MB."
          currentUrl={initial.logoUrl}
        />
        <AssetCard
          kind="favicon"
          label="Favicon hệ thống"
          hint="Biểu tượng thu nhỏ xuất hiện trên tab trình duyệt. Khuyến nghị ảnh vuông tỉ lệ 1:1, tối đa 1MB."
          currentUrl={initial.faviconUrl}
        />
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-muted-foreground/90">{label}</Label>
      {children}
    </div>
  );
}

function AssetCard({
  kind,
  label,
  hint,
  currentUrl,
}: {
  kind: "logo" | "favicon";
  label: string;
  hint: string;
  currentUrl: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function onPick(file: File) {
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Dung lượng file tối đa là 2MB");
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    fd.append("kind", kind);
    startTransition(async () => {
      const res = await uploadAsset(fd);
      if (res.ok) {
        toast.success("Tải lên thành công");
        router.refresh();
      } else {
        toast.error(res.error || "Lỗi khi tải ảnh");
      }
    });
  }

  function onClear() {
    startTransition(async () => {
      const res = await clearAsset(kind);
      if (res.ok) {
        toast.success("Đã xóa ảnh hiện tại");
        router.refresh();
      } else {
        toast.error(res.error || "Lỗi khi xóa");
      }
    });
  }

  return (
    <Card className="border border-border/80 shadow-md rounded-xl overflow-hidden bg-card/65 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-primary/5 via-blue-500/5 to-transparent border-b border-border/60 pb-3 px-5">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        <div className="aspect-video bg-muted/20 hover:bg-muted/30 rounded-xl border border-dashed border-border/80 flex items-center justify-center overflow-hidden transition-colors relative group shadow-inner">
          {currentUrl ? (
            <div className="relative w-full h-full p-4 flex items-center justify-center">
              <Image
                src={currentUrl}
                alt={label}
                width={200}
                height={120}
                className="object-contain max-h-32 rounded transition-transform duration-300 group-hover:scale-105"
                unoptimized
              />
            </div>
          ) : (
            <div className="text-xs text-muted-foreground flex flex-col items-center gap-2">
              <Upload className="size-6 text-muted-foreground/60 animate-pulse" />
              <span>Chưa có ảnh</span>
            </div>
          )}
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground/80">{hint}</p>
        <div className="flex gap-2 pt-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPick(f);
              e.target.value = "";
            }}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={pending}
            className="flex-1 rounded-lg border-border/80 hover:bg-primary/5 hover:border-primary/40 transition-all font-medium"
          >
            {pending ? (
              <Loader2 className="size-3.5 animate-spin mr-1.5" />
            ) : (
              <Upload className="size-3.5 mr-1.5" />
            )}
            Tải lên ảnh mới
          </Button>
          {currentUrl && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClear}
              disabled={pending}
              className="text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
              aria-label="Xoá"
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
