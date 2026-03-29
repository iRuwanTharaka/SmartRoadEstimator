import apiClient from './client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Project {
    id: string;
    name: string;
    location: string;
    roadLength?: number;
    roadWidth?: number;
    surfaceType?: string;
    contractor?: string;
    notes?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    createdById: string;
}

export interface CreateProjectPayload {
    name: string;
    location: string;
    roadLength?: number;
    roadWidth?: number;
    surfaceType?: string;
    contractor?: string;
    notes?: string;
}

export interface ProjectsListResponse {
    data: Project[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export const projectsApi = {
    create: async (payload: CreateProjectPayload): Promise<Project> => {
        const res = await apiClient.post('/projects', payload);
        return res.data;
    },

    getAll: async (page = 1, limit = 20, query?: string): Promise<ProjectsListResponse> => {
        const params: Record<string, any> = { page, limit };
        if (query) params.query = query;
        const res = await apiClient.get('/projects', { params });
        return res.data;
    },

    getById: async (id: string): Promise<Project> => {
        const res = await apiClient.get(`/projects/${id}`);
        return res.data;
    },

    update: async (id: string, payload: Partial<CreateProjectPayload>): Promise<Project> => {
        const res = await apiClient.put(`/projects/${id}`, payload);
        return res.data;
    },

    delete: async (id: string): Promise<{ message: string }> => {
        const res = await apiClient.delete(`/projects/${id}`);
        return res.data;
    },
};
