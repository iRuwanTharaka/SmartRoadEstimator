import apiClient from './client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Detection {
    id: string;
    projectId: string;
    x: number;
    y: number;
    width: number;
    height: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    label?: string;
    createdAt: string;
}

export interface AnalysisResult {
    detections: Detection[];
    totalDetections: number;
    totalArea: number;
    severity: string;
}

export interface UpdateDetectionPayload {
    id?: string;
    x: number;
    y: number;
    width: number;
    height: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    label?: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export const analysisApi = {
    run: async (projectId: string): Promise<AnalysisResult> => {
        const res = await apiClient.post('/analysis/run', { projectId });
        return res.data;
    },

    getDetections: async (projectId: string): Promise<Detection[]> => {
        const res = await apiClient.get(`/analysis/${projectId}/detections`);
        return res.data;
    },

    updateDetections: async (
        projectId: string,
        detections: UpdateDetectionPayload[]
    ): Promise<Detection[]> => {
        const res = await apiClient.put(`/analysis/${projectId}/update-detections`, { detections });
        return res.data;
    },
};
