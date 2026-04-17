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
    bot:                { score: 12,   status: "clean",  label: "Limpio"    },
    browserSpoofing:    { score: 61,   status: "alert",  label: "Alerta"    },
    emulatorVm:         { score: 82,   status: "alert",  label: "Alerta"    },
    tor:                { score: 5,    status: "clean",  label: "Limpio"    },
    proxyVpn:           { score: 74,   status: "alert",  label: "Alerta"    },
    incognito:          { score: 34,   status: "warn",   label: "Aviso"     },
    antiFingerprinting: { score: 8,    status: "clean",  label: "Limpio"    },
    deviceSharing:      { score: null, status: "nodata", label: "Sin datos" },
    behavioral:         { score: null, status: "nodata", label: "Sin datos" },
    ato:                { score: null, status: "nodata", label: "Sin datos" }
  },

  vectors: {
    emulatorVm:         { score: 82, weight: 0.30, status: "critical" },
    proxyVpn:           { score: 74, weight: 0.25, status: "critical" },
    browserSpoofing:    { score: 61, weight: 0.20, status: "alert"    },
    incognito:          { score: 34, weight: 0.10, status: "warn"     },
    bot:                { score: 12, weight: 0.08, status: "clean"    },
    antiFingerprinting: { score: 8,  weight: 0.05, status: "clean"    },
    tor:                { score: 5,  weight: 0.02, status: "clean"    },
    deviceSharing:      { score: null, weight: null, status: "nodata" },
    behavioral:         { score: null, weight: null, status: "nodata" },
    ato:                { score: null, weight: null, status: "nodata" }
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
