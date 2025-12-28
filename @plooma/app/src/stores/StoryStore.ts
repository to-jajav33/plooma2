import { Store } from "@plooma/store/src/Store";

export interface StoryNodeData {
  id: string;
  name: string;
  content: string;
}

export class StoryStore extends Store {
  nodes: StoryNodeData[] = [];
  title: string = "";

  constructor() {
    super();
    this.loadFromStorage();
  }

  /**
   * Load store data from localStorage
   */
  private loadFromStorage(): void {
    const stored = StoryStore.loadFromStorage();
    if (stored) {
      // Restore nodes
      if (Array.isArray(stored.nodes)) {
        this.nodes = stored.nodes;
      }
      // Restore title
      if (typeof stored.title === "string") {
        this.title = stored.title;
      }
    }
  }

  /**
   * Save store data to localStorage
   */
  private saveToStorage(): void {
    Store.saveToStorage(this);
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
   * Reorder nodes by moving a node from one index to another
   */
  reorderNodes(fromIndex: number, toIndex: number): void {
    if (fromIndex === toIndex) return;
    if (fromIndex < 0 || fromIndex >= this.nodes.length) return;
    if (toIndex < 0 || toIndex >= this.nodes.length) return;

    const [movedNode] = this.nodes.splice(fromIndex, 1);
    if (movedNode) {
      this.nodes.splice(toIndex, 0, movedNode);
      this.saveToStorage();
    }
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

  /**
   * Get the story title
   */
  getTitle(): string {
    return this.title;
  }

  /**
   * Set the story title
   */
  setTitle(title: string): void {
    this.title = title;
    this.saveToStorage();
  }
}
