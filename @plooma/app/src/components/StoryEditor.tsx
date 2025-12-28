import React, { useState, useRef, useCallback, useEffect } from "react";
import { StoryNode } from "./StoryNode";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Plus, Map as MapIcon, Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Drawer, DrawerContent, DrawerHeader, DrawerBody } from "./ui/drawer";
import { StoryMinimap } from "./StoryMinimap";
import { StoryStore, type StoryNodeData } from "../stores/StoryStore";

// Create a singleton instance of the store
const storyStore = StoryStore.proxy<typeof StoryStore>();

interface StoryEditorProps {
  initialNodes?: StoryNodeData[];
  onNodesChange?: (nodes: StoryNodeData[]) => void;
}

export function StoryEditor({
  initialNodes = [],
  onNodesChange,
}: StoryEditorProps) {
  // Initialize from store or initialNodes
  const [nodes, setNodes] = useState<StoryNodeData[]>(() => {
    if (initialNodes.length > 0) {
      storyStore.setNodes(initialNodes);
      return initialNodes;
    }
    const storedNodes = storyStore.getNodes();
    if (storedNodes.length > 0) {
      return storedNodes;
    }
    storyStore.initializeIfEmpty();
    return storyStore.getNodes();
  });

  // Initialize title from store
  const [title, setTitle] = useState<string>(() => {
    return storyStore.getTitle();
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState<string | undefined>();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const setNodeRef = useCallback(
    (nodeId: string, element: HTMLDivElement | null) => {
      if (element) {
        nodeRefs.current.set(nodeId, element);
      } else {
        nodeRefs.current.delete(nodeId);
      }
    },
    []
  );

  const handleNodesChange = (newNodes: StoryNodeData[]) => {
    setNodes(newNodes);
    storyStore.setNodes(newNodes);
    onNodesChange?.(newNodes);
  };

  const handleNodeContentChange = (id: string, content: string) => {
    storyStore.updateNodeContent(id, content);
    const updatedNodes = storyStore.getNodes();
    setNodes(updatedNodes);
    onNodesChange?.(updatedNodes);
  };

  const handleNodeNameChange = (id: string, name: string) => {
    storyStore.updateNodeName(id, name);
    const updatedNodes = storyStore.getNodes();
    setNodes(updatedNodes);
    onNodesChange?.(updatedNodes);
  };

  const handleAddAbove = (index: number) => {
    const newNode: StoryNodeData = {
      id: storyStore.generateId(),
      name: "",
      content: "",
    };
    storyStore.addNodeAt(index, newNode);
    const updatedNodes = storyStore.getNodes();
    setNodes(updatedNodes);
    onNodesChange?.(updatedNodes);
  };

  const handleAddBelow = (index: number) => {
    const newNode: StoryNodeData = {
      id: storyStore.generateId(),
      name: "",
      content: "",
    };
    storyStore.addNodeAt(index + 1, newNode);
    const updatedNodes = storyStore.getNodes();
    setNodes(updatedNodes);
    onNodesChange?.(updatedNodes);
  };

  const handleAddFirst = () => {
    const newNode: StoryNodeData = {
      id: storyStore.generateId(),
      name: "",
      content: "",
    };
    storyStore.addNodeAt(0, newNode);
    const updatedNodes = storyStore.getNodes();
    setNodes(updatedNodes);
    onNodesChange?.(updatedNodes);
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    storyStore.reorderNodes(fromIndex, toIndex);
    const updatedNodes = storyStore.getNodes();
    setNodes(updatedNodes);
    onNodesChange?.(updatedNodes);
  };

  const handleNodeClick = (nodeId: string) => {
    const nodeElement = nodeRefs.current.get(nodeId);
    if (nodeElement) {
      setActiveNodeId(nodeId);
      nodeElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      // Close drawer after a short delay
      setTimeout(() => {
        setIsDrawerOpen(false);
      }, 300);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "");
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
      handleReorder(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDeleteNode = (id: string) => {
    // Prevent deleting if it's the last node
    if (nodes.length <= 1) {
      if (
        confirm(
          "This is the last node. Delete it anyway? (You can add a new one later)"
        )
      ) {
        storyStore.removeNode(id);
        const updatedNodes = storyStore.getNodes();
        setNodes(updatedNodes);
        onNodesChange?.(updatedNodes);
      }
      return;
    }

    if (confirm("Are you sure you want to delete this node?")) {
      storyStore.removeNode(id);
      const updatedNodes = storyStore.getNodes();
      setNodes(updatedNodes);
      onNodesChange?.(updatedNodes);
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    storyStore.setTitle(newTitle);
    // Update page title
    document.title = newTitle
      ? `${newTitle} - Modular Story Editor`
      : "Modular Story Editor";
  };

  // Update page title on mount and when title changes
  useEffect(() => {
    document.title = title
      ? `${title} - Modular Story Editor`
      : "Modular Story Editor";
  }, [title]);

  const handlePrint = () => {
    // Create a print-friendly HTML document
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print your story.");
      return;
    }

    // Helper function to escape HTML
    const escapeHtml = (text: string): string => {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    };

    // Build the print content
    let printContent = "";

    // Add title if it exists
    if (title) {
      printContent += `<h1 class="story-title">${escapeHtml(title)}</h1>`;
    }

    // Add each node's content (without node name)
    nodes.forEach((node) => {
      if (node.content && node.content.trim()) {
        // Clean and format the HTML content
        const cleanedContent = node.content;
        printContent += `${cleanedContent}`;
      }
    });
    // If no content, show a message
    if (!printContent) {
      printContent = '<p class="empty-message">No story content to print.</p>';
    } else {
      printContent = `<div class="node-content">${printContent}</div>`;
    }

    // Write the print document
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title || "Story"} - Print</title>
          <meta charset="utf-8">
          <style>
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              @page {
                margin: 1in;
                size: letter;
              }
              .node-content {
                page-break-inside: avoid;
              }
              .node-content p {
                orphans: 3;
                widows: 3;
              }
            }
            body {
              font-family: 'Times New Roman', serif;
              font-size: 12pt;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              padding: 40px 20px;
              color: #000;
              background: #fff;
            }
            .story-title {
              text-align: center;
              font-size: 2.5em;
              margin-bottom: 2em;
              font-weight: bold;
              page-break-after: avoid;
            }
            .node-content {
              margin-bottom: 2em;
            }
            .node-content p {
              margin-bottom: 1em;
              text-align: justify;
              line-height: 1.6;
            }
            .node-content ul,
            .node-content ol {
              margin-bottom: 1em;
              padding-left: 2em;
            }
            .node-content li {
              margin-bottom: 0.5em;
            }
            .empty-message {
              text-align: center;
              color: #666;
              font-style: italic;
              margin-top: 3em;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);

    printWindow.document.close();

    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Modular Story Editor</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                title="Print story"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDrawerOpen(true)}
              >
                <MapIcon className="h-4 w-4 mr-2" />
                Minimap
              </Button>
            </div>
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
        <CardContent className="space-y-6">
          {nodes.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No story nodes yet. Add your first node to get started!
              </p>
              <Button onClick={handleAddFirst}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Node
              </Button>
            </div>
          )}

          {nodes.map((node, index) => (
            <StoryNode
              key={node.id}
              ref={(el) => setNodeRef(node.id, el)}
              id={node.id}
              name={node.name}
              content={node.content}
              onNameChange={(name) => handleNodeNameChange(node.id, name)}
              onChange={(content) => handleNodeContentChange(node.id, content)}
              onAddAbove={() => handleAddAbove(index)}
              onAddBelow={() => handleAddBelow(index)}
              onDelete={() => handleDeleteNode(node.id)}
              isFirst={index === 0}
              isLast={index === nodes.length - 1}
              index={index}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              isDragging={draggedIndex === index}
              dragOverIndex={dragOverIndex}
            />
          ))}
        </CardContent>
      </Card>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} side="right">
        <DrawerContent>
          <DrawerHeader onClose={() => setIsDrawerOpen(false)}>
            <h2 className="text-lg font-semibold">Story Minimap</h2>
          </DrawerHeader>
          <DrawerBody>
            <StoryMinimap
              nodes={nodes}
              onNodeClick={handleNodeClick}
              onReorder={handleReorder}
              onDelete={handleDeleteNode}
              activeNodeId={activeNodeId}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
