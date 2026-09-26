/**
 * PDF Tools Ambystoma Studio - Internationalization (i18n)
 * Language Support: English (Default) & Spanish
 */

const I18N_DICTIONARY = {
  en: {
    // Page metadata
    pageTitle: "PDF Tools Ambystoma Studio · Merge and Cut PDF Online Free · 100% Free",
    pageDesc: "Merge multiple PDF files, cut and extract pages or create PDF from images free online. 100% free tool, no limits, no registration and completely private by Ambystoma Technologies.",
    
    // Header
    brandTitle: "PDF Tools <span>Ambystoma Studio</span>",
    brandDesc: "Merge, Cut and Create PDF with Images",
    btnAbout: "About",
    btnAboutTitle: "About and Terms of Use",
    securityBadgeText: "100% Private",
    securityBadgeTitle: "Your documents never leave your computer",

    // Tabs
    tabMerge: "Merge PDFs",
    tabCut: "Cut / Split PDF",
    tabImg2Pdf: "Create PDF with Images",

    // Tab 1: Merge
    mergeDropTitle: "Drag your PDF files here",
    mergeDropBrowse: "or <button type=\"button\" class=\"btn-link\" id=\"btn-browse-merge\">browse on your device</button>",
    mergeDropTip: "You can add multiple files and arrange them in any order",
    mergeSelectedTitle: "Selected files (<span id=\"merge-file-count\">0</span>)",
    mergeSelectedSubtitle: "They will be merged in the order shown below",
    btnAddMoreMerge: "Add more",
    btnClearMerge: "Clear list",
    mergeOutputLabel: "PDF file name:",
    mergeOutputPlaceholder: "file_name",
    btnDoMerge: "Download Merged PDF",

    // Tab 2: Cut / Split
    cutDropTitle: "Select a PDF file to cut",
    cutDropBrowse: "or <button type=\"button\" class=\"btn-link\" id=\"btn-browse-cut\">browse on your device</button>",
    cutDropTip: "You will be able to select pages visually, by quick range, or by typing specific page numbers",
    btnChangeCutPdf: "Change file",
    cutOptionsTitle: "Page Selection Options",
    rangeQuickLabel: "Quick Range:",
    rangeFromLabel: "From:",
    rangeToLabel: "To:",
    btnApplySpinRange: "Select Range",
    customRangeLabel: "Custom page expression:",
    customRangePlaceholder: "Example: 1-4, 7, 10-12",
    btnApplyCustomRange: "Apply Text",
    counterSelectedLabel: "Selected pages:",
    counterOf: "of",
    btnSelectAll: "Select all",
    btnDeselectAll: "Deselect all",
    btnInvert: "Invert",
    pagesGridLegend: "Click on any page to select or deselect it",
    cutOutputLabel: "PDF file name:",
    cutOutputPlaceholder: "file_name",
    btnDoCut: "Download Cut PDF",

    // Tab 3: Images to PDF
    img2pdfDropTitle: "Drag your photos or images here",
    img2pdfDropDesc: "Supported formats: JPG, PNG, WebP, BMP (You can select multiple images at once)",
    btnBrowseImg2Pdf: "Select Images",
    magicContrastTitle: "🪄 Magic Contrast",
    magicContrastDesc: "Paper contrast (whitens background)",
    magicContrastTooltip: "Enable or disable scanned document enhancement (whitens paper and darkens text)",
    pageSizeLabel: "Size:",
    orientationLabel: "Orientation:",
    marginsLabel: "Margins:",
    optSizeA4: "A4 (210 × 297 mm)",
    optSizeLetter: "Letter",
    optSizeAuto: "Fit to Image",
    optOriAuto: "Automatic",
    optOriPortrait: "Portrait",
    optOriLandscape: "Landscape",
    optMarginNone: "No margin (0)",
    optMarginSmall: "Small (10 mm)",
    optMarginNormal: "Normal (20 mm)",
    btnAddMoreImg2Pdf: "Add Photos",
    btnClearImg2Pdf: "Clear All",
    imagesCountSuffix: "prepared for PDF",
    summaryTipImg2Pdf: "💡 You can crop or rotate each image individually before generating the PDF.",
    img2pdfOutputLabel: "PDF file name:",
    img2pdfOutputPlaceholder: "document_name",
    btnDoImg2Pdf: "Download PDF with Images",

    // Sidebar
    adLabel: "ADVERTISEMENT",
    featureCardTitle: "Security & Speed",
    feature1: "100% in-browser processing",
    feature2: "Your documents are never uploaded to any server",
    feature3: "No daily limits or mandatory registration",

    // Footer
    footerCopy: "© 2026 PDF Tools Ambystoma Studio • Open-source tool hosted on GitHub Pages",
    footerLink1: "Total Privacy",
    footerLink2: "Serverless",
    footerLink3: "Fast & Secure",

    // Progress Modal
    progressDefaultTitle: "Processing file...",
    progressDefaultDesc: "Please wait a moment while we prepare your document.",

    // About Modal
    aboutTitle: "About PDF Tools Ambystoma Studio",
    aboutDevBadge: "Development & Contact",
    aboutDevDesc: "Secure, accessible, and high-performance digital tools.",
    aboutFreeTitle: "✨ 100% Free Tool and Service",
    aboutFreeDesc: "<strong>PDF Tools Ambystoma Studio</strong> is a <strong>100% free and open-access</strong> utility. It requires no registration, contains no paid subscriptions, and has no hidden fees. You can <strong>merge unlimited PDF documents</strong>, <strong>cut and split pages</strong>, or <strong>create PDF files from images</strong> as often as you need with zero usage limits and complete confidentiality.",
    aboutPrivacyTitle: "100% On-Device Processing",
    aboutPrivacyDesc: "This application processes your PDF files <strong>exclusively inside your web browser's memory</strong>. No external server, backend, or cloud storage is used. Your confidential documents never leave your computer and are inaccessible to third parties.",
    aboutLegalTitle: "Terms of Use and Disclaimer",
    aboutLegalDesc: "PDF Tools Studio is distributed solely as a <strong>neutral software utility</strong> for digital file organization and manipulation.",
    aboutLegalItem1: "<strong>Intellectual Property:</strong> The user is solely and exclusively responsible for the origin, content, licensing, and copyright of any document cut, merged, extracted, or downloaded through this tool.",
    aboutLegalItem2: "<strong>Full Disclaimer of Liability:</strong> <em>Ambystoma Technologies</em> is completely and expressly indemnified and released from any liability, damage, litigation, direct or indirect harm, or sanction arising from improper use by users or third parties, particularly regarding copyright infringement, plagiarism, or unauthorized disclosure of confidential material.",
    aboutLegalItem3: "<strong>\"As-Is\" Service:</strong> The service is provided without warranties of any kind, express or implied, regarding fitness for particular purposes or uninterrupted availability.",
    btnAcceptAbout: "Understood & Accept",

    // Crop Modal
    cropModalHeading: "Crop Page Image",
    cropInstructions: "Drag the box or its corners over the document to define the desired crop area.",
    btnPresetFree: "Free",
    btnPresetA4: "A4 Ratio",
    btnCropReset: "Full Image",
    btnCropCancel: "Cancel",
    btnCropApply: "Apply Crop",

    // Dynamic Toasts & Alerts
    toast_select_only_pdf: "Please select only .PDF files",
    toast_read_error: 'Could not read "{name}": {msg}',
    toast_files_added: "{count} file(s) added successfully",
    toast_list_cleared: "List cleared",
    toast_add_at_least_one_pdf: "Add at least one PDF file to merge.",
    toast_merge_success: "Merged PDF downloaded successfully!",
    toast_merge_error: "Error merging files: {msg}",
    toast_pdf_no_pages: "The selected PDF contains no pages.",
    toast_file_loaded: 'File "{name}" loaded ({count} pages)',
    toast_file_read_error: "Could not read the PDF file: {msg}",
    toast_range_applied: "Range applied: pages {start} to {end}",
    toast_range_format_error: "Enter a range like '1-3, 5, 8-10'",
    toast_range_invalid: "No valid pages recognized in range (1 to {total})",
    toast_range_selected: "{count} pages selected from text",
    toast_no_file_loaded: "No file loaded.",
    toast_select_at_least_one_page: "You must select at least one page to save.",
    toast_cut_success: "PDF saved with {count} pages successfully!",
    toast_cut_error: "Could not generate the new PDF: {msg}",
    toast_magic_enabled: "🪄 Magic Contrast enabled: Whitens paper backgrounds and sharpens text.",
    toast_magic_disabled: "Magic Contrast disabled: Showing photos in original natural color.",
    toast_images_cleared: "All images have been cleared.",
    toast_invalid_images: "Please select valid image files (JPG, PNG, WebP, BMP, HEIC).",
    toast_images_loaded: "{count} image(s) loaded successfully.",
    toast_images_optimized: "{count} image(s) optimized and ready.",
    toast_images_process_error: "An error occurred while processing some images.",
    toast_page_rotated: "Page {num} rotated 90°.",
    toast_image_removed: "Image removed from list.",
    toast_crop_saved: "Crop saved successfully.",
    toast_add_at_least_one_image: "You must add at least one image to generate the PDF.",
    toast_img2pdf_success: '✓ "{name}" generated and downloaded successfully.',
    toast_img2pdf_error: "Error compiling PDF from images.",
    confirm_clear_images: "Are you sure you want to clear all images?",
    progress_merging_title: "Merging PDF files...",
    progress_merging_desc: "Combining {count} documents into a single PDF...",
    progress_cutting_title: "Cutting and extracting pages...",
    progress_cutting_desc: "Extracting {count} pages from the document...",
    progress_optimizing_title: "Optimizing images for high performance...",
    progress_optimizing_desc: "Compressing and preparing image {current} of {total}...",
    progress_pdf_page: "Embedding page {current} of {total} into PDF...",
    progress_img2pdf_title: "Generating PDF document...",
    progress_img2pdf_desc_magic: "Applying magic contrast enhancement and embedding high-definition images...",
    progress_img2pdf_desc_normal: "Compiling your images into a high-quality PDF document...",
    badge_pages_count: "{count} pages",
    card_page_label: "Page {num}",
    btn_rotate_title: "Rotate 90°",
    btn_crop_title: "Crop Image",
    btn_delete_title: "Remove from list"
  },

  es: {
    // Page metadata
    pageTitle: "PDF Tools Ambystoma Studio · Combinar y Cortar PDF Online Gratis · 100% Gratuito",
    pageDesc: "Une varios archivos PDF, corta y extrae páginas o crea PDF con imágenes gratis online. Herramienta 100% gratuita, sin límites, sin registro y totalmente privada desarrollada por Ambystoma Technologies.",

    // Header
    brandTitle: "PDF Tools <span>Ambystoma Studio</span>",
    brandDesc: "Combinar, Cortar y Crear PDF con Imágenes",
    btnAbout: "About",
    btnAboutTitle: "Acerca de y Términos de Uso",
    securityBadgeText: "100% Privado",
    securityBadgeTitle: "Tus documentos no salen de tu equipo",

    // Tabs
    tabMerge: "Combinar PDFs",
    tabCut: "Cortar / Dividir PDF",
    tabImg2Pdf: "Generar PDF con Imágenes",

    // Tab 1: Merge
    mergeDropTitle: "Arrastra tus archivos PDF aquí",
    mergeDropBrowse: "o <button type=\"button\" class=\"btn-link\" id=\"btn-browse-merge\">selecciónalos desde tu dispositivo</button>",
    mergeDropTip: "Puedes añadir varios archivos y organizarlos en el orden que prefieras",
    mergeSelectedTitle: "Archivos seleccionados (<span id=\"merge-file-count\">0</span>)",
    mergeSelectedSubtitle: "Se unirán en el orden mostrado a continuación",
    btnAddMoreMerge: "Añadir más",
    btnClearMerge: "Limpiar lista",
    mergeOutputLabel: "Nombre del archivo PDF:",
    mergeOutputPlaceholder: "Nombre de archivo",
    btnDoMerge: "Descargar PDF Combinado",

    // Tab 2: Cut / Split
    cutDropTitle: "Selecciona un archivo PDF para cortar",
    cutDropBrowse: "o <button type=\"button\" class=\"btn-link\" id=\"btn-browse-cut\">explorar en tu dispositivo</button>",
    cutDropTip: "Podrás seleccionar las páginas visualmente, por rango rápido o escribiendo páginas específicas",
    btnChangeCutPdf: "Cambiar archivo",
    cutOptionsTitle: "Opciones de Selección de Páginas",
    rangeQuickLabel: "Rango Rápido:",
    rangeFromLabel: "Desde:",
    rangeToLabel: "Hasta:",
    btnApplySpinRange: "Seleccionar Rango",
    customRangeLabel: "Texto de páginas personalizadas:",
    customRangePlaceholder: "Ejemplo: 1-4, 7, 10-12",
    btnApplyCustomRange: "Aplicar Texto",
    counterSelectedLabel: "Páginas seleccionadas:",
    counterOf: "de",
    btnSelectAll: "Seleccionar todas",
    btnDeselectAll: "Deseleccionar todas",
    btnInvert: "Invertir",
    pagesGridLegend: "Haz clic en cualquier página para marcarla o desmarcarla",
    cutOutputLabel: "Nombre del archivo PDF:",
    cutOutputPlaceholder: "Nombre de archivo",
    btnDoCut: "Descargar PDF Cortado",

    // Tab 3: Images to PDF
    img2pdfDropTitle: "Arrastra tus fotos o imágenes aquí",
    img2pdfDropDesc: "Formatos soportados: JPG, PNG, WebP, BMP (Puedes seleccionar múltiples imágenes a la vez)",
    btnBrowseImg2Pdf: "Seleccionar Imágenes",
    magicContrastTitle: "🪄 Contraste Mágico",
    magicContrastDesc: "Contraste de papel (blanquea fondo)",
    magicContrastTooltip: "Activa o desactiva el realce de documento escaneado (blanquea fondos y oscurece texto)",
    pageSizeLabel: "Tamaño:",
    orientationLabel: "Orientación:",
    marginsLabel: "Márgenes:",
    optSizeA4: "A4 (210 × 297 mm)",
    optSizeLetter: "Carta / Letter",
    optSizeAuto: "Ajustar a Imagen",
    optOriAuto: "Automática",
    optOriPortrait: "Vertical",
    optOriLandscape: "Horizontal",
    optMarginNone: "Sin margen (0)",
    optMarginSmall: "Pequeño (10 mm)",
    optMarginNormal: "Normal (20 mm)",
    btnAddMoreImg2Pdf: "Añadir Fotos",
    btnClearImg2Pdf: "Vaciar Todo",
    imagesCountSuffix: "preparadas para el PDF",
    summaryTipImg2Pdf: "💡 Puedes cortar o rotar cada imagen individualmente antes de generar el PDF.",
    img2pdfOutputLabel: "Nombre del archivo PDF:",
    img2pdfOutputPlaceholder: "nombre_del_documento",
    btnDoImg2Pdf: "Descargar PDF con Imágenes",

    // Sidebar
    adLabel: "PUBLICIDAD",
    featureCardTitle: "Seguridad & Velocidad",
    feature1: "Procesamiento 100% en tu navegador",
    feature2: "Tus documentos no se suben a ningún servidor",
    feature3: "Sin límites diarios ni registro obligatorio",

    // Footer
    footerCopy: "© 2026 PDF Tools Ambystoma Studio • Herramienta de código abierto alojada en GitHub Pages",
    footerLink1: "Privacidad Total",
    footerLink2: "Sin Servidor",
    footerLink3: "Rápido & Seguro",

    // Progress Modal
    progressDefaultTitle: "Procesando archivo...",
    progressDefaultDesc: "Por favor espera un momento mientras preparamos tu documento.",

    // About Modal
    aboutTitle: "Acerca de PDF Tools Ambystoma Studio",
    aboutDevBadge: "Desarrollo & Contacto",
    aboutDevDesc: "Herramientas digitales seguras, accesibles y de alto rendimiento.",
    aboutFreeTitle: "✨ Herramienta y Servicio 100% Totalmente Gratuito",
    aboutFreeDesc: "<strong>PDF Tools Ambystoma Studio</strong> es una herramienta <strong>100% gratuita y de libre acceso</strong>. No requiere ningún tipo de registro, no contiene suscripciones de pago ni tarifas ocultas. Puedes <strong>combinar documentos PDF ilimitados</strong>, <strong>cortar y dividir páginas</strong> o <strong>crear archivos PDF a partir de imágenes</strong> todas las veces que lo necesites sin límites de uso y con total confidencialidad.",
    aboutPrivacyTitle: "Procesamiento 100% en tu Dispositivo",
    aboutPrivacyDesc: "Esta aplicación procesa tus archivos PDF <strong>exclusivamente dentro de la memoria de tu propio navegador web</strong>. No se utiliza ningún servidor externo, backend ni almacenamiento en la nube. Tus documentos confidenciales nunca salen de tu ordenador ni son accesibles por terceros.",
    aboutLegalTitle: "Términos de Uso y Exención de Responsabilidad",
    aboutLegalDesc: "PDF Tools Studio se distribuye únicamente como una <strong>herramienta técnica de software neutral</strong> para la organización y manipulación de archivos digitales.",
    aboutLegalItem1: "<strong>Propiedad Intelectual:</strong> El usuario es el único y exclusivo responsable del origen, contenido, licencias y derechos de autor de cualquier documento que corte, combine, extraiga o descargue a través de esta herramienta.",
    aboutLegalItem2: "<strong>Liberación Total de Responsabilidad:</strong> <em>Ambystoma Technologies</em> queda total y expresamente eximida de cualquier culpa, daño, litigio, perjuicio directo o indirecto o sanción derivada del uso indebido que usuarios o terceros realicen de esta herramienta, en particular en casos de infracción a leyes de propiedad intelectual, derechos de autor, plagio o divulgación de material confidencial no autorizado.",
    aboutLegalItem3: "<strong>Uso \"Tal Cual\" (As-Is):</strong> El servicio se provee sin garantías de ninguna índole, expresas o implícitas, respecto de su adecuación para fines particulares o continuidad ininterrumpida.",
    btnAcceptAbout: "Comprendido y Aceptar",

    // Crop Modal
    cropModalHeading: "Recortar Imagen de Página",
    cropInstructions: "Arrastra el recuadro o sus esquinas sobre el documento para definir el área de corte deseada.",
    btnPresetFree: "Libre",
    btnPresetA4: "Proporción A4",
    btnCropReset: "Imagen Completa",
    btnCropCancel: "Cancelar",
    btnCropApply: "Aplicar Recorte",

    // Dynamic Toasts & Alerts
    toast_select_only_pdf: "Por favor selecciona únicamente archivos con formato .PDF",
    toast_read_error: 'No se pudo leer "{name}": {msg}',
    toast_files_added: "Se han añadido {count} archivo(s) correctamente",
    toast_list_cleared: "Lista limpiada",
    toast_add_at_least_one_pdf: "Añade al menos un archivo PDF para combinar.",
    toast_merge_success: "¡Archivo combinado descargado con éxito!",
    toast_merge_error: "Error al combinar archivos: {msg}",
    toast_pdf_no_pages: "El archivo PDF seleccionado no contiene páginas.",
    toast_file_loaded: 'Archivo "{name}" cargado ({count} páginas)',
    toast_file_read_error: "No se pudo leer el archivo PDF: {msg}",
    toast_range_applied: "Rango aplicado: páginas {start} a {end}",
    toast_range_format_error: "Escribe un rango como '1-3, 5, 8-10'",
    toast_range_invalid: "No se reconocieron páginas válidas en el rango (1 a {total})",
    toast_range_selected: "Se seleccionaron {count} páginas del texto",
    toast_no_file_loaded: "No hay ningún archivo cargado.",
    toast_select_at_least_one_page: "Debes seleccionar al menos una página para guardar.",
    toast_cut_success: "¡PDF guardado con {count} páginas exitosamente!",
    toast_cut_error: "No se pudo generar el nuevo PDF: {msg}",
    toast_magic_enabled: "🪄 Contraste Mágico activado: Blanquea fondos de papel y resalta texto.",
    toast_magic_disabled: "Contraste Mágico desactivado: Mostrando fotos en color natural.",
    toast_images_cleared: "Se han vaciado todas las imágenes.",
    toast_invalid_images: "Por favor selecciona archivos de imagen válidos (JPG, PNG, WebP, BMP, HEIC).",
    toast_images_loaded: "{count} imagen(es) cargada(s) con éxito.",
    toast_images_optimized: "{count} imagen(es) optimizada(s) y lista(s).",
    toast_images_process_error: "Ocurrió un error al procesar algunas imágenes.",
    toast_page_rotated: "Página {num} rotada 90°.",
    toast_image_removed: "Imagen eliminada de la lista.",
    toast_crop_saved: "Recorte guardado con éxito.",
    toast_add_at_least_one_image: "Debes añadir al menos una imagen para generar el PDF.",
    toast_img2pdf_success: '✓ "{name}" generado y descargado exitosamente.',
    toast_img2pdf_error: "Error al compilar el PDF de imágenes.",
    confirm_clear_images: "¿Estás seguro de vaciar todas las imágenes?",
    progress_merging_title: "Combinando archivos PDF...",
    progress_merging_desc: "Uniendo {count} documentos en un solo PDF...",
    progress_cutting_title: "Cortando y extrayendo páginas...",
    progress_cutting_desc: "Extrayendo {count} páginas del documento...",
    progress_optimizing_title: "Optimizando imágenes para alto rendimiento...",
    progress_optimizing_desc: "Comprimiendo y preparando imagen {current} de {total}...",
    progress_pdf_page: "Incrustando página {current} de {total} en el PDF...",
    progress_img2pdf_title: "Generando documento PDF...",
    progress_img2pdf_desc_magic: "Aplicando realce de contraste mágico e incrustando imágenes en alta definición...",
    progress_img2pdf_desc_normal: "Compilando tus imágenes en un documento PDF de alta calidad...",
    badge_pages_count: "{count} páginas",
    card_page_label: "Página {num}",
    btn_rotate_title: "Rotar 90°",
    btn_crop_title: "Recortar imagen",
    btn_delete_title: "Eliminar de la lista"
  }
};

window.I18N_DICTIONARY = I18N_DICTIONARY;
window.currentLang = 'en';

window.t = function(key, params = {}) {
  const lang = window.currentLang || 'en';
  const dict = I18N_DICTIONARY[lang] || I18N_DICTIONARY['en'];
  let text = dict[key] || (I18N_DICTIONARY['en'] && I18N_DICTIONARY['en'][key]) || key;
  for (const [pKey, pVal] of Object.entries(params)) {
    text = text.replace(new RegExp(`\\{${pKey}\\}`, 'g'), pVal);
  }
  return text;
};

window.setLanguage = function(lang) {
  if (!I18N_DICTIONARY[lang]) lang = 'en';
  window.currentLang = lang;
  document.documentElement.lang = lang;
  localStorage.setItem('pdftools_lang', lang);

  const dict = I18N_DICTIONARY[lang];

  // Actualizar metadatos
  if (dict.pageTitle) document.title = dict.pageTitle;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && dict.pageDesc) metaDesc.setAttribute('content', dict.pageDesc);

  // Actualizar todos los elementos con data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) {
      el.innerHTML = dict[key];
    }
  });

  // Actualizar placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key] !== undefined) {
      el.placeholder = dict[key];
    }
  });

  // Actualizar tooltips / titles
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (dict[key] !== undefined) {
      el.title = dict[key];
    }
  });

  // Actualizar botones de banderas
  const btnEn = document.getElementById('btn-lang-en');
  const btnEs = document.getElementById('btn-lang-es');
  if (btnEn && btnEs) {
    btnEn.classList.toggle('active', lang === 'en');
    btnEs.classList.toggle('active', lang === 'es');
  }

  // Notificar al resto de la aplicación
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
};

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('pdftools_lang');
  if (saved === 'es') {
    window.setLanguage('es');
  } else {
    window.setLanguage('en');
  }
});
