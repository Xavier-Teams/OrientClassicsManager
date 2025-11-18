from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models import TranslationStatus, Priority

class WorkBase(BaseModel):
    name: str
    author: Optional[str] = None
    source_language: str = "Hán văn"
    target_language: str = "Tiếng Việt"
    page_count: int = 0
    word_count: int = 0
    description: Optional[str] = None
    translation_part_id: Optional[str] = None
    translator_id: Optional[str] = None
    translation_status: TranslationStatus = TranslationStatus.draft
    priority: Priority = Priority.normal
    translation_progress: int = Field(default=0, ge=0, le=100)
    notes: Optional[str] = None

class WorkCreate(WorkBase):
    pass

class WorkUpdate(BaseModel):
    name: Optional[str] = None
    author: Optional[str] = None
    page_count: Optional[int] = None
    word_count: Optional[int] = None
    description: Optional[str] = None
    translator_id: Optional[str] = None
    translation_status: Optional[TranslationStatus] = None
    priority: Optional[Priority] = None
    translation_progress: Optional[int] = Field(None, ge=0, le=100)
    notes: Optional[str] = None

class UserSimple(BaseModel):
    id: str
    full_name: str
    email: Optional[str] = None
    
    class Config:
        from_attributes = True

class WorkResponse(WorkBase):
    id: str
    created_at: datetime
    updated_at: datetime
    translator: Optional[UserSimple] = None
    
    class Config:
        from_attributes = True

class WorkListResponse(BaseModel):
    items: List[WorkResponse]
    total: int
    page: int
    page_size: int

class UserBase(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: str
    role: Optional[str] = None
    phone: Optional[str] = None

class UserResponse(UserBase):
    id: str
    active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

