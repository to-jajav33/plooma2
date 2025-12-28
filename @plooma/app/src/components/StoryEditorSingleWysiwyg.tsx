import React, { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Printer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { StoryStore } from "../stores/StoryStore";
import { AD_CONFIG } from "../config/ads";
import { AuthStore } from "../stores/AuthStore";
import { useStore } from "@plooma/store";
import { cn } from "@/lib/utils";
import { AdPlacement } from "./AdPlacement";

// Create a singleton instance of the store
const storyStore = StoryStore.proxy<typeof StoryStore>();

export function StoryEditorSingleWysiwyg() {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const authStore = AuthStore.proxy<typeof AuthStore>();
  const authState = useStore(authStore);
  const showAds =
    AD_CONFIG.enabled && (AD_CONFIG.guestsOnly ? authState.isGuest() : true);

  // Load initial content from store
  useEffect(() => {
    const nodes = storyStore.getNodes();
    const storeTitle = storyStore.getTitle();

    setTitle(storeTitle || "");

    // Combine all nodes into a single content string
    // Format: {{nodeName|nodeContent}}
    if (nodes.length > 0) {
      const combinedContent = nodes
        .map((node) => {
          const nodeName = node.name || "Untitled";
          const nodeContent = node.content || "";
          // Escape any }} in content to avoid breaking the pattern
          const escapedContent = nodeContent.replace(/\}\}/g, "&#125;&#125;");
          return `{{${nodeName}|${escapedContent}}}`;
        })
        .join("\n\n");
      setContent(combinedContent);

      // Set the HTML content in the editor
      if (editorRef.current) {
        editorRef.current.innerHTML = combinedContent;
      }
    } else {
      setContent("");
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
    }
  }, []);

  // Save title changes
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    storyStore.setTitle(newTitle);
    if (typeof document !== "undefined") {
      document.title = newTitle ? `${newTitle} - Story Editor` : "Story Editor";
    }
  };

  // Parse content and create/update nodes
  const parseAndSaveNodes = useCallback((html: string) => {
    if (!editorRef.current) return;

    // Match pattern: {{title|content}} in HTML
    // We use a more robust pattern that handles HTML content
    const nodePattern = /\{\{([^|{}]+)\|/g;
    const nodes: Array<{ name: string; content: string }> = [];
    let match;
    const matches: Array<{ name: string; start: number; pipeIndex: number }> =
      [];

    // Find all opening patterns
    while ((match = nodePattern.exec(html)) !== null) {
      matches.push({
        name: match?.[1]?.trim() || "",
        start: match.index,
        pipeIndex: match.index + match[0].length - 1, // Position of |
      });
    }

    // Extract content for each match
    matches.forEach((matchInfo, index) => {
      const contentStart = matchInfo.pipeIndex + 1;
      // Find the closing }} - look for the first }} after the content start
      // that's not part of an HTML entity
      let contentEnd = html.indexOf("}}", contentStart);

      // If we found a closing tag, extract the content
      if (contentEnd > contentStart) {
        let nodeContent = html.substring(contentStart, contentEnd);
        // Unescape any }} that were escaped
        nodeContent = nodeContent.replace(/&#125;&#125;/g, "}}");

        nodes.push({
          name: matchInfo.name || "Untitled",
          content: nodeContent.trim(),
        });
      } else if (index === matches.length - 1) {
        // Last match might not have closing }}, take everything after |
        let nodeContent = html.substring(contentStart);
        nodeContent = nodeContent.replace(/&#125;&#125;/g, "}}");
        nodes.push({
          name: matchInfo.name || "Untitled",
          content: nodeContent.trim(),
        });
      }
    });

    // If we found nodes, update the store
    if (nodes.length > 0) {
      const existingNodes = storyStore.getNodes();
      const newNodes = nodes.map((node, index) => {
        // Try to match with existing node by name or index
        const existingNode =
          existingNodes.find((n) => n.name === node.name) ||
          existingNodes[index];

        return {
          id: existingNode?.id || storyStore.generateId(),
          name: node.name,
          content: node.content,
        };
      });

      storyStore.setNodes(newNodes);
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setContent(html);

      // Parse and save nodes (debounced to avoid excessive saves)
      const timeoutId = setTimeout(() => {
        parseAndSaveNodes(html);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const ToolbarButton = ({
    onClick,
    children,
    isActive = false,
  }: {
    onClick: () => void;
    children: React.ReactNode;
    isActive?: boolean;
  }) => (
    <Button
      type="button"
      variant={isActive ? "default" : "outline"}
      size="icon-sm"
      onClick={onClick}
      className="h-8 w-8"
    >
      {children}
    </Button>
  );

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print your story.");
      return;
    }

    const escapeHtml = (text: string): string => {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    };

    const nodes = storyStore.getNodes();
    let printContent = "";

    if (title) {
      printContent += `<h1 class="story-title">${escapeHtml(title)}</h1>`;
    }

    nodes.forEach((node) => {
      if (node.content && node.content.trim()) {
        printContent += `${node.content}`;
      }
    });

    if (!printContent) {
      printContent = '<p class="empty-message">No story content to print.</p>';
    } else {
      printContent = `<div class="node-content">${printContent}</div>`;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title || "Story"} - Print</title>
          <meta charset="utf-8">
          <style>
            @media print {
              body { margin: 0; padding: 0; }
              @page { margin: 1in; size: letter; }
              .page-break { page-break-after: always; }
              .story-title, .node-name { page-break-after: avoid; }
              .node-content p { orphans: 3; widows: 3; }
            }
            body {
              font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6;
              max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #000; background: #fff;
            }
            .story-title { text-align: center; font-size: 2.5em; margin-bottom: 2em; font-weight: bold; page-break-after: avoid; }
            .node-content { margin-bottom: 2em; }
            .node-content p { margin-bottom: 1em; text-align: justify; line-height: 1.6; }
            .node-content ul, .node-content ol { margin-bottom: 1em; padding-left: 2em; }
            .node-content li { margin-bottom: 0.5em; }
            .empty-message { text-align: center; color: #666; font-style: italic; margin-top: 3em; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };

  // Update document title
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = title ? `${title} - Story Editor` : "Story Editor";
    }
  }, [title]);

  return (
    <div className="flex gap-6 items-start">
      {/* Main content */}
      <div className="flex-1">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <div className="mb-4">
              <CardTitle>Modular Story Editor</CardTitle>
            </div>
            {/* Story Title Input */}
            <div className="space-y-2">
              <label
                htmlFor="story-title"
                className="text-sm font-medium text-muted-foreground"
              >
                Story Title
              </label>
              <Input
                id="story-title"
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter your story title..."
                className="text-2xl font-bold h-12"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center gap-1 p-2 border-b bg-muted/50">
                <ToolbarButton onClick={() => execCommand("bold")}>
                  <Bold className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => execCommand("italic")}>
                  <Italic className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => execCommand("underline")}>
                  <Underline className="h-4 w-4" />
                </ToolbarButton>
                <div className="w-px h-6 bg-border mx-1" />
                <ToolbarButton
                  onClick={() => execCommand("insertUnorderedList")}
                >
                  <List className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => execCommand("insertOrderedList")}>
                  <ListOrdered className="h-4 w-4" />
                </ToolbarButton>
                <div className="flex-1" />
                <div className="text-xs text-muted-foreground px-2">
                  Tip: Use{" "}
                  <code className="bg-muted px-1 rounded">
                    {"{{title|content}}"}
                  </code>{" "}
                  to create nodes
                </div>
              </div>

              {/* Editor */}
              <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={cn(
                  "min-h-[600px] p-4 outline-none prose prose-sm max-w-none",
                  "focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  "[&_p]:mb-2 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6",
                  !content && !isFocused && "text-muted-foreground"
                )}
                data-placeholder="Write your story... Use {{Node Name|Node Content}} to create nodes"
                suppressContentEditableWarning
              />
              <style>{`
                [contenteditable][data-placeholder]:empty:before {
                  content: attr(data-placeholder);
                  color: hsl(var(--muted-foreground));
                  pointer-events: none;
                }
              `}</style>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar ad */}
      {showAds && (
        <aside className="hidden lg:block w-48 flex-shrink-0">
          <AdPlacement position="sidebar" zoneId={AD_CONFIG.sidebarZoneId} />
        </aside>
      )}

      {/* Floating Action Button */}
      <div
        className={cn(
          "fixed bottom-6 z-50 flex flex-col gap-3 transition-all",
          showAds ? "left-3 lg:left-[calc(1rem+1.5rem)]" : "left-3"
        )}
      >
        <Button
          variant="default"
          size="icon-lg"
          onClick={handlePrint}
          title="Print story"
          className="rounded-full shadow-lg hover:shadow-xl transition-shadow h-14 w-14"
        >
          <Printer className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
