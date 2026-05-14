import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import { formatVND, formatDateTime } from "@/lib/format";
import {
  PrintReceiptShell,
} from "@/components/print-receipt-shell";
import { getSettings } from "@/lib/settings";
import { renderTemplate } from "@/lib/template-engine";
import { sanitizeTemplateHtml } from "@/lib/sanitize-html";

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Tiền mặt",
  transfer: "Chuyển khoản",
};

export default async function SaleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ size?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await getSession();
  if (!user) notFound();
  const settings = await getSettings();
  const size = sp.size || settings.printSize || "A4";

  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      customer: true,
      user: true,
      items: { include: { product: true } },
    },
  });
  if (!sale) notFound();

  const template = await prisma.printTemplate.findUnique({
    where: {
      slug: "sale-receipt",
    },
  });

  const templateData = {
    ten_cua_hang: settings.shopName,
    shop_tagline: settings.shopTagline,
    dia_chi_cua_hang: settings.shopAddress || "",
    sdt_cua_hang: settings.shopPhone || "",
    ma_phieu: sale.code,
    ngay_tao: formatDateTime(sale.createdAt),
    ten_khach: sale.customer?.name,
    sdt_khach: sale.customer?.phone,
    dia_chi_khach: sale.customer?.address,
    tam_tinh: sale.subtotal,
    chiet_khau: sale.discount,
    tong_cong: sale.total,
    da_thanh_toan: sale.paid,
    con_no: Math.max(0, sale.total - sale.paid),
    ten_nhan_vien: sale.user.name,
    ghi_chu: sale.note || "",
    bank_id: settings.bankId,
    bank_account: settings.bankAccount,
    payment_method: PAYMENT_LABELS[sale.paymentMethod || ""] || sale.paymentMethod || "",
    items: sale.items.map(item => ({
      ten: item.product.name,
      sl: item.quantity,
      gia: item.unitPrice,
      thanh_tien: item.subtotal,
      imei: item.imei || undefined
    }))
  };

  const itemsTableHtml = `
<div style="margin: 15px 0;">
  <table style="width: 100%; border-collapse: collapse; font-family: sans-serif;">
    <thead>
      <tr style="border-bottom: 2px solid #000; text-align: left; font-size: 11px; text-transform: uppercase;">
        <th style="padding: 8px 0; width: 60%; color: #000;">Sản phẩm</th>
        <th style="padding: 8px 0; width: 10%; text-align: center; color: #000;">SL</th>
        <th style="padding: 8px 0; width: 30%; text-align: right; color: #000;">Thành tiền</th>
      </tr>
    </thead>
    <tbody>
      ${sale.items.map(item => `
        <tr style="border-bottom: 1px dashed #ccc;">
          <td style="padding: 10px 0;">
            <div style="font-weight: bold; font-size: 13px; color: #000;">${item.product.name}</div>
            ${item.product.warranty > 0 ? `<div style="font-size: 10px; color: #666; margin-top: 2px;">BH: ${item.product.warranty}T</div>` : ''}
            ${item.imei ? `<div style="font-size: 10px; color: #888; margin-top: 1px; font-family: monospace;">IMEI: ${item.imei}</div>` : ''}
          </td>
          <td style="padding: 10px 0; text-align: center; font-size: 13px;">${item.quantity}</td>
          <td style="padding: 10px 0; text-align: right; font-weight: bold; font-size: 13px;">${formatVND(item.subtotal)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</div>
  `.trim();

  const renderedContent = sanitizeTemplateHtml(
    renderTemplate(template?.content, templateData, itemsTableHtml),
  );

  return (
    <PrintReceiptShell
      backHref="/sales"
      backLabel="Quay lại"
      printLabel="In hoá đơn"
      size={size}
      settings={settings}
    >
      <div className="receipt-padding p-8">
        <div 
          className="prose prose-sm max-w-none text-black"
          dangerouslySetInnerHTML={{ __html: renderedContent }} 
        />
      </div>
    </PrintReceiptShell>
  );
}
