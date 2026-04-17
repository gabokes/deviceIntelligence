/**
 * vectors.js — fraud_vectors
 *
 * Genera scores de riesgo por vector de fraude a partir de
 * device_data + device_intelligence.
 *
 * Input:  deviceData (collector.js) + deviceIntelligence (intelligence.js)
 * Output: fraud_vectors (schema en .claude/agents/vectors.md)
 *
 * Estado: esqueleto — implementar en Fase 3
 * Nota: algunos vectores básicos están activos como punto de partida.
 */

// ─── Vectores ─────────────────────────────────────────────────────────────────

/**
 * Vector: proxy_vpn
 * Score: 0-100
 * Señales: timezone_lang_mismatch, webrtc (pendiente)
 * Intelligence: likely_vpn, network_consistency
 */
function score_proxy_vpn(deviceData, intelligence) {
  let score = 0;

  if (intelligence.inconsistencies.timezone_lang_mismatch) score += 40;
  if (intelligence.derived.likely_vpn) score += 30;
  if (intelligence.scores.network_consistency < 0.5) score += 30;

  // TODO: agregar WebRTC IP leak cuando esté en collector (Iteración 1)

  return Math.min(score, 100);
}

/**
 * Vector: browser_spoofing
 * Score: 0-100
 * Señales: ua_screen_mismatch, hardware inconsistency
 * Intelligence: browser_consistency
 */
function score_browser_spoofing(deviceData, intelligence) {
  let score = 0;

  if (intelligence.inconsistencies.ua_screen_mismatch) score += 60;
  if (intelligence.scores.browser_consistency < 0.5) score += 40;

  return Math.min(score, 100);
}

/**
 * Vector: emulator
 * Score: 0-100
 * Señales: hardware_profile_anomaly, gpu
 * Intelligence: likely_emulator, hardware_consistency
 */
function score_emulator(deviceData, intelligence) {
  let score = 0;

  if (intelligence.inconsistencies.hardware_profile_anomaly) score += 50;
  if (intelligence.derived.likely_emulator) score += 30;

  // GPU de emulador conocido
  const emulatorGPUs = ['SwiftShader', 'llvmpipe', 'SVGA3D', 'VirtualBox'];
  const gpuName = deviceData.session.gpuName || '';
  if (emulatorGPUs.some(g => gpuName.includes(g))) score += 70;

  return Math.min(score, 100);
}

/**
 * Vector: anti_fingerprinting
 * Score: 0-100
 * Señales: canvas_drift, privateBrowsing
 * Intelligence: fingerprint_cleaning_detected
 */
function score_anti_fingerprinting(deviceData, intelligence) {
  let score = 0;

  if (intelligence.inconsistencies.canvas_drift) score += 60;
  if (intelligence.derived.fingerprint_cleaning_detected) score += 40;

  // TODO: agregar audio fingerprint ausente cuando esté en collector (Iteración 1)
  // TODO: agregar font anomaly cuando esté en collector (Iteración 1)

  return Math.min(score, 100);
}

/**
 * Vector: incognito
 * Score: 0-100
 * Señales: privateBrowsing
 */
function score_incognito(deviceData, _intelligence) {
  let score = 0;

  if (deviceData.session.privateBrowsing === true) score += 80;

  // TODO: agregar storage persistence test cuando esté en collector

  return Math.min(score, 100);
}

/**
 * Vectores pendientes — implementar en Fase 3
 * Requieren señales de Iteraciones 2 y 3
 */
function score_bot(_d, _i) { return 0; }              // pendiente: automation signals
function score_tor(_d, _i) { return 0; }              // pendiente: WebRTC + server-side
function score_device_sharing(_d, _i) { return 0; }  // pendiente: cross-session
function score_behavioral_anomaly(_d, _i) { return 0; } // pendiente: mouse/keyboard
function score_account_takeover(_d, _i) { return 0; }   // pendiente: combinación

// ─── Risk level ───────────────────────────────────────────────────────────────

function calculateRiskLevel(scores) {
  const max = Math.max(...Object.values(scores));
  if (max >= 76) return 'critical';
  if (max >= 51) return 'high';
  if (max >= 26) return 'medium';
  return 'low';
}

function getTopVectors(scores, n = 3) {
  return Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .filter(([, score]) => score > 0)
    .map(([vector]) => vector);
}

// ─── Pipeline principal ───────────────────────────────────────────────────────

function evaluate(deviceData, deviceIntelligence) {
  const scores = {
    bot:                  score_bot(deviceData, deviceIntelligence),
    browser_spoofing:     score_browser_spoofing(deviceData, deviceIntelligence),
    emulator:             score_emulator(deviceData, deviceIntelligence),
    tor:                  score_tor(deviceData, deviceIntelligence),
    proxy_vpn:            score_proxy_vpn(deviceData, deviceIntelligence),
    incognito:            score_incognito(deviceData, deviceIntelligence),
    anti_fingerprinting:  score_anti_fingerprinting(deviceData, deviceIntelligence),
    device_sharing:       score_device_sharing(deviceData, deviceIntelligence),
    behavioral_anomaly:   score_behavioral_anomaly(deviceData, deviceIntelligence),
    account_takeover:     score_account_takeover(deviceData, deviceIntelligence),
  };

  return {
    scores,
    risk_level: calculateRiskLevel(scores),
    top_vectors: getTopVectors(scores),
    timestamp: Date.now(),
  };
}

// ─── Export ───────────────────────────────────────────────────────────────────

if (typeof window !== 'undefined') {
  window.KoinVectors = { evaluate };
}

if (typeof module !== 'undefined') {
  module.exports = { evaluate };
}
