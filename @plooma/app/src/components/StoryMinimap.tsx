import React, { useState } from "react";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import type { StoryNodeData } from "@plooma/store";
import { cn } from "@/lib/utils";

interface StoryMinimapProps {
  nodes: StoryNodeData[];
  onNodeClick: (nodeId: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onDelete?: (nodeId: string) => void;
  activeNodeId?: string;
}

export function StoryMinimap({
  nodes,
  onNodeClick,
  onReorder,
  onDelete,
  activeNodeId,
}: StoryMinimapProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", "");
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onReorder(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-1">
      {nodes.map((node, index) => {
        const isActive = node.id === activeNodeId;
        const isDragging = draggedIndex === index;
        const isDragOver = dragOverIndex === index;
        const displayName = node.name || `Node ${index + 1}`;

        return (
          <div
            key={node.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={cn(
              "flex items-center gap-2 p-2 rounded-md transition-all group",
              "hover:bg-accent hover:text-accent-foreground",
              "border border-transparent",
              isActive && "bg-primary/10 border-primary text-primary font-medium",
              isDragging && "opacity-50",
              isDragOver && "border-primary border-dashed bg-primary/5"
            )}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span
              className="flex-1 text-sm truncate cursor-pointer"
              onClick={() => onNodeClick(node.id)}
            >
              {displayName}
            </span>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(node.id);
                }}
                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                title="Delete node"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}

