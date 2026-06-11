from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    sections = relationship("Section", back_populates="document")

class Section(Base):
    __tablename__ = "sections"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    title = Column(String, index=True)
    content = Column(Text)
    order = Column(Integer)

    document = relationship("Document", back_populates="sections")
    drafts = relationship("Draft", back_populates="section")

class Draft(Base):
    __tablename__ = "drafts"

    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(Integer, ForeignKey("sections.id"))
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    section = relationship("Section", back_populates="drafts")
