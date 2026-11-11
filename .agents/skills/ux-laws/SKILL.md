---
name: ux-laws
description: Compendio normativo y operativo de Leyes de Gestalt, Principios de Don Norman, Heurísticas de Nielsen y Leyes de Steve Krug para diseño y arquitectura de interfaces (UI/UX) en Equarys.
metadata:
  author: equarys
  version: "1.0.0"
---

# Leyes de UX, Heurísticas y Principios Cognitivos (Equarys SSOT)

Esta skill es la guía canónica de leyes cognitivas, percepción visual y usabilidad para todo diseño, revisión o refactorización de interfaces en Equarys. Se integra como base teórica y práctica obligatoria junto con `interface-design` y `anti-vibecoded`.

---

## 1. Leyes de la Gestalt (Percepción Visual y Agrupamiento)

La mente humana percibe patrones visuales completos antes que partes individuales. Si la disposición espacial contradice la relación lógica, el usuario experimenta fatiga visual y comete errores.

1. **Ley de Proximidad (Proximity)**:
   - *Principio*: Los elementos visualmente cercanos se perciben como pertenecientes al mismo grupo funcional o conceptual.
   - *Regla en UI*: 
     - La etiqueta debe estar más cerca de su valor correspondiente que del campo contiguo (Definition Lists en 2 columnas contiguas en lugar de `justify-between` con 400px de vacío).
     - El espaciado *interno* de un grupo (`gap-y-2` a `gap-y-3`) debe ser notablemente menor que el espaciado *entre secciones* (`space-y-6` a `space-y-8`).
2. **Ley de Similitud (Similarity)**:
   - *Principio*: Elementos que comparten forma, color, tamaño o tipografía se perciben como portadores de la misma función o jerarquía.
   - *Regla en UI*: Todos los badges de estado deben compartir el mismo formato tipográfico y dimensiones; botones primarios solo para la acción conductora; nunca usar colores de estado (verde, rojo, ámbar) de manera decorativa.
3. **Ley de Continuidad y Destino Común (Continuity)**:
   - *Principio*: El ojo humano sigue naturalmente líneas rectas o curvas continuas.
   - *Regla en UI*: Alinear etiquetas a la izquierda en una columna y valores en otra columna contigua para que el escaneo vertical sea una línea recta perfecta. Evitar alineaciones a la derecha en párrafos largos (como direcciones postales).
4. **Ley de Región Común (Common Region)**:
   - *Principio*: Elementos delimitados dentro de un mismo contenedor, borde o fondo se perciben unificados.
   - *Regla en UI*: Usar tarjetas o paneles solo cuando agrupen una entidad atómica independiente; no anidar cajas grises dentro de cajas grises innecesariamente.
5. **Ley de Figura y Fondo (Figure / Ground)**:
   - *Principio*: El ojo separa el objeto focal (figura) de su entorno (fondo).
   - *Regla en UI*: En modales y drawers, el backdrop debe atenuar el fondo y el contenedor debe mantener una elevación clara y nítida (`z-[200]` con sombra y borde sutil).
6. **Ley de Cierre (Closure) y Pregnancia (Prägnanz)**:
   - *Principio*: El cerebro completa formas incompletas y prefiere interpretaciones ordenadas y simples.
   - *Regla en UI*: Eliminar líneas divisorias o bordes superfluos si el espacio negativo (whitespace) ya define el agrupamiento con claridad.

---

## 2. Principios de Don Norman (*The Design of Everyday Things*)

1. **Affordances (Capacidades Percibidas)**:
   - Qué acciones permite un componente. Un botón debe parecer presionable; un input debe invitar al ingreso de texto; un texto informativo plano no debe lucir interactivo.
2. **Signifiers (Significantes)**:
   - Señales explícitas que comunican dónde y cómo interactuar: iconos directos del dominio (`Phone` para teléfono, `MapPin` para dirección, flechas de expansión para colapsables, cursores `cursor-pointer`).
3. **Constraints (Restricciones Preventivas)**:
   - Restricciones físicas, lógicas y semánticas que hacen imposible el error: deshabilitar fechas futuras en métricas históricas, limitar inputs monetarios a números y formatear separadores en tiempo real.
4. **Mapping (Mapeo Natural)**:
   - La relación espacial y lógica entre el control y el resultado debe coincidir con la expectativa natural del usuario (ej. controles de zoom, reordenamiento de listas o posición de pasos secuenciales).
5. **Feedback Inmediato**:
   - Toda acción del usuario (clic, drag, guardado) debe recibir confirmación visual instantánea: loaders en botones, animaciones de salida/entrada fluidas, toasts confirmatorios.
6. **Modelos Conceptuales**:
   - La interfaz debe proyectar cómo funciona el sistema de forma transparente. Si un pedido expira, no puede mostrarse a la vez como "Nuevo": debe reflejar fielmente su ciclo de vida real.

---

## 3. Leyes de Steve Krug (*Don't Make Me Think*)

1. **Primera Ley: ¡No me hagas pensar!**:
   - Cada página o panel debe ser autoexplicativa. Si el usuario tiene que detenerse a descifrar qué significa un dato o cómo interpretarlo, el diseño falló.
2. **Escaneabilidad sobre Lectura**:
   - Los usuarios de software de gestión no leen: escanean buscando datos críticos (cliente, dirección, monto, estado). Usar jerarquía tipográfica nítida, datos tabulares y contraste marcado.
3. **Omitir Palabras Inútiles**:
   - Eliminar prosa decorativa, etiquetas redundantes y textos conversacionales en paneles operativos. Claridad seca, funcional y profesional.
4. **Satisficing**:
   - Los usuarios eligen la primera opción razonable que resuelve su problema. Los flujos primarios deben ser obvios y directos.

---

## 4. Las 10 Heurísticas de Usabilidad de Jakob Nielsen (NN/g)

1. **Visibilidad del estado del sistema**: El usuario siempre sabe qué ocurre mediante estados, badges de progreso y loaders reales. Un solo estado canónico a la vez.
2. **Correspondencia con el mundo real**: Hablar el lenguaje del comercio y del operador (ej. "Transferencia Bancaria", "Envío a domicilio"), no identificadores técnicos (`bank_transfer`, `delivery_type`).
3. **Control y libertad del usuario**: Salidas de emergencia claras: cancelar diálogos con `Escape`, botón de cerrar visible, deshacer cambios antes de impactar.
4. **Consistencia y estándares**: Mismos iconos, mismos tokens de diseño (`var(--surface-1)`, `var(--text-primary)`), mismos atajos en todo el ecosistema.
5. **Prevención de errores**: Diseños que eliminan situaciones de error antes de que ocurran (confirmación modal con motivo para cancelaciones, validación previa).
6. **Reconocimiento antes que recuerdo**: Mostrar la información contextual necesaria en pantalla sin obligar al usuario a memorizar datos entre pasos.
7. **Flexibilidad y eficiencia de uso**: Teclas de acceso rápido, acciones de 1 clic para operadores intensivos (POS, comprobantes térmicos de impresión).
8. **Diseño estético y minimalista**: Toda información extra compite visualmente con la información relevante. Cero adornos o gradientes distractores.
9. **Ayuda para reconocer, diagnosticar y recuperarse de errores**: Errores en rojo claro, explicando el motivo concreto y ofreciendo un botón de "Reintentar".
10. **Ayuda y documentación**: Instrucciones contextuales claras y tooltips breves donde haya complejidad operativa.

---

## 5. Otras Leyes Psicométricas Clave

1. **Ley de Fitts**:
   - El tiempo para alcanzar un objetivo depende de su distancia y tamaño. Los botones principales deben tener un touch target mínimo de 44x44px y estar ubicados en zonas de fácil alcance (footers fijos de drawers/sheets).
2. **Ley de Hick**:
   - El tiempo de decisión aumenta logarítmicamente con el número de opciones. Agrupar acciones secundarias en menús o modales progresivos en vez de saturar la barra de herramientas.
3. **Ley de Miller**:
   - La memoria operativa humana retiene 7 ± 2 elementos. Dividir información extensa en chunks claros (Seguimiento, Productos, Datos de Entrega, Pago).
4. **Ley de Jakob**:
   - Los usuarios esperan que las interfaces funcionen igual que las que ya usan habitualmente. Respetar patrones universales de navegación y paneles.

---

## 6. Modelo Mental y Leyes de Navegación del Historial (Browser History & Navigation)

1. **Modelo Mental de Pantalla Única (Single Page Mental Model)**:
   - Para el usuario, cambiar de pestaña, categoría o aplicar filtros dentro de una misma vista (ej. categorías de la carta de un restaurante, filtros de talle/color, tabs de configuración) **NO** representa una navegación a otra pantalla o destino jerárquico.
   - Es una modificación del estado de visualización o scroll intra-página.
2. **Higiene del Stack de Navegación (Prohibición de Envenenar el Historial)**:
   - Los cambios de filtro, pestaña, categoría o acordeón en una misma vista DEBEN sincronizarse mediante `window.history.replaceState` (o estado en memoria).
   - **PROHIBIDO usar `window.history.pushState` para cambios de tabs o filtros dentro de la misma pantalla**: empujar una entrada por cada clic en una categoría o filtro envenena el historial del navegador y secuestra el botón "Atrás", forzando al usuario a presionar "Volver" múltiples veces para deshacer selecciones triviales antes de poder abandonar la vista.
3. **Jerarquía Espacial del Botón "Volver" (Upward Navigation vs. Intra-page Undo)**:
   - El botón de retorno en la barra superior (Topbar) en vistas principales (como la home de una tienda o un dashboard) representa **subir un nivel jerárquico** (volver al Hub, directorio o vista padre de la que provino).
   - No es un "deshacer filtrado". Con `replaceState` en las pestañas y filtros, un único clic en "Volver" ejecuta `window.history.back()` o navegación al origen devolviendo al usuario directamente a la pantalla de origen en un solo paso limpio.

