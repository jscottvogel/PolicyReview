
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, Document, Finding } from '../api/client';
import { FileText, ChevronLeft, AlertCircle, CheckCircle, AlertTriangle, Shield, Search } from 'lucide-react';
import { cn } from '../lib/utils';

export function DocumentDetail() {
    const { id } = useParams<{ id: string }>();
    const [doc, setDoc] = useState<Document | null>(null);
    const [findings, setFindings] = useState<Finding[]>([]);
    const [blocks, setBlocks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'findings' | 'text'>('findings');

    useEffect(() => {
        if (id) loadData(id);
    }, [id]);

    const loadData = async (docId: string) => {
        setLoading(true);
        try {
            const [docRes, findingsRes, blocksRes] = await Promise.all([
                api.getDocument(docId),
                api.getFindings(docId),
                api.getBlocks(docId)
            ]);
            setDoc(docRes);
            setFindings(findingsRes);
            setBlocks(blocksRes);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading analysis...</div>;
    if (!doc) return <div className="p-8 text-center text-red-500">Document not found</div>;

    const severityCounts = {
        High: findings.filter(f => f.severity === 'High').length,
        Medium: findings.filter(f => f.severity === 'Medium').length,
        Low: findings.filter(f => f.severity === 'Low').length,
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4 mb-4">
                        <Link to="/" className="text-slate-500 hover:text-slate-800 transition-colors">
                            <ChevronLeft size={20} />
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                <FileText className="text-blue-600" />
                                {doc.filename}
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex gap-2 text-sm font-medium">
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full border border-red-100">
                                    <AlertCircle size={14} /> {severityCounts.High} High
                                </span>
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-100">
                                    <AlertTriangle size={14} /> {severityCounts.Medium} Medium
                                </span>
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                                    <Shield size={14} /> {severityCounts.Low} Low
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-6 border-b border-white">
                        <button
                            onClick={() => setActiveTab('findings')}
                            className={cn(
                                "pb-2 text-sm font-medium border-b-2 transition-colors",
                                activeTab === 'findings' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
                            )}
                        >
                            Analysis & Findings
                        </button>
                        <button
                            onClick={() => setActiveTab('text')}
                            className={cn(
                                "pb-2 text-sm font-medium border-b-2 transition-colors",
                                activeTab === 'text' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
                            )}
                        >
                            Document Content
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'findings' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            {findings.map(finding => (
                                <div key={finding.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex gap-4 transition-all hover:shadow-md">
                                    <div className={cn("mt-1 p-2 rounded-lg h-fit",
                                        finding.severity === 'High' ? "bg-red-50 text-red-600" :
                                            finding.severity === 'Medium' ? "bg-amber-50 text-amber-600" :
                                                "bg-blue-50 text-blue-600"
                                    )}>
                                        {finding.severity === 'High' ? <AlertCircle size={20} /> :
                                            finding.severity === 'Medium' ? <AlertTriangle size={20} /> : <Shield size={20} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-semibold text-slate-900">{finding.title}</h3>
                                            <span className="text-xs font-mono text-slate-400 uppercase">{finding.category}</span>
                                        </div>
                                        <p className="text-slate-600 mb-4 leading-relaxed">{finding.description}</p>

                                        {finding.suggestedFix && (
                                            <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-4">
                                                <h4 className="text-sm font-semibold text-green-800 mb-1 flex items-center gap-2">
                                                    <CheckCircle size={14} /> Suggested Fix
                                                </h4>
                                                <p className="text-sm text-green-700">{finding.suggestedFix}</p>
                                            </div>
                                        )}

                                        {finding.evidenceBlockIds.length > 0 && (
                                            <div className="space-y-2">
                                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Evidence</h4>
                                                {finding.evidenceBlockIds.map(bid => {
                                                    const block = blocks.find(b => b.id === bid);
                                                    return block ? (
                                                        <div key={bid} className="p-3 bg-slate-50 rounded border border-slate-200 text-sm text-slate-600 font-mono">
                                                            "{block.text}"
                                                        </div>
                                                    ) : null;
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <h3 className="font-semibold text-lg mb-4">Analysis Summary</h3>
                                <dl className="grid grid-cols-2 gap-4">
                                    <div>
                                        <dt className="text-xs text-slate-500 uppercase">Policy Type</dt>
                                        <dd className="font-medium">{doc.policyType}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs text-slate-500 uppercase">Status</dt>
                                        <dd className="font-medium capitalize">{doc.status}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h3 className="font-medium text-slate-700">Full Text Parsed Blocks</h3>
                            <span className="text-xs text-slate-500">{blocks.length} blocks found</span>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {blocks.map((block, i) => (
                                <div key={block.id} className="p-4 hover:bg-slate-50 flex gap-4">
                                    <span className="text-xs font-mono text-slate-400 w-8 pt-1 text-right">{i + 1}</span>
                                    <p className="text-slate-700 text-sm leading-relaxed">{block.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
