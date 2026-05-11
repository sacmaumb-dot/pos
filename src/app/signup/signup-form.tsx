"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, ExternalLink, Zap } from "lucide-react";
import { registerTenant } from "./actions";
import Link from "next/link";

export default function SignupForm() {
  const [shopName, setShopName] = useState("");
  const [slug, setSlug] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdUrl, setCreatedUrl] = useState("");

  const handleSlugChange = (val: string) => {
    const formatted = val.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlug(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await registerTenant({
      shopName,
      slug,
      adminName,
      email,
      password,
    });

    setLoading(false);
    if (!res.ok) {
      setError(res.error || "Có lỗi xảy ra");
    } else {
      setSuccess(true);
      const host = window.location.host;
      const localhostMatch = host.match(/(localhost:\d+|127\.0\.0\.1:\d+)/);
      const baseDomain = localhostMatch ? localhostMatch[1] : host.replace("www.", "");
      const newUrl = `${window.location.protocol}//${res.slug}.${baseDomain}/login`;
      setCreatedUrl(newUrl);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-6 py-4">
        <div className="size-20 mx-auto rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
          <CheckCircle2 className="size-10 text-emerald-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-emerald-600">Đăng ký thành công!</h2>
          <p className="text-sm text-muted-foreground">
            Cửa hàng <strong className="text-foreground">{shopName}</strong> đã được khởi tạo trên hệ thống MyPOS.
          </p>
        </div>
        <div className="rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
            Địa chỉ truy cập cửa hàng
          </div>
          <a
            href={createdUrl}
            className="text-primary font-bold hover:underline break-all inline-flex items-center gap-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            {createdUrl}
            <ExternalLink className="size-3 shrink-0" />
          </a>
        </div>
        <Button
          onClick={() => (window.location.href = createdUrl)}
          className="w-full h-12 rounded-xl font-bold text-base shadow-lg shadow-primary/20"
        >
          Đăng nhập ngay
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 font-medium flex items-center gap-2">
          <span className="text-red-400">⚠️</span>
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-xs font-bold">Tên cửa hàng *</Label>
        <Input
          type="text"
          required
          placeholder="Ví dụ: Apple Care Hà Nội"
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
          className="h-11 rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold">Đường dẫn truy cập (Subdomain) *</Label>
        <div className="flex items-stretch rounded-xl border border-border bg-muted/30 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
          <Input
            type="text"
            required
            placeholder="apple-care-hn"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-11 flex-1"
          />
          <div className="flex items-center pr-4 text-sm font-bold text-muted-foreground whitespace-nowrap border-l border-border/60 pl-3 bg-muted/50">
            .localhost:3000
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold">Họ & tên quản lý *</Label>
        <Input
          type="text"
          required
          placeholder="Ví dụ: Nguyễn Văn A"
          value={adminName}
          onChange={(e) => setAdminName(e.target.value)}
          className="h-11 rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold">Email tài khoản admin *</Label>
        <Input
          type="email"
          required
          placeholder="admin@applecare.vn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold">Mật khẩu *</Label>
        <Input
          type="password"
          required
          placeholder="Tối thiểu 6 ký tự"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 rounded-xl"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-xl font-bold text-base shadow-lg shadow-primary/20 mt-2"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin mr-2" />
            Đang khởi tạo hệ thống...
          </>
        ) : (
          <>
            <Zap className="size-4 mr-2" />
            Kích hoạt 7 ngày dùng thử
          </>
        )}
      </Button>

      <div className="text-center text-sm text-muted-foreground pt-2">
        Đã có tài khoản?{" "}
        <Link href="/" className="text-primary font-bold hover:underline">
          Đăng nhập
        </Link>
      </div>
    </form>
  );
}
