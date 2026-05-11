import { getTenantPrismaServer } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatVND, formatDateTime, formatNumber } from "@/lib/format";
import {
  ShoppingCart,
  Wrench,
  Users,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Smartphone,
  ChevronRight,
  BarChart3
} from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ServiceStatusBadge } from "@/components/service-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RevenueChart } from "@/components/revenue-chart";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await requireSession();
  const tenantPrisma = await getTenantPrismaServer();
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    todayRevenue,
    monthRevenue,
    todayOrders,
    activeTickets,
    lowStockProducts,
    customerCount,
    recentTickets,
    last30Sales,
  ] = await Promise.all([
    tenantPrisma.sale.aggregate({
      where: { createdAt: { gte: today }, status: "paid" },
      _sum: { total: true },
    }),
    tenantPrisma.sale.aggregate({
      where: { createdAt: { gte: startOfMonth }, status: "paid" },
      _sum: { total: true },
    }),
    tenantPrisma.sale.count({ where: { createdAt: { gte: today } } }),
    tenantPrisma.serviceTicket.count({
      where: {
        status: { notIn: ["delivered", "cancelled"] },
      },
    }),
    tenantPrisma.product.findMany({
      where: { stock: { lt: 5 }, isActive: true },
      orderBy: { stock: "asc" },
      take: 5,
    }),
    tenantPrisma.customer.count(),
    tenantPrisma.serviceTicket.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    }),
    tenantPrisma.sale.findMany({
      where: { createdAt: { gte: last30 }, status: "paid" },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true, total: true },
    }),
  ]);

  // Build chart data
  const revenueByDay = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    revenueByDay.set(key, 0);
  }
  for (const s of last30Sales) {
    const key = s.createdAt.toISOString().slice(0, 10);
    revenueByDay.set(key, (revenueByDay.get(key) || 0) + s.total);
  }
  const chartData = Array.from(revenueByDay.entries()).map(([date, total]) => ({
    date,
    total,
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Header section matched with Customers style */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-primary/5 via-blue-500/5 to-transparent p-6 rounded-2xl border border-border/50">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Chào buổi chiều, {session.name.split(" ").pop()} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <Calendar className="size-4" />
            Hôm nay là {new Date().toLocaleDateString("vi-VN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/pos" className={cn(buttonVariants({ size: "sm" }), "rounded-xl px-5 h-10 font-bold shadow-lg shadow-primary/10")}>
            <ShoppingCart className="size-4 mr-2" />
            Tạo đơn mới
          </Link>
          <Link href="/pos" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-xl px-5 h-10 font-bold bg-white/50 backdrop-blur-sm")}>
            <Wrench className="size-4 mr-2" />
            Nhận máy sửa
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid matched with Customers style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi
          icon={<TrendingUp className="size-5" />}
          label="Doanh thu ngày"
          value={formatVND(todayRevenue._sum.total || 0)}
          subValue={`${todayOrders} đơn hàng`}
          gradient="from-blue-500 to-indigo-600"
        />
        <Kpi
          icon={<Calendar className="size-5" />}
          label="Doanh thu tháng"
          value={formatVND(monthRevenue._sum.total || 0)}
          subValue="Tháng hiện tại"
          gradient="from-emerald-400 to-teal-600"
        />
        <Kpi
          icon={<Smartphone className="size-5" />}
          label="Phiếu sửa chữa"
          value={formatNumber(activeTickets)}
          subValue="Đang chờ xử lý"
          gradient="from-amber-400 to-orange-600"
        />
        <Kpi
          icon={<Users className="size-5" />}
          label="Tổng khách hàng"
          value={formatNumber(customerCount)}
          subValue="Dữ liệu hệ thống"
          gradient="from-violet-500 to-fuchsia-600"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 border border-border/80 shadow-lg rounded-2xl overflow-hidden bg-card/65 backdrop-blur-sm">
          <CardHeader className="pb-2 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <BarChart3 className="size-4 text-primary" />
                  Biểu đồ doanh thu
                </CardTitle>
                <CardDescription className="text-xs">Dữ liệu biến động trong 30 ngày qua</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px]">
              <RevenueChart data={chartData} />
            </div>
          </CardContent>
        </Card>

        {/* Inventory Alert */}
        <Card className="border border-border/80 shadow-lg rounded-2xl overflow-hidden bg-slate-900 text-white">
          <CardHeader className="border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-white">Cảnh báo tồn kho</CardTitle>
                <CardDescription className="text-xs text-slate-400">Sản phẩm sắp hết hàng</CardDescription>
              </div>
              <AlertCircle className="size-5 text-amber-400" />
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {lowStockProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="size-16 rounded-full bg-white/10 flex items-center justify-center">
                  <CheckCircle2 className="size-8 text-emerald-400" />
                </div>
                <p className="text-slate-300 font-medium">Kho hàng đang ổn định</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{p.sku}</div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={cn(
                        "text-[10px] font-black px-2 py-0.5 rounded-lg",
                        p.stock === 0 ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
                      )}>
                        {p.stock} sản phẩm
                      </span>
                    </div>
                  </div>
                ))}
                <Link href="/products" className="flex items-center justify-center w-full py-2 text-[11px] font-bold text-slate-400 hover:text-white transition-colors">
                  Xem tất cả kho hàng <ChevronRight className="size-3 ml-1" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets Table */}
      <Card className="border border-border/80 shadow-lg rounded-2xl overflow-hidden bg-card/65 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 py-4 px-6">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="size-4 text-primary" />
              Phiếu sửa chữa mới nhất
            </CardTitle>
            <CardDescription className="text-xs">Tiến độ xử lý máy của khách hàng</CardDescription>
          </div>
          <Link href="/service" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs font-bold text-primary hover:bg-primary/5 rounded-lg")}>
            Xem tất cả
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-border/60">
                <TableHead className="font-bold text-foreground h-11 text-xs">Mã phiếu</TableHead>
                <TableHead className="font-bold text-foreground h-11 text-xs">Khách hàng</TableHead>
                <TableHead className="font-bold text-foreground h-11 text-xs">Thiết bị & Model</TableHead>
                <TableHead className="font-bold text-foreground h-11 text-xs">Thời gian nhận</TableHead>
                <TableHead className="font-bold text-foreground h-11 text-xs text-right">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground text-xs font-medium">
                    Chưa có phiếu sửa chữa nào trong hệ thống.
                  </TableCell>
                </TableRow>
              ) : (
                recentTickets.map((t) => (
                  <TableRow key={t.id} className="border-border/40 hover:bg-muted/20 transition-colors">
                    <TableCell className="font-mono font-black text-xs text-primary">
                      {t.code}
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-sm text-foreground">{t.customer.name}</div>
                      <div className="text-[10px] text-muted-foreground font-medium">{t.customer.phone}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground/80">{t.deviceModel || "Thiết bị không tên"}</div>
                      <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">{t.deviceType} · {t.deviceBrand}</div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-medium">
                      {formatDateTime(t.receivedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <ServiceStatusBadge status={t.status} className="shadow-sm" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  subValue,
  gradient,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue: string;
  gradient: string;
}) {
  return (
    <Card className="border border-border/80 shadow-md rounded-2xl overflow-hidden bg-card/65 backdrop-blur-sm group hover:border-primary/30 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-5 flex items-center gap-4">
        <div
          className={`size-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-tr ${gradient} shadow-lg shadow-primary/5 group-hover:scale-105 transition-transform duration-300`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider">
            {label}
          </div>
          <div className="text-lg font-black text-foreground mt-0.5 truncate">{value}</div>
          <div className="text-[10px] text-muted-foreground font-medium">{subValue}</div>
        </div>
      </CardContent>
    </Card>
  );
}
