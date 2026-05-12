/**
 * Atomically allocate the next sale/ticket/customer code for a tenant.
 *
 * Uses `UPDATE … SET lastSaleNumber = lastSaleNumber + 1 RETURNING …`
 * (Prisma's `{ increment: 1 }`) on the Tenant row. The row-level update is
 * atomic, so two concurrent callers always receive distinct numbers — this
 * replaces the previous "find max + 1" pattern which had a TOCTOU race that
 * would silently produce duplicate HD/SC/KH codes under concurrent POS
 * checkout or service intake.
 *
 * Backfill: the counter defaults to 0. On the first call against a tenant
 * that already has data from before this PR, the increment lands at 1,
 * which is below the max existing code. We detect that, recompute the
 * actual max, and bump the counter past it in a single atomic write. This
 * is a one-time correction per tenant.
 *
 * The `client` parameter accepts either the global `prisma` client or a
 * transaction client (`tx` from `$transaction`). Pass the transaction
 * client when the code must be allocated inside the same transaction as
 * the row insert, so a rollback of the insert does not leak a number
 * (though leaking — i.e. gaps in the sequence — is otherwise harmless).
 *
 * The structural type below covers both shapes — the unextended
 * `PrismaClient` and the Client-Extension transaction client expose the
 * same `tenant`, `sale`, `serviceTicket`, `customer` delegates with the
 * methods we use.
 */
// We accept either the global PrismaClient or a `$transaction` callback's
// `tx` parameter — including the Client-Extension wrapped variant. Both
// have the same delegate shapes for the calls we make, but their concrete
// generic types are wide and incompatible at the structural level, so the
// caller-facing parameter is intentionally typed as `unknown`-ish and we
// only call methods the runtime knows about.
//
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrismaCodeClient = any;

type CounterField = "lastSaleNumber" | "lastTicketNumber" | "lastCustomerNumber";

async function rollForwardPastMax(
  client: PrismaCodeClient,
  tenantId: string,
  field: CounterField,
  existing: { code: string }[],
): Promise<number> {
  const max = existing.reduce((m, r) => {
    const n = parseInt(r.code.replace(/\D/g, "")) || 0;
    return n > m ? n : m;
  }, 0);
  if (max < 1) return 1;
  const updated = await client.tenant.update({
    where: { id: tenantId },
    data: { [field]: max + 1 },
    select: { [field]: true },
  });
  return (updated as unknown as Record<CounterField, number>)[field];
}

export async function nextSaleCode(
  client: PrismaCodeClient,
  tenantId: string,
): Promise<string> {
  const t = await client.tenant.update({
    where: { id: tenantId },
    data: { lastSaleNumber: { increment: 1 } },
    select: { lastSaleNumber: true },
  });
  let n = t.lastSaleNumber;
  if (n === 1) {
    const existing = await client.sale.findMany({
      where: { tenantId },
      select: { code: true },
    });
    n = await rollForwardPastMax(client, tenantId, "lastSaleNumber", existing);
  }
  return `HD${String(n).padStart(5, "0")}`;
}

export async function nextTicketCode(
  client: PrismaCodeClient,
  tenantId: string,
): Promise<string> {
  const t = await client.tenant.update({
    where: { id: tenantId },
    data: { lastTicketNumber: { increment: 1 } },
    select: { lastTicketNumber: true },
  });
  let n = t.lastTicketNumber;
  if (n === 1) {
    const existing = await client.serviceTicket.findMany({
      where: { tenantId },
      select: { code: true },
    });
    n = await rollForwardPastMax(client, tenantId, "lastTicketNumber", existing);
  }
  return `SC${String(n).padStart(5, "0")}`;
}

export async function nextCustomerCode(
  client: PrismaCodeClient,
  tenantId: string,
): Promise<string> {
  const t = await client.tenant.update({
    where: { id: tenantId },
    data: { lastCustomerNumber: { increment: 1 } },
    select: { lastCustomerNumber: true },
  });
  let n = t.lastCustomerNumber;
  if (n === 1) {
    const existing = await client.customer.findMany({
      where: { tenantId },
      select: { code: true },
    });
    n = await rollForwardPastMax(client, tenantId, "lastCustomerNumber", existing);
  }
  return `KH${String(n).padStart(5, "0")}`;
}
