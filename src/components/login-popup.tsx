"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Laptop, ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";

export function LoginPopup() {
  const [slug, setSlug] = useState("");
  const [open, setOpen] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!cleaned) return;
    
    // Determine the current host base
    const host = window.location.host;
    // Remove any existing subdomain for the base
    let baseDomain = host;
    // Support localhost and custom domains
    const localhostMatch = host.match(/(localhost:\d+|127\.0\.0\.1:\d+)/);
    if (localhostMatch) {
      baseDomain = localhostMatch[1];
    }
    
    window.location.href = `${window.location.protocol}//${cleaned}.${baseDomain}/login`;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <button className="text-sm font-semibold text-slate-700 hover:text-primary transition-colors cursor-pointer">
          Đăng nhập
        </button>
      } />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <Laptop className="size-5" />
            </div>
            <span className="text-xl font-black tracking-tight">MyPOS</span>
          </div>
          <DialogTitle className="text-lg font-bold">
            Đăng nhập tài khoản MyPOS
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Nhập địa chỉ cửa hàng của bạn để truy cập hệ thống quản lý.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="flex items-stretch rounded-xl border border-border bg-muted/30 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              placeholder="tên-cửa-hàng"
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm font-medium flex-1 h-12"
              autoFocus
            />
            <div className="flex items-center pr-4 text-sm font-bold text-muted-foreground whitespace-nowrap border-l border-border/60 pl-3 bg-muted/50">
              .localhost:3000
            </div>
          </div>

          <Button
            type="submit"
            disabled={!slug.trim()}
            className="w-full h-12 rounded-xl font-bold text-base shadow-lg shadow-primary/20"
          >
            Vào cửa hàng
            <ArrowRight className="size-4 ml-2" />
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground pt-2 border-t border-border/50 mt-2">
          Bạn chưa có cửa hàng trên MyPOS?{" "}
          <Link
            href="/signup"
            className="text-primary font-bold hover:underline inline-flex items-center gap-1"
            onClick={() => setOpen(false)}
          >
            Dùng thử miễn phí
            <ExternalLink className="size-3" />
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
