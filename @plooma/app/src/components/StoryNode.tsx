import React from "react";
import { WYSIWYGEditor } from "./WYSIWYGEditor";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Plus, GripVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoryNodeProps {
  id: string;
  name: string;
  content: string;
  onNameChange: (name: string) => void;
  onChange: (content: string) => void;
  onAddAbove: () => void;
  onAddBelow: () => void;
  onDelete?: () => void;
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
      onDelete,
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
          onDragOver={(e) => {
            e.preventDefault();
            onDragOver(e, index);
          }}
          onDragLeave={onDragLeave}
          onDrop={(e) => {
            e.preventDefault();
            onDrop(e, index);
          }}
          className={cn(
            "flex gap-2 items-start transition-all rounded-lg p-2 -m-2",
            isDragging && "opacity-50 scale-95",
            dragOverIndex === index &&
              "ring-2 ring-primary ring-offset-2 bg-primary/5"
          )}
        >
          {/* Drag handle - only this is draggable */}
          <div
            draggable
            onDragStart={(e) => {
              onDragStart(e, index);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragEnd={onDragEnd}
            className={cn(
              "opacity-0 group-hover:opacity-100 transition-opacity pt-12 cursor-grab active:cursor-grabbing",
              isDragging && "opacity-100"
            )}
            title="Drag to reorder"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Node content */}
          <div className="flex-1 space-y-2">
            {/* Node name input with delete button */}
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Node name (e.g., 'Ordinary World', 'Call to Adventure')"
                className="font-medium text-lg flex-1"
                draggable={false}
                onDragStart={(e) => e.stopPropagation()}
              />
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete node"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

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
