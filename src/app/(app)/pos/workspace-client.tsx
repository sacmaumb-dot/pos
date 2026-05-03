"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  X,
  ShoppingCart,
  Wrench,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PosClient } from "./pos-client";
import { ServiceForm } from "../service/service-form";
import { TicketTab } from "./ticket-tab";

type SaleTab = { id: string; type: "sale"; label: string };
type ServiceTab = { id: string; type: "service"; label: string };
type TicketTabT = {
  id: string;
  type: "ticket";
  label: string;
  ticketId: string;
};
type Tab = SaleTab | ServiceTab | TicketTabT;

type Product = {
  id: string;
  sku: string;
  name: string;
  brand: string | null;
  price: number;
  stock: number;
  categoryType: string;
  categoryId: string;
};
type Category = { id: string; name: string; type: string };
type Customer = { id: string; name: string; phone: string; code: string };
type Technician = { id: string; name: string };

let counter = 1;
function nextId() {
  counter += 1;
  return `tab-${Date.now()}-${counter}`;
}

export function WorkspaceClient({
  products,
  categories,
  customers,
  technicians,
}: {
  products: Product[];
  categories: Category[];
  customers: Customer[];
  technicians: Technician[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tabs, setTabs] = useState<Tab[]>([
    { id: "tab-default", type: "sale", label: "Đơn 1" },
  ]);
  const [activeId, setActiveId] = useState<string>("tab-default");
  const [openAdd, setOpenAdd] = useState(false);

  function addTab(type: "sale" | "service") {
    const sameType = tabs.filter((t) => t.type === type).length;
    const label =
      type === "sale" ? `Đơn ${sameType + 1}` : `Sửa ${sameType + 1}`;
    const id = nextId();
    setTabs((curr) => [...curr, { id, type, label } as Tab]);
    setActiveId(id);
    setOpenAdd(false);
  }

  function openTicketTab(ticketId: string, code: string) {
    const existing = tabs.find(
      (t) => t.type === "ticket" && t.ticketId === ticketId,
    );
    if (existing) {
      setActiveId(existing.id);
      return;
    }
    const id = nextId();
    setTabs((curr) => {
      // guard against duplicate from concurrent calls / strict-mode double-invoke
      if (curr.some((t) => t.type === "ticket" && t.ticketId === ticketId)) {
        return curr;
      }
      return [...curr, { id, type: "ticket", label: code, ticketId }];
    });
    setActiveId(id);
  }

  useEffect(() => {
    const ticketId = searchParams.get("ticket");
    const ticketCode = searchParams.get("code");
    if (ticketId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      openTicketTab(ticketId, ticketCode || "Phiếu");
      const url = new URL(window.location.href);
      url.searchParams.delete("ticket");
      url.searchParams.delete("code");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  function closeTab(id: string) {
    setTabs((curr) => {
      const idx = curr.findIndex((t) => t.id === id);
      if (idx === -1) return curr;
      const next = curr.filter((t) => t.id !== id);
      if (next.length === 0) {
        const fresh: Tab = { id: nextId(), type: "sale", label: "Đơn 1" };
        setActiveId(fresh.id);
        return [fresh];
      }
      if (id === activeId) {
        const newActive = curr[idx - 1] || curr[idx + 1];
        setActiveId(newActive.id);
      }
      return next;
    });
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1 border-b overflow-x-auto flex-wrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveId(tab.id)}
            className={cn(
              "group flex items-center gap-2 px-3 py-2 text-sm border-b-2 -mb-px shrink-0 transition-colors",
              activeId === tab.id
                ? "border-primary text-primary font-medium bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            {tab.type === "sale" ? (
              <ShoppingCart className="size-3.5" />
            ) : tab.type === "service" ? (
              <Wrench className="size-3.5" />
            ) : (
              <ClipboardList className="size-3.5" />
            )}
            <span>{tab.label}</span>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  closeTab(tab.id);
                }
              }}
              className="size-4 rounded grid place-items-center hover:bg-muted text-muted-foreground hover:text-destructive cursor-pointer"
              aria-label="Đóng tab"
            >
              <X className="size-3" />
            </span>
          </button>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="ml-1 h-8 gap-1"
          onClick={() => setOpenAdd(true)}
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">Tab mới</span>
        </Button>
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={cn(activeId === tab.id ? "block" : "hidden")}
        >
          {tab.type === "sale" ? (
            <PosClient
              products={products}
              categories={categories}
              customers={customers}
              showHeader={false}
              onCreated={() => closeTab(tab.id)}
            />
          ) : tab.type === "service" ? (
            <ServiceForm
              customers={customers}
              technicians={technicians}
              products={products.map((p) => ({
                id: p.id,
                sku: p.sku,
                name: p.name,
                price: p.price,
                categoryType: p.categoryType,
              }))}
              onCreated={() => closeTab(tab.id)}
            />
          ) : (
            <TicketTab
              ticketId={tab.ticketId}
              technicians={technicians}
              products={products}
              onClosed={() => closeTab(tab.id)}
            />
          )}
        </div>
      ))}

      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tab mới</DialogTitle>
            <DialogDescription>
              Chọn loại giao dịch cho tab mới.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => addTab("sale")}
              className="rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 p-5 flex flex-col items-center gap-2 text-center transition-colors"
            >
              <div className="size-12 rounded-full bg-primary/10 text-primary grid place-items-center">
                <ShoppingCart className="size-6" />
              </div>
              <div className="font-medium">Bán hàng</div>
              <div className="text-xs text-muted-foreground">
                Chọn sản phẩm, thanh toán, in hoá đơn.
              </div>
            </button>
            <button
              type="button"
              onClick={() => addTab("service")}
              className="rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 p-5 flex flex-col items-center gap-2 text-center transition-colors"
            >
              <div className="size-12 rounded-full bg-primary/10 text-primary grid place-items-center">
                <Wrench className="size-6" />
              </div>
              <div className="font-medium">Sửa chữa</div>
              <div className="text-xs text-muted-foreground">
                Nhận thiết bị, lập phiếu nhận và in cho khách.
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
