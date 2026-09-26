/**
 * pdf-service.js
 * Servicios de manipulación y procesamiento de PDFs en el navegador
 * Utiliza PDF-Lib para combinación y corte, y PDF.js para renderizado de miniaturas.
 */

const PDFService = (() => {
  /**
   * Parsea cadenas de rangos de páginas como '1-3, 5, 8-10'
   * Devuelve un arreglo ordenado de índices de página (0-indexed).
   * Equivalente exacto a la función parse_page_ranges de Python.
   */
  function parsePageRanges(rangeStr, maxPages) {
    const pages = new Set();
    if (!rangeStr || typeof rangeStr !== 'string') return [];

    const parts = rangeStr.split(',');
    for (let part of parts) {
      part = part.trim();
      if (!part) continue;

      if (part.includes('-')) {
        const subparts = part.split('-');
        if (subparts.length === 2) {
          let start = parseInt(subparts[0].trim(), 10);
          let end = parseInt(subparts[1].trim(), 10);

          if (!isNaN(start) && !isNaN(end)) {
            if (start > end) {
              const temp = start;
              start = end;
              end = temp;
            }
            for (let p = start; p <= end; p++) {
              if (p >= 1 && p <= maxPages) {
                pages.add(p - 1);
              }
            }
          }
        }
      } else {
        const p = parseInt(part, 10);
        if (!isNaN(p) && p >= 1 && p <= maxPages) {
          pages.add(p - 1);
        }
      }
    }

    return Array.from(pages).sort((a, b) => a - b);
  }

  /**
   * Obtiene información rápida del archivo PDF (número de páginas y metadatos)
   */
  async function inspectPDF(file) {
    if (!window.PDFLib && !window.pdfjsLib) {
      throw new Error("Librerías PDF no cargadas en el navegador.");
    }

    const arrayBuffer = await file.arrayBuffer();
    let pageCount = 0;

    // 1. Intentar cargar con PDF-Lib (rápido y con permisos normales)
    if (window.PDFLib) {
      try {
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        pageCount = pdfDoc.getPageCount();
      } catch (err1) {
        try {
          // Intentar con password vacío (común en PDFs protegidos contra copia o con permisos de propietario)
          const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer, { password: '' });
          pageCount = pdfDoc.getPageCount();
        } catch (err2) {
          console.warn("PDF-Lib no pudo leer directamente el PDF, intentando con PDF.js...", err2);
        }
      }
    }

    // 2. Si PDF-Lib falló o no dio conteo, usar el motor ultra-tolerante de Mozilla PDF.js
    if (pageCount === 0 && window.pdfjsLib) {
      try {
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer.slice(0) });
        const pdfJsDoc = await loadingTask.promise;
        pageCount = pdfJsDoc.numPages;
      } catch (pdfJsErr) {
        console.error("PDF.js también falló:", pdfJsErr);
        throw new Error(pdfJsErr.message || "El archivo PDF no se pudo leer");
      }
    }

    if (pageCount === 0) {
      throw new Error("El documento no contiene páginas legibles o está protegido con contraseña.");
    }

    return {
      name: file.name,
      size: file.size,
      pageCount: pageCount,
      arrayBuffer: arrayBuffer
    };
  }

  /**
   * Carga un PDFDocument de PDF-Lib con tolerancia a encriptación estándar
   */
  async function loadPDFDocSafe(arrayBuffer) {
    const { PDFDocument } = PDFLib;
    try {
      return await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    } catch (e1) {
      try {
        return await PDFDocument.load(arrayBuffer, { password: '' });
      } catch (e2) {
        throw new Error(`Este documento PDF tiene contraseña o encriptación no compatible: ${e2.message || e1.message}`);
      }
    }
  }

  /**
   * Combina múltiples archivos PDF en uno solo respetando el orden
   */
  async function mergePDFs(files, outputFileName = "PDF_combinado.pdf", onProgress = null) {
    if (!window.PDFLib) {
      throw new Error("Librería PDF-Lib no encontrada.");
    }
    if (!files || files.length === 0) {
      throw new Error("No hay archivos para combinar.");
    }

    const { PDFDocument, PDFName } = PDFLib;
    const mergedPdf = await PDFDocument.create();

    // Configurar vista en columna continua (/OneColumn), igual que en la versión PyQt6
    try {
      mergedPdf.catalog.set(PDFName.of('PageLayout'), PDFName.of('OneColumn'));
    } catch (e) {
      console.warn("No se pudo configurar /OneColumn en catalog:", e);
    }

    const totalFiles = files.length;
    for (let i = 0; i < totalFiles; i++) {
      const fileItem = files[i];
      if (onProgress) {
        onProgress((i / totalFiles) * 80, `Copiando páginas de "${fileItem.file.name}"...`);
      }

      // Si ya guardamos el arrayBuffer en memoria, lo reutilizamos
      const arrayBuffer = fileItem.arrayBuffer || await fileItem.file.arrayBuffer();
      const srcPdf = await loadPDFDocSafe(arrayBuffer);
      const pageIndices = srcPdf.getPageIndices();
      
      const copiedPages = await mergedPdf.copyPages(srcPdf, pageIndices);
      for (const page of copiedPages) {
        mergedPdf.addPage(page);
      }
    }

    if (onProgress) {
      onProgress(90, "Generando archivo final...");
    }

    const pdfBytes = await mergedPdf.save();
    
    if (onProgress) {
      onProgress(100, "¡Completado!");
    }

    // Asegurar extensión .pdf
    let finalName = outputFileName.trim();
    if (!finalName.toLowerCase().endsWith('.pdf')) {
      finalName += '.pdf';
    }

    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), finalName);
    return true;
  }

  /**
   * Corta / Extrae las páginas seleccionadas (índices 0-based) de un PDF
   */
  async function splitPDF(fileData, selectedIndices, outputFileName = "documento_cortado.pdf", onProgress = null) {
    if (!window.PDFLib) {
      throw new Error("Librería PDF-Lib no encontrada.");
    }
    if (!selectedIndices || selectedIndices.length === 0) {
      throw new Error("Debes seleccionar al menos una página para guardar.");
    }

    const { PDFDocument, PDFName } = PDFLib;
    const newPdf = await PDFDocument.create();

    // Configurar visualización /OneColumn
    try {
      newPdf.catalog.set(PDFName.of('PageLayout'), PDFName.of('OneColumn'));
    } catch (e) {
      console.warn("No se pudo configurar /OneColumn:", e);
    }

    if (onProgress) {
      onProgress(25, "Cargando archivo PDF original...");
    }

    const arrayBuffer = fileData.arrayBuffer || await fileData.file.arrayBuffer();
    const srcPdf = await loadPDFDocSafe(arrayBuffer);

    if (onProgress) {
      onProgress(60, `Extrayendo ${selectedIndices.length} páginas...`);
    }

    const copiedPages = await newPdf.copyPages(srcPdf, selectedIndices);
    for (const page of copiedPages) {
      newPdf.addPage(page);
    }

    if (onProgress) {
      onProgress(90, "Guardando nuevo documento...");
    }

    const pdfBytes = await newPdf.save();

    if (onProgress) {
      onProgress(100, "¡Descarga iniciada!");
    }

    let finalName = outputFileName.trim();
    if (!finalName.toLowerCase().endsWith('.pdf')) {
      finalName += '.pdf';
    }

    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), finalName);
    return true;
  }

  /**
   * Renderiza una miniatura de página en un elemento canvas con PDF.js
   */
  async function renderPageThumbnail(pdfJsDoc, pageNumber1Based, canvasElement) {
    if (!pdfJsDoc || !canvasElement) return;

    try {
      const page = await pdfJsDoc.getPage(pageNumber1Based);
      const viewport = page.getViewport({ scale: 1.0 });

      // Escalar canvas a ancho de miniatura (~180px para buena resolución)
      const desiredWidth = 180;
      const scale = desiredWidth / viewport.width;
      const scaledViewport = page.getViewport({ scale: scale });

      const context = canvasElement.getContext('2d');
      canvasElement.height = scaledViewport.height;
      canvasElement.width = scaledViewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport
      };

      await page.render(renderContext).promise;
    } catch (err) {
      console.error(`Error al renderizar miniatura página ${pageNumber1Based}:`, err);
    }
  }

  /**
   * Dispara la descarga de un Blob en el navegador sin recargar ni tocar servidor
   */
  function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1500);
  }

  /**
   * Genera un nuevo documento PDF combinando una lista de imágenes
   * @param {Array} imageItems Arreglo de objetos con { getDataUrl: async () => dataUrl }
   * @param {Object} options { pageSize: 'a4'|'letter'|'auto', orientation: 'auto'|'portrait'|'landscape', margin: 'none'|'small'|'normal' }
   * @param {Function} onProgress Callback (current, total, percent)
   */
  async function imagesToPDF(imageItems, options = {}, onProgress = null) {
    if (!window.PDFLib) {
      throw new Error("Librería PDF-Lib no disponible.");
    }
    if (!imageItems || imageItems.length === 0) {
      throw new Error("No hay imágenes seleccionadas para generar el PDF.");
    }

    const pdfDoc = await PDFLib.PDFDocument.create();
    const total = imageItems.length;

    // Dimensiones en puntos (72 dpi)
    const PAGE_SIZES = {
      a4: { width: 595.28, height: 841.89 },
      letter: { width: 612.0, height: 792.0 }
    };

    const MARGINS = {
      none: 0,
      small: 28.35, // ~10 mm
      normal: 56.70 // ~20 mm
    };

    const marginPt = MARGINS[options.margin] !== undefined ? MARGINS[options.margin] : 0;

    for (let i = 0; i < total; i++) {
      const item = imageItems[i];
      if (onProgress) {
        onProgress(i + 1, total, Math.round(((i + 1) / total) * 90));
      }

      // Obtener el Data URL de la imagen procesada (con recorte, rotación y filtro aplicados)
      const dataUrl = await item.getDataUrl();
      const res = await fetch(dataUrl);
      const imgBytes = await res.arrayBuffer();

      let embeddedImg;
      if (dataUrl.startsWith("data:image/png")) {
        embeddedImg = await pdfDoc.embedPng(imgBytes);
      } else {
        embeddedImg = await pdfDoc.embedJpg(imgBytes);
      }

      const imgWidth = embeddedImg.width;
      const imgHeight = embeddedImg.height;

      let targetPageWidth, targetPageHeight;

      if (options.pageSize === 'auto') {
        targetPageWidth = imgWidth + marginPt * 2;
        targetPageHeight = imgHeight + marginPt * 2;
      } else {
        const stdSize = PAGE_SIZES[options.pageSize] || PAGE_SIZES.a4;
        let isLandscape = false;
        if (options.orientation === 'landscape') {
          isLandscape = true;
        } else if (options.orientation === 'portrait') {
          isLandscape = false;
        } else {
          // 'auto': según dimensiones naturales de la imagen
          isLandscape = imgWidth > imgHeight;
        }

        targetPageWidth = isLandscape ? Math.max(stdSize.width, stdSize.height) : Math.min(stdSize.width, stdSize.height);
        targetPageHeight = isLandscape ? Math.min(stdSize.width, stdSize.height) : Math.max(stdSize.width, stdSize.height);
      }

      const page = pdfDoc.addPage([targetPageWidth, targetPageHeight]);

      const availWidth = Math.max(1, targetPageWidth - marginPt * 2);
      const availHeight = Math.max(1, targetPageHeight - marginPt * 2);

      // Escalar la imagen manteniendo su proporción
      const scale = Math.min(availWidth / imgWidth, availHeight / imgHeight);
      const drawWidth = imgWidth * scale;
      const drawHeight = imgHeight * scale;

      // Centrar dentro de los márgenes
      const x = marginPt + (availWidth - drawWidth) / 2;
      const y = marginPt + (availHeight - drawHeight) / 2;

      page.drawImage(embeddedImg, {
        x: x,
        y: y,
        width: drawWidth,
        height: drawHeight
      });

      // Breve pausa asíncrona para que Safari / dispositivos móviles liberen memoria intermedia
      await new Promise(resolve => setTimeout(resolve, 20));
    }

    if (onProgress) {
      onProgress(total, total, 96);
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }

  /**
   * Formatea bytes a KB o MB legibles
   */
  function formatBytes(bytes, decimals = 1) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  return {
    parsePageRanges,
    inspectPDF,
    mergePDFs,
    splitPDF,
    imagesToPDF,
    renderPageThumbnail,
    downloadBlob,
    formatBytes
  };
})();

// Exportar globalmente
window.PDFService = PDFService;
