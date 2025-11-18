from sqlalchemy import Column, String, Integer, Text, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class TranslationStatus(str, enum.Enum):
    draft = "draft"
    approved = "approved"
    translator_assigned = "translator_assigned"
    trial_translation = "trial_translation"
    trial_reviewed = "trial_reviewed"
    in_progress = "in_progress"
    progress_checked = "progress_checked"
    completed = "completed"
    cancelled = "cancelled"

class Priority(str, enum.Enum):
    low = "low"
    normal = "normal"
    high = "high"
    urgent = "urgent"

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    email = Column(String, unique=True)
    full_name = Column(String, nullable=False)
    role = Column(String)
    avatar = Column(String)
    phone = Column(String)
    bio = Column(Text)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    works_as_translator = relationship("Work", foreign_keys="Work.translator_id", back_populates="translator")
    created_works = relationship("Work", foreign_keys="Work.created_by_id", back_populates="creator")

class Work(Base):
    __tablename__ = "works"
    
    id = Column(String, primary_key=True)
    name = Column(Text, nullable=False)
    author = Column(Text)
    source_language = Column(String, default="Hán văn")
    target_language = Column(String, default="Tiếng Việt")
    page_count = Column(Integer, default=0)
    word_count = Column(Integer, default=0)
    description = Column(Text)
    translation_part_id = Column(String)
    translator_id = Column(String, ForeignKey("users.id"))
    
    # Status tracking
    translation_status = Column(SQLEnum(TranslationStatus), default=TranslationStatus.draft)
    priority = Column(SQLEnum(Priority), default=Priority.normal)
    translation_progress = Column(Integer, default=0)
    notes = Column(Text)
    active = Column(Boolean, default=True)
    created_by_id = Column(String, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    translator = relationship("User", foreign_keys=[translator_id], back_populates="works_as_translator")
    creator = relationship("User", foreign_keys=[created_by_id], back_populates="created_works")
    contracts = relationship("Contract", back_populates="work")

class Contract(Base):
    __tablename__ = "contracts"
    
    id = Column(String, primary_key=True)
    contract_number = Column(String, unique=True, nullable=False)
    work_id = Column(String, ForeignKey("works.id"), nullable=False)
    translator_id = Column(String, ForeignKey("users.id"), nullable=False)
    total_amount = Column(Integer, nullable=False)
    signed_date = Column(DateTime(timezone=True))
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    status = Column(String, default="draft")
    terms = Column(Text)
    notes = Column(Text)
    created_by_id = Column(String, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    work = relationship("Work", back_populates="contracts")

