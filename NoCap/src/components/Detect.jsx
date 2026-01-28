import { useState, useEffect } from "react";
import { Search, Brain, ShieldCheck, AlertCircle, ExternalLink, Loader2, Info, CheckCircle2, Globe, FileText } from "lucide-react";

function Detect() {
  const [mode, setMode] = useState("url");
  const [input, setInput] = useState("");
  const [textBody, setTextBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [result, setResult] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

  const stages = [
    "Searching databases...",
    "Analyzing content...",
    "Verifying sources...",
    "Finalizing report..."
  ];

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStage((prev) => (prev < 3 ? prev + 1 : prev));
      }, 1000);
    } else {
      setLoadingStage(0);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handlePredict = async () => {
    if (!input.trim() && !textBody.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch(`${API_URL}/prediction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: input, text: textBody }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: "Connection error. Please verify the backend service is running." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 border-t-4 border-indigo-600">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        <header className="mb-12 border-b border-slate-100 pb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Information Verification</h1>
          <p className="text-slate-500 text-lg">AI-powered fact check and source analysis.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Input Section */}
          <div className="lg:col-span-12 xl:col-span-5 bg-slate-50 border border-slate-200 rounded-lg p-8 shadow-sm h-fit">
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setMode("url")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${mode === "url" ? "bg-indigo-600 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <Globe className="w-4 h-4" /> URL Link
              </button>
              <button
                onClick={() => setMode("article")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${mode === "article" ? "bg-indigo-600 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <FileText className="w-4 h-4" /> Full Text
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  {mode === "url" ? "Source URL" : "Headline"}
                </label>
                <input
                  type="text"
                  placeholder={mode === "url" ? "Paste news link here..." : "Enter the headline to check..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all"
                />
              </div>

              {mode === "article" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Article Content</label>
                  <textarea
                    placeholder="Paste the full content here for analysis..."
                    value={textBody}
                    onChange={(e) => setTextBody(e.target.value)}
                    rows="8"
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all resize-none font-sans"
                  />
                </div>
              )}

              <button
                onClick={handlePredict}
                disabled={loading}
                className={`w-full py-3 rounded-md font-bold text-sm tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 ${loading ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-slate-900 text-white hover:bg-black active:scale-[0.99]"
                  }`}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Information"}
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-12 xl:col-span-7">
            {!result && !loading && (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50 p-12 text-center">
                <Search className="w-12 h-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-1">Awaiting Data</h3>
                <p className="text-slate-500 text-sm">Submit a URL or text to begin analysis.</p>
              </div>
            )}

            {loading && (
              <div className="h-full bg-white border border-slate-200 rounded-lg p-16 flex flex-col items-center justify-center gap-8 shadow-sm">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-900 mb-2">{stages[loadingStage]}</p>
                  <p className="text-slate-400 text-xs uppercase tracking-widest">Cross-referencing with live data</p>
                </div>
                <div className="w-full max-w-sm h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${(loadingStage + 1) * 25}%` }}
                  />
                </div>
              </div>
            )}

            {result && !loading && (
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden animate-in fade-in duration-500">
                {result.error ? (
                  <div className="p-12 text-center text-rose-600 bg-rose-50/20">
                    <AlertCircle className="w-10 h-10 mx-auto mb-4" />
                    <p className="font-bold">{result.error}</p>
                  </div>
                ) : (
                  <div>
                    {/* Verdict Header */}
                    <div className={`px-10 py-8 border-b border-slate-100 flex items-center justify-between ${(result.verdict || result.prediction) === "REAL" ? "bg-emerald-50/20" :
                        (result.verdict || result.prediction) === "FAKE" ? "bg-rose-50/20" : "bg-amber-50/20"
                      }`}>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Analysis Result</span>
                        <div className="flex items-center gap-3">
                          <h2 className={`text-4xl font-bold tracking-tight ${(result.verdict || result.prediction) === "REAL" ? "text-emerald-700" :
                              (result.verdict || result.prediction) === "FAKE" ? "text-rose-700" : "text-amber-700"
                            }`}>{(result.verdict || result.prediction)}</h2>
                          {(result.verdict === "REAL" || result.prediction === "REAL") ?
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" /> :
                            <AlertCircle className="w-6 h-6 text-rose-600" />}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Confidence</span>
                        <div className="text-2xl font-bold text-slate-900">{result.confidence}%</div>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-indigo-600" style={{ width: `${result.confidence}%` }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Analysis */}
                    <div className="p-10">
                      <div className="mb-10">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                          <Brain className="w-4 h-4 text-indigo-600" /> Reasoning and Evidence
                        </h4>
                        <p className="text-slate-700 leading-relaxed text-lg border-l-2 border-slate-200 pl-6">
                          {result.explanation}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-6 mb-10">
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-md">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Writing Style</span>
                          <span className="font-bold text-slate-900">
                            {result.style_analysis === "REAL" ? "Journalistic" : "Sensationalist"}
                          </span>
                        </div>
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-md">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Audit Level</span>
                          <span className="font-bold text-indigo-700">Deep AI Verification</span>
                        </div>
                      </div>

                      {result.sources && result.sources.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Referenced Sources</h4>
                          <div className="space-y-3">
                            {result.sources.map((src, i) => (
                              <a
                                key={i}
                                href={src}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors"
                              >
                                <span className="text-sm font-medium text-slate-700 truncate max-w-[280px]">
                                  {new URL(src).hostname}
                                </span>
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Detect;
