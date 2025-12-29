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
    // Format: <span data-node-id="id">{{nodeName|nodeContent}}</span>
    if (nodes.length > 0) {
      const combinedContent = nodes
        .map((node) => {
          const nodeName = node.name || "Untitled";
          const nodeContent = node.content || "";
          // Escape any }} in content to avoid breaking the pattern
          const escapedContent = nodeContent.replace(/\}\}/g, "&#125;&#125;");
          return `<span data-node-id="${node.id}">{{${nodeName}|${escapedContent}}}</span>`;
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

    // Find all spans with data-node-id that contain node patterns
    // Format: <span data-node-id="id">{{title|content}}</span>
    const spanPattern = /<span[^>]*data-node-id="([^"]+)"[^>]*>(.*?)<\/span>/g;
    const nodes: Array<{ id: string; name: string; content: string }> = [];
    let match;

    while ((match = spanPattern.exec(html)) !== null) {
      const nodeId = match[1];
      const spanContent = match[2];

      if (!nodeId || !spanContent) continue;

      // Extract node pattern from span content: {{title|content}}
      const nodePattern = /\{\{([^|{}]+)\|([^}]*)\}\}/;
      const nodeMatch = spanContent.match(nodePattern);

      if (nodeMatch && nodeMatch[1] && nodeMatch[2] !== undefined) {
        const nodeName = nodeMatch[1].trim() || "Untitled";
        let nodeContent = nodeMatch[2] || "";
        // Unescape any }} that were escaped
        nodeContent = nodeContent.replace(/&#125;&#125;/g, "}}").trim();

        nodes.push({
          id: nodeId,
          name: nodeName,
          content: nodeContent,
        });
      }
    }

    // Also find any node patterns not wrapped in spans (for backward compatibility or new nodes)
    const nodePattern = /\{\{([^|{}]+)\|([^}]*)\}\}/g;
    let nodeMatch;
    const existingIds = new Set(nodes.map((n) => n.id));

    while ((nodeMatch = nodePattern.exec(html)) !== null) {
      // Check if this node is already captured in a span
      const matchStart = nodeMatch.index;
      const matchEnd = matchStart + nodeMatch[0].length;

      // Check if this match is inside any of the spans we already found
      let isInsideSpan = false;
      for (const spanMatch of html.matchAll(
        /<span[^>]*data-node-id="([^"]+)"[^>]*>/g
      )) {
        const spanStart = spanMatch.index || 0;
        const spanEnd = html.indexOf("</span>", spanStart);
        if (spanStart <= matchStart && matchEnd <= spanEnd) {
          isInsideSpan = true;
          break;
        }
      }

      if (!isInsideSpan && nodeMatch[1] && nodeMatch[2] !== undefined) {
        // This is a node not wrapped in a span - create new ID
        const nodeName = nodeMatch[1].trim() || "Untitled";
        let nodeContent = nodeMatch[2] || "";
        nodeContent = nodeContent.replace(/&#125;&#125;/g, "}}").trim();

        nodes.push({
          id: storyStore.generateId(),
          name: nodeName,
          content: nodeContent,
        });
      }
    }

    // If we found nodes, update the store
    if (nodes.length > 0) {
      const existingNodes = storyStore.getNodes();
      const newNodes = nodes.map((node) => {
        // Try to match with existing node by ID first, then by name
        const existingNode =
          existingNodes.find((n) => n.id === node.id) ||
          existingNodes.find((n) => n.name === node.name);

        return {
          id: existingNode?.id || node.id || storyStore.generateId(),
          name: node.name,
          content: node.content,
        };
      });

      storyStore.setNodes(newNodes);
    }
  }, []);

  // Get cursor position and determine if it's in a title or content portion
  const getCursorPosition = (): {
    inTitle: boolean;
    inContent: boolean;
    nodeIndex: number | null;
  } => {
    if (!editorRef.current) {
      return { inTitle: false, inContent: false, nodeIndex: null };
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return { inTitle: false, inContent: false, nodeIndex: null };
    }

    const range = selection.getRangeAt(0);
    const text = range.startContainer.textContent || "";
    const html = range.startContainer.parentElement?.innerHTML || "";

    // Find all node patterns
    const nodePattern = /\{\{([^|{}]+)\|/g;
    const matches: Array<{
      name: string;
      start: number;
      pipeIndex: number;
      end: number;
    }> = [];
    let match;

    while ((match = nodePattern.exec(html)) !== null) {
      if (!match[1]) continue;
      const pipeIndex = match.index + match[0].length - 1;
      const contentStart = pipeIndex + 1;
      const contentEnd = html.indexOf("}}", contentStart);

      matches.push({
        name: match[1].trim(),
        start: match.index,
        pipeIndex,
        end: contentEnd > contentStart ? contentEnd + 2 : html.length,
      });
    }

    // Get cursor position in text
    const textBeforeCursor = text.substring(0, range.startOffset);

    // Find which node the cursor is in
    for (let i = 0; i < matches.length; i++) {
      const nodeMatch = matches[i];
      if (!nodeMatch) continue;

      // Find the corresponding position in text
      const textBeforeNode = text.substring(0, nodeMatch.start);
      const nodeText = text.substring(nodeMatch.start, nodeMatch.end);

      if (
        textBeforeCursor.length >= textBeforeNode.length &&
        textBeforeCursor.length < textBeforeNode.length + nodeText.length
      ) {
        // Cursor is in this node
        const positionInNode = textBeforeCursor.length - textBeforeNode.length;
        const titleText = `{{${nodeMatch.name}|`;
        const titleLength = titleText.length;

        if (positionInNode < titleLength) {
          // In title portion
          return { inTitle: true, inContent: false, nodeIndex: i };
        } else {
          // In content portion
          return { inTitle: false, inContent: true, nodeIndex: i };
        }
      }
    }

    return { inTitle: false, inContent: false, nodeIndex: null };
  };

  // Handle automatic node creation when typing between }} {{
  const handleBeforeInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const html = editorRef.current.innerHTML;
    const text = (
      range.startContainer.textContent ||
      editorRef.current.innerText ||
      ""
    ).trim();
    // startOffset is the number of characters before the cursor for the current span text. We need the cursor position in the entire text.
    // so lets loop through the text and count the characters until we reach the startContainer. Then add the startOffset to get the cursor position in the entire text.
    const cursorPos = range.startOffset;
    console.log("cursorPos", cursorPos);
    const beforeCursor = text
      .substring(Math.max(0, cursorPos - 3), cursorPos)
      .trim();
    const afterCursor = text
      .substring(cursorPos, Math.min(text.length, cursorPos + 3))
      .trim();

    // Check if cursor is between "}} " and "{{"
    if (text.length === 0 || cursorPos >= 3) {
      // If we're typing between "}} " and "{{", create new node
      if (
        text.length === 0 ||
        (beforeCursor.endsWith("}}") && afterCursor == "")
      ) {
        e.preventDefault();

        // Generate new node ID
        const newId = storyStore.generateId();
        const inputData = (e.nativeEvent as InputEvent).data || "";

        // Create the new span with node structure
        const newSpan = document.createElement("span");
        newSpan.setAttribute("data-node-id", newId);
        newSpan.textContent = `{{${inputData}|}}`;

        // Insert the span at cursor position, after the current sibling.
        const containerNode = range.commonAncestorContainer;
        const parentSpanElement =
          containerNode.nodeType === Node.ELEMENT_NODE
            ? (containerNode as Element).closest("span[data-node-id]")
            : containerNode.parentElement?.closest("span[data-node-id]") ||
              containerNode;
        (parentSpanElement as Element)?.after(newSpan);
        range.deleteContents();

        // Position cursor inside the span, after {{ and before |
        const textNode = newSpan.firstChild;
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
          const cursorOffset = 2 + inputData.length; // After "{{inputData"
          const newRange = document.createRange();
          newRange.setStart(textNode, cursorOffset);
          newRange.setEnd(textNode, cursorOffset);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }

        handleInput();
      }
    }
  };

  // Handle Enter key - prevent newlines in title, jump to content
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      const cursorPos = getCursorPosition();

      if (cursorPos.inTitle) {
        // Prevent newline and jump to content portion
        e.preventDefault();

        if (!editorRef.current || cursorPos.nodeIndex === null) return;

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const html = editorRef.current.innerHTML;

        // Find the span that contains the node
        const containerNode = range.commonAncestorContainer;
        const spanElement =
          containerNode.nodeType === Node.ELEMENT_NODE
            ? (containerNode as Element).closest("span[data-node-id]")
            : containerNode.parentElement?.closest("span[data-node-id]") ||
              null;

        if (spanElement) {
          const spanContent = spanElement.textContent || "";
          const nodePattern = /\{\{([^|{}]+)\|/;
          const nodeMatch = spanContent.match(nodePattern);

          if (nodeMatch) {
            // Find the position of | in the span
            const pipeIndex = spanContent.indexOf("|");
            if (pipeIndex > -1) {
              // Set cursor to after the pipe (content portion)
              const textNode = spanElement.firstChild;
              if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                const newRange = document.createRange();
                newRange.setStart(textNode, pipeIndex + 1);
                newRange.setEnd(textNode, pipeIndex + 1);
                selection.removeAllRanges();
                selection.addRange(newRange);
              }
            }
          }
        }
      }
      // If in content, allow normal Enter behavior (default)
    }
  };

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
                onBeforeInput={handleBeforeInput}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={cn(
                  "inline-block w-full min-h-[600px] p-4 outline-none prose prose-sm max-w-none",
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
