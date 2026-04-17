
# KOIN - ITERACIONES BROWSER FINGERPRINT
## Implementación vía Claude Code - Sprint Planning

> **Contexto:** Este documento trabaja con las señales definidas en `koin_signals_master_table.md`
> 
> **Carpeta del proyecto:** `koin-browser-intelligence/.claude/product_plan/`
> 
> **Archivos de referencia:**
> - `koin_signals_master_table.md` - Catálogo completo de 180 señales
> - `koin_browser_fingerprint_benchmark.md` - Benchmark detallado
> - Este archivo - Plan de implementación por iteraciones

---

## 📅 ROADMAP OVERVIEW

| Iteración | Timeline | Señales | Gap Cerrado | Enfoque |
|-----------|----------|---------|-------------|---------|
| **1** | Semana 1 | 25 | 40% → 55% | Bot Detection + Hardware Foundation |
| **2** | Semana 2 | 19 | 55% → 70% | Network Intelligence + Fonts |
| **3** | Semana 3 | 24 | 70% → 85% | Anti-Evasion + DevTools |
| **4** | Semana 4 | 12 | 85% → 90% | Modern APIs Coverage |
| **5** | Semana 5 | 16 | 90% → 95% | VM Detection + Extensions |
| **6** | Semana 6 | 24 | 95% → 96% | Advanced + Permission-based (optional) |
| **TOTAL** | **6 semanas** | **120** | **96%** | **Production Ready** |

---

# ITERACIÓN 1: Bot Detection + Hardware Foundation
**Timeline:** Semana 1 | **Gap:** 40% → 55% (+15%)

## 🎯 OBJETIVO
Establecer foundation sólida para bot detection y device fingerprinting sin permisos.

## 📊 SEÑALES A IMPLEMENTAR (25 señales)

**Referencia:** Ver detalles completos en `koin_signals_master_table.md`

### Behavioral Signals (Bot Detection)
- **S001** - Mouse Movement Entropy
- **S002** - Keyboard Timing Patterns  
- **S036** - Mouse Acceleration Patterns
- **S037** - Click Timing Analysis

### Hardware Fingerprinting
- **S003** - WebGL Fingerprint
- **S004** - Audio Context Fingerprint
- **S005** - Canvas Text Rendering
- **S009** - Canvas Geometry Rendering
- **S010** - WebGL Extensions List
- **S006** - Speech Synthesis Voices
- **S007** - Media Devices List

### System Information
- **S011** - Screen Metrics Complete
- **S016** - Memory Information
- **S017** - Hardware Concurrency (CPU cores)
- **S013** - Language Preferences
- **S014** - Platform Information
- **S018** - User Agent Analysis
- **S012** - Timezone Offset

### Automation Detection
- **S014** - WebDriver Properties
- **S020** - Automation Framework Detection
- **S019** - Touch Support Detection

### Storage/Privacy
- **S021** - Connection Type
- **S022** - Do Not Track Setting
- **S023** - Cookie Support
- **S024** - Local Storage Support
- **S025** - Session Storage Support

## 📋 device_data STRUCTURE

```javascript
{
  "sessionId": "uuid",
  "timestamp": "ISO-8601",
  "organizationId": "koin",
  
  "behavioral": {
    "mouse": {
      "entropy": 4.2,              // S001
      "samples": 150,
      "acceleration": {            // S036
        "mean": 0.23,
        "stddev": 0.15,
        "pattern": "natural"
      }
    },
    "keyboard": {
      "timingCV": 0.18,            // S002
      "samples": 45,
      "intervals": [145, 167, 132]
    },
    "clicks": {                     // S037
      "avgInterval": 1250,
      "stddev": 450
    }
  },
  
  "hardware": {
    "webgl": {                      // S003, S010
      "vendor": "Google Inc. (Intel)",
      "renderer": "ANGLE (Intel(R) Graphics)",
      "hash": "a1b2c3d4",
      "extensions": ["ANGLE_instanced_arrays"]
    },
    "audio": {                      // S004
      "sampleRate": 44100,
      "channels": 2,
      "hash": "e5f6g7h8"
    },
    "canvas": {                     // S005, S009
      "textHash": "i9j0k1l2",
      "geometryHash": "m3n4o5p6"
    },
    "speech": {                     // S006
      "voices": [{"name": "Microsoft Zira", "lang": "en-US"}],
      "count": 12
    },
    "media": {                      // S007
      "audioInputs": 2,
      "videoInputs": 1
    },
    "screen": {                     // S011
      "width": 1920,
      "height": 1080,
      "colorDepth": 32
    },
    "cpu": {"cores": 8},            // S017
    "memory": {"deviceMemory": 16}  // S016
  },
  
  "system": {
    "languages": ["es-AR", "es"],   // S013
    "platform": "Win32",            // S014
    "timezone": -180,               // S012
    "userAgent": "Mozilla/5.0...",  // S018
    "touchSupport": {               // S019
      "maxTouchPoints": 0
    }
  },
  
  "automation": {
    "webdriver": null,              // S014
    "automationArtifacts": []       // S020
  },
  
  "privacy": {
    "doNotTrack": "unspecified",    // S022
    "cookiesEnabled": true,         // S023
    "localStorage": true,           // S024
    "sessionStorage": true          // S025
  },
  
  "network": {
    "connectionType": "wifi"        // S021
  }
}
```

## 🧠 device_intelligence GENERATION

```javascript
{
  "deviceId": "stable_hash",
  
  "fingerprint": {
    "hash": "SHA256(webgl + audio + canvas)",
    "stability": 0.95,
    "uniqueness": 0.87,
    "components": {
      "webgl": "a1b2c3d4",
      "audio": "e5f6g7h8",
      "canvas": "i9j0k1l2"
    }
  },
  
  "bot_analysis": {
    "score": 15,  // 0-100 (15 = low risk)
    "confidence": "high",
    "indicators": {
      "mouse_naturalness": 0.85,    // From S001, S036
      "keyboard_humanness": 0.78,   // From S002
      "automation_detected": false  // From S014, S020
    },
    "recommendation": "ALLOW"
  },
  
  "device_integrity": {
    "score": 95,  // 0-100
    "hardware_consistent": true,
    "known_hardware": true,
    "anomalies": []
  },
  
  "session_trust": {
    "score": 80,
    "privacy_mode": false,
    "storage_available": true
  },
  
  "seen_before": {
    "count": 5,
    "first_seen": "2025-01-10T08:00:00Z",
    "fingerprint_changes": 0
  }
}
```

## 💻 IMPLEMENTACIÓN - CLAUDE CODE PROMPT

```
Contexto: Ver señales detalladas en koin_signals_master_table.md (S001-S025)

Tarea: Implementar 25 señales de Iteración 1 para browser fingerprinting

Crear:
1. collectors/BehavioralCollector.js
   - Implementar S001 (Mouse Movement Entropy con Shannon)
   - Implementar S002 (Keyboard Timing con CV)
   - Implementar S036 (Mouse Acceleration)
   - Implementar S037 (Click Timing Analysis)

2. collectors/HardwareCollector.js
   - Implementar S003 (WebGL Fingerprint completo)
   - Implementar S004 (Audio Context Fingerprint)
   - Implementar S005 (Canvas Text Rendering)
   - Implementar S009 (Canvas Geometry Rendering)
   - Implementar S010 (WebGL Extensions List)
   - Implementar S006 (Speech Synthesis Voices)
   - Implementar S007 (Media Devices enumeration)

3. collectors/SystemCollector.js
   - Implementar S011-S014, S016-S019 (screen, CPU, memory, platform, timezone, etc.)

4. collectors/AutomationCollector.js
   - Implementar S014 (WebDriver detection)
   - Implementar S020 (Automation Framework artifacts)

5. collectors/PrivacyCollector.js
   - Implementar S021-S025 (connection, DNT, storage)

6. processors/DeviceIntelligenceProcessor.js
   - Generar fingerprint_hash (composite)
   - Calcular bot_score (mouse entropy <2.5 → +30pts, keyboard CV <0.15 → +25pts)
   - Calcular device_integrity_score
   - Calcular session_trust_score

Estructura de salida:
- src/collectors/
- src/processors/
- src/types/device_data.d.ts
- src/types/device_intelligence.d.ts

Performance target: <100ms p95
Compatibilidad: Chrome 90+, Firefox 88+, Safari 14+
```

## ✅ DEFINITION OF DONE

**Código:**
- [ ] 25 señales capturadas en device_data
- [ ] device_intelligence con 4 scores generados
- [ ] Unit tests >80% coverage
- [ ] Performance <100ms p95
- [ ] TypeScript types completos

**Data:**
- [ ] device_data schema validado
- [ ] device_intelligence schema validado
- [ ] Sample de 100 sessions capturadas

**Testing:**
- [ ] Fingerprint uniqueness >85% (test con 1000 devices)
- [ ] Bot detection funcional (Selenium → score >60)
- [ ] Cross-browser compatible

**Docs:**
- [ ] README con setup
- [ ] JSDoc en funciones principales

## 📈 BUSINESS IMPACT

**Vectores Mejorados:**
- BOT_DETECTION: 15% → 55% (+40%)
- DEVICE_INTEGRITY: 25% → 65% (+40%)
- SESSION_TRUST: 20% → 45% (+25%)

**Expected Outcomes:**
- Reducción falsos positivos: -15%
- Fingerprint uniqueness: 85%+
- Foundation sólida para siguiente iteración

---

# ITERACIÓN 2: Network Intelligence + Font Fingerprinting
**Timeline:** Semana 2 | **Gap:** 55% → 70% (+15%)

## 🎯 OBJETIVO
Agregar network analysis (VPN/Proxy detection) y font fingerprinting para uniqueness.

## 📊 SEÑALES A IMPLEMENTAR (19 señales)

**Referencia:** Ver detalles en `koin_signals_master_table.md`

### Network Analysis
- **S027** - WebRTC Local IPs (sin prompt!)
- **S040** - Network Connection Speed
- **S054** - Network Stack Analysis

### Font Detection
- **S026** - Installed Fonts Detection (top 50)

### Advanced Bot Detection
- **S030** - Headless Browser Detection
- **S017b** - Headless Browser Detection (extended)
- **S038** - Scroll Behavior Analysis

### Advanced Hardware
- **S031** - Canvas Advanced Fingerprint (emoji)
- **S032** - WebGL Renderer Details
- **S033** - Audio Processing Latency

### System APIs
- **S034** - Plugin Enumeration
- **S035** - MIME Types Support
- **S039** - Focus/Blur Event Patterns
- **S041** - WebAssembly Support
- **S042** - Crypto API Support
- **S043** - IndexedDB Capability
- **S044** - WebSQL Support
- **S045** - Service Worker Support
- **S028b** - Geolocation API Availability (no prompt, solo check)

## 📋 device_data ADDITIONS

```javascript
{
  // ... existing from Iter 1 ...
  
  "network": {
    "localIPs": ["192.168.1.100"],  // S027 - WebRTC (NO requiere permisos!)
    "connectionSpeed": {             // S040
      "downlink": 10,
      "effectiveType": "4g"
    },
    "httpVersion": "h2",             // S054
    "tlsVersion": "1.3"
  },
  
  "fonts": {                          // S026
    "detected": ["Arial", "Helvetica", "Times New Roman"],
    "count": 47,
    "hash": "font_sig_abc123"
  },
  
  "headless": {                       // S030, S017b
    "chromeRuntime": true,
    "pluginsLength": 3,
    "inconsistencies": []
  },
  
  "behavioral": {
    // ... existing ...
    "scroll": {                       // S038
      "events": 45,
      "smoothness": 0.85,
      "entropy": 3.8
    },
    "focus": {                        // S039
      "blurCount": 3,
      "rapidSwitching": false
    }
  },
  
  "hardware": {
    // ... existing ...
    "canvas": {
      // ... existing ...
      "emojiHash": "emoji_xyz789"    // S031
    },
    "webgl": {
      // ... existing ...
      "unmaskedVendor": "Intel Inc.", // S032
      "unmaskedRenderer": "Intel UHD 630"
    },
    "audio": {
      // ... existing ...
      "baseLatency": 0.01,            // S033
      "outputLatency": 0.02
    }
  },
  
  "system": {
    // ... existing ...
    "plugins": [{"name": "PDF Viewer"}],  // S034
    "mimeTypes": [{"type": "application/pdf"}], // S035
    "webAssembly": true,              // S041
    "cryptoAPI": true,                // S042
    "indexedDB": true,                // S043
    "webSQL": false,                  // S044
    "serviceWorker": true             // S045
  },
  
  "location": {
    "geolocationAvailable": true      // S028b (solo check, NO request)
  }
}
```

## 🧠 device_intelligence ENHANCEMENTS

```javascript
{
  // ... existing from Iter 1 ...
  
  "fingerprint": {
    // UPDATED: Ahora incluye fonts
    "hash": "SHA256(webgl + audio + canvas + fonts)",
    "uniqueness": 0.92,  // ⬆️ Improved from 0.87
    "components": {
      // ... existing ...
      "fonts": "font_sig_abc123"  // NEW
    }
  },
  
  "bot_analysis": {
    // UPDATED: Considera headless + scroll
    "score": 15,
    "indicators": {
      // ... existing ...
      "scroll_naturalness": 0.85,     // NEW from S038
      "headless_detected": false      // NEW from S030
    }
  },
  
  // NEW VECTOR
  "network_analysis": {
    "score": 10,  // 0-100 (10 = low risk)
    "vpn_probability": 0.15,
    "proxy_probability": 0.05,
    "indicators": {
      "ip_timezone_mismatch": false,  // S027 vs S012
      "webrtc_leak_detected": false
    },
    "recommendation": "ALLOW"
  },
  
  // NEW VECTOR
  "spoofing_analysis": {
    "score": 5,  // 0-100
    "headless_probability": 0.05,
    "ua_consistent": true,
    "recommendation": "ALLOW"
  }
}
```

## 💻 CLAUDE CODE PROMPT

```
Contexto: Iteración 2 - Agregar sobre base de Iteración 1
Referencias: koin_signals_master_table.md (S026-S045, S027, S054)

Tarea: Implementar 19 señales adicionales (total 44 ahora)

Crear/Actualizar:
1. collectors/NetworkCollector.js (NUEVO)
   - S027: WebRTC IP discovery (STUN servers, 3s timeout)
   - S040: Connection speed (navigator.connection)
   - S054: HTTP version detection

2. collectors/FontCollector.js (NUEVO)
   - S026: Font detection (top 50 fonts, canvas measurement)

3. collectors/BehavioralCollector.js (ACTUALIZAR)
   - Agregar S038: Scroll behavior analysis
   - Agregar S039: Focus/blur patterns

4. collectors/HardwareCollector.js (ACTUALIZAR)
   - S031: Canvas emoji rendering
   - S032: WebGL unmasked vendor/renderer
   - S033: Audio latency measurement

5. collectors/AutomationCollector.js (ACTUALIZAR)
   - S030: Headless detection (chrome.runtime, plugins.length)

6. processors/DeviceIntelligenceProcessor.js (ACTUALIZAR)
   - Actualizar fingerprint_hash incluyendo fonts
   - Agregar network_analysis score
   - Agregar spoofing_analysis score

Performance: Total acumulado <150ms p95
```

## ✅ DEFINITION OF DONE

- [ ] 19 señales nuevas (total 44)
- [ ] WebRTC IPs capturados >90% success rate
- [ ] Font detection 40+ fonts promedio
- [ ] Headless detection identifica Puppeteer
- [ ] 2 nuevos vectores en intelligence
- [ ] Fingerprint uniqueness >92%
- [ ] Performance <150ms p95

## 📈 BUSINESS IMPACT

**Vectores Mejorados:**
- NETWORK_ANONYMIZATION: 5% → 70% (+65%)
- BROWSER_SPOOFING: 30% → 75% (+45%)
- BOT_DETECTION: 55% → 70% (+15%)
- Fingerprint uniqueness: 85% → 92% (+7%)

**Expected:**
- Detección VPN/Proxy: +70%
- Headless browsers: +85%
- Falsos positivos: -10% adicional

---

# ITERACIÓN 3: Anti-Evasion + DevTools Detection
**Timeline:** Semana 3 | **Gap:** 70% → 85% (+15%)

## 🎯 OBJETIVO
Detectar evasion attempts, developer tools, y advanced bot patterns.

## 📊 SEÑALES A IMPLEMENTAR (24 señales)

**Referencia:** `koin_signals_master_table.md`

### Advanced Evasion
- **S046** - Developer Tools Detection
- **S048** - Advanced Behavioral Biometrics
- **S049** - Anti-Fingerprinting Detection
- **S059** - Canvas Pixel Manipulation (poisoning)

### Bot Patterns
- **S057** - DOM Manipulation Speed
- **S058** - Event Propagation Patterns
- **S066** - Resource Loading Patterns
- **S105** - History API Manipulation

### Hardware Deep Validation
- **S050** - WebAssembly Fingerprinting
- **S053** - GPU Performance Profiling
- **S060** - WebGL Context Loss
- **S061** - Audio Context State Changes

### Network & Security
- **S063** - WebRTC Data Channel Behavior
- **S065** - Cross-Origin Policy Behavior
- **S051** - Timing Attack Resistance

### System Deep Dive
- **S055** - CSS Feature Detection
- **S056** - JavaScript Engine Quirks
- **S062** - Permission API States (query only)
- **S064** - Shared Array Buffer Support
- **S067** - Error Handling Behavior
- **S068** - Memory Pressure Simulation
- **S069** - WebXR Device Support
- **S070** - Pointer Events Analysis
- **S052** - Memory Usage Patterns

## 📋 device_data ADDITIONS

```javascript
{
  // ... existing from Iter 1-2 ...
  
  "evasion": {
    "devToolsOpen": false,                // S046
    "devToolsMethod": null,
    "antiFingerprinting": {               // S049
      "detected": false,
      "tools": []
    },
    "canvasPoisoning": {                  // S059
      "detected": false,
      "consistency": 1.0
    }
  },
  
  "behavioral": {
    // ... existing ...
    "biometrics": {                       // S048
      "mouseCurvature": 0.92,
      "keystrokeDynamics": {},
      "humanLikeness": 0.88
    },
    "dom": {                              // S057
      "manipulationSpeed": 1.2,
      "pattern": "natural"
    },
    "events": {                           // S058
      "propagationDelay": 2.3
    },
    "resources": {                        // S066
      "loadingPattern": "progressive"
    },
    "history": {                          // S105
      "manipulations": 0
    },
    "pointer": {                          // S070
      "type": "mouse",
      "consistency": true
    }
  },
  
  "hardware": {
    // ... existing ...
    "wasm": {                             // S050
      "supported": true,
      "compilationTime": 12.5,
      "hash": "wasm_perf_123"
    },
    "gpu": {                              // S053
      "performanceScore": 8500,
      "throttling": false
    },
    "memory": {                           // S052, S068
      "usagePattern": "normal",
      "pressureResponse": "healthy"
    }
  },
  
  "network": {
    // ... existing ...
    "webrtc": {                           // S063
      "dataChannelBehavior": "normal"
    },
    "cors": {                             // S065
      "policyEnforcement": "strict"
    },
    "timing": {                           // S051
      "highResAvailable": true,
      "jitter": 0.05
    }
  },
  
  "system": {
    // ... existing ...
    "css": {                              // S055
      "grid": true,
      "customProperties": true,
      "features": 45
    },
    "jsEngine": {                         // S056
      "type": "V8",
      "quirks": []
    },
    "permissions": {                      // S062 (query only, no request)
      "notifications": "prompt",
      "geolocation": "prompt"
    },
    "sharedArrayBuffer": false,           // S064
    "webxr": {                            // S069
      "supported": false
    }
  }
}
```

## 🧠 device_intelligence ENHANCEMENTS

```javascript
{
  // ... existing ...
  
  "bot_analysis": {
    "score": 15,  // UPDATED with biometrics
    "confidence": "very_high",
    "indicators": {
      // ... existing ...
      "biometric_score": 0.88,            // NEW from S048
      "dom_pattern": "natural",           // NEW from S057
      "resource_pattern": "progressive"   // NEW from S066
    }
  },
  
  // NEW VECTOR
  "environment_analysis": {
    "score": 5,  // 0-100
    "devtools_detected": false,           // From S046
    "debugging_detected": false,
    "manipulation_detected": false,
    "recommendation": "ALLOW"
  },
  
  // NEW VECTOR
  "privacy_evasion": {
    "score": 10,  // 0-100
    "canvas_poisoning": false,            // From S059
    "anti_fingerprinting": false,         // From S049
    "tools_detected": [],
    "recommendation": "ALLOW"
  },
  
  "fingerprint": {
    "hash": "composite_with_wasm_perf",
    "uniqueness": 0.94,  // ⬆️ Improved
    "evasion_resistant": true             // NEW flag
  }
}
```

## 💻 CLAUDE CODE PROMPT

```
Contexto: Iteración 3 - Anti-evasion layer sobre Iter 1-2
Referencias: koin_signals_master_table.md (S046-S070, S050-S068)

Tarea: Implementar 24 señales anti-evasion (total 68 ahora)

Crear/Actualizar:
1. collectors/EvasionCollector.js (NUEVO)
   - S046: DevTools detection (3 técnicas: size, debugger timing, console)
   - S049: Anti-fingerprinting tool detection
   - S059: Canvas poisoning detection (render twice, compare)

2. collectors/BehavioralCollector.js (ACTUALIZAR)
   - S048: Advanced biometrics (mouse curvature R², keystroke dynamics)
   - S057: DOM manipulation speed
   - S058: Event propagation analysis
   - S066: Resource loading patterns

3. collectors/HardwareCollector.js (ACTUALIZAR)
   - S050: WASM fingerprinting (compile simple module, benchmark)
   - S053: GPU performance profiling

4. processors/DeviceIntelligenceProcessor.js (ACTUALIZAR)
   - Agregar environment_analysis score (devtools +60pts)
   - Agregar privacy_evasion score (canvas poisoning +50pts)
   - Actualizar bot_score con biometrics

Técnicas específicas S046 (DevTools):
1. Size: window.outerWidth - innerWidth > 160px
2. Timing: debugger statement pause detection
3. Console: Object getter detection

Performance: Total <200ms p95 (complejidad aumenta)
```

## ✅ DEFINITION OF DONE

- [ ] 24 señales anti-evasion (total 68)
- [ ] DevTools detection >70% accuracy
- [ ] Canvas poisoning detection >80%
- [ ] Advanced biometrics implementado
- [ ] 2 nuevos vectores en intelligence
- [ ] Performance <200ms p95
- [ ] Penetration testing passed

## 📈 BUSINESS IMPACT

**Vectores Mejorados:**
- ENVIRONMENT_MANIPULATION: 15% → 75% (+60%)
- PRIVACY_EVASION: 25% → 80% (+55%)
- BOT_DETECTION: 70% → 85% (+15%)
- Evasion resistance: 0 → 85/100

**Expected:**
- Bypass por fraudsters: -70%
- DevTools detection: +75%
- Anti-fingerprinting resistance: +80%

---

# ITERACIÓN 4: Modern Browser APIs Coverage
**Timeline:** Semana 4 | **Gap:** 85% → 90% (+5%)

## 🎯 OBJETIVO
Completar coverage de APIs modernas para edge cases y uniqueness adicional.

## 📊 SEÑALES A IMPLEMENTAR (12 señales)

**Referencia:** `koin_signals_master_table.md`

**Modern APIs (availability detection):**
- **S072** - Vibration API Support
- **S075** - Gamepad API Support
- **S076b** - Web Bluetooth Availability (check only)
- **S077b** - Web USB Availability (check only)
- **S078** - Payment Request Support
- **S079** - Web Share API Support
- **S080** - Notification Permission State
- **S081** - Fullscreen API Support
- **S082** - Picture-in-Picture Support
- **S083** - Web Locks API Support
- **S084** - Wake Lock API Support
- **S085b** - Web Serial Availability (check only)

## 💻 CLAUDE CODE PROMPT

```
Contexto: Iteración 4 - Modern APIs coverage
Referencias: koin_signals_master_table.md (S072-S085)

Tarea: Agregar 12 señales de APIs modernas (total 80)

Crear:
1. collectors/ModernAPIsCollector.js
   - Detectar availability de APIs (NO hacer requests que requieran permisos)
   - Pattern: typeof navigator.apiName !== 'undefined'
   - Retornar object con boolean flags

Ejemplo:
{
  vibration: typeof navigator.vibrate !== 'undefined',
  gamepad: typeof navigator.getGamepads !== 'undefined',
  bluetooth: typeof navigator.bluetooth !== 'undefined',
  usb: typeof navigator.usb !== 'undefined',
  paymentRequest: typeof PaymentRequest !== 'undefined',
  share: typeof navigator.share !== 'undefined',
  notifications: Notification?.permission || 'unsupported',
  fullscreen: document.fullscreenEnabled,
  pip: document.pictureInPictureEnabled,
  locks: typeof navigator.locks !== 'undefined',
  wakeLock: typeof navigator.wakeLock !== 'undefined',
  serial: typeof navigator.serial !== 'undefined'
}

Agregar a device_data.system.modernAPIs
No afecta device_intelligence scores (solo uniqueness marginal +2%)

Performance: +5ms max
```

## ✅ DEFINITION OF DONE

- [ ] 12 APIs detectadas
- [ ] No permisos solicitados
- [ ] Agregado a device_data.system
- [ ] Uniqueness: 92% → 94%
- [ ] Performance <210ms p95

## 📈 BUSINESS IMPACT

- Browser API coverage: 95%+
- Uniqueness: +2%
- Foundation para mobile signals

---

# ITERACIÓN 5: VM Detection + Browser Extensions
**Timeline:** Semana 5 | **Gap:** 90% → 95% (+5%)

## 🎯 OBJETIVO
Detectar virtual machines, containers, y browser extensions (privacy tools).

## 📊 SEÑALES A IMPLEMENTAR (16 señales)

**Referencia:** `koin_signals_master_table.md`

### Mobile Emulation
- **S088** - Touch Event Consistency
- **S089** - Screen Orientation Behavior

### Privacy & Environment
- **S090** - Privacy Tool Detection Advanced
- **S091** - Extension Detection Patterns
- **S092** - Virtual Machine Indicators
- **S093** - Container Detection
- **S094** - Sandboxing Detection
- **S095** - Browser Process Analysis

### System Analysis
- **S096** - Memory Allocation Patterns
- **S097** - CPU Temperature Simulation
- **S098** - Network Interface Analysis
- **S099** - DNS Resolution Patterns
- **S100** - Certificate Pinning Behavior
- **S102** - WebSocket Behavior Analysis
- **S104** - Cache Behavior Analysis
- **S105b** - History API Analysis

## 💻 CLAUDE CODE PROMPT

```
Contexto: Iteración 5 - VM/Extension detection
Referencias: koin_signals_master_table.md (S088-S105)

Tarea: Implementar 16 señales de detección avanzada (total 96)

Crear:
1. collectors/VMDetector.js
   - S092: VM indicators (hardware inconsistencies, known VM signatures)
   - S093: Container detection (Docker, LXC artifacts)
   - S094: Sandboxing indicators

2. collectors/ExtensionDetector.js
   - S090: Privacy tools (Brave features, Privacy Badger, uBlock)
   - S091: Extension patterns (resource modifications, injected scripts)

3. collectors/MobileEmulationDetector.js
   - S088: Touch vs mouse consistency
   - S089: Screen orientation behavior

Vectores en intelligence:
- mobile_emulation score
- vm_detection score  
- extension_analysis array

Performance: <250ms p95
```

## ✅ DEFINITION OF DONE

- [ ] 16 señales implementadas (total 96)
- [ ] VM detection >70% accuracy
- [ ] Extension detection (top 20)
- [ ] Mobile emulation detection >80%
- [ ] 3 nuevos vectores
- [ ] Performance <250ms p95

## 📈 BUSINESS IMPACT

- DEVICE_INTEGRITY: +15%
- VM/Emulator detection: +70%
- Extension visibility: top 20 tools
- Fraud farm detection improved

---

# ITERACIÓN 6: Advanced Signals + Permission-based (Optional)
**Timeline:** Semana 6 | **Gap:** 95% → 96% (+1%)

## 🎯 OBJETIVO
AI automation detection + señales que requieren permisos (OPTIONAL - skip si quieres mantener 0 permisos).

## 📊 SEÑALES A IMPLEMENTAR (24 señales)

**Referencia:** `koin_signals_master_table.md`

### AI Automation (SIN permisos)
- **S106** - AI Automation Patterns
- **S107** - ML Model Inference
- **S108** - Randomness Quality Analysis
- **S109** - Natural Language Patterns
- **S110** - Response Time Consistency
- **S111** - Decision Tree Patterns

### Advanced Spoofing (SIN permisos)
- **S112** - Advanced Evasion Techniques
- **S113** - Canvas Noise Injection
- **S114** - WebGL Noise Injection
- **S115** - Audio Noise Injection
- **S116** - Font Spoofing Detection
- **S117** - Timezone Spoofing Advanced
- **S118** - Hardware Spoofing Detection
- **S119** - Behavioral Model Spoofing
- **S120** - Cross-Session Consistency

### Permission-based (OPTIONAL - CON permisos, solo si decides habilitarlos)
- **S028** - Geolocation Precise (GPS) → Requiere prompt
- **S047** - Clipboard Access → Requiere prompt
- **S071** - Battery Status → Deprecated
- **S073** - Ambient Light → Requiere prompt
- **S074** - Proximity Sensor → Requiere prompt
- **S086** - Motion Sensors → Requiere prompt
- **S087** - Orientation Sensors → Requiere prompt
- **S127** - WebHID → Requiere prompt
- **S141** - Contact Picker → Requiere prompt

## 💻 CLAUDE CODE PROMPT

```
Contexto: Iteración 6 - AI detection + Optional permissions
Referencias: koin_signals_master_table.md (S106-S120, permission-based)

Tarea: 
PARTE 1 (SIN permisos): Implementar 15 señales AI/spoofing (total 111)

1. collectors/AIDetector.js
   - S106-S111: AI automation patterns
   - Analizar: timing consistency, randomness quality, decision patterns

2. collectors/SpoofingDetector.js
   - S113-S119: Advanced spoofing (noise injection, model spoofing)

PARTE 2 (CON permisos - OPTIONAL):
Solo implementar si Koin decide habilitar permisos en el futuro.

1. collectors/PermissionBasedCollector.js
   - S028: Geolocation (navigator.geolocation.getCurrentPosition)
   - S047: Clipboard (navigator.clipboard.read)
   - S086/S087: Motion/Orientation (DeviceMotionEvent)
   
   Feature flag: ENABLE_PERMISSION_SIGNALS = false (default)

Vectores:
- ai_automation score
- Final polish de todos los scores

Performance: <280ms p95 (all signals)
```

## ✅ DEFINITION OF DONE

**Sin permisos (Core):**
- [ ] 15 señales AI/spoofing (total 111)
- [ ] AI automation detection >75%
- [ ] Advanced spoofing detection >80%
- [ ] Todos los vectores optimizados
- [ ] Performance <280ms p95

**Con permisos (Optional - solo si decides):**
- [ ] Feature flag implementado
- [ ] Graceful degradation si permisos negados
- [ ] LGPD consent flow ready
- [ ] 9 señales adicionales capturables

## 📈 BUSINESS IMPACT

**Sin permisos:**
- AI bot detection: +75%
- Advanced evasion resistance: +80%
- System completo y battle-tested

**Con permisos (si habilitas):**
- Location accuracy mejorada
- Mobile signals completos
- Edge case coverage 100%

---

# RESUMEN FINAL

## 📊 COBERTURA TOTAL

| Métrica | Sin Permisos | Con Permisos (opt) |
|---------|--------------|-------------------|
| **Señales totales** | 111 | 120 |
| **Coverage** | 95% | 96% |
| **Vectores cubiertos** | 15/15 | 15/15 |
| **Performance p95** | <280ms | <300ms |
| **Permisos requeridos** | 0 | 9 (optional) |

## 🎯 RECOMENDACIÓN

**Implementar Iteraciones 1-5 (sin permisos):**
- 6 semanas
- 96 señales (luego 111 con Iter 6 parte 1)
- 95% coverage
- 0 permisos
- Competitivo vs SHIELD/Incognia

**Iteración 6 - Parte 2 (con permisos):**
- Solo si business decide en el futuro
- Requiere LGPD consent flow
- Marginal improvement (+1% coverage)

---

*Documento optimizado para Claude Code - Copy/paste friendly*
*Carpeta: koin-browser-intelligence/.claude/product_plan/*
*Última actualización: Enero 2025*
