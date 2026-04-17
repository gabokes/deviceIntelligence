/**
 * intelligence.js — device_intelligence
 *
 * Analiza el output de collector.js y genera asociaciones, inconsistencias
 * y scores intermedios que alimentan fraud_vectors.
 *
 * Input:  device_data (output de collector.js)
 * Output: device_intelligence (schema en .claude/agents/intelligence.md)
 *
 * Estado: esqueleto — implementar en Fase 2
 */

// ─── Reglas de inconsistencia ─────────────────────────────────────────────────

/**
 * Regla: timezone_lang_mismatch
 * Señales: timezone, lang
 * Vector: Proxy/VPN
 * Output: boolean
 */
function rule_timezone_lang_mismatch(deviceData) {
  try {
    const { timezone, lang } = deviceData.session;
    if (!timezone || !lang) return false;

    // Mapeo básico timezone → región esperada
    // TODO: expandir con tabla completa
    const latinAmericaTimezones = [-3, -4, -5, -6];
    const spanishLangs = ['es', 'es-AR', 'es-ES', 'es-MX', 'es-UY'];

    const isLatamTZ = latinAmericaTimezones.includes(timezone);
    const isSpanish = spanishLangs.some(l => lang.startsWith(l.split('-')[0]));

    // Si timezone es LATAM pero lang no es español → sospechoso
    return isLatamTZ && !isSpanish;
  } catch (e) {
    return false;
  }
}

/**
 * Regla: ua_screen_mismatch
 * Señales: userAgent, screen.width, screen.height, devicePixelRatio
 * Vector: Browser Spoofing
 * Output: boolean
 */
function rule_ua_screen_mismatch(deviceData) {
  try {
    const { userAgent, screen, devicePixelRatio } = deviceData.session;
    if (!userAgent || !screen) return false;

    const isMobileUA = /Mobile|Android|iPhone|iPad/i.test(userAgent);
    const isDesktopScreen = screen.width >= 1024;
    const hasDesktopPixelRatio = devicePixelRatio === 1;

    // UA dice mobile pero pantalla es desktop
    if (isMobileUA && isDesktopScreen && hasDesktopPixelRatio) return true;

    return false;
  } catch (e) {
    return false;
  }
}

/**
 * Regla: hardware_profile_anomaly
 * Señales: cores, deviceMemory, cpuSpeed
 * Vector: Emulator/VM
 * Output: boolean
 */
function rule_hardware_profile_anomaly(deviceData) {
  try {
    const { cores, deviceMemory, cpuSpeed } = deviceData.session;
    if (!cores || !deviceMemory || !cpuSpeed?.average) return false;

    // Hardware declarado premium pero performance miserable → VM
    const hasPremiumHardware = cores >= 8 && deviceMemory >= 16;
    const hasSlowCPU = cpuSpeed.average > 200; // ms — muy lento para ese hardware

    return hasPremiumHardware && hasSlowCPU;
  } catch (e) {
    return false;
  }
}

// ─── Scores intermedios ───────────────────────────────────────────────────────

function score_hardware_consistency(deviceData) {
  // TODO: implementar en Fase 2
  return 1;
}

function score_browser_consistency(deviceData) {
  // TODO: implementar en Fase 2
  return 1;
}

function score_network_consistency(deviceData) {
  // TODO: implementar en Fase 2
  return 1;
}

function score_behavioral_naturalness(deviceData) {
  // TODO: implementar en Fase 2
  // Requiere señales de comportamiento (mouse, keyboard) — pendiente Iteración 3
  return 1;
}

// ─── Pipeline principal ───────────────────────────────────────────────────────

function analyze(deviceData) {
  const inconsistencies = {
    timezone_lang_mismatch: rule_timezone_lang_mismatch(deviceData),
    ua_screen_mismatch: rule_ua_screen_mismatch(deviceData),
    canvas_drift: false, // TODO: requiere comparación cross-sesión
    hardware_profile_anomaly: rule_hardware_profile_anomaly(deviceData),
  };

  const derived = {
    likely_vpn: inconsistencies.timezone_lang_mismatch,
    likely_emulator: inconsistencies.hardware_profile_anomaly,
    fingerprint_cleaning_detected: inconsistencies.canvas_drift,
    automation_signals_count: 0, // TODO: implementar en Iteración 2
  };

  const scores = {
    hardware_consistency: score_hardware_consistency(deviceData),
    browser_consistency: score_browser_consistency(deviceData),
    network_consistency: score_network_consistency(deviceData),
    behavioral_naturalness: score_behavioral_naturalness(deviceData),
  };

  return { inconsistencies, derived, scores };
}

// ─── Export ───────────────────────────────────────────────────────────────────

if (typeof window !== 'undefined') {
  window.KoinIntelligence = { analyze };
}

if (typeof module !== 'undefined') {
  module.exports = { analyze };
}
