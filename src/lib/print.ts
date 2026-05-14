import { toast } from "sonner";

export function printInBackground(url: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }

    const printUrl = new URL(url, window.location.origin);
    printUrl.searchParams.set("print", "1");

    // Create a hidden iframe
    const iframe = document.createElement("iframe");
    
    // Hide it off-screen but keep it "visible" to the browser
    iframe.style.position = "fixed";
    iframe.style.left = "-9999px";
    iframe.style.top = "0";
    iframe.style.width = "800px"; // Give it enough size for rendering
    iframe.style.height = "600px";
    iframe.style.border = "none";
    
    iframe.src = printUrl.toString();
    document.body.appendChild(iframe);

    // Clean up after some time (long enough for the print dialog to show)
    iframe.onload = () => {
      setTimeout(() => {
        // We don't remove it immediately because some browsers stop printing if iframe is gone
        // Instead, we just resolve the promise
        resolve();
        
        // Remove it after 2 minutes to be safe
        setTimeout(() => {
          if (iframe.parentNode) document.body.removeChild(iframe);
        }, 120000);
      }, 500);
    };
  });
}
