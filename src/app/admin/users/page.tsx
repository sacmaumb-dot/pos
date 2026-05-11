import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Mail, Calendar, UserPlus, MoreVertical, Key } from "lucide-react";
import { formatDate } from "@/lib/format";

export default async function AdminUsersPage() {
  const admins = await prisma.user.findMany({
    where: { isSuperAdmin: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Quản trị viên Hệ thống</h1>
          <p className="text-slate-500 font-medium">Danh sách những người có quyền truy cập vào cổng quản trị tổng.</p>
        </div>
        <Button className="rounded-xl font-bold gap-2 shadow-lg shadow-primary/20">
          <UserPlus className="size-4" /> Thêm Quản trị viên
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {admins.map((admin) => (
          <Card key={admin.id} className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white hover:ring-2 hover:ring-primary/20 transition-all group">
            <CardContent className="p-8">
              <div className="flex items-start justify-between">
                <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <Shield className="size-8" />
                </div>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreVertical className="size-5 text-slate-400" />
                </Button>
              </div>

              <div className="mt-6 space-y-1">
                <h3 className="text-xl font-black text-slate-900 leading-tight">{admin.name}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-400 font-bold">
                   <Mail className="size-3.5" /> {admin.email}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                   <Calendar className="size-3.5" /> Gia nhập {formatDate(admin.createdAt)}
                </div>
                <Badge className="bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-tighter px-2">
                   ROOT ADMIN
                </Badge>
              </div>

              <div className="mt-4">
                 <Button variant="outline" className="w-full rounded-xl gap-2 font-bold text-xs border-slate-100 hover:bg-slate-50 transition-colors">
                    <Key className="size-3.5" /> Đổi mật khẩu
                 </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
