// src/components/ui/toast.jsx
import * as React from "react";
import { createContext, useContext, useState } from "react";
import { X } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Toast context
const ToastContext = createContext({
  toast: () => {},
  success: () => {},
  error: () => {},
});

// Toast variants
const toastVariants = cva(
  "fixed flex items-center w-auto max-w-md shadow-lg rounded-md p-4 transition-all duration-300 z-50",
  {
    variants: {
      variant: {
        default: "bg-background border border-border text-foreground",
        success:
          "bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
        error:
          "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
      },
      position: {
        "top-right": "top-4 right-4",
        "top-center": "top-4 left-1/2 transform -translate-x-1/2",
        "bottom-right": "bottom-4 right-4",
        "bottom-center": "bottom-4 left-1/2 transform -translate-x-1/2",
      },
    },
    defaultVariants: {
      variant: "default",
      position: "bottom-right",
    },
  }
);

// Toast Provider Component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (
    message,
    variant = "default",
    position = "bottom-right",
    duration = 5000
  ) => {
    const id = Date.now().toString();
    const newToast = { id, message, variant, position, duration };

    setToasts((prev) => [...prev, newToast]);

    // Auto-remove toast after duration
    if (duration !== Infinity) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Helper methods for common toast types
  const success = (message, options = {}) => {
    return addToast(message, "success", options.position, options.duration);
  };

  const error = (message, options = {}) => {
    return addToast(message, "error", options.position, options.duration);
  };

  const toastValue = {
    toast: addToast,
    success,
    error,
    dismiss: removeToast,
  };

  return (
    <ToastContext.Provider value={toastValue}>
      {children}
      {/* Render all active toasts */}
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            toastVariants({ variant: toast.variant, position: toast.position }),
            "animate-in slide-in-from-right"
          )}
        >
          <div className="flex-1">{toast.message}</div>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 text-foreground/60 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
