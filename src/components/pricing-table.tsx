import { Check, Zap, Star, Rocket } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Dùng thử",
    price: "0đ",
    description: "Trải nghiệm đầy đủ tính năng trong 7 ngày.",
    icon: <Zap className="size-5" />,
    features: [
      "Quản lý 1 cửa hàng",
      "Tối đa 100 sản phẩm",
      "Quản lý IMEI/Serial",
      "Bán hàng POS cơ bản",
      "Báo cáo doanh thu ngày",
    ],
    buttonText: "Bắt đầu dùng thử",
    href: "/signup",
    variant: "outline" as const,
  },
  {
    name: "Cơ bản",
    price: "299k",
    period: "/tháng",
    description: "Phù hợp cho cửa hàng nhỏ và mới bắt đầu.",
    icon: <Star className="size-5" />,
    features: [
      "Quản lý 1 cửa hàng",
      "Không giới hạn sản phẩm",
      "Quản lý sửa chữa cơ bản",
      "In hóa đơn A4/80mm",
      "Quản lý khách hàng",
      "Hỗ trợ qua chat",
    ],
    buttonText: "Chọn gói Cơ bản",
    href: "/signup?plan=basic",
    variant: "default" as const,
    popular: true,
  },
  {
    name: "Chuyên nghiệp",
    price: "599k",
    period: "/tháng",
    description: "Giải pháp toàn diện cho chuỗi cửa hàng.",
    icon: <Rocket className="size-5" />,
    features: [
      "Không giới hạn cửa hàng",
      "Toàn bộ tính năng sửa chữa",
      "Phân quyền nhân viên chi tiết",
      "Báo cáo phân tích chuyên sâu",
      "API tích hợp",
      "Hỗ trợ ưu tiên 24/7",
    ],
    buttonText: "Chọn gói Chuyên nghiệp",
    href: "/signup?plan=premium",
    variant: "outline" as const,
  },
];

export function PricingTable() {
  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
      {plans.map((plan) => (
        <div
          key={plan.name}
          className={cn(
            "relative flex flex-col p-8 bg-white rounded-[2.5rem] border transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50 group",
            plan.popular ? "border-blue-500 shadow-xl ring-1 ring-blue-500/10 scale-105 z-10" : "border-slate-100"
          )}
        >
          {plan.popular && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-blue-500/20">
              Được khuyên dùng
            </div>
          )}
          
          <div className="mb-8">
            <div className={cn(
               "size-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110",
               plan.popular ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "bg-slate-50 text-slate-400 border border-slate-100"
            )}>
               {plan.icon}
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">{plan.name}</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black tracking-tighter text-slate-900">{plan.price}</span>
              {plan.period && <span className="text-slate-400 font-bold text-lg">{plan.period}</span>}
            </div>
            <p className="mt-4 text-slate-500 font-medium text-sm leading-relaxed">{plan.description}</p>
          </div>

          <div className="h-px w-full bg-slate-50 mb-8" />

          <ul className="flex-1 space-y-4 mb-10">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-[13px] font-bold text-slate-600">
                <div className={cn(
                   "mt-0.5 size-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                   plan.popular ? "bg-blue-50 text-blue-500" : "bg-slate-50 text-slate-300"
                )}>
                  <Check className="size-3" strokeWidth={4} />
                </div>
                {feature}
              </li>
            ))}
          </ul>

          <Link
            href={plan.href}
            className={cn(
               buttonVariants({ variant: plan.variant, size: "lg" }),
               "w-full h-14 rounded-2xl font-black text-base transition-all duration-300 flex items-center justify-center",
               plan.popular 
                 ? "bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20" 
                 : "border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
            )}
          >
            {plan.buttonText}
          </Link>
        </div>
      ))}
    </div>
  );
}
