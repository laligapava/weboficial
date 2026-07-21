# La Liga Pava — Web

Web oficial de La Liga Pava (fútbol 7 amateur, Baix Llobregat/Barcelona).

## Contenido del paquete

- `index.html` — página principal (HTML puro, sin build ni dependencias de node).
- `liga-web-v6.css` — estilos.
- `liga-web.js` — interacciones (menú, acordeón, contadores, marquee de escudos, carrusel de tarjetas, formularios, lightbox, bloqueo de descarga de imágenes).
- `image-slot.js` — componente `<image-slot>` para los placeholders de foto arrastrable.
- `assets/` — todas las imágenes usadas, comprimidas y redimensionadas para pesar poco (fotos a 1500px máx. lado largo / calidad ~72%, logos y escudos a 300–500px).
- `robots.txt`, `sitemap.xml` — SEO básico.
- `vercel.json`, `package.json` — configuración para desplegar directamente en Vercel (sin build; sirve los archivos estáticos tal cual).

## Cómo publicarlo en Vercel

1. Sube esta carpeta a un repositorio de GitHub.
2. En [vercel.com](https://vercel.com), pulsa **Add New → Project** e importa ese repositorio.
3. Framework Preset: **Other** (o "Static"). No hace falta tocar Build Command / Output Directory — `vercel.json` y `package.json` ya lo dejan listo para desplegar como sitio estático.
4. Deploy. Si usas un dominio propio, añádelo en Settings → Domains.

## Cómo publicarlo en GitHub Pages

1. Crea (o usa) un repositorio en GitHub.
2. Sube todo el contenido de esta carpeta a la raíz del repo (o a `/docs` si prefieres servir desde ahí).
3. En **Settings → Pages**, activa GitHub Pages apuntando a la rama y carpeta donde subiste los archivos.
4. Si usas un dominio propio (p. ej. `laligapava.com`), añade un archivo `CNAME` con el dominio y configura el DNS.

No requiere build ni instalación — es HTML/CSS/JS estático, funciona tal cual.

## Notas

- Los textos de `og:image`, `twitter:image` y el sitemap referencian `https://laligapava.com/` — cambia esa URL si el dominio final es otro.
- Las imágenes de esta carpeta están comprimidas respecto a los originales del proyecto para evitar límites de peso de GitHub; si more adelante subes fotos de mayor calidad, revisa que cada archivo se mantenga razonable (< 300–500 KB aprox.) para no ralentizar la carga.
- El bloqueo de "guardar imagen" (clic derecho / arrastre / pulsación larga) es una disuasión básica vía CSS/JS, no un cifrado real: cualquier usuario con herramientas de desarrollador puede acceder a las imágenes igualmente.
"# weboficial" 
