from fastapi import APIRouter, Depends
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from ..auth import require_worker
from ..database import get_db
from ..models import Listing, Swipe, SwipeDirection, User, WorkerFilter
from ..schemas import ListingResponse, SwipeRequest, SwipeResponse

router = APIRouter(tags=["feed"])


@router.get("/feed", response_model=list[ListingResponse])
def get_feed(db: Session = Depends(get_db), user: User = Depends(require_worker)):
    worker_id = user.worker_profile.id
    worker_filter = db.query(WorkerFilter).filter(WorkerFilter.worker_id == worker_id).first()

    already_swiped_ids = [s.listing_id for s in db.query(Swipe).filter(Swipe.worker_id == worker_id).all()]

    query = db.query(Listing).filter(Listing.is_active.is_(True))
    if already_swiped_ids:
        query = query.filter(Listing.id.notin_(already_swiped_ids))

    if worker_filter:
        if worker_filter.location:
            query = query.filter(Listing.location == worker_filter.location)
        if worker_filter.pay_min is not None:
            query = query.filter(Listing.pay_amount >= worker_filter.pay_min)
        if worker_filter.schedule_type:
            query = query.filter(Listing.schedule_type == worker_filter.schedule_type)
        if worker_filter.period_start:
            query = query.filter(Listing.period_end >= worker_filter.period_start)
        if worker_filter.period_end:
            query = query.filter(Listing.period_start <= worker_filter.period_end)
        if worker_filter.keywords:
            pattern = f"%{worker_filter.keywords.lower()}%"
            query = query.filter(
                or_(Listing.title.ilike(pattern), Listing.description.ilike(pattern))
            )

    return query.order_by(Listing.created_at.desc()).all()


@router.post("/swipe", response_model=SwipeResponse)
def swipe(payload: SwipeRequest, db: Session = Depends(get_db), user: User = Depends(require_worker)):
    worker_id = user.worker_profile.id
    existing = (
        db.query(Swipe)
        .filter(Swipe.worker_id == worker_id, Swipe.listing_id == payload.listing_id)
        .first()
    )
    if existing:
        existing.direction = payload.direction
    else:
        db.add(Swipe(worker_id=worker_id, listing_id=payload.listing_id, direction=payload.direction))
    db.commit()

    return SwipeResponse(
        listing_id=payload.listing_id,
        direction=payload.direction,
        is_match=payload.direction == SwipeDirection.MATCH,
    )
