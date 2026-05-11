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
  categoryIcon: string;
  categoryId: string;
};
type Category = { id: string; name: string; type: string; icon: string };
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
  const [isMounted, setIsMounted] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [dirtyTabs, setDirtyTabs] = useState<Record<string, boolean>>({});

  // Load tabs from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    const savedTabs = localStorage.getItem("pos_tabs");
    const savedActiveId = localStorage.getItem("pos_active_id");
    if (savedTabs) {
      try {
        const parsed = JSON.parse(savedTabs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTabs(parsed);
        }
      } catch (e) {
        console.error("Failed to restore tabs", e);
      }
    }
    if (savedActiveId) {
      setActiveId(savedActiveId);
    }
  }, []);

  // Save tabs to localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("pos_tabs", JSON.stringify(tabs));
      localStorage.setItem("pos_active_id", activeId);
    }
  }, [tabs, activeId, isMounted]);

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
      if (curr.some((t) => t.type === "ticket" && t.ticketId === ticketId)) {
        return curr;
      }
      return [...curr, { id, type: "ticket", label: code, ticketId }];
    });
    setActiveId(id);
  }

  useEffect(() => {
    if (!isMounted) return;
    const ticketId = searchParams.get("ticket");
    const ticketCode = searchParams.get("code");
    if (ticketId) {
      openTicketTab(ticketId, ticketCode || "Phiếu");
      const url = new URL(window.location.href);
      url.searchParams.delete("ticket");
      url.searchParams.delete("code");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams, isMounted]);

  function closeTab(id: string) {
    if (dirtyTabs[id]) {
      const confirmClose = window.confirm(
        "Bạn có các thay đổi chưa được lưu trên phiếu này. Bạn có chắc chắn muốn đóng tab này không?"
      );
      if (!confirmClose) return;
    }
    setDirtyTabs((curr) => {
      const next = { ...curr };
      delete next[id];
      return next;
    });

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
    <div className="space-y-4">
      <div className="bg-card/65 backdrop-blur-sm border border-border/80 rounded-2xl p-1.5 shadow-sm flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => (
          <div key={tab.id} className="relative flex-shrink-0 group">
            <button
              type="button"
              onClick={() => setActiveId(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-bold transition-all duration-200 pr-10",
                activeId === tab.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
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
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 size-6 rounded-lg flex items-center justify-center transition-all",
                activeId === tab.id
                  ? "bg-white/20 text-white hover:bg-white/30"
                  : "bg-transparent text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
              )}
              aria-label="Đóng tab"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
        <div className="h-6 w-px bg-border/60 mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 px-4 rounded-xl gap-2 font-bold hover:bg-primary/10 hover:text-primary transition-all shrink-0"
          onClick={() => setOpenAdd(true)}
        >
          <Plus className="size-4" />
          <span>Tab mới</span>
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
              isActive={activeId === tab.id}
              setDirty={(dirty) => {
                setDirtyTabs((curr) => {
                  if (curr[tab.id] === dirty) return curr;
                  return { ...curr, [tab.id]: dirty };
                });
              }}
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
