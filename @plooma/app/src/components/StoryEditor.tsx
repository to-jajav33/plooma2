import React, { useState, useRef, useCallback } from "react";
import { StoryNode } from "./StoryNode";
import { Button } from "./ui/button";
import { Plus, Map as MapIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Drawer, DrawerContent, DrawerHeader, DrawerBody } from "./ui/drawer";
import { StoryMinimap } from "./StoryMinimap";
import { StoryStore } from "../stores/StoryStore";
import type { StoryNodeData } from "../stores/StoryStore";

// Create a singleton instance of the store
const storyStore = new StoryStore();

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

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState<string | undefined>();
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

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Modular Story Editor</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDrawerOpen(true)}
            >
              <MapIcon className="h-4 w-4 mr-2" />
              Minimap
            </Button>
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
              isFirst={index === 0}
              isLast={index === nodes.length - 1}
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
              activeNodeId={activeNodeId}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
