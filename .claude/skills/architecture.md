# Architecture — Koin Browser Intelligence

Este documento es la fuente de verdad de la arquitectura.
Leerlo completo antes de tocar cualquier archivo del proyecto.

## Las tres capas — nunca mezclarlas

collector.js → captura señales del browser. No analiza. No decide.
intelligence.js → cruza señales. Detecta inconsistencias. No captura. No scorea.
vectors.js → calcula scores 0-100 por vector. No captura. No analiza.

Cada archivo tiene una sola responsabilidad. Nunca escribir lógica
de análisis en collector.js ni lógica de captura en intelligence.js.

## Schema base — los 47 campos originales

El objeto que retorna collectDeviceData() tiene esta estructura.
Nunca renombrar keys existentes. Nunca eliminar campos.
Solo agregar campos nuevos.

organizationId: string
sessionId: string generado por sesión
session:
  userAgent: string
  os: string
  osVersion: string detectado desde userAgent
  cookiesEnabled: boolean
  localStorage: boolean
  lang: string
  platform: string
  timezone: number en horas, ej -3
  screen:
    availHeight: number
    availWidth: number
    colorDepth: number
    width: number
    height: number
    orientation: string
  cpuSpeed:
    average: number en ms, benchmark 3 corridas
  sessionStorage: boolean
  indexedDB: boolean
  doNotTrack: boolean
  canvasId: string hash 32 chars estable
  gpuVendor: string
  gpuName: string
  cores: number
  deviceMemory: number
  devicePixelRatio: number
  privateBrowsing: boolean via Storage Quota API
  acceptContent: string siempre "/"
  javaEnabled: boolean siempre false
  javaScriptEnabled: boolean siempre true
device:
  id: string hash estable entre sesiones

## Reglas que nunca se rompen

Una responsabilidad por archivo.
Nunca romper el schema existente al agregar campos nuevos.
Si una API del browser no está disponible, retornar null. Nunca tirar error.
El collector completo debe correr en menos de 3 segundos.
Toda señal nueva debe ser estable entre cargas del mismo browser.
Sin dependencias externas sin aprobar primero en DECISIONS.md.
Todo cambio importante se registra en DECISIONS.md.
Todo avance se marca en PROGRESS.md.

## Flujo de datos entre páginas

landing.html llama a collectDeviceData()
Guarda el resultado en sessionStorage con key "koin_session_data"
dashboard.html lee sessionStorage al cargar
Si no hay datos usa DUMMY_SESSION como fallback
Los scores de agents y vectors siempre vienen de DUMMY_SESSION por ahora

## Señales: estados de implementación

Sin badge → señal original, ya capturada en collector.js
Badge NEW → iteraciones 1 a 5, implementada o en curso
Badge ROADMAP → iteración 6, no implementar todavía

## Capa de intelligence — Toqan

intelligence.js ya no procesa señales localmente.
El flujo actual es:
  collector.js → toqan.js → sessionStorage → dashboard.html
toqan.js tiene una sola responsabilidad: comunicación con el agente.
Las reglas de detección viven en el prompt del agente en la plataforma Toqan.
Para modificar reglas: editar el agente en Toqan, no tocar código.
