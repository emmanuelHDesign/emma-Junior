/**
 * ZION STOCK OS - API Client
 * HTTP Client with JWT Authentication
 */

import { 
  getAccessToken, 
  getRefreshToken, 
  storeTokens, 
  clearTokens,
  isTokenExpired 
} from './auth';

// API Configuration
declare const __VITE_API_URL__: string | undefined;
const API_BASE_URL = (typeof __VITE_API_URL__ !== 'undefined' ? __VITE_API_URL__ : null) || 'http://localhost:8000/api/v1';

// Request options interface
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

// API Response interface
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

// Token refresh state
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearTokens();
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      return false;
    }

    const data = await response.json();
    storeTokens(data.access_token, data.refresh_token);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

/**
 * Ensure valid access token (refresh if needed)
 */
async function ensureValidToken(): Promise<boolean> {
  const accessToken = getAccessToken();
  
  if (!accessToken) {
    return false;
  }

  if (!isTokenExpired(accessToken)) {
    return true;
  }

  // Prevent multiple simultaneous refresh requests
  if (isRefreshing) {
    return refreshPromise || Promise.resolve(false);
  }

  isRefreshing = true;
  refreshPromise = refreshAccessToken();
  
  try {
    const result = await refreshPromise;
    return result;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
}

/**
 * Make API request with authentication
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, headers = {}, skipAuth = false } = options;

  // Ensure valid token if authentication required
  if (!skipAuth) {
    const hasValidToken = await ensureValidToken();
    if (!hasValidToken) {
      return {
        data: null,
        error: 'Session expirée. Veuillez vous reconnecter.',
        status: 401,
      };
    }
  }

  // Build headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add authorization header
  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Handle unauthorized (token might have been invalidated server-side)
    if (response.status === 401) {
      clearTokens();
      return {
        data: null,
        error: 'Session expirée. Veuillez vous reconnecter.',
        status: 401,
      };
    }

    // Parse response
    const data = response.ok ? await response.json() : null;
    const error = !response.ok ? await response.text() : null;

    // Try to parse error as JSON
    let errorMessage = error;
    if (error) {
      try {
        const errorJson = JSON.parse(error);
        errorMessage = errorJson.detail || errorJson.message || error;
      } catch {
        // Keep original error string
      }
    }

    return {
      data,
      error: errorMessage,
      status: response.status,
    };
  } catch (err) {
    return {
      data: null,
      error: 'Erreur de connexion au serveur',
      status: 0,
    };
  }
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiRequest<{
      access_token: string;
      refresh_token: string;
      token_type: string;
      expires_in: number;
      user: import('../types').User;
    }>('/auth/login', {
      method: 'POST',
      body: { email, password },
      skipAuth: true,
    });
    return response;
  },

  register: async (email: string, password: string, fullName: string, companyName?: string) => {
    const response = await apiRequest<{
      access_token: string;
      refresh_token: string;
      token_type: string;
      expires_in: number;
      user: import('../types').User;
    }>('/auth/register', {
      method: 'POST',
      body: { email, password, full_name: fullName, company_name: companyName },
      skipAuth: true,
    });
    return response;
  },

  logout: async () => {
    await apiRequest('/auth/logout', { method: 'POST' });
    clearTokens();
  },

  getMe: async () => {
    return apiRequest<import('../types').User>('/auth/me');
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiRequest('/auth/change-password', {
      method: 'POST',
      body: { current_password: currentPassword, new_password: newPassword },
    });
  },
};
