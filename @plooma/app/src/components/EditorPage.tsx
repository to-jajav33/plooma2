import React, { useState, useEffect } from "react";
import { StoryEditor } from "./StoryEditor";
import { StoryEditorSingleWysiwyg } from "./StoryEditorSingleWysiwyg";
import { Button } from "./ui/button";
import { LayoutGrid, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type EditorMode = "modular" | "single";

const STORAGE_KEY = "@@plooma@@editor-mode";

export function EditorPage() {
  const [mode, setMode] = useState<EditorMode>(() => {
    // Load mode from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "modular" || saved === "single") {
        return saved;
      }
    }
    return "modular";
  });

  // Save mode to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, mode);
    }
  }, [mode]);

  return (
    <div className="container mx-auto p-8">
      {/* Toggle buttons */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-lg border bg-background p-1 shadow-sm">
          <Button
            variant={mode === "modular" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMode("modular")}
            className={cn("gap-2", mode === "modular" && "shadow-sm")}
          >
            <LayoutGrid className="h-4 w-4" />
            Modular View
          </Button>
          <Button
            variant={mode === "single" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMode("single")}
            className={cn("gap-2", mode === "single" && "shadow-sm")}
          >
            <FileText className="h-4 w-4" />
            Single Editor
          </Button>
        </div>
      </div>

      {/* Render appropriate editor */}
      {mode === "modular" ? <StoryEditor /> : <StoryEditorSingleWysiwyg />}
    </div>
  );
}
