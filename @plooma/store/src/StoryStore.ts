import { Store } from "./Store";

export interface StoryNodeData {
  id: string;
  name: string;
  content: string;
}

const STORAGE_KEY = "plooma-story-nodes";

export class StoryStore extends Store {
  private nodes: StoryNodeData[] = [];

  constructor() {
    super();
    this.loadFromStorage();
  }

  /**
   * Load nodes from localStorage
   */
  private loadFromStorage(): void {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate that it's an array
        if (Array.isArray(parsed)) {
          this.nodes = parsed;
        }
      }
    } catch (error) {
      console.error("Failed to load story nodes from localStorage:", error);
      this.nodes = [];
    }
  }

  /**
   * Save nodes to localStorage
   */
  private saveToStorage(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.nodes));
    } catch (error) {
      console.error("Failed to save story nodes to localStorage:", error);
    }
  }

  /**
   * Get all story nodes
   */
  getNodes(): StoryNodeData[] {
    return [...this.nodes];
  }

  /**
   * Set all story nodes (replaces existing)
   */
  setNodes(nodes: StoryNodeData[]): void {
    this.nodes = [...nodes];
    this.saveToStorage();
  }

  /**
   * Get a single node by ID
   */
  getNode(id: string): StoryNodeData | undefined {
    return this.nodes.find((node) => node.id === id);
  }

  /**
   * Update a node's content
   */
  updateNodeContent(id: string, content: string): void {
    const node = this.nodes.find((n) => n.id === id);
    if (node) {
      node.content = content;
      this.saveToStorage();
    }
  }

  /**
   * Update a node's name
   */
  updateNodeName(id: string, name: string): void {
    const node = this.nodes.find((n) => n.id === id);
    if (node) {
      node.name = name;
      this.saveToStorage();
    }
  }

  /**
   * Add a new node at a specific index
   */
  addNodeAt(index: number, node: StoryNodeData): void {
    this.nodes.splice(index, 0, node);
    this.saveToStorage();
  }

  /**
   * Remove a node by ID
   */
  removeNode(id: string): void {
    this.nodes = this.nodes.filter((node) => node.id !== id);
    this.saveToStorage();
  }

  /**
   * Clear all nodes
   */
  clearNodes(): void {
    this.nodes = [];
    this.saveToStorage();
  }

  /**
   * Generate a unique ID for a new node
   */
  generateId(): string {
    return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize with a default node if empty
   */
  initializeIfEmpty(): void {
    if (this.nodes.length === 0) {
      this.nodes = [{ id: this.generateId(), name: "", content: "" }];
      this.saveToStorage();
    }
  }
}
