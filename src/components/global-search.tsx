"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Wrench,
  Receipt,
  User,
  Package,
  CornerDownLeft,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { globalSearch, type SearchHit } from "@/app/(app)/search/actions";

const KIND_META: Record<
  SearchHit["kind"],
  { label: string; icon: typeof Wrench }
> = {
  ticket: { label: "Phiếu sửa chữa", icon: Wrench },
  sale: { label: "Hoá đơn", icon: Receipt },
  customer: { label: "Khách hàng", icon: User },
  product: { label: "Sản phẩm", icon: Package },
};

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [active, setActive] = useState(0);
  const [pending, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // Cmd+K / Ctrl+K listener
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      if (q.trim().length < 2) {
        setHits([]);
        return;
      }
      start(async () => {
        const res = await globalSearch(q);
        if (res.ok) {
          setHits(res.hits);
          setActive(0);
        }
      });
    }, 200);
    return () => clearTimeout(t);
  }, [q, open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setQ("");
      setHits([]);
      setActive(0);
    }
  };

  const grouped = useMemo(() => {
    const map: Record<string, SearchHit[]> = {};
    for (const h of hits) {
      (map[h.kind] ||= []).push(h);
    }
    return map;
  }, [hits]);

  const flat = hits;

  const navigate = useCallback(
    (h: SearchHit) => {
      setOpen(false);
      router.push(h.link);
    },
    [router],
  );

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(flat.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const h = flat[active];
      if (h) navigate(h);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden md:inline-flex items-center gap-2 h-9 px-3 rounded-md border bg-background text-xs text-muted-foreground hover:bg-muted min-w-[200px]"
      >
        <Search className="size-3.5" />
        <span>Tìm kiếm...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-80">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden inline-flex items-center justify-center size-9 rounded-md hover:bg-muted"
        aria-label="Tìm kiếm"
      >
        <Search className="size-4" />
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="sm:max-w-xl p-0 overflow-hidden"
          showCloseButton={false}
        >
          <div className="flex items-center gap-2 border-b px-3 h-12">
            <Search className="size-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onInputKey}
              placeholder="Tìm phiếu, hoá đơn, khách hàng, sản phẩm..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {pending && (
              <span className="text-[10px] text-muted-foreground">Đang tìm...</span>
            )}
          </div>
          <div className="max-h-[60vh] overflow-auto">
            {q.trim().length < 2 && (
              <div className="px-4 py-10 text-center text-xs text-muted-foreground">
                Gõ ít nhất 2 ký tự để tìm trong phiếu sửa chữa, hoá đơn, khách
                hàng và sản phẩm.
                <div className="mt-3 text-[10px] flex items-center justify-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">
                      ↑↓
                    </kbd>
                    chọn
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">
                      Enter
                    </kbd>
                    mở
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">
                      Esc
                    </kbd>
                    đóng
                  </span>
                </div>
              </div>
            )}
            {q.trim().length >= 2 && hits.length === 0 && !pending && (
              <div className="px-4 py-10 text-center text-xs text-muted-foreground">
                Không tìm thấy kết quả cho &ldquo;{q}&rdquo;
              </div>
            )}
            {(["ticket", "sale", "customer", "product"] as const).map((kind) => {
              const list = grouped[kind];
              if (!list?.length) return null;
              const meta = KIND_META[kind];
              return (
                <div key={kind} className="py-1">
                  <div className="px-3 py-1 text-[10px] uppercase tracking-wide font-semibold text-muted-foreground bg-muted/40">
                    {meta.label} ({list.length})
                  </div>
                  {list.map((h) => {
                    const idx = flat.indexOf(h);
                    const isActive = idx === active;
                    return (
                      <button
                        key={`${h.kind}-${h.id}`}
                        type="button"
                        onMouseEnter={() => setActive(idx)}
                        onClick={() => navigate(h)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-left ${
                          isActive ? "bg-primary/10" : "hover:bg-muted/50"
                        }`}
                      >
                        <meta.icon className="size-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">
                            {h.title}
                          </div>
                          {h.subtitle && (
                            <div className="text-[11px] text-muted-foreground truncate">
                              {h.subtitle}
                            </div>
                          )}
                        </div>
                        {h.badge && (
                          <Badge variant="outline" className="text-[10px]">
                            {h.badge}
                          </Badge>
                        )}
                        {isActive && (
                          <CornerDownLeft className="size-3.5 text-muted-foreground" />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
