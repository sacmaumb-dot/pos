import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

const SALE_LAYOUT = `
<h1 class="ql-align-center">HOÁ ĐƠN BÁN HÀNG</h1>
<p class="ql-align-center"><strong>{ma_phieu}</strong></p>
<p class="ql-align-center">{ngay_tao}</p>
<p><br></p>
<p>Chào anh/chị <strong>{ten_khach}</strong>, cảm ơn bạn đã mua hàng tại <strong>{ten_cua_hang}</strong>!</p>
<p>SĐT: {sdt_khach}</p>
<p>Địa chỉ: {dia_chi_khach}</p>
<p><br></p>
<p>{sanpham}</p>
<p><br></p>
<p>Tạm tính: {tam_tinh}</p>
<p>Chiết khấu: -{chiet_khau}</p>
<p><strong>Tổng cộng: {tong_cong}</strong></p>
<p><br></p>
<p><em>Ghi chú: {ghi_chu}</em></p>
<p><br></p>
<p class="ql-align-center"><em>Cảm ơn quý khách! Hẹn gặp lại.</em></p>
<p><br></p>
<p><strong>Khách hàng (Ký tên) &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Nhân viên (Ký tên)</strong></p>
`.trim();

const INTAKE_LAYOUT = `
<h1 class="ql-align-center">PHIẾU NHẬN MÁY</h1>
<p class="ql-align-center"><strong>{ma_phieu}</strong></p>
<p class="ql-align-center">Tiếp nhận: {ngay_tao}</p>
<p><br></p>
<p><strong>Khách hàng:</strong> {ten_khach}</p>
<p><strong>SĐT:</strong> {sdt_khach}</p>
<p><br></p>
<p><strong>THÔNG TIN THIẾT BỊ:</strong></p>
<ul>
  <li>Loại máy: {loai_may}</li>
  <li>Tên máy: {ten_may}</li>
  <li>IMEI/Serial: {imei}</li>
  <li>Tình trạng: {tinh_trang}</li>
  <li>Lỗi yêu cầu: {loi_yeu_cau}</li>
</ul>
<p><br></p>
<p>{sanpham}</p>
<p><br></p>
<p><strong>Hẹn trả máy: {hen_tra}</strong></p>
<p><br></p>
<p><span style="color: rgb(153, 153, 153);">* Lưu ý: Quý khách vui lòng mang theo phiếu này khi nhận lại máy.</span></p>
<p><br></p>
<p><strong>Khách hàng &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Nhân viên tiếp nhận</strong></p>
`.trim();

const RETURN_LAYOUT = `
<h1 class="ql-align-center">PHIẾU TRẢ MÁY</h1>
<p class="ql-align-center"><strong>{ma_phieu}</strong></p>
<p class="ql-align-center">Ngày trả: {ngay_tra}</p>
<p><br></p>
<p><strong>Khách hàng:</strong> {ten_khach}</p>
<p><strong>Thiết bị:</strong> {ten_may} ({loai_may})</p>
<p><br></p>
<p><strong>NỘI DUNG ĐÃ THỰC HIỆN:</strong></p>
<p>{giai_phap}</p>
<p><br></p>
<p>{sanpham}</p>
<p><br></p>
<p><strong>BẢO HÀNH: {bao_hanh} THÁNG</strong></p>
<p><br></p>
<p class="ql-align-center"><em>Cảm ơn quý khách đã tin tưởng dịch vụ!</em></p>
<p><br></p>
<p><strong>Khách hàng nhận máy &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Nhân viên trả máy</strong></p>
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
      update: t,
      create: t,
    });
  }
  console.log("Visual templates seeded successfully");
}

main().catch(console.error).finally(() => prisma.$disconnect());
