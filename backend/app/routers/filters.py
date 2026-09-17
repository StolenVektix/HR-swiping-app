from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..auth import require_worker
from ..database import get_db
from ..models import User, WorkerFilter
from ..schemas import WorkerFilterResponse, WorkerFilterUpdate

router = APIRouter(prefix="/worker/filter", tags=["filters"])


def _get_or_create_filter(db: Session, user: User) -> WorkerFilter:
    existing = db.query(WorkerFilter).filter(WorkerFilter.worker_id == user.worker_profile.id).first()
    if existing:
        return existing
    created = WorkerFilter(worker_id=user.worker_profile.id)
    db.add(created)
    db.commit()
    db.refresh(created)
    return created


@router.get("", response_model=WorkerFilterResponse)
def get_filter(db: Session = Depends(get_db), user: User = Depends(require_worker)):
    return _get_or_create_filter(db, user)


@router.put("", response_model=WorkerFilterResponse)
def update_filter(
    payload: WorkerFilterUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_worker),
):
    worker_filter = _get_or_create_filter(db, user)
    for field, value in payload.model_dump().items():
        setattr(worker_filter, field, value)
    db.commit()
    db.refresh(worker_filter)
    return worker_filter
