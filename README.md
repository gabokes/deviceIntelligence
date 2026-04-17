# Koin Browser Intelligence

Sistema de detección de fraude basado en señales del browser.

## Arquitectura

```
device_data → device_intelligence → fraud_vectors
```

| Capa | Archivo | Descripción |
|------|---------|-------------|
| device_data | `src/fingerprint/collector.js` | Captura señales crudas del browser |
| device_intelligence | `src/fingerprint/intelligence.js` | Analiza y asocia señales |
| fraud_vectors | `src/fingerprint/vectors.js` | Genera scores de riesgo por vector |

## Vectores de riesgo

Bot · Browser Spoofing · Emulator/VM · Tor · Proxy/VPN · Incognito · Anti-Fingerprinting · Device Sharing · Behavioral Anomaly · Account Takeover

## Documentación

- `docs/CONTEXT.md` — Contexto de dominio, señales actuales, gaps
- `docs/PROGRESS.md` — Estado de iteraciones
- `docs/DECISIONS.md` — Registro de decisiones técnicas
- `.claude/` — Contexto para Claude Code (agentes, skills)

## Para Claude Code

Leer `CLAUDE.md` antes de cualquier tarea.

## Para ingeniería

El proyecto fue construido como MVP por dev/producto.
El contexto de cada decisión está en `docs/DECISIONS.md`.
La arquitectura es intencionalmente simple y sin dependencias externas en la fase 1.
