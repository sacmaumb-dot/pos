import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

const SALE_LAYOUT = `
<table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px;">
  <tbody>
    <tr>
      <td style="vertical-align: top;">
        <h2 style="margin: 0px; font-size: 22px; font-weight: 800;">{ten_cua_hang}</h2>
      </td>
      <td style="text-align: right; vertical-align: top;">
        <h1 style="margin: 0px; font-size: 18px; font-weight: 800;">HOÁ ĐƠN BÁN HÀNG</h1>
        <div style="font-size: 14px; font-weight: 600;">{ma_phieu}</div>
        <div style="font-size: 11px; color: #888888;">{ngay_tao}</div>
      </td>
    </tr>
  </tbody>
</table>

<div style="font-size: 10px; font-weight: bold; color: #888888; text-transform: uppercase; margin-top: 20px; margin-bottom: 5px; border-bottom: 1px solid #f0f0f0;">Thông tin khách hàng</div>

<table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 10px;">
  <tbody>
    <tr>
      <td style="width: 50%; vertical-align: top;">
        <div style="font-size: 11px; color: #888888;">Khách hàng</div>
        <div style="font-size: 14px; font-weight: 500;">{ten_khach}</div>
      </td>
      <td style="width: 50%; text-align: right; vertical-align: top;">
        <div style="font-size: 11px; color: #888888;">Số điện thoại</div>
        <div style="font-size: 14px; font-weight: 500;">{sdt_khach}</div>
      </td>
    </tr>
  </tbody>
</table>

<div style="margin-bottom: 10px;">
  <div style="font-size: 11px; color: #888888;">Địa chỉ</div>
  <div style="font-size: 14px; font-weight: 500;">{dia_chi_khach}</div>
</div>

<div style="font-size: 10px; font-weight: bold; color: #888888; text-transform: uppercase; margin-top: 20px; margin-bottom: 5px; border-bottom: 1px solid #f0f0f0;">Chi tiết đơn hàng</div>

<table border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px;">
  <tbody>
    <tr style="border-top: 1px solid #000000; border-bottom: 1px solid #000000;">
      <td style="padding: 8px 0px; font-weight: bold; font-size: 11px; text-transform: uppercase;">Nội dung</td>
      <td style="padding: 8px 0px; font-weight: bold; font-size: 11px; text-transform: uppercase; text-align: right; width: 40px;">SL</td>
      <td style="padding: 8px 0px; font-weight: bold; font-size: 11px; text-transform: uppercase; text-align: right; width: 100px;">Thành tiền</td>
    </tr>
    <tr>
      <td style="padding: 10px 0px; font-size: 13px; border-bottom: 1px solid #f9f9f9;">
        <div style="font-weight: 500;">{ten}</div>
        <div style="font-size: 10px; color: #888888;">Bảo hành: {bh}</div>
      </td>
      <td style="padding: 10px 0px; font-size: 13px; text-align: right; border-bottom: 1px solid #f9f9f9;">{sl}</td>
      <td style="padding: 10px 0px; font-size: 13px; text-align: right; font-weight: 500; border-bottom: 1px solid #f9f9f9;">{thanh_tien}</td>
    </tr>
  </tbody>
</table>

<div style="margin-top: 20px; text-align: right;">
  <div style="margin-bottom: 5px;">
    <span style="font-size: 13px; color: #888888;">Tạm tính:&nbsp;</span>
    <span style="font-size: 14px; font-weight: 500;">{tam_tinh}</span>
  </div>
  <div style="margin-bottom: 5px;">
    <span style="font-size: 13px; color: #888888;">Chiết khấu:&nbsp;</span>
    <span style="font-size: 14px; font-weight: 500; color: #ef4444;">-{chiet_khau}</span>
  </div>
  <div style="margin-top: 10px;">
    <span style="font-size: 16px; font-weight: 800;">TỔNG CỘNG:&nbsp;</span>
    <span style="font-size: 22px; font-weight: 800; color: #2563eb;">{tong_cong}</span>
  </div>
</div>

<div style="font-size: 10px; font-weight: bold; color: #888888; text-transform: uppercase; margin-top: 20px; margin-bottom: 5px; border-bottom: 1px solid #f0f0f0;">Ghi chú</div>
<div style="font-size: 13px;">{ghi_chu}</div>

<table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-top: 50px; text-align: center;">
  <tbody>
    <tr>
      <td style="width: 50%;">
        <div style="font-size: 13px; font-weight: bold; margin-bottom: 60px;">KHÁCH HÀNG</div>
        <div style="font-size: 11px; color: #cccccc;">(Ký và ghi rõ họ tên)</div>
      </td>
      <td style="width: 50%;">
        <div style="font-size: 13px; font-weight: bold; margin-bottom: 10px;">NHÂN VIÊN BÁN HÀNG</div>
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 35px;">{ten_nhan_vien}</div>
        <div style="font-size: 11px; color: #cccccc;">(Ký xác nhận)</div>
      </td>
    </tr>
  </tbody>
</table>
`.trim();

const INTAKE_LAYOUT = `
<table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px;">
  <tbody>
    <tr>
      <td style="vertical-align: top;">
        <h2 style="margin: 0px; font-size: 22px; font-weight: 800;">{ten_cua_hang}</h2>
      </td>
      <td style="text-align: right; vertical-align: top;">
        <h1 style="margin: 0px; font-size: 18px; font-weight: 800;">PHIẾU TIẾP NHẬN</h1>
        <div style="font-size: 14px; font-weight: 600;">{ma_phieu}</div>
        <div style="font-size: 11px; color: #888888;">{ngay_tao}</div>
      </td>
    </tr>
  </tbody>
</table>

<div style="font-size: 10px; font-weight: bold; color: #888888; text-transform: uppercase; margin-top: 20px; margin-bottom: 5px; border-bottom: 1px solid #f0f0f0;">Khách hàng</div>

<table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 10px;">
  <tbody>
    <tr>
      <td style="width: 50%; vertical-align: top;">
        <div style="font-size: 11px; color: #888888;">Họ và tên</div>
        <div style="font-size: 14px; font-weight: 500;">{ten_khach}</div>
      </td>
      <td style="width: 50%; text-align: right; vertical-align: top;">
        <div style="font-size: 11px; color: #888888;">Điện thoại</div>
        <div style="font-size: 14px; font-weight: 500;">{sdt_khach}</div>
      </td>
    </tr>
  </tbody>
</table>

<div style="font-size: 10px; font-weight: bold; color: #888888; text-transform: uppercase; margin-top: 20px; margin-bottom: 5px; border-bottom: 1px solid #f0f0f0;">Thiết bị &amp; Tình trạng</div>

<table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 10px;">
  <tbody>
    <tr>
      <td style="width: 50%; vertical-align: top;">
        <div style="font-size: 11px; color: #888888;">Thiết bị</div>
        <div style="font-size: 14px; font-weight: 500;">{ten_may} ({loai_may})</div>
      </td>
      <td style="width: 50%; text-align: right; vertical-align: top;">
        <div style="font-size: 11px; color: #888888;">Hãng sản xuất</div>
        <div style="font-size: 14px; font-weight: 500;">{hang}</div>
      </td>
    </tr>
  </tbody>
</table>

<div style="margin-bottom: 10px;">
  <div style="font-size: 11px; color: #888888;">Số IMEI / Serial</div>
  <div style="font-size: 14px; font-weight: 500;">{imei}</div>
</div>

<div style="margin-bottom: 10px;">
  <div style="font-size: 11px; color: #888888;">Yêu cầu &amp; Tình trạng máy</div>
  <div style="font-size: 15px; font-weight: 500;">{tinh_trang}</div>
</div>

<div style="font-size: 10px; font-weight: bold; color: #888888; text-transform: uppercase; margin-top: 20px; margin-bottom: 5px; border-bottom: 1px solid #f0f0f0;">Dự toán phí sửa chữa</div>

<table border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px;">
  <tbody>
    <tr style="border-top: 1px solid #000000; border-bottom: 1px solid #000000;">
      <td style="padding: 8px 0px; font-weight: bold; font-size: 11px; text-transform: uppercase;">Nội dung</td>
      <td style="padding: 8px 0px; font-weight: bold; font-size: 11px; text-transform: uppercase; text-align: right; width: 40px;">SL</td>
      <td style="padding: 8px 0px; font-weight: bold; font-size: 11px; text-transform: uppercase; text-align: right; width: 100px;">Thành tiền</td>
    </tr>
    <tr>
      <td style="padding: 10px 0px; font-size: 13px; border-bottom: 1px solid #f9f9f9;">
        <div style="font-weight: 500;">{ten}</div>
      </td>
      <td style="padding: 10px 0px; font-size: 13px; text-align: right; border-bottom: 1px solid #f9f9f9;">{sl}</td>
      <td style="padding: 10px 0px; font-size: 13px; text-align: right; font-weight: 500; border-bottom: 1px solid #f9f9f9;">{thanh_tien}</td>
    </tr>
  </tbody>
</table>

<div style="margin-top: 20px; text-align: right;">
  <div style="margin-bottom: 5px;">
    <span style="font-size: 15px; font-weight: 800;">DỰ TOÁN TỔNG:&nbsp;</span>
    <span style="font-size: 20px; font-weight: 800; color: #2563eb;">{tong_cong}</span>
  </div>
  <div style="margin-bottom: 5px;">
    <span style="font-size: 13px; color: #888888;">Đã đặt cọc:&nbsp;</span>
    <span style="font-size: 14px; font-weight: 600; color: #059669;">{da_thanh_toan}</span>
  </div>
</div>

<div style="font-size: 10px; font-weight: bold; color: #888888; text-transform: uppercase; margin-top: 20px; margin-bottom: 5px; border-bottom: 1px solid #f0f0f0;">Cam kết cửa hàng</div>
<div style="font-size: 11px; color: #666666; line-height: 1.6;">
  • Cam kết linh kiện chính hãng hoặc theo thỏa thuận.<br>
  • Bảo mật tuyệt đối dữ liệu khách hàng.<br>
  • Quý khách vui lòng mang phiếu này khi đến nhận máy.
</div>

<table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-top: 50px; text-align: center;">
  <tbody>
    <tr>
      <td style="width: 50%;">
        <div style="font-size: 13px; font-weight: bold; margin-bottom: 60px;">XÁC NHẬN KHÁCH HÀNG</div>
        <div style="font-size: 11px; color: #cccccc;">(Ký tên)</div>
      </td>
      <td style="width: 50%;">
        <div style="font-size: 13px; font-weight: bold; margin-bottom: 10px;">NHÂN VIÊN TIẾP NHẬN</div>
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 35px;">{ten_nhan_vien}</div>
        <div style="font-size: 11px; color: #cccccc;">(Ký tên)</div>
      </td>
    </tr>
  </tbody>
</table>
`.trim();

const RETURN_LAYOUT = INTAKE_LAYOUT.replace("PHIẾU TIẾP NHẬN", "PHIẾU TRẢ MÁY").replace("Dự toán phí sửa chữa", "Chi tiết dịch vụ").replace("DỰ TOÁN TỔNG:", "TỔNG THANH TOÁN:");


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
  console.log("TechShop original layouts restored using robust tables");
}

main().catch(console.error).finally(() => prisma.$disconnect());
