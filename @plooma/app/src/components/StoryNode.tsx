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
}

export function StoryNode({
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
}: StoryNodeProps) {
  return (
    <div className={cn("group relative", className)}>
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
      <div className="flex gap-2 items-start">
        {/* Drag handle (for future drag-and-drop) */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity pt-12 cursor-move">
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
