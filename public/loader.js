/* =====================================================================
   TradePilot Compounding Bot — Loader সংস্করণ (Supabase License Gate)
   ---------------------------------------------------------------------
   প্রথমে লোড হওয়ার পর Glassmorphism + Soft 3D Bevel পপআপ দেখায়।
   Supabase (ishak_licenses) থেকে License Key ও মেয়াদ যাচাই করে:
   - ম্যাচ না করলে / নিষ্ক্রিয় হলে / মেয়াদ শেষ হলে → Access Denied
   - যাচাই সফল হলে → সরাসরি মূল ওয়ার্কফ্লো (Candle engine + AI glow + Profit orb) শুরু হয়
   - অন্য কোনো পপআপ বা Trader ID বাধা থাকবে না
   - মেয়াদ শেষ হওয়ার সাথে সাথে বট স্বয়ংক্রিয়ভাবে বন্ধ হয়ে যায়

   বন্ধ: qxUninstall()
   ===================================================================== */
(() => {
  "use strict";
  if (window.__qxCandleConsole) return;
  window.__qxCandleConsole = true;

  const STORE_KEY = "qxCandleRoundUi";
  const LICENSE_STORE_KEY = "tp_compounding_license_v1";
  const SUPABASE_URL = "https://qbazzarqiplrqqfytajz.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiYXp6YXJxaXBscnFxZnl0YWp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NDc4NDUsImV4cCI6MjEwNDMyMzg0NX0.7BPbYW6P50Nh3OrkQU_T1GOwib-iKNUhLFoc1GxiNZo";
  const SUPABASE_TABLES = ["ishak_licenses", "ishak_licences"];

  const TP_LOGO_DATA_URI =
    "data:image/webp;base64,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";

  const decoder = new TextDecoder();
  let qxEngineLive = false;
  let activeLicense = null;
  let licenseWatchdogTimer = null;
  let lastRemoteCheckAt = 0;

  /* ===================================================================
     অংশ ১ — ডেটা ট্র্যাকিং (শুধু পড়া) + WS হুক
     =================================================================== */

  const state = {
    asset: null,
    assetSource: null,
    period: 60,
    periodSource: null,
    serverOffset: 0,
    lastTick: null,
    candle: null,
    history: [],
    ticks: 0,
    events: {},
    sockets: [],
  };
  let lastDataAt = 0;

  const countEvent = (name) => {
    state.events[name] = (state.events[name] || 0) + 1;
  };

  const setAsset = (asset, source) => {
    if (!asset || typeof asset !== "string") return;
    if (state.asset !== asset) {
      state.asset = asset;
      state.candle = null;
      state.history = [];
    }
    state.assetSource = source;
  };

  const setPeriod = (period, source) => {
    const p = Number(period);
    if (!p || p < 1 || p > 86400) return;
    if (state.periodSource === "user" && source !== "user") return;
    if (state.period !== p) {
      state.period = p;
      state.candle = null;
      state.history = [];
    }
    state.periodSource = source;
  };

  const onTick = (asset, time, price) => {
    if (typeof asset !== "string" || !isFinite(time) || !isFinite(price)) return;
    if (!state.asset) setAsset(asset, "first-tick");
    if (asset !== state.asset) return;

    state.ticks++;
    state.serverOffset = time - Date.now() / 1000;
    state.lastTick = { time, price };
    lastDataAt = Date.now();

    const start = Math.floor(time / state.period) * state.period;
    const c = state.candle;
    if (!c || c.start !== start) {
      if (c && start > c.start) {
        state.history.push({ start: c.start, open: c.open, close: c.close, high: c.high, low: c.low });
        if (state.history.length > 50) state.history.shift();
      }
      state.candle = { start, open: price, high: price, low: price, close: price, fromHistory: false };
    } else {
      c.close = price;
      if (price > c.high) c.high = price;
      if (price < c.low) c.low = price;
    }
  };

  const onHistory = (obj) => {
    if (!obj || typeof obj !== "object") return;
    if (obj.asset && !state.asset) setAsset(obj.asset, "history");
    if (obj.asset && obj.asset !== state.asset) return;
    if (obj.period) {
      setPeriod(obj.period, "history");
      if (Number(obj.period) !== state.period) return;
    }
    const candles = Array.isArray(obj.candles) ? obj.candles : null;
    if (!candles || !candles.length) return;

    const parsed = candles
      .filter((k) => Array.isArray(k) && k.length >= 5)
      .map((k) => ({ start: Number(k[0]), open: Number(k[1]), close: Number(k[2]), high: Number(k[3]), low: Number(k[4]) }))
      .filter((k) => isFinite(k.start) && isFinite(k.open))
      .sort((a, b) => a.start - b.start);
    if (!parsed.length) return;

    const last = parsed[parsed.length - 1];
    const nowServer = Date.now() / 1000 + state.serverOffset;
    const currentStart = Math.floor(nowServer / state.period) * state.period;

    const closed = parsed.filter((k) => k.start < currentStart);
    state.history = closed.slice(-50);
    if (last.start === currentStart) {
      state.candle = { ...last, fromHistory: true };
    }
    lastDataAt = Date.now();
  };

  const handlePayload = (data) => {
    if (Array.isArray(data)) {
      let handled = false;
      for (const row of data) {
        if (Array.isArray(row) && row.length >= 3 && typeof row[0] === "string" && typeof row[1] === "number" && typeof row[2] === "number") {
          onTick(row[0], row[1], row[2]);
          handled = true;
        }
      }
      if (handled) countEvent("quotes/stream");
      return;
    }
    if (data && typeof data === "object") {
      if (Array.isArray(data.candles)) {
        countEvent("history(candles)");
        onHistory(data);
      }
    }
  };

  const parseSocketIoText = (text) => {
    const m = /^\d+(?:-)?(?:\/[^,]*,)?(\d*)(\[.*)$/s.exec(text);
    if (!m) return null;
    try {
      const arr = JSON.parse(m[2]);
      if (Array.isArray(arr) && typeof arr[0] === "string") return { event: arr[0], data: arr[1] };
    } catch (_) {}
    return null;
  };

  const handleIncomingText = (text) => {
    if (text.length > 2 && (text[0] === "[" || text[0] === "{")) {
      try {
        handlePayload(JSON.parse(text));
      } catch (_) {}
      return;
    }
    const msg = parseSocketIoText(text);
    if (!msg) return;
    countEvent(msg.event);
    const d = msg.data;
    if (d && d._placeholder) return;
    if (msg.event === "quotes/stream") handlePayload(d);
    else if (/history/i.test(msg.event) || (d && Array.isArray(d.candles))) onHistory(d);
    else if (msg.event === "instruments/update" && d && d.asset) {
      setAsset(d.asset, "server");
      if (d.period) setPeriod(d.period, "server");
    }
  };

  const handleIncomingBinary = (buf) => {
    let bytes = new Uint8Array(buf);
    if (bytes.length && bytes[0] < 10) bytes = bytes.subarray(1);
    const text = decoder.decode(bytes);
    try {
      handlePayload(JSON.parse(text));
    } catch (_) {
      handleIncomingText(text);
    }
  };

  const handleOutgoing = (data) => {
    if (typeof data !== "string") return;
    const msg = parseSocketIoText(data);
    if (!msg) return;
    const d = msg.data;
    countEvent("→ " + msg.event);
    switch (msg.event) {
      case "instruments/update":
      case "chart_notification/get":
      case "history/load/line":
      case "instruments/follow":
        if (d && typeof d === "object") {
          if (d.asset) setAsset(d.asset, "client:" + msg.event);
          if (d.period) setPeriod(d.period, "client:" + msg.event);
        }
        break;
      case "depth/follow":
        if (typeof d === "string") setAsset(d, "client:depth/follow");
        break;
    }
  };

  const trackState = (raw) => {
    try {
      if (typeof raw === "string") handleIncomingText(raw);
      else if (raw instanceof ArrayBuffer) handleIncomingBinary(raw);
      else if (raw instanceof Blob) raw.arrayBuffer().then(handleIncomingBinary).catch(() => {});
    } catch (_) {}
  };

  const noteSocket = (url) => {
    try {
      const u = String(url).split("?")[0];
      if (state.sockets.indexOf(u) < 0) {
        state.sockets.push(u);
        if (state.sockets.length > 5) state.sockets.shift();
      }
    } catch (_) {}
  };

  /* --- ট্রেড বন্ধ (s_orders/close) — আসল জয়ের profit পড়ে orb দেখানো --- */
  const CLOSED_MAX = 500;
  const closedDeals = new Set();
  /** socket → placeholder-এর পরে আসা binary frame কোন event-এর */
  const binQueue = new WeakMap();

  const onOrdersClosed = (d) => {
    if (!d || !Array.isArray(d.deals)) return;
    let won = 0;
    for (const deal of d.deals) {
      if (!deal || deal.id == null) continue;
      const id = String(deal.id);
      if (closedDeals.has(id)) continue;
      closedDeals.add(id);
      if (closedDeals.size > CLOSED_MAX) closedDeals.delete(closedDeals.values().next().value);
      const profit = Number(deal.profit);
      if (isFinite(profit) && profit > 0.004) won += profit;
    }
    if (won > 0) showProfitOrb(Math.round(won * 1e4) / 1e4);
  };

  const trackDeals = (ws, raw) => {
    if (typeof raw === "string") {
      const ph = /^45(\d+)-(?:\/[^,]*,)?\d*\["([^"]+)"/.exec(raw);
      if (ph) {
        let q = binQueue.get(ws);
        if (!q) binQueue.set(ws, (q = []));
        for (let i = 0; i < Number(ph[1]); i++) q.push(ph[2]);
        return;
      }
      if (raw.indexOf("s_orders/close") < 0) return;
      const msg = parseSocketIoText(raw);
      if (msg && msg.event === "s_orders/close") onOrdersClosed(msg.data);
      return;
    }
    if (!(raw instanceof ArrayBuffer)) return;
    const q = binQueue.get(ws);
    const ev = q && q.length ? q.shift() : null;
    if (ev !== "s_orders/close") return;
    const bytes = new Uint8Array(raw);
    const off = bytes.length && bytes[0] < 10 ? 1 : 0;
    try {
      onOrdersClosed(JSON.parse(decoder.decode(bytes.subarray(off))));
    } catch (_) {}
  };

  /* --- হুক: চালু থাকা socket-ও ধরতে MessageEvent.data + send প্যাচ করি --- */
  const PROC = Symbol("qxProcessed");
  const nativeDataDesc = Object.getOwnPropertyDescriptor(MessageEvent.prototype, "data");
  const nativeGetData = nativeDataDesc.get;

  Object.defineProperty(MessageEvent.prototype, "data", {
    configurable: true,
    enumerable: nativeDataDesc.enumerable,
    get() {
      const raw = nativeGetData.call(this);
      // শুধু WebSocket থেকে আসা message ধরি (postMessage/worker বাদ)
      const tgt = this.currentTarget || this.target;
      if (!(tgt instanceof WebSocket) || !qxEngineLive || !isLicenseCurrentlyValid()) return raw;
      if (!this[PROC]) {
        this[PROC] = true;
        noteSocket(tgt.url);
        trackState(raw);
        try {
          trackDeals(tgt, raw);
        } catch (_) {}
      }
      return raw;
    },
  });

  const nativeSend = WebSocket.prototype.send;
  WebSocket.prototype.send = function (data) {
    try {
      handleOutgoing(data);
    } catch (_) {}
    return nativeSend.apply(this, arguments);
  };

  // ভবিষ্যতে খোলা নতুন socket-ও যেন তালিকায় আসে
  const NativeWS = window.WebSocket;
  const HookedWS = new Proxy(NativeWS, {
    construct(target, args) {
      const ws = new target(...args);
      noteSocket(args[0]);
      return ws;
    },
  });
  window.WebSocket = HookedWS;

  /* ===================================================================
     অংশ ২ — Supabase License Verification & Expiry Watchdog
     =================================================================== */

  const parseDurationMs = (str) => {
    if (!str || typeof str !== "string") return null;
    const m = /^(\d+)\s*([smhdw])$/i.exec(str.trim());
    if (!m) return null;
    const val = Number(m[1]);
    const unit = m[2].toLowerCase();
    const mult = unit === "s" ? 1000 : unit === "m" ? 60000 : unit === "h" ? 3600000 : unit === "d" ? 86400000 : 604800000;
    return val * mult;
  };

  const parseTimestampMs = (v) => {
    if (v === null || v === undefined || v === "") return null;
    if (typeof v === "number" && isFinite(v)) return v < 1e12 ? v * 1000 : v;
    if (typeof v === "string") {
      const n = Number(v);
      if (isFinite(n) && v.trim() !== "") return n < 1e12 ? n * 1000 : n;
      const d = Date.parse(v);
      if (isFinite(d)) return d;
    }
    return null;
  };

  const isLifetimeRow = (row) => {
    if (!row) return false;
    const dur = String(row.duration || "").trim().toLowerCase();
    const tier = String(row.tier || "").trim().toUpperCase();
    return (row.exp === null || row.exp === undefined) && (dur === "lifetime" || tier === "LIFETIME");
  };

  const isLicenseCurrentlyValid = () => {
    if (!activeLicense) return false;
    if (activeLicense.lifetime) return true;
    if (activeLicense.expiresAt != null && Date.now() >= activeLicense.expiresAt) return false;
    return true;
  };

  const formatRemaining = (expiresAt, lifetime) => {
    if (lifetime || expiresAt == null) return "LIFETIME";
    const diff = expiresAt - Date.now();
    if (diff <= 0) return "EXPIRED";
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);
    if (days > 0) return days + "d " + (hrs % 24) + "h left";
    if (hrs > 0) return hrs + "h " + (mins % 60) + "m left";
    const secs = Math.max(1, Math.floor((diff % 60000) / 1000));
    return mins > 0 ? mins + "m " + secs + "s left" : secs + "s left";
  };

  const querySupabaseLicense = async (licenseKey) => {
    const cleanKey = String(licenseKey || "").trim();
    if (!cleanKey || cleanKey === "__MAINTENANCE_CONFIG__") {
      return { ok: false, reason: "Access Denied — Please enter a valid licence key." };
    }

    let lastErr = null;
    let matchedRow = null;
    let activeTable = SUPABASE_TABLES[0];

    for (const tableName of SUPABASE_TABLES) {
      const url = `${SUPABASE_URL}/rest/v1/${tableName}?key=eq.${encodeURIComponent(cleanKey)}&select=*&limit=1`;
      try {
        const res = await fetch(url, {
          method: "GET",
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: "Bearer " + SUPABASE_ANON_KEY,
            Accept: "application/json",
          },
          cache: "no-store",
        });

        if (res.status === 404) continue;

        const payload = await res.json().catch(() => null);
        if (!res.ok) {
          if (payload && payload.code === "PGRST205") continue;
          lastErr = (payload && payload.message) || `HTTP ${res.status}`;
          continue;
        }

        activeTable = tableName;
        if (Array.isArray(payload) && payload.length > 0) {
          matchedRow = payload[0];
        }
        break;
      } catch (err) {
        lastErr = err && err.message ? err.message : "Network error";
      }
    }

    if (!matchedRow) {
      if (lastErr) {
        return { ok: false, reason: "Access Denied — Verification failed (" + lastErr + ")." };
      }
      return { ok: false, reason: "Access Denied — Licence key does not match any record." };
    }

    if (String(matchedRow.tier || "").toUpperCase() === "SYSTEM" || matchedRow.key === "__MAINTENANCE_CONFIG__") {
      return { ok: false, reason: "Access Denied — Invalid licence key." };
    }

    if (matchedRow.active !== true) {
      return { ok: false, reason: "Access Denied — Licence key is inactive or disabled." };
    }

    const now = Date.now();
    const lifetime = isLifetimeRow(matchedRow);
    let expiresAt = null;
    const patchBody = { last_used_at: now };

    if (!lifetime) {
      expiresAt = parseTimestampMs(matchedRow.exp);
      const firstLogin = parseTimestampMs(matchedRow.first_login_at);
      const durationMs =
        (typeof matchedRow.duration_ms === "number" && matchedRow.duration_ms > 0 ? matchedRow.duration_ms : null) ||
        parseDurationMs(matchedRow.duration);

      if (expiresAt == null) {
        if (firstLogin != null && durationMs != null) {
          expiresAt = firstLogin + durationMs;
        } else if (durationMs != null) {
          expiresAt = now + durationMs;
          patchBody.first_login_at = now;
          patchBody.exp = expiresAt;
        }
      }

      if (expiresAt != null && now >= expiresAt) {
        return { ok: false, reason: "Access Denied — Licence has expired." };
      }
    }

    try {
      fetch(`${SUPABASE_URL}/rest/v1/${activeTable}?key=eq.${encodeURIComponent(cleanKey)}`, {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: "Bearer " + SUPABASE_ANON_KEY,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(patchBody),
      }).catch(() => {});
    } catch (_) {}

    return {
      ok: true,
      license: {
        key: matchedRow.key,
        tier: String(matchedRow.tier || "PRO").toUpperCase(),
        duration: matchedRow.duration || (lifetime ? "lifetime" : ""),
        lifetime,
        expiresAt,
        verifiedAt: now,
      },
    };
  };

  /* ===================================================================
     অংশ ৩ — TradePilot Compounding Bot পপআপ (Glassmorphism + Soft 3D + Bevel)
     =================================================================== */

  const DEFAULT_CANDLE_SECONDS = 5;
  const DURATION_PRESETS = [5, 10, 15, 30, 60];

  let ui = {
    candleSeconds: DEFAULT_CANDLE_SECONDS,
  };

  const loadUi = () => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) ui = { ...ui, ...JSON.parse(raw) };
    } catch (_) {}
  };
  const save = () => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(ui));
    } catch (_) {}
  };

  const readSavedLicenseKey = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(LICENSE_STORE_KEY) || "null");
      if (saved && typeof saved.key === "string") return saved.key;
    } catch (_) {}
    return "";
  };

  const saveLicenseRecord = (lic) => {
    try {
      localStorage.setItem(LICENSE_STORE_KEY, JSON.stringify(lic));
    } catch (_) {}
  };

  const clearLicenseRecord = () => {
    activeLicense = null;
    try {
      localStorage.removeItem(LICENSE_STORE_KEY);
    } catch (_) {}
  };

  const old = document.getElementById("qx-candle-round-host");
  if (old) old.remove();

  const host = document.createElement("div");
  host.id = "qx-candle-round-host";
  const root = host.attachShadow({ mode: "open" });
  root.innerHTML = `
    <style>
      @import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;600;700&family=Orbitron:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap");
      :host { all: initial; }
      * { box-sizing: border-box; }

      @keyframes tpShake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-6px); }
        40% { transform: translateX(6px); }
        60% { transform: translateX(-4px); }
        80% { transform: translateX(4px); }
      }
      @keyframes tpSpin {
        to { transform: rotate(360deg); }
      }

      /* Backdrop mist that makes frosted Glassmorphism pop against live chart */
      .tp-overlay {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 18px;
        background:
          radial-gradient(circle at 26% 24%, rgba(14, 165, 233, .22), transparent 44%),
          radial-gradient(circle at 76% 78%, rgba(16, 185, 129, .16), transparent 46%),
          rgba(3, 8, 18, .62);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        font-family: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif;
        transition: opacity .28s ease, visibility .28s ease;
      }
      .tp-overlay.out {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
      }

      /* Glassmorphism + Soft/Faux 3D + Bevel/Depth Card */
      .tp-card {
        position: relative;
        width: min(100%, 408px);
        border-radius: 24px;
        overflow: hidden;
        color: #ecf7ff;
        background: linear-gradient(
          155deg,
          rgba(26, 48, 84, .68) 0%,
          rgba(11, 24, 46, .76) 52%,
          rgba(6, 14, 30, .86) 100%
        );
        backdrop-filter: blur(26px) saturate(175%);
        -webkit-backdrop-filter: blur(26px) saturate(175%);
        /* Bevel border: light specular top-left, deep shadow bottom-right */
        border-top: 1.5px solid rgba(186, 230, 253, .48);
        border-left: 1.5px solid rgba(125, 211, 252, .32);
        border-right: 1.5px solid rgba(15, 23, 42, .72);
        border-bottom: 2px solid rgba(2, 6, 23, .92);
        /* Multi-layered 3D depth & glass inner rim */
        box-shadow:
          0 34px 72px rgba(0, 0, 0, .74),
          0 12px 28px rgba(6, 182, 212, .16),
          inset 0 1.5px 1px rgba(255, 255, 255, .28),
          inset 0 -3px 10px rgba(0, 0, 0, .52);
      }
      .tp-card.shake {
        animation: tpShake .38s ease;
      }
      /* Specular frosted glass diagonal sheen */
      .tp-card::before {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: linear-gradient(
          132deg,
          rgba(255, 255, 255, .14) 0%,
          rgba(255, 255, 255, .03) 28%,
          transparent 54%
        );
      }

      /* Header Row */
      .tp-header {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 16px 17px 14px;
        border-bottom: 1px solid rgba(186, 230, 253, .12);
        box-shadow: 0 1px 0 rgba(0, 0, 0, .35);
      }
      .tp-brand {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
      }
      /* Soft 3D Beveled Logo Medallion */
      .tp-logo-box {
        width: 44px;
        height: 44px;
        border-radius: 13px;
        flex-shrink: 0;
        overflow: hidden;
        background: linear-gradient(145deg, rgba(18, 36, 64, .9), rgba(6, 13, 26, .95));
        border-top: 1.5px solid rgba(186, 230, 253, .5);
        border-left: 1.5px solid rgba(125, 211, 252, .35);
        border-right: 1px solid rgba(2, 6, 23, .8);
        border-bottom: 1.5px solid rgba(2, 6, 23, .95);
        box-shadow:
          0 8px 18px rgba(0, 0, 0, .52),
          0 0 18px rgba(34, 211, 238, .22),
          inset 0 1px 1px rgba(255, 255, 255, .25);
        display: grid;
        place-items: center;
      }
      .tp-logo-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .tp-brand-text {
        min-width: 0;
      }
      .tp-title-row {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: nowrap;
      }
      .tp-title {
        margin: 0;
        font: 800 14.5px/1.15 "Plus Jakarta Sans", system-ui, sans-serif;
        letter-spacing: -.01em;
        color: #f8fafc;
        text-shadow: 0 1px 2px rgba(0, 0, 0, .6);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .tp-title span {
        color: #38bdf8;
      }
      .tp-badge-bot {
        display: inline-flex;
        align-items: center;
        padding: 3px 7px;
        border-radius: 6px;
        font: 800 9px/1 "Orbitron", sans-serif;
        letter-spacing: .06em;
        color: #fff;
        background: linear-gradient(180deg, #f87171 0%, #dc2626 100%);
        border-top: 1px solid rgba(255, 255, 255, .45);
        border-bottom: 1px solid rgba(127, 29, 29, .9);
        box-shadow: 0 3px 8px rgba(220, 38, 38, .42), inset 0 1px 0 rgba(255, 255, 255, .3);
        flex-shrink: 0;
      }
      .tp-subtitle {
        margin: 3px 0 0;
        font: 700 9.5px/1.1 "JetBrains Mono", monospace;
        letter-spacing: .07em;
        text-transform: uppercase;
        color: #93c5fd;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .tp-header-actions {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
      }
      .tp-std-chip {
        height: 29px;
        padding: 0 9px;
        border-radius: 9px;
        background: linear-gradient(180deg, rgba(30, 58, 95, .62), rgba(12, 26, 48, .78));
        border-top: 1px solid rgba(186, 230, 253, .3);
        border-bottom: 1px solid rgba(2, 6, 23, .8);
        box-shadow: 0 3px 8px rgba(0, 0, 0, .35), inset 0 1px 0 rgba(255, 255, 255, .15);
        color: #bae6fd;
        font: 700 10px/1 "JetBrains Mono", monospace;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .tp-live-chip {
        height: 27px;
        padding: 0 9px;
        border-radius: 999px;
        border-top: 1px solid rgba(167, 243, 208, .45);
        border-bottom: 1px solid rgba(6, 78, 59, .8);
        background: linear-gradient(180deg, rgba(16, 185, 129, .34), rgba(5, 150, 105, .24));
        box-shadow: 0 3px 10px rgba(16, 185, 129, .22), inset 0 1px 0 rgba(255, 255, 255, .2);
        color: #6ee7b7;
        font: 800 9.5px/1 "Plus Jakarta Sans", sans-serif;
        letter-spacing: .05em;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .tp-live-chip.locked {
        border-top-color: rgba(253, 230, 138, .45);
        border-bottom-color: rgba(120, 53, 15, .85);
        background: linear-gradient(180deg, rgba(245, 158, 11, .3), rgba(180, 83, 9, .22));
        box-shadow: 0 3px 10px rgba(245, 158, 11, .18), inset 0 1px 0 rgba(255, 255, 255, .18);
        color: #fde68a;
      }
      .tp-live-chip.denied {
        border-top-color: rgba(254, 202, 202, .45);
        border-bottom-color: rgba(127, 29, 29, .9);
        background: linear-gradient(180deg, rgba(239, 68, 68, .35), rgba(185, 28, 28, .26));
        box-shadow: 0 3px 10px rgba(239, 68, 68, .22), inset 0 1px 0 rgba(255, 255, 255, .18);
        color: #fecaca;
      }
      .tp-min-btn {
        width: 29px;
        height: 29px;
        border-radius: 50%;
        border: none;
        border-top: 1px solid rgba(255, 255, 255, .28);
        border-bottom: 1.5px solid rgba(2, 6, 23, .9);
        background: linear-gradient(180deg, rgba(30, 48, 78, .82), rgba(11, 21, 40, .92));
        box-shadow: 0 4px 8px rgba(0, 0, 0, .42), inset 0 1px 0 rgba(255, 255, 255, .2);
        color: #cbd5e1;
        font-size: 16px;
        line-height: 1;
        cursor: pointer;
        display: grid;
        place-items: center;
        transition: transform .12s, filter .15s;
      }
      .tp-min-btn:hover {
        filter: brightness(1.18);
        color: #fff;
      }
      .tp-min-btn:active {
        transform: translateY(1px);
      }

      /* Body */
      .tp-body {
        position: relative;
        padding: 15px 17px 16px;
      }
      .tp-body.collapsed {
        display: none;
      }

      /* Debossed / Recessed Soft-3D Info Well */
      .tp-info-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 12px 14px;
        border-radius: 14px;
        background: linear-gradient(180deg, rgba(4, 10, 22, .68) 0%, rgba(10, 22, 42, .54) 100%);
        border-top: 1px solid rgba(0, 0, 0, .72);
        border-left: 1px solid rgba(0, 0, 0, .45);
        border-right: 1px solid rgba(186, 230, 253, .12);
        border-bottom: 1px solid rgba(186, 230, 253, .18);
        box-shadow:
          inset 0 4px 10px rgba(0, 0, 0, .58),
          0 1px 0 rgba(255, 255, 255, .07);
        margin-bottom: 15px;
      }
      .tp-info-left {
        min-width: 0;
        text-align: left;
      }
      .tp-info-kicker {
        font: 700 9.5px/1.1 "JetBrains Mono", monospace;
        letter-spacing: .09em;
        text-transform: uppercase;
        color: #7c93b5;
        margin-bottom: 4px;
      }
      .tp-info-main {
        font: 800 13.5px/1.2 "Plus Jakarta Sans", sans-serif;
        color: #38bdf8;
        text-shadow: 0 0 14px rgba(56, 189, 248, .28);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .tp-info-right {
        text-align: right;
        flex-shrink: 0;
      }
      .tp-info-right .tp-info-kicker {
        color: #7dd3fc;
        opacity: .85;
      }
      .tp-info-val {
        font: 700 12.5px/1.2 "JetBrains Mono", monospace;
        font-variant-numeric: tabular-nums;
        color: #f8fafc;
      }

      /* Section Labels */
      .tp-row-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 8px;
      }
      .tp-sec-label {
        font: 700 10.5px/1 "JetBrains Mono", monospace;
        letter-spacing: .09em;
        text-transform: uppercase;
        color: #a5b8d4;
      }

      /* Extruded 3D Paste Pill */
      .tp-paste-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        height: 27px;
        padding: 0 11px;
        border-radius: 9px;
        border: none;
        border-top: 1px solid rgba(165, 243, 252, .55);
        border-bottom: 1.5px solid rgba(8, 51, 68, .9);
        background: linear-gradient(180deg, rgba(34, 211, 238, .28), rgba(6, 182, 212, .16));
        box-shadow: 0 3px 8px rgba(0, 0, 0, .35), inset 0 1px 0 rgba(255, 255, 255, .25);
        color: #a5f3fc;
        font: 700 11px/1 "Plus Jakarta Sans", sans-serif;
        cursor: pointer;
        transition: transform .12s, filter .15s;
      }
      .tp-paste-pill:hover {
        filter: brightness(1.16);
      }
      .tp-paste-pill:active {
        transform: translateY(1.5px);
      }

      /* Recessed Input + Raised 3D Side Buttons */
      .tp-input-group {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 15px;
      }
      .tp-side-btn {
        width: 44px;
        height: 45px;
        flex-shrink: 0;
        border-radius: 12px;
        border: none;
        border-top: 1px solid rgba(255, 255, 255, .24);
        border-left: 1px solid rgba(255, 255, 255, .12);
        border-bottom: 2px solid rgba(2, 6, 23, .95);
        background: linear-gradient(180deg, rgba(30, 52, 86, .76), rgba(11, 22, 42, .9));
        box-shadow:
          0 5px 12px rgba(0, 0, 0, .42),
          inset 0 1px 0 rgba(255, 255, 255, .18);
        color: #cbd5e1;
        font: 700 15px/1 "Plus Jakarta Sans", sans-serif;
        cursor: pointer;
        display: grid;
        place-items: center;
        transition: transform .12s, filter .15s, color .15s;
      }
      .tp-side-btn:hover {
        filter: brightness(1.16);
        color: #67e8f9;
      }
      .tp-side-btn:active {
        transform: translateY(2px);
        box-shadow: 0 2px 6px rgba(0, 0, 0, .45);
      }

      .tp-key-input {
        flex: 1;
        min-width: 0;
        height: 45px;
        padding: 0 12px;
        border-radius: 12px;
        border: 1px solid transparent;
        border-top: 1.5px solid rgba(0, 0, 0, .75);
        border-left: 1px solid rgba(0, 0, 0, .5);
        border-bottom: 1px solid rgba(186, 230, 253, .22);
        background: linear-gradient(180deg, rgba(4, 10, 22, .85), rgba(8, 18, 35, .75));
        box-shadow:
          inset 0 4px 10px rgba(0, 0, 0, .72),
          0 1px 0 rgba(255, 255, 255, .08);
        color: #f8fafc;
        font: 600 13px/1 "JetBrains Mono", monospace;
        text-align: center;
        letter-spacing: .04em;
        transition: border-color .18s, box-shadow .18s;
      }
      .tp-key-input::placeholder {
        color: #64748b;
        font-weight: 500;
        letter-spacing: 0;
      }
      .tp-key-input:focus {
        outline: none;
        border-color: rgba(56, 189, 248, .65);
        box-shadow:
          inset 0 4px 10px rgba(0, 0, 0, .72),
          0 0 0 3px rgba(34, 211, 238, .22);
      }

      /* Duration (Seconds) 3D Beveled Pills */
      .tp-ready-tag {
        font: 700 10.5px/1 "JetBrains Mono", monospace;
        letter-spacing: .06em;
        color: #38bdf8;
      }
      .tp-dur-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 7px;
        margin-bottom: 16px;
      }
      .tp-dur-btn {
        height: 37px;
        border-radius: 11px;
        border: none;
        border-top: 1px solid rgba(255, 255, 255, .2);
        border-bottom: 2px solid rgba(2, 6, 23, .92);
        background: linear-gradient(180deg, rgba(24, 44, 76, .7), rgba(10, 20, 38, .85));
        box-shadow:
          0 4px 9px rgba(0, 0, 0, .38),
          inset 0 1px 0 rgba(255, 255, 255, .14);
        color: #9fb4d0;
        font: 700 12.5px/1 "JetBrains Mono", monospace;
        cursor: pointer;
        transition: transform .12s, filter .15s, box-shadow .15s, color .15s;
      }
      .tp-dur-btn:hover {
        filter: brightness(1.15);
        color: #e2e8f0;
      }
      .tp-dur-btn:active {
        transform: translateY(1.5px);
      }
      .tp-dur-btn.active {
        color: #031522;
        border-top: 1.5px solid rgba(255, 255, 255, .75);
        border-bottom: 2px solid #0369a1;
        background: linear-gradient(180deg, #67e8f9 0%, #22d3ee 48%, #0ea5e9 100%);
        box-shadow:
          0 4px 0 #0e7490,
          0 8px 20px rgba(6, 182, 212, .45),
          inset 0 1.5px 1px rgba(255, 255, 255, .65);
      }

      /* Primary 3D Beveled Glossy CTA Button */
      .tp-cta {
        width: 100%;
        height: 49px;
        border: none;
        border-radius: 14px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
        font: 800 13.5px/1 "Orbitron", "Plus Jakarta Sans", sans-serif;
        letter-spacing: .07em;
        text-transform: uppercase;
        color: #031522;
        border-top: 1.5px solid rgba(255, 255, 255, .8);
        border-bottom: 1.5px solid #075985;
        background: linear-gradient(180deg, #67e8f9 0%, #22d3ee 42%, #0284c7 100%);
        box-shadow:
          0 5px 0 #0369a1,
          0 14px 30px rgba(6, 182, 212, .46),
          inset 0 1.5px 1px rgba(255, 255, 255, .7);
        transition: transform .12s, filter .15s, box-shadow .12s;
      }
      .tp-cta:hover {
        filter: brightness(1.06);
      }
      .tp-cta:active {
        transform: translateY(3px);
        box-shadow:
          0 2px 0 #0369a1,
          0 6px 18px rgba(6, 182, 212, .38),
          inset 0 1px 0 rgba(255, 255, 255, .55);
      }
      .tp-cta:disabled {
        opacity: .78;
        cursor: wait;
        transform: none;
      }
      .tp-spin {
        width: 16px;
        height: 16px;
        border: 2.5px solid rgba(4, 21, 34, .25);
        border-top-color: #041522;
        border-radius: 50%;
        animation: tpSpin .65s linear infinite;
      }

      /* Status / Access Denied Banner */
      .tp-msg {
        margin-top: 13px;
        padding: 10px 12px;
        border-radius: 11px;
        font: 600 12px/1.4 "Plus Jakarta Sans", sans-serif;
        text-align: center;
        border-top: 1px solid rgba(254, 202, 202, .35);
        border-bottom: 1.5px solid rgba(127, 29, 29, .85);
        background: linear-gradient(180deg, rgba(153, 27, 27, .48), rgba(69, 10, 10, .62));
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, .12), 0 4px 12px rgba(0, 0, 0, .35);
        color: #fecaca;
      }
      .tp-msg.ok {
        border-top-color: rgba(167, 243, 208, .4);
        border-bottom-color: rgba(6, 78, 59, .85);
        background: linear-gradient(180deg, rgba(6, 95, 70, .52), rgba(6, 78, 59, .62));
        color: #a7f3d0;
      }
      .tp-msg.info {
        border-top-color: rgba(186, 230, 253, .38);
        border-bottom-color: rgba(12, 74, 110, .85);
        background: linear-gradient(180deg, rgba(14, 116, 144, .42), rgba(12, 74, 110, .56));
        color: #bae6fd;
      }
      .tp-msg[hidden] {
        display: none;
      }

      /* Footer bar */
      .tp-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 11px 16px 13px;
        border-top: 1px solid rgba(186, 230, 253, .12);
        background: linear-gradient(180deg, rgba(6, 14, 28, .45), rgba(3, 8, 18, .72));
        font: 700 10.5px/1 "JetBrains Mono", monospace;
        letter-spacing: .09em;
        text-transform: uppercase;
        color: #7dd3fc;
      }

      @media (max-width: 767px), (pointer: coarse) {
        .tp-overlay {
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
          background: rgba(3, 8, 18, .88);
        }
      }
    </style>

    <div class="tp-overlay">
      <div class="tp-card">
        <div class="tp-header">
          <div class="tp-brand">
            <div class="tp-logo-box">
              <img class="tp-logo-img" alt="TradePilot Compounding Bot" />
            </div>
            <div class="tp-brand-text">
              <div class="tp-title-row">
                <h1 class="tp-title">TradePilot <span>Compounding</span></h1>
                <span class="tp-badge-bot">BOT</span>
              </div>
              <p class="tp-subtitle">TradePilot Compounding Bot</p>
            </div>
          </div>

          <div class="tp-header-actions">
            <span class="tp-std-chip">STD</span>
            <span class="tp-live-chip locked">LOCKED</span>
            <button type="button" class="tp-min-btn" title="Minimize" aria-label="Minimize">−</button>
          </div>
        </div>

        <div class="tp-body">
          <div class="tp-info-box">
            <div class="tp-info-left">
              <div class="tp-info-kicker">BOT ENGINE</div>
              <div class="tp-info-main">TradePilot Compounding Bot</div>
            </div>
            <div class="tp-info-right">
              <div class="tp-info-kicker">• LICENSE GATE</div>
              <div class="tp-info-val tp-gate-status">Auth Required</div>
            </div>
          </div>

          <div class="tp-row-head">
            <span class="tp-sec-label">LICENCE KEY</span>
            <button type="button" class="tp-paste-pill" title="Paste licence key from clipboard">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>Paste Licence</span>
            </button>
          </div>

          <div class="tp-input-group">
            <button type="button" class="tp-side-btn tp-clear-btn" title="Clear key" aria-label="Clear key">✕</button>
            <input
              class="tp-key-input"
              type="text"
              placeholder="Enter or paste licence key"
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
            />
            <button type="button" class="tp-side-btn tp-paste-btn" title="Paste key" aria-label="Paste key">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              </svg>
            </button>
          </div>

          <div class="tp-row-head">
            <span class="tp-sec-label">DURATION (SECONDS)</span>
            <span class="tp-ready-tag">[5S READY]</span>
          </div>

          <div class="tp-dur-grid">
            <button type="button" class="tp-dur-btn active" data-sec="5">5s</button>
            <button type="button" class="tp-dur-btn" data-sec="10">10s</button>
            <button type="button" class="tp-dur-btn" data-sec="15">15s</button>
            <button type="button" class="tp-dur-btn" data-sec="30">30s</button>
            <button type="button" class="tp-dur-btn" data-sec="60">60s</button>
          </div>

          <button type="button" class="tp-cta">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M13 2L4 14h7l-1 8 10-12h-7l0-8z"></path>
            </svg>
            <span class="tp-cta-text">VERIFY &amp; START BOT</span>
          </button>

          <div class="tp-msg" hidden></div>
        </div>

        <div class="tp-footer">
          <span>↵</span>
          <span>TRADEPILOT COMPOUNDING BOT</span>
        </div>
      </div>
    </div>`;

  const $ = (s) => root.querySelector(s);

  const tpLogoImg = $(".tp-logo-img");
  if (tpLogoImg) {
    tpLogoImg.src = TP_LOGO_DATA_URI;
  }

  /* ===================================================================
     Apple Intelligence / Siri-স্টাইল স্ক্রিন-কিনারার আলো — বট চালু থাকলে
     =================================================================== */
  const AI_GLOW_ID = "qx-ai-glow";
  const AI_GLOW_STYLE_ID = "qx-ai-glow-style";
  const ensureAiGlowStyle = () => {
    if (document.getElementById(AI_GLOW_STYLE_ID)) return;
    const st = document.createElement("style");
    st.id = AI_GLOW_STYLE_ID;
    const G = "#" + AI_GLOW_ID;
    const HUES = "#ff3ea5,#b04dff,#2f7bff,#22d3ee,#ff5a6e,#ff3ea5";
    const FADE = "#000 0%,rgba(0,0,0,.7) 25%,rgba(0,0,0,.3) 60%,transparent 100%";
    const edge = (cls, dir) =>
      G + " ." + cls + "{-webkit-mask-image:linear-gradient(" + dir + "," + FADE + ");mask-image:linear-gradient(" + dir + "," + FADE + ")}";
    st.textContent = [
      G + "{position:fixed;inset:0;pointer-events:none;z-index:2147483646;opacity:0;" +
        "transition:opacity .35s ease;contain:strict;--t:clamp(8px,1.4vmin,13px)}",
      G + ".on{opacity:1}",
      "@media (pointer:coarse),(max-width:767px){" + G + "{--t:clamp(11px,3vmin,16px)}" + G + " .h{display:none}}",
      G + " .s{position:absolute;inset:0}",
      G + " .c{animation:qxAiBreath 3.2s ease-in-out infinite}",
      G + " .h{--t:clamp(18px,3vmin,28px);filter:blur(5px);animation:qxAiHaze 4.4s ease-in-out infinite}",
      G + " .s>b{position:absolute;display:block;overflow:hidden}",
      G + " .t{top:0;left:0;right:0;height:var(--t)}",
      G + " .b{bottom:0;left:0;right:0;height:var(--t)}",
      G + " .rt{top:0;bottom:0;right:0;width:var(--t)}",
      G + " .lf{top:0;bottom:0;left:0;width:var(--t)}",
      edge("t", "180deg"), edge("b", "0deg"), edge("rt", "270deg"), edge("lf", "90deg"),
      G + " .s>b>i{position:absolute;display:block;will-change:transform}",
      G + " .t>i," + G + " .b>i{top:0;bottom:0;left:0;width:200%;" +
        "background:linear-gradient(90deg," + HUES + ") 0 0/50% 100% repeat-x}",
      G + " .rt>i," + G + " .lf>i{left:0;right:0;top:0;height:200%;" +
        "background:linear-gradient(180deg," + HUES + ") 0 0/100% 50% repeat-y}",
      G + " .t>i{animation:qxAiRunX 6s linear infinite reverse}",
      G + " .b>i{animation:qxAiRunX 6s linear infinite}",
      G + " .rt>i{animation:qxAiRunY 6s linear infinite reverse}",
      G + " .lf>i{animation:qxAiRunY 6s linear infinite}",
      G + " .h>b>i{animation-duration:9s}",
      "@keyframes qxAiRunX{from{transform:translateX(0)}to{transform:translateX(-50%)}}",
      "@keyframes qxAiRunY{from{transform:translateY(0)}to{transform:translateY(-50%)}}",
      "@keyframes qxAiBreath{0%,100%{opacity:.85}50%{opacity:1}}",
      "@keyframes qxAiHaze{0%,100%{opacity:.35}50%{opacity:.6}}",
    ].join("\n");
    (document.head || document.documentElement).appendChild(st);
  };
  const setAiGlow = (on) => {
    let el = document.getElementById(AI_GLOW_ID);
    if (!on) {
      if (el) el.classList.remove("on");
      return;
    }
    ensureAiGlowStyle();
    if (!el) {
      el = document.createElement("div");
      el.id = AI_GLOW_ID;
      el.setAttribute("aria-hidden", "true");
      const strips = '<b class="t"><i></i></b><b class="rt"><i></i></b><b class="b"><i></i></b><b class="lf"><i></i></b>';
      el.innerHTML = '<div class="s h">' + strips + '</div><div class="s c">' + strips + "</div>";
      document.documentElement.appendChild(el);
    }
    requestAnimationFrame(() => el.classList.add("on"));
  };
  const removeAiGlow = () => {
    const el = document.getElementById(AI_GLOW_ID);
    if (el) el.remove();
    const st = document.getElementById(AI_GLOW_STYLE_ID);
    if (st) st.remove();
  };

  /* ===================================================================
     Profit হলে স্ক্রিনের মাঝের একটু নিচে সবুজ profit orb + "Profit +$X"
     =================================================================== */
  const ORB_ID = "qx-profit-orb";
  const ORB_STYLE_ID = "qx-profit-orb-style";
  const ORB_FONT_ID = "qx-profit-orb-font";
  const ORB_HOLD_MS = 3000;
  const ORB_OUT_MS = 600;
  const ORB_GATHER_MS = 400;
  let orbTimer = null;
  let orbOutTimer = null;
  let orbGatherTimer = null;
  let orbSum = 0;
  const ensureOrbStyle = () => {
    if (!document.getElementById(ORB_FONT_ID)) {
      const lk = document.createElement("link");
      lk.id = ORB_FONT_ID;
      lk.rel = "stylesheet";
      lk.href = "https://fonts.googleapis.com/css2?family=Inter:wght@500;600;800&display=swap";
      (document.head || document.documentElement).appendChild(lk);
    }
    if (document.getElementById(ORB_STYLE_ID)) return;
    const O = "#" + ORB_ID;
    const st = document.createElement("style");
    st.id = ORB_STYLE_ID;
    const AMT_GRAD = "#22d3ee,#67e8f9 30%,#a5f3fc 60%,#22d3ee";
    const T = "translate(-50%,-50%)";
    st.textContent = [
      O + "{position:fixed;left:50%;top:60%;z-index:2147483647;pointer-events:none;display:flex;flex-direction:column;" +
        "align-items:center;gap:clamp(9px,1.8vmin,13px);transform:" + T + " scale(.2);opacity:0;" +
        "--s:clamp(70px,16vmin,100px);font-family:Inter,-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif}",
      O + ".in{animation:qxOrbIn .8s cubic-bezier(.22,1,.36,1) forwards}",
      O + ".out{animation:qxOrbOut " + ORB_OUT_MS + "ms cubic-bezier(.55,0,.8,.2) forwards}",
      O + " .core{position:relative;width:var(--s);height:var(--s)}",
      O + " .halo{position:absolute;inset:-40%;border-radius:50%;" +
        "background:radial-gradient(circle,rgba(34,197,94,.55) 0%,rgba(20,184,166,.28) 42%,rgba(251,191,36,.12) 58%,transparent 72%);" +
        "filter:blur(calc(var(--s)*.12));animation:qxOrbHalo 1.2s ease-in-out infinite alternate}",
      O + " .rp{position:absolute;inset:0;border-radius:50%;border:2px solid rgba(52,211,153,.75);" +
        "box-shadow:0 0 16px rgba(34,197,94,.55);opacity:0;animation:qxOrbRipple 2s cubic-bezier(.2,.7,.3,1) infinite}",
      O + " .rp.r2{border-color:rgba(251,191,36,.7);box-shadow:0 0 16px rgba(251,191,36,.45);animation-delay:1s}",
      O + " .orb{position:absolute;inset:0;border-radius:50%;overflow:hidden;" +
        "background:radial-gradient(circle at 34% 28%,#6ee7b7 0%,#10b981 34%,#047857 72%,#064e3b 100%);" +
        "animation:qxOrbBeat 1.4s ease-in-out infinite,qxOrbGlow 1.4s ease-in-out infinite alternate}",
      O + " .orb::before{content:'';position:absolute;left:16%;top:8%;width:52%;height:34%;border-radius:50%;" +
        "background:radial-gradient(ellipse,rgba(255,255,255,.55),rgba(255,255,255,0) 70%)}",
      O + " .orb::after{content:'';position:absolute;inset:0;border-radius:50%;" +
        "box-shadow:inset 0 -6px calc(var(--s)*.14) rgba(6,78,59,.6),inset 0 0 0 1px rgba(255,255,255,.18)}",
      O + " .sh{position:absolute;top:-20%;bottom:-20%;left:-60%;width:40%;transform:skewX(-20deg);" +
        "background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent);animation:qxOrbSweep 2.4s ease-in-out infinite}",
      O + " .ic{position:absolute;left:50%;top:50%;width:44%;height:44%;margin:-22% 0 0 -22%;" +
        "filter:drop-shadow(0 0 6px rgba(251,191,36,.75)) drop-shadow(0 2px 4px rgba(6,78,59,.6));animation:qxOrbBob 1.1s ease-in-out infinite alternate}",
      O + " .sp{position:absolute;bottom:6%;width:7%;height:7%;border-radius:50%;opacity:0;" +
        "background:radial-gradient(circle,#fff 0%,#fde68a 45%,rgba(251,191,36,0) 70%);animation:qxOrbRise 1.8s ease-out infinite}",
      O + " .sp:nth-of-type(1){left:22%;animation-delay:0s}",
      O + " .sp:nth-of-type(2){left:40%;animation-delay:.45s;width:5%;height:5%}",
      O + " .sp:nth-of-type(3){left:58%;animation-delay:.9s}",
      O + " .sp:nth-of-type(4){left:72%;animation-delay:1.3s;width:5%;height:5%}",
      O + " .sp:nth-of-type(5){left:32%;animation-delay:1.1s;width:4%;height:4%}",
      O + " .txt{display:flex;flex-direction:column;align-items:center;line-height:1.1;color:#fff;text-align:center;" +
        "text-shadow:0 2px 16px rgba(34,211,238,.5),0 0 22px rgba(103,232,249,.3);opacity:0}",
      O + ".in .txt{animation:qxOrbTxt .6s .25s cubic-bezier(.22,1,.36,1) forwards}",
      O + ".out .txt{opacity:1}",
      O + " .lbl{font-weight:600;font-size:clamp(10px,1.7vmin,12px);letter-spacing:.2em;text-transform:uppercase;color:#67e8f9;opacity:.95}",
      O + " .amt{font-weight:800;font-size:clamp(21px,4.6vmin,30px);letter-spacing:-.01em;margin-top:3px;" +
        "background:linear-gradient(90deg," + AMT_GRAD + ");-webkit-background-clip:text;background-clip:text;" +
        "-webkit-text-fill-color:transparent;background-size:300% 100%;animation:qxOrbShine 2.4s linear infinite}",
      "@keyframes qxOrbIn{0%{opacity:0;transform:" + T + " scale(.2);filter:blur(12px)}" +
        "55%{opacity:1;transform:" + T + " scale(1.14);filter:blur(0)}" +
        "75%{transform:" + T + " scale(.95)}100%{opacity:1;transform:" + T + " scale(1)}}",
      "@keyframes qxOrbOut{0%{opacity:1;transform:" + T + " scale(1);filter:blur(0) brightness(1)}" +
        "30%{opacity:1;transform:" + T + " scale(1.1);filter:blur(0) brightness(1.4)}" +
        "100%{opacity:0;transform:translate(-50%,-90%) scale(.3);filter:blur(10px) brightness(1)}}",
      "@keyframes qxOrbTxt{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}",
      "@keyframes qxOrbHalo{from{opacity:.55;transform:scale(.9)}to{opacity:1;transform:scale(1.08)}}",
      "@keyframes qxOrbRipple{0%{opacity:.85;transform:scale(1)}100%{opacity:0;transform:scale(1.9)}}",
      "@keyframes qxOrbBeat{0%,40%,100%{transform:scale(1)}12%{transform:scale(1.07)}24%{transform:scale(.98)}32%{transform:scale(1.03)}}",
      "@keyframes qxOrbGlow{from{box-shadow:0 0 calc(var(--s)*.2) rgba(34,197,94,.55),0 0 calc(var(--s)*.45) rgba(20,184,166,.25)}" +
        "to{box-shadow:0 0 calc(var(--s)*.32) rgba(52,211,153,.7),0 0 calc(var(--s)*.6) rgba(251,191,36,.25)}}",
      "@keyframes qxOrbSweep{0%,35%{left:-60%}75%,100%{left:130%}}",
      "@keyframes qxOrbBob{from{transform:translateY(6%)}to{transform:translateY(-8%)}}",
      "@keyframes qxOrbRise{0%{opacity:0;transform:translateY(0) scale(.6)}20%{opacity:1}100%{opacity:0;transform:translateY(calc(var(--s)*-.75)) scale(1.1)}}",
      "@keyframes qxOrbShine{to{background-position:-300% 0}}",
    ].join("\n");
    (document.head || document.documentElement).appendChild(st);
  };
  const fmtProfit = (n) =>
    "+$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const showProfitOrb = (amount) => {
    if (!qxEngineLive || !isLicenseCurrentlyValid() || !(amount > 0)) return;
    orbSum = Math.round((orbSum + amount) * 1e4) / 1e4;
    const cur = document.getElementById(ORB_ID);
    if (cur && cur.classList.contains("in")) {
      renderProfitOrb();
      return;
    }
    if (orbGatherTimer) return;
    orbGatherTimer = setTimeout(() => {
      orbGatherTimer = null;
      renderProfitOrb();
    }, ORB_GATHER_MS);
  };
  const renderProfitOrb = () => {
    if (!qxEngineLive || !isLicenseCurrentlyValid() || !(orbSum > 0)) return;
    const amount = orbSum;
    ensureOrbStyle();
    let el = document.getElementById(ORB_ID);
    if (!el) {
      el = document.createElement("div");
      el.id = ORB_ID;
      el.setAttribute("aria-live", "polite");
      el.innerHTML =
        '<div class="core"><div class="halo"></div><div class="rp"></div><div class="rp r2"></div>' +
        '<div class="orb"><i class="sh"></i><b class="sp"></b><b class="sp"></b><b class="sp"></b><b class="sp"></b><b class="sp"></b>' +
        '<svg class="ic" viewBox="0 0 24 24"><path d="M12 19V5M5.5 11.5L12 5l6.5 6.5" fill="none" stroke="#fff" ' +
        'stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div>' +
        '<div class="txt"><span class="lbl">Profit</span><span class="amt"></span></div>';
      document.documentElement.appendChild(el);
    }
    el.querySelector(".amt").textContent = fmtProfit(amount);
    clearTimeout(orbTimer);
    clearTimeout(orbOutTimer);
    if (!el.classList.contains("in")) {
      el.classList.remove("out");
      void el.offsetWidth;
      el.classList.add("in");
    }
    orbTimer = setTimeout(() => {
      orbSum = 0;
      el.classList.remove("in");
      el.classList.add("out");
      orbOutTimer = setTimeout(() => el.remove(), ORB_OUT_MS + 50);
    }, ORB_HOLD_MS);
  };
  const removeProfitOrb = () => {
    clearTimeout(orbTimer);
    clearTimeout(orbOutTimer);
    clearTimeout(orbGatherTimer);
    orbGatherTimer = null;
    orbSum = 0;
    for (const id of [ORB_ID, ORB_STYLE_ID, ORB_FONT_ID]) {
      const n = document.getElementById(id);
      if (n) n.remove();
    }
  };

  /* ===================================================================
     অংশ ৪ — পপআপ ইভেন্ট ও ওয়ার্কফ্লো কন্ট্রোল
     =================================================================== */

  const tpOverlay = $(".tp-overlay");
  const tpCard = $(".tp-card");
  const tpBody = $(".tp-body");
  const tpMinBtn = $(".tp-min-btn");
  const tpStdChip = $(".tp-std-chip");
  const tpLiveChip = $(".tp-live-chip");
  const tpGateStatus = $(".tp-gate-status");
  const tpKeyInput = $(".tp-key-input");
  const tpClearBtn = $(".tp-clear-btn");
  const tpPastePill = $(".tp-paste-pill");
  const tpPasteBtn = $(".tp-paste-btn");
  const tpReadyTag = $(".tp-ready-tag");
  const tpDurButtons = Array.from(root.querySelectorAll(".tp-dur-btn"));
  const tpCtaBtn = $(".tp-cta");
  const tpMsg = $(".tp-msg");

  let selectedSeconds = DEFAULT_CANDLE_SECONDS;
  let verifyInFlight = false;

  const setMsg = (text, kind) => {
    if (!tpMsg) return;
    if (!text) {
      tpMsg.hidden = true;
      tpMsg.textContent = "";
      tpMsg.className = "tp-msg";
      return;
    }
    tpMsg.hidden = false;
    tpMsg.textContent = text;
    tpMsg.className = "tp-msg" + (kind ? " " + kind : "");
  };

  const setSelectedDuration = (sec) => {
    const valid = Math.max(1, Math.min(3600, Math.round(Number(sec) || DEFAULT_CANDLE_SECONDS)));
    selectedSeconds = valid;
    if (tpReadyTag) tpReadyTag.textContent = `[${valid}S READY]`;
    for (const btn of tpDurButtons) {
      const bSec = Number(btn.getAttribute("data-sec"));
      btn.classList.toggle("active", bSec === valid);
    }
  };

  const setCtaBusy = (busy) => {
    verifyInFlight = busy;
    if (!tpCtaBtn) return;
    tpCtaBtn.disabled = busy;
    tpCtaBtn.innerHTML = busy
      ? '<span class="tp-spin" aria-hidden="true"></span><span>VERIFYING LICENCE...</span>'
      : '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 2L4 14h7l-1 8 10-12h-7l0-8z"></path></svg><span class="tp-cta-text">VERIFY &amp; START BOT</span>';
  };

  const triggerShake = () => {
    if (!tpCard) return;
    tpCard.classList.remove("shake");
    void tpCard.offsetWidth;
    tpCard.classList.add("shake");
  };

  const stopEngineForExpiredLicense = (reason) => {
    qxEngineLive = false;
    setAiGlow(false);
    removeProfitOrb();
    clearLicenseRecord();
    if (licenseWatchdogTimer) {
      clearInterval(licenseWatchdogTimer);
      licenseWatchdogTimer = null;
    }
    if (tpStdChip) tpStdChip.textContent = "STD";
    if (tpLiveChip) {
      tpLiveChip.textContent = "DENIED";
      tpLiveChip.className = "tp-live-chip denied";
    }
    if (tpGateStatus) tpGateStatus.textContent = "Access Denied";
    if (tpBody) tpBody.classList.remove("collapsed");
    if (tpOverlay) tpOverlay.classList.remove("out");
    setMsg(reason || "Access Denied — Licence has expired.", "");
    triggerShake();
  };

  const startLicenseWatchdog = () => {
    if (licenseWatchdogTimer) clearInterval(licenseWatchdogTimer);
    lastRemoteCheckAt = Date.now();
    licenseWatchdogTimer = setInterval(async () => {
      if (!qxEngineLive) return;
      if (!isLicenseCurrentlyValid()) {
        stopEngineForExpiredLicense("Access Denied — Licence expired. Bot stopped.");
        return;
      }
      if (activeLicense && Date.now() - lastRemoteCheckAt >= 60000) {
        lastRemoteCheckAt = Date.now();
        const remote = await querySupabaseLicense(activeLicense.key);
        if (!remote.ok) {
          stopEngineForExpiredLicense(remote.reason);
        } else {
          activeLicense = remote.license;
          saveLicenseRecord(remote.license);
        }
      }
    }, 5000);
  };

  const finishProSetup = (secRaw) => {
    const sec = Math.max(1, Math.min(3600, Math.round(Number(secRaw) || DEFAULT_CANDLE_SECONDS)));
    ui.candleSeconds = sec;
    setPeriod(sec, "user");
    save();
    qxEngineLive = true;
    setAiGlow(true);
    startLicenseWatchdog();
    if (tpOverlay) tpOverlay.classList.add("out");
  };

  const handlePasteAction = async () => {
    setMsg("", "");
    try {
      if (navigator.clipboard && typeof navigator.clipboard.readText === "function") {
        const clipText = await navigator.clipboard.readText();
        const cleaned = String(clipText || "").trim();
        if (cleaned && tpKeyInput) {
          tpKeyInput.value = cleaned;
          tpKeyInput.focus();
          setMsg("Licence key pasted. Click Verify & Start Bot.", "info");
          return;
        }
        setMsg("Clipboard is empty. Please paste manually (Ctrl+V / Long Press).", "info");
        if (tpKeyInput) tpKeyInput.focus();
        return;
      }
    } catch (_) {}
    if (tpKeyInput) {
      tpKeyInput.focus();
      setMsg("Clipboard permission blocked — press Ctrl+V or long-press input to paste.", "info");
    }
  };

  const handleVerifyAndStart = async () => {
    if (verifyInFlight) return;
    const rawKey = tpKeyInput ? tpKeyInput.value : "";
    const cleanKey = String(rawKey || "").trim();

    if (!cleanKey) {
      if (tpLiveChip) {
        tpLiveChip.textContent = "DENIED";
        tpLiveChip.className = "tp-live-chip denied";
      }
      setMsg("Access Denied — Please enter or paste a licence key.", "");
      triggerShake();
      if (tpKeyInput) tpKeyInput.focus();
      return;
    }

    setCtaBusy(true);
    setMsg("Checking licence against Supabase...", "info");

    try {
      const result = await querySupabaseLicense(cleanKey);
      if (!result.ok) {
        clearLicenseRecord();
        if (tpLiveChip) {
          tpLiveChip.textContent = "DENIED";
          tpLiveChip.className = "tp-live-chip denied";
        }
        if (tpGateStatus) tpGateStatus.textContent = "Access Denied";
        setMsg(result.reason || "Access Denied", "");
        triggerShake();
        return;
      }

      activeLicense = result.license;
      saveLicenseRecord(result.license);

      if (tpStdChip) tpStdChip.textContent = result.license.tier || "PRO";
      if (tpLiveChip) {
        tpLiveChip.textContent = "LIVE";
        tpLiveChip.className = "tp-live-chip";
      }
      if (tpGateStatus) {
        tpGateStatus.textContent = formatRemaining(result.license.expiresAt, result.license.lifetime);
      }

      setMsg("Verified (" + result.license.tier + ") — Starting TradePilot Compounding Bot...", "ok");
      setTimeout(() => {
        finishProSetup(selectedSeconds);
      }, 400);
    } finally {
      setCtaBusy(false);
    }
  };

  for (const btn of tpDurButtons) {
    btn.addEventListener("click", () => {
      const sec = Number(btn.getAttribute("data-sec"));
      setSelectedDuration(sec);
    });
  }

  if (tpClearBtn && tpKeyInput) {
    tpClearBtn.addEventListener("click", () => {
      tpKeyInput.value = "";
      tpKeyInput.focus();
      setMsg("", "");
    });
  }

  if (tpPastePill) tpPastePill.addEventListener("click", handlePasteAction);
  if (tpPasteBtn) tpPasteBtn.addEventListener("click", handlePasteAction);
  if (tpCtaBtn) tpCtaBtn.addEventListener("click", handleVerifyAndStart);

  if (tpKeyInput) {
    tpKeyInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleVerifyAndStart();
    });
  }

  if (tpMinBtn && tpBody) {
    tpMinBtn.addEventListener("click", () => {
      const isCollapsed = tpBody.classList.toggle("collapsed");
      tpMinBtn.textContent = isCollapsed ? "+" : "−";
      tpMinBtn.title = isCollapsed ? "Expand" : "Minimize";
    });
  }

  loadUi();
  const initialSec = DURATION_PRESETS.includes(Number(ui.candleSeconds))
    ? Number(ui.candleSeconds)
    : DEFAULT_CANDLE_SECONDS;
  setSelectedDuration(initialSec);

  const cachedKey = readSavedLicenseKey();
  if (tpKeyInput && cachedKey) {
    tpKeyInput.value = cachedKey;
  }

  (document.body || document.documentElement).appendChild(host);
  if (tpKeyInput) {
    setTimeout(() => tpKeyInput.focus(), 40);
  }

  /* ===================================================================
     আনইনস্টল
     =================================================================== */
  window.qxUninstall = () => {
    try {
      if (licenseWatchdogTimer) {
        clearInterval(licenseWatchdogTimer);
        licenseWatchdogTimer = null;
      }
      removeAiGlow();
      removeProfitOrb();
      qxEngineLive = false;
      activeLicense = null;
      Object.defineProperty(MessageEvent.prototype, "data", nativeDataDesc);
      WebSocket.prototype.send = nativeSend;
      window.WebSocket = NativeWS;
      host.remove();
      delete window.__qxCandleConsole;
      delete window.qxUninstall;
    } catch (_) {}
  };
})();
