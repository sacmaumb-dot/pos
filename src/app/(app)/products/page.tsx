import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
} from "lucide-react";
import { formatVND } from "@/lib/format";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductFilter } from "./product-filter";
import { ProductDialog } from "./product-dialog";
import { ProductActions } from "./product-actions";

const CAT_ICONS: Record<string, React.ReactNode> = {
  phone: <Smartphone className="size-4" />,
  laptop: <LaptopIcon className="size-4" />,
  service: <Wrench className="size-4" />,
  accessory: <Headphones className="size-4" />,
};

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
      prisma.category.findMany({ orderBy: { name: "asc" } }),
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kho hàng</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý sản phẩm, dịch vụ và tồn kho.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" render={<Link href="/stock" />}>
            <Boxes className="size-4" />
            Nhập / Xuất / Kiểm kê
          </Button>
          <ProductDialog categories={categories} />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          icon={<Boxes className="size-4" />}
          label="Tổng sản phẩm"
          value={String(totalProducts)}
          tone="default"
        />
        <KpiCard
          icon={<TrendingUp className="size-4" />}
          label="Giá trị kho (giá nhập)"
          value={formatVND(inventoryValue)}
          tone="primary"
        />
        <KpiCard
          icon={<AlertTriangle className="size-4" />}
          label="Sắp hết / Hết hàng"
          value={String(lowStockCount)}
          tone={lowStockCount > 0 ? "destructive" : "default"}
        />
        <KpiCard
          icon={<Wrench className="size-4" />}
          label="Dịch vụ"
          value={String(serviceCount)}
          tone="default"
        />
      </div>

      <Card>
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="size-4" />
            Danh sách ({products.length})
          </CardTitle>
          <ProductFilter categories={categories} />
        </CardHeader>
        <CardContent className="p-3">
          {products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              Không tìm thấy sản phẩm phù hợp.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2">
              {products.map((p) => {
                const isService = p.category.type === "service";
                const lowStock = !isService && p.stock <= 5;
                const outOfStock = !isService && p.stock <= 0;
                return (
                  <div
                    key={p.id}
                    className="rounded-md border bg-card hover:border-primary/60 hover:shadow-sm transition-all flex items-center gap-2.5 p-2.5"
                  >
                    <div className="size-10 shrink-0 rounded bg-muted/60 flex items-center justify-center text-muted-foreground">
                      {CAT_ICONS[p.category.type] || (
                        <Package className="size-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {p.sku}
                        </span>
                        {isService ? (
                          <Badge
                            variant="outline"
                            className="text-[9px] h-4 px-1"
                          >
                            DV
                          </Badge>
                        ) : outOfStock ? (
                          <Badge
                            variant="destructive"
                            className="text-[9px] h-4 px-1"
                          >
                            Hết
                          </Badge>
                        ) : lowStock ? (
                          <Badge
                            variant="outline"
                            className="text-[9px] h-4 px-1 border-amber-500 text-amber-700 dark:text-amber-400"
                          >
                            Còn {p.stock}
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="text-[9px] h-4 px-1"
                          >
                            {p.stock}
                          </Badge>
                        )}
                        {p.warranty > 0 && (
                          <span className="text-[9px] text-muted-foreground">
                            BH {p.warranty}t
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-medium leading-snug line-clamp-1">
                        {p.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold text-primary">
                          {formatVND(p.price)}
                        </span>
                        {!isService && p.costPrice > 0 && (
                          <span className="text-[10px] text-muted-foreground">
                            nhập {formatVND(p.costPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                    <ProductActions
                      product={{
                        id: p.id,
                        sku: p.sku,
                        name: p.name,
                        brand: p.brand,
                        categoryId: p.categoryId,
                        price: p.price,
                        costPrice: p.costPrice,
                        stock: p.stock,
                        warranty: p.warranty,
                        description: p.description,
                      }}
                      categories={categories}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "default" | "primary" | "destructive";
}) {
  const toneCls =
    tone === "primary"
      ? "bg-primary/10 text-primary"
      : tone === "destructive"
        ? "bg-destructive/10 text-destructive"
        : "bg-muted text-muted-foreground";
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`size-10 rounded-md flex items-center justify-center ${toneCls}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
            {label}
          </div>
          <div className="text-base font-bold truncate">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
