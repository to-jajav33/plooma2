import React from "react";
import { StoryEditor } from "./StoryEditor";
import { StoryEditorSingleWysiwyg } from "./StoryEditorSingleWysiwyg";
import { Button } from "./ui/button";
import { LayoutGrid, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppStore, type EditorMode } from "../stores/AppStore";
import { useStore } from "@plooma/store";

// Create a singleton instance of the store
const appStore = AppStore.proxy<typeof AppStore>();

export function EditorPage() {
  const appState = useStore(appStore);
  const mode = appState.editorMode;

  return (
    <div className="container mx-auto p-8">
      {/* Toggle buttons */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-lg border bg-background p-1 shadow-sm">
          <Button
            variant={mode === "modular" ? "default" : "ghost"}
            size="sm"
            onClick={() => appStore.setEditorMode("modular")}
            className={cn("gap-2", mode === "modular" && "shadow-sm")}
          >
            <LayoutGrid className="h-4 w-4" />
            Modular View
          </Button>
          <Button
            variant={mode === "single" ? "default" : "ghost"}
            size="sm"
            onClick={() => appStore.setEditorMode("single")}
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
