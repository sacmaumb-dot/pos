"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { deleteCategory } from "./actions";
import { CategoryDialog } from "./category-dialog";

type Category = {
  id: string;
  name: string;
  type: string;
  skuPrefix: string;
  icon: string;
};

export function CategoryActions({ category }: { category: Category }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, startDelete] = useTransition();

  function handleDelete() {
    if (!window.confirm(`Bạn có chắc chắn muốn xoá danh mục "${category.name}"?`)) return;
    startDelete(async () => {
      const res = await deleteCategory(category.id);
      if (res.ok) {
        toast.success("Đã xoá danh mục");
        router.refresh();
      } else {
        toast.error(res.error || "Lỗi");
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
          {deleting ? <Loader2 className="size-4 animate-spin" /> : <MoreHorizontal className="size-4" />}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="size-3.5 mr-2" />
            Sửa
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
            <Trash2 className="size-3.5 mr-2" />
            Xoá
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CategoryDialog
        category={category}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
