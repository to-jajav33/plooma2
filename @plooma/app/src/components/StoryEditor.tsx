import React, { useState } from "react";
import { StoryNode } from "./StoryNode";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { StoryStore } from "@plooma/store";
import type { StoryNodeData } from "@plooma/store";

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

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Modular Story Editor</CardTitle>
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
  );
}
