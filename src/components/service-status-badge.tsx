import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_MAP: Record<
  string,
  { label: string; className: string }
> = {
  received: {
    label: "Tiếp nhận",
    className: "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200",
  },
  diagnosing: {
    label: "Chẩn đoán",
    className:
      "bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200",
  },
  waiting_parts: {
    label: "Chờ linh kiện",
    className:
      "bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200",
  },
  repairing: {
    label: "Đang sửa",
    className:
      "bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200",
  },
  completed: {
    label: "Hoàn tất",
    className:
      "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200",
  },
  delivered: {
    label: "Đã trả máy",
    className: "bg-zinc-100 text-zinc-700 hover:bg-zinc-100 border-zinc-200",
  },
  cancelled: {
    label: "Đã huỷ",
    className: "bg-red-100 text-red-700 hover:bg-red-100 border-red-200",
  },
};

export function ServiceStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const s = STATUS_MAP[status] || { label: status, className: "" };
  return (
    <Badge variant="outline" className={cn("border", s.className, className)}>
      {s.label}
    </Badge>
  );
}

export const SERVICE_STATUSES = Object.entries(STATUS_MAP).map(
  ([value, { label }]) => ({ value, label }),
);
