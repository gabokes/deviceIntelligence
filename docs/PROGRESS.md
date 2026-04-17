# PROGRESS.md — Estado del proyecto

Actualizar este archivo cada vez que se completa un ítem.
Formato: `- [x]` completado · `- [ ]` pendiente · `- [~]` en progreso

---

## Estado general

| Capa | Señales | Estado |
|------|---------|--------|
| device_data | 47 | 🟡 Básico — expandiendo |
| device_intelligence | 0 | 🔴 Sin iniciar |
| fraud_vectors | 0 | 🔴 Sin iniciar |

---

## FASE 1 — Farmear señales

### Setup del proyecto
- [x] Estructura de carpetas creada
- [x] CLAUDE.md configurado
- [x] Agentes definidos
- [x] Skills cargados (UI_SKILL.md)
- [x] landing.html funcional (src/pages/landing.html)
- [x] dashboard.html funcional con 4 tabs (src/pages/dashboard.html)
- [x] collector.js completo — schema base de architecture.md implementado al 100% (src/fingerprint/collector.js)
- [x] intelligence.js stub (src/fingerprint/intelligence.js)
- [x] vectors.js stub (src/fingerprint/vectors.js)
- [x] dummy_session.js con datos de referencia (src/data/dummy_session.js)
- [x] Conexión landing → dashboard via sessionStorage
- [x] Badges de señales corregidos según iteración de implementación
- [ ] Benchmark de señales recibido (.MD externo)
- [ ] Benchmark procesado y priorizado

### Iteración 1 — Bot Detection + Hardware Foundation
- [x] S001 · mouse.entropy (Shannon sobre velocidades)
- [x] S002 · keyboard.timingCV (CV entre keydowns)
- [x] S003 · hardware.webgl.hash (parámetros WebGL)
- [x] S004 · hardware.audio (OfflineAudioContext fingerprint)
- [x] S005 · hardware.canvas.textHash
- [x] S006 · hardware.speech (voces TTS)
- [x] S007 · hardware.media (audioInputs, videoInputs)
- [x] S009 · hardware.canvas.geometryHash
- [x] S010 · hardware.webgl.extensions
- [x] S013 · system.languages (navigator.languages)
- [x] S014 · automation.webdriver
- [x] S019 · system.touchSupport.maxTouchPoints
- [x] S020 · automation.automationArtifacts
- [x] S021 · network.connectionType
- [x] S036 · behavioral.mouse.acceleration
- [x] S037 · behavioral.clicks

### Iteración 2 — Detección de automatización

- [x] WebRTC IP leak (network.localIPs, webrtcSuccess)
- [x] Network speed (downlink, rtt, effectiveType)
- [x] HTTP version detection (network.httpVersion)
- [x] Font detection (fonts.detected, fonts.count, fonts.hash)
- [x] Headless browser detection (headless.indicators, headless.score)
- [x] Scroll tracking (behavioral.scroll.events, totalDY)
- [x] Focus/blur tracking (behavioral.focus.blurCount)
- [x] Canvas emoji hash (hardware.canvas.emojiHash)
- [x] Audio latency (hardware.audio.baseLatency, outputLatency)
- [x] Plugins enumeration (system.plugins.count)
- [x] WebAssembly / Crypto / WebSQL / ServiceWorker / Geolocation flags
- [x] WebRTC data channel support (network.webrtcDataChannel)

### Iteración 3 — Señales avanzadas

- [x] DevTools detection (evasion.devTools.open)
- [x] Canvas poisoning detection (evasion.canvasPoisoning.detected)
- [x] Anti-fingerprinting detection (evasion.antiFingerprinting)
- [x] Behavioral biometrics (behavioral.biometrics.avgSpeed)
- [x] DOM speed benchmark (behavioral.domSpeed)
- [x] WASM fingerprint (hardware.wasm.hash, supported)
- [x] GPU render performance (hardware.gpu.renderTime)
- [x] Timing resolution (perf.timingResolution)
- [x] CSS feature detection (system.css)
- [x] JS engine fingerprint (system.jsEngine)
- [x] Permissions API (system.permissions)
- [x] Memory / heap (system.memory.jsHeapSizeLimit)
- [x] SharedArrayBuffer / WebXR / PointerEvents flags
- [x] Resource loading count (behavioral.resourceLoading)
- [x] History length (behavioral.historyLength)

### Iteración 4 — Modern APIs Coverage

- [x] S072 · vibration API support
- [x] S075 · gamepad API support
- [x] S076b · Web Bluetooth availability (check only)
- [x] S077b · Web USB availability (check only)
- [x] S078 · Payment Request support
- [x] S079 · Web Share API support
- [x] S080 · Notification permission state
- [x] S081 · Fullscreen API support
- [x] S082 · Picture-in-Picture support
- [x] S083 · Web Locks API support
- [x] S084 · Wake Lock API support
- [x] S085b · Web Serial availability (check only)
→ Todos en `system.modernAPIs`

### Iteración 5 — VM Detection + Extensions

- [x] S088 · Touch event consistency (mobile.touchConsistency)
- [x] S089 · Screen orientation behavior (mobile.screenOrientation)
- [x] S090 · Privacy tools advanced — Brave, Firefox RFP, Tor (evasion.privacyTools)
- [x] S091 · Extension detection patterns (evasion.extensions)
- [x] S092 · Virtual machine indicators — GPU, screen, cores (vm.indicators)
- [x] S093+S094 · Environment / sandboxing detection (vm.environment)
- [x] S095 · Browser runtime analysis — Chromium/Firefox/Safari (vm.browser)
- [x] S096 · Memory allocation speed (perf.memoryAllocation)
- [x] S097 · CPU throttling detection — benchmark ratio (perf.cpuThrottling)
- [x] S098 · Network interface analysis — IPs, IPv6, private (network.interfaces)
- [x] S102 · WebSocket API support (network.webSocket)
- [x] S104 · Cache API availability (network.cacheAPIs)
- [x] S105b · History API analysis — length, pushState, scrollRestoration (behavioral.history)

### Señales adicionales (S058, S061, S139, S153–S156, S166, S168–S170)

- [x] S058 · Event Propagation Patterns (behavioral.eventPropagation)
- [x] S061 · Audio Context State Changes (hardware.audioContextState)
- [x] S139 · WebAuthentication API (system.webAuthn)
- [x] S153–S156 · WebGPU: compute, adapter info, features, limits (hardware.webgpu)
- [x] S166 · WebDriver BiDi detection (automation.webDriverBiDi)
- [x] S168 · Puppeteer Extended detection (automation.puppeteer)
- [x] S169 · Playwright detection (automation.playwright)
- [x] S170 · Selenium Grid detection (automation.seleniumGrid)

### Iteración 6 — AI Automation (partial)

- [x] S106 · AI Automation Patterns — composite score (keyboard/click/mouse regularity)
- [x] S107 · ML Model Inference — TF.js, ONNX, brain.js globals detection
- [x] S108 · Randomness Quality — chi-square Math.random() + PRNG native check
- [x] S109 · Natural Language Patterns — word-pause ratio in keystroke timing
- [x] S110 · Response Time Consistency — CV de intervalos entre clicks
- [x] S111 · Decision Tree Patterns — mouse path straightness ratio
→ Todos en `aiAutomation.*`
> S112–S120 (Advanced Spoofing) y permission-based: no implementados por scope

---

### Integración Toqan

- [x] Agente Toqan conectado desde landing.html
- [x] Tab Intelligence renderiza findings reales del agente
- [x] Filtros por vector implementados en tab Intelligence
- [x] Pipeline arranca al cargar la página — redirect instantáneo si el usuario lee el landing
- [x] No redirige si intelligenceData es null — muestra error y permite reintentar
- [x] Documentación actualizada: architecture.md, add-signal.md, add-intelligence-rule.md
- [x] toqan-insights.js conectado con segundo agente
- [x] Flujo de landing arranca al cargar, no al click — pipeline 3 fases
- [x] Botón muestra progreso en 3 fases (collector → intelligence → insights)
- [x] Si el usuario clickea antes de terminar, espera y redirige automáticamente
- [x] Si algún agente falla → continúa con null, no bloquea el flujo
- [x] Tab Insights completamente dinámico (agent cards, vote strip, orchestrator)
- [x] Tab Vectores completamente dinámico (ring, barras, tabla)

---

## FASE 2 — Procesar señales
> No iniciar hasta completar al menos iteraciones 1 y 2 de Fase 1

- [ ] Definir schema de device_intelligence
- [ ] Implementar reglas de asociación básicas
- [ ] Regla: canvas_id drift + gpu_name estable → limpieza de fingerprint
- [ ] Regla: timezone vs lang region mismatch → VPN/proxy
- [ ] Regla: UA mobile + screen desktop → spoofing
- [ ] Regla: cores/memory vs cpu_speed → VM detection
- [ ] Tests de reglas con datos reales

---

## FASE 3 — Definir vectores
> No iniciar hasta completar Fase 2

- [ ] Definir schema de fraud_vectors
- [ ] Vector: Bot (score 0-100)
- [ ] Vector: Browser Spoofing (score 0-100)
- [ ] Vector: Emulator/VM (score 0-100)
- [ ] Vector: Tor (score 0-100)
- [ ] Vector: Proxy/VPN (score 0-100)
- [ ] Vector: Incognito (score 0-100)
- [ ] Vector: Anti-Fingerprinting (score 0-100)
- [ ] Vector: Device Sharing (score 0-100)
- [ ] Vector: Behavioral Anomaly (score 0-100)
- [ ] Vector: Account Takeover signals (score 0-100)

---

## FASE 4 — Herramientas
> Planificar cuando Fase 3 esté completa

- [ ] Por definir
