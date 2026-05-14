import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, MapPin, Phone, Plus, MoreHorizontal } from "lucide-react";

export default async function BranchesPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/");

  const branches = await prisma.branch.findMany({
    include: { _count: { select: { users: true, sales: true } } },
    orderBy: { isMain: "desc" }
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Store className="size-8 text-primary" />
            Cửa hàng & Chi nhánh
          </h1>
          <p className="text-slate-400 mt-2 font-medium">
            Quản lý địa điểm kinh doanh và kho hàng của bạn.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-4">
           <Button className="rounded-xl font-bold px-6">
              <Plus className="mr-2 size-4" /> Thêm chi nhánh
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((b) => (
          <Card key={b.id} className="border-none shadow-xl shadow-slate-200/60 rounded-3xl overflow-hidden hover:ring-2 hover:ring-primary/20 transition-all">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Store className="size-5 text-slate-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">{b.name}</CardTitle>
                    {b.isMain && <Badge className="text-[9px] h-4 bg-primary/10 text-primary border-none">Trụ sở chính</Badge>}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreHorizontal className="size-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <MapPin className="size-4 shrink-0" />
                  <span className="truncate">{b.address || "Chưa cập nhật địa chỉ"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Phone className="size-4 shrink-0" />
                  <span>{b.phone || "Chưa cập nhật SĐT"}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                <div className="text-center p-3 rounded-2xl bg-slate-50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Nhân viên</p>
                  <p className="text-xl font-black text-slate-900">{b._count.users}</p>
                </div>
                <div className="text-center p-3 rounded-2xl bg-slate-50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Giao dịch</p>
                  <p className="text-xl font-black text-slate-900">{b._count.sales}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
