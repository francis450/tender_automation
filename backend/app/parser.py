import fitz  # PyMuPDF
from docx import Document as DocxDocument
import io
import re

def parse_pdf(file_content):
    doc = fitz.open(stream=file_content, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def parse_docx(file_content):
    doc = DocxDocument(io.BytesIO(file_content))
    text = ""
    for para in doc.paragraphs:
        text += para.text + "\n"
    return text

def identify_sections(text):
    # Common RFP/TOR section headers
    headers = [
        r"Introduction",
        r"Background",
        r"Scope of Work",
        r"Objectives",
        r"Deliverables",
        r"Timeline",
        r"Qualifications",
        r"Proposal Requirements",
        r"Evaluation Criteria",
        r"Terms and Conditions",
        r"Instructions to Bidders"
    ]
    
    pattern = re.compile(r"^(" + "|".join(headers) + r")", re.IGNORECASE | re.MULTILINE)
    
    matches = list(pattern.finditer(text))
    sections = []
    
    for i in range(len(matches)):
        start = matches[i].start()
        end = matches[i+1].start() if i + 1 < len(matches) else len(text)
        
        title = matches[i].group(0).strip()
        content = text[start:end].strip()
        
        sections.append({
            "title": title,
            "content": content,
            "order": i + 1
        })
    
    return sections
