# UI_SKILL.md — Sistema de diseño Koin

Leer completo antes de construir o modificar cualquier componente visual.
Este skill define tanto el **qué** (stack, tokens) como el **cómo pensar** el diseño.

---

## 0. Filosofía de diseño — leer primero

Koin es una plataforma financiera B2B. El diseño comunica **confianza, precisión y control**.

### El estilo es: *data-dense, editorial, professional*

- **Información densa pero legible.** No hay espacio desperdiciado. Cada pixel tiene función.
- **Jerarquía visual a través de estructura, no de efectos.** No usar gradientes, sombras dramáticas, animaciones llamativas, ni ilustraciones decorativas para comunicar importancia. La jerarquía se logra con tipografía, espaciado y color funcional.
- **El verde Koin (`#10B132`) es un acento, no un fondo.** Aparece en acciones primarias, estados activos y métricas clave. No saturar la UI con él.
- **Sin decoración genérica de AI.** Prohibido: emojis, iconos decorativos sin función, gradientes de fondo, cards con sombra dramática, ilustraciones de relleno, skeletons innecesarios.
- **Untitled UI es el piso, no el techo.** Usar sus componentes como base. Cuando la composición lo requiera, ajustar spacing, tipografía o layout sin salirse de los tokens del sistema.

### Referencia visual de estilo

El producto se parece a: Linear, Stripe Dashboard, Vercel, Retool.
- Fondos neutros claros
- Tipografía Inter bien ajustada
- Cards con bordes sutiles, sin sombra excesiva
- Datos tabulares limpios
- Badges semánticos (no decorativos)
- Métricas destacadas con número grande + label pequeño

### Lo que distingue a Koin visualmente

- Score prominente (gauge/número grande) cuando hay una métrica principal
- Secciones colapsables con header clickeable y "ver más / ver menos"
- Insights textuales con color semántico (rojo para alertas, verde para positivos)
- Información organizada en grids de 2-4 columnas dentro de cards, no en listas verticales
- Labels en 11-12px uppercase o gray-500, valores en gray-900

---

## 1. Stack de UI

- **Framework:** React (Vite)
- **Componentes:** Untitled UI React — https://www.untitledui.com/react/components
- **Tema base:** https://github.com/otomendes/keystone-vibe — clonar, no partir de cero
- **Estilos:** Tailwind CSS (incluido en Untitled UI)
- **Tipografía:** Inter (única fuente, distintos pesos hacen la jerarquía)
- **Iconos:** Untitled UI Icons — no mezclar con otras librerías

**Regla:** Antes de crear un componente custom, verificar si existe en Untitled UI. Si existe, usar ese y ajustar tokens si es necesario.

---

## 2. Colores — Koin Keystone Design System

No inventar colores fuera de esta paleta. Fuente: PDF "Colors — KEYSTONE UI kit © 2024 KOIN".

### Gray
```
25:  #FCFCFD   50:  #F9FAFB   100: #F2F4F7   200: #EAECF0   300: #D0D5DD
400: #98A2B3   500: #667085   600: #475467   700: #344054   800: #182230
900: #101828   950: #0C111D
```

### Brand (verde Koin)
```
brand-600:   #10B132   ← acento principal, acciones, estados activos
brand-light: #F6FEF9   ← fondos de estados activos (muy sutil)
brand-mid:   #DCFAE6   ← bordes suaves en estados activos
brand-dark:  #067647   ← texto sobre fondos brand claros
```

### Semánticos
```
success-50:  #ECFDF3   success-600: #079455   success-700: #067647
error-50:    #FEF3F2   error-600:   #D92D20
warning-50:  #FFFAEB   warning-600: #DC6803
```

### Aplicación de color
| Elemento | Color |
|---|---|
| Fondo de página | gray-50 `#F9FAFB` |
| Superficies (cards, sidebar, topbar) | white |
| Bordes default | gray-200 `#EAECF0` |
| Bordes hover | gray-300 |
| Texto principal | gray-900 |
| Texto secundario | gray-500 / gray-600 |
| Labels / metadata | gray-400 / gray-500 |
| Placeholder | gray-400 |
| Acento / interactivo | brand-600 `#10B132` |
| Nav activo — fondo | brand-light |
| Nav activo — texto / borde izq | brand-600 |
| Alerta positiva | success-600, fondo success-50 |
| Alerta negativa | error-600, fondo error-50 |
| Alerta neutra/warning | warning-600, fondo warning-50 |

---

## 3. Tipografía

Inter, siempre. La jerarquía se construye con peso y tamaño, no con fuentes distintas.

| Uso | Peso | Tamaño | Color |
|---|---|---|---|
| Título de página / métrica principal | 600 | 24-28px | gray-900 |
| Títulos de sección / card header | 600 | 14px | gray-900 |
| Labels de datos | 500 | 12px | gray-500 |
| Cuerpo / valores | 400 | 14px | gray-900 |
| Texto secundario / metadata | 400 | 13px | gray-500 |
| Badges | 500 | 11–12px | semántico |
| Código | 400 | 12px mono | brand-600 sobre gray-900 |
| Insights / alertas inline | 500 | 13px | semántico (error/success/warning) |

**Regla:** Si un valor de dato es importante, ponerlo en gray-900 peso 500-600. El label que lo describe va en gray-500 peso 400, tamaño menor.

---

## 4. Composición de cards y secciones

### Card estándar
```
border: 1px solid #EAECF0
border-radius: 8px
background: white
padding: 16-20px
shadow-sm: 0 1px 2px rgba(16,24,40,0.05)
```

### Header de sección colapsable (patrón Koin)
```
[Icono] Nombre de sección          ver más / ver menos →
────────────────────────────────────────────────────────
```
- Header clickeable, colapsa/expande el contenido
- Icono: 16px, color semántico o gray-500
- Texto header: 14px 600 gray-900
- Acción: 13px 500 brand-600, cursor pointer

### Grid de datos dentro de card
Organizar información en grids, no en listas. Preferir 2-4 columnas.
```
Label        Label        Label        Label
Valor        Valor        Valor        Valor

Label        Label        Label        Label
Valor        Valor        Valor        Valor
```
- Label: 11px 500 gray-500 (puede ir uppercase)
- Valor: 13-14px 400-500 gray-900
- Gap entre columnas: 16-24px
- Gap entre filas: 12-16px

### Métricas destacadas (score, número principal)
Cuando hay una métrica clave (score, porcentaje, conteo importante):
- Número: 28-36px 600 gray-900
- Label debajo: 12px 400 gray-500
- Si tiene indicador de riesgo: badge semántico a la derecha del título

### Insights inline (lista de hallazgos)
```
● SIM swap detectado hace 15 días          ← error-600
● Email en 3 vazamentos de dados           ← error-600  
● 3 consultas de crédito en últimos 30d    ← warning-600
● Zero chargebacks en el historial         ← success-600
● Cliente hace 4 años en la red Koin       ← success-600
```
- Bullet + texto, 13px 500
- Color semántico según severidad
- Sin fondo, sin badge, solo texto con color

---

## 5. Layout general del portal

```
┌─────────────────────────────────────────────────────────┐
│  TOPBAR  64px                                            │
│  breadcrumb (izq)              progreso global (der)     │
├─────────────┬───────────────────────────────────────────┤
│             │  BARRA DE PROGRESO GLOBAL (6px, sin gap)  │
│  SIDEBAR    ├───────────────────────────────────────────┤
│  240px      │                                           │
│  fixed      │  CONTENT AREA                             │
│             │  padding 24px, fondo gray-50              │
│             │  scroll vertical                          │
└─────────────┴───────────────────────────────────────────┘
```

### Barra de progreso global — OBLIGATORIA
- Altura: 6px, sin border-radius
- Fondo: gray-100, relleno: brand-600
- Texto: `X% completado`, 12px 500 gray-500, arriba a la izquierda
- Transición: `width 0.6s ease`
- Cálculo: 8 pasos × 12.5% cada uno

### Sidebar (8 pasos)
```
[Logo Koin]  "Onboarding clientes"

  1  Alta como cliente              [badge]
  2  Comercios                      [badge]
  3  Información del negocio        [badge]
  4  Revisión manual                [badge]
  5  Consentimiento del speech      [badge]
  6  Usuarios                       [badge]
  7  Marca                          [badge]
  8  Estrategias                    [badge]

── DOCUMENTACIÓN ──
  docs/ y manuals/

── Sesión ──
  [nombre cliente]
  [email]
```

### Topbar
```
Izq: "Onboarding / Paso N — Nombre del paso"
Der: "Progreso global   X de 8 pasos completos"
```

---

## 6. Estados de pasos en el sidebar

| Estado | Visual número | Badge |
|---|---|---|
| Pendiente | círculo gray-200, número gray-400 | "Pendiente" gray-100/400 |
| En progreso | círculo brand-600, número white | "En progreso" brand-light/600 |
| Completado | círculo success-50, check success-600 | "Listo" success-50/600 |

Item activo: `background brand-light`, `border-left: 2px solid brand-600`.

---

## 7. Sombras y bordes

```
shadow-sm:  0 1px 2px rgba(16,24,40,0.05)
shadow-md:  0 4px 8px -2px rgba(16,24,40,0.1)
border:     1px solid #EAECF0
focus:      border brand-600 + ring rgba(16,177,50,0.12)
radius:     sm=6  md=8  lg=12  xl=16  full=9999  (px)
```

---

## 8. Paso 8 — Estrategias (chat)

Tres niveles: selector de estrategia → canal → chat.

### Chat layout
```
┌──────────────────────────────────────┬──────────────────────┐
│  CHAT  (flex: 1, height: 100%)       │  PANEL  (320px)      │
│  ┌─ Header: avatar + estado ────────┐│  ┌─ Progreso ───────┐│
│  ├─ Barra progreso flujo (4px) ─────┤│  │  sub-paso activo  ││
│  │  área mensajes (flex:1, scroll)  ││  └──────────────────┘│
│  ├─ Botones opciones ───────────────┤│  ┌─ Documentos ─────┐│
│  └─ Input + Enviar ────────────────┘│  │  PDF + MD links   ││
└──────────────────────────────────────┴──┴──────────────────┘
```

Altura: `calc(100vh - topbar - barra progreso - padding)`

### Chat — estilo visual (tema claro siempre)

| Elemento | Valor |
|---|---|
| Fondo área mensajes | gray-50 |
| Burbuja bot | white, border gray-200, shadow-sm, radius 4px 12px 12px 12px |
| Burbuja usuario | gray-900 bg, white text, radius 12px 4px 12px 12px |
| Avatar bot | gray-900 bg, brand-600 text, border-radius 8px |
| Avatar usuario | iniciales, brand-light bg, brand-600 text |
| Botón primario | gray-900 bg, white text |
| Botones secundarios | white bg, gray-300 border, gray-600 text |
| Input | border gray-300, focus: brand-600 + ring |
| Botón Enviar | brand-600 bg, white text |
| Tip | border-left 2px brand-600, bg rgba(16,177,50,0.05) |
| Warning | border-left 2px warning-600, bg warning-50 |
| Ok | border-left 2px success-600, bg success-50 |
| Código | gray-900 bg, brand-600 text, mono, border-left 3px brand-600 |

---

## 9. Componentes Untitled UI

| Componente | Untitled UI | Dónde |
|---|---|---|
| Sidebar | `sidebar-navigations` | Layout global |
| Page header | `page-headers` | Cada paso |
| Progress bar | `progress-indicators` | Barra global + flujo |
| Cards seleccionables | `radio-groups` | Paso 8 nivel 1 y 2 |
| Form inputs | `inputs` | Pasos 1, 3, 4 |
| File uploader | `file-uploaders` | Pasos 1, 7 |
| Tablas / toggles | `tables` / `toggles` | Pasos 2, 6 |
| Progress steps | `progress-steps` | Panel lateral chat |
| Badges | `badges` | Estados |
| Alerts | `alerts` | Tips/warnings en chat |
| Chat | `messaging` | Paso 8 |
| Code snippets | `code-snippets` | Scripts en chat |
| Empty states | `empty-states` | Canales/estrategias pendientes |

---

## 10. Anti-patrones — nunca hacer

- Emojis en la UI (ni en títulos, ni en mensajes del sistema, ni en badges)
- Gradientes de fondo o en cards
- Sombras dramáticas (`box-shadow` grandes)
- Ilustraciones decorativas sin función
- Iconos mezclados de librerías distintas
- Cards con colores de fondo saturados
- Animaciones que no comunican estado
- Texto en mayúsculas largas (solo labels cortos, máx 2-3 palabras)
- Tema oscuro (solo en bloques de código)
- HTML vanilla sin React
- Colores fuera de la paleta Keystone
- Chat que no ocupa el viewport disponible

---

## 11. Decisiones de diseño al construir — checklist mental

Antes de escribir código, responder:

1. **¿Qué información es la más importante en esta pantalla?** → Va más grande, más arriba, gray-900.
2. **¿Hay una métrica principal?** → Score o número destacado, no enterrado en una card igual a las demás.
3. **¿La información se puede organizar en grid?** → Siempre preferir grid sobre lista vertical.
4. **¿Estoy usando color para decorar o para comunicar estado?** → Solo lo segundo.
5. **¿Hay algún elemento que no tenga función?** → Sacarlo.
6. **¿Untitled UI tiene este componente?** → Usarlo. Si necesito ajustarlo, ajustar tokens, no crear desde cero.
7. **¿Se ve como un producto de análisis financiero serio?** → Si parece un landing page o una app de consumo, algo está mal.

---

## 12. Checklist antes de deploy

- [ ] Barra de progreso global visible, % correcto (8 pasos × 12.5%)
- [ ] Chat ocupa todo el alto disponible del viewport en paso 8
- [ ] Paso 8: selector estrategia → canal → chat funcionando
- [ ] Solo estrategias contratadas visibles
- [ ] Sub-paso activo resaltado en panel lateral
- [ ] Documentos del panel apuntan a archivos reales del repo
- [ ] Pasos 1–7 funcionales
- [ ] Sidebar: 8 ítems, estados actualizados
- [ ] Tema claro en todo el portal (excepto bloques de código)
- [ ] Sin emojis, sin gradientes, sin ilustraciones decorativas
- [ ] Responsive
- [ ] Checklist de `CHATBOT_SKILL.md` sección 9 pasado
