from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Contract

router = APIRouter()

@router.get("/")
async def list_contracts(
    db: Session = Depends(get_db)
):
    """List all contracts"""
    contracts = db.query(Contract).all()
    return {"items": contracts, "total": len(contracts)}

