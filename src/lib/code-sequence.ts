/**
 * Atomically allocate the next sale/ticket/customer code.
 * Uses `UPDATE … SET lastSaleNumber = lastSaleNumber + 1 RETURNING …`
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrismaCodeClient = any;

type CounterField = "lastSaleNumber" | "lastTicketNumber" | "lastCustomerNumber";

async function rollForwardPastMax(
  client: PrismaCodeClient,
  field: CounterField,
  existing: { code: string }[],
): Promise<number> {
  const max = existing.reduce((m, r) => {
    const n = parseInt(r.code.replace(/\D/g, "")) || 0;
    return n > m ? n : m;
  }, 0);
  if (max < 1) return 1;
  const updated = await client.appSetting.update({
    where: { id: "default" },
    data: { [field]: max + 1 },
    select: { [field]: true },
  });
  return (updated as unknown as Record<CounterField, number>)[field];
}

export async function nextSaleCode(
  client: PrismaCodeClient,
): Promise<string> {
  // Ensure the default settings record exists
  await client.appSetting.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" }
  });

  const t = await client.appSetting.update({
    where: { id: "default" },
    data: { lastSaleNumber: { increment: 1 } },
    select: { lastSaleNumber: true },
  });
  let n = t.lastSaleNumber;
  if (n === 1) {
    const existing = await client.sale.findMany({
      select: { code: true },
    });
    n = await rollForwardPastMax(client, "lastSaleNumber", existing);
  }
  return `HD${String(n).padStart(5, "0")}`;
}

export async function nextTicketCode(
  client: PrismaCodeClient,
): Promise<string> {
  await client.appSetting.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" }
  });

  const t = await client.appSetting.update({
    where: { id: "default" },
    data: { lastTicketNumber: { increment: 1 } },
    select: { lastTicketNumber: true },
  });
  let n = t.lastTicketNumber;
  if (n === 1) {
    const existing = await client.serviceTicket.findMany({
      select: { code: true },
    });
    n = await rollForwardPastMax(client, "lastTicketNumber", existing);
  }
  return `SC${String(n).padStart(5, "0")}`;
}

export async function nextCustomerCode(
  client: PrismaCodeClient,
): Promise<string> {
  await client.appSetting.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" }
  });

  const t = await client.appSetting.update({
    where: { id: "default" },
    data: { lastCustomerNumber: { increment: 1 } },
    select: { lastCustomerNumber: true },
  });
  let n = t.lastCustomerNumber;
  if (n === 1) {
    const existing = await client.customer.findMany({
      select: { code: true },
    });
    n = await rollForwardPastMax(client, "lastCustomerNumber", existing);
  }
  return `KH${String(n).padStart(5, "0")}`;
}
