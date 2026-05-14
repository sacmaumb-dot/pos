"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
import { SelectField } from "@/components/ui/select-field";
import { 
  Loader2, Upload, Trash2, Store, Printer, 
  CreditCard, Image as ImageIcon, Check, ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import type { AppSettings } from "@/lib/settings";
import { updateSettings, uploadAsset, clearAsset } from "./actions";
import { cn } from "@/lib/utils";

type TabType = "general" | "print" | "payment" | "assets";

export function SettingsForm({ initial }: { initial: AppSettings }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("general");
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

  const tabs = [
    { id: "general", label: "Cửa hàng", icon: Store, desc: "Thông tin cơ bản & liên hệ" },
    { id: "print", label: "In ấn", icon: Printer, desc: "Cấu hình hoá đơn & mẫu in" },
    { id: "payment", label: "Thanh toán", icon: CreditCard, desc: "Ngân hàng & VietQR" },
    { id: "assets", label: "Hình ảnh", icon: ImageIcon, desc: "Logo & Biểu tượng hệ thống" },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Sidebar Navigation */}
      <div className="w-full lg:w-72 shrink-0 space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-300 group",
              activeTab === tab.id 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]" 
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn(
              "p-2 rounded-xl transition-colors",
              activeTab === tab.id ? "bg-white/20" : "bg-muted group-hover:bg-background"
            )}>
              <tab.icon className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold leading-none">{tab.label}</div>
              <div className={cn(
                "text-[10px] mt-1 truncate",
                activeTab === tab.id ? "text-primary-foreground/70" : "text-muted-foreground"
              )}>
                {tab.desc}
              </div>
            </div>
            {activeTab === tab.id && <ChevronRight className="size-4 opacity-50" />}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full space-y-6">
        <Card className="border border-border/80 shadow-xl rounded-3xl overflow-hidden bg-card/65 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="bg-gradient-to-r from-primary/5 via-blue-500/5 to-transparent border-b border-border/50 pb-6 px-8">
            <div className="flex items-center gap-3">
               <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-inner">
                  {tabs.find(t => t.id === activeTab)?.icon && (() => {
                    const Icon = tabs.find(t => t.id === activeTab)!.icon;
                    return <Icon className="size-6" />;
                  })()}
               </div>
               <div>
                  <CardTitle className="text-xl font-black tracking-tight">
                    {tabs.find(t => t.id === activeTab)?.label}
                  </CardTitle>
                  <CardDescription className="text-xs font-medium">
                    {tabs.find(t => t.id === activeTab)?.desc}
                  </CardDescription>
               </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            {activeTab === "general" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Tên cửa hàng *" hint="Tên hiển thị trên các văn bản">
                    <Input
                      value={form.shopName}
                      onChange={(e) => set("shopName", e.target.value)}
                      className="rounded-xl border-border/80 focus-visible:ring-primary/20 h-11"
                    />
                  </Field>
                  <Field label="Slogan / Tagline" hint="Câu khẩu hiệu ngắn gọn">
                    <Input
                      value={form.shopTagline}
                      onChange={(e) => set("shopTagline", e.target.value)}
                      placeholder="Laptop & Điện thoại"
                      className="rounded-xl border-border/80 focus-visible:ring-primary/20 h-11"
                    />
                  </Field>
                </div>
                <Field label="Tiêu đề trang web *" hint="Hiển thị trên tab trình duyệt">
                  <Input
                    value={form.siteTitle}
                    onChange={(e) => set("siteTitle", e.target.value)}
                    className="rounded-xl border-border/80 focus-visible:ring-primary/20 h-11"
                  />
                </Field>
                <div className="pt-6 border-t border-border/50 space-y-6">
                   <Field label="Địa chỉ liên hệ" hint="Địa chỉ in trên hoá đơn">
                    <Input
                      value={form.shopAddress}
                      onChange={(e) => set("shopAddress", e.target.value)}
                      placeholder="123 Lê Lợi, Q.1, TP.HCM"
                      className="rounded-xl border-border/80 focus-visible:ring-primary/20 h-11"
                    />
                  </Field>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Số điện thoại" hint="Hotline hỗ trợ">
                      <Input
                        value={form.shopPhone}
                        onChange={(e) => set("shopPhone", e.target.value)}
                        placeholder="1900 1234"
                        className="rounded-xl border-border/80 focus-visible:ring-primary/20 h-11"
                      />
                    </Field>
                    <Field label="Email liên hệ" hint="Hộp thư CSKH">
                      <Input
                        type="email"
                        value={form.shopEmail}
                        onChange={(e) => set("shopEmail", e.target.value)}
                        className="rounded-xl border-border/80 focus-visible:ring-primary/20 h-11"
                      />
                    </Field>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "print" && (
              <div className="space-y-8">
                 <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                      <Printer className="size-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-amber-900">Cấu hình in ấn chuyên nghiệp</h4>
                      <p className="text-xs text-amber-700/80 mt-1 leading-relaxed">
                        Thiết lập khổ giấy và mẫu in phù hợp với máy in của bạn. Hệ thống hỗ trợ cả in nhiệt K80 và in văn phòng A4.
                      </p>
                    </div>
                 </div>

                 <Field label="Khổ giấy mặc định">
                    <SelectField
                      value={form.printSize}
                      onValueChange={(v) => set("printSize", v ?? "A4")}
                      options={[
                        { value: "A4", label: "Khổ giấy A4 / A5 (Văn phòng)" },
                        { value: "80mm", label: "Khổ giấy 80mm (Máy in nhiệt K80)" },
                      ]}
                      className="w-full rounded-xl border-border/80 h-11"
                    />
                  </Field>

                  <div className="pt-6 border-t border-border/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-primary/5 border border-primary/10">
                      <div>
                        <h4 className="text-sm font-bold">Quản lý mẫu in</h4>
                        <p className="text-xs text-muted-foreground mt-1">Tuỳ biến nội dung và thiết kế hoá đơn</p>
                      </div>
                      <Button
                        variant="default"
                        className="rounded-xl font-bold shadow-lg shadow-primary/20"
                        onClick={() => router.push("/settings/templates")}
                      >
                        <Printer className="size-4 mr-2" />
                        Tuỳ biến mẫu in ngay
                      </Button>
                    </div>
                  </div>
              </div>
            )}

            {activeTab === "payment" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Field label="Ngân hàng thụ hưởng">
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
                      className="w-full rounded-xl border-border/80 h-11"
                    />
                  </Field>
                  <Field label="Số tài khoản">
                    <Input
                      value={form.bankAccount}
                      onChange={(e) => set("bankAccount", e.target.value)}
                      placeholder="0123456789"
                      className="rounded-xl border-border/80 focus-visible:ring-primary/20 h-11"
                    />
                  </Field>
                  <Field label="Tên chủ tài khoản">
                    <Input
                      value={form.bankAccountName}
                      onChange={(e) => set("bankAccountName", e.target.value.toUpperCase())}
                      placeholder="NGUYEN VAN A"
                      className="rounded-xl border-border/80 focus-visible:ring-primary/20 h-11"
                    />
                  </Field>
                </div>

                <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                      <CreditCard className="size-4" />
                    </div>
                    <h4 className="text-sm font-bold text-blue-900">Tự động hoá thanh toán với VietQR</h4>
                  </div>
                  <p className="text-xs text-blue-700/80 leading-relaxed">
                    Hệ thống sẽ tự động tạo mã QR Code thanh toán chính xác số tiền và nội dung chuyển khoản cho từng đơn hàng. Điều này giúp bạn nhận tiền nhanh chóng và tránh sai sót khi khách hàng nhập liệu thủ công.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "assets" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <AssetCard
                  kind="logo"
                  label="Logo cửa hàng"
                  hint="Hiển thị trên Header và Hoá đơn. PNG/JPG/SVG, tối đa 2MB."
                  currentUrl={initial.logoUrl}
                />
                <AssetCard
                  kind="favicon"
                  label="Favicon"
                  hint="Biểu tượng trên tab trình duyệt. Ảnh vuông 1:1, tối đa 1MB."
                  currentUrl={initial.faviconUrl}
                />
              </div>
            )}

            <div className="mt-12 pt-8 border-t border-border/50 flex items-center justify-between gap-4">
               <div className="hidden sm:block">
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                    <Check className="size-4 text-emerald-500" />
                    Hệ thống đã sẵn sàng với các thay đổi mới
                  </p>
               </div>
               <Button 
                onClick={submit} 
                disabled={pending} 
                size="lg"
                className="w-full sm:w-auto px-10 rounded-2xl font-black shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-[1.02]"
               >
                {pending ? (
                  <Loader2 className="size-5 animate-spin mr-2" />
                ) : (
                  <Store className="size-5 mr-2" />
                )}
                Lưu cấu hình ngay
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs font-bold text-foreground/80 ml-1 uppercase tracking-wider">{label}</Label>
        {hint && <span className="text-[10px] text-muted-foreground font-medium">{hint}</span>}
      </div>
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
    <Card className="border border-border/80 shadow-md rounded-2xl overflow-hidden bg-background/50 backdrop-blur-sm group hover:border-primary/20 transition-all">
      <CardHeader className="bg-muted/30 border-b border-border/50 py-4 px-6">
        <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="aspect-video bg-muted/20 hover:bg-muted/30 rounded-2xl border-2 border-dashed border-border/60 flex items-center justify-center overflow-hidden transition-all relative group/img shadow-inner cursor-pointer" onClick={() => inputRef.current?.click()}>
          {currentUrl ? (
            <div className="relative w-full h-full p-4 flex items-center justify-center">
              <Image
                src={currentUrl}
                alt={label}
                width={200}
                height={120}
                className="object-contain max-h-32 rounded-lg transition-transform duration-500 group-hover/img:scale-110"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                 <Upload className="size-8 text-white" />
              </div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground flex flex-col items-center gap-3">
              <div className="size-12 rounded-full bg-background flex items-center justify-center border shadow-sm">
                <Upload className="size-5 text-muted-foreground/60" />
              </div>
              <span className="font-bold">Chọn ảnh tải lên</span>
            </div>
          )}
        </div>
        <p className="text-[10px] leading-relaxed text-muted-foreground font-medium px-1">{hint}</p>
        <div className="flex gap-2">
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
            className="flex-1 rounded-xl border-border hover:bg-primary/5 hover:border-primary/40 transition-all font-bold"
          >
            {pending ? (
              <Loader2 className="size-3.5 animate-spin mr-2" />
            ) : (
              <Upload className="size-3.5 mr-2" />
            )}
            Tải lên
          </Button>
          {currentUrl && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClear}
              disabled={pending}
              className="text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
