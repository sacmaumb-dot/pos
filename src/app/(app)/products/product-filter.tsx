"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Search } from "lucide-react";

export function ProductFilter({
  categories,
}: {
  categories: { id: string; name: string; type: string }[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const cat = params.get("cat") || "all";

  useEffect(() => {
    const t = setTimeout(() => {
      const sp = new URLSearchParams(params);
      if (q) sp.set("q", q);
      else sp.delete("q");
      router.replace(`/products?${sp.toString()}`);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function setCat(value: string) {
    const sp = new URLSearchParams(params);
    if (value && value !== "all") sp.set("cat", value);
    else sp.delete("cat");
    router.replace(`/products?${sp.toString()}`);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 mt-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Tìm theo tên, SKU, hãng..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>
      <SelectField
        value={cat}
        onValueChange={setCat}
        className="sm:w-56"
        options={[
          { value: "all", label: "Tất cả loại hình" },
          ...categories.map((c) => ({ value: c.type, label: c.name })),
        ]}
      />
    </div>
  );
}
