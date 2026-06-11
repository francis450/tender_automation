from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import os

from . import models, schemas, database, parser
from .database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="PropelProposal API")

@app.get("/")
def read_root():
    return {"message": "Welcome to PropelProposal API"}

@app.post("/upload/", response_model=schemas.Document)
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = ""
    file_content = await file.read()
    
    if file.filename.endswith(".pdf"):
        content = parser.parse_pdf(file_content)
    elif file.filename.endswith(".docx"):
        content = parser.parse_docx(file_content)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type")
    
    db_document = models.Document(filename=file.filename, content=content)
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    
    # Identify and save sections
    sections_data = parser.identify_sections(content)
    for sec in sections_data:
        db_section = models.Section(
            document_id=db_document.id,
            title=sec["title"],
            content=sec["content"],
            order=sec["order"]
        )
        db.add(db_section)
    
    db.commit()
    db.refresh(db_document)
    
    return db_document

@app.get("/documents/", response_model=List[schemas.Document])
def get_documents(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return db.query(models.Document).offset(skip).limit(limit).all()

@app.get("/documents/{document_id}", response_model=schemas.Document)
def get_document(document_id: int, db: Session = Depends(get_db)):
    db_document = db.query(models.Document).filter(models.Document.id == document_id).first()
    if db_document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return db_document

@app.get("/sections/{section_id}", response_model=schemas.Section)
def get_section(section_id: int, db: Session = Depends(get_db)):
    db_section = db.query(models.Section).filter(models.Section.id == section_id).first()
    if db_section is None:
        raise HTTPException(status_code=404, detail="Section not found")
    return db_section
