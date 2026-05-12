import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const templates = [
    {
      slug: "sale-receipt",
      name: "Hóa đơn bán hàng",
      title: "HOÁ ĐƠN BÁN HÀNG",
      topContent: "Chào anh/chị {ten_khach}, cảm ơn bạn đã mua hàng tại {ten_cua_hang}!",
      bottomContent: "Cảm ơn quý khách! Hẹn gặp lại.\nGhi chú: {ghi_chu}",
      signatureBlocks: JSON.stringify([
        { label: "Khách hàng", sub: "Ký, ghi rõ họ tên" },
        { label: "Nhân viên", sub: "Ký xác nhận" },
      ]),
    },
    {
      slug: "service-intake",
      name: "Phiếu nhận máy",
      title: "PHIẾU NHẬN MÁY",
      topContent: "Tiếp nhận thiết bị của {ten_khach}. SĐT: {sdt_khach}",
      bottomContent: "• Cửa hàng chỉ giữ máy theo nội dung mô tả ở phiếu này.\n• Báo giá có thể thay đổi sau khi kiểm tra chi tiết.\n• Mọi phát sinh hư hỏng do người dùng tự ý mở máy trước đó, cửa hàng không chịu trách nhiệm.",
      signatureBlocks: JSON.stringify([
        { label: "Khách hàng", sub: "Ký, ghi rõ họ tên" },
        { label: "Nhân viên tiếp nhận", sub: "Ký xác nhận" },
      ]),
    },
    {
      slug: "service-return",
      name: "Phiếu trả máy",
      title: "PHIẾU TRẢ MÁY",
      topContent: "Trả máy cho {ten_khach}. Thiết bị: {ten_may}",
      bottomContent: "Cảm ơn quý khách đã tin tưởng dịch vụ của {ten_cua_hang}!\nBảo hành: {bao_hanh} tháng kể từ ngày {ngay_tra}.",
      signatureBlocks: JSON.stringify([
        { label: "Khách hàng nhận máy", sub: "Ký, ghi rõ họ tên" },
        { label: "Nhân viên trả máy", sub: "Ký xác nhận" },
      ]),
    },
  ];

  for (const t of templates) {
    await prisma.printTemplate.upsert({
      where: { slug: t.slug },
      update: t,
      create: t,
    });
  }

  console.log("Templates seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
