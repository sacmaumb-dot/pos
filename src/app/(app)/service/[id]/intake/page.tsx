import { getTenantPrismaServer } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { formatVND, formatDateTime } from "@/lib/format";
import {
  PrintReceiptShell,
  ReceiptHeader,
  ReceiptSection,
} from "@/components/print-receipt-shell";
import { getSettings } from "@/lib/settings";
import { renderTemplate } from "@/lib/template-engine";
import { sanitizeTemplateHtml } from "@/lib/sanitize-html";

const DEVICE_LABELS: Record<string, string> = {
  phone: "Điện thoại",
  laptop: "Laptop",
  tablet: "Máy tính bảng",
  other: "Khác",
};

export default async function ServiceIntakePrintPage({
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
  const ticket = await (await getTenantPrismaServer()).serviceTicket.findUnique({
    where: { id },
    include: {
      customer: true,
      createdBy: true,
      items: true,
    },
  });
  if (!ticket) notFound();

  const template = await (await getTenantPrismaServer()).printTemplate.findUnique({
    where: {
      tenantId_slug: {
        tenantId: user.tenantId,
        slug: "service-intake",
      },
    },
  });

  const templateData = {
    ten_cua_hang: settings.shopName,
    dia_chi_cua_hang: settings.shopAddress || "",
    sdt_cua_hang: settings.shopPhone || "",
    ma_phieu: ticket.code,
    ngay_tao: formatDateTime(ticket.receivedAt),
    ten_khach: ticket.customer.name,
    sdt_khach: ticket.customer.phone,
    dia_chi_khach: ticket.customer.address,
    loai_may: DEVICE_LABELS[ticket.deviceType] || ticket.deviceType,
    ten_may: [ticket.deviceBrand, ticket.deviceModel].filter(Boolean).join(" "),
    imei: ticket.imei,
    tinh_trang: ticket.appearance,
    loi_yeu_cau: ticket.problem,
    hen_tra: ticket.promisedAt ? formatDateTime(ticket.promisedAt) : "",
    tam_tinh: ticket.estimatedCost,
    da_thanh_toan: ticket.deposit,
    ten_nhan_vien: ticket.createdBy.name,
    ghi_chu: ticket.note || "",
    bank_id: settings.bankId,
    bank_account: settings.bankAccount,
    payment_method: ticket.paymentMethod || "",
    items: ticket.items.map(it => ({
      ten: it.description,
      sl: it.quantity,
      gia: it.unitPrice,
      thanh_tien: it.subtotal,
    }))
  };

  const itemsTableHtml = `
<div style="margin: 15px 0;">
  <div style="display: flex; font-size: 11px; font-weight: bold; color: #888; text-transform: uppercase; padding-bottom: 5px; border-bottom: 1px solid #f0f0f0;">
    <div style="flex: 1;">Nội dung</div>
    <div style="width: 40px; text-align: right;">SL</div>
    <div style="width: 100px; text-align: right;">Thành tiền</div>
  </div>
  ${ticket.items.map(it => `
    <div style="display: flex; font-size: 13px; padding: 10px 0; border-bottom: 1px solid #f9f9f9;">
      <div style="flex: 1;">${it.description}</div>
      <div style="width: 40px; text-align: right;">${it.quantity}</div>
      <div style="width: 100px; text-align: right; font-weight: 500;">${formatVND(it.subtotal)}</div>
    </div>
  `).join('')}
</div>
  `.trim();

  const renderedContent = sanitizeTemplateHtml(
    renderTemplate(template?.content, templateData, itemsTableHtml),
  );

  return (
    <Suspense fallback={null}>
      <PrintReceiptShell
        backHref={`/service/${id}`}
        backLabel="Quay lại phiếu"
        printLabel="In phiếu nhận"
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
    </Suspense>
  );
}

function Field({
  label,
  value,
  mono,
  wide,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
  wide?: boolean;
}) {
  if (!value) return wide ? null : <div />;
  return (
    <div className={wide ? "col-span-2" : ""}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={mono ? "font-mono" : ""}>{value}</div>
    </div>
  );
}
