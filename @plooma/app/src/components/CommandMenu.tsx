import React, { useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Bold, Italic, Underline, List, ListOrdered, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onCommand: (command: string, value?: string) => void;
  position: { top: number; left: number };
  editorRef: React.RefObject<HTMLDivElement | null>;
}

export function CommandMenu({
  isOpen,
  onClose,
  onCommand,
  position,
  editorRef,
}: CommandMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        editorRef.current &&
        !editorRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, editorRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className={cn(
        "absolute z-50 bg-background border rounded-lg shadow-lg p-2",
        "flex items-center gap-1"
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => {
          onCommand("bold");
          onClose();
        }}
        className="h-7 w-7"
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => {
          onCommand("italic");
          onClose();
        }}
        className="h-7 w-7"
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => {
          onCommand("underline");
          onClose();
        }}
        className="h-7 w-7"
        title="Underline"
      >
        <Underline className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-border mx-1" />
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => {
          onCommand("insertUnorderedList");
          onClose();
        }}
        className="h-7 w-7"
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => {
          onCommand("insertOrderedList");
          onClose();
        }}
        className="h-7 w-7"
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-border mx-1" />
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onClose}
        className="h-7 w-7"
        title="Close"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

