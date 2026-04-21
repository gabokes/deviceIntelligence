/**
 * collector.js — device_data
 * Agente: Collector — ver .claude/agents/collector.md antes de modificar
 *
 * Señales base (schema architecture.md): 31 campos capturados siempre.
 * Iteración 1: behavioral + hardware FP + automation + system ext + network.
 *
 * Reglas:
 *   - Sin dependencias externas
 *   - Cada señal en try/catch — una falla no rompe el resto
 *   - Nuevas señales: seguir proceso en .claude/skills/add-signal.md
 */

// ─── Behavioral tracking — módulo scope ───────────────────────────────────────
// Arranca al cargar el script, antes de que se llame collectDeviceData()
const _bhv = { moves: [], keyGaps: [], lastKey: 0, clicks: [], scrollEvents: 0, scrollDY: 0, blurCount: 0 };
(function _startTracking() {
  if (typeof document === 'undefined') return;
  document.addEventListener('mousemove', e => {
    if (_bhv.moves.length < 200)
      _bhv.moves.push({ x: e.clientX, y: e.clientY, t: performance.now() });
  }, { passive: true });
  document.addEventListener('keydown', () => {
    const now = performance.now();
    if (_bhv.lastKey > 0) _bhv.keyGaps.push(now - _bhv.lastKey);
    _bhv.lastKey = now;
  }, { passive: true });
  document.addEventListener('click', () => { _bhv.clicks.push(performance.now()); }, { passive: true });
  window.addEventListener('scroll',   () => { _bhv.scrollEvents++; _bhv.scrollDY += Math.abs(window.scrollY || 0); }, { passive: true });
  window.addEventListener('blur',     () => { _bhv.blurCount++; }, { passive: true });
})();

async function collectDeviceData(organizationId = 'de4330cc45') {

  // ─── Utilidades internas ───────────────────────────────────────────────────

  /** Produce un hash hex de 32 chars a partir de cualquier string */
  function simpleHash(str) {
    const seeds = [0x811c9dc5, 0xdeadbeef, 0x1337c0de, 0xabcdef01];
    const parts = seeds.map(seed => {
      let h = seed;
      for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
        h = h >>> 0;
      }
      return h.toString(16).padStart(8, '0');
    });
    return parts.join('');
  }

  /** Benchmark de CPU: 3 corridas de 1M sqrt(), promedio en ms */
  function measureCpuSpeed() {
    try {
      const RUNS = 3;
      const ITERS = 1_000_000;
      let total = 0;
      for (let r = 0; r < RUNS; r++) {
        const t = performance.now();
        let x = 0;
        for (let i = 0; i < ITERS; i++) x += Math.sqrt(i);
        total += performance.now() - t;
        void x;
      }
      return parseFloat((total / RUNS).toFixed(2));
    } catch (e) {
      return null;
    }
  }

  /**
   * Señal: canvasId
   * Mide: hash del rendering canvas 2D — único por GPU + driver + OS + browser
   * Vector(es): Browser Spoofing, Anti-Fingerprinting
   * Permiso: none
   * Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  function getCanvasFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 50;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#f60';
      ctx.fillRect(0, 0, 200, 50);
      ctx.fillStyle = '#069';
      ctx.font = '14px Arial';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('Koin Browser FP', 10, 32);
      ctx.strokeStyle = 'rgba(102,204,0,0.8)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(100, 25, 15, 0, Math.PI * 2);
      ctx.stroke();
      return simpleHash(canvas.toDataURL());
    } catch (e) {
      return null;
    }
  }

  /**
   * Señal: gpuVendor, gpuName
   * Mide: vendor y modelo de GPU via WebGL WEBGL_debug_renderer_info
   * Vector(es): Emulator/VM, Browser Spoofing
   * Permiso: none
   * Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  function getGPUInfo() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return { vendor: null, name: null };
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      return {
        vendor: ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : null,
        name:   ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : null,
      };
    } catch (e) {
      return { vendor: null, name: null };
    }
  }

  /**
   * Señal: osVersion
   * Mide: versión de OS derivada del User-Agent
   * Vector(es): Browser Spoofing
   * Permiso: none
   * Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  function detectOsVersion(ua) {
    try {
      const checks = [
        [/Windows NT 10\.0/,   'Windows 10'],
        [/Windows NT 11\.0/,   'Windows 11'],
        [/Windows NT 6\.3/,    'Windows 8.1'],
        [/Windows NT 6\.2/,    'Windows 8'],
        [/Windows NT 6\.1/,    'Windows 7'],
        [/Mac OS X ([\d_]+)/,  m => 'macOS ' + m[1].replace(/_/g, '.')],
        [/Android ([\d.]+)/,   m => 'Android ' + m[1]],
        [/iPhone OS ([\d_]+)/, m => 'iOS ' + m[1].replace(/_/g, '.')],
        [/iPad.*OS ([\d_]+)/,  m => 'iPadOS ' + m[1].replace(/_/g, '.')],
        [/Linux/,              'Linux'],
      ];
      for (const [re, result] of checks) {
        const m = ua.match(re);
        if (m) return typeof result === 'function' ? result(m) : result;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Señal: privateBrowsing
   * Mide: modo incógnito/privado via Storage Quota API
   * Vector(es): Incognito
   * Permiso: none
   * Compatibilidad: Chrome ✓ | Firefox ⚠️ | Safari ⚠️ (parcial desde v14)
   */
  async function detectPrivateBrowsing() {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const { quota } = await navigator.storage.estimate();
        if (quota < 120_000_000) return true;
      }
      // Fallback legacy (Chrome < 76)
      if (window.webkitRequestFileSystem) {
        return await new Promise(resolve => {
          window.webkitRequestFileSystem(0, 1, () => resolve(false), () => resolve(true));
        });
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  /** UUID hex de 32 chars para sessionId */
  function generateSessionId() {
    try {
      return Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch (e) {
      return simpleHash(Date.now() + Math.random().toString());
    }
  }

  /**
   * deviceId estable — hash de señales que no cambian entre sesiones
   * canvasId + gpuName + screen.width + screen.height + cores
   */
  function generateDeviceId(canvasId, gpuName, screenW, screenH, cores) {
    const stable = [canvasId, gpuName, screenW, screenH, cores].join('|');
    return simpleHash(stable);
  }

  // ─── Helpers iteración 1 ──────────────────────────────────────────────────

  /** S001 — Shannon entropy del movimiento del mouse sobre velocidades discretizadas */
  function calcMouseEntropy() {
    const m = _bhv.moves;
    if (m.length < 10) return null;
    const vels = [];
    for (let i = 1; i < m.length; i++) {
      const dx = m[i].x - m[i-1].x, dy = m[i].y - m[i-1].y;
      const dt = (m[i].t - m[i-1].t) || 1;
      vels.push(Math.sqrt(dx*dx + dy*dy) / dt);
    }
    const max = Math.max(...vels) || 1;
    const bins = 16, counts = new Array(bins).fill(0);
    vels.forEach(v => { counts[Math.min(Math.floor(v / max * bins), bins - 1)]++; });
    const total = vels.length;
    let H = 0;
    counts.forEach(c => { if (c > 0) { const p = c / total; H -= p * Math.log2(p); } });
    return parseFloat(H.toFixed(3));
  }

  /** S036 — Media y stddev de aceleración del mouse */
  function calcMouseAcceleration() {
    const m = _bhv.moves;
    if (m.length < 10) return { mean: null, stddev: null, pattern: null };
    const accs = [];
    for (let i = 2; i < m.length; i++) {
      const dt1 = (m[i-1].t - m[i-2].t) || 1, dt2 = (m[i].t - m[i-1].t) || 1;
      const v1 = Math.hypot(m[i-1].x - m[i-2].x, m[i-1].y - m[i-2].y) / dt1;
      const v2 = Math.hypot(m[i].x - m[i-1].x, m[i].y - m[i-1].y) / dt2;
      accs.push(Math.abs(v2 - v1));
    }
    const mean = accs.reduce((a, b) => a + b, 0) / accs.length;
    const variance = accs.reduce((a, b) => a + (b - mean) ** 2, 0) / accs.length;
    const stddev = Math.sqrt(variance);
    const cv = stddev / (mean || 1);
    return {
      mean: parseFloat(mean.toFixed(4)),
      stddev: parseFloat(stddev.toFixed(4)),
      pattern: cv < 0.3 ? 'robotic' : cv < 0.9 ? 'natural' : 'erratic'
    };
  }

  /** S002 — Coeficiente de variación del timing entre teclas */
  function calcKeyboardCV() {
    const gaps = _bhv.keyGaps;
    if (gaps.length < 3) return null;
    const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const variance = gaps.reduce((a, b) => a + (b - mean) ** 2, 0) / gaps.length;
    return parseFloat((Math.sqrt(variance) / (mean || 1)).toFixed(4));
  }

  /** S037 — Intervalo promedio y stddev entre clicks */
  function calcClickStats() {
    const times = _bhv.clicks;
    if (times.length < 2) return { avgInterval: null, stddev: null };
    const ivs = [];
    for (let i = 1; i < times.length; i++) ivs.push(times[i] - times[i-1]);
    const avg = ivs.reduce((a, b) => a + b, 0) / ivs.length;
    const variance = ivs.reduce((a, b) => a + (b - avg) ** 2, 0) / ivs.length;
    return { avgInterval: Math.round(avg), stddev: Math.round(Math.sqrt(variance)) };
  }

  /** S010 — Lista de extensiones WebGL soportadas */
  function getWebGLExtensions() {
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
      return gl ? (gl.getSupportedExtensions() || []) : [];
    } catch (e) { return []; }
  }

  /** S003 — Hash de parámetros WebGL (driver + GPU fingerprint) */
  function getWebGLHash(extensions) {
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
      if (!gl) return null;
      const params = [
        gl.getParameter(gl.VERSION),
        gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
        gl.getParameter(gl.VENDOR),
        gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
        gl.getParameter(gl.MAX_TEXTURE_SIZE),
        extensions.length
      ].join('|');
      return simpleHash(params);
    } catch (e) { return null; }
  }

  /** S004 — Audio Context fingerprint via OfflineAudioContext */
  async function getAudioFingerprint() {
    try {
      const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      if (!OAC) return { sampleRate: null, channels: null, hash: null };
      const ctx = new OAC(1, 4096, 44100);
      const osc = ctx.createOscillator();
      const cmp = ctx.createDynamicsCompressor();
      osc.type = 'triangle';
      osc.frequency.value = 10000;
      osc.connect(cmp);
      cmp.connect(ctx.destination);
      osc.start(0);
      const buffer = await ctx.startRendering();
      const data = buffer.getChannelData(0).slice(0, 200);
      const hash = simpleHash(Array.from(data).map(v => v.toFixed(8)).join(','));
      return { sampleRate: ctx.sampleRate, channels: buffer.numberOfChannels, hash };
    } catch (e) { return { sampleRate: null, channels: null, hash: null }; }
  }

  /** S005 — Canvas text rendering hash (font + subpixel rendering) */
  function getCanvasTextHash() {
    try {
      const c = document.createElement('canvas');
      c.width = 300; c.height = 60;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 300, 60);
      ctx.fillStyle = '#000'; ctx.font = '18px Times New Roman';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('Koin FP \u0391\u03b2\u03b3 \uD83D\uDD12 @#$', 10, 40);
      return simpleHash(c.toDataURL());
    } catch (e) { return null; }
  }

  /** S009 — Canvas geometry rendering hash (GPU anti-aliasing fingerprint) */
  function getCanvasGeometryHash() {
    try {
      const c = document.createElement('canvas');
      c.width = 200; c.height = 200;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#f00'; ctx.fillRect(10, 10, 80, 80);
      ctx.fillStyle = 'rgba(0,128,0,0.5)';
      ctx.beginPath(); ctx.arc(100, 100, 60, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#00f'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(10, 190); ctx.lineTo(190, 10); ctx.stroke();
      return simpleHash(c.toDataURL());
    } catch (e) { return null; }
  }

  /** S006 — Speech synthesis voices instaladas */
  async function getSpeechVoices() {
    try {
      if (!window.speechSynthesis) return { voices: [], count: 0 };
      const read = () => {
        const v = speechSynthesis.getVoices();
        return { voices: v.slice(0, 5).map(vv => ({ name: vv.name, lang: vv.lang })), count: v.length };
      };
      const initial = read();
      if (initial.count > 0) return initial;
      return new Promise(resolve => {
        speechSynthesis.onvoiceschanged = () => resolve(read());
        setTimeout(() => resolve(read()), 800);
      });
    } catch (e) { return { voices: [], count: 0 }; }
  }

  /** S007 — Media devices (cantidad por tipo, sin etiquetas = sin permiso) */
  async function getMediaDevices() {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return { audioInputs: null, videoInputs: null };
      const devs = await navigator.mediaDevices.enumerateDevices();
      return {
        audioInputs: devs.filter(d => d.kind === 'audioinput').length,
        videoInputs: devs.filter(d => d.kind === 'videoinput').length
      };
    } catch (e) { return { audioInputs: null, videoInputs: null }; }
  }

  /** S014 — WebDriver flag (Selenium, Playwright, etc.) */
  function detectWebDriver() {
    try { return navigator.webdriver === true; } catch (e) { return null; }
  }

  /** S020 — Props de window inyectadas por frameworks de automatización */
  function detectAutomationArtifacts() {
    const keys = [
      '_phantom', 'callPhantom', '_nightmare',
      '__selenium_evaluate', '__webdriver_evaluate', '__selenium_unwrapped',
      '__webdriver_script_function', '_Selenium_IDE_Recorder',
      '__driver_evaluate', '__fxdriver_evaluate', '__driver_unwrapped',
      '__fxdriver_unwrapped', 'domAutomation', 'domAutomationController'
    ];
    return keys.filter(k => { try { return window[k] !== undefined; } catch (e) { return false; } });
  }

  // ─── Helpers iteración 2 ──────────────────────────────────────────────────

  /** S027 — WebRTC IP leak via ICE candidates (no permissions required) */
  async function getWebRTCIPs() {
    try {
      if (!window.RTCPeerConnection) return { localIPs: [], success: false };
      const ips = new Set();
      const pc  = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      return await new Promise(resolve => {
        const done = () => { try { pc.close(); } catch(e) {} resolve({ localIPs: [...ips], success: true }); };
        const timer = setTimeout(done, 2000);
        pc.onicecandidate = e => {
          if (!e.candidate) { clearTimeout(timer); return done(); }
          const m = e.candidate.candidate.match(/\b(\d{1,3}\.){3}\d{1,3}\b/);
          if (m) ips.add(m[0]);
        };
        pc.createDataChannel('');
        pc.createOffer().then(o => pc.setLocalDescription(o)).catch(done);
      });
    } catch (e) { return { localIPs: [], success: false }; }
  }

  /** S040 — Network downlink, rtt, effectiveType */
  function getNetworkInfo() {
    try {
      const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (!c) return { downlink: null, rtt: null, effectiveType: null };
      return { downlink: c.downlink ?? null, rtt: c.rtt ?? null, effectiveType: c.effectiveType ?? null };
    } catch (e) { return { downlink: null, rtt: null, effectiveType: null }; }
  }

  /** S054 — HTTP version via Performance Navigation Timing */
  function getHTTPVersion() {
    try { return performance.getEntriesByType?.('navigation')?.[0]?.nextHopProtocol || null; }
    catch (e) { return null; }
  }

  /** S026 — Font detection via canvas measurement (top 40 fonts) */
  function detectFonts() {
    try {
      const TEST = 'mmmmmmmmmmlli', SIZE = '48px';
      const BASES = ['monospace', 'sans-serif', 'serif'];
      const LIST  = [
        'Arial','Arial Black','Arial Narrow','Calibri','Cambria','Comic Sans MS',
        'Consolas','Courier New','Georgia','Helvetica','Impact','Lucida Console',
        'Lucida Sans Unicode','MS Gothic','Palatino Linotype','Segoe UI','Tahoma',
        'Times New Roman','Trebuchet MS','Verdana','Gill Sans','Garamond',
        'Century Gothic','Franklin Gothic Medium','Rockwell','Baskerville',
        'Roboto','Open Sans','Lato','Montserrat','Ubuntu','Noto Sans',
        'Source Sans Pro','Myriad Pro','Futura','Didot','Optima',
        'Helvetica Neue','SF Pro Text','Fira Sans',
      ];
      const c = document.createElement('canvas'), ctx = c.getContext('2d');
      const bw = {};
      BASES.forEach(f => { ctx.font = `${SIZE} ${f}`; bw[f] = ctx.measureText(TEST).width; });
      const detected = LIST.filter(font =>
        BASES.some(base => { ctx.font = `${SIZE} '${font}',${base}`; return ctx.measureText(TEST).width !== bw[base]; })
      );
      return { detected: detected.slice(0, 20), count: detected.length, hash: simpleHash(detected.join(',')) };
    } catch (e) { return { detected: [], count: 0, hash: null }; }
  }

  /** S030 + S017b — Headless browser detection */
  function detectHeadless() {
    const indicators = [];
    try {
      if (/HeadlessChrome/.test(navigator.userAgent))               indicators.push('ua_headless');
      if ((navigator.plugins?.length ?? 1) === 0)                   indicators.push('no_plugins');
      if (window.outerWidth === 0)                                   indicators.push('zero_outer_width');
      if (window.outerHeight === 0)                                  indicators.push('zero_outer_height');
      if (!window.chrome && /Chrome/.test(navigator.userAgent))     indicators.push('missing_chrome_obj');
      if ((navigator.languages?.length ?? 1) === 0)                 indicators.push('no_languages');
    } catch (e) {}
    return { indicators, score: indicators.length };
  }

  /** S031 — Canvas emoji rendering hash */
  function getCanvasEmojiHash() {
    try {
      const c = document.createElement('canvas'); c.width = 200; c.height = 60;
      const ctx = c.getContext('2d');
      ctx.font = '36px serif'; ctx.textBaseline = 'top';
      ctx.fillText('\uD83D\uDE00\uD83D\uDD12\uD83C\uDFA8\uD83C\uDF0D', 10, 5);
      return simpleHash(c.toDataURL());
    } catch (e) { return null; }
  }

  /** S033 — Audio latency via real AudioContext (baseLatency, outputLatency) */
  function getAudioLatency() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return { baseLatency: null, outputLatency: null, state: null };
      const ctx = new AC();
      const r = { baseLatency: ctx.baseLatency ?? null, outputLatency: ctx.outputLatency ?? null, state: ctx.state ?? null };
      ctx.close();
      return r;
    } catch (e) { return { baseLatency: null, outputLatency: null, state: null }; }
  }

  /** S034 — Plugin enumeration */
  function getPlugins() {
    try {
      const p = navigator.plugins;
      if (!p) return { count: null, names: [] };
      return { count: p.length, names: Array.from(p).map(pl => pl.name).slice(0, 10) };
    } catch (e) { return { count: null, names: [] }; }
  }

  /** S041/S042/S044/S045/S028b — System API availability */
  function checkSystemAPIs() {
    return {
      webAssembly:          typeof WebAssembly       !== 'undefined',
      cryptoAPI:            typeof crypto?.subtle    !== 'undefined',
      webSQL:               typeof window.openDatabase !== 'undefined',
      serviceWorker:        'serviceWorker'  in navigator,
      geolocationAvailable: 'geolocation'   in navigator,
      mimeTypesCount:       navigator.mimeTypes?.length ?? null,
    };
  }

  // ─── Helpers iteración 3 ──────────────────────────────────────────────────

  /** S046 — DevTools detection via window size diff */
  function detectDevTools() {
    try {
      const w = window.outerWidth - window.innerWidth;
      const h = window.outerHeight - window.innerHeight;
      const open = w > 160 || h > 200;
      return { detected: open, method: open ? (h > 200 ? 'height' : 'width') : null };
    } catch (e) { return { detected: false, method: null }; }
  }

  /** S049 — Anti-fingerprinting tool detection */
  function detectAntiFingerprinting() {
    try {
      const brave = !!(navigator.brave);
      const tools = [];
      if (brave) tools.push('Brave');
      return { detected: tools.length > 0, tools, braveBrowser: brave };
    } catch (e) { return { detected: false, tools: [], braveBrowser: false }; }
  }

  /** S059 — Canvas fingerprint poisoning: render twice and compare */
  function detectCanvasPoisoning() {
    try {
      const draw = () => {
        const c = document.createElement('canvas'); c.width = 200; c.height = 50;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#f60'; ctx.fillRect(0, 0, 200, 50);
        ctx.fillStyle = '#069'; ctx.font = '14px Arial';
        ctx.fillText('koin-poison-test \uD83D\uDD12', 10, 30);
        return c.toDataURL();
      };
      const a = draw(), b = draw();
      return { detected: a !== b, consistency: a === b ? 1.0 : 0.0 };
    } catch (e) { return { detected: false, consistency: null }; }
  }

  /** S048 — Behavioral biometrics: mouse curvature from trajectory */
  function calcBiometrics() {
    const m = _bhv.moves;
    if (m.length < 20) return { curvature: null, humanLikeness: null };
    let sum = 0, cnt = 0;
    for (let i = 2; i < m.length; i++) {
      const dx1 = m[i-1].x - m[i-2].x, dy1 = m[i-1].y - m[i-2].y;
      const dx2 = m[i].x   - m[i-1].x, dy2 = m[i].y   - m[i-1].y;
      const l1 = Math.hypot(dx1, dy1), l2 = Math.hypot(dx2, dy2);
      if (l1 > 0 && l2 > 0) { sum += Math.acos(Math.max(-1, Math.min(1, (dx1*dx2 + dy1*dy2) / (l1*l2)))); cnt++; }
    }
    const c = cnt > 0 ? parseFloat((sum / cnt).toFixed(4)) : null;
    return { curvature: c, humanLikeness: c != null ? parseFloat(Math.max(0, Math.min(1, 1 - Math.abs(c - 0.5) / 0.5)).toFixed(3)) : null };
  }

  /** S057 — DOM manipulation speed benchmark */
  function measureDOMSpeed() {
    try {
      const frag = document.createDocumentFragment();
      const t0 = performance.now();
      for (let i = 0; i < 100; i++) { const el = document.createElement('div'); el.textContent = i; frag.appendChild(el); }
      const wrap = document.createElement('div');
      document.body.appendChild(wrap); wrap.appendChild(frag); document.body.removeChild(wrap);
      return parseFloat((performance.now() - t0).toFixed(3));
    } catch (e) { return null; }
  }

  /** S066 — Resource loading count via Performance API */
  function getResourceLoadingInfo() {
    try {
      const entries = performance.getEntriesByType?.('resource') || [];
      return { count: entries.length };
    } catch (e) { return { count: 0 }; }
  }

  /** S050 — WebAssembly fingerprint: compile smallest valid module */
  async function wasmFingerprint() {
    try {
      if (typeof WebAssembly === 'undefined') return { supported: false, compileTimeMs: null };
      const bytes = new Uint8Array([0x00,0x61,0x73,0x6d,0x01,0x00,0x00,0x00]);
      const t0 = performance.now();
      await WebAssembly.compile(bytes);
      return { supported: true, compileTimeMs: parseFloat((performance.now() - t0).toFixed(3)) };
    } catch (e) { return { supported: false, compileTimeMs: null }; }
  }

  /** S053 — GPU performance via WebGL clear loop */
  function measureGPUPerformance() {
    try {
      const c = document.createElement('canvas'); c.width = 128; c.height = 128;
      const gl = c.getContext('webgl');
      if (!gl) return { score: null };
      const N = 200, t0 = performance.now();
      for (let i = 0; i < N; i++) { gl.clear(gl.COLOR_BUFFER_BIT); gl.flush(); }
      const ms = performance.now() - t0;
      return { score: parseFloat((N / ms * 1000).toFixed(0)), msFor200: parseFloat(ms.toFixed(2)) };
    } catch (e) { return { score: null }; }
  }

  /** S060 — WebGL WEBGL_lose_context extension support */
  function checkWebGLContextLoss() {
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl');
      return gl ? !!gl.getExtension('WEBGL_lose_context') : null;
    } catch (e) { return null; }
  }

  /** S063 — WebRTC data channel creation */
  async function checkWebRTCDataChannel() {
    try {
      if (!window.RTCPeerConnection) return { supported: false };
      const pc = new RTCPeerConnection();
      const supported = !!pc.createDataChannel('t');
      pc.close();
      return { supported };
    } catch (e) { return { supported: false }; }
  }

  /** S051 — performance.now() timing resolution (ms) */
  function getTimingResolution() {
    try {
      const s = Array.from({length: 20}, () => performance.now());
      const diffs = [];
      for (let i = 1; i < s.length; i++) { const d = s[i] - s[i-1]; if (d > 0) diffs.push(d); }
      return diffs.length ? parseFloat(Math.min(...diffs).toFixed(6)) : null;
    } catch (e) { return null; }
  }

  /** S055 — CSS feature detection via CSS.supports() */
  function getCSSFeatures() {
    try {
      if (!window.CSS?.supports) return { count: 0 };
      const chk = {
        grid:             CSS.supports('display',       'grid'),
        flex:             CSS.supports('display',       'flex'),
        customProperties: CSS.supports('color',         'var(--t)'),
        containerQueries: CSS.supports('container-type','inline-size'),
        backdropFilter:   CSS.supports('backdrop-filter','blur(1px)'),
        aspectRatio:      CSS.supports('aspect-ratio',  '1'),
      };
      return { ...chk, count: Object.values(chk).filter(Boolean).length };
    } catch (e) { return { count: 0 }; }
  }

  /** S056 — JS engine identification via Error.stack format */
  function getJSEngineInfo() {
    try {
      const stack = new Error().stack || '';
      const v8 = /\s+at\s/.test(stack);
      const sm = /@/.test(stack) && !v8;
      return {
        name:        v8 ? 'V8' : (sm ? 'SpiderMonkey' : 'JavaScriptCore'),
        stackFormat: v8 ? 'v8' : (sm ? 'spidermonkey' : 'jsc'),
      };
    } catch (e) { return { name: 'unknown', stackFormat: 'unknown' }; }
  }

  /** S062 — Permission states (query only, no request) */
  async function queryPermissions() {
    if (!navigator.permissions?.query) return {};
    const out = {};
    await Promise.all(['notifications','camera','microphone'].map(async name => {
      try { out[name] = (await navigator.permissions.query({ name })).state; }
      catch (e) { out[name] = 'unsupported'; }
    }));
    return out;
  }

  /** S068 + S052 — JS heap memory (Chrome only) */
  function getMemoryInfo() {
    try {
      const m = (performance).memory;
      if (!m) return { available: false };
      return { available: true, usedJSHeapSize: m.usedJSHeapSize, totalJSHeapSize: m.totalJSHeapSize };
    } catch (e) { return { available: false }; }
  }

  // ─── Helpers señales adicionales ─────────────────────────────────────────────

  /**
   * S058 — Event Propagation Patterns
   * Mide: delta entre la fase de captura y la fase de burbuja de un evento sintético
   *       Bots que inyectan eventos suelen tener delta=0 o delta negativo
   * Vector(es): BOT_DETECTION
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  function measureEventPropagation() {
    try {
      let captureTime = null, bubbleTime = null;
      const target = document.createElement('div');
      document.body.appendChild(target);
      const captureFn = () => { captureTime = performance.now(); };
      const bubbleFn  = () => { bubbleTime  = performance.now(); };
      target.addEventListener('click', captureFn, true);   // capture phase
      target.addEventListener('click', bubbleFn,  false);  // bubble phase
      target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      target.removeEventListener('click', captureFn, true);
      target.removeEventListener('click', bubbleFn,  false);
      document.body.removeChild(target);
      const delta = (captureTime !== null && bubbleTime !== null)
        ? parseFloat((bubbleTime - captureTime).toFixed(4)) : null;
      return { captureTime: captureTime !== null, bubbleTime: bubbleTime !== null, deltaBubbleMs: delta, suspicious: delta !== null && delta < 0 };
    } catch(e) { return { captureTime: null, bubbleTime: null, deltaBubbleMs: null, suspicious: null }; }
  }

  /**
   * S061 — Audio Context State Changes
   * Mide: estado inicial del AudioContext y si responde correctamente a close()
   *       En headless/automatizados, el estado puede ser 'suspended' permanente o no cambiar
   * Vector(es): DEVICE_INTEGRITY
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  function checkAudioContextState() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return { supported: false };
      const ctx = new AC();
      const initialState = ctx.state;
      ctx.close();
      return { supported: true, initialState, closedOk: true };
    } catch(e) { return { supported: false, initialState: null }; }
  }

  /**
   * S139 — WebAuthentication API (WebAuthn)
   * Mide: disponibilidad de PublicKeyCredential y navigator.credentials
   *       Presente en browsers modernos en contextos seguros (HTTPS / localhost)
   * Vector(es): DEVICE_INTEGRITY
   * Permiso: none (solo check, no request) | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  function checkWebAuthn() {
    return {
      supported:            typeof PublicKeyCredential !== 'undefined',
      credentialsAvailable: typeof navigator.credentials !== 'undefined',
    };
  }

  /**
   * S153–S156 — WebGPU: Compute capabilities, adapter info, features, limits
   * Mide: disponibilidad de la API WebGPU y detalles del adaptador GPU
   *       navigator.gpu presente → Chrome 113+ / Edge; ausente → Firefox / Safari / headless
   * Vector(es): DEVICE_INTEGRITY
   * Permiso: none | Compatibilidad: Chrome 113+ ✓ | Firefox ✗ | Safari ✗
   */
  async function getWebGPUInfo() {
    try {
      if (!navigator.gpu) return { supported: false };
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) return { supported: true, adapterAvailable: false };
      const info = adapter.info || {};
      const features = [...(adapter.features || [])];
      const limits   = {};
      if (adapter.limits) {
        ['maxTextureDimension2D','maxBufferSize','maxComputeWorkgroupsPerDimension','maxVertexBuffers']
          .forEach(k => { if (adapter.limits[k] !== undefined) limits[k] = adapter.limits[k]; });
      }
      return { supported: true, adapterAvailable: true, vendor: info.vendor || null, architecture: info.architecture || null, device: info.device || null, features: features.slice(0, 10), limits };
    } catch(e) { return { supported: typeof navigator.gpu !== 'undefined', adapterAvailable: false }; }
  }

  /**
   * S166 — WebDriver BiDi Support
   * Mide: presencia de globals del protocolo WebDriver BiDi y CDP
   *       Indica browser controlado por herramienta de testing moderna
   * Vector(es): BROWSER_AUTOMATION
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✗
   */
  function detectWebDriverBiDi() {
    const indicators = [];
    try {
      ['__webdriver_bidi', '__cdp', '__cdc_asdjflasutopfhvcZLmcfl_Promise',
       'cdc_adoQpoasnfa76pfcZLmcfl_Array', 'cdc_adoQpoasnfa76pfcZLmcfl_Promise',
       'cdc_adoQpoasnfa76pfcZLmcfl_Symbol'].forEach(g => {
        try { if (window[g] !== undefined) indicators.push(g); } catch(e) {}
      });
      // CDP: chrome.debugger property presence
      try { if (window.chrome?.debugger) indicators.push('chrome_debugger'); } catch(e) {}
    } catch(e) {}
    return { indicators, detected: indicators.length > 0 };
  }

  /**
   * S168 — Puppeteer Detection Extended
   * Mide: artifacts específicos de Puppeteer más allá del webdriver flag:
   *       function overrides, cdc_ globals, __puppeteer namespace, page.evaluate artifacts
   * Vector(es): BROWSER_AUTOMATION
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✗ | Safari ✗
   */
  function detectPuppeteer() {
    const indicators = [];
    try {
      ['__puppeteer_evaluation_script_id__', '__puppeteer__', 'puppeteer',
       '__puppeteer_clock__', '__puppeteer_utility_world__'].forEach(g => {
        try { if (window[g] !== undefined) indicators.push(g); } catch(e) {}
      });
      // Puppeteer modifica navigator.plugins a veces vacía
      try {
        const err = new Error(); const stack = err.stack || '';
        if (/puppeteer/i.test(stack)) indicators.push('stack_puppeteer');
      } catch(e) {}
      // HTMLElement.toString override check
      try {
        const orig = HTMLElement.prototype.toString.toString();
        if (!/native code/i.test(orig)) indicators.push('htmlelement_tostring_patched');
      } catch(e) {}
    } catch(e) {}
    return { indicators, detected: indicators.length > 0 };
  }

  /**
   * S169 — Playwright Detection
   * Mide: globals y artifacts inyectados por Playwright
   *       Playwright usa un namespace distinto a Puppeteer
   * Vector(es): BROWSER_AUTOMATION
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  function detectPlaywright() {
    const indicators = [];
    try {
      ['__playwright', '__pw_manual', '__pw_api_test__', 'playwright',
       '__playwright_clock__', '__playwright_utility_world__'].forEach(g => {
        try { if (window[g] !== undefined) indicators.push(g); } catch(e) {}
      });
      // Playwright inyecta en el user-agent en algunas versiones
      if (/playwright/i.test(navigator.userAgent)) indicators.push('ua_playwright');
      // Check para frame playwright
      try { if (window.frames['playwright']) indicators.push('frame_playwright'); } catch(e) {}
    } catch(e) {}
    return { indicators, detected: indicators.length > 0 };
  }

  /**
   * S170 — Selenium Grid Detection
   * Mide: artifacts específicos de Selenium Grid y Selenium IDE
   *       Selenium Grid usa metadata en el DOM y globals de comunicación
   * Vector(es): BROWSER_AUTOMATION
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  function detectSeleniumGrid() {
    const indicators = [];
    try {
      // HTML attribute inyectado por Selenium
      try {
        const attr = document.documentElement.getAttribute('webdriver');
        if (attr !== null) indicators.push('html_webdriver_attr');
      } catch(e) {}
      // Selenium Grid / IDE globals
      ['_Selenium_IDE_Recorder', 'selenium', '__selenium_browserVersion',
       '__selenium_browserName', 'SE_CDP', 'SE_CDP_IMPLEMENTED_WS'].forEach(g => {
        try { if (window[g] !== undefined) indicators.push(g); } catch(e) {}
      });
      // Stack trace check
      try {
        const stack = new Error().stack || '';
        if (/selenium/i.test(stack)) indicators.push('stack_selenium');
      } catch(e) {}
    } catch(e) {}
    return { indicators, detected: indicators.length > 0 };
  }

  // ─── Helpers FingerprintJS signals ───────────────────────────────────────────

  /**
   * hardware.mathFingerprint — Hash de resultados de operaciones Math
   * Mide: diferencias de precisión float por arquitectura, JS engine y compilador JIT
   * Vector(es): Browser Spoofing, Device Integrity
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  function getMathFingerprint() {
    try {
      const ops = [
        Math.acos(0.5),    Math.acosh(1.5),   Math.asin(0.5),    Math.asinh(0.5),
        Math.atan(0.5),    Math.atanh(0.5),    Math.atan2(1, 2),  Math.cbrt(2),
        Math.cos(0.1),     Math.cosh(0.1),     Math.exp(1),       Math.expm1(0.1),
        Math.hypot(2, 3),  Math.log(2),        Math.log10(2),     Math.log1p(1),
        Math.log2(2),      Math.pow(2, 0.1),   Math.sin(0.5),     Math.sinh(0.5),
        Math.sqrt(2),      Math.tan(1),        Math.tanh(0.5),
      ]
      return simpleHash(ops.map(v => v.toFixed(15)).join(','))
    } catch (e) { return null }
  }

  /**
   * hardware.architecture — Arquitectura de CPU via WASM SIMD y platform hints
   * Mide: x86 / arm / unknown — diferenciador de hardware real vs emulación
   * Vector(es): Device Integrity, Emulator/VM
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  function detectArchitecture() {
    try {
      const p = (navigator.userAgentData?.platform || navigator.platform || '').toLowerCase()
      if (/arm|aarch64/.test(p)) return 'arm'
      if (/win32|win64|x86|linux x86/.test(p)) return 'x86'
      // WASM SIMD: compiled module with i32x4.splat — soportado en x86 + arm64
      if (typeof WebAssembly !== 'undefined' && WebAssembly.validate) {
        const simd = WebAssembly.validate(new Uint8Array([
          0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,10,1,8,0,65,0,253,15,253,98,11
        ]))
        return simd ? 'simd_capable' : 'unknown'
      }
      return 'unknown'
    } catch (e) { return 'unknown' }
  }

  /**
   * evasion.domBlockers — Detección de ad blockers via elementos señuelo
   * Mide: si extensiones de ad blocking ocultan elementos con IDs/clases conocidas
   * Vector(es): Anti-Fingerprinting
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  function detectDOMBlockers() {
    try {
      const decoys = ['ad', 'ads', 'banner_ad', 'adsbox', 'doubleclick', 'textads']
      const container = document.createElement('div')
      container.style.cssText = 'position:fixed;top:-9999px;width:1px;height:1px'
      document.body.appendChild(container)
      let blocked = 0
      for (const cls of decoys) {
        const el = document.createElement('div')
        el.className = cls
        el.style.cssText = 'width:1px;height:1px'
        container.appendChild(el)
        if (el.offsetParent === null || getComputedStyle(el).display === 'none') blocked++
      }
      document.body.removeChild(container)
      return { detected: blocked > 0, blockedCount: blocked, total: decoys.length }
    } catch (e) { return { detected: false, blockedCount: 0, total: 0 } }
  }

  /**
   * system.mediaFeatures — Preferencias del sistema via matchMedia
   * Mide: colorGamut, contrastPreference, invertedColors, forcedColors, reducedMotion, hdr
   * Vector(es): Device Integrity, Browser Spoofing
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  function getMediaFeatures() {
    const mq = q => { try { return window.matchMedia(q).matches } catch (e) { return null } }
    return {
      colorGamut:         mq('(color-gamut: rec2020)') ? 'rec2020' : (mq('(color-gamut: p3)') ? 'p3' : (mq('(color-gamut: srgb)') ? 'srgb' : 'unknown')),
      contrastPreference: mq('(prefers-contrast: more)') ? 'more' : (mq('(prefers-contrast: less)') ? 'less' : (mq('(prefers-contrast: forced)') ? 'forced' : 'no-preference')),
      invertedColors:     mq('(inverted-colors: inverted)'),
      forcedColors:       mq('(forced-colors: active)'),
      reducedMotion:      mq('(prefers-reduced-motion: reduce)'),
      hdr:                mq('(dynamic-range: high)'),
    }
  }

  /**
   * system.intlLocale — Locale real del sistema via Intl API
   * Mide: locale resuelto (ej: "es-AR") — diferente del navigator.language
   * Vector(es): Proxy/VPN, Browser Spoofing
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  function getIntlLocale() {
    try { return Intl.DateTimeFormat().resolvedOptions().locale } catch (e) { return null }
  }

  // ─── Helpers iteración 6 — AI Automation ────────────────────────────────────

  /**
   * S106 — AI Automation Patterns
   * Mide: score compuesto de anomalías comportamentales típicas de agentes AI:
   *   keyboard demasiado regular, clicks demasiado uniformes, mouse sin micro-variaciones
   * Vector(es): AI_AUTOMATION
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  function detectAIPatterns() {
    const flags = [];
    try {
      // Keyboard: CV < 0.05 → timing ultra-consistente (AI)
      if (_bhv.keyGaps.length >= 5) {
        const mean = _bhv.keyGaps.reduce((s, v) => s + v, 0) / _bhv.keyGaps.length;
        const std  = Math.sqrt(_bhv.keyGaps.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / _bhv.keyGaps.length);
        const cv   = mean > 0 ? std / mean : 0;
        if (cv < 0.05) flags.push('keyboard_too_regular');
      }
      // Clicks: intervalos con CV < 0.05
      if (_bhv.clicks.length >= 3) {
        const ints = _bhv.clicks.slice(1).map((t, i) => t - _bhv.clicks[i]);
        const mean = ints.reduce((s, v) => s + v, 0) / ints.length;
        const std  = Math.sqrt(ints.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / ints.length);
        if (mean > 0 && std / mean < 0.05) flags.push('clicks_too_regular');
      }
      // Mouse: entropía muy baja con muchas muestras → movimiento pre-programado
      if (_bhv.moves.length >= 30) {
        const speeds = _bhv.moves.slice(1).map((m, i) => {
          const dt = m.t - _bhv.moves[i].t;
          return dt > 0 ? Math.hypot(m.x - _bhv.moves[i].x, m.y - _bhv.moves[i].y) / dt : 0;
        }).filter(s => s > 0);
        if (speeds.length > 5) {
          const mean = speeds.reduce((s, v) => s + v, 0) / speeds.length;
          const std  = Math.sqrt(speeds.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / speeds.length);
          if (mean > 0 && std / mean < 0.08) flags.push('mouse_speed_too_uniform');
        }
      }
    } catch(e) {}
    return { flags, score: flags.length, suspiciousAI: flags.length >= 2 };
  }

  /**
   * S107 — ML Model Inference Detection
   * Mide: presencia de frameworks ML en el browser (TensorFlow.js, ONNX, etc.)
   *       que podrían indicar un agente AI controlando la sesión
   * Vector(es): AI_AUTOMATION
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  function detectMLFrameworks() {
    const detected = [];
    try {
      ['tf', 'ort', 'brain', 'ml5', 'synaptic', 'neataptic', 'convnetjs', 'stdlib'].forEach(g => {
        if (typeof window[g] !== 'undefined') detected.push(g);
      });
    } catch(e) {}
    return { detected, count: detected.length };
  }

  /**
   * S108 — Randomness Quality Analysis
   * Mide: calidad de Math.random() — si está interceptado/seeded, la distribución falla
   *       Bots y entornos controlados a veces reemplazan Math.random con PRNG fijos
   * Vector(es): AI_AUTOMATION
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  function analyzeRandomness() {
    try {
      const N = 200;
      const vals = Array.from({ length: N }, () => Math.random());
      // Chi-square sobre 10 buckets
      const buckets = new Array(10).fill(0);
      vals.forEach(v => buckets[Math.min(9, Math.floor(v * 10))]++);
      const expected  = N / 10;
      const chiSquare = parseFloat(buckets.reduce((s, b) => s + Math.pow(b - expected, 2) / expected, 0).toFixed(3));
      // Pares demasiado similares → PRNG seeded
      const suspPairs = vals.slice(1).filter((v, i) => Math.abs(v - vals[i]) < 0.001).length;
      const isNative  = /native code/i.test(Function.prototype.toString.call(Math.random));
      // chi-square df=9, p=0.05 → threshold ~16.9; >25 = muy sospechoso
      return { chiSquare, suspiciousPairs: suspPairs, isNative, possiblySeeded: !isNative || chiSquare > 25 || suspPairs > 5 };
    } catch(e) { return { chiSquare: null, isNative: null, possiblySeeded: null }; }
  }

  /**
   * S109 — Natural Language / Typing Patterns
   * Mide: pausas en límites de palabras (>300ms) — humanos pausan entre palabras,
   *       los agentes AI tienden a mantener timing uniforme
   * Vector(es): AI_AUTOMATION
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  function analyzeTypingPatterns() {
    if (_bhv.keyGaps.length < 8) return { insufficient: true, wordPauses: 0, fastKeys: 0 };
    try {
      const wordPauses = _bhv.keyGaps.filter(g => g > 300).length;
      const fastKeys   = _bhv.keyGaps.filter(g => g < 60).length;
      const ratio      = _bhv.keyGaps.length > 0 ? wordPauses / _bhv.keyGaps.length : 0;
      return {
        wordPauses,
        fastKeys,
        pauseRatio:        parseFloat(ratio.toFixed(3)),
        humanLikeTyping:   wordPauses > 0 && ratio > 0.05,
        insufficient:      false,
      };
    } catch(e) { return { insufficient: true, wordPauses: 0, fastKeys: 0 }; }
  }

  /**
   * S110 — Response Time Consistency
   * Mide: CV de los intervalos entre clicks — CV < 0.1 con 3+ clicks es señal de AI
   *       Humanos tienen jitter natural, los agentes AI son demasiado consistentes
   * Vector(es): AI_AUTOMATION
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  function analyzeResponseTimeConsistency() {
    if (_bhv.clicks.length < 3) return { insufficient: true, cv: null, tooConsistent: false };
    try {
      const ints = _bhv.clicks.slice(1).map((t, i) => t - _bhv.clicks[i]);
      const mean = ints.reduce((s, v) => s + v, 0) / ints.length;
      const std  = Math.sqrt(ints.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / ints.length);
      const cv   = mean > 0 ? parseFloat((std / mean).toFixed(3)) : null;
      return { mean: parseFloat(mean.toFixed(1)), stddev: parseFloat(std.toFixed(1)), cv, tooConsistent: cv !== null && cv < 0.10, insufficient: false };
    } catch(e) { return { insufficient: true, cv: null, tooConsistent: false }; }
  }

  /**
   * S111 — Decision Tree / Mouse Path Straightness
   * Mide: ratio distancia-directa / longitud-total del camino del mouse
   *       Ratio > 0.95 con 15+ puntos → camino perfectamente recto = script/AI
   * Vector(es): AI_AUTOMATION
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  function analyzeDecisionTreePatterns() {
    const m = _bhv.moves;
    if (m.length < 10) return { insufficient: true, straightnessRatio: null, suspiciouslyStraight: false };
    try {
      let totalLen = 0;
      for (let i = 1; i < m.length; i++) totalLen += Math.hypot(m[i].x - m[i-1].x, m[i].y - m[i-1].y);
      const direct = Math.hypot(m[m.length-1].x - m[0].x, m[m.length-1].y - m[0].y);
      const ratio  = totalLen > 0 ? parseFloat((direct / totalLen).toFixed(3)) : 0;
      return { straightnessRatio: ratio, suspiciouslyStraight: ratio > 0.95 && m.length > 15, insufficient: false };
    } catch(e) { return { insufficient: true, straightnessRatio: null, suspiciouslyStraight: false }; }
  }

  // ─── Helpers iteración 4 ──────────────────────────────────────────────────

  /**
   * Señales: S072-S085b — Modern Browser APIs (availability check, sin permisos)
   * Mide: presencia de APIs modernas → diferencia plataformas y browsers
   * Vector(es): Device Integrity, Browser Spoofing
   * Permiso: none | Compatibilidad: varía por API y browser
   */
  function checkModernAPIs() {
    try {
      return {
        vibration:      typeof navigator.vibrate        !== 'undefined',
        gamepad:        typeof navigator.getGamepads    !== 'undefined',
        bluetooth:      typeof navigator.bluetooth      !== 'undefined',
        usb:            typeof navigator.usb            !== 'undefined',
        paymentRequest: typeof PaymentRequest           !== 'undefined',
        share:          typeof navigator.share          !== 'undefined',
        notifications:  (() => { try { return Notification?.permission || 'unsupported'; } catch(e) { return 'unsupported'; } })(),
        fullscreen:     !!document.fullscreenEnabled,
        pip:            !!document.pictureInPictureEnabled,
        locks:          typeof navigator.locks          !== 'undefined',
        wakeLock:       typeof navigator.wakeLock       !== 'undefined',
        serial:         typeof navigator.serial         !== 'undefined',
      };
    } catch(e) { return {}; }
  }

  // ─── Helpers iteración 5 ──────────────────────────────────────────────────

  /**
   * Señal: S088 — Touch event consistency
   * Mide: coherencia entre TouchEvent API y maxTouchPoints
   * Vector(es): Mobile Emulation
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  function checkTouchConsistency() {
    try {
      const hasTouchAPI = 'ontouchstart' in window || typeof TouchEvent !== 'undefined';
      const points = navigator.maxTouchPoints ?? 0;
      return { hasTouchAPI, maxTouchPoints: points, consistent: hasTouchAPI === (points > 0) };
    } catch(e) { return { hasTouchAPI: null, maxTouchPoints: null, consistent: null }; }
  }

  /**
   * Señal: S089 — Screen orientation API details
   * Mide: tipo y ángulo de orientación, soporte de lock
   * Vector(es): Mobile Emulation, Device Integrity
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ⚠️
   */
  function getScreenOrientationDetails() {
    try {
      return {
        type:          screen.orientation?.type  ?? null,
        angle:         screen.orientation?.angle ?? null,
        lockSupported: typeof screen.orientation?.lock === 'function',
      };
    } catch(e) { return { type: null, angle: null, lockSupported: false }; }
  }

  /**
   * Señal: S090 — Privacy tools advanced detection
   * Mide: Brave, Firefox RFP, Tor Browser, DoNotTrack, media bloqueado
   * Vector(es): Fingerprint Resistance, Anti-Fingerprinting
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  function detectPrivacyToolsAdvanced() {
    const tools = [];
    const flags = {};
    try {
      if (navigator.brave) { tools.push('brave'); flags.brave = true; }
      // Firefox Resist Fingerprinting normaliza pantalla a 1000×900
      if (screen.width === 1000 && screen.height === 900) { tools.push('firefox_rfp'); flags.firefoxRFP = true; }
      // Tor Browser — tamaños de pantalla muy específicos y redondeados
      if (!flags.firefoxRFP && screen.width % 200 === 0 && screen.height % 100 === 0 && screen.width <= 1000) {
        tools.push('possible_tor'); flags.possibleTor = true;
      }
      flags.dntEnabled          = navigator.doNotTrack === '1';
      flags.mediaDevicesBlocked = !navigator.mediaDevices?.enumerateDevices;
    } catch(e) {}
    return { tools, detected: tools.length > 0, flags };
  }

  /**
   * Señal: S091 — Browser extension detection patterns
   * Mide: globals inyectados, Chrome runtime, variables conocidas
   * Vector(es): Fingerprint Resistance
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ⚠️ | Safari ✗
   */
  function detectExtensions() {
    const detected = [];
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime?.id) detected.push('chrome_extension_active');
      ['ethereum', 'web3', '__REACT_DEVTOOLS_GLOBAL_HOOK__'].forEach(g => {
        if (window[g] !== undefined) detected.push(g.replace(/__/g, '').toLowerCase());
      });
    } catch(e) {}
    return { detected, count: detected.length };
  }

  /**
   * Señal: S092 — Virtual machine hardware indicators
   * Mide: strings de GPU típicos de VM, resoluciones, cores bajos
   * Vector(es): Device Integrity, Emulator/VM
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  function detectVMIndicators() {
    const indicators = [];
    try {
      const gpuStr = [gpuVendor, gpuName].join(' ').toLowerCase();
      ['vmware','virtualbox','svga','llvmpipe','mesa offscreen','swiftshader','microsoft basic render','parallels'].forEach(p => {
        if (gpuStr.includes(p)) indicators.push('vm_gpu:' + p);
      });
      if ([[800,600],[1024,768],[1280,800],[1024,600]].some(([w,h]) => screen.width === w && screen.height === h)) {
        indicators.push('vm_screen_resolution');
      }
      if ((navigator.hardwareConcurrency ?? 4) <= 2) indicators.push('low_core_count');
    } catch(e) {}
    return { indicators, score: indicators.length };
  }

  /**
   * Señal: S093+S094 — Environment and sandboxing detection
   * Mide: iframe, opener, storage bloqueado, window.name
   * Vector(es): Environment Manipulation
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  function detectEnvironmentFlags() {
    try {
      return {
        isIframe:         window !== window.top,
        hasOpener:        window.opener !== null,
        sandboxedStorage: (() => { try { localStorage.getItem('_t'); return false; } catch(e) { return true; } })(),
        windowNameSet:    !!window.name,
      };
    } catch(e) { return {}; }
  }

  /**
   * Señal: S095 — Browser runtime / process analysis
   * Mide: Chromium vs Firefox vs Safari, versión de Chrome
   * Vector(es): Browser Spoofing
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  function getBrowserRuntime() {
    try {
      const v = navigator.userAgent;
      return {
        chromium:      !!(window.chrome),
        firefox:       typeof InstallTrigger !== 'undefined',
        safari:        /^((?!chrome|android).)*safari/i.test(v),
        chromeVersion: (() => { const m = v.match(/Chrome\/(\d+)/); return m ? parseInt(m[1]) : null; })(),
      };
    } catch(e) { return {}; }
  }

  /**
   * Señal: S096 — Memory allocation speed
   * Mide: tiempo de allocar 5k objetos → baseline de JS engine speed
   * Vector(es): Device Integrity
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  function testMemoryAllocation() {
    try {
      const t0 = performance.now();
      const a = new Array(5000).fill(0).map((_, i) => ({ i, s: String(i) }));
      const ms = parseFloat((performance.now() - t0).toFixed(3));
      void a;
      return { allocationMs: ms };
    } catch(e) { return { allocationMs: null }; }
  }

  /**
   * Señal: S097 — CPU throttling detection
   * Mide: ratio entre primer y último run de benchmark → thermal throttling
   * Vector(es): Device Integrity, Emulator/VM
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  function detectCPUThrottling() {
    try {
      const times = [];
      for (let r = 0; r < 4; r++) {
        const t = performance.now();
        let x = 0;
        for (let i = 0; i < 100000; i++) x += Math.sqrt(i);
        times.push(parseFloat((performance.now() - t).toFixed(2)));
        void x;
      }
      const ratio = times[times.length - 1] / times[0];
      return { times, throttlingRatio: parseFloat(ratio.toFixed(3)), throttlingDetected: ratio > 1.5 };
    } catch(e) { return { throttlingDetected: null }; }
  }

  /**
   * Señal: S098 — Network interface analysis from WebRTC IPs
   * Mide: cantidad de interfaces, IPs privadas, IPv6
   * Vector(es): Network Anonymization, Proxy/VPN
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✗
   */
  function analyzeNetworkInterfaces(ips) {
    try {
      const hasPrivate = ips.some(ip => /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip));
      const hasIPv6 = ips.some(ip => ip.includes(':'));
      return { ipCount: ips.length, hasPrivateIP: hasPrivate, hasIPv6, multipleInterfaces: ips.length > 1 };
    } catch(e) { return { ipCount: 0, hasPrivateIP: false, hasIPv6: false, multipleInterfaces: false }; }
  }

  /**
   * Señal: S102 — WebSocket API support
   * Mide: disponibilidad de WebSocket y sus constantes
   * Vector(es): Bot Detection
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  function checkWebSocketAPI() {
    try {
      if (typeof WebSocket === 'undefined') return { supported: false };
      return { supported: true, hasReadyStates: typeof WebSocket.CONNECTING === 'number' };
    } catch(e) { return { supported: false }; }
  }

  /**
   * Señal: S104 — Cache API availability
   * Mide: CacheStorage y Storage Estimate API
   * Vector(es): Session Trust
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  function checkCacheAPIs() {
    return {
      cacheStorage:    'caches'   in window,
      storageEstimate: typeof navigator.storage?.estimate === 'function',
    };
  }

  /**
   * Señal: S105b — History API analysis
   * Mide: longitud del historial, pushState, scrollRestoration
   * Vector(es): Bot Detection
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  function analyzeHistoryAPI() {
    try {
      return {
        length:             history.length,
        pushStateSupported: typeof history.pushState === 'function',
        scrollRestoration:  history.scrollRestoration || null,
      };
    } catch(e) { return { length: null, pushStateSupported: false, scrollRestoration: null }; }
  }

  // ─── Captura de señales ────────────────────────────────────────────────────

  const ua  = navigator.userAgent;
  const gpu = getGPUInfo();
  const canvasId = getCanvasFingerprint();

  /**
   * Señal: userAgent
   * Mide: string completo del User-Agent
   * Vector(es): Browser Spoofing
   * Permiso: none
   * Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  const userAgent = ua;

  /**
   * Señal: os (platform)
   * Mide: plataforma del OS reportada por navigator.platform
   * Vector(es): Browser Spoofing, Emulator/VM
   * Permiso: none
   * Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  const os = navigator.platform;

  /**
   * Señal: osVersion
   * Mide: versión de OS derivada del UA
   * Vector(es): Browser Spoofing
   * Permiso: none
   * Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  const osVersion = detectOsVersion(ua);

  /**
   * Señal: cookiesEnabled
   * Mide: si el browser acepta cookies
   * Vector(es): Anti-Fingerprinting, Incognito
   * Permiso: none
   * Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  const cookiesEnabled = navigator.cookieEnabled;

  /**
   * Señal: localStorage
   * Mide: si localStorage está disponible y funcional
   * Vector(es): Anti-Fingerprinting, Incognito
   * Permiso: none
   * Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  const localStorageAvail = (() => {
    try { localStorage.setItem('_kfp', '1'); localStorage.removeItem('_kfp'); return true; }
    catch (e) { return false; }
  })();

  /**
   * Señal: lang
   * Mide: idioma preferido del browser
   * Vector(es): Proxy/VPN (timezone vs lang mismatch)
   * Permiso: none
   * Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  const lang = navigator.language;

  /**
   * Señal: platform
   * Mide: plataforma del OS (igual que os — campo explícito en schema)
   * Vector(es): Browser Spoofing
   * Permiso: none
   * Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  const platform = navigator.platform;

  /**
   * Señal: timezone
   * Mide: offset UTC en horas (negativo al oeste, positivo al este)
   * Vector(es): Proxy/VPN (timezone vs lang region mismatch)
   * Permiso: none
   * Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  const timezone = (() => {
    try { return new Date().getTimezoneOffset() / 60 * -1; }
    catch (e) { return null; }
  })();

  /**
   * Señal: screen.*
   * Mide: dimensiones y orientación de pantalla
   * Vector(es): Browser Spoofing (UA mobile + screen desktop), Emulator/VM
   * Permiso: none
   * Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  const screenData = {
    availHeight:  screen.availHeight  ?? null,
    availWidth:   screen.availWidth   ?? null,
    colorDepth:   screen.colorDepth   ?? null,
    width:        screen.width        ?? null,
    height:       screen.height       ?? null,
    orientation: (() => {
      try { return screen.orientation?.type ?? null; }
      catch (e) { return null; }
    })(),
  };

  /**
   * Señal: cpuSpeed.average
   * Mide: benchmark de CPU en ms — valores bajos = CPU rápida
   * Vector(es): Emulator/VM (CPU throttling), Bot
   * Permiso: none
   * Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  const cpuSpeed = { average: measureCpuSpeed() };

  /**
   * Señal: sessionStorage
   * Mide: si sessionStorage está disponible y funcional
   * Vector(es): Anti-Fingerprinting, Incognito
   * Permiso: none
   * Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  const sessionStorageAvail = (() => {
    try { sessionStorage.setItem('_kfp', '1'); sessionStorage.removeItem('_kfp'); return true; }
    catch (e) { return false; }
  })();

  /**
   * Señal: indexedDB
   * Mide: si IndexedDB está disponible
   * Vector(es): Anti-Fingerprinting, Incognito
   * Permiso: none
   * Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  const indexedDBAvail = !!window.indexedDB;

  /**
   * Señal: doNotTrack
   * Mide: si el usuario activó Do Not Track
   * Vector(es): Anti-Fingerprinting
   * Permiso: none
   * Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  const doNotTrack = navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes';

  /**
   * Señal: gpuVendor
   * Mide: vendor de GPU (Google Inc., NVIDIA, AMD, Apple)
   * Vector(es): Emulator/VM, Browser Spoofing
   * Permiso: none
   * Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  const gpuVendor = gpu.vendor;

  /**
   * Señal: gpuName
   * Mide: nombre del renderer de GPU — identifica driver y hardware
   * Vector(es): Emulator/VM, Browser Spoofing
   * Permiso: none
   * Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  const gpuName = gpu.name;

  /**
   * Señal: cores
   * Mide: número de núcleos lógicos del CPU
   * Vector(es): Emulator/VM (cores vs cpu_speed inconsistency)
   * Permiso: none
   * Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  const cores = navigator.hardwareConcurrency ?? null;

  /**
   * Señal: deviceMemory
   * Mide: RAM del dispositivo en GB (aproximada, buckets: 0.25, 0.5, 1, 2, 4, 8)
   * Vector(es): Emulator/VM (memory vs cpu_speed inconsistency)
   * Permiso: none
   * Compatibilidad: Chrome ✓ | Firefox ✗ | Safari ✗
   */
  const deviceMemory = navigator.deviceMemory ?? null;

  /**
   * Señal: devicePixelRatio
   * Mide: ratio de píxeles físicos/lógicos — revela HiDPI, scaling o spoofing
   * Vector(es): Browser Spoofing, Emulator/VM
   * Permiso: none
   * Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  const devicePixelRatio = window.devicePixelRatio ?? null;

  /**
   * Señal: privateBrowsing
   * Mide: si el browser corre en modo incógnito/privado
   * Vector(es): Incognito
   * Permiso: none
   * Compatibilidad: Chrome ✓ | Firefox ⚠️ | Safari ⚠️
   */
  const privateBrowsing = await detectPrivateBrowsing();

  /**
   * Señal: acceptContent
   * Mide: campo del schema de Koin — siempre "/" por spec
   * Vector(es): Browser Spoofing
   * Permiso: none
   * Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  const acceptContent = '/';

  /**
   * Señal: javaEnabled
   * Mide: si Java está habilitado (siempre false en browsers modernos)
   * Vector(es): Browser Spoofing (UA que dice tener Java pero no tiene)
   * Permiso: none
   * Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  const javaEnabled = (() => {
    try { return navigator.javaEnabled?.() ?? false; }
    catch (e) { return false; }
  })();

  /**
   * Señal: javaScriptEnabled
   * Mide: confirmación de que JS está activo (siempre true si este código corre)
   * Vector(es): N/A
   * Permiso: none
   * Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  const javaScriptEnabled = true;

  // ─── Señales iteración 1 ─────────────────────────────────────────────────

  /**
   * Señales: hardware.webgl.hash (S003) + hardware.webgl.extensions (S010)
   * Mide: fingerprint de GPU+driver via WebGL params y extensiones disponibles
   * Vector(es): Emulator/VM, Browser Spoofing
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  const webglExtensions = getWebGLExtensions();
  const webglHash       = getWebGLHash(webglExtensions);

  /**
   * Señal: hardware.audio.* (S004)
   * Mide: fingerprint de AudioContext via OfflineAudioContext rendering
   * Vector(es): Browser Spoofing, Anti-Fingerprinting
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  const audioFP = await getAudioFingerprint();

  /**
   * Señal: hardware.canvas.textHash (S005)
   * Mide: rendering de texto con font específica — varía por OS, driver, font engine
   * Vector(es): Browser Spoofing, Emulator/VM
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  const canvasTextHash = getCanvasTextHash();

  /**
   * Señal: hardware.canvas.geometryHash (S009)
   * Mide: rendering de geometría — diferencia GPU, AA algorithm y precision
   * Vector(es): Emulator/VM, Browser Spoofing
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  const canvasGeometryHash = getCanvasGeometryHash();

  /**
   * Señal: hardware.speech.* (S006)
   * Mide: voces TTS instaladas — fingerprint de OS + language packs
   * Vector(es): Browser Spoofing, Emulator/VM (0 voces en headless)
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  const speechData = await getSpeechVoices();

  /**
   * Señal: hardware.media.* (S007)
   * Mide: cantidad de devices de audio/video (sin labels = sin permiso)
   * Vector(es): Emulator/VM (0 devices en headless)
   * Permiso: none (labels requieren permiso) | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  const mediaData = await getMediaDevices();

  /**
   * Señales: behavioral.mouse.* (S001, S036)
   * Mide: entropía Shannon y aceleración del movimiento del mouse
   * Vector(es): Bot, Behavioral Anomaly
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  const mouseEntropy      = calcMouseEntropy();
  const mouseAcceleration = calcMouseAcceleration();

  /**
   * Señal: behavioral.keyboard.timingCV (S002)
   * Mide: CV del intervalo entre teclas — <0.15 sugiere bot/autofill
   * Vector(es): Bot, Behavioral Anomaly
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  const keyboardCV = calcKeyboardCV();

  /**
   * Señal: behavioral.clicks.* (S037)
   * Mide: intervalo promedio y stddev entre clicks
   * Vector(es): Bot
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  const clickStats = calcClickStats();

  /**
   * Señal: system.languages (S013 ext)
   * Mide: lista completa de idiomas preferidos — navigator.languages
   * Vector(es): Browser Spoofing, Proxy/VPN
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  const languages = (() => {
    try { return Array.from(navigator.languages || [navigator.language]).filter(Boolean); }
    catch (e) { return [navigator.language].filter(Boolean); }
  })();

  /**
   * Señal: system.touchSupport.maxTouchPoints (S019)
   * Mide: máximo de puntos táctiles simultáneos
   * Vector(es): Browser Spoofing (UA mobile + 0 touch points = emulación)
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  const maxTouchPoints = (() => {
    try { return navigator.maxTouchPoints ?? 0; } catch (e) { return 0; }
  })();

  /**
   * Señal: automation.webdriver (S014)
   * Mide: navigator.webdriver === true → Selenium, Playwright, Puppeteer
   * Vector(es): Bot
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  const webdriver = detectWebDriver();

  /**
   * Señal: automation.automationArtifacts (S020)
   * Mide: propiedades de window inyectadas por frameworks de automatización
   * Vector(es): Bot
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ✓ | Safari ✓
   */
  const automationArtifacts = detectAutomationArtifacts();

  /**
   * Señal: network.connectionType (S021)
   * Mide: tipo de conexión efectiva (wifi, cellular, ethernet, 4g, etc.)
   * Vector(es): Proxy/VPN
   * Permiso: none | Compatibilidad: Chrome ✓ | Firefox ⚠️ | Safari ✗
   */
  const connectionType = (() => {
    try {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      return conn ? (conn.effectiveType || conn.type || null) : null;
    } catch (e) { return null; }
  })();

  // ─── Señales iteración 2 ──────────────────────────────────────────────────

  const networkInfo  = getNetworkInfo();
  const httpVersion  = getHTTPVersion();
  const fontData     = detectFonts();
  const headlessData = detectHeadless();
  const emojiHash    = getCanvasEmojiHash();
  const audioLatency = getAudioLatency();
  const pluginsData  = getPlugins();
  const systemAPIs   = checkSystemAPIs();
  const scrollData   = { events: _bhv.scrollEvents, dY: Math.round(_bhv.scrollDY) };
  const focusData    = { blurCount: _bhv.blurCount };

  // ─── Señales iteración 3 ──────────────────────────────────────────────────

  const devToolsData     = detectDevTools();
  const antiFPData       = detectAntiFingerprinting();
  const canvasPoisonData = detectCanvasPoisoning();
  const biometrics       = calcBiometrics();
  const domSpeed         = measureDOMSpeed();
  const resourceLoading  = getResourceLoadingInfo();
  const gpuPerf          = measureGPUPerformance();
  const webglCtxLoss     = checkWebGLContextLoss();
  const timingResolution = getTimingResolution();
  const cssFeatures      = getCSSFeatures();
  const jsEngine         = getJSEngineInfo();
  const memoryInfo       = getMemoryInfo();
  const systemFlagsIter3 = {
    sharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
    webXR:             'xr' in navigator,
    pointerEvents:     typeof PointerEvent !== 'undefined',
  };

  // ─── Señales adicionales (sync) ──────────────────────────────────────────────
  const eventPropagation  = measureEventPropagation();
  const audioContextState = checkAudioContextState();
  const webAuthn          = checkWebAuthn();
  const webDriverBiDi     = detectWebDriverBiDi();
  const puppeteerExt      = detectPuppeteer();
  const playwrightData    = detectPlaywright();
  const seleniumGrid      = detectSeleniumGrid();

  // ─── Señales iteración 6 — AI Automation ────────────────────────────────────
  const aiPatterns      = detectAIPatterns();
  const mlFrameworks    = detectMLFrameworks();
  const randomnessData  = analyzeRandomness();
  const typingPatterns  = analyzeTypingPatterns();
  const responseTime    = analyzeResponseTimeConsistency();
  const decisionTree    = analyzeDecisionTreePatterns();

  // ─── Señales iteración 4 ──────────────────────────────────────────────────
  const modernAPIs = checkModernAPIs();

  // ─── Señales FingerprintJS ────────────────────────────────────────────────
  const mathFingerprint = getMathFingerprint()
  const architecture    = detectArchitecture()
  const domBlockers     = detectDOMBlockers()
  const mediaFeatures   = getMediaFeatures()
  const intlLocale      = getIntlLocale()

  // ─── Señales iteración 5 (sync) ───────────────────────────────────────────
  const touchConsistency = checkTouchConsistency();
  const screenOrientData = getScreenOrientationDetails();
  const privacyToolsAdv  = detectPrivacyToolsAdvanced();
  const extensionData    = detectExtensions();
  const vmIndicators     = detectVMIndicators();
  const envFlags         = detectEnvironmentFlags();
  const browserRuntime   = getBrowserRuntime();
  const memAlloc         = testMemoryAllocation();
  const cpuThrottling    = detectCPUThrottling();
  const wsAPI            = checkWebSocketAPI();
  const cacheAPIs        = checkCacheAPIs();
  const historyData      = analyzeHistoryAPI();

  // Operaciones async de iter 2+3 + señales adicionales en paralelo
  const [webrtcIPs, wasmData, permissionsData, webrtcDC, webGPU] = await Promise.all([
    getWebRTCIPs(),
    wasmFingerprint(),
    queryPermissions(),
    checkWebRTCDataChannel(),
    getWebGPUInfo(),
  ]);

  // ─── Señales iteración 5 (post-async) ────────────────────────────────────
  const networkInterfaces = analyzeNetworkInterfaces(webrtcIPs.localIPs);

  // ─── Construcción del schema ───────────────────────────────────────────────

  const deviceId = generateDeviceId(
    canvasId,
    gpuName,
    screenData.width,
    screenData.height,
    cores
  );

  const sessionId = generateSessionId();

  const deviceData = {
    organizationId,
    sessionId,
    session: {
      userAgent,
      os,
      osVersion,
      cookiesEnabled,
      localStorage:    localStorageAvail,
      lang,
      platform,
      timezone,
      screen:          screenData,
      cpuSpeed,
      sessionStorage:  sessionStorageAvail,
      indexedDB:       indexedDBAvail,
      doNotTrack,
      canvasId,
      gpuVendor,
      gpuName,
      cores,
      deviceMemory,
      devicePixelRatio,
      privateBrowsing,
      acceptContent,
      javaEnabled,
      javaScriptEnabled,
    },
    device: { id: deviceId },

    hardware: {
      webgl: {
        hash:                webglHash,
        extensions:          webglExtensions,
        contextLossSupported: webglCtxLoss,  // S060
      },
      audio: {
        ...audioFP,
        baseLatency:   audioLatency.baseLatency,   // S033
        outputLatency: audioLatency.outputLatency,
        state:         audioLatency.state,
      },
      canvas: {
        textHash:     canvasTextHash,
        geometryHash: canvasGeometryHash,
        emojiHash,          // S031
      },
      speech: speechData,
      media:  mediaData,
      wasm:             wasmData,          // S050
      gpu:              gpuPerf,           // S053
      webgpu:           webGPU,            // S153-S156
      audioContextState,                   // S061
      mathFingerprint,                     // FingerprintJS
      architecture,                        // FingerprintJS
    },
    system: {
      languages,
      touchSupport: { maxTouchPoints },
      ...systemAPIs,                            // S041/S042/S044/S045/S028b
      ...systemFlagsIter3,                      // S064/S069/S070
      plugins:     pluginsData,                 // S034
      permissions: permissionsData,             // S062
      css:         cssFeatures,                 // S055
      jsEngine,                                 // S056
      memory:      memoryInfo,                  // S052/S068
      modernAPIs,                               // S072-S085b (iter 4)
      webAuthn,                                 // S139
      mediaFeatures,                            // FingerprintJS
      intlLocale,                               // FingerprintJS
    },
    automation: {
      webdriver:           webdriver,
      automationArtifacts: automationArtifacts,
      webDriverBiDi,       // S166
      puppeteer:           puppeteerExt,  // S168
      playwright:          playwrightData, // S169
      seleniumGrid,        // S170
    },
    network: {
      connectionType,
      localIPs:          webrtcIPs.localIPs,    // S027
      webrtcSuccess:     webrtcIPs.success,
      downlink:          networkInfo.downlink,  // S040
      rtt:               networkInfo.rtt,
      effectiveType:     networkInfo.effectiveType,
      httpVersion,                              // S054
      webrtcDataChannel: webrtcDC.supported,   // S063
      interfaces:        networkInterfaces,     // S098 (iter 5)
      webSocket:         wsAPI,                 // S102 (iter 5)
      cacheAPIs,                               // S104 (iter 5)
    },
    fonts:   fontData,    // S026
    headless: headlessData, // S030/S017b
    evasion: {              // iter 3
      devTools:           devToolsData,         // S046
      canvasPoisoning:    canvasPoisonData,     // S059
      antiFingerprinting: antiFPData,           // S049
      privacyTools:       privacyToolsAdv,      // S090 (iter 5)
      extensions:         extensionData,        // S091 (iter 5)
      domBlockers,                              // FingerprintJS
    },
    mobile: {                                   // iter 5
      touchConsistency,                         // S088
      screenOrientation: screenOrientData,      // S089
    },
    vm: {                                       // iter 5
      indicators:  vmIndicators,                // S092
      environment: envFlags,                    // S093+S094
      browser:     browserRuntime,              // S095
    },
    aiAutomation: {         // iter 6
      patterns:       aiPatterns,       // S106
      mlFrameworks,                     // S107
      randomness:     randomnessData,   // S108
      typingPatterns,                   // S109
      responseTime,                     // S110
      decisionTree,                     // S111
    },
    perf: {                 // iter 3
      timingResolution,                         // S051
      memoryAllocation: memAlloc,               // S096 (iter 5)
      cpuThrottling,                            // S097 (iter 5)
    },
    behavioral: {
      mouse:    { entropy: mouseEntropy, samples: _bhv.moves.length, acceleration: mouseAcceleration },
      keyboard: { timingCV: keyboardCV, samples: _bhv.keyGaps.length },
      clicks:   clickStats,
      scroll:   scrollData,       // S038
      focus:    focusData,        // S039
      biometrics,                 // S048
      domSpeed,                   // S057
      eventPropagation,           // S058
      history:  historyData,      // S105b (iter 5) — replaces historyLength
      resourceLoading,            // S066
    },
  };

  console.log('[KoinCollector] device_data capturado:', deviceData);
  return deviceData;
}

// ─── Export ────────────────────────────────────────────────────────────────────

// Browser
if (typeof window !== 'undefined') {
  window.KoinCollector = { collect: collectDeviceData };
}

// Node / CommonJS
if (typeof module !== 'undefined') {
  module.exports = { collect: collectDeviceData };
}
