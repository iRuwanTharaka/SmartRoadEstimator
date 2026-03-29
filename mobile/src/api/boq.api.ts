import apiClient from './client';
import { getAccessToken } from './client';
import { File, Paths } from 'expo-file-system/next';
import * as Sharing from 'expo-sharing';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BOQItem {
    id: number;
    item: string;
    description: string;
    qty: number;
    unit: string;
    rate: number;
    total: number;
}

export interface BOQData {
    project: {
        id: string;
        name: string;
        location: string;
        createdAt?: string;
    };
    estimation: {
        totalCost: number;
        materialCost: number;
        laborCost: number;
        equipmentCost: number;
        totalArea: number;
    };
    items: BOQItem[];
    grandTotal: number;
}

// ─── API Functions ────────────────────────────────────────────────────────────

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5003/api';

export const boqApi = {
    getData: async (projectId: string): Promise<BOQData> => {
        const res = await apiClient.get(`/boq/${projectId}`);
        return res.data;
    },

    /**
     * Download BOQ PDF using auth token and open the share sheet.
     * Uses expo-file-system/next File.downloadFileAsync which supports headers.
     */
    downloadAndSharePDF: async (projectId: string): Promise<void> => {
        const token = await getAccessToken();
        const url = `${BASE_URL}/boq/${projectId}/pdf`;
        const outputFile = new File(Paths.cache, `BOQ_${projectId}.pdf`);

        const downloaded = await File.downloadFileAsync(url, outputFile, {
            headers: { Authorization: `Bearer ${token ?? ''}` },
        });

        const canShare = await Sharing.isAvailableAsync();
        if (!canShare) throw new Error('Sharing is not available on this device');
        await Sharing.shareAsync(downloaded.uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Export BOQ PDF',
        });
    },

    /**
     * Download BOQ Excel using auth token and open the share sheet.
     */
    downloadAndShareExcel: async (projectId: string): Promise<void> => {
        const token = await getAccessToken();
        const url = `${BASE_URL}/boq/${projectId}/excel`;
        const outputFile = new File(Paths.cache, `BOQ_${projectId}.xlsx`);

        const downloaded = await File.downloadFileAsync(url, outputFile, {
            headers: { Authorization: `Bearer ${token ?? ''}` },
        });

        const canShare = await Sharing.isAvailableAsync();
        if (!canShare) throw new Error('Sharing is not available on this device');
        await Sharing.shareAsync(downloaded.uri, {
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            dialogTitle: 'Export BOQ Excel',
        });
    },
};
