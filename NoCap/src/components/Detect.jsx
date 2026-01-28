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
    { text: "Scanning global indices...", icon: <Search className="w-5 h-5 text-indigo-600" /> },
    { text: "GPT-4o Cross-Verification...", icon: <Brain className="w-5 h-5 text-purple-600" /> },
    { text: "Validating citations...", icon: <ShieldCheck className="w-5 h-5 text-emerald-600" /> },
    { text: "Generating audit report...", icon: <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" /> }
  ];

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStage((prev) => (prev < 3 ? prev + 1 : prev));
      }, 1200);
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
      setResult({ error: "Intelligence node timeout. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col items-center py-20 px-6 relative overflow-hidden font-jakarta">
      <div className="absolute top-[-10%] left-[-5%] w-[45rem] h-[45rem] bg-indigo-100/40 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[0%] right-[-5%] w-[40rem] h-[40rem] bg-rose-100/40 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      <div className="w-full max-w-6xl z-10">
        <header className="text-center mb-16 px-4">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border-2 border-indigo-100 text-indigo-700 mb-8 font-black shadow-xl hover:scale-105 transition-transform cursor-default">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[0.8rem] uppercase tracking-widest leading-none">Security Protocol Active</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-none mb-8">
            News <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-900">Auditor.</span>
          </h1>
          <p className="text-slate-600 text-xl md:text-2xl font-bold max-w-3xl mx-auto leading-relaxed opacity-90">
            Automated Fact-Checking powered by <span className="text-indigo-600">GPT-4o</span> and Global Search.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <section className="lg:col-span-5 bg-white rounded-[3rem] p-10 shadow-2xl border-4 border-white h-fit backdrop-blur-sm sticky top-10">
            <div className="flex p-2 bg-slate-100 rounded-3xl mb-10 border-2 border-slate-200/50">
              {["article", "url"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-4 text-sm font-black rounded-2xl transition-all duration-300 ${mode === m ? "bg-white text-indigo-600 shadow-xl scale-[1.03]" : "text-slate-400 hover:text-slate-700"
                    }`}
                >
                  {m.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between px-1">
                  <label className="text-[0.75rem] font-black uppercase text-slate-900 tracking-widest">Inquiry Source</label>
                  <span className="text-[0.7rem] text-indigo-400 font-bold uppercase tracking-widest">{mode} mode</span>
                </div>
                <input
                  type="text"
                  placeholder={mode === "url" ? "Enter URL here..." : "Enter headline..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.8rem] focus:bg-white focus:border-indigo-500 focus:shadow-2xl outline-none transition-all text-slate-900 placeholder:text-slate-400 font-bold text-lg"
                />
              </div>

              {mode === "article" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                  <label className="text-[0.75rem] font-black uppercase text-slate-900 tracking-widest px-1">Detailed Content</label>
                  <textarea
                    placeholder="Paste context for semantic analysis..."
                    value={textBody}
                    onChange={(e) => setTextBody(e.target.value)}
                    rows="6"
                    className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.8rem] focus:bg-white focus:border-indigo-500 focus:shadow-2xl outline-none transition-all text-slate-900 placeholder:text-slate-400 font-bold text-lg resize-none shadow-inner"
                  />
                </div>
              )}

              <button
                onClick={handlePredict}
                disabled={loading}
                className={`w-full py-6 rounded-[2rem] font-black text-white text-xl tracking-wider shadow-2xl transition-all active:scale-[0.97] flex items-center justify-center gap-4 group ${loading ? "bg-slate-300 shadow-none cursor-not-allowed" : "bg-indigo-600 hover:bg-slate-900 hover:shadow-indigo-300"
                  }`}
              >
                {loading ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <>
                    <span>INVOKE AUDIT</span>
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </section>

          <section className="lg:col-span-12 xl:col-span-7 min-h-[600px] flex flex-col">
            {!result && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center bg-white/60 rounded-[3.5rem] border-4 border-dashed border-slate-200 p-16 text-center shadow-inner backdrop-blur-md">
                <div className="w-24 h-24 bg-indigo-100 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-lg border-2 border-white">
                  <Info className="w-12 h-12 text-indigo-600" />
                </div>
                <h3 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">System Idle</h3>
                <p className="text-slate-500 text-xl font-bold max-w-sm mx-auto leading-relaxed">Submit an inquiry to initiate the cryptographic verification protocol.</p>
              </div>
            )}

            {loading && (
              <div className="flex-1 bg-white rounded-[3.5rem] p-16 flex flex-col items-center justify-center gap-12 shadow-2xl animate-in zoom-in-95 duration-500 border-4 border-white">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    {stages[loadingStage].icon}
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{stages[loadingStage].text}</h4>
                  <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.3em]">Processing Logic Layers</p>
                </div>
                <div className="w-full max-w-md h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner border-2 border-white">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-700 shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                    style={{ width: `${(loadingStage + 1) * 25}%` }}
                  />
                </div>
              </div>
            )}

            {result && !loading && (
              <div className="flex-1 bg-white rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-4 border-white overflow-hidden animate-in slide-in-from-bottom-12 duration-1000">
                {result.error ? (
                  <div className="p-20 text-center">
                    <AlertCircle className="w-24 h-24 text-rose-600 mx-auto mb-10" />
                    <p className="text-slate-900 text-3xl font-black">{result.error}</p>
                    <button onClick={() => setResult(null)} className="mt-8 text-indigo-600 font-black uppercase tracking-widest text-sm hover:underline">Reset System</button>
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    <div className={`p-12 border-b-4 border-slate-50 relative ${result.prediction === "REAL" ? "bg-emerald-50/70" :
                        result.prediction === "FAKE" ? "bg-rose-50/70" : "bg-amber-50/70"
                      }`}>
                      <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                        <div className="space-y-4">
                          <span className="text-[0.8rem] font-black uppercase tracking-[0.3em] text-slate-400">Audit Conclusion</span>
                          <div className="flex items-center gap-6">
                            <h2 className={`text-7xl md:text-9xl font-black tracking-tighter animate-pulse ${result.prediction === "REAL" ? "text-emerald-700" :
                                result.prediction === "FAKE" ? "text-rose-700" : "text-amber-700"
                              }`}>{result.verdict || result.prediction}</h2>
                            {(result.verdict === "REAL" || result.prediction === "REAL") && <CheckCircle2 className="w-16 h-16 text-emerald-600 hidden md:block" />}
                          </div>
                        </div>
                        <div className="px-12 py-8 bg-white/80 backdrop-blur-xl rounded-[2.5rem] border-4 border-white text-center shadow-2xl transform hover:scale-105 transition-transform">
                          <span className="text-[0.85rem] font-black uppercase tracking-[0.3em] text-slate-500 block mb-2">Confidence Level</span>
                          <span className="text-7xl font-black text-slate-900 tracking-tighter">{result.confidence}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-14 space-y-16">
                      <div className="relative">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="p-3 bg-indigo-600 rounded-2xl shadow-indigo-200 shadow-xl">
                            <Brain className="w-6 h-6 text-white" />
                          </div>
                          <h4 className="text-[0.9rem] font-black uppercase tracking-[0.2em] text-slate-900">Intelligence Brief</h4>
                        </div>
                        <p className="text-3xl text-slate-800 font-bold leading-tight tracking-tight pl-10 border-l-[6px] border-indigo-100 py-2">
                          {result.explanation}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="p-10 rounded-[2.5rem] bg-slate-50 border-4 border-white group hover:border-indigo-200 transition-all shadow-xl">
                          <span className="text-[0.8rem] font-black uppercase tracking-[0.2em] text-slate-400 block mb-4">ML Style Check</span>
                          <span className={`text-2xl font-black ${result.style_analysis === "REAL" ? "text-slate-900" : "text-rose-600"}`}>
                            {result.style_analysis === "REAL" ? "Journalistic Form" : "Clickbait Signal"}
                          </span>
                        </div>
                        <div className="p-10 rounded-[2.5rem] bg-slate-50 border-4 border-white shadow-xl">
                          <span className="text-[0.8rem] font-black uppercase tracking-[0.2em] text-slate-400 block mb-4">Kernel Layer</span>
                          <span className="text-2xl font-black text-indigo-800 italic">Advanced GPT-4o</span>
                        </div>
                      </div>

                      {result.sources && result.sources.length > 0 && (
                        <div className="pt-12 border-t-8 border-slate-50">
                          <h4 className="text-[1rem] font-black uppercase tracking-[0.3em] text-slate-900 mb-10">Verification Origins</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {result.sources.map((src, idx) => (
                              <a
                                key={idx}
                                href={src}
                                target="_blank"
                                className="group flex items-center justify-between p-7 rounded-[1.8rem] bg-slate-900 hover:bg-indigo-600 shadow-2xl transition-all hover:-translate-y-2"
                              >
                                <span className="text-sm font-black text-slate-100 group-hover:text-white truncate max-w-[200px]">
                                  {new URL(src).hostname}
                                </span>
                                <ExternalLink className="w-5 h-5 text-indigo-400 group-hover:text-white transition-all transform group-hover:rotate-12" />
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
