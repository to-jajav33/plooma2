import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "./button";

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  side?: "left" | "right" | "top" | "bottom";
  className?: string;
}

export function Drawer({
  open,
  onOpenChange,
  children,
  side = "right",
  className,
}: DrawerProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const sideClasses = {
    left: "left-0 top-0 h-full w-80",
    right: "right-0 top-0 h-full w-80",
    top: "top-0 left-0 w-full",
    bottom: "bottom-0 left-0 w-full",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 animate-in fade-in-0"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Drawer */}
      <div
        className={cn(
          "fixed z-50 bg-background border shadow-lg animate-in",
          side === "left" && "slide-in-from-left",
          side === "right" && "slide-in-from-right",
          side === "top" && "slide-in-from-top",
          side === "bottom" && "slide-in-from-bottom",
          sideClasses[side],
          className
        )}
      >
        {children}
      </div>
    </>
  );
}

interface DrawerContentProps {
  children: React.ReactNode;
  className?: string;
}

export function DrawerContent({ children, className }: DrawerContentProps) {
  return (
    <div className={cn("h-full flex flex-col", className)}>
      {children}
    </div>
  );
}

interface DrawerHeaderProps {
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export function DrawerHeader({
  children,
  onClose,
  className,
}: DrawerHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 border-b",
        className
      )}
    >
      <div className="flex-1">{children}</div>
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

interface DrawerBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function DrawerBody({ children, className }: DrawerBodyProps) {
  return (
    <div className={cn("flex-1 overflow-y-auto p-4", className)}>
      {children}
    </div>
  );
}

