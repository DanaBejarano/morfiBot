# morfiBot 🎀 — Ruleta flotante

App de escritorio chiquita y rosa para sortear nombres u objetos. La ventana flota sobre las demás, sin marco, y se arrastra desde la barra de arriba.

## Cómo correrla

```bash
npm install
npm start
```

## Qué hace

- **Agregar** elementos con el campo de texto (Enter o `+`).
- **Editar** cualquier elemento haciendo clic sobre su nombre en la lista (si lo dejás vacío, se borra).
- **Borrar** con la `×`, o **Vaciar** toda la lista.
- **Pegar lista**: agrega varios de una vez (uno por línea o separados por coma).
- **Mezclar** el orden.
- **Quitar ganador**: si está tildado, el que sale se saca de la ruleta.
- **Girar** con el botón del centro o haciendo clic en la ruleta.
- 📌 fija/desfija la ventana "siempre visible".

La lista se guarda sola y sigue ahí la próxima vez que abrís la app.

## Diseño

Los colores están como variables CSS al principio de `src/styles.css` (`--rosa-*`) y los de los gajos en `COLORES` en `src/renderer.js`, para reemplazarlos fácil con el diseño de Figma.

## Estructura

- `main.js` — ventana de Electron (flotante, transparente, sin marco).
- `preload.js` — puente seguro para los botones de minimizar/cerrar/fijar.
- `src/` — interfaz (HTML, CSS y lógica de la ruleta).
