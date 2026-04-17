# CONTEXT.md — Fuente de verdad del dominio

---

## Arquitectura de datos

```
Browser del usuario
       ↓
[Script JS] ──→ device_data       (señales crudas capturadas)
                     ↓
              device_intelligence  (asociaciones y análisis derivados)
                     ↓
               fraud_vectors       (vectores de riesgo con scores)
```

---

## device_data actual — 47 señales

```json
{
  "organizationId": "de4330cc45",
  "sessionId": "e62833c2cf246dd21327c01920b16e1a",
  "session": {
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...",
    "os": "Win32",
    "osVersion": "Windows 10",
    "cookiesEnabled": true,
    "localStorage": true,
    "lang": "es-ES",
    "platform": "Win32",
    "timezone": -3,
    "screen": {
      "availHeight": 1032,
      "availWidth": 1920,
      "colorDepth": 32,
      "width": 1920,
      "height": 1080,
      "orientation": "landscape-primary"
    },
    "cpuSpeed": { "average": 36.97 },
    "sessionStorage": true,
    "indexedDB": true,
    "doNotTrack": false,
    "canvasId": "61b631b748bcd2332d26a32c7a198f25a1d63facb0461fd3bd63e32adc32b4c9",
    "gpuVendor": "Google Inc. (Intel)",
    "gpuName": "ANGLE (Intel, Intel(R) Graphics (0x00007D45) Direct3D11 vs_5_0 ps_5_0, D3D11)",
    "cores": 14,
    "deviceMemory": 32,
    "devicePixelRatio": 1,
    "privateBrowsing": false,
    "acceptContent": "/",
    "javaEnabled": false,
    "javaScriptEnabled": true
  },
  "device": {
    "id": "2d3fda04d89513c91098122c1366948a"
  }
}
```

---

## Gaps evidentes en device_data actual

| Categoría | Señales faltantes |
|-----------|------------------|
| Audio | Audio fingerprint, oscillator timing |
| Fonts | Font detection (canvas-based) |
| Network | WebRTC leak, connection type, RTT, downlink |
| Comportamiento | Mouse movement, keyboard timing, touch patterns |
| Automatización | Selenium/Puppeteer/Playwright detection |
| Extensiones | Extension presence detection |
| Performance | Timing attacks, navigation timing |
| Storage | Cookie persistence, storage partitioning |
| Media | Media devices presence (sin acceso a stream) |
| CSS/Rendering | CSS feature detection, computed styles fingerprint |

---

## device_intelligence — ejemplos objetivo

| Señales combinadas | Qué detecta |
|-------------------|-------------|
| `canvasId` cambia + `gpuName` igual | Limpieza activa de fingerprint |
| `cores=16` + `deviceMemory=8` + `cpuSpeed` muy bajo | VM o emulador |
| `timezone != lang` región geográfica | VPN o proxy geográfico |
| `privateBrowsing=false` + sin localStorage persistence | Incognito no detectado |
| `userAgent=mobile` + `screen.width > 1200` | User agent spoofing |
| `devicePixelRatio=1` + pantalla declarada alta resolución | Emulador mobile en desktop |
| WebRTC IP != timezone IP | Proxy/VPN con leak |
| Audio fingerprint ausente o constante | Anti-fingerprinting tool activa |

---

## fraud_vectors objetivo

| Vector | Prioridad | Estado |
|--------|-----------|--------|
| Bot | Alta | ❌ Sin implementar |
| Browser Spoofing | Alta | ❌ Sin implementar |
| Emulator / VM | Alta | ❌ Sin implementar |
| Tor | Alta | ❌ Sin implementar |
| Proxy / VPN | Alta | ❌ Sin implementar |
| Incognito | Media | 🟡 Parcial (solo flag directo) |
| Anti-Fingerprinting | Alta | ❌ Sin implementar |
| Device Sharing | Media | ❌ Sin implementar |
| Behavioral Anomaly | Media | ❌ Sin implementar |
| Account Takeover signals | Alta | ❌ Sin implementar |

---

## Tecnología disponible

| Tecnología | Disponible | Notas |
|-----------|------------|-------|
| Script JS browser | ✅ | Base actual — fase 1 |
| APIs browser sin permiso | ✅ | Canvas, WebGL, Audio ctx, Fonts, etc. |
| APIs con permiso usuario | ⚠️ | Geolocation, Camera, Mic — no en fase 1 |
| Server-side enrichment | ❌ Fase futura | IP reputation, ASN lookup, etc. |
| SDK nativo mobile | ❌ Fase futura | Sensores, GPS real, hardware IDs |
| ML / vectorización | ❌ Fase futura | Pattern matching tipo Incognia |

---

## Referencia competitiva: Incognia AI-Powered Browser ID

**Arquitectura:** Transformer model que tokeniza señales del browser y las mapea a vectores en espacio de alta dimensión (igual que LLMs).

**Lo que hacen:**
- Tokenización de señales → vector space mapping
- Identity persistence: reconoce usuario aunque cambie caché, browser o privacy settings
- Stack: ScyllaDB + Milvus, baja latencia a escala global
- Resultado: 25% mejor re-identificación vs generación anterior

**Implicancia para Koin:** hoy farmamos señales. En fases futuras las vectorizamos para pattern matching, no solo matching exacto.

---

## Hoja de ruta

```
FASE 1 — Farmear señales (ACTUAL)
├── Benchmark de señales (viene como .MD externo)
├── Expansión del script JS collector
└── Output: device_data con 150+ señales

FASE 2 — Procesar señales
├── Reglas de asociación entre señales
├── device_intelligence schema + lógica
└── Output: asociaciones documentadas y codificadas

FASE 3 — Definir vectores
├── Mapeo señales + intelligence → fraud_vectors
├── Scoring por vector
└── Output: fraud_vectors con scores 0-100

FASE 4 — Herramientas (futuro)
├── Dashboard de monitoreo
├── Modelo ML para pattern matching
└── Identity persistence tipo Incognia
```
