# Add Signal — proceso completo

Leer antes de agregar cualquier señal nueva al proyecto.
Este proceso cubre las tres etapas: captura, HTML, documentación.

## Antes de empezar

Identificar la señal en koin_signals_master_table.md.
Confirmar la iteración a la que pertenece.
Confirmar que no requiere permisos del usuario.
Si requiere permisos, no implementar — marcar como ROADMAP.

## Paso 1 — Agregar la captura en collector.js

Ubicar el bloque del objeto donde corresponde la señal
según su categoría (behavioral, hardware, system, etc.)
Si el bloque no existe, crearlo como objeto anidado nuevo.

La señal debe cumplir estas condiciones:
- Retornar null si la API no está disponible, nunca tirar error
- Producir el mismo valor en el mismo browser entre cargas
- No agregar más de 200ms al tiempo total de ejecución
- Usar solo APIs disponibles sin permisos del usuario

Verificar que el campo nuevo existe en el objeto que retorna
collectDeviceData() — ese objeto es el que se manda a Toqan.
Si la señal no está en el JSON enviado, el agente no puede evaluarla.

## Paso 2 — Mapear al tab Señales raw en dashboard.html

Ubicar la sección correspondiente en pane-raw.
Si la sección no existe, crearla siguiendo el patrón
exacto de las secciones existentes: sig-section, sig-sec-hd,
ssh-icon, ssh-title, ssh-count, sig-grid.

Agregar una card .sc siguiendo estas reglas de estado:
- Si el valor indica riesgo → agregar clase risk y descripción en rojo
- Si el valor es ambiguo → agregar clase warn y descripción en amarillo
- Si el valor es normal → agregar clase ok y descripción en verde
- Si el valor es null → sin clase de estado, mostrar "—"

El badge de la card debe ser:
- Sin badge → señales originales de las 47 base
- NEW azul → iteraciones 1 a 5
- ROADMAP púrpura → iteración 6

Actualizar el contador ssh-count de la sección.

Leer el valor desde SESSION usando el mismo path
que tiene en el schema de collector.js.
Usar el helper abbrev() para hashes largos.
Usar el helper val() para valores que pueden ser null.

## Paso 3 — Documentar

En docs/PROGRESS.md marcar la señal como completada.
Si se tomó alguna decisión técnica relevante,
registrarla en docs/DECISIONS.md con la fecha.

## Criterio de done para una señal

El valor aparece en el tab Señales raw con datos reales del browser.
No hay errores en la consola del browser.
El valor es estable entre recargas de la página.
El badge corresponde a la iteración correcta.
