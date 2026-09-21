# PDF Tools Studio 📄✨

Aplicación web moderna, rápida y 100% privada para **Combinar** y **Cortar / Dividir** documentos PDF directamente en tu navegador (Google Chrome, Firefox, Safari, Edge y teléfonos móviles), sin necesidad de instalar programas ni subir archivos a servidores externos.

Diseñada con una interfaz **Dark Mode** elegante, efectos *glassmorphism*, diseño responsivo para PC y móvil, y **zonas reservadas para publicidad** (Google AdSense u otras redes).

---

## 🚀 Características Principales

1. **100% Client-Side & Privado**:
   - Todo el procesamiento ocurre en la memoria de tu navegador usando `pdf-lib` y `pdf.js`.
   - Ningún documento sale de tu dispositivo ni se almacena en servidores ajenos.
2. **Combinar PDFs**:
   - Arrastra y suelta múltiples archivos PDF.
   - Ordena los archivos mediante botones (Subir / Bajar).
   - Elimina o añade más archivos en cualquier momento.
   - Genera y descarga el archivo combinado con un solo clic.
3. **Cortar / Dividir PDF**:
   - Carga cualquier documento PDF y visualiza al instante el total de páginas.
   - **Rango Rápido**: Selector numérico *Desde* y *Hasta*.
   - **Rango de Texto Personalizado**: Soporta rangos como `1-4, 7, 10-12`.
   - **Cuadrícula Visual Interactiva**: Miniaturas de cada página generadas en segundo plano con casillas de verificación. Haz clic en cualquier página para seleccionarla o deseleccionarla.
   - Botones rápidos: *Seleccionar todas*, *Deseleccionar todas* e *Invertir selección*.
4. **Espacios Reservados para Publicidad (Monetización)**:
   - **Franja Lateral Sticky en PC**: Lista para bloques de 300x250 o 300x600 (Skyscraper).
   - **Banner Superior**: Preparado para anuncios 728x90 o banner adaptativo.
   - **Banner Móvil Inferior**: Franja sticky 320x50 para dispositivos móviles.
5. **Totalmente Responsivo**:
   - Diseñado para funcionar a la perfección tanto en pantallas de escritorio grandes como en smartphones y tablets.

---

## 📂 Estructura de Archivos

```
Combinar PDF/
├── index.html           # Estructura principal, tabs y zonas de anuncios
├── css/
│   └── style.css        # Sistema de diseño Dark Mode, variables y estilos responsivos
├── js/
│   ├── pdf-service.js   # Motor de manipulación PDF (pdf-lib y pdf.js)
│   └── app.js           # Lógica de interfaz, eventos y notificaciones
├── README.md            # Guía del proyecto y despliegue
└── combinar_pdfs_pyqt6.py # Versión original de escritorio (conservada como respaldo)
```

---

## 🌐 Cómo Publicar Gratis en GitHub Pages (Paso a Paso)

Dado que este proyecto es 100% estático (HTML, CSS y JS sin backend), alojarlo en **GitHub Pages** es completamente gratuito y toma menos de 2 minutos:

### Paso 1: Inicializar Git y subir a GitHub

Abre una terminal en esta carpeta y ejecuta:

```bash
git init
git add .
git commit -m "Migración a Web App para GitHub Pages"
git branch -M main
```

Crea un nuevo repositorio en tu cuenta de GitHub (por ejemplo `combinar-pdf-web`) y enlaza el remoto:

```bash
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

### Paso 2: Activar GitHub Pages

1. Ve a tu repositorio en GitHub desde el navegador.
2. Entra en la pestaña **Settings** (Configuración) en la parte superior.
3. En el menú de la izquierda, haz clic en **Pages**.
4. En la sección **Build and deployment**:
   - **Source**: Elige `Deploy from a branch`.
   - **Branch**: Selecciona `main` y en la carpeta elige `/ (root)`.
   - Haz clic en **Save** (Guardar).
5. Espera unos 30-60 segundos. GitHub te mostrará el enlace público de tu aplicación:
   `https://TU_USUARIO.github.io/TU_REPOSITORIO/`

¡Listo! Ya cualquier persona desde una computadora o un teléfono móvil podrá usar tu herramienta.

---

## 💰 Cómo Configurar tu Publicidad (Google AdSense)

En el archivo `index.html` encontrarás comentarios claramente delimitados donde puedes pegar el código de tu cuenta de Google AdSense o tu red publicitaria preferida:

### 1. Incluir el script de Google AdSense en `<head>`:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-TU_ID_DE_PUBLICADOR" crossorigin="anonymous"></script>
```

### 2. Pegar tu bloque en la barra lateral (`index.html`):
Busca la sección `<!-- ESPACIO RESERVADO PARA PUBLICIDAD LATERAL 1 -->` y reemplaza el bloque placeholder con:
```html
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-TU_ID_DE_PUBLICADOR"
     data-ad-slot="TU_NUMERO_DE_SLOT"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

---

## 💻 Ejecución Local Rápida

Para probar la aplicación en tu computadora con un solo clic:
- **Doble clic en [start.bat](file:///d:/Mis%20Documentos/Proyectos/Combinar%20PDF/start.bat)**: Iniciará el servidor local y abrirá la aplicación automáticamente en tu navegador (Google Chrome, Edge, etc.).
- O bien, puedes abrir directamente el archivo `index.html` en tu navegador.
