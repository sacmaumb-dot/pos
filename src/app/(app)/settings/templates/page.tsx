import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { TemplateEditor } from "./template-editor";
import { restoreDefaultTemplates } from "./actions";

export default async function TemplatesPage() {
  const templates = await prisma.printTemplate.findMany({
    orderBy: { slug: "asc" },
  });

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
