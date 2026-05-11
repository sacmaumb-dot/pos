import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

const SALE_LAYOUT = `
<table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px;">
  <tbody>
    <tr>
      <td style="width: 40%; vertical-align: top;">
        <h1 style="margin: 0px; font-size: 32px; font-weight: bold; line-height: 1;">it<span style="color: white; background: black; padding: 0 5px;">FIX</span></h1>
        <p style="margin: 0px; font-size: 8px; font-weight: bold; letter-spacing: 1px;">TAKE CARE OF YOUR DEVICES</p>
      </td>
      <td style="width: 60%; text-align: center; vertical-align: top; font-size: 12px; line-height: 1.5;">
        <strong>{ten_cua_hang}</strong><br>
        {dia_chi_cua_hang}<br>
        SĐT/ZALO CỬA HÀNG: {sdt_cua_hang}<br>
        Website: https://itfix.vn
      </td>
    </tr>
  </tbody>
</table>

<div style="text-align: center; margin-bottom: 20px;">
  <strong style="font-size: 16px;">HÓA ĐƠN BÁN HÀNG</strong><br>
  <span style="font-size: 12px;">{ma_phieu}</span><br>
  <span style="font-size: 12px;">{ngay_tao}</span>
</div>

<table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 10px; font-size: 13px;">
  <tbody>
    <tr>
      <td>Khách hàng: {ten_khach}</td>
      <td style="text-align: right;">Số điện thoại: {sdt_khach}</td>
    </tr>
  </tbody>
</table>

<table border="1" cellpadding="5" cellspacing="0" style="width: 100%; margin-bottom: 0px; font-size: 12px; text-align: center;">
  <tbody>
    <tr style="font-weight: bold;">
      <td style="width: 40px;">STT</td>
      <td>Tên Hàng</td>
      <td style="width: 60px;">ĐVT</td>
      <td style="width: 40px;">SL</td>
      <td style="width: 80px;">Đơn giá</td>
      <td style="width: 80px;">Chiết khấu</td>
      <td style="width: 90px;">Thành tiền</td>
    </tr>
    <tr>
      <td>{stt}</td>
      <td style="text-align: left;">{ten}<br><span style="color: #666; font-size: 11px;">Bảo hành {bh}</span></td>
      <td>cái</td>
      <td>{sl}</td>
      <td>{gia}</td>
      <td>0</td>
      <td>{thanh_tien}</td>
    </tr>
    <tr style="font-weight: bold;">
      <td colspan="3">CỘNG</td>
      <td>{sl}</td>
      <td></td>
      <td></td>
      <td>{tongtien}</td>
    </tr>
  </tbody>
</table>

<div style="font-size: 12px; margin-top: 5px;">Viết bằng chữ: <span style="font-style: italic;">...</span></div>

<div style="text-align: center; margin-top: 40px; font-size: 13px;">
  <p style="margin: 0; font-weight: bold;">QUÝ KHÁCH KHÔNG HÀI LÒNG VỀ THÁI ĐỘ NHÂN VIÊN XIN PHẢN ÁNH QUA ZALO {sdt_cua_hang}</p>
  <p style="margin: 5px 0 0; font-weight: bold;">NHẬN BÁO GIÁ ONLINE LIÊN HỆ ZALO {sdt_cua_hang}</p>
</div>
`.trim();

async function main() {
  const templates = [
    { slug: "sale-receipt", name: "Hóa đơn bán hàng", content: SALE_LAYOUT },
    { slug: "service-intake", name: "Phiếu nhận máy", content: SALE_LAYOUT.replace("HÓA ĐƠN BÁN HÀNG", "PHIẾU TIẾP NHẬN") },
    { slug: "service-return", name: "Phiếu trả máy", content: SALE_LAYOUT.replace("HÓA ĐƠN BÁN HÀNG", "PHIẾU TRẢ MÁY") },
  ];

  for (const t of templates) {
    await prisma.printTemplate.upsert({
      where: { slug: t.slug },
      update: { content: t.content },
      create: t,
    });
  }
  console.log("KiotViet identical templates seeded successfully");
}

main().catch(console.error).finally(() => prisma.$disconnect());
