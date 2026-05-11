const DEFAULT_TEMPLATES = [
  {
    slug: "sale-receipt",
    name: "Hóa đơn bán hàng",
    content: `
<div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
  <h1 style="font-size: 22px; font-weight: bold; margin: 0;">{ten_cua_hang}</h1>
  <div style="font-size: 12px;">{dia_chi_cua_hang}</div>
  <div style="font-size: 12px;">SĐT: {sdt_cua_hang}</div>
</div>
<div style="text-align: center; margin-bottom: 15px;">
  <h2 style="font-size: 18px; font-weight: bold; margin: 0;">HOÁ ĐƠN BÁN HÀNG</h2>
  <div style="font-family: monospace; font-size: 13px;">Số: {ma_phieu}</div>
  <div style="font-size: 11px;">{ngay_gio_tao}</div>
</div>
<div style="margin-bottom: 15px; font-size: 13px;">
  <strong>Khách hàng:</strong> {ten_khach}<br/>
  <strong>SĐT:</strong> {sdt_khach}<br/>
  <strong>Địa chỉ:</strong> {dia_chi_khach}
</div>
<table border="1" style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 15px;">
  <thead>
    <tr style="background: #f2f2f2;">
      <th style="padding: 5px; text-align: center; width: 30px;">STT</th>
      <th style="padding: 5px; text-align: left;">Tên sản phẩm/Dịch vụ</th>
      <th style="padding: 5px; text-align: center; width: 40px;">SL</th>
      <th style="padding: 5px; text-align: right; width: 80px;">Đơn giá</th>
      <th style="padding: 5px; text-align: right; width: 90px;">Thành tiền</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 5px; text-align: center;">{stt}</td>
      <td style="padding: 5px;">{ten} <br/><small style="color: #666;">BH: {bh}</small></td>
      <td style="padding: 5px; text-align: center;">{sl}</td>
      <td style="padding: 5px; text-align: right;">{gia}</td>
      <td style="padding: 5px; text-align: right;">{thanh_tien}</td>
    </tr>
  </tbody>
</table>
<div style="float: right; width: 200px; font-size: 13px; line-height: 1.8;">
  <div style="display: flex; justify-content: space-between;">
    <span>Tạm tính:</span> <strong>{tam_tinh}</strong>
  </div>
  <div style="display: flex; justify-content: space-between;">
    <span>Chiết khấu:</span> <strong>{chiet_khau}</strong>
  </div>
  <div style="display: flex; justify-content: space-between; border-top: 1px solid #000; padding-top: 5px; margin-top: 5px;">
    <span>Tổng cộng:</span> <strong style="font-size: 16px;">{tong_cong}</strong>
  </div>
</div>
<div style="clear: both; margin-top: 30px; text-align: center; font-style: italic; font-size: 12px;">
  Cảm ơn Quý khách. Hẹn gặp lại!
</div>
{qr}
    `.trim()
  },
  {
    slug: "service-intake",
    name: "Phiếu nhận máy",
    content: `
<div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
  <h1 style="font-size: 22px; font-weight: bold; margin: 0;">{ten_cua_hang}</h1>
  <div style="font-size: 12px;">{dia_chi_cua_hang}</div>
  <div style="font-size: 12px;">SĐT: {sdt_cua_hang}</div>
</div>
<div style="text-align: center; margin-bottom: 15px;">
  <h2 style="font-size: 18px; font-weight: bold; margin: 0;">PHIẾU NHẬN MÁY SỬA CHỮA</h2>
  <div style="font-family: monospace; font-size: 13px;">Số phiếu: {ma_phieu}</div>
  <div style="font-size: 11px;">Ngày nhận: {ngay_gio_tao}</div>
</div>
<div style="margin-bottom: 15px; font-size: 13px;">
  <strong>Khách hàng:</strong> {ten_khach} - {sdt_khach}
</div>
<div style="border: 1px solid #000; padding: 10px; margin-bottom: 15px; font-size: 13px; line-height: 1.6;">
  <strong>Thông tin thiết bị:</strong><br/>
  - Loại máy: {loai_may} | Hãng: {hang}<br/>
  - Tên máy: {ten_may}<br/>
  - IMEI/Serial: {imei}<br/>
  - Tình trạng: {tinh_trang}<br/>
  - Yêu cầu: {loi_yeu_cau}
</div>
<div style="font-size: 13px; margin-bottom: 20px;">
  <strong>Ghi chú/Linh kiện kèm theo:</strong> {ghi_chu}<br/>
  <strong>Hẹn trả:</strong> <span style="font-size: 15px; font-weight: bold;">{hen_tra}</span>
</div>
<div style="display: flex; justify-content: space-between; margin-top: 40px; font-size: 13px;">
  <div style="text-align: center; width: 45%;">
    <strong>Khách hàng</strong><br/>
    <small>(Ký và ghi rõ họ tên)</small>
    <div style="height: 60px;"></div>
  </div>
  <div style="text-align: center; width: 45%;">
    <strong>Nhân viên tiếp nhận</strong><br/>
    <small>{ten_nhan_vien}</small>
    <div style="height: 60px;"></div>
  </div>
</div>
    `.trim()
  },
  {
    slug: "service-return",
    name: "Phiếu trả máy",
    content: `
<div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
  <h1 style="font-size: 22px; font-weight: bold; margin: 0;">{ten_cua_hang}</h1>
</div>
<div style="text-align: center; margin-bottom: 15px;">
  <h2 style="font-size: 18px; font-weight: bold; margin: 0;">PHIẾU TRẢ MÁY & BÀN GIAO</h2>
  <div style="font-family: monospace; font-size: 13px;">Số phiếu: {ma_phieu}</div>
  <div style="font-size: 11px;">Ngày trả: {ngay_tra}</div>
</div>
<div style="margin-bottom: 15px; font-size: 13px;">
  <strong>Khách hàng:</strong> {ten_khach} - {sdt_khach}
</div>
<div style="border: 1px solid #000; padding: 10px; margin-bottom: 15px; font-size: 13px;">
  <strong>Thiết bị:</strong> {ten_may} ({imei})<br/>
  <strong>Nội dung sửa chữa:</strong> {giai_phap}<br/>
  <strong>Thời gian bảo hành:</strong> {bao_hanh} tháng
</div>
<table border="1" style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 15px;">
  <thead>
    <tr style="background: #f2f2f2;">
      <th style="padding: 5px; text-align: left;">Nội dung/Linh kiện thay thế</th>
      <th style="padding: 5px; text-align: center; width: 40px;">SL</th>
      <th style="padding: 5px; text-align: right; width: 90px;">Thành tiền</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 5px;">{ten}</td>
      <td style="padding: 5px; text-align: center;">{sl}</td>
      <td style="padding: 5px; text-align: right;">{thanh_tien}</td>
    </tr>
  </tbody>
</table>
<div style="text-align: right; font-size: 14px; font-weight: bold;">
  Tổng cộng: {tong_cong}
</div>
<div style="margin-top: 20px; font-size: 12px; border: 1px dashed #666; padding: 10px;">
  <strong>Chính sách bảo hành:</strong><br/>
  - Bảo hành theo tem và số phiếu.<br/>
  - Không bảo hành trong trường hợp rơi vỡ, vào nước, mất tem.
</div>
    `.trim()
  },
  {
    slug: "warranty-receipt",
    name: "Tem/Phiếu bảo hành",
    content: `
<div style="text-align: center; border: 2px solid #000; padding: 15px; width: 300px; margin: 0 auto; font-family: Arial;">
  <h3 style="margin: 0 0 10px 0; text-transform: uppercase;">Phiếu Bảo Hành</h3>
  <div style="font-size: 14px; font-weight: bold; margin-bottom: 5px;">{ten_cua_hang}</div>
  <div style="font-size: 12px; margin-bottom: 10px;">Hotline: {sdt_cua_hang}</div>
  
  <div style="text-align: left; font-size: 12px; line-height: 1.6;">
    <strong>Mã phiếu:</strong> {ma_phieu}<br/>
    <strong>Sản phẩm:</strong> {ten_may}<br/>
    <strong>IMEI:</strong> {imei}<br/>
    <strong>Ngày mua:</strong> {ngay_tao}<br/>
    <strong>Thời hạn BH:</strong> {bao_hanh} tháng<br/>
    <strong>Ngày hết hạn:</strong> {hen_tra}
  </div>
  
  <div style="margin-top: 15px; font-size: 10px; font-style: italic;">
    Vui lòng giữ phiếu này để được hỗ trợ bảo hành.
  </div>
</div>
    `.trim()
  }
];

export async function restoreDefaultTemplates() {
  try {
    const prisma = await getTenantPrismaServer();
    const session = await requireSession();
    
    for (const t of DEFAULT_TEMPLATES) {
      await prisma.printTemplate.upsert({
        where: {
          tenantId_slug: {
            tenantId: session.tenantId,
            slug: t.slug
          }
        },
        create: {
          ...t,
          tenantId: session.tenantId
        },
        update: {
          name: t.name,
          content: t.content
        }
      });
    }
    
    revalidatePath("/settings/templates");
    return { ok: true };
  } catch (e: any) {
    console.error(e);
    return { ok: false, error: e.message };
  }
}

export async function updateTemplate(id: string, data: any) {
  try {
    const prisma = await getTenantPrismaServer();
    await prisma.printTemplate.update({
      where: { id },
      data: data as any,
    });
    revalidatePath("/settings/templates");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function getTemplates() {
  const prisma = await getTenantPrismaServer();
  return await prisma.printTemplate.findMany({
    orderBy: { slug: "asc" },
  });
}
