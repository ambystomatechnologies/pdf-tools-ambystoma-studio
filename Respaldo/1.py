#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
App PyQt6 para combinar archivos PDF.
- Botón "Añadir archivos PDF"
- Botón "Combianar archivos PDF" (tal como fue solicitado)
- Permite elegir dónde guardar el PDF combinado
"""

import sys
from pathlib import Path
from PyQt6.QtWidgets import (
    QApplication,
    QMainWindow,
    QWidget,
    QVBoxLayout,
    QHBoxLayout,
    QPushButton,
    QListWidget,
    QFileDialog,
    QMessageBox,
    QLabel,
)

# Intentamos importar pypdf (recomendado); si no está, usamos PyPDF2.
PdfMerger = None
_import_error = None

try:
    from pypdf import PdfMerger as _PdfMerger  # type: ignore
    PdfMerger = _PdfMerger
except Exception as e1:
    try:
        from PyPDF2 import PdfMerger as _PdfMerger  # type: ignore
        PdfMerger = _PdfMerger
    except Exception as e2:
        _import_error = (e1, e2)


class PDFCombinerWindow(QMainWindow):
    def __init__(self) -> None:
        super().__init__()
        self.setWindowTitle("Combinador de PDF (PyQt6)")
        self.resize(650, 420)

        self.pdf_files: list[str] = []

        central = QWidget()
        self.setCentralWidget(central)
        main_layout = QVBoxLayout(central)

        self.info_label = QLabel("Archivos seleccionados (en orden de combinación):")
        main_layout.addWidget(self.info_label)

        self.list_widget = QListWidget()
        main_layout.addWidget(self.list_widget)

        buttons_layout = QHBoxLayout()

        self.btn_add = QPushButton("Añadir archivos PDF")
        self.btn_add.clicked.connect(self.add_pdfs)
        buttons_layout.addWidget(self.btn_add)

        self.btn_merge = QPushButton("Combianar archivos PDF")
        self.btn_merge.setEnabled(False)
        self.btn_merge.clicked.connect(self.merge_pdfs)
        buttons_layout.addWidget(self.btn_merge)

        main_layout.addLayout(buttons_layout)

    def add_pdfs(self) -> None:
        files, _ = QFileDialog.getOpenFileNames(
            self,
            "Seleccionar archivos PDF",
            "",
            "Archivos PDF (*.pdf)",
        )

        if not files:
            return

        # Agregar sin duplicados, respetando orden de selección
        for f in files:
            if f not in self.pdf_files:
                self.pdf_files.append(f)

        self.refresh_list()
        self.btn_merge.setEnabled(len(self.pdf_files) > 0)

    def refresh_list(self) -> None:
        self.list_widget.clear()
        for idx, file_path in enumerate(self.pdf_files, start=1):
            self.list_widget.addItem(f"{idx}. {Path(file_path).name}")

    def merge_pdfs(self) -> None:
        if _import_error is not None or PdfMerger is None:
            QMessageBox.critical(
                self,
                "Dependencia faltante",
                "No se encontró una librería para combinar PDF.\n\n"
                "Instala una de estas opciones:\n"
                "pip install pypdf\n"
                "o\n"
                "pip install PyPDF2"
            )
            return

        if not self.pdf_files:
            QMessageBox.warning(self, "Sin archivos", "Primero añade uno o más PDF.")
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
            for pdf in self.pdf_files:
                merger.append(pdf)

            with open(save_path, "wb") as out_file:
                merger.write(out_file)

            QMessageBox.information(
                self,
                "Completado",
                f"PDF combinado guardado en:\n{save_path}",
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


def main() -> None:
    app = QApplication(sys.argv)
    window = PDFCombinerWindow()
    window.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
