"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SelectField } from "@/components/ui/select-field";
import { Send, Loader2, Info, AlertTriangle, Zap } from "lucide-react";
import { broadcastNotification } from "../actions";
import { toast } from "sonner";

export function AnnouncementForm({ adminCount }: { adminCount: number }) {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    title: "",
    body: "",
    type: "system_announcement",
  });

  const handleSubmit = () => {
    if (!form.title || !form.body) {
      toast.error("Vui lòng điền đầy đủ tiêu đề và nội dung");
      return;
    }

    startTransition(async () => {
      const res = await broadcastNotification(form);
      if (res.ok) {
        toast.success(`Đã gửi thông báo đến ${res.recipientCount} chủ cửa hàng!`);
        setForm({ title: "", body: "", type: "system_announcement" });
      } else {
        toast.error("Lỗi: " + res.error);
      }
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
          <CardHeader className="p-8">
            <CardTitle className="text-xl font-black text-slate-900">Soạn thông báo mới</CardTitle>
            <CardDescription className="font-medium">Nội dung này sẽ xuất hiện trong trung tâm thông báo của mọi người dùng.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-6">
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Tiêu đề thông báo</Label>
              <Input 
                placeholder="Ví dụ: Bảo trì hệ thống đêm nay" 
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="rounded-xl border-slate-200 py-6" 
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Loại thông báo</Label>
              <SelectField 
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v })}
                options={[
                  { value: "system_announcement", label: "Thông báo chung" },
                  { value: "update", label: "Cập nhật tính năng mới" },
                  { value: "maintenance", label: "Cảnh báo bảo trì" },
                  { value: "promotion", label: "Chương trình khuyến mãi" },
                ]}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Nội dung chi tiết</Label>
              <Textarea 
                placeholder="Nhập nội dung thông báo tại đây..." 
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                className="rounded-2xl border-slate-200 min-h-[150px] p-4" 
              />
            </div>

            <Button 
              onClick={handleSubmit} 
              disabled={pending}
              className="w-full rounded-2xl font-black py-7 text-lg shadow-xl shadow-primary/20 gap-3"
            >
              {pending ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
              Gửi thông báo ngay
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl bg-slate-900 text-white overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center text-primary">
              <Zap className="size-6" />
            </div>
            <h3 className="font-black text-lg">Mẹo gửi tin</h3>
            <ul className="space-y-3 text-sm text-slate-400 font-medium">
              <li className="flex gap-2"><Info className="size-4 shrink-0 text-primary" /> Tiêu đề nên ngắn gọn dưới 50 ký tự.</li>
              <li className="flex gap-2"><Info className="size-4 shrink-0 text-primary" /> Sử dụng biểu tượng cảm xúc để thu hút sự chú ý.</li>
              <li className="flex gap-2"><AlertTriangle className="size-4 shrink-0 text-amber-500" /> Tránh gửi quá nhiều thông báo trong ngày.</li>
            </ul>
          </CardContent>
        </Card>

        <div className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm space-y-3">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thống kê gửi</p>
           <div className="flex items-end justify-between">
              <div>
                 <p className="text-3xl font-black text-slate-900 leading-none">{adminCount}</p>
                 <p className="text-xs text-slate-500 font-bold mt-2">Người nhận dự kiến</p>
              </div>
              <div className="text-right">
                 <p className="text-sm font-black text-emerald-500">Hoạt động</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
