import { FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  Play,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import {
  clearPreviewSession,
  isPreviewSessionActive,
  persistPreviewSession,
  verifyPreviewPassword,
} from "./auth";

declare global {
  interface Window {
    __qxCandleConsole?: boolean;
    qxUninstall?: () => void;
  }
}

interface Candle {
  o: number;
  c: number;
  h: number;
  l: number;
}

const INITIAL_CANDLES: Candle[] = [
  { o: 128.86, c: 128.79, h: 128.89, l: 128.76 },
  { o: 128.79, c: 128.83, h: 128.85, l: 128.77 },
  { o: 128.83, c: 128.81, h: 128.86, l: 128.78 },
  { o: 128.81, c: 128.76, h: 128.83, l: 128.73 },
  { o: 128.76, c: 128.82, h: 128.84, l: 128.75 },
  { o: 128.82, c: 128.78, h: 128.84, l: 128.76 },
  { o: 128.78, c: 128.75, h: 128.8, l: 128.72 },
  { o: 128.75, c: 128.84, h: 128.87, l: 128.74 },
  { o: 128.84, c: 128.8, h: 128.85, l: 128.78 },
  { o: 128.8, c: 128.74, h: 128.81, l: 128.72 },
  { o: 128.74, c: 128.79, h: 128.81, l: 128.73 },
  { o: 128.79, c: 128.735, h: 128.8, l: 128.715 },
];

class SimQuoteSocket extends EventTarget {
  __tpSimSocket = true;
  readyState = 1;
  url = "wss://ws.tradepilot-sim.local/socket.io/?EIO=3&transport=websocket";
}

export default function App() {
  const [unlocked, setUnlocked] = useState<boolean>(() => isPreviewSessionActive());
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  const [loaderCode, setLoaderCode] = useState<string>("");
  const [loaderMounted, setLoaderMounted] = useState(false);
  const [candles, setCandles] = useState<Candle[]>(INITIAL_CANDLES);
  const [liveQuote, setLiveQuote] = useState<number>(128.735);
  const [activeSide, setActiveSide] = useState<"BUY" | "SELL" | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>(
    "Launch loader.js, verify a license (1 device bound), then test BUY or SELL."
  );

  const simSocketRef = useRef<SimQuoteSocket | null>(null);
  const basePriceRef = useRef<number>(128.735);
  const tradeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!unlocked) return;
    let active = true;
    fetch("/loader.js", { cache: "no-store" })
      .then((r) => r.text())
      .then((txt) => {
        if (active) setLoaderCode(txt);
      })
      .catch(() => {
        if (active) setStatusMessage("Could not load /loader.js build.");
      });
    return () => {
      active = false;
    };
  }, [unlocked]);

  useEffect(() => {
    if (!unlocked) return;
    const timer = window.setInterval(() => {
      setLoaderMounted(Boolean(window.__qxCandleConsole));
    }, 400);
    return () => window.clearInterval(timer);
  }, [unlocked]);

  useEffect(() => {
    if (!unlocked) return;
    const sock = new SimQuoteSocket();
    simSocketRef.current = sock;

    const onQuoteMsg = (ev: Event) => {
      const msgEv = ev as MessageEvent<string>;
      const raw = msgEv.data;
      if (typeof raw !== "string") return;
      const m = /^\d+(\[.*\])$/.exec(raw);
      if (!m) return;
      try {
        const arr = JSON.parse(m[1]);
        if (arr[0] === "quotes/stream" && Array.isArray(arr[1]) && Array.isArray(arr[1][0])) {
          const price = Number(arr[1][0][2]);
          if (Number.isFinite(price)) {
            setLiveQuote(price);
            setCandles((prev) => {
              const next = [...prev];
              const last = { ...next[next.length - 1] };
              last.c = price;
              if (price > last.h) last.h = price;
              if (price < last.l) last.l = price;
              next[next.length - 1] = last;
              return next;
            });
          }
        }
      } catch {
        // ignore parse errors
      }
    };

    sock.addEventListener("message", onQuoteMsg);

    const tickInterval = window.setInterval(() => {
      const jitter = (Math.random() - 0.5) * 0.008;
      basePriceRef.current = Number((basePriceRef.current + jitter).toFixed(3));
      const nowSec = (Date.now() / 1000).toFixed(3);
      const payload = `42["quotes/stream",[["USD/BDT (OTC)",${nowSec},${basePriceRef.current}]]]`;
      sock.dispatchEvent(new MessageEvent("message", { data: payload }));
    }, 420);

    return () => {
      window.clearInterval(tickInterval);
      sock.removeEventListener("message", onQuoteMsg);
      if (tradeTimerRef.current) window.clearTimeout(tradeTimerRef.current);
    };
  }, [unlocked]);

  const handleUnlockSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (authBusy) return;
    const candidate = passwordInput.trim();
    if (!candidate) {
      setAuthError("Please enter the access password.");
      return;
    }
    setAuthBusy(true);
    setAuthError("");
    try {
      const ok = await verifyPreviewPassword(candidate);
      if (!ok) {
        setAuthError("Access Denied — Incorrect password.");
        return;
      }
      persistPreviewSession();
      setPasswordInput("");
      setUnlocked(true);
    } finally {
      setAuthBusy(false);
    }
  };

  const handleLockPreview = () => {
    if (window.qxUninstall) {
      window.qxUninstall();
    }
    const existing = document.getElementById("tp-live-loader-script");
    if (existing) existing.remove();
    clearPreviewSession();
    setLoaderCode("");
    setLoaderMounted(false);
    setActiveSide(null);
    setUnlocked(false);
  };

  const launchLoaderPopup = () => {
    if (window.qxUninstall) {
      window.qxUninstall();
    }
    const existing = document.getElementById("tp-live-loader-script");
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.id = "tp-live-loader-script";
    script.src = `/loader.js?t=${Date.now()}`;
    script.onload = () => {
      setLoaderMounted(true);
      setStatusMessage("Multi-layer Base64 loader.js injected — TradePilot Guard popup active.");
    };
    script.onerror = () => {
      setStatusMessage("Failed to inject /loader.js.");
    };
    document.body.appendChild(script);
  };

  const resetLoader = () => {
    if (window.qxUninstall) {
      window.qxUninstall();
    }
    const existing = document.getElementById("tp-live-loader-script");
    if (existing) existing.remove();
    setLoaderMounted(false);
    setActiveSide(null);
    setCandles(INITIAL_CANDLES);
    basePriceRef.current = 128.735;
    setLiveQuote(128.735);
    setStatusMessage("Uninstalled via qxUninstall(). Click Launch Popup to test again.");
  };

  const triggerSimulatedTrade = (side: "BUY" | "SELL") => {
    setActiveSide(side);
    if (tradeTimerRef.current) window.clearTimeout(tradeTimerRef.current);
    tradeTimerRef.current = window.setTimeout(() => setActiveSide(null), 5800);
    setStatusMessage(
      side === "BUY"
        ? "BUY triggered — running candle rises ~1–2 inches above entry when verified."
        : "SELL triggered — running candle drops ~1–2 inches below entry when verified."
    );
  };

  const downloadFile = () => {
    if (!loaderCode) return;
    const blob = new Blob([loaderCode], { type: "application/javascript;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "loader.js";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#040913] text-slate-100 flex items-center justify-center p-5 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 25% 20%, rgba(14,165,233,0.18), transparent 42%), radial-gradient(circle at 78% 82%, rgba(16,185,129,0.12), transparent 44%)",
          }}
        />
        <form
          onSubmit={handleUnlockSubmit}
          className="relative w-full max-w-[350px] rounded-[22px] overflow-hidden border border-sky-200/25 bg-gradient-to-br from-[#162b4d]/80 via-[#0a172e]/90 to-[#050d1c]/95 backdrop-blur-2xl shadow-[0_28px_64px_rgba(0,0,0,0.78),inset_0_1px_1px_rgba(255,255,255,0.22)] p-6 space-y-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl overflow-hidden border border-sky-300/40 bg-slate-950 shrink-0 shadow-[0_6px_16px_rgba(34,211,238,0.2)]">
              <img
                src="/assets/aistudio/file_000000007b2c820aa590b734c3908bdc_8d5171c0.png"
                alt="TradePilot Guard"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-white">
                  TradePilot <span className="text-sky-400">Guard</span>
                </h1>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-rose-600 text-white">
                  LOCKED
                </span>
              </div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-sky-300/80 mt-0.5">
                Protected Preview Gate
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-700/60 bg-slate-950/70 px-3.5 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Lock className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Password Required</span>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300">
              SHA-256
            </span>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="preview-pass-input"
              className="block text-[10px] font-mono uppercase tracking-widest text-slate-400"
            >
              Access Password
            </label>
            <div className="relative">
              <input
                id="preview-pass-input"
                type={showPassword ? "text" : "password"}
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (authError) setAuthError("");
                }}
                placeholder="Enter access password"
                autoFocus
                autoComplete="off"
                className="w-full h-11 pl-3.5 pr-10 rounded-xl bg-[#040a16]/90 border border-slate-700/80 text-sm font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 shadow-[inset_0_3px_8px_rgba(0,0,0,0.65)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-sky-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {authError ? (
            <div className="rounded-xl border border-rose-500/40 bg-rose-950/60 px-3 py-2 text-xs font-semibold text-rose-200 text-center">
              {authError}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={authBusy}
            className="w-full h-11 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-950 bg-gradient-to-b from-cyan-300 via-cyan-400 to-sky-600 border-t border-white/75 shadow-[0_4px_0_#0369a1,0_10px_22px_rgba(6,182,212,0.42)] hover:brightness-105 active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-70"
          >
            {authBusy ? "Verifying..." : "Unlock Preview"}
          </button>
        </form>
      </div>
    );
  }

  const allValues = candles.flatMap((c) => [c.h, c.l]);
  const minPrice = Math.min(128.7, ...allValues) - 0.015;
  const maxPrice = Math.max(128.91, ...allValues) + 0.015;
  const toY = (p: number) => 220 - ((p - minPrice) / Math.max(0.001, maxPrice - minPrice)) * 180;

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-slate-800/80 bg-[#070f1c]/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
            <img
              src="/assets/aistudio/file_000000007b2c820aa590b734c3908bdc_8d5171c0.png"
              alt="TradePilot Guard"
              className="w-8 h-8 rounded-lg object-cover border border-cyan-400/40"
            />
            <span className="text-base font-extrabold tracking-tight text-white">
              TradePilot <span className="text-cyan-400">Guard</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <a href="#preview" className="hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0">
              Live Testbed
            </a>
            <a href="#workflow" className="hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0">
              Security &amp; Bias
            </a>
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={launchLoaderPopup}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Popup</span>
            </button>
            <button
              type="button"
              onClick={handleLockPreview}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Interactive Preview Section */}
        <section id="preview" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-[#08111f] p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                    Chart Canvas Environment
                  </p>
                  <h1 className="text-xl font-bold text-white mt-1">
                    USD/BDT (OTC) · Running Candle Testbed
                  </h1>
                </div>
                <span className="text-xs font-mono tabular-nums text-cyan-300">
                  Quote {liveQuote.toFixed(3)}
                </span>
              </div>

              {/* Simulated Chart Canvas */}
              <div className="rounded-xl border border-slate-800/90 bg-[#050c17] p-4 overflow-hidden">
                <svg viewBox="0 0 600 240" className="w-full h-56">
                  {[60, 110, 160, 210].map((y) => (
                    <line
                      key={y}
                      x1="0"
                      y1={y}
                      x2="545"
                      y2={y}
                      stroke="rgba(148,163,184,0.1)"
                      strokeDasharray="3 3"
                    />
                  ))}
                  <line
                    x1="496"
                    y1="10"
                    x2="496"
                    y2="230"
                    stroke="rgba(255,255,255,0.22)"
                    strokeDasharray="4 4"
                  />
                  {candles.map((c, idx) => {
                    const x = 34 + idx * 42;
                    const bullish = c.c >= c.o;
                    const color = bullish ? "#22c55e" : "#ef4444";
                    const top = toY(Math.max(c.o, c.c));
                    const bottom = toY(Math.min(c.o, c.c));
                    const height = Math.max(6, bottom - top);
                    return (
                      <g key={idx}>
                        <line
                          x1={x}
                          y1={toY(c.h)}
                          x2={x}
                          y2={toY(c.l)}
                          stroke={color}
                          strokeWidth="2"
                        />
                        <rect
                          x={x - 9}
                          y={top}
                          width="18"
                          height={height}
                          rx="2"
                          fill={color}
                        />
                      </g>
                    );
                  })}
                  <line
                    x1="0"
                    y1={toY(liveQuote)}
                    x2="545"
                    y2={toY(liveQuote)}
                    stroke="rgba(34,211,238,0.45)"
                    strokeDasharray="2 3"
                  />
                  <text x="552" y="54" fill="#94a3b8" fontSize="11" fontFamily="JetBrains Mono">
                    {maxPrice.toFixed(3)}
                  </text>
                  <text x="552" y="130" fill="#94a3b8" fontSize="11" fontFamily="JetBrains Mono">
                    {((maxPrice + minPrice) / 2).toFixed(3)}
                  </text>
                  <text
                    x="552"
                    y={Math.min(228, Math.max(24, toY(liveQuote) + 4))}
                    fill="#22d3ee"
                    fontSize="11"
                    fontFamily="JetBrains Mono"
                  >
                    {liveQuote.toFixed(3)}
                  </text>
                </svg>
              </div>

              {/* Simulated Quotex Trade Buttons (#trade-button-up / #trade-button-down) */}
              <div id="trade-button" className="mt-4 grid grid-cols-2 gap-3">
                <button
                  id="trade-button-up"
                  type="button"
                  onClick={() => triggerSimulatedTrade("BUY")}
                  className={`inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider border transition-all cursor-pointer ${
                    activeSide === "BUY"
                      ? "bg-emerald-500 text-slate-950 border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.45)]"
                      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>BUY (UP)</span>
                </button>
                <button
                  id="trade-button-down"
                  type="button"
                  onClick={() => triggerSimulatedTrade("SELL")}
                  className={`inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider border transition-all cursor-pointer ${
                    activeSide === "SELL"
                      ? "bg-rose-500 text-white border-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.45)]"
                      : "bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30"
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4" />
                  <span>SELL (DOWN)</span>
                </button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-400">{statusMessage}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={launchLoaderPopup}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/35 hover:bg-cyan-500/25 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{loaderMounted ? "Reload Popup" : "Launch loader.js"}</span>
                </button>
                <button
                  type="button"
                  onClick={resetLoader}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Uninstall</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Summary Card */}
          <div
            id="workflow"
            className="lg:col-span-5 rounded-2xl border border-slate-800 bg-[#08111f] p-5 flex flex-col justify-between space-y-5"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-cyan-400">
                <ShieldCheck className="w-5 h-5" />
                <h2 className="text-base font-bold text-white">
                  TradePilot Guard · Security
                </h2>
              </div>

              <div className="space-y-2.5 text-sm text-slate-300 leading-relaxed">
                <div className="py-2 border-b border-slate-800/80 flex items-center justify-between gap-4">
                  <span className="text-slate-400">Preview Lock</span>
                  <span className="text-emerald-400 font-medium">Salted SHA-256 Gate</span>
                </div>
                <div className="py-2 border-b border-slate-800/80 flex items-center justify-between gap-4">
                  <span className="text-slate-400">BUY / SELL Range</span>
                  <span className="text-emerald-400 font-medium">Bounded ~1–2 in cap</span>
                </div>
                <div className="py-2 border-b border-slate-800/80 flex items-center justify-between gap-4">
                  <span className="text-slate-400">Device Binding</span>
                  <span className="text-amber-300 font-medium">1 License = 1 Device</span>
                </div>
                <div className="py-2 border-b border-slate-800/80 flex items-center justify-between gap-4">
                  <span className="text-slate-400">2nd Device Status</span>
                  <span className="font-mono text-xs text-rose-400">Device Limit Restricted</span>
                </div>
                <div className="py-2 border-b border-slate-800/80 flex items-center justify-between gap-4">
                  <span className="text-slate-400">loader.js Protection</span>
                  <span className="inline-flex items-center gap-1.5 text-cyan-300 font-mono text-xs">
                    <Lock className="w-3.5 h-3.5" />
                    Minified + XOR + Base64
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#050b14] p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono text-cyan-300">Cache-Busted Short JS Loader</span>
                  <button
                    type="button"
                    onClick={async () => {
                      const snippet = `javascript:(()=>{fetch("${window.location.origin}/loader.js?t="+Date.now(),{cache:"no-store"}).then(r=>r.text()).then(eval)})();`;
                      try {
                        await navigator.clipboard.writeText(snippet);
                        setStatusMessage("Copied cache-busted short JS loader!");
                      } catch {
                        setStatusMessage("Copy from the snippet box below.");
                      }
                    }}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 cursor-pointer"
                  >
                    Copy Short JS
                  </button>
                </div>
                <code className="block text-[11px] font-mono text-slate-400 break-all select-all">
                  {`javascript:(()=>{fetch("${typeof window !== "undefined" ? window.location.origin : ""}/loader.js?t="+Date.now(),{cache:"no-store"}).then(r=>r.text()).then(eval)})();`}
                </code>
              </div>

              <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3 text-xs text-slate-300 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>
                    <strong className="text-white font-mono">loader.js</strong> hardened build (
                    {loaderCode ? `${Math.round(loaderCode.length / 1024)} KB` : "..."})
                  </span>
                </div>
                <span className="font-mono text-[11px] text-emerald-400 shrink-0">READY</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-2">
              <button
                type="button"
                onClick={downloadFile}
                disabled={!loaderCode}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span>Download Protected loader.js</span>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
