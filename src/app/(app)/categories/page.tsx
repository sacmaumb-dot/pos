import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Layers,
  Smartphone,
  Laptop as LaptopIcon,
  Wrench,
  Headphones,
  Package,
  Hash,
} from "lucide-react";
import { CategoryDialog } from "./category-dialog";
import { CategoryActions } from "./category-actions";

const CAT_ICONS: Record<string, React.ReactNode> = {
  phone: <Smartphone className="size-5" />,
  laptop: <LaptopIcon className="size-5" />,
  service: <Wrench className="size-5" />,
  accessory: <Headphones className="size-5" />,
};

const CAT_GRADIENTS: Record<string, string> = {
  laptop: "from-blue-500 to-indigo-600",
  phone: "from-emerald-400 to-teal-600",
  accessory: "from-amber-400 to-orange-500",
  service: "from-violet-500 to-fuchsia-600",
};

export default async function CategoriesPage() {
  const tp = prisma;
  const categories = await tp.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-primary/5 via-blue-500/5 to-transparent p-6 rounded-2xl border border-border/50">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="size-6 text-primary" />
            Quản lý Danh mục
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Mỗi danh mục có mã SKU prefix riêng. Sản phẩm sẽ được tự động đánh mã theo danh mục.
          </p>
        </div>
        <CategoryDialog />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Card
            key={cat.id}
            className="group border border-border/80 shadow-md rounded-2xl overflow-hidden bg-card/65 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300"
          >
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div
                  className={`size-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-tr ${CAT_GRADIENTS[cat.type] || "from-slate-400 to-slate-600"} shadow-lg shadow-primary/5 group-hover:scale-105 transition-transform duration-300`}
                >
                  {CAT_ICONS[cat.type] || <Package className="size-5" />}
                </div>
                <CategoryActions category={cat} />
              </div>

              <div>
                <h3 className="text-base font-bold text-foreground">{cat.name}</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                  {cat.type === "laptop" ? "Laptop" : cat.type === "phone" ? "Điện thoại" : cat.type === "accessory" ? "Phụ kiện" : "Dịch vụ"}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <div className="flex items-center gap-1.5">
                  <Hash className="size-3 text-muted-foreground" />
                  <span className="text-sm font-black text-primary font-mono tracking-widest">
                    {cat.skuPrefix || "—"}
                  </span>
                </div>
                <Badge variant="secondary" className="text-[10px] font-bold rounded-md">
                  {cat._count.products} sản phẩm
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}

        {categories.length === 0 && (
          <div className="col-span-full text-center py-20 text-sm text-muted-foreground flex flex-col items-center gap-3">
            <Layers className="size-12 text-muted-foreground/30" />
            <p>Chưa có danh mục nào. Bấm &quot;Thêm danh mục&quot; để bắt đầu.</p>
          </div>
        )}
      </div>
    </div>
  );
}
