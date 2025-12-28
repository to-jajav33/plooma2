import { proxy } from "valtio";

export class Store {
  static proxies = new Map<string, any>();

  constructor() {}

  /**
   * Get the storage key for this store class
   */
  static getStorageKey(): string {
    return `@@plooma@@${this.name}`;
  }

  /**
   * Save store data to localStorage
   * Saves all non-function, non-private properties of the store instance
   */
  static saveToStorage(storeInstance: Store): void {
    if (typeof window === "undefined") return;

    try {
      const storeData: Record<string, unknown> = {};
      const storeClass = storeInstance.constructor as typeof Store;
      const storageKey = storeClass.getStorageKey();
      const processedKeys = new Set<string>();

      // Get all own properties (including those defined with Object.defineProperty)
      const descriptors = Object.getOwnPropertyDescriptors(storeInstance);
      for (const [key, descriptor] of Object.entries(descriptors)) {
        if (
          !processedKeys.has(key) &&
          !key.startsWith("_") &&
          key !== "constructor" &&
          descriptor.value !== undefined &&
          typeof descriptor.value !== "function"
        ) {
          storeData[key] = descriptor.value;
          processedKeys.add(key);
        }
      }

      // Also check enumerable properties (for properties that might not be in descriptors)
      for (const key in storeInstance) {
        if (
          !processedKeys.has(key) &&
          !key.startsWith("_") &&
          key !== "constructor" &&
          typeof storeInstance[key as keyof typeof storeInstance] !== "function"
        ) {
          storeData[key] = storeInstance[key as keyof typeof storeInstance];
          processedKeys.add(key);
        }
      }

      localStorage.setItem(storageKey, JSON.stringify(storeData));
    } catch (error) {
      console.error(
        `Failed to save ${storeInstance.constructor.name} to localStorage:`,
        error
      );
    }
  }

  /**
   * Load store data from localStorage
   * Returns the parsed data or null if not found
   */
  static loadFromStorage(): Record<string, unknown> | null {
    const storeClass = this;
    if (typeof window === "undefined") return null;

    try {
      const storageKey = storeClass.getStorageKey();
      const stored = localStorage.getItem(storageKey);

      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error(
        `Failed to load ${storeClass.name} from localStorage:`,
        error
      );
    }

    return null;
  }

  /**
   * Create a proxy for the store
   * Returns instance of the store that calls its methods directly
   *
   * @example
   * AuthStore is a class that extends Store
   * const store = AuthStore.proxy();
   * store.setAuthenticated("token", "user");
   */
  static proxy<T extends typeof Store>(
    StoreClass: T = this as unknown as T,
    key: string = this.getStorageKey()
  ): InstanceType<T> {
    if (!key) {
      throw new Error("Key is required");
    }
    if (!StoreClass) {
      throw new Error("StoreClass is required");
    }

    if (Store.proxies.has(key)) {
      return Store.proxies.get(key)!;
    }

    const store = proxy(new StoreClass()) as InstanceType<T>;
    Store.proxies.set(key, store);
    return store;
  }
}
