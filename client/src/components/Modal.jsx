import { X } from "lucide-react";
import { useEffect } from "react";

function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/80 p-4 backdrop-blur-md" onMouseDown={onClose}>
      <div className="w-full max-w-lg animate-fade-in rounded-md border border-border bg-bg-card shadow-card" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-heading text-lg font-semibold">{title}</h2>
          <button className="rounded-md p-2 text-text-muted hover:bg-bg-secondary hover:text-cyan focus:outline-none focus:ring-2 focus:ring-cyan" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
