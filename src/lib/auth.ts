export type AuthUser = {
  id: string;
  email: string;
  name: string;
  ageGroup: string;
  income?: number;
};

const AUTH_KEY = "ds_auth_user";
const TOKEN_KEY = "ds_auth_token";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

export function getAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!(getAuthUser() && getAuthToken());
}

export function setAuthData(user: AuthUser, token: string): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, token);
}

export function logoutUser(): void {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

// API functions
export async function loginUser(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  const data = await response.json();
  setAuthData(data.user, data.token);
  return data;
}

export async function registerUser(name: string, email: string, password: string, ageGroup: string): Promise<{ user: AuthUser; token: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password, ageGroup }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }

  const data = await response.json();
  setAuthData(data.user, data.token);
  return data;
}



