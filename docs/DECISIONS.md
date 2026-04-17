# DECISIONS.md — Registro de decisiones

Cada decisión técnica o de producto importante va acá.
Formato: fecha · decisión · motivo · alternativas descartadas.

---

## 2026-04-16 — Segundo agente Toqan (toqan-insights.js) para agents, vectors y orchestrator

**Decisión:** `toqan-insights.js` conecta el segundo agente Toqan que recibe `device_data` + `intelligence_findings` y devuelve `{ meta, agents, vectors, orchestrator }`. El análisis arranca automáticamente al cargar `landing.html` en tres fases encadenadas: collector → intelligence (agente 1) → insights (agente 2). El botón muestra el progreso de cada fase y se habilita solo cuando los tres procesos terminan. Si el usuario clickea antes de que termine, se guarda `KOIN_USER_CLICKED = true` y se redirige automáticamente al completar. Si algún agente falla o hace timeout, el flujo continúa con `null` y el dashboard usa `DUMMY_SESSION` como fallback.

**Motivo:** El agente 1 (intelligence) produce `findings` textuales. El agente 2 (insights) produce scores estructurados por agente y vector que el dashboard puede renderizar dinámicamente. Separar los dos agentes permite que cada uno tenga su propio prompt especializado y timeout independiente.

**Alternativas descartadas:** Un solo agente que produzca todo — descartado porque un prompt único se volvería demasiado complejo y difícil de mantener. Redirigir si falla un agente — descartado porque es mejor degradar gracefully con el fallback.

**Impacto:** `src/config.js` (toqanInsights), `src/fingerprint/toqan-insights.js` (nuevo), `src/pages/landing.html` (pipeline 3 fases, manejo de click anticipado), `src/pages/dashboard.html` (insightsData + applyInsights() dinámico)

---

## 2026-04-17 — Pipeline Toqan arranca al cargar la página, no al hacer click

**Decisión:** `collectDeviceData()` y `analyzeWithToqan()` se lanzan en cuanto carga `landing.html`, sin esperar el click del usuario. El botón awaita las promesas ya en curso — si el agente terminó, el redirect es instantáneo.

**Motivo:** El agente tarda ~40s. El usuario tarda al menos ese tiempo en leer el landing. Arrancar en background elimina la espera percibida en la mayoría de los casos.

**Alternativas descartadas:** Lanzar el análisis al click — genera 40s de espera visible. Reducir el timeout — el agente necesita ese tiempo para procesar el JSON completo.

**Impacto:** `src/pages/landing.html` (pipeline en module scope, `analyzeAndRedirect` solo awaita)

---

## 2026-04-17 — No redirigir si intelligenceData es null

**Decisión:** Si `analyzeWithToqan()` retorna null (timeout, error de red, parse error), el botón muestra "Error al analizar — intentá de nuevo" y se re-habilita. No se redirige al dashboard sin datos.

**Motivo:** Redirigir con findings vacíos genera una experiencia confusa — el tab Intelligence aparece en blanco sin explicación. Mejor fallar visible en el landing y permitir reintentar.

**Alternativas descartadas:** Redirigir igual con `{ findings: [] }` y mostrar mensaje en el dashboard — más complejo y menos claro para el usuario.

**Impacto:** `src/pages/landing.html` (`analyzeAndRedirect`)

---

## 2026-04-16 — Toqan reemplaza intelligence.js como motor de análisis

**Decisión:** Toqan reemplaza intelligence.js como motor de análisis. Las reglas viven en el agente Toqan, no en el código local. toqan.js es solo el conector HTTP — no contiene lógica de negocio.

**Motivo:** Las reglas de detección son iterativas y requieren ajuste continuo con datos reales. Mantenerlas en el agente Toqan permite editarlas sin tocar código ni hacer deploy. El tab Intelligence del dashboard renderiza los findings que devuelve el agente de forma dinámica.

**Alternativas descartadas:** Mantener intelligence.js con reglas locales — requiere redeploy por cada ajuste de umbral. Mezclar lógica en toqan.js — viola el principio de una responsabilidad por archivo.

**Impacto:** `src/config.js` (nuevo), `src/fingerprint/toqan.js` (nuevo), `src/pages/landing.html` (analyzeAndRedirect actualizado), `src/pages/dashboard.html` (tab Intelligence renderizado dinámico), `.claude/skills/add-intelligence-rule.md` (proceso actualizado)

---

## Plantilla

```
## YYYY-MM-DD — Título de la decisión
**Decisión:** qué se decidió hacer
**Motivo:** por qué
**Alternativas descartadas:** qué más se evaluó y por qué no
**Impacto:** qué archivos o componentes afecta
```

---

## 2026-04-16 — Señales adicionales: automation extendida en grupo automation, WebGPU async

**Decisión:** S166/S168/S169/S170 (automation extendida) se agregan como sub-keys del grupo `automation` existente, no como grupo nuevo. WebGPU (S153-S156) va en `hardware.webgpu` y se captura en el `Promise.all` existente (timeout natural de la API). S058 (event propagation) va en `behavioral`. S061 (AudioContext state) en `hardware`. S139 (WebAuthn) en `system`.

**Motivo:** Los 4 detectores de automation son naturalmente un array de detección, coherente con `automationArtifacts` ya existente. WebGPU es async pero sin timeout propio — se une al Promise.all sin impacto en tiempo total (Chrome lo resuelve en < 10ms).

**Alternativas descartadas:** Grupo `automation_extended` — fragmenta innecesariamente. WebGPU en su propio await — serializa sin necesidad.

**Impacto:** `src/fingerprint/collector.js` (8 nuevos helpers), `src/pages/dashboard.html` (cards en GPU & WebGL, Sistema & APIs, Browser capabilities, Behavioral)

---

## 2026-04-16 — Iteración 6: AI signals usan datos _bhv ya acumulados

**Decisión:** S106–S111 no agregan nuevos listeners. Reusan el buffer `_bhv` (moves, keyGaps, clicks) ya capturado desde el inicio de sesión. Los 6 helpers corren en < 2ms en total.

**Motivo:** El análisis AI es estadístico sobre los mismos datos comportamentales de iter 1. No tiene sentido duplicar captura. Los thresholds elegidos (CV < 0.05 para keyboard/clicks, ratio > 0.95 para mouse) son conservadores para minimizar falsos positivos.

**Alternativas descartadas:** Captura separada con nuevos listeners — redundante y más costoso. Thresholds más agresivos (CV < 0.15) — demasiados falsos positivos en usuarios que tipean rápido.

**Impacto:** `src/fingerprint/collector.js` (6 helpers + grupo `aiAutomation`), `src/pages/landing.html`, `src/pages/dashboard.html` (sección "AI Automation")

---

## 2026-04-16 — Iteración 4: modernAPIs como objeto plano en system

**Decisión:** Las 12 APIs de iter 4 (S072–S085b) se agrupan en un único objeto `system.modernAPIs` con boolean flags. No se crea un grupo top-level nuevo.

**Motivo:** Son todas availability checks de una línea. Un objeto plano es más simple que 12 campos sueltos, fácil de iterar en el dashboard y en reglas de intelligence futuras.

**Alternativas descartadas:** Un grupo `apis` top-level — innecesario para 12 flags booleanos. Campos individuales en `system` — lo ensucia con 12 keys más.

**Impacto:** `src/fingerprint/collector.js` (helper `checkModernAPIs`), `src/pages/dashboard.html` (sección "APIs Modernas")

---

## 2026-04-16 — Iteración 5: grupos mobile y vm como top-level keys

**Decisión:** Las señales de iter 5 se distribuyen en: `mobile` (touch/orientation), `vm` (VM indicators, environment, browser runtime), expansiones de `evasion` (privacy tools, extensions), `network` (interfaces, websocket, cache) y `perf` (memory allocation, CPU throttling).

**Motivo:** `mobile` y `vm` merecen grupos propios porque son vectores de detección distintos (Mobile Emulation y VM/Emulator). Las expansiones de evasion/network/perf son coherentes con los grupos ya existentes.

**Alternativas descartadas:** Todo en un grupo `advanced` — no respeta la separación por categoría de señal. Añadir VM indicators dentro de `headless` — conceptualmente distintos.

**Impacto:** `src/fingerprint/collector.js` (12 nuevos helpers), `src/pages/landing.html` (mobile, vm en sessionStorage), `src/pages/dashboard.html` (3 nuevas secciones + expansiones)

---

## 2026-04-16 — Iteraciones 2+3: señales capturadas en Promise.all + nuevas secciones en dashboard

**Decisión:** Las señales async de iter 2+3 (WebRTC IPs, WASM compile, Permissions API, WebRTC data channel) se capturan en un único `Promise.all` al final de `collectDeviceData()`. El dashboard agrega 6 nuevas secciones en pane-raw: Red & WebRTC, Fonts, Sistema & APIs, Anti-Evasión, Performance & Headless, y un bloque de exportación JSON completo.

**Motivo:** `Promise.all` minimiza el tiempo total de captura (mayor cuello de botella: WebRTC 2000ms timeout). Las secciones del dashboard reflejan la agrupación lógica de señales por categoría, no por iteración, lo que facilita lectura y debug.

**Alternativas descartadas:** Captura secuencial de async signals — 4× más lenta. Una sola sección "nuevas señales" en el dashboard — difícil de escanear con 30+ señales.

**Impacto:** `src/fingerprint/collector.js`, `src/pages/dashboard.html` (6 nuevas secciones + applySession actualizado)

---

## 2026-04-16 — Iteración 1: behavioral tracking a nivel de módulo

**Decisión:** Las señales S001/S002/S036/S037 (mouse, keyboard, clicks) se colectan via event listeners que arrancan al cargar el script (`_bhv` módulo-scope), no dentro de `collectDeviceData()`. Cuando se llama `collect()`, lee el buffer acumulado.

**Motivo:** `collectDeviceData()` se llama una sola vez al click del botón. Si los listeners arrancaran adentro no habría datos previos. Al arrancar con el script se captura la interacción real del usuario antes del click.

**Alternativas descartadas:** Listeners dentro de collectDeviceData con await — no tiene sentido porque no hay tiempo de interacción posterior.

**Impacto:** `src/fingerprint/collector.js` (módulo scope), `src/pages/landing.html` (pasa nuevos grupos al sessionStorage)

---

## 2026-04-16 — Servidor de desarrollo: npx serve sin dependencias

**Decisión:** `package.json` mínimo sin dependencias. Comando `npm start` levanta `npx serve src -l 3001`. Se sirve `src/` completo para que las rutas relativas `../data/` y `../fingerprint/` desde `src/pages/` resuelvan correctamente.

**Motivo:** Sin servidor HTTP local, los browsers bloquean scripts con rutas relativas en `file://` y el `sessionStorage` entre páginas puede no persistir.

**Alternativas descartadas:** `npx serve src/pages` — descartado porque corta el acceso a `../data/dummy_session.js` y `../fingerprint/collector.js`.

**Impacto:** `package.json`

---

## 2026-04-16 — collector.js reescrito con schema exacto de 47 señales

**Decisión:** Reemplazar el stub de collector.js con la captura real de las 47 señales del schema documentado en docs/CONTEXT.md. Todas las helpers (`simpleHash`, `measureCpuSpeed`, `getCanvasFingerprint`, `getGPUInfo`, `detectOsVersion`, `detectPrivateBrowsing`, `generateSessionId`, `generateDeviceId`) viven dentro de `collectDeviceData()`.

**Motivo:** El stub anterior capturaba ~25 señales con nombres inconsistentes con el schema oficial. El rewrite alinea el output exactamente con el contrato JSON documentado, facilitando el handoff a intelligence.js y al backend futuro.

**Alternativas descartadas:** Parchear el stub señal a señal — descartado porque generaba código mezclado entre el estilo viejo y el nuevo, más difícil de mantener.

**Impacto:** `src/fingerprint/collector.js`, `src/pages/landing.html` (merge logic actualizado)

---

## 2026-04-16 — MVP sin backend: todo en el browser, sessionStorage entre páginas

**Decisión:** Fase 1 corre completamente en el browser sin backend ni APIs reales. landing.html captura señales y las pasa a dashboard.html via sessionStorage. Los datos dummy completan lo que el collector no puede capturar aún.

**Motivo:** Velocidad de iteración máxima. Sin infraestructura que mantener, sin CORS, sin deploy. Permite validar el UX completo del flujo antes de invertir en backend.

**Alternativas descartadas:** API REST local con Node — agrega complejidad de setup sin beneficio en esta fase. localStorage — sessionStorage es más apropiado para datos de sesión que no deben persistir entre tabs.

**Impacto:** `src/pages/landing.html`, `src/pages/dashboard.html`, `src/data/dummy_session.js`

---

## 2025-04-15 — Arquitectura en 3 capas separadas

**Decisión:** Separar device_data, device_intelligence y fraud_vectors en archivos independientes desde el inicio.

**Motivo:** Permite que cada capa evolucione independientemente. La captura de señales (collector) no debería saber nada de cómo se usan esas señales para detectar fraude (vectors). Facilita handoff a ingeniería.

**Alternativas descartadas:** Un solo archivo monolítico — descartado porque mezcla responsabilidades y se vuelve inmanejable al escalar señales.

**Impacto:** `src/fingerprint/collector.js`, `intelligence.js`, `vectors.js`

---

## 2025-04-15 — Script JS puro en browser para Fase 1

**Decisión:** Fase 1 usa solo un script JS que corre en el browser del usuario, sin dependencias externas ni SDK nativo.

**Motivo:** Mínima fricción para integrar. Permite validar señales antes de invertir en infraestructura más pesada.

**Alternativas descartadas:** SDK nativo mobile — más señales pero requiere integración en app, fuera del scope de Fase 1.

**Impacto:** `src/fingerprint/collector.js`

---

## 2025-04-15 — Claude Code como ejecutor, Project de Claude como cerebro estratégico

**Decisión:** El Project de Claude.ai actúa como mentor y contexto estratégico. Claude Code ejecuta las tareas concretas leyendo CLAUDE.md y los agentes.

**Motivo:** Separar la planificación de la ejecución evita que Claude Code pierda el hilo del proyecto entre sesiones.

**Impacto:** Estructura de `.claude/`, `CLAUDE.md`, `docs/`
