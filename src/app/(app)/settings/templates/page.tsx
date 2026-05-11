import { getTenantFromHeader } from "@/lib/settings";
import { getPlan } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lock, Zap, RotateCcw } from "lucide-react";
import { getTenantPrismaServer } from "@/lib/prisma";
import { TemplateEditor } from "./template-editor";
import { restoreDefaultTemplates } from "./actions";
import { toast } from "sonner";

export default async function TemplatesPage() {
  const tenant = await getTenantFromHeader();
  const plan = getPlan(tenant?.subscriptionPlan || "trial");
  
  const templates = await (await getTenantPrismaServer()).printTemplate.findMany({
    orderBy: { slug: "asc" },
  });

  if (!plan.canCustomPrint) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tùy biến mẫu in</h1>
          <p className="text-muted-foreground">Chỉnh sửa nội dung và bố cục các loại phiếu in.</p>
        </div>
        
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center space-y-4">
          <div className="size-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <Lock className="size-8" />
          </div>
          <div className="space-y-2 max-w-sm px-4">
            <h3 className="text-lg font-bold">Tính năng bị khóa</h3>
            <p className="text-sm text-muted-foreground">
              Gói <span className="font-bold text-slate-900">{plan.name}</span> không hỗ trợ tùy biến mẫu in. Vui lòng nâng cấp lên gói <span className="font-bold text-primary">Pro</span> để sử dụng tính năng này.
            </p>
          </div>
          <Link href="/settings/subscription">
            <Button className="rounded-xl font-bold shadow-lg shadow-primary/20">
              <Zap className="size-4 mr-2" />
              Nâng cấp gói ngay
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tùy biến mẫu in</h1>
          <p className="text-muted-foreground">
            Chỉnh sửa nội dung và bố cục các loại phiếu in trong hệ thống.
          </p>
        </div>
        
        <form action={async () => {
          "use server";
          await restoreDefaultTemplates();
        }}>
          <Button variant="outline" size="sm" type="submit" className="text-muted-foreground hover:text-foreground">
            <RotateCcw className="size-4 mr-2" />
            Khôi phục mặc định
          </Button>
        </form>
      </div>

      <TemplateEditor templates={templates} />
    </div>
  );
}
