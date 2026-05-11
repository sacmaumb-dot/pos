"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export function DomainForm({ host }: { host: string }) {
  const [slug, setSlug] = useState("");

  const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
  let displayBase = ".mypos.vn";
  if (isLocalhost) {
    displayBase = host.includes(":") 
      ? `.${host.substring(host.indexOf("localhost"))}` 
      : ".localhost:3000";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!slug) return;

    const currentHost = window.location.host;
    const isLocalhost = currentHost.includes("localhost") || currentHost.includes("127.0.0.1");
    
    let baseDomain = currentHost;
    if (isLocalhost) {
      baseDomain = currentHost.includes(":") 
        ? currentHost.substring(currentHost.indexOf("localhost")) 
        : "localhost:3000";
    } else if (currentHost.includes("mypos.vn")) {
      baseDomain = "mypos.vn";
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "");
    if (!cleanSlug) {
      toast.error("Tên miền không hợp lệ");
      return;
    }

    const targetUrl = `${window.location.protocol}//${cleanSlug}.${baseDomain}/login`;
    window.location.href = targetUrl;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="domain" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Tên miền cửa hàng</Label>
        <div className="relative group">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            id="domain"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="ten-cua-hang"
            className="pl-9 pr-32 font-mono h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-base"
            required
            autoFocus
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 pointer-events-none bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm">
            {displayBase}
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground px-2 italic font-medium">
          Ví dụ: applecare, techshop, hoanghamobile...
        </p>
      </div>

      <div className="pt-2">
        <Button type="submit" className="w-full h-12 text-base font-black rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
          Tiếp tục vào cửa hàng
          <ArrowRight className="ml-2 size-5" />
        </Button>
      </div>
    </form>
  );
}
