import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Smartphone,
  Laptop as LaptopIcon,
  Wrench,
  AlertTriangle,
  Boxes,
  TrendingUp,
  Headphones,
  Search,
  Plus,
  ArrowRightLeft,
  Calendar,
  Layers,
  ChevronRight
} from "lucide-react";
import { formatVND } from "@/lib/format";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { ProductFilter } from "./product-filter";
import { ProductDialog } from "./product-dialog";
import { ProductActions } from "./product-actions";
import { CategoryDialog } from "../categories/category-dialog";
import { CategoryActions } from "../categories/category-actions";
import { cn } from "@/lib/utils";
import { Hash } from "lucide-react";

import * as Icons from "lucide-react";

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const pascalName = name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  const IconComponent = (Icons as any)[pascalName] || Icons.Package;
  return <IconComponent className={className} />;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const sp = await searchParams;
  const where: Prisma.ProductWhereInput = { isActive: true };
  if (sp.q) {
    where.OR = [
      { name: { contains: sp.q } },
      { sku: { contains: sp.q } },
      { brand: { contains: sp.q } },
    ];
  }
  if (sp.cat && sp.cat !== "all") {
    where.category = { type: sp.cat };
  }

  const [products, categories, totalProducts, lowStockCount, allActive] =
    await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { name: "asc" },
        include: { category: true },
        take: 200,
      }),
      prisma.category.findMany({
        orderBy: { name: "asc" },
        include: { _count: { select: { products: true } } },
      }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({
        where: {
          isActive: true,
          stock: { lte: 5 },
          category: { type: { not: "service" } },
        },
      }),
      prisma.product.findMany({
        where: { isActive: true },
        select: { stock: true, costPrice: true, category: true },
      }),
    ]);

  const inventoryValue = allActive.reduce(
    (s, p) =>
      p.category.type === "service" ? s : s + p.stock * (p.costPrice || 0),
    0,
  );
  const serviceCount = allActive.filter(
    (p) => p.category.type === "service",
  ).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header section matched with Customers style */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-primary/5 via-blue-500/5 to-transparent p-6 rounded-2xl border border-border/50">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Package className="size-6 text-primary" />
            Kho hàng & Sản phẩm
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý tồn kho linh kiện, phụ kiện và danh mục dịch vụ sửa chữa.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/stock" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-xl px-5 h-10 font-bold bg-white/50 backdrop-blur-sm")}>
            <ArrowRightLeft className="size-4 mr-2" />
            Nhập / Xuất kho
          </Link>
          <ProductDialog categories={categories} />
        </div>
      </div>

      {/* KPI Stats matched with Customers style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi
          icon={<Layers className="size-5" />}
          label="Tổng mặt hàng"
          value={String(totalProducts)}
          subValue="Đang kinh doanh"
          gradient="from-blue-500 to-indigo-600"
        />
        <Kpi
          icon={<TrendingUp className="size-5" />}
          label="Giá trị tồn kho"
          value={formatVND(inventoryValue)}
          subValue="Tổng vốn lưu động"
          gradient="from-emerald-400 to-teal-600"
        />
        <Kpi
          icon={<AlertTriangle className="size-5" />}
          label="Cảnh báo hết"
          value={String(lowStockCount)}
          subValue="Sắp hết hàng"
          gradient={lowStockCount > 0 ? "from-rose-400 to-red-600" : "from-amber-400 to-orange-600"}
        />
        <Kpi
          icon={<Wrench className="size-5" />}
          label="Dịch vụ"
          value={String(serviceCount)}
          subValue="Loại hình cài đặt"
          gradient="from-violet-500 to-fuchsia-600"
        />
      </div>

      {/* List Section matched with Customers style */}
      <Card className="border border-border/80 shadow-lg rounded-2xl overflow-hidden bg-card/65 backdrop-blur-sm">
        <CardHeader className="border-b border-border/60 pb-4 px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Package className="size-4 text-primary" />
            Loại hình sản phẩm ({products.length})
          </CardTitle>
          <div className="w-full md:w-80">
            <ProductFilter categories={categories} />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {products.length === 0 ? (
            <div className="py-20 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
               <Search className="size-10 text-muted-foreground/40 animate-pulse" />
               <span>Chưa tìm thấy sản phẩm nào phù hợp.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} categories={categories} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Management Section */}
      <Card className="border border-border/80 shadow-lg rounded-2xl overflow-hidden bg-card/65 backdrop-blur-sm">
        <CardHeader className="border-b border-border/60 pb-4 px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Layers className="size-4 text-primary" />
            Quản lý loại hình ({categories.length})
          </CardTitle>
          <CategoryDialog />
        </CardHeader>
        <CardContent className="p-4">
          {categories.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Chưa có danh mục nào.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {categories.map((cat: any) => (
                <div
                  key={cat.id}
                  className="group flex items-center gap-3 p-3 rounded-xl border border-border/60 hover:border-primary/30 hover:bg-primary/[0.02] transition-all"
                >
                  <div className="size-10 shrink-0 rounded-lg bg-primary/8 flex items-center justify-center text-primary">
                    <DynamicIcon name={cat.icon || "package"} className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-foreground truncate">{cat.name}</div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="font-mono font-bold">{cat.skuPrefix || "—"}</span>
                      <span>•</span>
                      <span>{cat._count?.products ?? 0} sản phẩm</span>
                    </div>
                  </div>
                  <CategoryActions category={cat} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProductCard({ product, categories }: { product: any, categories: any }) {
  const isService = product.category.type === "service";
  const lowStock = !isService && product.stock <= 5;
  const outOfStock = !isService && product.stock <= 0;

  return (
    <div className="group relative flex flex-col p-4 rounded-xl border border-border/80 bg-card/80 hover:border-primary/40 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="size-11 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm">
          <DynamicIcon name={product.category.icon || "package"} className="size-5" />
        </div>
        <ProductActions
          product={product}
          categories={categories}
        />
      </div>

      <div className="flex-1 space-y-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
             <span className="text-[10px] font-bold text-muted-foreground font-mono uppercase tracking-wider">{product.sku}</span>
             {isService ? (
               <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-blue-200 text-blue-600 bg-blue-50/50 rounded-md">DV</Badge>
             ) : outOfStock ? (
               <Badge variant="destructive" className="text-[9px] h-4 px-1.5 font-bold uppercase tracking-wider rounded-md">Hết hàng</Badge>
             ) : lowStock ? (
               <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-amber-200 text-amber-600 bg-amber-50/50 font-bold rounded-md">Còn {product.stock}</Badge>
             ) : (
               <Badge variant="secondary" className="text-[9px] h-4 px-1.5 font-bold bg-emerald-50 text-emerald-600 border-none rounded-md">{product.stock} kho</Badge>
             )}
          </div>
          <h3 className="text-[13px] font-bold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{product.brand}</div>
        </div>

        <div className="pt-3 border-t border-border/50 flex flex-col gap-1">
          <div className="flex items-center justify-between">
             <span className="text-[9px] uppercase tracking-widest font-black text-muted-foreground/60">Giá bán</span>
             <span className="text-sm font-black text-primary">{formatVND(product.price)}</span>
          </div>
          {!isService && product.costPrice > 0 && (
             <div className="flex items-center justify-between text-[9px] text-muted-foreground/60 font-medium italic">
                <span>Vốn: {formatVND(product.costPrice)}</span>
                <span>Lãi: {formatVND(product.price - product.costPrice)}</span>
             </div>
          )}
        </div>
      </div>
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
