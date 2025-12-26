import React from "react";
import { WYSIWYGEditor } from "./WYSIWYGEditor";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Plus, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoryNodeProps {
  id: string;
  name: string;
  content: string;
  onNameChange: (name: string) => void;
  onChange: (content: string) => void;
  onAddAbove: () => void;
  onAddBelow: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  className?: string;
  index: number;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  isDragging?: boolean;
  dragOverIndex?: number | null;
}

export const StoryNode = React.forwardRef<HTMLDivElement, StoryNodeProps>(
  function StoryNode(
    {
      id,
      name,
      content,
      onNameChange,
      onChange,
      onAddAbove,
      onAddBelow,
      isFirst = false,
      isLast = false,
      className,
      index,
      onDragStart,
      onDragOver,
      onDragLeave,
      onDrop,
      onDragEnd,
      isDragging = false,
      dragOverIndex = null,
    },
    ref
  ) {
    return (
      <div ref={ref} className={cn("group relative scroll-mt-20", className)}>
        {/* Add button above */}
        {!isFirst && (
          <div className="flex justify-center mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="outline"
              size="sm"
              onClick={onAddAbove}
              className="h-8"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add above
            </Button>
          </div>
        )}

        {/* Node container */}
        <div
          draggable
          onDragStart={(e) => {
            // Only allow dragging if not starting from an input or contentEditable
            const target = e.target as HTMLElement;
            if (
              target.tagName === "INPUT" ||
              target.tagName === "TEXTAREA" ||
              target.isContentEditable ||
              target.closest("[contenteditable]") ||
              target.closest("input") ||
              target.closest("textarea")
            ) {
              e.preventDefault();
              return;
            }
            onDragStart(e, index);
            e.dataTransfer.effectAllowed = "move";
          }}
          onDragOver={(e) => {
            e.preventDefault();
            onDragOver(e, index);
          }}
          onDragLeave={onDragLeave}
          onDrop={(e) => {
            e.preventDefault();
            onDrop(e, index);
          }}
          onDragEnd={onDragEnd}
          className={cn(
            "flex gap-2 items-start transition-all rounded-lg p-2 -m-2",
            "cursor-grab active:cursor-grabbing",
            isDragging && "opacity-50 scale-95",
            dragOverIndex === index &&
              "ring-2 ring-primary ring-offset-2 bg-primary/5"
          )}
        >
          {/* Drag handle */}
          <div
            className={cn(
              "opacity-0 group-hover:opacity-100 transition-opacity pt-12 cursor-grab active:cursor-grabbing pointer-events-none",
              isDragging && "opacity-100"
            )}
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Node content */}
          <div className="flex-1 space-y-2">
            {/* Node name input */}
            <Input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Node name (e.g., 'Ordinary World', 'Call to Adventure')"
              className="font-medium text-lg"
              draggable={false}
              onDragStart={(e) => e.stopPropagation()}
            />

            {/* WYSIWYG Editor */}
            <WYSIWYGEditor
              content={content}
              onChange={onChange}
              placeholder="Write your story node..."
            />
          </div>
        </div>

        {/* Add button below */}
        <div className="flex justify-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="outline"
            size="sm"
            onClick={onAddBelow}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add below
          </Button>
        </div>
      </div>
    );
  }
);
