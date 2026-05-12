import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

const COMMON_STYLES = `
<style>
  .premium-receipt { font-family: 'Inter', sans-serif; color: #000; line-height: 1.4; }
  .section-label { font-size: 10px; font-weight: bold; color: #666; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 2px; }
  .grid-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
  .grid-table td { width: 50%; vertical-align: top; padding: 4px 0; }
  .field-label { font-size: 11px; color: #666; margin-bottom: 2px; }
  .field-value { font-size: 14px; font-weight: 500; }
  .total-row { display: flex; justify-content: flex-end; align-items: baseline; gap: 10px; margin-top: 10px; }
</style>
`;

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
        <div style="border-top: 1px solid #eee; display: inline-block; width: 150px; padding-top: 5px; font-size: 11px; color: #999;">Ký, ghi rõ họ tên</div>
      </td>
      <td style="width: 50%;">
        <div style="font-size: 12px; font-weight: bold;">Nhân viên tiếp nhận</div>
        <div style="font-size: 14px; font-weight: 500; margin-bottom: 45px;">{ten_nhan_vien}</div>
        <div style="border-top: 1px solid #eee; display: inline-block; width: 150px; padding-top: 5px; font-size: 11px; color: #999;">Ký xác nhận</div>
      </td>
    </tr>
  </table>
</div>
`.trim();

async function main() {
  await prisma.printTemplate.upsert({
    where: { slug: "service-intake" },
    update: { content: INTAKE_LAYOUT },
    create: { slug: "service-intake", name: "Phiếu nhận máy", content: INTAKE_LAYOUT },
  });
  console.log("Premium Intake Template seeded successfully");
}

main().catch(console.error).finally(() => prisma.$disconnect());
