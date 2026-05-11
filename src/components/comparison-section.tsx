import { Check, Minus, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  { name: "Số lượng sản phẩm", trial: "100", basic: "Vô hạn", premium: "Vô hạn" },
  { name: "Quản lý IMEI/Serial", trial: true, basic: true, premium: true },
  { name: "Quy trình Sửa chữa", trial: "Cơ bản", basic: "Toàn diện", premium: "Nâng cao" },
  { name: "In phiếu & Tem nhãn", trial: true, basic: true, premium: true },
  { name: "Báo cáo doanh thu", trial: true, basic: true, premium: true },
  { name: "Báo cáo tồn kho", trial: false, basic: true, premium: true },
  { name: "Phân quyền nhân viên", trial: false, basic: "2 cấp", premium: "Chi tiết" },
  { name: "Quản lý chuỗi (Multi-site)", trial: false, basic: false, premium: true },
  { name: "API & Tích hợp", trial: false, basic: false, premium: true },
  { name: "Hỗ trợ kỹ thuật", trial: "Email", basic: "Chat & Call", premium: "24/7 Ưu tiên" },
];

export function ComparisonSection() {
  return (
    <div className="max-w-5xl mx-auto px-4 overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/40">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="py-8 px-8 text-left text-xs font-black uppercase tracking-widest text-slate-400">Tính năng hệ thống</th>
              <th className="py-8 px-4 text-center text-sm font-black text-slate-900">Dùng thử</th>
              <th className="py-8 px-4 text-center text-sm font-black text-blue-600 bg-blue-50/30">Cơ bản</th>
              <th className="py-8 px-4 text-center text-sm font-black text-slate-900">Chuyên nghiệp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {features.map((feature) => (
              <tr key={feature.name} className="hover:bg-slate-50/30 transition-colors group">
                <td className="py-6 px-8">
                   <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-700">{feature.name}</span>
                      <Info className="size-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-help" />
                   </div>
                </td>
                <td className="py-6 px-4 text-center text-sm font-bold text-slate-500">
                  {renderValue(feature.trial)}
                </td>
                <td className="py-6 px-4 text-center text-sm font-black text-slate-900 bg-blue-50/20">
                  {renderValue(feature.basic)}
                </td>
                <td className="py-6 px-4 text-center text-sm font-bold text-slate-500">
                  {renderValue(feature.premium)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-slate-50/80 p-6 text-center">
         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tất cả các gói đều bao gồm bảo trì định kỳ và cập nhật miễn phí</p>
      </div>
    </div>
  );
}

function renderValue(val: string | boolean) {
  if (typeof val === "boolean") {
    return val ? (
      <div className="inline-flex size-6 rounded-full bg-emerald-50 items-center justify-center">
         <Check className="size-3.5 text-emerald-600" strokeWidth={4} />
      </div>
    ) : (
      <Minus className="size-4 text-slate-200 mx-auto" strokeWidth={3} />
    );
  }
  return <span className="text-slate-900">{val}</span>;
}
