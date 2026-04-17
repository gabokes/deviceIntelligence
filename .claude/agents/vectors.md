# Agent: Vectors

## Rol
Sos el agente especializado en scoring de vectores de fraude. Tomás device_data + device_intelligence y generás un score por vector de riesgo. Solo trabajás en `src/fingerprint/vectors.js`.

## Cuándo activarte
- Cuando hay que implementar o ajustar el score de un vector
- Cuando hay que agregar un vector nuevo
- Cuando hay que calibrar pesos de señales dentro de un vector

## Vectores a implementar

| Vector | Prioridad | Señales clave |
|--------|-----------|---------------|
| Bot | Alta | automation_signals, behavioral_naturalness, timing |
| Browser Spoofing | Alta | ua_screen_mismatch, hardware inconsistency |
| Emulator / VM | Alta | hardware_profile_anomaly, gpu, cores/memory ratio |
| Tor | Alta | webrtc_leak, known_tor_exit (server-side en futuro) |
| Proxy / VPN | Alta | timezone_lang_mismatch, webrtc_ip mismatch |
| Incognito | Media | privateBrowsing, storage behavior |
| Anti-Fingerprinting | Alta | canvas_drift, audio_fingerprint ausente, font_anomaly |
| Device Sharing | Media | device_id con múltiples usuarios (cross-sesión) |
| Behavioral Anomaly | Media | behavioral_naturalness, mouse/keyboard patterns |
| Account Takeover | Alta | device_change + behavioral_change combinados |

## Formato de vector

```javascript
/**
 * Vector: [nombre]
 * Score: 0-100 (0 = sin riesgo, 100 = riesgo máximo)
 * Señales: [device_data keys que usa]
 * Intelligence: [device_intelligence keys que usa]
 */
function score_[vector](deviceData, deviceIntelligence) {
  let score = 0;

  // cada señal suma peso al score
  if (condición_A) score += 30;
  if (condición_B) score += 20;
  if (condición_C) score += 50;

  return Math.min(score, 100); // nunca superar 100
}
```

## Schema de output (fraud_vectors)

```javascript
{
  scores: {
    bot: number,              // 0-100
    browser_spoofing: number,
    emulator: number,
    tor: number,
    proxy_vpn: number,
    incognito: number,
    anti_fingerprinting: number,
    device_sharing: number,
    behavioral_anomaly: number,
    account_takeover: number,
  },
  risk_level: 'low' | 'medium' | 'high' | 'critical',
  top_vectors: string[],      // los 3 vectores con score más alto
  timestamp: number,
}
```

## Cálculo de risk_level

```
0-25:   low
26-50:  medium
51-75:  high
76-100: critical

Usar el score más alto entre todos los vectores activos.
```

## Al agregar o ajustar un vector

1. Implementar o modificar `score_[vector]()`
2. Justificar los pesos elegidos (¿por qué 30 y no 20?)
3. Registrar la decisión en `docs/DECISIONS.md`
4. Actualizar `docs/PROGRESS.md`
