import { useState, useEffect } from "react";
import { Shield, Database, Key, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

function Limit() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

    const fetchLimits = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/limit`);
            const result = await response.json();
            setData(result);
            setError(null);
        } catch (err) {
            setError("Failed to fetch API limits. Ensure backend is running.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLimits();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-6 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                            <Shield className="text-indigo-600" /> API Usage Dashboard
                        </h1>
                        <p className="text-slate-500">Monitor your AI tokens and search engine credits.</p>
                    </div>
                    <button
                        onClick={fetchLimits}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-md text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                </div>

                {error && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-lg mb-8 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" /> {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                                <Key className="w-5 h-5 text-indigo-600" /> GitHub Models (GPT-4o)
                            </h2>
                        </div>
                        <div className="p-6 space-y-6">
                            {loading && !data ? (
                                <div className="py-10 text-center text-slate-400">Loading token data...</div>
                            ) : (
                                data?.github_tokens.map((token, idx) => (
                                    <div key={idx} className="p-4 border border-slate-100 rounded-lg">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Token #{token.token_index}</span>
                                                <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">{token.token_snippet || "N/A"}</code>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${token.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                {token.status}
                                            </span>
                                        </div>
                                        <div className="flex items-end justify-between">
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">AI Requests Left</span>
                                                <span className="text-2xl font-bold text-slate-900">{token.remaining}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">REST API Status</span>
                                                <div className="text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-100 rounded px-2 py-1 mt-1">
                                                    Rem: <span className="text-indigo-600 font-bold">{token.rest_remaining}</span> / {token.rest_limit}
                                                </div>
                                                <div className="text-[9px] text-slate-400 mt-1 uppercase tracking-tighter">
                                                    RESET: {token.rest_reset}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden h-fit">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                                <Database className="w-5 h-5 text-indigo-600" /> Serper.dev (Google Search)
                            </h2>
                        </div>
                        <div className="p-8">
                            {loading && !data ? (
                                <div className="py-10 text-center text-slate-400">Loading credits...</div>
                            ) : (
                                <div className="text-center py-6">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Available Credits</span>
                                    <div className="text-5xl font-black text-slate-900 mb-4">{data?.serper_api.remaining_credits}</div>
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${data?.serper_api.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                        {data?.serper_api.status === 'ACTIVE' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                        {data?.serper_api.status}
                                    </div>
                                    <p className="mt-6 text-sm text-slate-500 leading-relaxed">
                                        Used for real-time fact checking and source gathering. Each search consumes 1 credit.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-12 p-6 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <h3 className="text-indigo-900 font-bold mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> System Note
                    </h3>
                    <p className="text-indigo-800 text-sm leading-relaxed">
                        Requests are rotated automatically between active GitHub tokens. If a token reaches 0, the system will automatically switch to the next available one. Google Search is shared across all requests.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Limit;
