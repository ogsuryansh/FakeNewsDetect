import { useState, useEffect } from "react";
import { Search, Brain, ShieldCheck, AlertCircle, ExternalLink, Loader2, Info, ChevronRight, CheckCircle2 } from "lucide-react";

function Detect() {
  const [mode, setMode] = useState("article");
  const [input, setInput] = useState("");
  const [textBody, setTextBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [result, setResult] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

  const stages = [
    { text: "Scanning Google results...", icon: <Search className="w-5 h-5 text-indigo-600" /> },
    { text: "Model cross-referencing...", icon: <Brain className="w-5 h-5 text-purple-600" /> },
    { text: "Verifying credentials...", icon: <ShieldCheck className="w-5 h-5 text-emerald-600" /> },
    { text: "Compiling report...", icon: <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" /> }
  ];

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStage((prev) => (prev < 3 ? prev + 1 : prev));
      }, 1500);
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

      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: "Service unavailable. Verify backend connection." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col items-center py-16 px-6 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[40rem] h-[40rem] bg-indigo-100/50 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[0%] right-[-5%] w-[35rem] h-[35rem] bg-rose-100/50 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-5xl z-10">
        <header className="text-center mb-16 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 mb-6 font-bold shadow-sm">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[0.75rem] uppercase tracking-wider">Enterprise Intelligence Node</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight mb-6">
            Verify with <span className="text-indigo-600">Confidence.</span>
          </h1>
          <p className="text-slate-700 text-lg md:text-xl font-semibold max-w-2xl mx-auto leading-relaxed">
            Harnessing GPT-4o and real-time Search results to provide definitive clarity on global inquiries.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          {/* Input Panel */}
          <section className="lg:col-span-5 bg-white rounded-[2rem] p-8 shadow-2xl border border-slate-200">
            <div className="flex p-1.5 bg-slate-100 rounded-2xl mb-8 border border-slate-200">
              {["article", "url"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${mode === m ? "bg-white text-indigo-700 shadow-md scale-[1.02]" : "text-slate-500 hover:text-slate-800"
                    }`}
                >
                  {m.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[0.75rem] font-black uppercase text-slate-700 tracking-widest px-1">Headlines / Context</label>
                <input
                  type="text"
                  placeholder={mode === "url" ? "https://example.com/source" : "Enter news headline..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-400 focus:shadow-lg outline-none transition-all text-slate-900 placeholder:text-slate-500 font-bold"
                />
              </div>

              {mode === "article" && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[0.75rem] font-black uppercase text-slate-700 tracking-widest px-1">Full Content</label>
                  <textarea
                    placeholder="Paste the full body text..."
                    value={textBody}
                    onChange={(e) => setTextBody(e.target.value)}
                    rows="6"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-400 focus:shadow-lg outline-none transition-all text-slate-900 placeholder:text-slate-500 font-bold resize-none"
                  />
                </div>
              )}

              <button
                onClick={handlePredict}
                disabled={loading}
                className={`w-full py-5 rounded-2xl font-black text-white text-lg tracking-wider shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${loading ? "bg-slate-400 shadow-none cursor-not-allowed" : "bg-indigo-600 hover:bg-slate-900 shadow-indigo-200"
                  }`}
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <span>START AUDIT</span>
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            {loading && (
              <div className="mt-10 p-6 bg-indigo-50 rounded-2xl border-2 border-indigo-100 animate-in fade-in duration-500">
                <div className="flex items-center gap-3 text-indigo-700 mb-4">
                  {stages[loadingStage].icon}
                  <span className="text-[0.8rem] font-black uppercase tracking-widest">{stages[loadingStage].text}</span>
                </div>
                <div className="h-2.5 w-full bg-indigo-200 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-1000 shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                    style={{ width: `${(loadingStage + 1) * 25}%` }}
                  />
                </div>
              </div>
            )}
          </section>

          {/* Result Panel */}
          <section className="lg:col-span-7 flex flex-col">
            {!result && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-300 p-12 text-center shadow-lg">
                <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-8 border border-indigo-100">
                  <Info className="w-10 h-10 text-indigo-500" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4">Awaiting Data</h3>
                <p className="text-slate-600 text-lg font-bold max-w-sm mx-auto">Input a headline or URL to begin the automated fact-checking protocol.</p>
              </div>
            )}

            {result && !loading && (
              <div className="flex-1 bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 fade-in duration-700">
                {result.error ? (
                  <div className="p-16 text-center">
                    <AlertCircle className="w-20 h-20 text-rose-600 mx-auto mb-8" />
                    <p className="text-slate-900 text-2xl font-black">{result.error}</p>
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    {/* Verdict Banner */}
                    <div className={`p-10 flex items-center justify-between border-b ${result.prediction === "REAL" ? "bg-emerald-50 border-emerald-100" :
                        result.prediction === "FAKE" ? "bg-rose-50 border-rose-100" : "bg-amber-50 border-amber-100"
                      }`}>
                      <div className="space-y-3">
                        <span className="text-[0.8rem] font-black uppercase tracking-[0.25em] text-slate-500">Audit Status</span>
                        <div className="flex items-center gap-4">
                          <h2 className={`text-6xl md:text-7xl font-black tracking-tighter ${result.prediction === "REAL" ? "text-emerald-700" :
                              result.prediction === "FAKE" ? "text-rose-700" : "text-amber-700"
                            }`}>{result.prediction}</h2>
                          {result.prediction === "REAL" && <CheckCircle2 className="w-12 h-12 text-emerald-600" />}
                        </div>
                      </div>
                      <div className="px-10 py-6 bg-white rounded-3xl border-2 border-white/80 text-right shadow-xl">
                        <span className="text-[0.8rem] font-black uppercase tracking-[0.2em] text-slate-500 block mb-1">Confidence</span>
                        <span className="text-5xl font-black text-slate-900">{result.confidence}%</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-12 space-y-12">
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-indigo-100 rounded-lg">
                            <Brain className="w-5 h-5 text-indigo-700" />
                          </div>
                          <h4 className="text-[0.85rem] font-black uppercase tracking-widest text-slate-900">Evidence Analysis</h4>
                        </div>
                        <p className="text-2xl text-slate-800 font-bold leading-relaxed px-2 border-l-4 border-indigo-200">
                          {result.explanation}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-8 rounded-3xl bg-slate-50 border-2 border-slate-100 group hover:border-indigo-300 transition-all shadow-sm hover:shadow-md">
                          <span className="text-[0.75rem] font-black uppercase tracking-widest text-slate-500 block mb-4">Linguistic Patterns</span>
                          <span className={`text-xl font-black ${result.style_analysis === "REAL" ? "text-slate-900" : "text-rose-700"}`}>
                            {result.style_analysis === "REAL" ? "Highly Reliable" : "Sensationalist"}
                          </span>
                        </div>
                        <div className="p-8 rounded-3xl bg-slate-50 border-2 border-slate-100 shadow-sm">
                          <span className="text-[0.75rem] font-black uppercase tracking-widest text-slate-500 block mb-4">Verification Layer</span>
                          <span className="text-xl font-black text-indigo-800">Advanced GPT-4o</span>
                        </div>
                      </div>

                      {result.sources && result.sources.length > 0 && (
                        <div className="pt-8 border-t-2 border-slate-100">
                          <h4 className="text-[0.85rem] font-black uppercase tracking-widest text-slate-900 mb-8">Verified Sources</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {result.sources.map((src, idx) => (
                              <a
                                key={idx}
                                href={src}
                                target="_blank"
                                className="group flex items-center justify-between p-5 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-2xl hover:shadow-indigo-100 border-2 border-transparent hover:border-indigo-100 transition-all"
                              >
                                <span className="text-sm font-black text-slate-700 group-hover:text-indigo-800 truncate max-w-[150px]">
                                  {new URL(src).hostname}
                                </span>
                                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:scale-125 transition-all" />
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
          </section>
        </main>
      </div>
    </div>
  );
}

export default Detect;
