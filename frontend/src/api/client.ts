
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

export interface Document {
    id: string;
    filename: string;
    status: string;
    policyType: string;
    riskLevel: string;
    uploadedAtISO: string;
    summaryTopFindings: string[];
}

export interface Finding {
    id: string;
    docId: string;
    severity: 'High' | 'Medium' | 'Low';
    category: 'completeness' | 'ambiguity' | 'risk' | 'consistency';
    title: string;
    description: string;
    evidenceBlockIds: string[];
    suggestedFix?: string;
}

export const api = {
    createTestData: async () => {
        const res = await axios.post<{ docId: string }>(`${API_BASE}/dev/create-test-data`);
        return res.data;
    },
    getDocuments: async () => {
        const res = await axios.get<Document[]>(`${API_BASE}/documents`);
        return res.data;
    },
    getDocument: async (id: string) => {
        const res = await axios.get<Document>(`${API_BASE}/documents/${id}`);
        return res.data;
    },
    getFindings: async (id: string) => {
        const res = await axios.get<Finding[]>(`${API_BASE}/documents/${id}/findings`);
        return res.data;
    },
    getBlocks: async (id: string) => {
        const res = await axios.get<any[]>(`${API_BASE}/documents/${id}/blocks`);
        return res.data;
    },
    getReport: async (id: string) => {
        const res = await axios.get<any>(`${API_BASE}/documents/${id}/report`);
        return res.data;
    }
};
