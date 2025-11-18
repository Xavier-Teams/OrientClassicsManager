from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List
from app.database import get_db
from app.models import Work, User, TranslationStatus, Priority
from app.schemas import WorkCreate, WorkUpdate, WorkResponse, WorkListResponse, UserSimple

router = APIRouter()

def get_user_simple(user: User) -> Optional[UserSimple]:
    if not user:
        return None
    return UserSimple(
        id=user.id,
        full_name=user.full_name,
        email=user.email
    )

@router.get("/", response_model=WorkListResponse)
async def list_works(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[TranslationStatus] = None,
    priority: Optional[Priority] = None,
    translator_id: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all works with pagination and filters"""
    query = db.query(Work).filter(Work.active == True)
    
    # Apply filters
    if status:
        query = query.filter(Work.translation_status == status)
    if priority:
        query = query.filter(Work.priority == priority)
    if translator_id:
        query = query.filter(Work.translator_id == translator_id)
    if search:
        search_filter = or_(
            Work.name.ilike(f"%{search}%"),
            Work.author.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * page_size
    works = query.order_by(Work.created_at.desc()).offset(offset).limit(page_size).all()
    
    # Load relationships
    for work in works:
        if work.translator_id:
            work.translator = db.query(User).filter(User.id == work.translator_id).first()
    
    return WorkListResponse(
        items=[WorkResponse.model_validate(work) for work in works],
        total=total,
        page=page,
        page_size=page_size
    )

@router.get("/board", response_model=dict)
async def get_works_board(
    db: Session = Depends(get_db)
):
    """Get works organized by status for board view"""
    works = db.query(Work).filter(Work.active == True).all()
    
    # Load translators
    for work in works:
        if work.translator_id:
            work.translator = db.query(User).filter(User.id == work.translator_id).first()
    
    # Group by status
    board_data = {}
    for status in TranslationStatus:
        status_works = [w for w in works if w.translation_status == status]
        board_data[status.value] = [WorkResponse.model_validate(w) for w in status_works]
    
    return board_data

@router.get("/{work_id}", response_model=WorkResponse)
async def get_work(
    work_id: str,
    db: Session = Depends(get_db)
):
    """Get a single work by ID"""
    work = db.query(Work).filter(Work.id == work_id, Work.active == True).first()
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")
    
    # Load translator
    if work.translator_id:
        work.translator = db.query(User).filter(User.id == work.translator_id).first()
    
    return WorkResponse.model_validate(work)

@router.post("/", response_model=WorkResponse, status_code=201)
async def create_work(
    work: WorkCreate,
    db: Session = Depends(get_db)
):
    """Create a new work"""
    import uuid
    work_id = str(uuid.uuid4())
    
    db_work = Work(
        id=work_id,
        **work.model_dump()
    )
    db.add(db_work)
    db.commit()
    db.refresh(db_work)
    
    # Load translator if exists
    if db_work.translator_id:
        db_work.translator = db.query(User).filter(User.id == db_work.translator_id).first()
    
    return WorkResponse.model_validate(db_work)

@router.patch("/{work_id}", response_model=WorkResponse)
async def update_work(
    work_id: str,
    work_update: WorkUpdate,
    db: Session = Depends(get_db)
):
    """Update a work"""
    work = db.query(Work).filter(Work.id == work_id, Work.active == True).first()
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")
    
    # Update fields
    update_data = work_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(work, field, value)
    
    db.commit()
    db.refresh(work)
    
    # Load translator if exists
    if work.translator_id:
        work.translator = db.query(User).filter(User.id == work.translator_id).first()
    
    return WorkResponse.model_validate(work)

@router.delete("/{work_id}", status_code=204)
async def delete_work(
    work_id: str,
    db: Session = Depends(get_db)
):
    """Soft delete a work"""
    work = db.query(Work).filter(Work.id == work_id).first()
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")
    
    work.active = False
    db.commit()
    return None

