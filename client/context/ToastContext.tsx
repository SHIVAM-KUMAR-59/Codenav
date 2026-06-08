"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

type ToastType = "success" | "error";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string, duration: number = 5000) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, type, message, duration }]);
      if (duration > 0) setTimeout(() => removeToast(id), duration);
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, duration?: number) => showToast("success", message, duration),
    [showToast]
  );

  const error = useCallback(
    (message: string, duration?: number) => showToast("error", message, duration),
    [showToast]
  );

  const getToastStyles = (type: ToastType) => {
    const styles: Record<
      ToastType,
      {
        container: string;
        icon: React.ReactNode;
        text: string;
        close: string;
      }
    > = {
      success: {
        container: [
          "border-l-4 border-[var(--success)]",
          "bg-[#f0fdf4] text-[#166534]", // light mode
          "dark:bg-[#0d2117] dark:text-[#86efac]", // dark mode
        ].join(" "),
        icon: <CheckCircle className="h-5 w-5 text-(--success)" />,
        text: "text-[#166534] dark:text-[#86efac]",
        close: "text-[#166534] dark:text-[#86efac] hover:opacity-70",
      },
      error: {
        container: [
          "border-l-4 border-[var(--error)]",
          "bg-[#fef2f2] text-[#991b1b]",
          "dark:bg-[#2a0d0d] dark:text-[#fca5a5]",
        ].join(" "),
        icon: <XCircle className="h-5 w-5 text-(--error)" />,
        text: "text-[#991b1b] dark:text-[#fca5a5]",
        close: "text-[#991b1b] dark:text-[#fca5a5] hover:opacity-70",
      },
    };
    return styles[type];
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error }}>
      {children}

      <div className="pointer-events-none fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => {
          const styles = getToastStyles(toast.type);
          return (
            <div
              key={toast.id}
              className={` ${styles.container} pointer-events-auto max-w-md min-w-75 rounded-lg p-4 shadow-lg shadow-black/10 dark:shadow-black/40`}
              style={{ animation: "slideIn 0.3s ease-out" }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">{styles.icon}</div>
                <p className={`flex-1 text-sm font-medium ${styles.text}`}>{toast.message}</p>
                <button
                  onClick={() => removeToast(toast.id)}
                  className={`shrink-0 transition-opacity ${styles.close}`}
                  aria-label="Close toast"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
