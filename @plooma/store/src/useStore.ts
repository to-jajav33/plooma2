import { useSnapshot } from "valtio";
import { Store } from "./Store";

/**
 * React hook to use a reactive store
 * Returns a readonly snapshot of the store that triggers re-renders on changes
 * 
 * For mutations, use the store directly (e.g., `store.nodes = [...]`)
 * For reading in components, use this hook (e.g., `const state = useStore(store)`)
 * 
 * @example
 * const store = StoryStore.proxy();
 * 
 * // In a component:
 * const state = useStore(store);
 * // state.nodes, state.title will trigger re-renders when changed
 * 
 * // To mutate (outside or inside component):
 * store.nodes.push(newNode); // This will trigger reactivity
 */
export function useStore<T extends Store>(store: T): Readonly<T> {
  return useSnapshot(store) as Readonly<T>;
}

