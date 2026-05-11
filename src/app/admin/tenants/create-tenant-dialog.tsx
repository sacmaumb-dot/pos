"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2, Store } from "lucide-react";
import { toast } from "sonner";
import { createTenant } from "./actions";

export function CreateTenantDialog() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: "",
    slug: "",
    adminName: "",
    adminEmail: "",
  });

  const submit = () => {
    if (!form.name || !form.slug || !form.adminEmail || !form.adminName) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    startTransition(async () => {
      const res = await createTenant(form);
      if (res.ok) {
        toast.success("Đã tạo cửa hàng mới!");
        setOpen(false);
        setForm({ name: "", slug: "", adminName: "", adminEmail: "" });
      } else {
        toast.error(res.error || "Lỗi");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <Button className="rounded-xl font-bold shadow-lg shadow-primary/20 gap-2 h-10 px-6">
            <Plus className="size-4" /> Thêm Cửa hàng
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-slate-900 flex items-center gap-2">
             <Store className="size-6 text-primary" />
             Tạo cửa hàng mới
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="font-bold">Tên cửa hàng *</Label>
            <Input
              placeholder="Ví dụ: Apple Care Việt Nam"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-xl border-slate-200 h-11"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-bold">Subdomain (slug) *</Label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="apple-care"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.replace(/[^a-z0-9-]/g, '') })}
                className="rounded-xl border-slate-200 h-11"
              />
              <span className="text-sm font-bold text-slate-400">.mypos.vn</span>
            </div>
          </div>
          
          <div className="pt-2 border-t border-slate-50">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Thông tin Quản trị viên</p>
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label className="font-bold">Họ tên *</Label>
                 <Input
                   placeholder="Nguyễn Văn A"
                   value={form.adminName}
                   onChange={(e) => setForm({ ...form, adminName: e.target.value })}
                   className="rounded-xl border-slate-200 h-11"
                 />
               </div>
               <div className="space-y-2">
                 <Label className="font-bold">Email *</Label>
                 <Input
                   type="email"
                   placeholder="admin@email.com"
                   value={form.adminEmail}
                   onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                   className="rounded-xl border-slate-200 h-11"
                 />
               </div>
             </div>
             <p className="text-[10px] text-slate-400 mt-2 italic">Mật khẩu mặc định sẽ là: <span className="font-bold text-primary">123456</span></p>
          </div>
        </div>
        <DialogFooter className="sm:justify-between gap-3">
          <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-bold">
            Huỷ
          </Button>
          <Button onClick={submit} disabled={pending} className="rounded-xl font-black px-8">
            {pending && <Loader2 className="size-4 animate-spin mr-2" />}
            Tạo cửa hàng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
