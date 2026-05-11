import { Shield, Server, Lock, Fingerprint, Activity } from "lucide-react";
import { AdminLoginForm } from "./admin-login-form";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#07090f] flex relative overflow-hidden">
      {/* ── Animated Background Elements ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Gradient Orb 1 */}
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20 blur-[100px]"
          style={{
            background: "radial-gradient(circle, #3b82f6, transparent 70%)",
            animation: "float1 15s ease-in-out infinite",
          }}
        />
        {/* Gradient Orb 2 */}
        <div
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full opacity-15 blur-[120px]"
          style={{
            background: "radial-gradient(circle, #6366f1, transparent 70%)",
            animation: "float2 18s ease-in-out infinite",
          }}
        />
        {/* Gradient Orb 3 */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-10 blur-[80px]"
          style={{
            background: "radial-gradient(circle, #8b5cf6, transparent 70%)",
            animation: "float3 12s ease-in-out infinite",
          }}
        />
        {/* Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* ── Left Panel: Branding (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 xl:p-16 relative z-10">
        {/* Top: Logo */}
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Shield className="size-6 text-white" />
          </div>
          <div>
            <div className="text-white font-black text-xl tracking-tight">
              MyPOS
            </div>
            <div className="text-blue-400 text-[9px] font-bold uppercase tracking-[0.2em]">
              System Admin
            </div>
          </div>
        </div>

        {/* Center: Hero Text */}
        <div className="space-y-8 max-w-lg">
          <div>
            <h1 className="text-4xl xl:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Trung tâm
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Điều hành Hệ thống
              </span>
            </h1>
            <p className="text-slate-500 text-base mt-5 leading-relaxed max-w-md">
              Quản lý toàn bộ nền tảng SaaS — giám sát cửa hàng, gói dịch
              vụ, người dùng và cấu hình hệ thống từ một giao diện duy nhất.
            </p>
          </div>

          {/* Status Indicators */}
          <div className="space-y-3">
            <StatusRow
              icon={<Server className="size-3.5" />}
              label="System Status"
              value="Online"
              color="emerald"
            />
            <StatusRow
              icon={<Lock className="size-3.5" />}
              label="Connection"
              value="Encrypted (TLS 1.3)"
              color="blue"
            />
            <StatusRow
              icon={<Activity className="size-3.5" />}
              label="Uptime"
              value="99.9%"
              color="purple"
            />
          </div>
        </div>

        {/* Bottom: Footer */}
        <div className="text-[10px] text-slate-700 uppercase tracking-widest font-bold">
          © {new Date().getFullYear()} MyPOS Platform • v2.0
        </div>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo (only visible on small screens) */}
          <div className="lg:hidden flex items-center justify-center gap-3">
            <div className="size-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Shield className="size-6 text-white" />
            </div>
            <div>
              <div className="text-white font-black text-xl tracking-tight">
                MyPOS
              </div>
              <div className="text-blue-400 text-[9px] font-bold uppercase tracking-[0.2em]">
                System Admin
              </div>
            </div>
          </div>

          {/* Card */}
          <div className="relative">
            {/* Glow behind card */}
            <div className="absolute -inset-px rounded-[28px] bg-gradient-to-b from-white/[0.08] via-transparent to-white/[0.03] pointer-events-none" />

            <div className="relative rounded-[27px] bg-white/[0.03] backdrop-blur-2xl border border-white/[0.06] p-8 sm:p-10 space-y-8 shadow-2xl">
              {/* Header */}
              <div className="text-center space-y-3">
                <div className="mx-auto size-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/10 flex items-center justify-center">
                  <Fingerprint className="size-7 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">
                    Xác thực Quản trị viên
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Vui lòng đăng nhập để truy cập bảng điều khiển
                  </p>
                </div>
              </div>

              {/* Form */}
              <AdminLoginForm />
            </div>
          </div>

          {/* Footer badges */}
          <div className="flex items-center justify-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-700">
              <Lock className="size-3" />
              Restricted Access
            </span>
            <span className="size-1 rounded-full bg-slate-800" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-700">
              © {new Date().getFullYear()} MyPOS
            </span>
          </div>
        </div>
      </div>

      {/* ── Keyframe Animations ── */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes float1 {
              0%, 100% { transform: translate(0, 0) scale(1); }
              33% { transform: translate(80px, 50px) scale(1.1); }
              66% { transform: translate(-40px, 80px) scale(0.95); }
            }
            @keyframes float2 {
              0%, 100% { transform: translate(0, 0) scale(1); }
              33% { transform: translate(-60px, -40px) scale(1.05); }
              66% { transform: translate(50px, -70px) scale(0.9); }
            }
            @keyframes float3 {
              0%, 100% { transform: translate(-50%, -50%) scale(1); }
              50% { transform: translate(-50%, -50%) scale(1.2); }
            }
          `,
        }}
      />
    </div>
  );
}

function StatusRow({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "emerald" | "blue" | "purple";
}) {
  const dotColors = {
    emerald: "bg-emerald-400 shadow-emerald-400/50",
    blue: "bg-blue-400 shadow-blue-400/50",
    purple: "bg-purple-400 shadow-purple-400/50",
  };

  const iconColors = {
    emerald: "text-emerald-500",
    blue: "text-blue-500",
    purple: "text-purple-500",
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
      <div className={iconColors[color]}>{icon}</div>
      <span className="text-xs font-bold text-slate-500 flex-1">{label}</span>
      <div className="flex items-center gap-2">
        <div
          className={`size-1.5 rounded-full ${dotColors[color]} shadow-sm`}
          style={{ animation: "pulse 2s ease-in-out infinite" }}
        />
        <span className="text-xs font-bold text-slate-300">{value}</span>
      </div>
    </div>
  );
}
