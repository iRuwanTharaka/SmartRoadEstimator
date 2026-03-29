import apiClient from './client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BreakdownItem {
    label: string;
    quantity: number;
    unit: string;
    rate: number;
    total: number;
}

export interface Estimation {
    id: string;
    projectId: string;
    materialCost: number;
    laborCost: number;
    equipmentCost: number;
    totalCost: number;
    totalArea: number;
    breakdown: BreakdownItem[];
    createdAt: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export const estimateApi = {
    calculate: async (projectId: string): Promise<Estimation> => {
        const res = await apiClient.post('/estimate/calculate', { projectId });
        return res.data;
    },

    getByProject: async (projectId: string): Promise<Estimation[]> => {
        const res = await apiClient.get(`/estimate/${projectId}`);
        return res.data;
    },
};
