"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function PrintButton({ label = "In" }: { label?: string }) {
  const params = useSearchParams();
  const auto = params.get("print") === "1";
  const fired = useRef(false);

  useEffect(() => {
    if (!auto || fired.current) return;
    fired.current = true;
    
    const t = setTimeout(() => {
      // Add event listener to close the window after printing/cancelling
      window.onafterprint = () => {
        // Delay slightly before closing to ensure system processes are done
        setTimeout(() => window.close(), 500);
      };
      
      window.print();
    }, 800); // Slightly longer delay to ensure full rendering in new tab
    
    return () => clearTimeout(t);
  }, [auto]);

  return (
    <Button variant="outline" onClick={() => window.print()}>
      <Printer className="size-4" />
      {label}
    </Button>
  );
}
