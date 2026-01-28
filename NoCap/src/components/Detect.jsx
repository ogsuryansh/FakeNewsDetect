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
    { text: "Scanning Google results...", icon: <Search className="w-5 h-5 text-indigo-500" /> },
    { text: "Model cross-referencing...", icon: <Brain className="w-5 h-5 text-purple-500" /> },
    { text: "Verifying credentials...", icon: <ShieldCheck className="w-5 h-5 text-emerald-500" /> },
    { text: "Compiling report...", icon: <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" /> }
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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center py-16 px-6 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[40rem] h-[40rem] bg-indigo-50 rounded-full blur-[100px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-[0%] right-[-5%] w-[35rem] h-[35rem] bg-rose-50 rounded-full blur-[100px] opacity-50 pointer-events-none" />

      <div className="w-full max-w-5xl z-10">
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 mb-6 scale-95">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[0.7rem] font-black uppercase tracking-[0.15em]">Official Intelligence Node</span>
          </div>
          <h1 className="text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
            Verify with <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-rose-500">Confidence.</span>
          </h1>
          <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
            Harnessing GPT-4o and real-time Google Search to provide definitive clarity on global inquiries.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Input Panel */}
          <section className="lg:col-span-5 bg-white rounded-[2rem] p-8 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] border border-slate-100 h-fit">
            <div className="flex p-1 bg-slate-50 rounded-2xl mb-8">
              {["article", "url"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${mode === m ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    }`}
                >
                  {m.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[0.65rem] font-black uppercase text-slate-400 tracking-widest px-1">Headlines / Context</label>
                <input
                  type="text"
                  placeholder={mode === "url" ? "https://example.com/source" : "Enter news headline..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 focus:shadow-sm outline-none transition-all text-slate-800 placeholder:text-slate-300 font-medium"
                />
              </div>

              {mode === "article" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[0.65rem] font-black uppercase text-slate-400 tracking-widest px-1">Full Content</label>
                  <textarea
                    placeholder="Paste the full body text..."
                    value={textBody}
                    onChange={(e) => setTextBody(e.target.value)}
                    rows="5"
                    className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 focus:shadow-sm outline-none transition-all text-slate-800 placeholder:text-slate-300 font-medium resize-none"
                  />
                </div>
              )}

              <button
                onClick={handlePredict}
                disabled={loading}
                className={`w-full py-4 rounded-2xl font-black text-white text-md tracking-wider shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${loading ? "bg-slate-300 shadow-none cursor-not-allowed" : "bg-slate-900 hover:bg-indigo-600 shadow-indigo-100"
                  }`}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin opacity-50" />
                ) : (
                  <>
                    <span>START AUDIT</span>
                    <ChevronRight className="w-4 h-4 opacity-30" />
                  </>
                )}
              </button>
            </div>

            {loading && (
              <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 animate-in fade-in duration-500">
                <div className="flex items-center gap-3 text-indigo-600 mb-4">
                  {stages[loadingStage].icon}
                  <span className="text-xs font-black uppercase tracking-widest">{stages[loadingStage].text}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-1000"
                    style={{ width: `${(loadingStage + 1) * 25}%` }}
                  />
                </div>
              </div>
            )}
          </section>

          {/* Result Panel */}
          <section className="lg:col-span-7 h-full">
            {!result && !loading && (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <Info className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Awaiting Data</h3>
                <p className="text-slate-400 text-sm max-w-xs mx-auto">Input a headline or URL to begin the automated fact-checking protocol.</p>
              </div>
            )}

            {result && !loading && (
              <div className="bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden animate-in zoom-in-95 fade-in duration-700">
                {result.error ? (
                  <div className="p-12 text-center">
                    <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-6" />
                    <p className="text-slate-900 font-bold">{result.error}</p>
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    {/* Verdict Banner */}
                    <div className={`p-10 flex items-center justify-between ${result.prediction === "REAL" ? "bg-emerald-50" :
                        result.prediction === "FAKE" ? "bg-rose-50" : "bg-amber-50"
                      }`}>
                      <div className="space-y-2">
                        <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-400">Audit Status</span>
                        <div className="flex items-center gap-4">
                          <h2 className={`text-6xl font-black tracking-tighter ${result.prediction === "REAL" ? "text-emerald-600" :
                              result.prediction === "FAKE" ? "text-rose-600" : "text-amber-600"
                            }`}>{result.prediction}</h2>
                          {result.prediction === "REAL" && <CheckCircle2 className="w-10 h-10 text-emerald-500 opacity-50" />}
                        </div>
                      </div>
                      <div className="px-8 py-4 bg-white rounded-3xl border border-white/50 text-right shadow-sm">
                        <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-300 block mb-1">Confidence</span>
                        <span className="text-4xl font-black text-slate-800">{result.confidence}%</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-10 space-y-10">
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Brain className="w-4 h-4 text-indigo-500" />
                          <h4 className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 underline decoration-indigo-100 underline-offset-8">AI Justification</h4>
                        </div>
                        <p className="text-xl text-slate-700 font-medium leading-[1.6]">
                          {result.explanation}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 group hover:border-indigo-100 transition-colors">
                          <span className="text-[0.6rem] font-black uppercase tracking-widest text-slate-300 block mb-3">Stylistic Bias</span>
                          <span className={`text-lg font-black ${result.style_analysis === "REAL" ? "text-slate-800" : "text-rose-500"}`}>
                            {result.style_analysis === "REAL" ? "High Reliability" : "Sensationalist"}
                          </span>
                        </div>
                        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                          <span className="text-[0.6rem] font-black uppercase tracking-widest text-slate-300 block mb-3">Verification Engine</span>
                          <span className="text-lg font-black text-indigo-600 italic">Advanced GPT-4o</span>
                        </div>
                      </div>

                      {result.sources && result.sources.length > 0 && (
                        <div className="pt-6 border-t border-slate-100">
                          <h4 className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 mb-6">Cross-Check Sources</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {result.sources.map((src, idx) => (
                              <a
                                key={idx}
                                href={src}
                                target="_blank"
                                className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-lg hover:shadow-slate-100 border border-transparent hover:border-slate-100 transition-all"
                              >
                                <span className="text-xs font-bold text-slate-500 group-hover:text-indigo-600 truncate max-w-[120px]">
                                  {new URL(src).hostname}
                                </span>
                                <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-indigo-400 transition-colors" />
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
