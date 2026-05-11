import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { 
  Laptop, 
  Smartphone, 
  Wrench, 
  CheckCircle2, 
  Zap, 
  Shield, 
  BarChart3, 
  ArrowRight,
  Star,
  Layers,
  MousePointer2,
  Printer,
  History,
  Users2,
  Check
} from "lucide-react";
import { PricingTable } from "@/components/pricing-table";
import { ComparisonSection } from "@/components/comparison-section";
import { getSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { LoginPopup } from "@/components/login-popup";

export default async function LandingPage() {
  const user = await getSession();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-2xl tracking-tight text-slate-900">
            <div className="size-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <Laptop className="size-5" />
            </div>
            MyPOS
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Tính năng</Link>
            <Link href="#pricing" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Bảng giá</Link>
            <Link href="#comparison" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">So sánh</Link>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <Link href="/dashboard" className={buttonVariants({ variant: "default", className: "rounded-full px-6" })}>
                Vào Dashboard
              </Link>
            ) : (
              <>
                <LoginPopup />
                <Link href="/signup" className={buttonVariants({ className: "rounded-full px-6 shadow-md shadow-primary/10" })}>
                  Dùng thử miễn phí
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section - Updated per image */}
        <section className="relative w-full pt-20 pb-32 overflow-hidden bg-white">
          <div className="container px-6 mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col items-start text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold mb-8">
                <Zap className="size-3 fill-current" />
                SaaS dùng thử 14 ngày, không cần thẻ tín dụng
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-slate-900 mb-8">
                Quản lý cửa hàng <br/>
                laptop & điện thoại <br/>
                <span className="text-blue-600">trên một nền tảng duy nhất.</span>
              </h1>
              
              <p className="max-w-xl text-slate-500 text-lg md:text-xl leading-relaxed mb-10">
                Bán hàng, sửa chữa, kho hàng, khách hàng và báo cáo doanh thu — tất cả tích hợp sẵn. 
                Đăng ký 5 phút là có cửa hàng riêng, dữ liệu tách biệt hoàn toàn với các shop khác.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 mb-10">
                <Link href="/signup" className={cn(buttonVariants({ size: "lg" }), "h-14 px-10 rounded-xl text-lg font-bold bg-blue-600 hover:bg-blue-700")}>
                  Tạo cửa hàng miễn phí
                </Link>
                <Link href="/login" className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors ml-2">
                  Đã có tài khoản — Đăng nhập
                </Link>
              </div>

              <div className="flex flex-wrap gap-x-8 gap-y-3">
                 <CheckItem label="Không cần cài đặt" />
                 <CheckItem label="Hỗ trợ in 80mm & A4" />
                 <CheckItem label="Đa người dùng" />
              </div>
            </div>

            {/* Browser Mockup per image */}
            <div className="relative group perspective-1000">
               <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 blur-3xl -z-10 rounded-full"></div>
               <div className="relative rounded-2xl border bg-white shadow-2xl overflow-hidden animate-in fade-in slide-in-from-right-10 duration-1000">
                  {/* Browser Header */}
                  <div className="h-10 border-b bg-slate-50 flex items-center px-4 gap-1.5">
                    <div className="size-3 rounded-full bg-red-400"></div>
                    <div className="size-3 rounded-full bg-amber-400"></div>
                    <div className="size-3 rounded-full bg-emerald-400"></div>
                    <div className="flex-1 flex justify-center">
                      <div className="text-[10px] font-medium text-slate-400 font-mono tracking-tight bg-white px-3 py-0.5 rounded border border-slate-200 shadow-sm">
                        shop-cua-ban.mypos.app
                      </div>
                    </div>
                  </div>
                  {/* Dashboard Content Mockup */}
                  <div className="p-6 bg-white min-h-[400px]">
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      <MockStatCard label="Doanh thu hôm nay" value="42.5M" />
                      <MockStatCard label="Đơn bán" value="18" />
                      <MockStatCard label="Phiếu sửa" value="6" />
                    </div>
                    <div className="space-y-3">
                      <MockRow code="HD00018" name="Anh Minh" value="4.290.000 đ" />
                      <MockRow code="SC00012" name="Chị Lan" value="Đang sửa" status="active" />
                      <MockRow code="HD00017" name="Anh Hùng" value="980.000 đ" />
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* Features Section - Updated per requirements */}
        <section id="features" className="py-32 bg-slate-50/50 relative border-y">
          <div className="container px-6 mx-auto">
            <div className="max-w-4xl mx-auto text-center mb-20 space-y-4">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
                Mọi thứ bạn cần để vận hành cửa hàng
              </h2>
              <p className="text-slate-500 text-lg md:text-xl max-w-3xl mx-auto">
                Thiết kế dành riêng cho shop laptop & điện thoại — không phải phần mềm POS thuần bán hàng đa ngành.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Smartphone className="size-7" />}
                title="Quản lý IMEI & Serial"
                description="Theo dõi lịch sử nhập xuất, bảo hành đến từng thiết bị cụ thể. Không lo nhầm lẫn hàng hóa."
                color="blue"
              />
              <FeatureCard 
                icon={<Wrench className="size-7" />}
                title="Quy trình sửa chữa"
                description="Tiếp nhận máy, báo giá tự động, phân công KTV và quản lý linh kiện thay thế chuyên nghiệp."
                color="amber"
              />
              <FeatureCard 
                icon={<Printer className="size-7" />}
                title="In phiếu & Tem nhãn"
                description="Tự động in phiếu nhận máy, hóa đơn bán hàng và tem nhãn bảo hành theo chuẩn cửa hàng."
                color="emerald"
              />
              <FeatureCard 
                icon={<History className="size-7" />}
                title="Lịch sử bảo hành"
                description="Tra cứu lịch sử sửa chữa, bảo hành của khách hàng chỉ bằng số điện thoại hoặc mã máy."
                color="indigo"
              />
              <FeatureCard 
                icon={<Shield className="size-7" />}
                title="Bảo mật đa tầng"
                description="Dữ liệu shop tách biệt hoàn toàn. Phân quyền chi tiết cho nhân viên bán hàng và kỹ thuật."
                color="purple"
              />
              <FeatureCard 
                icon={<BarChart3 className="size-7" />}
                title="Báo cáo chuyên sâu"
                description="Theo dõi doanh thu, chi phí linh kiện, lợi nhuận thực tế và hiệu quả làm việc của KTV."
                color="rose"
              />
              <FeatureCard 
                icon={<Users2 className="size-7" />}
                title="Chăm sóc khách hàng"
                description="Lưu trữ thông tin khách hàng, tích lũy điểm và quản lý các chương trình ưu đãi."
                color="blue"
              />
              <FeatureCard 
                icon={<Layers className="size-7" />}
                title="Kho hàng linh hoạt"
                description="Quản lý tồn kho linh kiện và máy cũ/mới riêng biệt. Cảnh báo khi tồn kho xuống thấp."
                color="amber"
              />
              <FeatureCard 
                icon={<MousePointer2 className="size-7" />}
                title="Dễ dàng mở rộng"
                description="Hỗ trợ nhiều chi nhánh, quản lý tập trung trên một tài khoản duy nhất. Phù hợp mọi quy mô."
                color="emerald"
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32">
          <div className="container px-6 mx-auto">
            <div className="max-w-3xl mx-auto text-center mb-20 space-y-4">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900">
                Lựa chọn gói dịch vụ phù hợp
              </h2>
              <p className="text-slate-600 text-lg">
                Tiết kiệm chi phí, tối đa hiệu quả. Bắt đầu miễn phí và nâng cấp khi bạn phát triển.
              </p>
            </div>
            
            <PricingTable />
          </div>
        </section>

        {/* Comparison Section */}
        <section id="comparison" className="py-32 bg-slate-50/50">
          <div className="container px-6 mx-auto">
            <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                So sánh chi tiết tính năng
              </h2>
              <p className="text-slate-600">
                Xem qua sự khác biệt giữa các phiên bản để có lựa chọn đúng đắn nhất.
              </p>
            </div>
            
            <ComparisonSection />
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-32">
          <div className="container px-6 mx-auto">
            <div className="max-w-3xl mx-auto text-center mb-20 space-y-4">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900">
                Câu hỏi thường gặp
              </h2>
              <p className="text-slate-600 text-lg">
                Giải đáp nhanh những thắc mắc của chủ shop về phần mềm.
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto grid gap-6">
              <FaqItem 
                question="Tôi có cần cài đặt phần mềm lên máy tính không?"
                answer="Không. MyPOS là phần mềm SaaS (Software as a Service) chạy trên nền tảng web. Bạn chỉ cần trình duyệt web trên máy tính, điện thoại hoặc máy tính bảng là có thể sử dụng ngay."
              />
              <FaqItem 
                question="Dữ liệu của tôi có được an toàn và tách biệt không?"
                answer="Có. Mỗi cửa hàng khi đăng ký sẽ có một cơ sở dữ liệu và subdomain riêng biệt. Dữ liệu của bạn được mã hóa và sao lưu hàng ngày trên hệ thống đám mây."
              />
              <FaqItem 
                question="Phần mềm có hỗ trợ in hóa đơn và phiếu nhận máy không?"
                answer="Tất nhiên. MyPOS tích hợp sẵn trình in hóa đơn khổ 80mm (máy in nhiệt) và in phiếu khổ A4/A5 chuyên nghiệp cho các shop sửa chữa."
              />
              <FaqItem 
                question="Tôi có thể quản lý nhiều chi nhánh cùng lúc không?"
                answer="Có. Gói Chuyên nghiệp của chúng tôi cho phép bạn quản lý chuỗi nhiều cửa hàng tập trung, giúp bạn theo dõi doanh thu và kho hàng toàn hệ thống một cách dễ dàng."
              />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24">
          <div className="container px-6 mx-auto">
            <div className="relative rounded-3xl bg-slate-900 overflow-hidden p-12 md:p-20 text-center">
               <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 size-96 bg-blue-600/20 blur-[120px] rounded-full"></div>
               <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 size-96 bg-primary/20 blur-[120px] rounded-full"></div>
               
               <div className="relative z-10 space-y-8">
                  <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                    Chuyển đổi số cho Shop của bạn ngay hôm nay
                  </h2>
                  <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                    Hơn 500+ chủ cửa hàng đã tin dùng MyPOS để quản lý và phát triển kinh doanh. 
                    Bạn đã sẵn sàng tham gia cùng họ?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/signup" className={cn(buttonVariants({ size: "lg" }), "h-14 px-10 rounded-xl text-lg font-bold bg-blue-600 hover:bg-blue-700")}>
                      Dùng thử 7 ngày miễn phí <ArrowRight className="ml-2 size-5" />
                    </Link>
                  </div>
               </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t bg-white">
        <div className="container px-6 mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
                <div className="size-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Laptop className="size-4" />
                </div>
                MyPOS
              </div>
              <p className="text-slate-500 max-w-sm leading-relaxed">
                Nền tảng quản lý chuyên biệt cho các cửa hàng, trung tâm sửa chữa và bảo hành Laptop, Điện thoại hàng đầu Việt Nam.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900">Sản phẩm</h4>
              <nav className="flex flex-col gap-2">
                <Link href="#features" className="text-slate-500 hover:text-primary transition-colors text-sm">Tính năng</Link>
                <Link href="#pricing" className="text-slate-500 hover:text-primary transition-colors text-sm">Bảng giá</Link>
                <Link href="/signup" className="text-slate-500 hover:text-primary transition-colors text-sm">Đăng ký</Link>
              </nav>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900">Công ty</h4>
              <nav className="flex flex-col gap-2">
                <Link href="#" className="text-slate-500 hover:text-primary transition-colors text-sm">Về chúng tôi</Link>
                <Link href="#" className="text-slate-500 hover:text-primary transition-colors text-sm">Điều khoản</Link>
                <Link href="#" className="text-slate-500 hover:text-primary transition-colors text-sm">Bảo mật</Link>
              </nav>
            </div>
          </div>
          <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
            <div>© {new Date().getFullYear()} MyPOS. Phát triển bởi Antigravity Team.</div>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-slate-600">Facebook</Link>
              <Link href="#" className="hover:text-slate-600">Zalo</Link>
              <Link href="#" className="hover:text-slate-600">YouTube</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CheckItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-slate-600 font-medium">
      <div className="size-5 rounded-full bg-green-50 flex items-center justify-center">
        <Check className="size-3 text-green-600" strokeWidth={4} />
      </div>
      {label}
    </div>
  );
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
  return (
    <div className="p-6 rounded-2xl border border-slate-100 bg-white hover:border-blue-200 transition-colors shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-2">{question}</h3>
      <p className="text-slate-500 leading-relaxed text-sm md:text-base">{answer}</p>
    </div>
  );
}

function MockStatCard({ label, value }: { label: string, value: string }) {
  return (
    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
      <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">{label}</div>
      <div className="text-xl font-black text-slate-900">{value}</div>
    </div>
  );
}

function MockRow({ code, name, value, status }: { code: string, name: string, value: string, status?: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-50 hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-bold text-slate-400 font-mono">{code}</span>
        <span className="text-sm font-bold text-slate-700">{name}</span>
      </div>
      <div className={cn(
        "text-sm font-black",
        status === "active" ? "text-blue-600" : "text-emerald-600"
      )}>
        {value}
      </div>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  color 
}: { 
  icon: React.ReactNode, 
  title: string, 
  description: string,
  color: "blue" | "amber" | "emerald" | "indigo" | "purple" | "rose"
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };

  return (
    <div className="group p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
      <div className={cn("size-14 rounded-2xl flex items-center justify-center border mb-6 group-hover:scale-110 transition-transform duration-300", colors[color])}>
        {icon}
      </div>
      <h3 className="font-bold text-xl text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed text-sm md:text-base">{description}</p>
    </div>
  );
}
