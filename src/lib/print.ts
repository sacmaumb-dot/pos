export function printInBackground(url: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.setAttribute("aria-hidden", "true");

    let cleaned = false;
    function cleanup() {
      if (cleaned) return;
      cleaned = true;
      setTimeout(() => {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        resolve();
      }, 1000);
    }

    iframe.onload = () => {
      setTimeout(() => {
        try {
          const w = iframe.contentWindow;
          if (!w) {
            cleanup();
            return;
          }
          w.focus();
          w.print();
        } catch (e) {
          console.warn("printInBackground:", e);
        }
        cleanup();
      }, 500);
    };

    iframe.src = url;
    document.body.appendChild(iframe);

    setTimeout(cleanup, 10000);
  });
}
