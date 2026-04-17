# CLAUDE.md — Koin Browser Intelligence

> Leer completo al inicio de cada sesión. Es la fuente de verdad del proyecto.
> Antes de escribir código, leer las secciones relevantes de `.claude/agents/` y `.claude/skills/`.

---

## Qué es este proyecto

Sistema de detección de fraude basado en señales del browser para Koin.
Se construye en 3 capas progresivas:

```
Browser del usuario
       ↓
[Script JS] ──→ device_data       (señales crudas)
                     ↓
              device_intelligence  (asociaciones derivadas)
                     ↓
               fraud_vectors       (scores de riesgo)
```

**Estado actual:** ver `docs/PROGRESS.md`
**Decisiones tomadas:** ver `docs/DECISIONS.md`
**Contexto de dominio:** ver `docs/CONTEXT.md`

---

## Principios — leer antes de codear

1. **MVP primero.** La solución más simple que funcione gana siempre.
2. **No sobrecomplejes.** Si una función tiene más de 30 líneas, preguntá si se puede dividir.
3. **No agregues dependencias sin preguntar.** Cada librería nueva requiere justificación.
4. **Una responsabilidad por archivo.** `collector.js` solo captura. `intelligence.js` solo analiza. `vectors.js` solo scorea.
5. **Documentá los cambios.** Toda decisión importante va en `docs/DECISIONS.md`. Todo avance en `docs/PROGRESS.md`.
6. **El schema JSON de Koin no se rompe.** Si hay que extenderlo, documentarlo primero.

---

## Stack técnico

- **Captura:** Script JS puro en el browser (sin frameworks, sin dependencias)
- **Análisis:** JS / Node según contexto
- **UI (si aplica):** React + Vite + Untitled UI + Tailwind — ver `.claude/skills/UI_SKILL.md`
- **Tests:** por definir en fase 2

---

## Agentes disponibles

Antes de arrancar una tarea, identificar cuál agente corresponde:

| Agente | Archivo | Cuándo usarlo |
|--------|---------|---------------|
| Planner | `.claude/agents/planner.md` | Planificar, priorizar, decidir qué sigue |
| Collector | `.claude/agents/collector.md` | Trabajar en `src/fingerprint/collector.js` |
| Intelligence | `.claude/agents/intelligence.md` | Trabajar en `src/fingerprint/intelligence.js` |
| Vectors | `.claude/agents/vectors.md` | Trabajar en `src/fingerprint/vectors.js` |

---

## Cómo reportar un avance

Cuando se completa algo:
1. Actualizar el checkbox correspondiente en `docs/PROGRESS.md`
2. Si hubo una decisión de diseño importante, agregarla en `docs/DECISIONS.md`
3. Confirmar al usuario qué sigue según la hoja de ruta

---

## Cómo incorporar el benchmark

Cuando llegue el benchmark `.MD` de señales:
1. Leerlo completo
2. Cruzarlo con las señales actuales en `docs/CONTEXT.md`
3. Identificar las señales de mayor impacto / menor dificultad
4. Proponer orden de implementación antes de escribir código
5. Implementar de a una iteración, actualizando `PROGRESS.md` al completar cada una

---

## Lo que NO hacer nunca

- Reescribir archivos enteros cuando solo hay que modificar una parte
- Crear abstracciones antes de tener 2+ casos de uso reales
- Instalar librerías para resolver algo que se puede hacer en 10 líneas de JS
- Mezclar responsabilidades entre collector / intelligence / vectors
- Ignorar `docs/DECISIONS.md` — si algo ya se decidió, no redecidirlo
