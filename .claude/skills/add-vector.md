# Add Vector — proceso completo

Leer antes de agregar o modificar cualquier vector en vectors.js.
Este skill es para Fase 3. No implementar hasta que
intelligence.js tenga las reglas que el vector necesita.

## Qué es un vector de riesgo

Un vector agrega múltiples hallazgos de intelligence
y produce un score de 0 a 100 con un estado y una acción recomendada.
No captura señales. No cruza señales directamente.
Solo lee hallazgos de device_intelligence.

## Los 10 vectores del proyecto

Bot · Browser Spoofing · Emulator/VM · Tor · Proxy/VPN
Incognito · Anti-Fingerprinting · Device Sharing
Behavioral Anomaly · Account Takeover

## Estructura de un vector

nombre: string
score: number 0-100
estado: "critical" | "alert" | "warn" | "clean" | "nodata"
señales_disparadoras: array de nombres de señales relevantes
peso: number proporción del score global, todos suman 1.0
accion: "block" | "review" | "allow" | "monitor"
confianza: "high" | "medium" | "low"

## Umbrales de estado

0-20 → clean
21-40 → warn
41-70 → alert
71-100 → critical

## Umbrales de acción global

75-100 → block
50-74 → review
25-49 → monitor
0-24 → allow

## Paso 1 — Implementar el scoring en vectors.js

Agregar el vector al objeto de vectores existente.
El score se calcula combinando los hallazgos de intelligence
que corresponden a ese vector.
Si todos los hallazgos son null, retornar estado "nodata".

## Paso 2 — Actualizar el tab Vectores en dashboard.html

La tabla de vectores en pane-vectors ya existe.
Actualizar la fila correspondiente al vector con:
- el score calculado en tiempo real desde SESSION
- las señales disparadoras reales
- el estado y color semántico correspondiente

Actualizar también las barras de composición en el panel izquierdo.
Recalcular el score global como promedio ponderado de todos los vectores.

## Paso 3 — Documentar

Marcar en PROGRESS.md.
Registrar los pesos elegidos en DECISIONS.md con justificación.
Los pesos son decisiones de negocio, no técnicas —
consultar antes de asignarlos si hay dudas.

## Criterio de done para un vector

El score aparece en el tab Vectores con valor real.
El color semántico corresponde al umbral correcto.
El score global se recalcula correctamente.
Si todas las señales son null, la fila muestra "sin datos".
