import { formatVND, formatDateTime } from "./format";

export type TemplateData = {
  // General
  ten_cua_hang?: string;
  dia_chi_cua_hang?: string;
  sdt_cua_hang?: string;
  ma_phieu?: string;
  ngay_tao?: string;
  
  // Customer
  ten_khach?: string;
  sdt_khach?: string;
  dia_chi_khach?: string | null;
  
  // Financials
  tam_tinh?: number;
  chiet_khau?: number;
  tong_cong?: number;
  da_thanh_toan?: number;
  con_no?: number;
  
  // Staff
  ten_nhan_vien?: string;
  
  // Service
  loai_may?: string;
  ten_may?: string | null;
  hang?: string | null;
  imei?: string | null;
  tinh_trang?: string | null;
  loi_yeu_cau?: string;
  giai_phap?: string | null;
  hen_tra?: string | null;
  ngay_tra?: string | null;
  bao_hanh?: number | string;
  
  // Notes
  ghi_chu?: string;
  
  // For Custom Product Loop
  items?: Array<{
    ten: string;
    sl: number;
    gia: string | number;
    thanh_tien: string | number;
  }>;

  [key: string]: any;
};

export function renderTemplate(
  template: string | null | undefined, 
  data: TemplateData,
  itemsTableHtml: string = ""
): string {
  if (!template) return "";
  
  let result = template;
  
  // 1. KiotViet-style Product Loop: Auto-repeat any <tr> containing item variables
  const itemVariables = ["{stt}", "{ten}", "{sl}", "{gia}", "{thanh_tien}", "{bh}"];
  const trRegex = /<tr[^>]*>[\s\S]*?<\/tr>/gi;
  
  result = result.replace(trRegex, (match) => {
    // If the <tr> contains any item variable
    const hasItemVar = itemVariables.some(v => match.includes(v));
    
    if (hasItemVar) {
      if (!data.items || data.items.length === 0) return ""; // Hide row if no items
      
      // Repeat this <tr> for each item
      return (data.items as any[]).map((item: any, index) => {
        let row = match;
        row = row.split("{stt}").join(String(index + 1));
        row = row.split("{ten}").join(item.ten || "");
        row = row.split("{sl}").join(String(item.sl || 0));
        row = row.split("{gia}").join(typeof item.gia === 'number' ? formatVND(item.gia) : item.gia);
        row = row.split("{thanh_tien}").join(typeof item.thanh_tien === 'number' ? formatVND(item.thanh_tien) : item.thanh_tien);
        row = row.split("{bh}").join(item.bh || "");
        return row;
      }).join("");
    }
    
    return match; // Keep normal rows as is
  });

  // Generate VietQR code if payment method is bank transfer ("transfer" / "chuyển khoản")
  let qrHtml = "";
  const payMethod = String(data.payment_method || data.paymentMethod || "").toLowerCase();
  const isTransfer = payMethod === "transfer" || payMethod === "chuyển khoản";

  if (isTransfer && data.bank_id && data.bank_account) {
    const amount = data.con_no || data.tong_cong || 0;
    const code = data.ma_phieu || "";
    const addInfo = encodeURIComponent(`THANH TOAN ${code}`);
    const qrUrl = `https://img.vietqr.io/image/${data.bank_id}-${data.bank_account}-qr_only.png?amount=${amount}&addInfo=${addInfo}`;
    qrHtml = `
<div style="text-align: center; margin: 15px 0;">
  <img src="${qrUrl}" alt="VietQR Payment" style="width: 140px; height: 140px; display: inline-block; border: 1px solid #eee; padding: 5px; background: white;" />
  <div style="font-size: 10px; color: #555; margin-top: 5px; font-family: sans-serif; font-weight: bold;">QUÉT MÃ QR THANH TOÁN CHUYỂN KHOẢN</div>
</div>
    `.trim();
    // Inject into data so [if:qr] works
    data.qr = qrHtml;
    data.is_transfer = true;
  }

  // 2. Handle Conditional Blocks [if:key]...[/if]
  // This allows hiding sections if the data is missing or zero
  const condRegex = /\[if:(\w+)\]([\s\S]*?)\[\/if\]/gi;
  result = result.replace(condRegex, (match, key, content) => {
    const val = data[key];
    // Show content if value exists, is not false, is not 0, and is not empty string
    if (val && val !== 0 && val !== "0" && val !== "") {
      return content;
    }
    return "";
  });

  // 3. Handle Regular Placeholders
  const placeholders: Record<string, string> = {
    "{ten_cua_hang}": data.ten_cua_hang || "",
    "{shop_tagline}": data.shop_tagline || "",
    "{dia_chi_cua_hang}": data.dia_chi_cua_hang || "",
    "{sdt_cua_hang}": data.sdt_cua_hang || "",
    "{ma_phieu}": data.ma_phieu || "",
    "{ngay_tao}": data.ngay_tao?.split(" ")[1] || data.ngay_tao || "",
    "{gio_tao}": data.ngay_tao?.split(" ")[0] || "",
    "{ngay_gio_tao}": data.ngay_tao || "",
    
    "{ten_khach}": data.ten_khach || "Khách lẻ",
    "{sdt_khach}": data.sdt_khach || "",
    "{dia_chi_khach}": data.dia_chi_khach || "",
    
    "{tam_tinh}": formatVND(data.tam_tinh || 0),
    "{chiet_khau}": formatVND(data.chiet_khau || 0),
    "{tong_cong}": formatVND(data.tong_cong || data.tam_tinh || 0),
    "{da_thanh_toan}": formatVND(data.da_thanh_toan || 0),
    "{da_dat_coc}": formatVND(data.da_dat_coc || 0),
    "{thanh_toan_lan_nay}": formatVND(data.thanh_toan_lan_nay || 0),
    "{con_no}": formatVND(data.con_no || 0),
    
    "{ten_nhan_vien}": data.ten_nhan_vien || "",
    
    "{loai_may}": data.loai_may || "",
    "{ten_may}": data.ten_may || "",
    "{hang}": data.hang || "",
    "{model}": data.model || "",
    "{imei}": data.imei || "",
    "{tinh_trang}": data.tinh_trang || "",
    "{loi_yeu_cau}": data.loi_yeu_cau || "",
    "{giai_phap}": data.giai_phap || "",
    "{hen_tra}": data.hen_tra || "",
    "{ngay_tra}": data.ngay_tra || "",
    "{bao_hanh}": String(data.bao_hanh || "0"),
    
    "{ghi_chu}": data.ghi_chu || "",
    "{sanpham}": itemsTableHtml,
    "{tongtien}": formatVND(data.tong_cong || data.tam_tinh || 0),
    "{chietkhau}": formatVND(data.chiet_khau || 0),
    "{tong}": formatVND(data.tong_cong || data.tam_tinh || 0),
    "{payment_method}": data.payment_method || data.paymentMethod || "",
    "{qr}": qrHtml,
  };

  for (const [key, value] of Object.entries(placeholders)) {
    result = result.split(key).join(value);
  }
  
  return result;
}
