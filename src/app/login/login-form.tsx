"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { loginAction } from "./actions";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await loginAction(email, password);
      if (res.ok) {
        toast.success("Đăng nhập thành công");
        
        // Handle Super Admin redirect to /admin on root domain
        if (res.isSuperAdmin) {
          const currentHost = window.location.host;
          const isLocalhost = currentHost.includes("localhost") || currentHost.includes("127.0.0.1");
          const rootDomains = ["localhost:3000", "mypos.vn"];
          const isRoot = rootDomains.some(d => currentHost === d || currentHost === `www.${d}`);
          
          if (isRoot) {
            window.location.href = "/admin";
            return;
          }
        }

        const from = searchParams.get("from") || "/pos";
        
        // Handle subdomain redirection if not currently on the correct subdomain
        const currentHost = window.location.host;
        const tenantSlug = res.tenantSlug;
        
        if (tenantSlug && !res.isSuperAdmin) {
          const isLocalhost = currentHost.includes("localhost") || currentHost.includes("127.0.0.1");
          // Extract base domain
          let baseDomain = currentHost;
          if (isLocalhost) {
            baseDomain = currentHost.includes(":") ? currentHost.substring(currentHost.indexOf("localhost")) : "localhost:3000";
          } else if (currentHost.includes("mypos.vn")) {
            baseDomain = "mypos.vn";
          }
          
          const expectedHost = `${tenantSlug}.${baseDomain}`;
          if (currentHost !== expectedHost && !currentHost.startsWith(`${tenantSlug}.`)) {
            // Need to redirect to subdomain
            window.location.href = `${window.location.protocol}//${expectedHost}${from}`;
            return;
          }
        }
        
        router.push(from);
        router.refresh();
      } else {
        toast.error(res.error || "Đăng nhập thất bại");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="example@gmail.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        Đăng nhập
      </Button>
    </form>
  );
}
