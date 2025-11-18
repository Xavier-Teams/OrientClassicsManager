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

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
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
  full_name: string;
  role: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const apiClient = new ApiClient();

