export class Store {
  static proxies = new Map<string, any>();

  constructor() {}

  /**
   * Get the storage key for this store class
   */
  static getStorageKey(storeClass: typeof Store): string {
    return `@@plooma@@${storeClass.name}`;
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
      const storageKey = Store.getStorageKey(storeClass);
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
  static loadFromStorage(
    storeClass: typeof Store
  ): Record<string, unknown> | null {
    if (typeof window === "undefined") return null;

    try {
      const storageKey = Store.getStorageKey(storeClass);
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

  static proxy(StoreClass: typeof Store, key: string) {
    if (Store.proxies.has(key)) {
      return Store.proxies.get(key)!;
    }

    const store = new StoreClass();
    Store.proxies.set(
      key,
      new Proxy(store, {
        get: (target, prop) => {
          if (
            typeof target[prop as keyof typeof target] === "function" &&
            (target[prop as keyof typeof target] as any)
              .$$ploomaStoreFunction === true
          ) {
            const oldFunction = target[prop as keyof typeof target] as Function;
            const newFunction = (...args: unknown[]) => {
              return oldFunction(...args);
            };

            newFunction.$$ploomaStoreFunction = true;
            return newFunction;
          }
          return target[prop as keyof typeof target];
        },
        set: (target, prop, value) => {
          target[prop as keyof typeof target] = value as never;
          return true;
        },
      })
    );
    return store;
  }
}
