export class Store {
  static proxies = new Map<string, any>();

  constructor() {}

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
            typeof target[prop] === "function" &&
            target[prop].$$ploomaStoreFunction === true
          ) {
            const oldFunction = target[prop];
            const newFunction = (...args: unknown[]) => {
              return oldFunction(...args);
            };

            newFunction.$$ploomaStoreFunction = true;
            return newFunction;
          }
          return target[prop];
        },
        set: (target, prop, value) => {
          target[prop] = value;
          return true;
        },
      })
    );
    return store;
  }
}
