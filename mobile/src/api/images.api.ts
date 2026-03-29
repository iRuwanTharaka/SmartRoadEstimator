import apiClient from './client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProjectImage {
    id: string;
    projectId: string;
    url: string;
    latitude?: number;
    longitude?: number;
    capturedAt?: string;
    createdAt: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export const imagesApi = {
    upload: async (
        projectId: string,
        imageUri: string,
        extra?: { latitude?: number; longitude?: number; capturedAt?: string }
    ): Promise<ProjectImage> => {
        const formData = new FormData();
        const fileName = imageUri.split('/').pop() ?? 'image.jpg';
        const ext = fileName.split('.').pop()?.toLowerCase() ?? 'jpg';
        const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

        formData.append('image', {
            uri: imageUri,
            name: fileName,
            type: mimeType,
        } as any);

        if (extra?.latitude !== undefined) formData.append('latitude', String(extra.latitude));
        if (extra?.longitude !== undefined) formData.append('longitude', String(extra.longitude));
        if (extra?.capturedAt) formData.append('capturedAt', extra.capturedAt);

        const res = await apiClient.post(`/images/${projectId}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    },

    getByProject: async (projectId: string): Promise<ProjectImage[]> => {
        const res = await apiClient.get(`/images/${projectId}`);
        return res.data;
    },

    delete: async (id: string): Promise<{ message: string }> => {
        const res = await apiClient.delete(`/images/${id}`);
        return res.data;
    },
};
