import { Store } from "@plooma/store/src/Store";

export type EditorMode = "modular" | "single";

export class AppStore extends Store {
  editorMode: EditorMode = "modular";

  /**
   * Bun hot reload fix
   */
  static override get name(): string {
    return "AppStore";
  }

  constructor() {
    super();
    this.loadFromStorage();
  }

  /**
   * Load store data from localStorage
   */
  private loadFromStorage(): void {
    const stored = AppStore.loadFromStorage();
    if (stored) {
      if (stored.editorMode === "modular" || stored.editorMode === "single") {
        this.editorMode = stored.editorMode;
      }
    }
  }

  /**
   * Save store data to localStorage
   */
  private saveToStorage(): void {
    AppStore.saveToStorage(this);
  }

  /**
   * Get the current editor mode
   */
  getEditorMode(): EditorMode {
    return this.editorMode;
  }

  /**
   * Set the editor mode
   */
  setEditorMode(mode: EditorMode): void {
    this.editorMode = mode;
    this.saveToStorage();
  }
}

