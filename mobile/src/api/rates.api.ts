import apiClient from './client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MaterialRate {
    id: string;
    name: string;
    unit: string;
    costPerUnit: number;
    createdAt?: string;
}

export interface LaborRate {
    id: string;
    name: string;
    unit: string;
    costPerHour: number;
    createdAt?: string;
}

export interface EquipmentRate {
    id: string;
    name: string;
    unit: string;
    costPerUse: number;
    createdAt?: string;
}

export interface AllRates {
    materials: MaterialRate[];
    labor: LaborRate[];
    equipment: EquipmentRate[];
}

// ─── API Functions ────────────────────────────────────────────────────────────

export const ratesApi = {
    getAll: async (): Promise<AllRates> => {
        const res = await apiClient.get('/rates/all');
        return res.data;
    },

    // Material
    getMaterials: async (page = 1, limit = 50): Promise<{ data: MaterialRate[]; total: number }> => {
        const res = await apiClient.get('/rates/material', { params: { page, limit } });
        return res.data;
    },
    createMaterial: async (payload: { name: string; unit: string; costPerUnit: number }): Promise<MaterialRate> => {
        const res = await apiClient.post('/rates/material', payload);
        return res.data;
    },
    updateMaterial: async (id: string, payload: { name?: string; unit?: string; costPerUnit?: number }): Promise<MaterialRate> => {
        const res = await apiClient.put(`/rates/material/${id}`, payload);
        return res.data;
    },
    deleteMaterial: async (id: string): Promise<{ message: string }> => {
        const res = await apiClient.delete(`/rates/material/${id}`);
        return res.data;
    },

    // Labor
    getLabor: async (page = 1, limit = 50): Promise<{ data: LaborRate[]; total: number }> => {
        const res = await apiClient.get('/rates/labor', { params: { page, limit } });
        return res.data;
    },
    createLabor: async (payload: { name: string; unit: string; costPerHour: number }): Promise<LaborRate> => {
        const res = await apiClient.post('/rates/labor', payload);
        return res.data;
    },
    updateLabor: async (id: string, payload: { name?: string; unit?: string; costPerHour?: number }): Promise<LaborRate> => {
        const res = await apiClient.put(`/rates/labor/${id}`, payload);
        return res.data;
    },
    deleteLabor: async (id: string): Promise<{ message: string }> => {
        const res = await apiClient.delete(`/rates/labor/${id}`);
        return res.data;
    },

    // Equipment
    getEquipment: async (page = 1, limit = 50): Promise<{ data: EquipmentRate[]; total: number }> => {
        const res = await apiClient.get('/rates/equipment', { params: { page, limit } });
        return res.data;
    },
    createEquipment: async (payload: { name: string; unit: string; costPerUse: number }): Promise<EquipmentRate> => {
        const res = await apiClient.post('/rates/equipment', payload);
        return res.data;
    },
    updateEquipment: async (id: string, payload: { name?: string; unit?: string; costPerUse?: number }): Promise<EquipmentRate> => {
        const res = await apiClient.put(`/rates/equipment/${id}`, payload);
        return res.data;
    },
    deleteEquipment: async (id: string): Promise<{ message: string }> => {
        const res = await apiClient.delete(`/rates/equipment/${id}`);
        return res.data;
    },
};
