"use client";

import { useState, useTransition, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Loader2, Save, FileText, Info
} from "lucide-react";
import { toast } from "sonner";
import { updateTemplate } from "./actions";
import { renderTemplate } from "@/lib/template-engine";

// Import Jodit dynamically
const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-muted animate-pulse rounded-md" />,
});

type Template = {
  id: string;
  name: string;
  slug: string;
  content: string | null;
};

const MOCK_DATA = {
  ten_cua_hang: "TechShop",
  dia_chi_cua_hang: "123 Đường Láng, Hà Nội",
  sdt_cua_hang: "0988 123 456",
  ma_phieu: "SC00001",
  ngay_tao: "17:31 30/04/2026",
  ten_khach: "Nguyễn Thị Hồng",
  sdt_khach: "0901234567",
  dia_chi_khach: "Cầu Giấy, Hà Nội",
  tam_tinh: 47990000,
  chiet_khau: 0,
  tong_cong: 47990000,
  da_thanh_toan: 1000000,
  con_no: 46990000,
  ten_nhan_vien: "Quản trị viên",
  loai_may: "Điện thoại",
  ten_may: "iPhone 14 Pro",
  hang: "Apple",
  imei: "353267100123456",
  tinh_trang: "Vỡ màn hình, không cảm ứng được",
  loi_yeu_cau: "Vỡ màn hình, không cảm ứng được",
  giai_phap: "Thay màn hình zin bóc máy",
  hen_tra: "05/05/2026",
  ngay_tra: "04/05/2026",
  bao_hanh: 6,
  ghi_chu: "Máy còn mới, trầy nhẹ.",
  items: [
    { ten: "Sản phẩm Mẫu 01", sl: 1, gia: 10000000, thanh_tien: 10000000, bh: "12M" },
    { ten: "Dịch vụ Mẫu 02", sl: 2, gia: 5000000, thanh_tien: 10000000, bh: "6M" },
  ]
};

const VARIABLES = [
  { key: "{ten_cua_hang}", label: "Tên cửa hàng" },
  { key: "{dia_chi_cua_hang}", label: "Địa chỉ cửa hàng" },
  { key: "{sdt_cua_hang}", label: "SĐT cửa hàng" },
  { key: "{ma_phieu}", label: "Mã phiếu" },
  { key: "{ngay_tao}", label: "Ngày tạo (Chỉ ngày)" },
  { key: "{gio_tao}", label: "Giờ tạo" },
  { key: "{ngay_gio_tao}", label: "Ngày và Giờ" },
  { key: "{ten_khach}", label: "Tên khách hàng" },
  { key: "{sdt_khach}", label: "SĐT khách hàng" },
  { key: "{dia_chi_khach}", label: "Địa chỉ khách hàng" },
  { key: "{tong_cong}", label: "Tổng cộng" },
  { key: "{tam_tinh}", label: "Tạm tính" },
  { key: "{chiet_khau}", label: "Chiết khấu" },
  { key: "{da_thanh_toan}", label: "Đã trả" },
  { key: "{con_no}", label: "Còn nợ" },
  { key: "{ten_nhan_vien}", label: "Tên nhân viên" },
  { key: "{stt}", label: "STT (Trong bảng)" },
  { key: "{ten}", label: "Tên SP (Trong bảng)" },
  { key: "{sl}", label: "SL (Trong bảng)" },
  { key: "{gia}", label: "Giá (Trong bảng)" },
  { key: "{thanh_tien}", label: "Thành tiền" },
  { key: "{bh}", label: "Bảo hành (SP)" },
  { key: "{loai_may}", label: "Loại máy (Dịch vụ)" },
  { key: "{ten_may}", label: "Tên máy (Dịch vụ)" },
  { key: "{hang}", label: "Hãng máy" },
  { key: "{imei}", label: "IMEI (Dịch vụ)" },
  { key: "{tinh_trang}", label: "Tình trạng" },
  { key: "{loi_yeu_cau}", label: "Yêu cầu" },
  { key: "{giai_phap}", label: "Giải pháp" },
  { key: "{hen_tra}", label: "Hẹn trả" },
  { key: "{ngay_tra}", label: "Ngày trả" },
  { key: "{bao_hanh}", label: "Bảo hành" },
  { key: "{ghi_chu}", label: "Ghi chú" },
];

export function TemplateEditor({ templates }: { templates: Template[] }) {
  const [selectedId, setSelectedId] = useState(templates[0]?.id);
  const [pending, startTransition] = useTransition();

  const current = templates.find((t) => t.id === selectedId);
  const [content, setContent] = useState(current?.content || "");

  useMemo(() => {
    if (current) {
      setContent(current.content || "");
    }
  }, [selectedId, current]);

  function submit() {
    if (!selectedId) return;
    startTransition(async () => {
      const res = await updateTemplate(selectedId, { content });
      if (res.ok) {
        toast.success("Đã lưu mẫu in");
      } else {
        toast.error(res.error || "Lỗi");
      }
    });
  }

  const renderedContent = renderTemplate(content, MOCK_DATA);

  const config = useMemo(() => ({
    readonly: false,
    placeholder: 'Soạn thảo mẫu in...',
    minHeight: 600,
    height: 'auto',
    toolbarSticky: false,
    buttons: [
      'source', '|',
      'bold', 'italic', 'underline', 'strikethrough', '|',
      'font', 'fontsize', 'brush', '|',
      'ul', 'ol', '|',
      'align', 'outdent', 'indent', '|',
      'table', 'link', 'hr', '|',
      'undo', 'redo', '|',
      'eraser', 'fullsize'
    ],
    style: {
      fontFamily: 'Inter, sans-serif'
    }
  }), []);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-20">
      {/* Editor Side */}
      <div className="space-y-4 flex flex-col">
        <div className="flex gap-2 shrink-0 overflow-x-auto pb-1">
          {templates.map((t) => (
            <Button
              key={t.id}
              variant={selectedId === t.id ? "default" : "outline"}
              onClick={() => setSelectedId(t.id)}
              className="whitespace-nowrap"
            >
              <FileText className="size-4 mr-2" />
              {t.name}
            </Button>
          ))}
        </div>

        <Card className="flex flex-col rounded-lg shadow-sm border">
          <CardContent className="p-0 flex flex-col">
            <div className="jodit-editor-container border-b">
              <JoditEditor
                value={content}
                config={config}
                onBlur={(newContent) => setContent(newContent)}
              />
            </div>

            <div className="p-4 bg-slate-50 border-b space-y-3 shrink-0">
              <div className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                <Info className="size-3" />
                Click biến để copy vào mẫu
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {VARIABLES.map((v) => (
                  <code
                    key={v.key}
                    className="text-[10px] bg-background border px-1.5 py-0.5 rounded cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => {
                      navigator.clipboard.writeText(v.key);
                      toast.success(`Đã copy ${v.key}`);
                    }}
                    title={v.label}
                  >
                    {v.key}
                  </code>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t flex justify-end shrink-0">
              <Button onClick={submit} disabled={pending} size="lg" className="w-full md:w-auto">
                {pending ? (
                  <Loader2 className="size-4 animate-spin mr-2" />
                ) : (
                  <Save className="size-4 mr-2" />
                )}
                Lưu mẫu in
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Side */}
      <div className="border rounded-xl bg-muted/30 flex flex-col shadow-inner">
        <div className="bg-background border-b px-4 py-2 text-[10px] font-bold uppercase text-muted-foreground flex justify-between items-center shrink-0 rounded-t-xl">
          <span>Bản xem trước A-Z</span>
          <span className="text-emerald-600 flex items-center gap-1">
            <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Live Preview
          </span>
        </div>
        <div className="flex-1 p-4 md:p-8 bg-slate-200 dark:bg-slate-900 rounded-b-xl">
          <div className="max-w-[420px] mx-auto shadow-2xl border p-0 bg-white text-black min-h-[600px] relative print-paper">
            <div className="p-8 pb-20">
              <div 
                className="print-preview-content"
                dangerouslySetInnerHTML={{ __html: renderedContent }} 
              />
            </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .jodit-editor-container {
          min-height: 600px;
        }
        .jodit-editor-container .jodit-container {
          border: none !important;
          min-height: 600px !important;
          display: flex;
          flex-direction: column;
        }
        .jodit-editor-container .jodit-workplace {
          flex: 1;
          min-height: 500px !important;
        }
        
        /* Show dashed lines for border="0" tables in Editor */
        .jodit-wysiwyg table:not([border]), 
        .jodit-wysiwyg table[border="0"] {
          border: 1px dashed #ccc !important;
        }
        .jodit-wysiwyg table:not([border]) td, 
        .jodit-wysiwyg table[border="0"] td {
          border: 1px dashed #eee !important;
        }

        /* Default Print Styles */
        .print-preview-content {
          font-family: Arial, sans-serif;
          font-size: 13px;
          line-height: 1.5;
        }
        .print-preview-content table {
          width: 100%;
          border-collapse: collapse;
        }
        .print-preview-content table[border="1"],
        .print-preview-content table[border="1"] td,
        .print-preview-content table[border="1"] th {
          border: 1px solid #000;
        }
        .print-preview-content table[border="0"],
        .print-preview-content table:not([border]),
        .print-preview-content table[border="0"] td,
        .print-preview-content table:not([border]) td {
          border: none;
        }
        .print-preview-content td {
          padding: 4px;
        }
      `}</style>
    </div>
  );
}
