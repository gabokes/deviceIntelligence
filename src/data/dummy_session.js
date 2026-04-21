// src/data/dummy_session.js
// Sesión de referencia para desarrollo y demos.
// Mezcla datos reales capturados del browser con valores dummy donde no hay señal real.

const DUMMY_SESSION = {
  meta: {
    sessionId: "e62833c2cf246dd21327c01920b16e1a",
    timestamp: new Date().toISOString(),
    analysisTimeMs: 187,
    overallScore: 78,
    verdict: "review",
    verdictLabel: "Revisar antes de aprobar"
  },

  signals: {
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0",
    os: "Win32",
    osVersion: "Windows 10",
    lang: "es-ES",
    timezone: -3,
    screen: { width: 1920, height: 1080, colorDepth: 32, devicePixelRatio: 1 },
    cores: 14,
    deviceMemory: 32,
    cpuSpeedAvg: 36.97,
    cookiesEnabled: true,
    localStorage: true,
    sessionStorage: true,
    indexedDB: true,
    doNotTrack: false,
    privateBrowsing: false,
    gpuVendor: "Google Inc. (Intel)",
    gpuName: "ANGLE (Intel, Intel(R) Graphics...)",
    canvasId: "61b631b748bcd2332d26a32c7a198f25",
    javaEnabled: false,
    javaScriptEnabled: true,
    deviceId: "2d3fda04d89513c91098122c1366948a"
  },

  agents: {
    bot:                { score: 12,   status: "clean",  label: "Limpio",   insight: "Sin patrones de automatización detectados.",         category: "automatización · webdriver",   tags: [] },
    browserSpoofing:    { score: 61,   status: "alert",  label: "Alerta",   insight: "UA y propiedades del browser presentan inconsistencias.", category: "fingerprint · webgl · ua",    tags: ["ua-mismatch"] },
    emulatorVm:         { score: 82,   status: "alert",  label: "Alerta",   insight: "GPU vendor y screen ratio son consistentes con VM.",  category: "hardware · gpu · cpu",         tags: ["vm-indicator","gpu-suspicious"] },
    tor:                { score: 5,    status: "clean",  label: "Limpio",   insight: "No hay indicadores de nodos Tor.",                    category: "exit nodes · RTT",             tags: [] },
    proxyVpn:           { score: 74,   status: "alert",  label: "Alerta",   insight: "Timezone y lang no coinciden — posible VPN.",        category: "geo · idioma · timezone",      tags: ["timezone-lang-mismatch"] },
    incognito:          { score: 34,   status: "warn",   label: "Aviso",    insight: "Storage quota reducida — posiblemente privado.",     category: "storage · privacidad",         tags: ["low-quota"] },
    antiFingerprinting: { score: 8,    status: "clean",  label: "Limpio",   insight: "Canvas estable entre cargas. No hay evasión activa.", category: "canvas · evasión",             tags: [] },
    aiAutomation:       { score: null, status: "nodata", label: "Sin datos",insight: "Sin datos suficientes para evaluar.",                 category: "patrones · timing · ml",       tags: [] },
    mobileEmulation:    { score: null, status: "nodata", label: "Sin datos",insight: "Sin datos suficientes para evaluar.",                 category: "emulación · touch · ua",       tags: [] },
    deviceSharing:      { score: null, status: "nodata", label: "Sin datos",insight: "Sin historial de sesiones para comparar.",            category: "historial · sesiones",         tags: [] },
    behavioral:         { score: null, status: "nodata", label: "Sin datos",insight: "No se capturaron suficientes señales comportamentales.", category: "mouse · teclado · touch",   tags: [] },
    ato:                { score: null, status: "nodata", label: "Sin datos",insight: "Sin historial de cuenta para evaluar.",               category: "velocity · cuenta",            tags: [] }
  },

  vectors: {
    emulatorVm:         { score: 82,   weight: 0.30, status: "critical", triggerSignals: ["gpuVendor","cores","screen.height"] },
    proxyVpn:           { score: 74,   weight: 0.25, status: "critical", triggerSignals: ["timezone","lang","network.localIPs"] },
    browserSpoofing:    { score: 61,   weight: 0.20, status: "alert",    triggerSignals: ["userAgent","platform","screen.colorDepth"] },
    incognito:          { score: 34,   weight: 0.10, status: "warn",     triggerSignals: ["privateBrowsing","localStorage"] },
    bot:                { score: 12,   weight: 0.08, status: "clean",    triggerSignals: ["automation.webdriver","mouse.entropy"] },
    antiFingerprinting: { score: 8,    weight: 0.05, status: "clean",    triggerSignals: ["canvasId","evasion.canvasPoisoning"] },
    tor:                { score: 5,    weight: 0.02, status: "clean",    triggerSignals: ["network.localIPs"] },
    aiAutomation:       { score: null, weight: null, status: "nodata",   triggerSignals: [] },
    mobileEmulation:    { score: null, weight: null, status: "nodata",   triggerSignals: [] },
    deviceSharing:      { score: null, weight: null, status: "nodata",   triggerSignals: [] },
    behavioral:         { score: null, weight: null, status: "nodata",   triggerSignals: [] },
    ato:                { score: null, weight: null, status: "nodata",   triggerSignals: [] }
  },

  intelligence: {
    findings: [
      {
        id: "F001",
        title: "GPU vendor es de entorno virtualizado",
        vector: "Emulator / VM",
        status: "anomaly",
        condition: "gpuVendor contains 'Google' AND platform = 'Win32'",
        signals: [
          { key: "gpuVendor", value: "Google Inc. (Intel)", status: "bad" },
          { key: "platform",  value: "Win32",               status: "ok"  }
        ],
        conclusion: "GPU con vendor Google es típica de Android Studio / Bluestacks. Inconsistente con Win32."
      },
      {
        id: "F002",
        title: "Timezone y lang no coinciden — VPN probable",
        vector: "Proxy / VPN",
        status: "warn",
        condition: "lang = 'es-ES' AND timezone = -3",
        signals: [
          { key: "lang",     value: "es-ES",    status: "warn" },
          { key: "timezone", value: "-3 (BRT)", status: "bad"  }
        ],
        conclusion: "Idioma apunta a España (UTC+1/+2) pero timezone es de Brasil (UTC-3). Probable VPN."
      },
      {
        id: "F003",
        title: "Canvas fingerprint estable",
        vector: "Anti-Fingerprinting",
        status: "ok",
        condition: "canvasId estable entre cargas",
        signals: [
          { key: "canvasId", value: "61b631b7...", status: "ok" }
        ],
        conclusion: "No se detectaron modificaciones al canvas. Sin evasión de fingerprinting."
      }
    ]
  }
}

// Browser
if (typeof window !== 'undefined') {
  window.DUMMY_SESSION = DUMMY_SESSION
}

// Node / CommonJS
if (typeof module !== 'undefined') {
  module.exports = DUMMY_SESSION
}
