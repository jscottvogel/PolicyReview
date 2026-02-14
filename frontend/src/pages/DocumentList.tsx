
import React, { useEffect, useState } from 'react';
import { api, Document } from '../api/client';
import { Plus, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function DocumentList() {
    const [docs, setDocs] = useState<Document[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadDocs();
    }, []);

    const loadDocs = async () => {
        setLoading(true);
        try {
            const data = await api.getDocuments();
            setDocs(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTestData = async () => {
        setCreating(true);
        try {
            await api.createTestData();
            await loadDocs();
        } catch (err) {
            alert("Failed to create test data");
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Policy Documents</h1>
                <button
                    onClick={handleCreateTestData}
                    disabled={creating}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
                >
                    {creating ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Plus size={18} />}
                    Generate Test Data
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-slate-500">Loading documents...</div>
            ) : docs.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-xl border border-dashed border-slate-300">
                    <FileText className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">No documents found</h3>
                    <p className="text-slate-500">Generate some test data to get started.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {docs.map((doc) => (
                        <Link key={doc.id} to={`/documents/${doc.id}`} className="block group">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group-hover:border-blue-300">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                                                {doc.filename}
                                            </h3>
                                            <p className="text-sm text-slate-500">
                                                Uploaded {new Date(doc.uploadedAtISO).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider",
                                        doc.riskLevel === 'high' ? "bg-red-100 text-red-700" :
                                            doc.riskLevel === 'medium' ? "bg-amber-100 text-amber-700" :
                                                "bg-green-100 text-green-700"
                                    )}>
                                        {doc.riskLevel} Risk
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-slate-700">Top Findings:</p>
                                    <ul className="space-y-1">
                                        {doc.summaryTopFindings.slice(0, 2).map((item, i) => (
                                            <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                                <AlertTriangle size={14} className="mt-1 text-amber-500 shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

// Utility for conditional classes (copy of util for this file if needed, but imported)
import { cn } from '../lib/utils';
