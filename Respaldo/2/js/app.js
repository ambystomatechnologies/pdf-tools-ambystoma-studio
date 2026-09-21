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
});
