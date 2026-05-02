"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Users,
  BarChart3,
  Laptop,
  LogOut,
  Settings,
  ShoppingCart,
  Wrench,
  ClipboardList,
  ChevronDown,
  Receipt,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { logoutAction } from "@/app/(app)/actions";
import type { SessionUser } from "@/lib/auth";

type PendingTicket = {
  id: string;
  code: string;
  customerName: string;
  customerPhone: string;
  deviceLabel: string;
  status: string;
};

const STATUS_LABEL: Record<string, string> = {
  received: "Đã nhận",
  diagnosing: "Đang chẩn đoán",
  waiting_parts: "Chờ linh kiện",
  repairing: "Đang sửa",
  completed: "Đã xong",
};

export function AppHeader({
  user,
  pendingTickets,
}: {
  user: SessionUser;
  pendingTickets: PendingTicket[];
}) {
  const [pendingQ, setPendingQ] = useState("");
  const filteredPending = useMemo(() => {
    const s = pendingQ.trim().toLowerCase();
    if (!s) return pendingTickets;
    return pendingTickets.filter(
      (t) =>
        t.customerPhone.toLowerCase().includes(s) ||
        t.customerName.toLowerCase().includes(s) ||
        t.deviceLabel.toLowerCase().includes(s) ||
        t.code.toLowerCase().includes(s),
    );
  }, [pendingTickets, pendingQ]);

  const navData = [
    { title: "Tổng quan", url: "/", icon: LayoutDashboard },
    { title: "Hoá đơn bán hàng", url: "/sales", icon: Receipt },
    { title: "Phiếu sửa chữa", url: "/service", icon: Wrench },
    { title: "Sản phẩm / Kho", url: "/products", icon: Package },
    { title: "Khách hàng", url: "/customers", icon: Users },
    { title: "Báo cáo", url: "/reports", icon: BarChart3 },
  ];
  if (user.role === "admin") {
    navData.push({ title: "Người dùng", url: "/users", icon: Settings });
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4">
      <Link href="/pos" className="flex items-center gap-2 shrink-0">
        <div className="size-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0">
          <Laptop className="size-5" />
        </div>
        <div className="hidden sm:flex flex-col">
          <span className="font-bold text-sm leading-tight">TechShop</span>
          <span className="text-[10px] text-muted-foreground leading-tight">
            Laptop & Phone
          </span>
        </div>
      </Link>

      <Link
        href="/pos"
        className="ml-2 flex items-center gap-1.5 px-3 h-9 rounded-md text-sm font-medium text-primary bg-primary/5 hover:bg-primary/10"
      >
        <ShoppingCart className="size-4" />
        <span className="hidden sm:inline">Bán hàng & Sửa chữa</span>
        <span className="sm:hidden">Bán hàng</span>
      </Link>

      <div className="flex-1" />

      <DropdownMenu>
        <DropdownMenuTrigger className="relative inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-sm font-medium border hover:bg-muted">
          <ClipboardList className="size-4" />
          <span className="hidden sm:inline">Phiếu đang chờ</span>
          <Badge
            variant={pendingTickets.length > 0 ? "default" : "secondary"}
            className="text-[10px] h-5"
          >
            {pendingTickets.length}
          </Badge>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-0">
          <div className="px-2 pt-2 pb-1.5">
            <div className="text-xs font-medium text-muted-foreground mb-1.5">
              Phiếu chưa trả ({pendingTickets.length})
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                value={pendingQ}
                onChange={(e) => setPendingQ(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Tìm SĐT, model, mã phiếu..."
                className="pl-8 h-8"
              />
            </div>
          </div>
          <DropdownMenuSeparator className="my-0" />
          <div className="max-h-80 overflow-auto py-1">
            {filteredPending.length === 0 && (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                {pendingTickets.length === 0
                  ? "Không có phiếu nào đang chờ."
                  : "Không có phiếu khớp."}
              </div>
            )}
            {filteredPending.map((t) => (
              <DropdownMenuItem
                key={t.id}
                render={
                  <Link
                    href={`/pos?ticket=${t.id}&code=${encodeURIComponent(t.code)}`}
                  />
                }
                className="flex flex-col items-start gap-0.5 py-2 cursor-pointer"
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold">
                    {t.code}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {STATUS_LABEL[t.status] || t.status}
                  </Badge>
                </div>
                <span className="text-xs font-medium truncate w-full">
                  {t.customerName}
                  <span className="ml-1.5 text-[10px] font-mono text-muted-foreground">
                    {t.customerPhone}
                  </span>
                </span>
                <span className="text-[10px] text-muted-foreground truncate w-full">
                  {t.deviceLabel}
                </span>
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex items-center gap-2 h-9 px-2 rounded-md hover:bg-muted">
          <Avatar className="size-7 shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {user.name
                .split(" ")
                .map((s) => s[0])
                .slice(-2)
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col text-left text-xs leading-tight">
            <span className="font-medium truncate max-w-[140px]">
              {user.name}
            </span>
            <span className="text-muted-foreground">
              {roleLabel(user.role)}
            </span>
          </div>
          <ChevronDown className="size-3.5 text-muted-foreground hidden md:inline" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <div className="px-2 py-1.5">
            <div className="flex flex-col">
              <span className="font-medium text-sm">{user.name}</span>
              <span className="text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>
          <DropdownMenuSeparator />
          <div className="px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
            Quản lý
          </div>
          {navData.map((item) => (
            <DropdownMenuItem
              key={item.url}
              render={<Link href={item.url} />}
              className="gap-2"
            >
              <item.icon className="size-4" />
              <span>{item.title}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            render={<form action={logoutAction} />}
            className="p-0"
          >
            <button
              type="submit"
              className="flex w-full items-center gap-2 px-2 py-1.5 text-sm"
            >
              <LogOut className="size-4" />
              Đăng xuất
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

function roleLabel(role: string) {
  switch (role) {
    case "admin":
      return "Quản trị viên";
    case "technician":
      return "Kỹ thuật viên";
    default:
      return "Nhân viên";
  }
}
