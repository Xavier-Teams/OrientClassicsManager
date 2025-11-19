// Use Django REST Framework instead of FastAPI
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface Work {
  id: number; // Django returns integer ID
  name: string;
  name_original?: string;
  author?: string;
  source_language: string;
  target_language: string;
  page_count: number;
  word_count: number;
  description?: string;
  translation_part?: string;
  translation_part_name?: string;
  translation_part_code?: string;
  translator?: string;
  translator_name?: string;
  state: string; // Django uses 'state' instead of 'translation_status'
  priority: string;
  translation_progress: number;
  progress?: number; // Computed field
  notes?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// Django REST Framework pagination format
export interface WorkListResponse {
  count: number; // Total number of items
  next: string | null; // URL to next page
  previous: string | null; // URL to previous page
  results: Work[]; // Array of works
}

export interface WorkBoardResponse {
  [status: string]: Work[];
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getAuthToken(): string | null {
    // Try to get token from localStorage
    // Check multiple possible keys
    const token = localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("access") ||
      null;
    
    if (!token) {
      // Debug: log available keys to help troubleshoot
      const allKeys = Object.keys(localStorage);
      const tokenKeys = allKeys.filter(key => 
        key.toLowerCase().includes('token') || 
        key.toLowerCase().includes('access') ||
        key.toLowerCase().includes('auth')
      );
      console.warn("No auth token found in localStorage.", {
        searchedKeys: ["access_token", "token", "accessToken", "access"],
        foundTokenKeys: tokenKeys,
        allKeys: allKeys
      });
    }
    
    return token;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getAuthToken();
    
    // Build headers object - handle both Headers object and plain object
    let headers: HeadersInit;
    
    if (options?.headers instanceof Headers) {
      // If headers is a Headers object, convert to plain object
      headers = {};
      options.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else {
      // If headers is a plain object or undefined, use it directly
      headers = {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      };
    }

    // Always add Authorization header if token exists (this will override any existing Authorization header)
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else {
      // Debug: log if token is missing
      console.warn("No auth token found when making request to:", endpoint);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401) {
        // Try to refresh token if we have refresh_token
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken && endpoint !== "/api/v1/auth/refresh/" && endpoint !== "/api/v1/auth/login/") {
          console.log("Access token expired, attempting to refresh...");
          const newAccessToken = await this.refreshToken();
          if (newAccessToken) {
            // Retry the original request with new token
            console.log("Retrying request with new access token");
            return this.request<T>(endpoint, options);
          }
        }
        
        // If refresh failed or no refresh token, clear tokens
        localStorage.removeItem("access_token");
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
      }

      // Try to get error details from response
      let errorMessage = `API error: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'object') {
          // Format validation errors
          const errors = Object.entries(errorData)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
          errorMessage = errors || errorMessage;
        }
      } catch (e) {
        // If can't parse error, use status text
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Works API
  async getWorks(params?: {
    page?: number;
    page_size?: number;
    status?: string;
    priority?: string;
    translator_id?: string;
    part_id?: string;
    search?: string;
  }): Promise<WorkListResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    return this.request<WorkListResponse>(
      `/api/v1/works/${queryString ? `?${queryString}` : ""}`
    );
  }

  async getWorksBoard(): Promise<WorkBoardResponse> {
    return this.request<WorkBoardResponse>("/api/v1/works/board/");
  }

  async getWork(id: number | string): Promise<Work> {
    return this.request<Work>(`/api/v1/works/${id}/`);
  }

  async createWork(work: Partial<Work>): Promise<Work> {
    return this.request<Work>("/api/v1/works/", {
      method: "POST",
      body: JSON.stringify(work),
    });
  }

  async updateWork(id: number | string, work: Partial<Work>): Promise<Work> {
    return this.request<Work>(`/api/v1/works/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(work),
    });
  }

  async deleteWork(id: number | string): Promise<void> {
    return this.request<void>(`/api/v1/works/${id}/`, {
      method: "DELETE",
    });
  }

  // Users/Translators API
  async getTranslators(): Promise<{ count: number; results: User[] }> {
    return this.request<{ count: number; results: User[] }>(
      "/api/v1/auth/users/translators/"
    );
  }

  // Authentication API
  async login(username: string, password: string): Promise<{
    access: string;
    refresh: string;
    user: User;
  }> {
    const response = await this.request<{
      access: string;
      refresh: string;
      user: User;
    }>("/api/v1/auth/login/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    // Save token to localStorage - ensure we save with the correct key
    if (response && response.access) {
      localStorage.setItem("access_token", response.access);
      if (response.refresh) {
        localStorage.setItem("refresh_token", response.refresh);
      }
      console.log("Token saved to localStorage:", {
        access_token: response.access.substring(0, 20) + "...",
        refresh_token: response.refresh ? response.refresh.substring(0, 20) + "..." : "none"
      });
    } else {
      console.error("No access token in login response:", response);
      // Try to extract from response if it's nested
      if (response && typeof response === 'object') {
        const access = (response as any).access || (response as any).access_token || (response as any).token;
        if (access) {
          localStorage.setItem("access_token", access);
          console.log("Token extracted and saved from nested response");
        }
      }
    }

    return response;
  }

  async refreshToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      console.warn("No refresh token found");
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/auth/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        console.error("Failed to refresh token:", response.statusText);
        // Clear tokens if refresh fails
        this.logout();
        return null;
      }

      const data = await response.json();
      if (data.access) {
        localStorage.setItem("access_token", data.access);
        if (data.refresh) {
          localStorage.setItem("refresh_token", data.refresh);
        }
        console.log("Token refreshed successfully");
        return data.access;
      }
      return null;
    } catch (error) {
      console.error("Error refreshing token:", error);
      this.logout();
      return null;
    }
  }

  async logout(): Promise<void> {
    // Clear tokens from localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
  }

  // User Management API
  async getUsers(params?: {
    page?: number;
    page_size?: number;
    search?: string;
  }): Promise<{ count: number; next: string | null; previous: string | null; results: User[] }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    return this.request<{ count: number; next: string | null; previous: string | null; results: User[] }>(
      `/api/v1/auth/users/${queryString ? `?${queryString}` : ""}`
    );
  }

  async getUser(id: number | string): Promise<User> {
    return this.request<User>(`/api/v1/auth/users/${id}/`);
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>("/api/v1/auth/users/me/");
  }

  async createUser(user: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
    role: string;
    phone?: string;
    bio?: string;
    active?: boolean;
  }): Promise<User> {
    return this.request<User>("/api/v1/auth/users/", {
      method: "POST",
      body: JSON.stringify(user),
    });
  }

  async updateUser(id: number | string, user: Partial<User>): Promise<User> {
    return this.request<User>(`/api/v1/auth/users/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(user),
    });
  }

  // Translators API
  async getTranslators(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    active?: boolean;
  }): Promise<{ count: number; next: string | null; previous: string | null; results: Translator[] }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size) queryParams.append("page_size", params.page_size.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.active !== undefined) queryParams.append("active", params.active.toString());
    
    const queryString = queryParams.toString();
    return this.request<{ count: number; next: string | null; previous: string | null; results: Translator[] }>(
      `/api/v1/translators/translators/${queryString ? `?${queryString}` : ""}`
    );
  }

  async getTranslator(id: number | string): Promise<Translator> {
    return this.request<Translator>(`/api/v1/translators/translators/${id}/`);
  }

  async createTranslator(translator: {
    first_name: string;
    last_name: string;
    id_card_number?: string;
    id_card_issue_date?: string;
    id_card_issue_place?: string;
    workplace?: string;
    address?: string;
    phone?: string;
    email?: string;
    bank_account_number?: string;
    bank_name?: string;
    bank_branch?: string;
    tax_code?: string;
    active?: boolean;
    user?: number;
  }): Promise<Translator> {
    return this.request<Translator>("/api/v1/translators/translators/", {
      method: "POST",
      body: JSON.stringify(translator),
    });
  }

  async updateTranslator(id: number | string, translator: Partial<Translator>): Promise<Translator> {
    return this.request<Translator>(`/api/v1/translators/translators/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(translator),
    });
  }

  async deleteTranslator(id: number | string): Promise<void> {
    return this.request<void>(`/api/v1/translators/translators/${id}/`, {
      method: "DELETE",
    });
  }

  async activateTranslator(id: number | string): Promise<Translator> {
    return this.request<Translator>(`/api/v1/translators/translators/${id}/activate/`, {
      method: "POST",
    });
  }

  async deactivateTranslator(id: number | string): Promise<Translator> {
    return this.request<Translator>(`/api/v1/translators/translators/${id}/deactivate/`, {
      method: "POST",
    });
  }

  async updateProfile(user: Partial<User>): Promise<User> {
    return this.request<User>("/api/v1/auth/users/me/", {
      method: "PATCH",
      body: JSON.stringify(user),
    });
  }

  async activateUser(id: number | string): Promise<User> {
    return this.request<User>(`/api/v1/auth/users/${id}/activate/`, {
      method: "POST",
    });
  }

  async deactivateUser(id: number | string): Promise<User> {
    return this.request<User>(`/api/v1/auth/users/${id}/deactivate/`, {
      method: "POST",
    });
  }

  // Translation Parts API
  async getTranslationParts(): Promise<Array<{ id: number; name: string; code: string }>> {
    const response = await this.request<{
      count: number;
      results: Array<{ id: number; name: string; code: string }>;
    }>("/api/v1/works/parts/");
    return response.results || [];
  }

  // Work Actions API
  async approveWork(id: number | string): Promise<Work> {
    return this.request<Work>(`/api/v1/works/${id}/approve/`, {
      method: "POST",
    });
  }

  async assignTranslator(
    id: number | string,
    translatorId: number
  ): Promise<Work> {
    return this.request<Work>(`/api/v1/works/${id}/assign_translator/`, {
      method: "POST",
      body: JSON.stringify({ translator_id: translatorId }),
    });
  }
}

export interface User {
  id: number; // Django returns integer ID
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name: string;
  role: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  active?: boolean;
  is_superuser?: boolean;
  is_staff?: boolean;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
}

export interface Translator {
  id: number;
  full_name: string;
  first_name?: string;
  last_name?: string;
  id_card_number?: string;
  id_card_issue_date?: string;
  id_card_issue_place?: string;
  workplace?: string;
  address?: string;
  phone?: string;
  email?: string;
  bank_account_number?: string;
  bank_name?: string;
  bank_branch?: string;
  tax_code?: string;
  active?: boolean;
  user?: number;
  created_at?: string;
  updated_at?: string;
}

export const apiClient = new ApiClient();

