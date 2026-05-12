import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

const SALE_LAYOUT = `
<div style="text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px;">
  <h1 style="font-size: 20px; font-weight: bold; margin: 0; text-transform: uppercase;">HOÁ ĐƠN BÁN HÀNG</h1>
  <div style="font-family: monospace; font-size: 12px;">{ma_phieu}</div>
  <div style="font-size: 10px; color: #666; text-transform: uppercase;">{ngay_tao}</div>
</div>

<div style="margin-bottom: 15px; font-size: 13px;">
  Chào anh/chị <strong>{ten_khach}</strong>, cảm ơn bạn đã mua hàng tại <strong>{ten_cua_hang}</strong>!<br/>
  SĐT: {sdt_khach}<br/>
  Địa chỉ: {dia_chi_khach}
</div>

<div style="margin-bottom: 15px;">
  {sanpham}
</div>

<div style="border: 1px solid #eee; border-radius: 4px; padding: 10px; font-size: 13px;">
  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
    <span>Tạm tính:</span>
    <span>{tam_tinh}</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #059669;">
    <span>Chiết khấu:</span>
    <span>-{chiet_khau}</span>
  </div>
  <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 16px; border-top: 1px solid #eee; pt: 6px; mt: 4px;">
    <span>Tổng cộng:</span>
    <span style="color: #2563eb;">{tong_cong}</span>
  </div>
</div>

<div style="margin-top: 15px; font-size: 12px; font-style: italic; color: #666;">
  Ghi chú: {ghi_chu}
</div>

<div style="margin-top: 20px; border-top: 1px solid #eee; pt: 10px; text-align: center; font-size: 12px; font-style: italic; color: #999;">
  Cảm ơn quý khách! Hẹn gặp lại.
</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px; text-align: center;">
  <div>
    <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 40px;">Khách hàng</div>
    <div style="border-top: 1px solid #eee; padding-top: 4px; font-size: 10px; color: #999;">Ký, ghi rõ họ tên</div>
  </div>
  <div>
    <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px;">Nhân viên</div>
    <div style="font-size: 13px; font-weight: 500; margin-bottom: 15px;">{ten_nhan_vien}</div>
    <div style="border-top: 1px solid #eee; padding-top: 4px; font-size: 10px; color: #999;">Ký xác nhận</div>
  </div>
</div>
`.trim();

const INTAKE_LAYOUT = `
<div style="text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px;">
  <h1 style="font-size: 20px; font-weight: bold; margin: 0; text-transform: uppercase;">PHIẾU NHẬN MÁY</h1>
  <div style="font-family: monospace; font-size: 12px;">{ma_phieu}</div>
  <div style="font-size: 10px; color: #666; text-transform: uppercase;">Tiếp nhận: {ngay_tao}</div>
</div>

<div style="margin-bottom: 15px; font-size: 13px;">
  <strong>Khách hàng:</strong> {ten_khach}<br/>
  <strong>SĐT:</strong> {sdt_khach}<br/>
  <strong>Địa chỉ:</strong> {dia_chi_khach}
</div>

<div style="margin-bottom: 15px; border: 1px solid #eee; border-radius: 4px; padding: 10px; font-size: 13px;">
  <div style="font-weight: bold; margin-bottom: 5px; color: #666; text-transform: uppercase; font-size: 11px;">Thông tin thiết bị</div>
  <strong>Loại máy:</strong> {loai_may}<br/>
  <strong>Tên máy:</strong> {ten_may}<br/>
  <strong>IMEI/Serial:</strong> <span style="font-family: monospace;">{imei}</span><br/>
  <strong>Tình trạng:</strong> {tinh_trang}<br/>
  <strong>Lỗi yêu cầu:</strong> {loi_yeu_cau}
</div>

<div style="margin-bottom: 15px;">
  {sanpham}
</div>

<div style="margin-bottom: 15px; border: 1px solid #eee; border-radius: 4px; padding: 10px; font-size: 13px;">
  <strong>Hẹn trả máy:</strong> <span style="font-weight: bold;">{hen_tra}</span>
</div>

<div style="background-color: #f9fafb; padding: 10px; border-radius: 4px; font-size: 11px; color: #666; line-height: 1.5;">
  • Cửa hàng chỉ giữ máy theo nội dung mô tả ở phiếu này.<br/>
  • Báo giá có thể thay đổi sau khi kiểm tra chi tiết.<br/>
  • Mọi phát sinh hư hỏng do khách hàng tự ý sửa chữa trước đó, cửa hàng không chịu trách nhiệm.
</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px; text-align: center;">
  <div>
    <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 50px;">Khách hàng</div>
    <div style="border-top: 1px solid #eee; padding-top: 4px; font-size: 10px; color: #999;">Ký, ghi rõ họ tên</div>
  </div>
  <div>
    <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px;">Nhân viên tiếp nhận</div>
    <div style="font-size: 13px; font-weight: 500; margin-bottom: 25px;">{ten_nhan_vien}</div>
    <div style="border-top: 1px solid #eee; padding-top: 4px; font-size: 10px; color: #999;">Ký xác nhận</div>
  </div>
</div>
`.trim();

const RETURN_LAYOUT = `
<div style="text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px;">
  <h1 style="font-size: 20px; font-weight: bold; margin: 0; text-transform: uppercase;">PHIẾU TRẢ MÁY</h1>
  <div style="font-family: monospace; font-size: 12px;">{ma_phieu}</div>
  <div style="font-size: 10px; color: #666; text-transform: uppercase;">Ngày trả: {ngay_tra}</div>
</div>

<div style="margin-bottom: 15px; font-size: 13px;">
  <strong>Khách hàng:</strong> {ten_khach}<br/>
  <strong>Thiết bị:</strong> {ten_may} ({loai_may})
</div>

<div style="margin-bottom: 15px; border: 1px solid #eee; border-radius: 4px; padding: 10px; font-size: 13px;">
  <div style="font-weight: bold; margin-bottom: 5px; color: #666; text-transform: uppercase; font-size: 11px;">Nội dung đã thực hiện</div>
  <div style="white-space: pre-wrap;">{giai_phap}</div>
</div>

<div style="margin-bottom: 15px;">
  {sanpham}
</div>

<div style="margin-bottom: 15px; border: 1px dashed #ccc; border-radius: 4px; padding: 10px; font-size: 13px; text-align: center;">
  <strong>Bảo hành:</strong> {bao_hanh} tháng (kể từ ngày {ngay_tra})
</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px; text-align: center;">
  <div>
    <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 50px;">Khách hàng nhận máy</div>
    <div style="border-top: 1px solid #eee; padding-top: 4px; font-size: 10px; color: #999;">Ký, ghi rõ họ tên</div>
  </div>
  <div>
    <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px;">Nhân viên trả máy</div>
    <div style="font-size: 13px; font-weight: 500; margin-bottom: 25px;">{ten_nhan_vien}</div>
    <div style="border-top: 1px solid #eee; padding-top: 4px; font-size: 10px; color: #999;">Ký xác nhận</div>
  </div>
</div>
`.trim();

async function main() {
  const templates = [
    {
      slug: "sale-receipt",
      name: "Hóa đơn bán hàng",
      content: SALE_LAYOUT,
    },
    {
      slug: "service-intake",
      name: "Phiếu nhận máy",
      content: INTAKE_LAYOUT,
    },
    {
      slug: "service-return",
      name: "Phiếu trả máy",
      content: RETURN_LAYOUT,
    },
  ];

  for (const t of templates) {
    await prisma.printTemplate.upsert({
      where: { slug: t.slug },
      update: t,
      create: t,
    });
  }

  console.log("Full Layout Templates seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
