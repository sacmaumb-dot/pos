import { getTenantPrismaServer } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import { formatVND, formatDateTime } from "@/lib/format";
import {
  PrintReceiptShell,
  ReceiptHeader,
  ReceiptSection,
} from "@/components/print-receipt-shell";
import { getSettings } from "@/lib/settings";
import { renderTemplate } from "@/lib/template-engine";

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Tiền mặt",
  card: "Thẻ ngân hàng",
  transfer: "Chuyển khoản",
  wallet: "Ví điện tử",
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

  const sale = await (await getTenantPrismaServer()).sale.findUnique({
    where: { id },
    include: {
      customer: true,
      user: true,
      items: { include: { product: true } },
    },
  });
  if (!sale) notFound();

  const template = await (await getTenantPrismaServer()).printTemplate.findUnique({
    where: {
      tenantId_slug: {
        tenantId: user.tenantId,
        slug: "sale-receipt",
      },
    },
  });

  const templateData = {
    ten_cua_hang: settings.shopName,
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
    payment_method: sale.paymentMethod,
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
  <div style="display: flex; font-size: 11px; font-weight: bold; color: #888; text-transform: uppercase; padding-bottom: 5px; border-bottom: 1px solid #f0f0f0;">
    <div style="flex: 1;">Nội dung</div>
    <div style="width: 40px; text-align: right;">SL</div>
    <div style="width: 100px; text-align: right;">Thành tiền</div>
  </div>
  ${sale.items.map(item => `
    <div style="display: flex; font-size: 13px; padding: 10px 0; border-bottom: 1px solid #f9f9f9;">
      <div style="flex: 1;">
        <div style="font-weight: 500;">${item.product.name}</div>
        ${item.imei ? `<div style="font-size: 10px; color: #888;">IMEI: ${item.imei}</div>` : ''}
      </div>
      <div style="width: 40px; text-align: right;">${item.quantity}</div>
      <div style="width: 100px; text-align: right; font-weight: 500;">${formatVND(item.subtotal)}</div>
    </div>
  `).join('')}
</div>
  `.trim();

  const renderedContent = renderTemplate(template?.content, templateData, itemsTableHtml);

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

function Row({
  label,
  value,
  color,
  bold,
}: {
  label: string;
  value: string;
  color?: string;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className={bold ? "font-semibold" : "text-muted-foreground"}>
        {label}
      </span>
      <span className={`${bold ? "font-bold" : ""} ${color || ""}`}>
        {value}
      </span>
    </div>
  );
}
