# Diapasón Armónico: app instalable (PWA)

Esta web contiene dos apps instalables por separado:

| App | Dirección | Carpeta |
|---|---|---|
| Diapasón Armónico | https://bajinista.github.io/diapason/ | raíz |
| Armonía Negativa | https://bajinista.github.io/diapason/negativa/ | `negativa/` |

Cada una tiene su propio `sw.js` y su propio número de versión. Para publicar una versión nueva de Armonía Negativa, sube `VERSION` en `negativa/sw.js`.

## Qué hay en la carpeta

| Archivo | Para qué sirve |
|---|---|
| `index.html` | La app completa |
| `manifest.webmanifest` | Nombre, icono y colores de la app instalada |
| `sw.js` | Service worker: hace que funcione sin conexión y avisa de versiones nuevas |
| `icons/` | Iconos para iPhone, Android y navegador |

## 1. Publicarla (gratis)

Una PWA tiene que estar en una web con **https**. No funciona abriendo el archivo con doble clic. Tienes dos opciones:

**Opción A: GitHub Pages** (la recomendada si vas a seguir mejorándola)
1. Crea una cuenta en github.com y un repositorio nuevo, por ejemplo `diapason`.
2. Pulsa **Add file → Upload files** y arrastra *el contenido* de esta carpeta: `index.html`, `manifest.webmanifest`, `sw.js` y la carpeta `icons`.
3. Ve a **Settings → Pages**, elige la rama `main` y la carpeta `/ (root)`, y guarda.
4. Al cabo de uno o dos minutos la tendrás en `https://TU-USUARIO.github.io/diapason/`.

**Opción B: Netlify** (la más rápida)
1. Entra en app.netlify.com/drop.
2. Arrastra la carpeta entera.
3. Crea una cuenta gratuita para que la web no caduque.

## 2. Instalarla en el iPhone

1. Abre la dirección en **Safari**. La app muestra un aviso con las instrucciones.
2. Pulsa **Compartir** (el cuadrado con la flecha) y después **Añadir a pantalla de inicio**.
3. Ábrela desde el icono. Se abre a pantalla completa y funciona sin conexión.

En **Android** o en un ordenador con Chrome o Edge aparece un botón **Instalar app** junto al título.

> Ábrela una vez con conexión después de instalarla, para que se guarden las tipografías.
> Si el iPhone está en modo silencio, iOS puede silenciar los sonidos de la app.

## 3. Publicar una versión nueva

1. Cambia lo que quieras en `index.html`.
2. En `sw.js`, sube el número de versión, por ejemplo `const VERSION = 'v1.0.1';`.
3. Sube los archivos de nuevo.

Quien tenga la app instalada verá el aviso **"Hay una versión nueva · Actualizar"**.

## Probarla en tu ordenador

```
cd diapason-pwa
python3 -m http.server 8000
```
Después abre http://localhost:8000.
