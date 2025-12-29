import React from "react";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingToolbarProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  isVisible: boolean;
  onMenuClick: () => void;
}

export function FloatingToolbar({
  editorRef,
  isVisible,
  onMenuClick,
}: FloatingToolbarProps) {
  const [position, setPosition] = React.useState({ top: 0, left: 0 });

  React.useEffect(() => {
    if (!isVisible || !editorRef.current) return;

    const updatePosition = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const editorRect = editorRef.current!.getBoundingClientRect();

      // Position below the cursor
      const top = rect.bottom - editorRect.top + 8; // 8px gap
      const left = rect.left - editorRect.left;

      setPosition({ top, left });
    };

    updatePosition();

    // Update position on scroll
    const handleScroll = () => updatePosition();
    const editor = editorRef.current;
    editor?.addEventListener("scroll", handleScroll);
    window.addEventListener("scroll", handleScroll);

    return () => {
      editor?.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isVisible, editorRef]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "absolute z-50 flex items-center gap-1 bg-background border rounded-lg shadow-lg p-1",
        "transition-opacity duration-200"
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translateY(0)",
      }}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onMenuClick}
        className="h-7 w-7"
        title="Open formatting menu"
      >
        <Menu className="h-4 w-4" />
      </Button>
    </div>
  );
}

