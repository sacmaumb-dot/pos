"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { SelectField } from "@/components/ui/select-field";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createUser } from "./actions";

export function NewUserDialog({ branches }: { branches: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff",
    branchId: branches[0]?.id || "",
  });

  function set<K extends keyof typeof form>(k: K, v: string | null) {
    setForm((f) => ({ ...f, [k]: v ?? "" }));
  }

  function submit() {
    if (!form.name || !form.email || !form.password) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Mật khẩu cần ít nhất 6 ký tự");
      return;
    }
    startTransition(async () => {
      const res = await createUser(form);
      if (res.ok) {
        toast.success("Đã thêm tài khoản");
        setOpen(false);
        setForm({ name: "", email: "", password: "", role: "staff", branchId: branches[0]?.id || "" });
        router.refresh();
      } else {
        toast.error(res.error || "Lỗi");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        Thêm tài khoản
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tạo tài khoản nhân viên</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Họ tên *</Label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Mật khẩu *</Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              minLength={6}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Vai trò</Label>
            <SelectField
              value={form.role}
              onValueChange={(v) => set("role", v)}
              options={[
                { value: "staff", label: "Nhân viên bán hàng" },
                { value: "technician", label: "Kỹ thuật viên" },
                { value: "admin", label: "Quản trị viên" },
              ]}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label>Chi nhánh làm việc</Label>
            <SelectField
              value={form.branchId}
              onValueChange={(v) => set("branchId", v)}
              options={branches.map(b => ({ value: b.id, label: b.name }))}
              className="w-full"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Huỷ
          </Button>
          <Button onClick={submit} disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
