import React, { useState } from "react";
import { StoryNode } from "./StoryNode";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export interface StoryNodeData {
  id: string;
  name: string;
  content: string;
}

interface StoryEditorProps {
  initialNodes?: StoryNodeData[];
  onNodesChange?: (nodes: StoryNodeData[]) => void;
}

export function StoryEditor({
  initialNodes = [],
  onNodesChange,
}: StoryEditorProps) {
  const [nodes, setNodes] = useState<StoryNodeData[]>(
    initialNodes.length > 0
      ? initialNodes
      : [{ id: generateId(), name: "", content: "" }]
  );

  function generateId(): string {
    return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  const handleNodesChange = (newNodes: StoryNodeData[]) => {
    setNodes(newNodes);
    onNodesChange?.(newNodes);
  };

  const handleNodeContentChange = (id: string, content: string) => {
    const newNodes = nodes.map((node) =>
      node.id === id ? { ...node, content } : node
    );
    handleNodesChange(newNodes);
  };

  const handleNodeNameChange = (id: string, name: string) => {
    const newNodes = nodes.map((node) =>
      node.id === id ? { ...node, name } : node
    );
    handleNodesChange(newNodes);
  };

  const handleAddAbove = (index: number) => {
    const newNodes = [
      ...nodes.slice(0, index),
      { id: generateId(), name: "", content: "" },
      ...nodes.slice(index),
    ];
    handleNodesChange(newNodes);
  };

  const handleAddBelow = (index: number) => {
    const newNodes = [
      ...nodes.slice(0, index + 1),
      { id: generateId(), name: "", content: "" },
      ...nodes.slice(index + 1),
    ];
    handleNodesChange(newNodes);
  };

  const handleAddFirst = () => {
    const newNodes = [{ id: generateId(), name: "", content: "" }, ...nodes];
    handleNodesChange(newNodes);
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
