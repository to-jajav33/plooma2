/**
 * API client functions
 */

const API_ORIGIN = process.env.BUN_PUBLIC_API_ORIGIN;
const API_PORT = process.env.BUN_PUBLIC_API_PORT;
const API_BASE_URL =
  API_ORIGIN && API_PORT
    ? `${API_ORIGIN}:${API_PORT}`
    : "http://localhost:3001";

export interface SignupData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export interface ApiError {
  error: string;
}

/**
 * Sign up a new user
 */
export async function signup(data: SignupData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error || "Signup failed");
  }

  return response.json();
}

/**
 * Log in a user
 */
export async function login(data: LoginData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error || "Login failed");
  }

  return response.json();
}
