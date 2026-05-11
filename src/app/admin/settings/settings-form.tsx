"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Globe, Bell, Shield, Laptop, Save, Loader2 } from "lucide-react";
import { updateSystemSettings } from "../actions";
import { toast } from "sonner";

export function SettingsForm({ initialData }: { initialData: { maintenanceMode: boolean; allowSignup: boolean; platformName: string; supportEmail: string } }) {
  const [pending, startTransition] = useTransition();
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState("general");

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateSystemSettings(data);
      if (res.ok) {
        toast.success("Đã lưu cài đặt hệ thống");
      } else {
        toast.error("Lỗi: " + res.error);
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Navigation/Tabs */}
      <div className="space-y-2">
         <div 
           onClick={() => setActiveTab("general")}
           className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold cursor-pointer transition-all ${activeTab === 'general' ? 'bg-white shadow-lg shadow-slate-200 text-primary' : 'text-slate-400 hover:text-slate-600'}`}
         >
            <div className={`size-8 rounded-lg flex items-center justify-center ${activeTab === 'general' ? 'bg-primary text-white' : 'bg-slate-100'}`}>
              <Globe className="size-4" />
            </div>
            Thông tin chung
         </div>
         <div 
           onClick={() => setActiveTab("landing")}
           className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold cursor-pointer transition-all ${activeTab === 'landing' ? 'bg-white shadow-lg shadow-slate-200 text-primary' : 'text-slate-400 hover:text-slate-600'}`}
         >
            <div className={`size-8 rounded-lg flex items-center justify-center ${activeTab === 'landing' ? 'bg-primary text-white' : 'bg-slate-100'}`}>
              <Laptop className="size-4" />
            </div>
            Cấu hình Landing Page
         </div>
         <div 
           onClick={() => setActiveTab("security")}
           className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold cursor-pointer transition-all ${activeTab === 'security' ? 'bg-white shadow-lg shadow-slate-200 text-primary' : 'text-slate-400 hover:text-slate-600'}`}
         >
            <div className={`size-8 rounded-lg flex items-center justify-center ${activeTab === 'security' ? 'bg-primary text-white' : 'bg-slate-100'}`}>
              <Shield className="size-4" />
            </div>
            Bảo mật & Backup
         </div>
      </div>

      {/* Right Column: Settings Content */}
      <div className="lg:col-span-2 space-y-8">
         {activeTab === "general" && (
           <>
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
                <CardHeader className="p-8 pb-0">
                  <CardTitle className="text-xl font-black text-slate-900">Thông tin chung</CardTitle>
                  <CardDescription className="font-medium">Tên nền tảng và thông tin liên hệ chính.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">Tên hệ thống</Label>
                      <Input 
                        value={data.platformName} 
                        onChange={(e) => setData({ ...data, platformName: e.target.value })}
                        className="rounded-xl border-slate-200" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">Phiên bản</Label>
                      <Input defaultValue="v1.2.4-stable" disabled className="rounded-xl bg-slate-50 border-slate-200 text-slate-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Email hỗ trợ khách hàng</Label>
                    <Input 
                      value={data.supportEmail} 
                      onChange={(e) => setData({ ...data, supportEmail: e.target.value })}
                      className="rounded-xl border-slate-200" 
                    />
                  </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
                <CardHeader className="p-8 pb-0">
                  <CardTitle className="text-xl font-black text-slate-900">Trạng thái hệ thống</CardTitle>
                  <CardDescription className="font-medium">Quản lý khả năng truy cập của toàn bộ nền tảng.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 border border-amber-100">
                    <div className="space-y-1">
                        <p className="font-bold text-amber-900">Chế độ bảo trì (Maintenance Mode)</p>
                        <p className="text-xs text-amber-700 font-medium">Khi bật, tất cả các shop sẽ không thể truy cập trừ Super Admin.</p>
                    </div>
                    <Switch 
                      checked={data.maintenanceMode} 
                      onCheckedChange={(v) => setData({ ...data, maintenanceMode: v })} 
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                    <div className="space-y-1">
                        <p className="font-bold text-emerald-900">Cho phép đăng ký mới</p>
                        <p className="text-xs text-emerald-700 font-medium">Mở/Đóng tính năng tạo shop mới từ trang chủ.</p>
                    </div>
                    <Switch 
                      checked={data.allowSignup} 
                      onCheckedChange={(v) => setData({ ...data, allowSignup: v })} 
                    />
                  </div>
                </CardContent>
            </Card>
           </>
         )}

         {activeTab === "landing" && (
           <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
              <CardHeader className="p-8 pb-0">
                <CardTitle className="text-xl font-black text-slate-900">Cấu hình Landing Page</CardTitle>
                <CardDescription className="font-medium">Chỉnh sửa nội dung trang giới thiệu ngoài trang chủ.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-bold">Tiêu đề chính (Hero Title)</Label>
                    <Input defaultValue="Phần mềm quản lý cửa hàng sửa chữa số 1 Việt Nam" className="rounded-xl border-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Mô tả ngắn</Label>
                    <Textarea defaultValue="Giải pháp toàn diện cho cửa hàng Laptop & Điện thoại. Tối ưu vận hành, tăng trưởng doanh thu." className="rounded-xl border-slate-200" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <Label className="font-bold">Hotline hiển thị</Label>
                       <Input defaultValue="1900 1234" className="rounded-xl border-slate-200" />
                     </div>
                     <div className="space-y-2">
                       <Label className="font-bold">Video giới thiệu (URL)</Label>
                       <Input placeholder="https://youtube.com/..." className="rounded-xl border-slate-200" />
                     </div>
                  </div>
                </div>
              </CardContent>
           </Card>
         )}

         {activeTab === "security" && (
           <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
              <CardHeader className="p-8 pb-0">
                <CardTitle className="text-xl font-black text-slate-900">Bảo mật & Backup</CardTitle>
                <CardDescription className="font-medium">Cấu hình an toàn dữ liệu và nhật ký hệ thống.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
                    <div className="space-y-1">
                      <p className="font-bold text-slate-900">Sao lưu dữ liệu hàng ngày (Daily Backup)</p>
                      <p className="text-xs text-slate-500 font-medium">Tự động sao lưu Database vào lúc 2:00 AM.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="font-bold">IP Whitelist (Cho phép truy cập Admin)</Label>
                    <Input placeholder="Ví dụ: 1.1.1.1, 8.8.8.8" className="rounded-xl border-slate-200" />
                    <p className="text-[10px] text-slate-400 font-bold">Để trống nếu muốn cho phép truy cập từ mọi nơi.</p>
                  </div>

                  <Button variant="outline" className="w-full rounded-xl py-6 border-dashed border-2 hover:bg-slate-50">
                    Xem lịch sử đăng nhập Super Admin
                  </Button>
                </div>
              </CardContent>
           </Card>
         )}

         <div className="flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={pending}
              className="rounded-2xl font-black py-7 px-10 text-lg shadow-xl shadow-primary/20 gap-3"
            >
              {pending ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
              Lưu tất cả cài đặt
            </Button>
         </div>
      </div>
    </div>
  );
}
