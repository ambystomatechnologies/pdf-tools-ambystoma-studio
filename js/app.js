/**
 * app.js
 * Lógica principal de interacción, estados y eventos para PDF Tools Studio
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // ESTADO DE LA APLICACIÓN
  // =========================================================================
  const state = {
    // Tab 1: Combinar
    mergeFiles: [], // Array de objetos { id, file, name, size, pageCount, arrayBuffer }
    
    // Tab 2: Cortar
    cutFile: null,  // { file, name, size, totalPages, arrayBuffer, pdfJsDoc }
    selectedPageIndices: new Set(), // Set de índices 0-based
    
    // Tab 3: Generar PDF con Imágenes
    img2pdfItems: [], // { id, file, name, size, imgEl, rotation, crop }
    magicContrast: false,
    activeCropItem: null,
    
    // UI
    activeTab: 'tab-merge'
  };

  // =========================================================================
  // SELECTORES DEL DOM
  // =========================================================================
  // Tabs
  const tabBtns = document.querySelectorAll('.tab-button');
  const tabPanels = document.querySelectorAll('.tab-panel');

  // Merge Tab
  const mergeDropzone = document.getElementById('merge-dropzone');
  const mergeFileInput = document.getElementById('merge-file-input');
  const btnBrowseMerge = document.getElementById('btn-browse-merge');
  const mergeFilesSection = document.getElementById('merge-files-section');
  const mergeFileList = document.getElementById('merge-file-list');
  const mergeFileCount = document.getElementById('merge-file-count');
  const btnAddMoreMerge = document.getElementById('btn-add-more-merge');
  const btnClearMerge = document.getElementById('btn-clear-merge');
  const mergeOutputName = document.getElementById('merge-output-name');
  const btnDoMerge = document.getElementById('btn-do-merge');

  // Cut Tab
  const cutDropzone = document.getElementById('cut-dropzone');
  const cutFileInput = document.getElementById('cut-file-input');
  const btnBrowseCut = document.getElementById('btn-browse-cut');
  const cutContentSection = document.getElementById('cut-content-section');
  const cutFileName = document.getElementById('cut-file-name');
  const cutTotalPagesBadge = document.getElementById('cut-total-pages-badge');
  const cutFileSize = document.getElementById('cut-file-size');
  const btnChangeCutPdf = document.getElementById('btn-change-cut-pdf');

  const spinFrom = document.getElementById('spin-from');
  const spinTo = document.getElementById('spin-to');
  const btnApplySpinRange = document.getElementById('btn-apply-spin-range');
  const txtCustomRange = document.getElementById('txt-custom-range');
  const btnApplyCustomRange = document.getElementById('btn-apply-custom-range');

  const cutSelectedCount = document.getElementById('cut-selected-count');
  const cutTotalCount = document.getElementById('cut-total-count');
  const btnSelectAllPages = document.getElementById('btn-select-all-pages');
  const btnDeselectAllPages = document.getElementById('btn-deselect-all-pages');
  const btnInvertSelection = document.getElementById('btn-invert-selection');
  const pagesGridContainer = document.getElementById('pages-grid-container');
  const cutOutputName = document.getElementById('cut-output-name');
  const btnDoCut = document.getElementById('btn-do-cut');

  // Modal de Progreso
  const progressModal = document.getElementById('progress-modal');
  const progressTitle = document.getElementById('progress-title');
  const progressDesc = document.getElementById('progress-desc');
  const progressBarFill = document.getElementById('progress-bar-fill');

  // Contenedor Toast
  const toastContainer = document.getElementById('toast-container');

  // =========================================================================
  // SISTEMA DE NOTIFICACIONES TOAST & MODAL DE PROGRESO
  // =========================================================================
  function showToast(message, type = 'info', duration = 3500) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg class="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg class="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else if (type === 'warning') {
      iconSvg = `<svg class="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    } else {
      iconSvg = `<svg class="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
      ${iconSvg}
      <span class="toast-message">${escapeHtml(message)}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  function showProgress(title, desc = 'Por favor espera...') {
    progressTitle.textContent = title;
    progressDesc.textContent = desc;
    progressBarFill.style.width = '0%';
    progressModal.style.display = 'flex';
  }

  function updateProgress(percent, desc = null) {
    progressBarFill.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    if (desc) progressDesc.textContent = desc;
  }

  function hideProgress() {
    progressModal.style.display = 'none';
  }

  function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  // =========================================================================
  // CONTROL DE PESTAÑAS (TABS)
  // =========================================================================
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      state.activeTab = targetId;

      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      document.getElementById(targetId).classList.add('active');
    });
  });

  // =========================================================================
  // TAB 1: COMBINAR MULTIPLES PDFs
  // =========================================================================
  btnBrowseMerge.addEventListener('click', () => mergeFileInput.click());
  btnAddMoreMerge.addEventListener('click', () => mergeFileInput.click());

  // Drag & drop en dropzone de combinar
  setupDragAndDrop(mergeDropzone, (files) => handleMergeFiles(files));

  mergeFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleMergeFiles(Array.from(e.target.files));
      mergeFileInput.value = ''; // Reset para poder re-seleccionar mismos archivos
    }
  });

  async function handleMergeFiles(files) {
    const pdfFiles = files.filter(f => f.name.toLowerCase().endsWith('.pdf') || f.type === 'application/pdf');
    if (pdfFiles.length === 0) {
      showToast('Por favor selecciona únicamente archivos con formato .PDF', 'warning');
      return;
    }

    showProgress('Analizando archivos PDF...', 'Leyendo páginas y estructura de documentos');
    let addedCount = 0;

    for (let i = 0; i < pdfFiles.length; i++) {
      const f = pdfFiles[i];
      updateProgress((i / pdfFiles.length) * 100, `Procesando "${f.name}"...`);
      try {
        const info = await PDFService.inspectPDF(f);
        state.mergeFiles.push({
          id: 'pdf_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          file: f,
          name: f.name,
          size: f.size,
          pageCount: info.pageCount,
          arrayBuffer: info.arrayBuffer
        });
        addedCount++;
      } catch (err) {
        console.error(`Error leyendo ${f.name}:`, err);
        showToast(`No se pudo leer "${f.name}": ${err.message}`, 'error', 6000);
      }
    }

    hideProgress();

    if (addedCount > 0) {
      renderMergeList();
      showToast(`Se han añadido ${addedCount} archivo(s) correctamente`, 'success');
    }
  }

  function renderMergeList() {
    const count = state.mergeFiles.length;
    mergeFileCount.textContent = count;

    if (count === 0) {
      mergeFilesSection.style.display = 'none';
      mergeDropzone.style.display = 'block';
      btnDoMerge.disabled = true;
      return;
    }

    mergeDropzone.style.display = 'none';
    mergeFilesSection.style.display = 'block';
    btnDoMerge.disabled = false;

    mergeFileList.innerHTML = '';

    state.mergeFiles.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'file-item';
      li.innerHTML = `
        <span class="file-index-badge">${index + 1}</span>
        <div class="file-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
        </div>
        <div class="file-info">
          <div class="file-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</div>
          <div class="file-meta-row">
            <span class="badge">${item.pageCount} ${item.pageCount === 1 ? 'pág.' : 'págs.'}</span>
            <span>${PDFService.formatBytes(item.size)}</span>
          </div>
        </div>
        <div class="file-actions-row">
          <button type="button" class="btn btn-icon btn-move-up" data-index="${index}" title="Subir orden" ${index === 0 ? 'disabled' : ''}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
          </button>
          <button type="button" class="btn btn-icon btn-move-down" data-index="${index}" title="Bajar orden" ${index === count - 1 ? 'disabled' : ''}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          <button type="button" class="btn btn-icon btn-danger btn-remove" data-index="${index}" title="Quitar archivo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      `;

      // Eventos de botones de fila
      li.querySelector('.btn-move-up').addEventListener('click', () => moveMergeFile(index, -1));
      li.querySelector('.btn-move-down').addEventListener('click', () => moveMergeFile(index, 1));
      li.querySelector('.btn-remove').addEventListener('click', () => removeMergeFile(index));

      mergeFileList.appendChild(li);
    });
  }

  function moveMergeFile(index, offset) {
    const newIndex = index + offset;
    if (newIndex < 0 || newIndex >= state.mergeFiles.length) return;

    const temp = state.mergeFiles[index];
    state.mergeFiles[index] = state.mergeFiles[newIndex];
    state.mergeFiles[newIndex] = temp;
    renderMergeList();
  }

  function removeMergeFile(index) {
    state.mergeFiles.splice(index, 1);
    renderMergeList();
  }

  btnClearMerge.addEventListener('click', () => {
    if (state.mergeFiles.length === 0) return;
    state.mergeFiles = [];
    renderMergeList();
    showToast('Lista limpiada', 'info');
  });

  // Ejecución de Unión de PDFs
  btnDoMerge.addEventListener('click', async () => {
    if (state.mergeFiles.length === 0) {
      showToast('Añade al menos un archivo PDF para combinar.', 'warning');
      return;
    }

    const outputName = mergeOutputName.value.trim() || 'PDF_combinado';
    showProgress('Combinando archivos...', 'Uniendo páginas de tus documentos PDF');

    try {
      await PDFService.mergePDFs(state.mergeFiles, outputName, (percent, msg) => {
        updateProgress(percent, msg);
      });
      hideProgress();
      showToast('¡Archivo combinado descargado con éxito!', 'success', 5000);
    } catch (err) {
      hideProgress();
      console.error('Error al combinar PDFs:', err);
      showToast(`Error al combinar archivos: ${err.message}`, 'error', 6000);
    }
  });

  // =========================================================================
  // TAB 2: CORTAR / DIVIDIR PDF
  // =========================================================================
  btnBrowseCut.addEventListener('click', () => cutFileInput.click());
  btnChangeCutPdf.addEventListener('click', () => cutFileInput.click());

  setupDragAndDrop(cutDropzone, (files) => {
    if (files.length > 0) handleCutFile(files[0]);
  });

  cutFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleCutFile(e.target.files[0]);
      cutFileInput.value = '';
    }
  });

  async function handleCutFile(file) {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      showToast('Por favor selecciona un archivo con formato .PDF', 'warning');
      return;
    }

    showProgress('Cargando documento...', 'Analizando páginas y generando miniaturas visuales');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const inspectInfo = await PDFService.inspectPDF(file);
      const totalPages = inspectInfo.pageCount;

      if (totalPages === 0) {
        hideProgress();
        showToast('El archivo PDF seleccionado no contiene páginas.', 'warning');
        return;
      }

      // Cargar con PDF.js para renderizado de miniaturas
      let pdfJsDoc = null;
      if (window.pdfjsLib) {
        try {
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer.slice(0) });
          pdfJsDoc = await loadingTask.promise;
        } catch (pdfJsErr) {
          console.warn('PDF.js no pudo cargar el documento para miniaturas:', pdfJsErr);
        }
      }

      state.cutFile = {
        file: file,
        name: file.name,
        size: file.size,
        totalPages: totalPages,
        arrayBuffer: arrayBuffer,
        pdfJsDoc: pdfJsDoc
      };

      // Por defecto, marcar todas las páginas (idéntico a la app PyQt6)
      state.selectedPageIndices = new Set();
      for (let i = 0; i < totalPages; i++) {
        state.selectedPageIndices.add(i);
      }

      // Actualizar Controles de Rango Rápido
      spinFrom.min = 1;
      spinFrom.max = totalPages;
      spinFrom.value = 1;

      spinTo.min = 1;
      spinTo.max = totalPages;
      spinTo.value = totalPages;

      // Información de archivo
      cutFileName.textContent = file.name;
      cutTotalPagesBadge.textContent = `${totalPages} ${totalPages === 1 ? 'página' : 'páginas'}`;
      cutFileSize.textContent = PDFService.formatBytes(file.size);

      // Nombre por defecto para archivo cortado
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      cutOutputName.value = `${baseName}_cortado`;

      // Mostrar sección de corte y ocultar dropzone
      cutDropzone.style.display = 'none';
      cutContentSection.style.display = 'block';

      // Renderizar cuadrícula de páginas
      renderPagesGrid();
      updateCutSelectionCounter();

      hideProgress();
      showToast(`Archivo "${file.name}" cargado (${totalPages} páginas)`, 'success');
    } catch (err) {
      hideProgress();
      console.error('Error al abrir PDF para cortar:', err);
      showToast(`No se pudo leer el archivo PDF: ${err.message}`, 'error');
    }
  }

  function renderPagesGrid() {
    if (!state.cutFile) return;
    const total = state.cutFile.totalPages;
    pagesGridContainer.innerHTML = '';

    for (let i = 0; i < total; i++) {
      const pageNum = i + 1;
      const isSelected = state.selectedPageIndices.has(i);

      const card = document.createElement('div');
      card.className = `page-card ${isSelected ? 'selected' : ''}`;
      card.dataset.pageIndex = i;

      card.innerHTML = `
        <div class="page-thumbnail-box">
          <canvas id="thumb-canvas-${pageNum}"></canvas>
          <div class="page-placeholder" id="thumb-placeholder-${pageNum}">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            <span>Pág. ${pageNum}</span>
          </div>
        </div>
        <div class="page-card-footer">
          <span class="page-number">Página ${pageNum}</span>
          <div class="custom-checkbox">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        togglePageSelection(i);
      });

      pagesGridContainer.appendChild(card);

      // Renderizar miniatura en segundo plano de manera asíncrona
      if (state.cutFile.pdfJsDoc) {
        const canvas = card.querySelector(`#thumb-canvas-${pageNum}`);
        const placeholder = card.querySelector(`#thumb-placeholder-${pageNum}`);
        PDFService.renderPageThumbnail(state.cutFile.pdfJsDoc, pageNum, canvas)
          .then(() => {
            if (placeholder) placeholder.style.display = 'none';
          })
          .catch(() => {});
      }
    }
  }

  function togglePageSelection(pageIndex) {
    if (state.selectedPageIndices.has(pageIndex)) {
      state.selectedPageIndices.delete(pageIndex);
    } else {
      state.selectedPageIndices.add(pageIndex);
    }

    updateCardVisualState(pageIndex);
    updateCutSelectionCounter();
  }

  function updateCardVisualState(pageIndex) {
    const card = pagesGridContainer.querySelector(`[data-page-index="${pageIndex}"]`);
    if (card) {
      if (state.selectedPageIndices.has(pageIndex)) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    }
  }

  function updateAllCardsVisualState() {
    const cards = pagesGridContainer.querySelectorAll('.page-card');
    cards.forEach(card => {
      const idx = parseInt(card.dataset.pageIndex, 10);
      if (state.selectedPageIndices.has(idx)) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });
  }

  function updateCutSelectionCounter() {
    if (!state.cutFile) return;
    const selectedCount = state.selectedPageIndices.size;
    const total = state.cutFile.totalPages;

    cutSelectedCount.textContent = selectedCount;
    cutTotalCount.textContent = total;
    btnDoCut.disabled = selectedCount === 0;
  }

  // Rango Rápido (Desde - Hasta)
  btnApplySpinRange.addEventListener('click', () => {
    if (!state.cutFile) return;
    let start = parseInt(spinFrom.value, 10);
    let end = parseInt(spinTo.value, 10);
    const total = state.cutFile.totalPages;

    if (isNaN(start) || start < 1) start = 1;
    if (isNaN(end) || end > total) end = total;

    if (start > end) {
      const temp = start;
      start = end;
      end = temp;
      spinFrom.value = start;
      spinTo.value = end;
    }

    state.selectedPageIndices.clear();
    for (let p = start; p <= end; p++) {
      state.selectedPageIndices.add(p - 1);
    }

    updateAllCardsVisualState();
    updateCutSelectionCounter();
    showToast(`Rango aplicado: páginas ${start} a ${end}`, 'info');
  });

  // Expresión de Texto Personalizada (ej. 1-3, 5, 8-10)
  btnApplyCustomRange.addEventListener('click', () => {
    if (!state.cutFile) return;
    const text = txtCustomRange.value.trim();
    if (!text) {
      showToast("Escribe un rango como '1-3, 5, 8-10'", 'warning');
      return;
    }

    const indices = PDFService.parsePageRanges(text, state.cutFile.totalPages);
    if (!indices || indices.length === 0) {
      showToast(`No se reconocieron páginas válidas en el rango (1 a ${state.cutFile.totalPages})`, 'warning');
      return;
    }

    state.selectedPageIndices = new Set(indices);
    updateAllCardsVisualState();
    updateCutSelectionCounter();
    showToast(`Se seleccionaron ${indices.length} páginas del texto`, 'success');
  });

  // Botón Seleccionar Todas
  btnSelectAllPages.addEventListener('click', () => {
    if (!state.cutFile) return;
    for (let i = 0; i < state.cutFile.totalPages; i++) {
      state.selectedPageIndices.add(i);
    }
    updateAllCardsVisualState();
    updateCutSelectionCounter();
  });

  // Botón Deseleccionar Todas
  btnDeselectAllPages.addEventListener('click', () => {
    if (!state.cutFile) return;
    state.selectedPageIndices.clear();
    updateAllCardsVisualState();
    updateCutSelectionCounter();
  });

  // Botón Invertir Selección
  btnInvertSelection.addEventListener('click', () => {
    if (!state.cutFile) return;
    for (let i = 0; i < state.cutFile.totalPages; i++) {
      if (state.selectedPageIndices.has(i)) {
        state.selectedPageIndices.delete(i);
      } else {
        state.selectedPageIndices.add(i);
      }
    }
    updateAllCardsVisualState();
    updateCutSelectionCounter();
  });

  // Guardar Sección Cortada
  btnDoCut.addEventListener('click', async () => {
    if (!state.cutFile) {
      showToast('No hay ningún archivo cargado.', 'warning');
      return;
    }
    if (state.selectedPageIndices.size === 0) {
      showToast('Debes seleccionar al menos una página para guardar.', 'warning');
      return;
    }

    const sortedIndices = Array.from(state.selectedPageIndices).sort((a, b) => a - b);
    const outputName = cutOutputName.value.trim() || 'documento_cortado';

    showProgress('Guardando nueva sección...', `Extrayendo ${sortedIndices.length} páginas seleccionadas`);

    try {
      await PDFService.splitPDF(state.cutFile, sortedIndices, outputName, (percent, msg) => {
        updateProgress(percent, msg);
      });
      hideProgress();
      showToast(`¡PDF guardado con ${sortedIndices.length} páginas exitosamente!`, 'success', 5000);
    } catch (err) {
      hideProgress();
      console.error('Error al guardar sección:', err);
      showToast(`No se pudo generar el nuevo PDF: ${err.message}`, 'error', 6000);
    }
  });

  // =========================================================================
  // UTILIDAD: DRAG & DROP
  // =========================================================================
  function setupDragAndDrop(element, onDropFiles) {
    if (!element) return;

    ['dragenter', 'dragover'].forEach(eventName => {
      element.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        element.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      element.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        element.classList.remove('dragover');
      });
    });

    element.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length > 0) {
        onDropFiles(Array.from(dt.files));
      }
    });
  }

  // =========================================================================
  // TAB 3: GENERAR PDF CON IMÁGENES (Recorte / Contraste Mágico)
  // =========================================================================
  const img2pdfDropzone = document.getElementById('img2pdf-dropzone');
  const img2pdfFileInput = document.getElementById('img2pdf-file-input');
  const btnBrowseImg2pdf = document.getElementById('btn-browse-img2pdf');
  const btnAddMoreImg2pdf = document.getElementById('btn-add-more-img2pdf');
  const btnClearImg2pdf = document.getElementById('btn-clear-img2pdf');
  const img2pdfContentSection = document.getElementById('img2pdf-content-section');
  const img2pdfGridContainer = document.getElementById('img2pdf-grid-container');
  const img2pdfImagesCount = document.getElementById('img2pdf-images-count');
  const toggleMagicContrast = document.getElementById('toggle-magic-contrast');
  const img2pdfPageSize = document.getElementById('img2pdf-page-size');
  const img2pdfOrientation = document.getElementById('img2pdf-orientation');
  const img2pdfMargins = document.getElementById('img2pdf-margins');
  const img2pdfOutputName = document.getElementById('img2pdf-output-name');
  const btnDoImg2pdf = document.getElementById('btn-do-img2pdf');

  // Modal de Recorte
  const cropModal = document.getElementById('crop-modal');
  const cropCanvas = document.getElementById('crop-canvas');
  const cropModalHeading = document.getElementById('crop-modal-heading');
  const btnCloseCrop = document.getElementById('btn-close-crop');
  const btnCropCancel = document.getElementById('btn-crop-cancel');
  const btnCropApply = document.getElementById('btn-crop-apply');
  const btnCropReset = document.getElementById('btn-crop-reset');
  const btnPresetFree = document.getElementById('btn-preset-free');
  const btnPresetA4 = document.getElementById('btn-preset-a4');

  // Eventos de selección y carga de imágenes
  if (btnBrowseImg2pdf && img2pdfFileInput) {
    btnBrowseImg2pdf.addEventListener('click', () => img2pdfFileInput.click());
  }
  if (btnAddMoreImg2pdf && img2pdfFileInput) {
    btnAddMoreImg2pdf.addEventListener('click', () => img2pdfFileInput.click());
  }

  if (img2pdfDropzone) {
    setupDragAndDrop(img2pdfDropzone, (files) => handleImg2PdfFiles(files));
  }

  if (img2pdfFileInput) {
    img2pdfFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleImg2PdfFiles(Array.from(e.target.files));
        img2pdfFileInput.value = '';
      }
    });
  }

  // Switch de Contraste Mágico
  if (toggleMagicContrast) {
    toggleMagicContrast.addEventListener('click', () => {
      state.magicContrast = !state.magicContrast;
      toggleMagicContrast.classList.toggle('active', state.magicContrast);
      
      // Actualizar todas las tarjetas visuales inmediatamente
      renderImagesGrid();

      if (state.magicContrast) {
        showToast(window.t ? window.t('toast_magic_enabled') : '🪄 Magic Contrast enabled: Whitens paper backgrounds and sharpens text.', 'success');
      } else {
        showToast(window.t ? window.t('toast_magic_disabled') : 'Magic Contrast disabled: Showing photos in original natural color.', 'info');
      }
    });
  }

  // Botón Vaciar Todo
  if (btnClearImg2pdf) {
    btnClearImg2pdf.addEventListener('click', () => {
      if (state.img2pdfItems.length === 0) return;
      const confirmMsg = window.t ? window.t('confirm_clear_images') : 'Are you sure you want to clear all images?';
      if (confirm(confirmMsg)) {
        state.img2pdfItems = [];
        renderImagesGrid();
        showToast(window.t ? window.t('toast_images_cleared') : 'All images have been cleared.', 'info');
      }
    });
  }

  /**
   * Algoritmo de Realce de Documento (Contraste Mágico)
   * Blanquea sombras de papel y fondos grises, y oscurece la tinta.
   */
  function applyMagicContrastEffect(ctx, width, height) {
    const imgData = ctx.getImageData(0, 0, width, height);
    const d = imgData.data;
    const len = d.length;

    for (let i = 0; i < len; i += 4) {
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];

      // Luminancia monocromática
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // Curva de realce de documento:
      // - Fondos de papel y sombras (> 165) se blanquean a 255 (#FFFFFF)
      // - Texto y trazos de tinta (< 90) se intensifican a negro profundo
      // - Transición suave entre tinta y papel
      let out;
      if (lum >= 165) {
        out = 255;
      } else if (lum <= 90) {
        out = Math.max(0, Math.round(lum * 0.3));
      } else {
        const t = (lum - 90) / (165 - 90);
        out = Math.round(t * 255);
      }

      d[i] = out;
      d[i + 1] = out;
      d[i + 2] = out;
    }

    ctx.putImageData(imgData, 0, 0);
  }

  /**
   * Carga y procesa los archivos de imagen seleccionados progresivamente (uno a uno)
   * para evitar desbordar la memoria RAM en dispositivos móviles (iPhone/Safari).
   */
  async function handleImg2PdfFiles(files) {
    const validImages = files.filter(f => !f.type || f.type.startsWith('image/') || /\.(jpe?g|png|webp|bmp|heic|heif|tif|tiff)$/i.test(f.name));
    if (validImages.length === 0) {
      showToast(window.t ? window.t('toast_invalid_images') : 'Por favor selecciona archivos de imagen válidos (JPG, PNG, WebP, BMP, HEIC).', 'warning');
      return;
    }

    const total = validImages.length;
    const progressTitle = window.t ? window.t('progress_optimizing_title') : 'Optimizando imágenes para alto rendimiento...';
    showProgress(progressTitle, `Comprimiendo y preparando imagen 1 de ${total}...`);

    let loadedCount = 0;
    let failedCount = 0;

    try {
      for (let i = 0; i < total; i++) {
        const file = validImages[i];
        const pct = Math.round(((i) / total) * 100);
        const descMsg = window.t 
          ? window.t('progress_optimizing_desc', { current: i + 1, total: total })
          : `Comprimiendo y preparando imagen ${i + 1} de ${total}...`;

        updateProgress(pct, descMsg);

        // Pequeña pausa asíncrona para ceder tiempo al recolector de basura (GC) y renderizado en iOS Safari
        await new Promise(resolve => setTimeout(resolve, 25));

        try {
          const item = await processImageFileSafely(file);
          state.img2pdfItems.push(item);
          loadedCount++;
        } catch (imgErr) {
          console.warn(`Error procesando imagen ${file.name}:`, imgErr);
          failedCount++;
        }
      }

      updateProgress(100);
      await new Promise(resolve => setTimeout(resolve, 40));

      renderImagesGrid();

      if (loadedCount > 0) {
        const successMsg = window.t 
          ? window.t('toast_images_optimized', { count: loadedCount })
          : `${loadedCount} imagen(es) optimizada(s) y lista(s).`;
        showToast(successMsg, 'success');
      }
      if (failedCount > 0) {
        showToast(`${failedCount} imagen(es) no pudieron ser decodificadas.`, 'warning', 4000);
      }
    } catch (err) {
      console.error('Error al cargar imágenes:', err);
      showToast(window.t ? window.t('toast_images_process_error') : 'Ocurrió un error al procesar algunas imágenes.', 'error');
    } finally {
      hideProgress();
    }
  }

  /**
   * Procesa, escala y comprime una imagen individual de forma segura y liviana.
   * Evita picos de memoria RAM (OutOfMemory) en iPhone X / Safari.
   */
  function processImageFileSafely(file) {
    return new Promise((resolve, reject) => {
      let objectUrl = null;
      try {
        objectUrl = URL.createObjectURL(file);
      } catch (e) {
        objectUrl = null;
      }

      const img = new Image();

      const onImageLoaded = () => {
        try {
          const nw = img.naturalWidth || img.width;
          const nh = img.naturalHeight || img.height;

          if (!nw || !nh) {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
            reject(new Error(`Dimensiones inválidas para ${file.name}`));
            return;
          }

          // Escala óptima para PDF: máximo 2048px en su lado mayor (~300 DPI, nítido y ultraliviano)
          const MAX_DIM = 2048;
          let targetW = nw;
          let targetH = nh;
          if (Math.max(nw, nh) > MAX_DIM) {
            const scale = MAX_DIM / Math.max(nw, nh);
            targetW = Math.round(nw * scale);
            targetH = Math.round(nh * scale);
          }

          // Canvas temporal para generar la imagen de trabajo optimizada
          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(img, 0, 0, targetW, targetH);

          const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.86);

          // Generar miniatura base (~320px) para las tarjetas del grid (evita recalcular en cada preview)
          const THUMB_DIM = 320;
          let thumbW = targetW;
          let thumbH = targetH;
          if (Math.max(targetW, targetH) > THUMB_DIM) {
            const tScale = THUMB_DIM / Math.max(targetW, targetH);
            thumbW = Math.round(targetW * tScale);
            thumbH = Math.round(targetH * tScale);
          }
          const thumbCanvas = document.createElement('canvas');
          thumbCanvas.width = thumbW;
          thumbCanvas.height = thumbH;
          const tCtx = thumbCanvas.getContext('2d');
          tCtx.drawImage(canvas, 0, 0, thumbW, thumbH);
          const thumbBaseDataUrl = thumbCanvas.toDataURL('image/jpeg', 0.80);

          // Limpiar inmediatamente recursos temporales de memoria
          canvas.width = 1;
          canvas.height = 1;
          thumbCanvas.width = 1;
          thumbCanvas.height = 1;
          if (objectUrl) URL.revokeObjectURL(objectUrl);

          // Cargar imagen optimizada
          const optImg = new Image();
          optImg.onload = () => {
            const item = {
              id: 'img_' + Math.random().toString(36).substr(2, 9),
              file: file,
              name: file.name,
              size: Math.round(optimizedDataUrl.length * 0.75),
              originalSize: file.size,
              imgEl: optImg,
              width: targetW,
              height: targetH,
              thumbBaseDataUrl: thumbBaseDataUrl,
              rotation: 0,
              crop: null, // { x: 0..1, y: 0..1, width: 0..1, height: 0..1 }

              /**
               * Obtiene miniatura rápida para la tarjeta del grid
               */
              getThumbnailUrl: function(magicContrast = state.magicContrast) {
                const rot = (this.rotation || 0) % 360;
                const crop = this.crop;
                if (rot === 0 && !crop && !magicContrast) {
                  return this.thumbBaseDataUrl;
                }

                const tCanvas = document.createElement('canvas');
                const tCtx = tCanvas.getContext('2d', { willReadFrequently: true });
                const c = crop || { x: 0, y: 0, width: 1, height: 1 };

                const sx = Math.max(0, Math.round(c.x * targetW));
                const sy = Math.max(0, Math.round(c.y * targetH));
                const sw = Math.min(targetW - sx, Math.max(1, Math.round(c.width * targetW)));
                const sh = Math.min(targetH - sy, Math.max(1, Math.round(c.height * targetH)));

                let finalThumbW = thumbW;
                let finalThumbH = Math.max(1, Math.round(thumbW * (sh / sw)));
                if (finalThumbH > THUMB_DIM) {
                  finalThumbH = THUMB_DIM;
                  finalThumbW = Math.max(1, Math.round(THUMB_DIM * (sw / sh)));
                }

                if (rot === 90 || rot === 270) {
                  tCanvas.width = finalThumbH;
                  tCanvas.height = finalThumbW;
                } else {
                  tCanvas.width = finalThumbW;
                  tCanvas.height = finalThumbH;
                }

                tCtx.save();
                if (rot === 90) {
                  tCtx.translate(tCanvas.width, 0);
                  tCtx.rotate(Math.PI / 2);
                } else if (rot === 180) {
                  tCtx.translate(tCanvas.width, tCanvas.height);
                  tCtx.rotate(Math.PI);
                } else if (rot === 270) {
                  tCtx.translate(0, tCanvas.height);
                  tCtx.rotate((3 * Math.PI) / 2);
                }

                tCtx.drawImage(optImg, sx, sy, sw, sh, 0, 0, finalThumbW, finalThumbH);
                tCtx.restore();

                if (magicContrast) {
                  applyMagicContrastEffect(tCtx, tCanvas.width, tCanvas.height);
                }

                const resThumb = tCanvas.toDataURL('image/jpeg', 0.82);
                tCanvas.width = 1;
                tCanvas.height = 1;
                return resThumb;
              },

              /**
               * Genera DataURL optimizado para exportación final al PDF
               */
              getDataUrl: function(magicContrast = state.magicContrast) {
                const expCanvas = document.createElement('canvas');
                const expCtx = expCanvas.getContext('2d', { willReadFrequently: true });
                const nw = optImg.naturalWidth || targetW;
                const nh = optImg.naturalHeight || targetH;

                const crop = this.crop || { x: 0, y: 0, width: 1, height: 1 };
                const sx = Math.max(0, Math.round(crop.x * nw));
                const sy = Math.max(0, Math.round(crop.y * nh));
                const sw = Math.min(nw - sx, Math.max(1, Math.round(crop.width * nw)));
                const sh = Math.min(nh - sy, Math.max(1, Math.round(crop.height * nh)));

                const rot = (this.rotation || 0) % 360;
                if (rot === 90 || rot === 270) {
                  expCanvas.width = sh;
                  expCanvas.height = sw;
                } else {
                  expCanvas.width = sw;
                  expCanvas.height = sh;
                }

                expCtx.save();
                if (rot === 90) {
                  expCtx.translate(expCanvas.width, 0);
                  expCtx.rotate(Math.PI / 2);
                } else if (rot === 180) {
                  expCtx.translate(expCanvas.width, expCanvas.height);
                  expCtx.rotate(Math.PI);
                } else if (rot === 270) {
                  expCtx.translate(0, expCanvas.height);
                  expCtx.rotate((3 * Math.PI) / 2);
                }

                expCtx.drawImage(optImg, sx, sy, sw, sh, 0, 0, sw, sh);
                expCtx.restore();

                if (magicContrast) {
                  applyMagicContrastEffect(expCtx, expCanvas.width, expCanvas.height);
                }

                const out = expCanvas.toDataURL('image/jpeg', 0.88);
                expCanvas.width = 1;
                expCanvas.height = 1;
                return out;
              }
            };
            resolve(item);
          };

          optImg.onerror = () => {
            reject(new Error(`Error decodificando imagen optimizada: ${file.name}`));
          };
          optImg.src = optimizedDataUrl;
        } catch (err) {
          if (objectUrl) URL.revokeObjectURL(objectUrl);
          reject(err);
        }
      };

      img.onload = onImageLoaded;

      img.onerror = () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        // Respaldo en FileReader por si objectUrl falla en navegadores específicos
        const reader = new FileReader();
        reader.onload = (e) => {
          const fallbackImg = new Image();
          fallbackImg.onload = () => {
            try {
              const nw = fallbackImg.naturalWidth;
              const nh = fallbackImg.naturalHeight;
              const MAX_DIM = 2048;
              let targetW = nw;
              let targetH = nh;
              if (Math.max(nw, nh) > MAX_DIM) {
                const scale = MAX_DIM / Math.max(nw, nh);
                targetW = Math.round(nw * scale);
                targetH = Math.round(nh * scale);
              }
              const canvas = document.createElement('canvas');
              canvas.width = targetW;
              canvas.height = targetH;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(fallbackImg, 0, 0, targetW, targetH);
              const optUrl = canvas.toDataURL('image/jpeg', 0.86);
              canvas.width = 1;
              canvas.height = 1;

              const optImg = new Image();
              optImg.onload = () => {
                const item = {
                  id: 'img_' + Math.random().toString(36).substr(2, 9),
                  file: file,
                  name: file.name,
                  size: Math.round(optUrl.length * 0.75),
                  originalSize: file.size,
                  imgEl: optImg,
                  width: targetW,
                  height: targetH,
                  thumbBaseDataUrl: optUrl,
                  rotation: 0,
                  crop: null,
                  getThumbnailUrl: function() { return optUrl; },
                  getDataUrl: function() { return optUrl; }
                };
                resolve(item);
              };
              optImg.src = optUrl;
            } catch (err) {
              reject(err);
            }
          };
          fallbackImg.onerror = () => reject(new Error(`No se pudo leer imagen: ${file.name}`));
          fallbackImg.src = e.target.result;
        };
        reader.onerror = () => reject(new Error(`Error al leer archivo: ${file.name}`));
        reader.readAsDataURL(file);
      };

      if (objectUrl) {
        img.src = objectUrl;
      } else {
        const reader = new FileReader();
        reader.onload = (e) => { img.src = e.target.result; };
        reader.onerror = () => reject(new Error(`Error al leer archivo: ${file.name}`));
        reader.readAsDataURL(file);
      }
    });
  }

  // Alias retrocompatible
  const createImageItem = processImageFileSafely;

  /**
   * Renderiza la galería interactiva de imágenes
   */
  function renderImagesGrid() {
    if (!img2pdfGridContainer) return;
    img2pdfGridContainer.innerHTML = '';

    const count = state.img2pdfItems.length;
    if (img2pdfImagesCount) {
      img2pdfImagesCount.textContent = `${count} ${count === 1 ? 'imagen' : 'imágenes'}`;
    }

    if (count === 0) {
      if (img2pdfContentSection) img2pdfContentSection.style.display = 'none';
      if (img2pdfDropzone) img2pdfDropzone.style.display = 'block';
      return;
    }

    if (img2pdfContentSection) img2pdfContentSection.style.display = 'block';
    if (img2pdfDropzone) img2pdfDropzone.style.display = 'none';

    state.img2pdfItems.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = `image-card ${item.crop ? 'cropped-active' : ''}`;
      card.dataset.id = item.id;

      // Encabezado de tarjeta con botón de tijeras destacado
      const header = document.createElement('div');
      header.className = 'image-card-header';
      header.innerHTML = `
        <div class="image-card-header-left">
          <span class="page-num-badge">Pág ${index + 1}</span>
          <span style="font-size: 0.72rem; color: var(--text-dimmed);">${PDFService.formatBytes(item.size)}</span>
        </div>
      `;

      // Botón de tijeras en la cabecera junto a la imagen
      const btnHeaderCrop = document.createElement('button');
      btnHeaderCrop.type = 'button';
      btnHeaderCrop.className = 'btn-card-crop-badge';
      btnHeaderCrop.title = 'Cortar / Recortar esta imagen';
      btnHeaderCrop.innerHTML = `
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>
        <span>Cortar ✂️</span>
      `;
      btnHeaderCrop.addEventListener('click', (e) => {
        e.stopPropagation();
        openCropModal(item);
      });
      header.appendChild(btnHeaderCrop);

      // Contenedor de miniatura interactiva
      const previewBox = document.createElement('div');
      previewBox.className = 'image-card-preview-box';
      previewBox.title = 'Haz clic para cortar / recortar imagen';

      const thumbImg = document.createElement('img');
      thumbImg.className = 'image-card-thumb';
      thumbImg.alt = `Página ${index + 1}`;
      thumbImg.src = item.getThumbnailUrl();

      previewBox.appendChild(thumbImg);

      // Botón flotante de tijeras directamente sobre la imagen
      const overlayCropBtn = document.createElement('button');
      overlayCropBtn.type = 'button';
      overlayCropBtn.className = 'thumb-crop-overlay-btn';
      overlayCropBtn.title = 'Cortar / Recortar esta imagen';
      overlayCropBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>
        <span>Cortar</span>
      `;
      overlayCropBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openCropModal(item);
      });
      previewBox.appendChild(overlayCropBtn);

      previewBox.addEventListener('click', () => openCropModal(item));

      if (item.crop) {
        const cropTag = document.createElement('span');
        cropTag.className = 'cropped-tag';
        cropTag.textContent = '✂️ Recortada';
        previewBox.appendChild(cropTag);
      }

      // Metadatos
      const meta = document.createElement('div');
      meta.className = 'image-card-meta';
      meta.title = item.name;
      meta.textContent = item.name;

      // Fila de acciones por tarjeta: Recortar, Girar, Subir/Bajar, Eliminar
      const actions = document.createElement('div');
      actions.className = 'image-card-actions';

      // 1. Botón Cortar con tijeras destacado
      const btnCrop = document.createElement('button');
      btnCrop.type = 'button';
      btnCrop.className = 'btn-card-action btn-action-crop';
      btnCrop.title = 'Cortar / Recortar bordes de esta imagen';
      btnCrop.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg><span class="btn-action-text">Cortar</span>`;
      btnCrop.addEventListener('click', (e) => {
        e.stopPropagation();
        openCropModal(item);
      });

      // 2. Botón Girar 90°
      const btnRotate = document.createElement('button');
      btnRotate.type = 'button';
      btnRotate.className = 'btn-card-action';
      btnRotate.title = 'Girar 90° a la derecha';
      btnRotate.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>`;
      btnRotate.addEventListener('click', () => {
        item.rotation = (item.rotation + 90) % 360;
        thumbImg.src = item.getThumbnailUrl();
        showToast(`Página ${index + 1} rotada 90°.`, 'info', 2000);
      });

      // 3. Botón Mover (arriba / abajo)
      const btnMove = document.createElement('button');
      btnMove.type = 'button';
      btnMove.className = 'btn-card-action';
      btnMove.title = index === 0 ? 'Mover hacia abajo' : 'Mover hacia arriba';
      btnMove.innerHTML = index === 0 
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>`;
      btnMove.addEventListener('click', () => {
        if (index === 0 && count > 1) {
          // Mover al siguiente
          const temp = state.img2pdfItems[0];
          state.img2pdfItems[0] = state.img2pdfItems[1];
          state.img2pdfItems[1] = temp;
        } else if (index > 0) {
          // Mover al anterior
          const temp = state.img2pdfItems[index];
          state.img2pdfItems[index] = state.img2pdfItems[index - 1];
          state.img2pdfItems[index - 1] = temp;
        }
        renderImagesGrid();
      });

      // 4. Botón Eliminar
      const btnDelete = document.createElement('button');
      btnDelete.type = 'button';
      btnDelete.className = 'btn-card-action btn-action-delete';
      btnDelete.title = 'Eliminar imagen';
      btnDelete.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
      btnDelete.addEventListener('click', () => {
        state.img2pdfItems = state.img2pdfItems.filter(i => i.id !== item.id);
        renderImagesGrid();
        showToast('Imagen eliminada de la lista.', 'info', 2000);
      });

      actions.appendChild(btnCrop);
      actions.appendChild(btnRotate);
      actions.appendChild(btnMove);
      actions.appendChild(btnDelete);

      card.appendChild(header);
      card.appendChild(previewBox);
      card.appendChild(meta);
      card.appendChild(actions);

      img2pdfGridContainer.appendChild(card);
    });
  }

  // =========================================================================
  // SISTEMA DE RECORTE INTERACTIVO (CROP MODAL)
  // =========================================================================
  let cropState = {
    item: null,
    cropX: 0.05,
    cropY: 0.05,
    cropW: 0.9,
    cropH: 0.9,
    preset: 'free', // 'free' | 'a4'
    isDragging: false,
    dragAction: null, // 'move' | 'nw' | 'ne' | 'se' | 'sw' | 'n' | 'e' | 's' | 'w' | 'new'
    startX: 0,
    startY: 0,
    initialCrop: null,
    canvasScale: 1
  };

  function openCropModal(item) {
    if (!cropModal || !cropCanvas) return;
    cropState.item = item;
    if (cropModalHeading) cropModalHeading.textContent = `Recortar: ${item.name}`;

    // Si la imagen ya tenía un recorte previo, usarlo; sino, predeterminar al 90% centrado
    if (item.crop) {
      cropState.cropX = item.crop.x;
      cropState.cropY = item.crop.y;
      cropState.cropW = item.crop.width;
      cropState.cropH = item.crop.height;
    } else {
      cropState.cropX = 0.05;
      cropState.cropY = 0.05;
      cropState.cropW = 0.9;
      cropState.cropH = 0.9;
    }

    cropModal.style.display = 'flex';
    setupCropCanvas();
  }

  function closeCropModal() {
    if (cropModal) cropModal.style.display = 'none';
    cropState.item = null;
  }

  if (btnCloseCrop) btnCloseCrop.addEventListener('click', closeCropModal);
  if (btnCropCancel) btnCropCancel.addEventListener('click', closeCropModal);

  if (btnCropReset) {
    btnCropReset.addEventListener('click', () => {
      cropState.cropX = 0;
      cropState.cropY = 0;
      cropState.cropW = 1;
      cropState.cropH = 1;
      drawCropCanvas();
    });
  }

  if (btnPresetFree && btnPresetA4) {
    btnPresetFree.addEventListener('click', () => {
      cropState.preset = 'free';
      btnPresetFree.classList.add('active');
      btnPresetA4.classList.remove('active');
    });

    btnPresetA4.addEventListener('click', () => {
      cropState.preset = 'a4';
      btnPresetA4.classList.add('active');
      btnPresetFree.classList.remove('active');

      // Ajustar recorte actual a proporción A4 (1 : 1.414)
      const a4Ratio = 1 / 1.414;
      const imgRatio = cropState.item.imgEl.naturalWidth / cropState.item.imgEl.naturalHeight;
      let newW = cropState.cropW;
      let newH = newW * (imgRatio / a4Ratio);
      if (cropState.cropY + newH > 1) {
        newH = 1 - cropState.cropY;
        newW = newH * (a4Ratio / imgRatio);
      }
      cropState.cropW = Math.max(0.1, Math.min(1 - cropState.cropX, newW));
      cropState.cropH = Math.max(0.1, Math.min(1 - cropState.cropY, newH));
      drawCropCanvas();
    });
  }

  if (btnCropApply) {
    btnCropApply.addEventListener('click', () => {
      if (!cropState.item) return;

      // Normalizar coordenadas
      const x = Math.max(0, Math.min(1, cropState.cropX));
      const y = Math.max(0, Math.min(1, cropState.cropY));
      const w = Math.max(0.02, Math.min(1 - x, cropState.cropW));
      const h = Math.max(0.02, Math.min(1 - y, cropState.cropH));

      // Si abarca casi el 100%, dejar en null
      if (x < 0.01 && y < 0.01 && w > 0.98 && h > 0.98) {
        cropState.item.crop = null;
      } else {
        cropState.item.crop = { x, y, width: w, height: h };
      }

      renderImagesGrid();
      closeCropModal();
      showToast('Recorte guardado con éxito.', 'success');
    });
  }

  function setupCropCanvas() {
    if (!cropCanvas || !cropState.item) return;
    const img = cropState.item.imgEl;
    const container = document.getElementById('crop-canvas-wrapper');
    const maxWidth = container ? Math.min(760, container.clientWidth || 700) : 700;
    const maxHeight = Math.min(480, window.innerHeight * 0.52);

    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;

    const scale = Math.min(maxWidth / imgW, maxHeight / imgH, 1);
    cropCanvas.width = Math.round(imgW * scale);
    cropCanvas.height = Math.round(imgH * scale);
    cropState.canvasScale = scale;

    drawCropCanvas();
  }

  function drawCropCanvas() {
    if (!cropCanvas || !cropState.item) return;
    const ctx = cropCanvas.getContext('2d');
    const img = cropState.item.imgEl;
    const cw = cropCanvas.width;
    const ch = cropCanvas.height;

    // 1. Dibujar imagen de fondo
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, 0, 0, cw, ch);

    // 2. Capa sombreada exterior al recorte
    const rx = Math.round(cropState.cropX * cw);
    const ry = Math.round(cropState.cropY * ch);
    const rw = Math.round(cropState.cropW * cw);
    const rh = Math.round(cropState.cropH * ch);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, 0, cw, ry); // Superior
    ctx.fillRect(0, ry + rh, cw, ch - (ry + rh)); // Inferior
    ctx.fillRect(0, ry, rx, rh); // Izquierda
    ctx.fillRect(rx + rw, ry, cw - (rx + rw), rh); // Derecha

    // 3. Borde luminoso del área de recorte
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(rx, ry, rw, rh);

    // 4. Guías de tercios (Grid)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(rx + rw / 3, ry);
    ctx.lineTo(rx + rw / 3, ry + rh);
    ctx.moveTo(rx + (2 * rw) / 3, ry);
    ctx.lineTo(rx + (2 * rw) / 3, ry + rh);

    ctx.moveTo(rx, ry + rh / 3);
    ctx.lineTo(rx + rw, ry + rh / 3);
    ctx.moveTo(rx, ry + (2 * rh) / 3);
    ctx.lineTo(rx + rw, ry + (2 * rh) / 3);
    ctx.stroke();
    ctx.setLineDash([]);

    // 5. Tiradores en esquinas (Handles)
    const handleSize = 10;
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;

    const corners = [
      [rx, ry], // NW
      [rx + rw, ry], // NE
      [rx + rw, ry + rh], // SE
      [rx, ry + rh] // SW
    ];

    corners.forEach(([hx, hy]) => {
      ctx.beginPath();
      ctx.arc(hx, hy, handleSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  }

  // Interacción táctil y de ratón en el Canvas de Recorte
  function getCanvasCoords(e) {
    const rect = cropCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) / cropCanvas.width,
      y: (clientY - rect.top) / cropCanvas.height
    };
  }

  function onCropPointerDown(e) {
    if (!cropState.item) return;
    const { x, y } = getCanvasCoords(e);
    const cw = cropCanvas.width;
    const ch = cropCanvas.height;

    const rx = cropState.cropX;
    const ry = cropState.cropY;
    const rw = cropState.cropW;
    const rh = cropState.cropH;

    const thresholdX = 16 / cw;
    const thresholdY = 16 / ch;

    cropState.isDragging = true;
    cropState.startX = x;
    cropState.startY = y;
    cropState.initialCrop = { x: rx, y: ry, w: rw, h: rh };

    // Determinar zona de arrastre (esquinas, bordes o interior)
    if (Math.abs(x - rx) < thresholdX && Math.abs(y - ry) < thresholdY) {
      cropState.dragAction = 'nw';
    } else if (Math.abs(x - (rx + rw)) < thresholdX && Math.abs(y - ry) < thresholdY) {
      cropState.dragAction = 'ne';
    } else if (Math.abs(x - (rx + rw)) < thresholdX && Math.abs(y - (ry + rh)) < thresholdY) {
      cropState.dragAction = 'se';
    } else if (Math.abs(x - rx) < thresholdX && Math.abs(y - (ry + rh)) < thresholdY) {
      cropState.dragAction = 'sw';
    } else if (x >= rx && x <= rx + rw && y >= ry && y <= ry + rh) {
      cropState.dragAction = 'move';
    } else {
      // Iniciar un nuevo recuadro de recorte desde el clic
      cropState.dragAction = 'new';
      cropState.cropX = x;
      cropState.cropY = y;
      cropState.cropW = 0.05;
      cropState.cropH = 0.05;
    }
  }

  function onCropPointerMove(e) {
    if (!cropState.isDragging || !cropState.item) return;
    const { x, y } = getCanvasCoords(e);
    const dx = x - cropState.startX;
    const dy = y - cropState.startY;
    const init = cropState.initialCrop;

    if (cropState.dragAction === 'move') {
      cropState.cropX = Math.max(0, Math.min(1 - init.w, init.x + dx));
      cropState.cropY = Math.max(0, Math.min(1 - init.h, init.y + dy));
    } else if (cropState.dragAction === 'se') {
      cropState.cropW = Math.max(0.05, Math.min(1 - init.x, init.w + dx));
      cropState.cropH = Math.max(0.05, Math.min(1 - init.y, init.h + dy));
    } else if (cropState.dragAction === 'nw') {
      const newX = Math.max(0, Math.min(init.x + init.w - 0.05, init.x + dx));
      const newY = Math.max(0, Math.min(init.y + init.h - 0.05, init.y + dy));
      cropState.cropW = init.w + (init.x - newX);
      cropState.cropH = init.h + (init.y - newY);
      cropState.cropX = newX;
      cropState.cropY = newY;
    } else if (cropState.dragAction === 'ne') {
      const newY = Math.max(0, Math.min(init.y + init.h - 0.05, init.y + dy));
      cropState.cropW = Math.max(0.05, Math.min(1 - init.x, init.w + dx));
      cropState.cropH = init.h + (init.y - newY);
      cropState.cropY = newY;
    } else if (cropState.dragAction === 'sw') {
      const newX = Math.max(0, Math.min(init.x + init.w - 0.05, init.x + dx));
      cropState.cropW = init.w + (init.x - newX);
      cropState.cropH = Math.max(0.05, Math.min(1 - init.y, init.h + dy));
      cropState.cropX = newX;
    } else if (cropState.dragAction === 'new') {
      cropState.cropX = Math.min(cropState.startX, x);
      cropState.cropY = Math.min(cropState.startY, y);
      cropState.cropW = Math.max(0.05, Math.abs(x - cropState.startX));
      cropState.cropH = Math.max(0.05, Math.abs(y - cropState.startY));
    }

    drawCropCanvas();
  }

  function onCropPointerUp() {
    cropState.isDragging = false;
    cropState.dragAction = null;
  }

  if (cropCanvas) {
    cropCanvas.addEventListener('mousedown', onCropPointerDown);
    window.addEventListener('mousemove', onCropPointerMove);
    window.addEventListener('mouseup', onCropPointerUp);

    cropCanvas.addEventListener('touchstart', (e) => {
      onCropPointerDown(e);
      if (e.cancelable) e.preventDefault();
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (cropState.isDragging) {
        if (e.cancelable) e.preventDefault();
        onCropPointerMove(e);
      }
    }, { passive: false });

    window.addEventListener('touchend', onCropPointerUp);
  }

  // =========================================================================
  // ACCIÓN PRINCIPAL: GENERAR Y DESCARGAR PDF CON IMÁGENES
  // =========================================================================
  if (btnDoImg2pdf) {
    btnDoImg2pdf.addEventListener('click', async () => {
      if (state.img2pdfItems.length === 0) {
        showToast('Debes añadir al menos una imagen para generar el PDF.', 'warning');
        return;
      }

      let fileName = (img2pdfOutputName ? img2pdfOutputName.value.trim() : '') || 'documento_imagenes_ambystoma';
      if (!fileName.toLowerCase().endsWith('.pdf')) {
        fileName += '.pdf';
      }

      const options = {
        pageSize: img2pdfPageSize ? img2pdfPageSize.value : 'a4',
        orientation: img2pdfOrientation ? img2pdfOrientation.value : 'auto',
        margin: img2pdfMargins ? img2pdfMargins.value : 'none',
        magicContrast: state.magicContrast
      };

      const isMagic = state.magicContrast;
      const progressTitle = window.t ? window.t('progress_img2pdf_title') : 'Generating PDF document...';
      const progressDesc = isMagic
        ? (window.t ? window.t('progress_img2pdf_desc_magic') : 'Applying magic contrast enhancement and embedding high-definition images...')
        : (window.t ? window.t('progress_img2pdf_desc_normal') : 'Compiling your images into a high-quality PDF document...');

      showProgress(progressTitle, progressDesc);

      try {
        const pdfBlob = await PDFService.imagesToPDF(state.img2pdfItems, options, (current, total, pct) => {
          const desc = window.t 
            ? window.t('progress_pdf_page', { current, total })
            : `Embedding page ${current} of ${total} into PDF...`;
          updateProgress(pct, desc);
        });

        PDFService.downloadBlob(pdfBlob, fileName);
        showToast(window.t ? window.t('toast_img2pdf_success', { name: fileName }) : `✓ "${fileName}" generated and downloaded successfully.`, 'success', 4500);
      } catch (err) {
        console.error('Error al generar PDF de imágenes:', err);
        showToast(err.message || (window.t ? window.t('toast_img2pdf_error') : 'Error compiling PDF from images.'), 'error');
      } finally {
        hideProgress();
      }
    });
  }

  // =========================================================================
  // MODAL ABOUT / TÉRMINOS LEGALES Y PROPIEDAD INTELECTUAL
  // =========================================================================
  const aboutModal = document.getElementById('about-modal');
  const btnOpenAbout = document.getElementById('btn-open-about');
  const btnCloseAbout = document.getElementById('btn-close-about');
  const btnAcceptAbout = document.getElementById('btn-accept-about');

  if (btnOpenAbout && aboutModal) {
    const openAbout = () => {
      aboutModal.style.display = 'flex';
    };

    const closeAbout = () => {
      aboutModal.style.display = 'none';
    };

    btnOpenAbout.addEventListener('click', openAbout);
    if (btnCloseAbout) btnCloseAbout.addEventListener('click', closeAbout);
    if (btnAcceptAbout) btnAcceptAbout.addEventListener('click', closeAbout);

    // Cerrar haciendo clic en el fondo sombreado exterior
    aboutModal.addEventListener('click', (e) => {
      if (e.target === aboutModal) closeAbout();
    });

    // Cerrar al presionar tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && aboutModal.style.display === 'flex') {
        closeAbout();
      }
    });
  }

  // Redirección infalible al sitio oficial Ambystoma Technologies
  document.querySelectorAll('.brand, .nav-center-logo, .navbar-logo-img, .brand-text, .brand-icon').forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'https://ambystomatechnologies.github.io/';
    });
  });

  // Re-renderizado reactivo ante cambio de idioma
  window.addEventListener('languageChanged', () => {
    if (typeof renderMergeList === 'function' && state.mergeFiles && state.mergeFiles.length > 0) {
      renderMergeList();
    }
    if (state.cutFile) {
      const cutBadge = document.getElementById('cut-total-pages-badge');
      if (cutBadge) {
        cutBadge.textContent = `${state.cutFile.totalPages} ${window.currentLang === 'es' ? (state.cutFile.totalPages === 1 ? 'página' : 'páginas') : (state.cutFile.totalPages === 1 ? 'page' : 'pages')}`;
      }
      if (typeof updateCutSelectionCounter === 'function') {
        updateCutSelectionCounter();
      }
    }
    if (state.img2pdfItems && state.img2pdfItems.length > 0 && typeof renderImagesGrid === 'function') {
      renderImagesGrid();
    }
  });
});
