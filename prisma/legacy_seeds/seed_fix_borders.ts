import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

const COMMON_STYLES = `
<style>
  /* Reset triệt để các đường kẻ bảng */
  .premium-receipt table, 
  .premium-receipt tr, 
  .premium-receipt td, 
  .premium-receipt th { 
    border: none !important; 
    border-collapse: collapse !important;
    padding: 0;
    margin: 0;
  }
  .premium-receipt { font-family: 'Inter', sans-serif; color: #000; line-height: 1.4; padding: 10px; }
  .section-label { font-size: 10px; font-weight: bold; color: #666; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 2px; margin-top: 15px; }
  .grid-table { width: 100%; margin-bottom: 10px; }
  .grid-table td { width: 50%; vertical-align: top; padding: 4px 0 !important; }
  .field-label { font-size: 11px; color: #666; margin-bottom: 2px; }
  .field-value { font-size: 14px; font-weight: 500; }
  .total-row { display: flex; justify-content: flex-end; align-items: baseline; gap: 10px; margin-top: 8px; }
</style>
`;

const SALE_LAYOUT = `
${COMMON_STYLES}
<div class="premium-receipt">
  <table style="width: 100%; margin-bottom: 20px;">
    <tr>
      <td style="vertical-align: top;"><h2 style="margin: 0; font-size: 20px;">{ten_cua_hang}</h2></td>
      <td style="text-align: right; vertical-align: top;">
        <h1 style="margin: 0; font-size: 18px; text-transform: uppercase;">HOÁ ĐƠN BÁN HÀNG</h1>
        <p style="margin: 2px 0 0; font-size: 13px; font-weight: 500;">{ma_phieu}</p>
        <p style="margin: 2px 0 0; font-size: 11px; color: #666;">Ngày bán: {ngay_tao}</p>
      </td>
    </tr>
  </table>

  <div class="section-label">Khách hàng</div>
  <table class="grid-table">
    <tr>
      <td><div class="field-label">Họ tên</div><div class="field-value">{ten_khach}</div></td>
      <td><div class="field-label">SĐT</div><div class="field-value">{sdt_khach}</div></td>
    </tr>
    <tr>
      <td colspan="2"><div class="field-label">Địa chỉ</div><div class="field-value">{dia_chi_khach}</div></td>
    </tr>
  </table>

  <div class="section-label">Danh sách sản phẩm</div>
  <div style="margin-bottom: 15px;">{sanpham}</div>

  <div style="text-align: right;">
    <div class="total-row">
      <span style="font-size: 14px;">Tạm tính</span>
      <span style="font-size: 14px; font-weight: 500;">{tam_tinh}</span>
    </div>
    <div class="total-row">
      <span style="font-size: 14px; color: #666;">Chiết khấu</span>
      <span style="font-size: 14px; font-weight: 500; color: #ef4444;">-{chiet_khau}</span>
    </div>
    <div class="total-row" style="margin-top: 10px; border-top: 1px solid #000 !important; padding-top: 5px;">
      <span style="font-size: 15px; font-weight: bold;">Tổng thanh toán</span>
      <span style="font-size: 20px; font-weight: bold; color: #2563eb;">{tong_cong}</span>
    </div>
  </div>

  <div class="section-label">Ghi chú</div>
  <p style="font-size: 13px; margin: 0;">{ghi_chu}</p>

  <table style="width: 100%; margin-top: 40px; text-align: center;">
    <tr>
      <td style="width: 50%;">
        <div style="font-size: 12px; font-weight: bold; margin-bottom: 60px;">Khách hàng</div>
        <div style="border-top: 1px solid #eee !important; display: inline-block; width: 150px; padding-top: 5px; font-size: 11px; color: #999;">Ký, ghi rõ họ tên</div>
      </td>
      <td style="width: 50%;">
        <div style="font-size: 12px; font-weight: bold;">Nhân viên bán hàng</div>
        <div style="font-size: 14px; font-weight: 500; margin-bottom: 45px;">{ten_nhan_vien}</div>
        <div style="border-top: 1px solid #eee !important; display: inline-block; width: 150px; padding-top: 5px; font-size: 11px; color: #999;">Ký xác nhận</div>
      </td>
    </tr>
  </table>
  <p style="text-align: center; font-size: 11px; color: #999; margin-top: 30px; font-style: italic;">Cảm ơn quý khách! Hẹn gặp lại.</p>
</div>
`.trim();

const INTAKE_LAYOUT = `
${COMMON_STYLES}
<div class="premium-receipt">
  <table style="width: 100%; margin-bottom: 20px;">
    <tr>
      <td style="vertical-align: top;"><h2 style="margin: 0; font-size: 20px;">{ten_cua_hang}</h2></td>
      <td style="text-align: right; vertical-align: top;">
        <h1 style="margin: 0; font-size: 18px; text-transform: uppercase;">PHIẾU NHẬN MÁY</h1>
        <p style="margin: 2px 0 0; font-size: 13px; font-weight: 500;">{ma_phieu}</p>
        <p style="margin: 2px 0 0; font-size: 11px; color: #666;">Tiếp nhận: {ngay_tao}</p>
      </td>
    </tr>
  </table>

  <div class="section-label">Khách hàng</div>
  <table class="grid-table">
    <tr>
      <td><div class="field-label">Họ tên</div><div class="field-value">{ten_khach}</div></td>
      <td><div class="field-label">SĐT</div><div class="field-value">{sdt_khach}</div></td>
    </tr>
  </table>

  <div class="section-label">Thiết bị</div>
  <table class="grid-table">
    <tr>
      <td><div class="field-label">Loại</div><div class="field-value">{loai_may}</div></td>
      <td><div class="field-label">Hãng</div><div class="field-value">{hang}</div></td>
    </tr>
    <tr>
      <td><div class="field-label">Model</div><div class="field-value">{ten_may}</div></td>
      <td><div class="field-label">IMEI / Serial</div><div class="field-value">{imei}</div></td>
    </tr>
  </table>

  <div class="section-label">Yêu cầu sửa chữa</div>
  <p style="font-size: 14px; margin: 0 0 15px;">{loi_yeu_cau}</p>

  <div class="section-label">Báo giá dịch vụ</div>
  <div style="margin-bottom: 15px;">{sanpham}</div>

  <div style="text-align: right;">
    <div class="total-row">
      <span style="font-size: 14px; font-weight: bold;">Tổng báo giá</span>
      <span style="font-size: 18px; font-weight: bold; color: #2563eb;">{tong_cong}</span>
    </div>
    <div class="total-row" style="margin-top: 5px;">
      <span style="font-size: 12px; color: #666;">Đặt cọc</span>
      <span style="font-size: 14px; font-weight: 500; color: #059669;">{da_thanh_toan}</span>
    </div>
  </div>

  <div style="margin-top: 25px; font-size: 11px; color: #555; line-height: 1.6;">
    <ul style="padding-left: 15px; margin: 0;">
      <li>Cửa hàng chỉ giữ máy theo nội dung mô tả ở phiếu này. Khách hàng vui lòng giữ phiếu để nhận lại máy.</li>
      <li>Báo giá có thể thay đổi sau khi kiểm tra chi tiết, cửa hàng sẽ thông báo trước khi tiến hành sửa.</li>
      <li>Mọi phát sinh hư hỏng do người dùng tự ý mở máy/sửa chữa nơi khác trước đó, cửa hàng không chịu trách nhiệm.</li>
    </ul>
  </div>

  <table style="width: 100%; margin-top: 40px; text-align: center;">
    <tr>
      <td style="width: 50%;">
        <div style="font-size: 12px; font-weight: bold; margin-bottom: 60px;">Khách hàng</div>
        <div style="border-top: 1px solid #eee !important; display: inline-block; width: 150px; padding-top: 5px; font-size: 11px; color: #999;">Ký, ghi rõ họ tên</div>
      </td>
      <td style="width: 50%;">
        <div style="font-size: 12px; font-weight: bold;">Nhân viên tiếp nhận</div>
        <div style="font-size: 14px; font-weight: 500; margin-bottom: 45px;">{ten_nhan_vien}</div>
        <div style="border-top: 1px solid #eee !important; display: inline-block; width: 150px; padding-top: 5px; font-size: 11px; color: #999;">Ký xác nhận</div>
      </td>
    </tr>
  </table>
</div>
`.trim();

const RETURN_LAYOUT = `
${COMMON_STYLES}
<div class="premium-receipt">
  <table style="width: 100%; margin-bottom: 20px;">
    <tr>
      <td style="vertical-align: top;"><h2 style="margin: 0; font-size: 20px;">{ten_cua_hang}</h2></td>
      <td style="text-align: right; vertical-align: top;">
        <h1 style="margin: 0; font-size: 18px; text-transform: uppercase;">PHIẾU TRẢ MÁY</h1>
        <p style="margin: 2px 0 0; font-size: 13px; font-weight: 500;">{ma_phieu}</p>
        <p style="margin: 2px 0 0; font-size: 11px; color: #666;">Ngày trả: {ngay_tra}</p>
      </td>
    </tr>
  </table>

  <div class="section-label">Thông tin khách hàng & Thiết bị</div>
  <table class="grid-table">
    <tr>
      <td><div class="field-label">Khách hàng</div><div class="field-value">{ten_khach}</div></td>
      <td><div class="field-label">SĐT</div><div class="field-value">{sdt_khach}</div></td>
    </tr>
    <tr>
      <td><div class="field-label">Thiết bị</div><div class="field-value">{ten_may}</div></td>
      <td><div class="field-label">IMEI / Serial</div><div class="field-value">{imei}</div></td>
    </tr>
  </table>

  <div class="section-label">Nội dung đã thực hiện</div>
  <p style="font-size: 14px; margin: 0 0 15px; white-space: pre-wrap;">{giai_phap}</p>

  <div class="section-label">Chi tiết vật tư & phí dịch vụ</div>
  <div style="margin-bottom: 15px;">{sanpham}</div>

  <div style="text-align: right;">
    <div class="total-row">
      <span style="font-size: 15px; font-weight: bold;">Tổng chi phí</span>
      <span style="font-size: 20px; font-weight: bold; color: #2563eb;">{tong_cong}</span>
    </div>
  </div>

  <div style="margin-top: 15px; border: 1px dashed #2563eb !important; padding: 10px; border-radius: 4px; text-align: center; color: #2563eb;">
    <div style="font-size: 12px; font-weight: bold; text-transform: uppercase;">Thời hạn bảo hành</div>
    <div style="font-size: 18px; font-weight: bold;">{bao_hanh} THÁNG</div>
    <div style="font-size: 11px;">(Kể từ ngày {ngay_tra})</div>
  </div>

  <table style="width: 100%; margin-top: 40px; text-align: center;">
    <tr>
      <td style="width: 50%;">
        <div style="font-size: 12px; font-weight: bold; margin-bottom: 60px;">Khách hàng nhận máy</div>
        <div style="border-top: 1px solid #eee !important; display: inline-block; width: 150px; padding-top: 5px; font-size: 11px; color: #999;">Ký, ghi rõ họ tên</div>
      </td>
      <td style="width: 50%;">
        <div style="font-size: 12px; font-weight: bold;">Nhân viên trả máy</div>
        <div style="font-size: 14px; font-weight: 500; margin-bottom: 45px;">{ten_nhan_vien}</div>
        <div style="border-top: 1px solid #eee !important; display: inline-block; width: 150px; padding-top: 5px; font-size: 11px; color: #999;">Ký xác nhận</div>
      </td>
    </tr>
  </table>
</div>
`.trim();

async function main() {
  const templates = [
    { slug: "sale-receipt", name: "Hóa đơn bán hàng", content: SALE_LAYOUT },
    { slug: "service-intake", name: "Phiếu nhận máy", content: INTAKE_LAYOUT },
    { slug: "service-return", name: "Phiếu trả máy", content: RETURN_LAYOUT },
  ];

  for (const t of templates) {
    await prisma.printTemplate.upsert({
      where: { slug: t.slug },
      update: { content: t.content },
      create: t,
    });
  }
  console.log("All premium templates fixed (no more rectangle boxes)");
}

main().catch(console.error).finally(() => prisma.$disconnect());
