import os
import json
import yaml
import xml.etree.ElementTree as ET
import io
import csv

from docx import Document
from pptx import Presentation
from openpyxl import load_workbook
from odf.opendocument import load as odf_load
from odf.text import P
from odf import teletype
from PyPDF2 import PdfReader

def extract_text_from_file(file_stream, filename: str) -> str:
    """Extrai texto de praticamente qualquer formato relevante para contratos."""

    ext = os.path.splitext(filename)[1].lower().replace('.', '')

    if ext == "txt" or ext == "md":
        return file_stream.read().decode("utf-8", errors="ignore")

    if ext == "csv":
        return _extract_csv(file_stream)

    if ext == "pdf":
        return _extract_pdf(file_stream)

    if ext == "rtf":
        return _extract_rtf(file_stream)

    if ext in ["doc", "docx"]:
        return _extract_docx(file_stream)

    if ext == "odt":
        return _extract_odt(file_stream)

    if ext == "pptx":
        return _extract_pptx(file_stream)

    if ext == "xlsx":
        return _extract_xlsx(file_stream)

    if ext == "html":
        return _extract_html(file_stream)

    if ext == "xml":
        return _extract_xml(file_stream)

    if ext == "json":
        return json.dumps(json.load(file_stream), ensure_ascii=False, indent=2)

    if ext in ["yaml", "yml"]:
        return yaml.safe_dump(yaml.safe_load(file_stream), allow_unicode=True)

    raise ValueError(f"Formato não suportado: {ext}")

# ------------ HANDLERS -------------

def _extract_pdf(fs):
    reader = PdfReader(fs)
    text = []
    for page in reader.pages:
        t = page.extract_text()
        if t:
            text.append(t)
    return "\n".join(text)


def _extract_csv(fs):
    fs.seek(0)
    decoded = io.StringIO(fs.read().decode("utf-8", errors="ignore"))
    reader = csv.reader(decoded)
    return "\n".join([", ".join(row) for row in reader])


def _extract_rtf(fs):
    try:
        import striprtf
    except ImportError:
        # Se a biblioteca não estiver instalada, retorna erro ou string vazia
        return "Erro: A biblioteca 'striprtf' é necessária para extrair RTF."
        
    return striprtf.rtf_to_text(fs.read().decode("utf-8", errors="ignore"))


def _extract_docx(fs):
    doc = Document(fs)
    return "\n".join([p.text for p in doc.paragraphs])


def _extract_odt(fs):
    odt = odf_load(fs)
    paragraphs = odt.getElementsByType(P)
    return "\n".join([teletype.extractText(p) for p in paragraphs])


def _extract_pptx(fs):
    prs = Presentation(fs)
    texts = []
    for slide in prs.slides:
        for shape in slide.shapes:
            if hasattr(shape, "text"):
                texts.append(shape.text)
    return "\n".join(texts)


def _extract_xlsx(fs):
    wb = load_workbook(fs, data_only=True)
    textos = []
    for sheet in wb.worksheets:
        for row in sheet.iter_rows(values_only=True):
            # Filtra None e converte para string
            row_txt = [str(cell) for cell in row if cell is not None] 
            if row_txt:
                textos.append(" | ".join(row_txt))
    return "\n".join(textos)


def _extract_html(fs):
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(fs.read(), "html.parser")
    # Usa '\n' como separador para melhor legibilidade
    return soup.get_text(separator="\n") 


def _extract_xml(fs):
    tree = ET.parse(fs)
    root = tree.getroot()
    return _xml_recursive_text(root)


def _xml_recursive_text(node):
    text = (node.text or "").strip()
    for child in node:
        text += "\n" + _xml_recursive_text(child)
    return text