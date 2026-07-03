/**
 * ZION STOCK OS - Authentication Library
 * JWT Token Management & Security
 */

import { User, UserRole } from '../types';

// Token storage keys
const ACCESS_TOKEN_KEY = 'zion_access_token';
const REFRESH_TOKEN_KEY = 'zion_refresh_token';
const USER_KEY = 'zion_user';

// Token payload interface
interface TokenPayload {
  sub: string;
  exp: number;
  iat: number;
  type: 'access' | 'refresh';
  role?: string;
  company_id?: string;
}

/**
 * Decode JWT token without verification (client-side)
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload) return true;
  
  // Add 10 second buffer
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now + 10;
}

/**
 * Get remaining time until token expires (in seconds)
 */
export function getTokenExpiresIn(token: string): number {
  const payload = decodeToken(token);
  if (!payload) return 0;
  
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, payload.exp - now);
}

/**
 * Store tokens securely
 */
export function storeTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

/**
 * Get access token
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Get refresh token
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Clear all tokens
 */
export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Store user data
 */
export function storeUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Get stored user
 */
export function getStoredUser(): User | null {
  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;
  
  try {
    return JSON.parse(data) as User;
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getAccessToken();
  if (!token) return false;
  
  return !isTokenExpired(token);
}

/**
 * Check if user has specific role
 */
export function hasRole(user: User | null, roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User | null): boolean {
  return hasRole(user, ['admin']);
}

/**
 * Check if user is manager (admin or magasinier)
 */
export function isManager(user: User | null): boolean {
  return hasRole(user, ['admin', 'magasinier']);
}

/**
 * Generate authorization header
 */
export function getAuthHeader(): Record<string, string> {
  const token = getAccessToken();
  if (!token) return {};
  
  return {
    'Authorization': `Bearer ${token}`
  };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins 8 caractères' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins une majuscule' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins une minuscule' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins un chiffre' };
  }
  return { valid: true, message: 'OK' };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
