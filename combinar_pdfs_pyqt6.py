#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Aplicación PyQt6 para trabajar con archivos PDF:
1. Combinar múltiples archivos PDF en uno solo.
2. Abrir un PDF y cortar / separar las páginas o secciones deseadas.
"""

import sys
from pathlib import Path
from typing import List, Set

from PyQt6.QtCore import Qt
from PyQt6.QtWidgets import (
    QApplication,
    QMainWindow,
    QWidget,
    QVBoxLayout,
    QHBoxLayout,
    QGridLayout,
    QPushButton,
    QListWidget,
    QListWidgetItem,
    QFileDialog,
    QMessageBox,
    QLabel,
    QTabWidget,
    QSpinBox,
    QLineEdit,
    QGroupBox,
    QAbstractItemView,
)

# Intentamos importar pypdf (recomendado); si no está, usamos PyPDF2.
PdfMerger = None
PdfReader = None
PdfWriter = None
_import_error = None

try:
    from pypdf import PdfMerger as _PdfMerger, PdfReader as _PdfReader, PdfWriter as _PdfWriter  # type: ignore
    PdfMerger = _PdfMerger
    PdfReader = _PdfReader
    PdfWriter = _PdfWriter
except Exception as e1:
    try:
        from PyPDF2 import PdfMerger as _PdfMerger, PdfReader as _PdfReader, PdfWriter as _PdfWriter  # type: ignore
        PdfMerger = _PdfMerger
        PdfReader = _PdfReader
        PdfWriter = _PdfWriter
    except Exception as e2:
        _import_error = (e1, e2)


def parse_page_ranges(range_str: str, max_pages: int) -> Set[int]:
    """
    Parsea cadenas como '1-3, 5, 8-10' y devuelve un conjunto de índices de página (0-indexed).
    """
    pages: Set[int] = set()
    parts = range_str.split(',')
    for part in parts:
        part = part.strip()
        if not part:
            continue
        if '-' in part:
            subparts = part.split('-')
            if len(subparts) == 2:
                try:
                    start = int(subparts[0].strip())
                    end = int(subparts[1].strip())
                    if start > end:
                        start, end = end, start
                    for p in range(start, end + 1):
                        if 1 <= p <= max_pages:
                            pages.add(p - 1)
                except ValueError:
                    pass
        else:
            try:
                p = int(part)
                if 1 <= p <= max_pages:
                    pages.add(p - 1)
            except ValueError:
                pass
    return pages


class PDFCombinerApp(QMainWindow):
    def __init__(self) -> None:
        super().__init__()
        self.setWindowTitle("Herramientas PDF - Combinar y Cortar")
        self.resize(720, 560)

        # Variables de estado
        self.pdf_files_to_merge: List[str] = []
        self.cut_pdf_path: str = ""
        self.cut_total_pages: int = 0
        self.updating_checkboxes: bool = False

        self.init_ui()

    def init_ui(self) -> None:
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QVBoxLayout(central_widget)

        # Tabs principales
        self.tabs = QTabWidget()
        main_layout.addWidget(self.tabs)

        # Crear Pestañas
        self.tab_merge = QWidget()
        self.tab_cut = QWidget()

        self.tabs.addTab(self.tab_merge, "Combinar PDFs")
        self.tabs.addTab(self.tab_cut, "Cortar / Dividir PDF")

        self.setup_merge_tab()
        self.setup_cut_tab()

    # -------------------------------------------------------------------------
    # TAB 1: COMBINAR PDFs
    # -------------------------------------------------------------------------
    def setup_merge_tab(self) -> None:
        layout = QVBoxLayout(self.tab_merge)

        self.info_merge_label = QLabel("Archivos seleccionados para combinar (se unirán en el orden mostrado):")
        layout.addWidget(self.info_merge_label)

        self.list_merge_widget = QListWidget()
        self.list_merge_widget.setSelectionMode(QAbstractItemView.SelectionMode.SingleSelection)
        layout.addWidget(self.list_merge_widget)

        # Botones de orden y eliminación
        reorder_layout = QHBoxLayout()
        self.btn_move_up = QPushButton("Subir")
        self.btn_move_up.clicked.connect(self.move_up)
        reorder_layout.addWidget(self.btn_move_up)

        self.btn_move_down = QPushButton("Bajar")
        self.btn_move_down.clicked.connect(self.move_down)
        reorder_layout.addWidget(self.btn_move_down)

        self.btn_remove = QPushButton("Quitar seleccionado")
        self.btn_remove.clicked.connect(self.remove_selected_merge)
        reorder_layout.addWidget(self.btn_remove)

        self.btn_clear_merge = QPushButton("Limpiar lista")
        self.btn_clear_merge.clicked.connect(self.clear_merge_list)
        reorder_layout.addWidget(self.btn_clear_merge)

        layout.addLayout(reorder_layout)

        # Botones de acción principales
        buttons_layout = QHBoxLayout()

        self.btn_add = QPushButton("Añadir archivos PDF")
        self.btn_add.clicked.connect(self.add_pdfs)
        buttons_layout.addWidget(self.btn_add)

        self.btn_merge = QPushButton("Combinar archivos PDF")
        self.btn_merge.setEnabled(False)
        self.btn_merge.setStyleSheet("font-weight: bold; background-color: #2b5b84; color: white;")
        self.btn_merge.clicked.connect(self.merge_pdfs)
        buttons_layout.addWidget(self.btn_merge)

        layout.addLayout(buttons_layout)

    def add_pdfs(self) -> None:
        files, _ = QFileDialog.getOpenFileNames(
            self,
            "Seleccionar archivos PDF",
            "",
            "Archivos PDF (*.pdf)",
        )
        if not files:
            return

        for f in files:
            if f not in self.pdf_files_to_merge:
                self.pdf_files_to_merge.append(f)

        self.refresh_merge_list()

    def refresh_merge_list(self) -> None:
        self.list_merge_widget.clear()
        for idx, file_path in enumerate(self.pdf_files_to_merge, start=1):
            self.list_merge_widget.addItem(f"{idx}. {Path(file_path).name}  ({file_path})")

        self.btn_merge.setEnabled(len(self.pdf_files_to_merge) > 0)

    def move_up(self) -> None:
        current_row = self.list_merge_widget.currentRow()
        if current_row > 0:
            self.pdf_files_to_merge[current_row], self.pdf_files_to_merge[current_row - 1] = (
                self.pdf_files_to_merge[current_row - 1],
                self.pdf_files_to_merge[current_row],
            )
            self.refresh_merge_list()
            self.list_merge_widget.setCurrentRow(current_row - 1)

    def move_down(self) -> None:
        current_row = self.list_merge_widget.currentRow()
        if 0 <= current_row < len(self.pdf_files_to_merge) - 1:
            self.pdf_files_to_merge[current_row], self.pdf_files_to_merge[current_row + 1] = (
                self.pdf_files_to_merge[current_row + 1],
                self.pdf_files_to_merge[current_row],
            )
            self.refresh_merge_list()
            self.list_merge_widget.setCurrentRow(current_row + 1)

    def remove_selected_merge(self) -> None:
        current_row = self.list_merge_widget.currentRow()
        if 0 <= current_row < len(self.pdf_files_to_merge):
            self.pdf_files_to_merge.pop(current_row)
            self.refresh_merge_list()

    def clear_merge_list(self) -> None:
        self.pdf_files_to_merge.clear()
        self.refresh_merge_list()

    def merge_pdfs(self) -> None:
        if _import_error is not None or PdfMerger is None:
            QMessageBox.critical(
                self,
                "Dependencia faltante",
                "No se encontró la librería 'pypdf' ni 'PyPDF2'.\n\n"
                "Instala una con:\n"
                "pip install pypdf"
            )
            return

        if not self.pdf_files_to_merge:
            QMessageBox.warning(self, "Sin archivos", "Primero añade uno o más archivos PDF.")
            return

        save_path, _ = QFileDialog.getSaveFileName(
            self,
            "Guardar PDF combinado",
            "PDF_combinado.pdf",
            "Archivos PDF (*.pdf)",
        )
        if not save_path:
            return

        if not save_path.lower().endswith(".pdf"):
            save_path += ".pdf"

        merger = PdfMerger()
        try:
            if hasattr(merger, "_writer") and merger._writer is not None:
                merger._writer.page_layout = "/OneColumn"
            elif hasattr(merger, "page_layout"):
                merger.page_layout = "/OneColumn"
        except Exception:
            pass

        try:
            for pdf in self.pdf_files_to_merge:
                merger.append(pdf)

            with open(save_path, "wb") as out_file:
                merger.write(out_file)

            QMessageBox.information(
                self,
                "Completado",
                f"El archivo PDF combinado se guardó correctamente en:\n{save_path}",
            )
        except Exception as e:
            QMessageBox.critical(
                self,
                "Error al combinar",
                f"No se pudieron combinar los archivos.\n\nDetalle:\n{e}",
            )
        finally:
            try:
                merger.close()
            except Exception:
                pass

    # -------------------------------------------------------------------------
    # TAB 2: CORTAR / DIVIDIR PDF
    # -------------------------------------------------------------------------
    def setup_cut_tab(self) -> None:
        layout = QVBoxLayout(self.tab_cut)

        # Selección de archivo fuente
        top_layout = QHBoxLayout()
        self.btn_open_cut_pdf = QPushButton("Abrir PDF para cortar")
        self.btn_open_cut_pdf.clicked.connect(self.open_cut_pdf)
        top_layout.addWidget(self.btn_open_cut_pdf)

        self.lbl_cut_file_info = QLabel("No se ha cargado ningún archivo PDF.")
        self.lbl_cut_file_info.setStyleSheet("font-weight: bold; color: #555;")
        top_layout.addWidget(self.lbl_cut_file_info, stretch=1)

        layout.addLayout(top_layout)

        # Grupo de opciones de selección de páginas
        group_selection = QGroupBox("Opciones de Selección de Sección / Páginas")
        group_layout = QVBoxLayout(group_selection)

        # Rango rápido (Desde - Hasta)
        range_layout = QHBoxLayout()
        range_layout.addWidget(QLabel("Desde página:"))
        self.spin_from = QSpinBox()
        self.spin_from.setMinimum(1)
        self.spin_from.setEnabled(False)
        range_layout.addWidget(self.spin_from)

        range_layout.addWidget(QLabel("Hasta página:"))
        self.spin_to = QSpinBox()
        self.spin_to.setMinimum(1)
        self.spin_to.setEnabled(False)
        range_layout.addWidget(self.spin_to)

        self.btn_apply_range = QPushButton("Seleccionar Rango")
        self.btn_apply_range.setEnabled(False)
        self.btn_apply_range.clicked.connect(self.apply_spin_range)
        range_layout.addWidget(self.btn_apply_range)

        group_layout.addLayout(range_layout)

        # Expresión de texto (ej. 1-3, 5, 8-10)
        custom_layout = QHBoxLayout()
        custom_layout.addWidget(QLabel("Escribir rango personalizado:"))
        self.txt_range = QLineEdit()
        self.txt_range.setPlaceholderText("Ejemplo: 1-4, 7, 10-12")
        self.txt_range.setEnabled(False)
        custom_layout.addWidget(self.txt_range)

        self.btn_apply_custom_range = QPushButton("Aplicar Texto")
        self.btn_apply_custom_range.setEnabled(False)
        self.btn_apply_custom_range.clicked.connect(self.apply_custom_text_range)
        custom_layout.addWidget(self.btn_apply_custom_range)

        group_layout.addLayout(custom_layout)

        layout.addWidget(group_selection)

        # Lista visual de páginas con casillas de verificación
        list_header_layout = QHBoxLayout()
        self.lbl_selected_count = QLabel("Páginas seleccionadas: 0 de 0")
        list_header_layout.addWidget(self.lbl_selected_count)

        self.btn_select_all = QPushButton("Seleccionar todas")
        self.btn_select_all.setEnabled(False)
        self.btn_select_all.clicked.connect(self.select_all_pages)
        list_header_layout.addWidget(self.btn_select_all)

        self.btn_deselect_all = QPushButton("Deseleccionar todas")
        self.btn_deselect_all.setEnabled(False)
        self.btn_deselect_all.clicked.connect(self.deselect_all_pages)
        list_header_layout.addWidget(self.btn_deselect_all)

        layout.addLayout(list_header_layout)

        self.list_pages_widget = QListWidget()
        self.list_pages_widget.itemChanged.connect(self.on_page_item_changed)
        layout.addWidget(self.list_pages_widget)

        # Botón para guardar la sección cortada
        self.btn_save_cut = QPushButton("Guardar Sección Seleccionada como Nuevo PDF")
        self.btn_save_cut.setEnabled(False)
        self.btn_save_cut.setStyleSheet("font-weight: bold; background-color: #2b845b; color: white; padding: 6px;")
        self.btn_save_cut.clicked.connect(self.save_cut_pdf)
        layout.addWidget(self.btn_save_cut)

    def open_cut_pdf(self) -> None:
        file_path, _ = QFileDialog.getOpenFileName(
            self,
            "Seleccionar archivo PDF para cortar",
            "",
            "Archivos PDF (*.pdf)",
        )
        if not file_path:
            return

        if _import_error is not None or PdfReader is None:
            QMessageBox.critical(
                self,
                "Dependencia faltante",
                "No se encontró la librería 'pypdf' ni 'PyPDF2'.\n\n"
                "Instala una con:\n"
                "pip install pypdf"
            )
            return

        try:
            reader = PdfReader(file_path)
            total_pages = len(reader.pages)
            if total_pages == 0:
                QMessageBox.warning(self, "PDF Vacío", "El archivo PDF seleccionado no contiene páginas.")
                return

            self.cut_pdf_path = file_path
            self.cut_total_pages = total_pages

            self.lbl_cut_file_info.setText(
                f"Archivo: {Path(file_path).name} | Total páginas: {total_pages}"
            )

            # Habilitar controles
            self.spin_from.setEnabled(True)
            self.spin_from.setMaximum(total_pages)
            self.spin_from.setValue(1)

            self.spin_to.setEnabled(True)
            self.spin_to.setMaximum(total_pages)
            self.spin_to.setValue(total_pages)

            self.btn_apply_range.setEnabled(True)
            self.txt_range.setEnabled(True)
            self.btn_apply_custom_range.setEnabled(True)
            self.btn_select_all.setEnabled(True)
            self.btn_deselect_all.setEnabled(True)

            # Llenar la lista de páginas
            self.populate_pages_list(total_pages)

        except Exception as e:
            QMessageBox.critical(
                self,
                "Error al abrir PDF",
                f"No se pudo leer el archivo PDF.\n\nDetalle:\n{e}"
            )

    def populate_pages_list(self, total_pages: int) -> None:
        self.updating_checkboxes = True
        self.list_pages_widget.clear()

        for i in range(1, total_pages + 1):
            item = QListWidgetItem(f"Página {i}")
            item.setFlags(item.flags() | Qt.ItemFlag.ItemIsUserCheckable)
            item.setCheckState(Qt.CheckState.Checked)  # Marcadas por defecto
            self.list_pages_widget.addItem(item)

        self.updating_checkboxes = False
        self.update_selected_count()

    def on_page_item_changed(self, item: QListWidgetItem) -> None:
        if not self.updating_checkboxes:
            self.update_selected_count()

    def update_selected_count(self) -> None:
        selected_indices = self.get_selected_page_indices()
        count = len(selected_indices)
        self.lbl_selected_count.setText(f"Páginas seleccionadas: {count} de {self.cut_total_pages}")
        self.btn_save_cut.setEnabled(count > 0 and self.cut_total_pages > 0)

    def get_selected_page_indices(self) -> List[int]:
        selected = []
        for row in range(self.list_pages_widget.count()):
            item = self.list_pages_widget.item(row)
            if item and item.checkState() == Qt.CheckState.Checked:
                selected.append(row)  # 0-indexed
        return selected

    def select_all_pages(self) -> None:
        self.updating_checkboxes = True
        for row in range(self.list_pages_widget.count()):
            item = self.list_pages_widget.item(row)
            if item:
                item.setCheckState(Qt.CheckState.Checked)
        self.updating_checkboxes = False
        self.update_selected_count()

    def deselect_all_pages(self) -> None:
        self.updating_checkboxes = True
        for row in range(self.list_pages_widget.count()):
            item = self.list_pages_widget.item(row)
            if item:
                item.setCheckState(Qt.CheckState.Unchecked)
        self.updating_checkboxes = False
        self.update_selected_count()

    def apply_spin_range(self) -> None:
        start_p = self.spin_from.value()
        end_p = self.spin_to.value()

        if start_p > end_p:
            start_p, end_p = end_p, start_p
            self.spin_from.setValue(start_p)
            self.spin_to.setValue(end_p)

        self.updating_checkboxes = True
        for row in range(self.list_pages_widget.count()):
            page_num = row + 1
            item = self.list_pages_widget.item(row)
            if item:
                if start_p <= page_num <= end_p:
                    item.setCheckState(Qt.CheckState.Checked)
                else:
                    item.setCheckState(Qt.CheckState.Unchecked)

        self.updating_checkboxes = False
        self.update_selected_count()

    def apply_custom_text_range(self) -> None:
        text = self.txt_range.text().strip()
        if not text:
            QMessageBox.warning(self, "Campo vacío", "Escribe un rango como '1-3, 5, 8-10'.")
            return

        selected_indices = parse_page_ranges(text, self.cut_total_pages)
        if not selected_indices:
            QMessageBox.warning(self, "Rango inválido", f"No se reconocieron páginas válidas en el rango (1 a {self.cut_total_pages}).")
            return

        self.updating_checkboxes = True
        for row in range(self.list_pages_widget.count()):
            item = self.list_pages_widget.item(row)
            if item:
                if row in selected_indices:
                    item.setCheckState(Qt.CheckState.Checked)
                else:
                    item.setCheckState(Qt.CheckState.Unchecked)

        self.updating_checkboxes = False
        self.update_selected_count()

    def save_cut_pdf(self) -> None:
        if not self.cut_pdf_path or _import_error is not None or PdfReader is None or PdfWriter is None:
            QMessageBox.critical(self, "Error", "No hay un PDF cargado o falta la librería pypdf/PyPDF2.")
            return

        selected_indices = self.get_selected_page_indices()
        if not selected_indices:
            QMessageBox.warning(self, "Sin páginas", "Debes seleccionar al menos una página para guardar.")
            return

        default_name = f"{Path(self.cut_pdf_path).stem}_cortado.pdf"
        save_path, _ = QFileDialog.getSaveFileName(
            self,
            "Guardar sección seleccionada del PDF",
            default_name,
            "Archivos PDF (*.pdf)",
        )
        if not save_path:
            return

        if not save_path.lower().endswith(".pdf"):
            save_path += ".pdf"

        try:
            reader = PdfReader(self.cut_pdf_path)
            writer = PdfWriter()

            # Configurar diseño en modo una columna continua (/OneColumn)
            # Esto le indica a Adobe Reader que active la barra de desplazamiento continuo
            try:
                writer.page_layout = "/OneColumn"
                writer.page_mode = "/UseNone"
            except Exception:
                pass

            for idx in selected_indices:
                writer.add_page(reader.pages[idx])

            with open(save_path, "wb") as out_file:
                writer.write(out_file)

            QMessageBox.information(
                self,
                "Sección guardada",
                f"Se han extraído {len(selected_indices)} páginas exitosamente en:\n{save_path}",
            )
        except Exception as e:
            QMessageBox.critical(
                self,
                "Error al guardar",
                f"No se pudo generar el nuevo PDF.\n\nDetalle:\n{e}"
            )


def main() -> None:
    app = QApplication(sys.argv)
    window = PDFCombinerApp()
    window.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
