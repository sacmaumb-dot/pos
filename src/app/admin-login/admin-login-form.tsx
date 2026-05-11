"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { adminLoginAction } from "./actions";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";

export function AdminLoginForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await adminLoginAction(email, password);
      if (res.ok) {
        toast.success("Xác thực thành công. Đang chuyển hướng...");
        window.location.href = "/admin";
      } else {
        toast.error(res.error || "Đăng nhập thất bại");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email */}
      <div className="space-y-2">
        <label
          htmlFor="admin-email"
          className="block text-xs font-bold uppercase tracking-widest text-slate-400"
        >
          Email quản trị
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="admin@mypos.vn"
            className="w-full h-12 pl-11 pr-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-slate-600 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label
          htmlFor="admin-password"
          className="block text-xs font-bold uppercase tracking-widest text-slate-400"
        >
          Mật khẩu
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••••••"
            className="w-full h-12 pl-11 pr-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-slate-600 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200"
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={pending}
        className="group w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 cursor-pointer"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Đang xác thực...
          </>
        ) : (
          <>
            Đăng nhập hệ thống
            <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
          </>
        )}
      </button>

      {/* Security Notice */}
      <p className="text-center text-[10px] text-slate-600 leading-relaxed">
        Phiên đăng nhập được mã hoá và giám sát.
        <br />
        Mọi hoạt động truy cập đều được ghi nhận.
      </p>
    </form>
  );
}
