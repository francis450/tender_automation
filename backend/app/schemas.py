from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class SectionBase(BaseModel):
    title: str
    content: Optional[str] = None
    order: int

class SectionCreate(SectionBase):
    pass

class Section(SectionBase):
    id: int
    document_id: int

    class Config:
        from_attributes = True

class DocumentBase(BaseModel):
    filename: str

class DocumentCreate(DocumentBase):
    content: str

class Document(DocumentBase):
    id: int
    created_at: datetime
    sections: List[Section] = []

    class Config:
        from_attributes = True

class DraftBase(BaseModel):
    content: str

class DraftCreate(DraftBase):
    section_id: int

class Draft(DraftBase):
    id: int
    section_id: int
    created_at: datetime

    class Config:
        from_attributes = True
