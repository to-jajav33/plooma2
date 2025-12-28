import { Store } from "@plooma/store/src/Store";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
}

export type AuthMode = "authenticated" | "guest" | null;

export class AuthStore extends Store {
  mode: AuthMode = null;
  token: string = "";
  user: AuthUser | null = null;

  constructor() {
    super();
    this.loadFromStorage();
  }

  /**
   * Load auth data from localStorage
   */
  private loadFromStorage(): void {
    const stored = AuthStore.loadFromStorage();
    if (stored) {
      this.mode = (stored.mode as AuthMode) || null;
      this.token = (stored.token as string) || "";
      if (stored.user) {
        this.user = stored.user as AuthUser;
      }
    }
  }

  /**
   * Save auth data to localStorage
   */
  private saveToStorage(): void {
    Store.saveToStorage(this);
  }

  /**
   * Set authenticated user
   */
  setAuthenticated(token: string, user: AuthUser): void {
    this.mode = "authenticated";
    this.token = token;
    this.user = user;
    this.saveToStorage();
  }

  /**
   * Set guest mode
   */
  setGuest(): void {
    this.mode = "guest";
    this.token = "";
    this.user = null;
    this.saveToStorage();
  }

  /**
   * Logout
   */
  logout(): void {
    this.mode = null;
    this.token = "";
    this.user = null;
    this.saveToStorage();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.mode === "authenticated" && !!this.token && !!this.user;
  }

  /**
   * Check if user is in guest mode
   */
  isGuest(): boolean {
    return this.mode === "guest";
  }

  /**
   * Check if user has any mode set
   */
  hasMode(): boolean {
    return this.mode !== null;
  }
}
