from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import require_employer, require_worker
from ..database import get_db
from ..models import Listing, Swipe, SwipeDirection, User
from ..schemas import MatchedListing, MatchedWorker

router = APIRouter(tags=["matches"])


@router.get("/listings/{listing_id}/matches", response_model=list[MatchedWorker])
def listing_matches(listing_id: int, db: Session = Depends(get_db), user: User = Depends(require_employer)):
    listing = db.get(Listing, listing_id)
    if not listing or listing.employer_id != user.employer_profile.id:
        raise HTTPException(status_code=404, detail="Annonce introuvable")

    matches = (
        db.query(Swipe)
        .filter(Swipe.listing_id == listing_id, Swipe.direction == SwipeDirection.MATCH)
        .all()
    )

    result = []
    for match in matches:
        worker = match.worker
        result.append(
            MatchedWorker(
                full_name=worker.full_name,
                phone=worker.phone,
                bio=worker.bio,
                email=worker.user.email,
                matched_at=match.created_at,
            )
        )
    return result


@router.get("/worker/matches", response_model=list[MatchedListing])
def my_matches(db: Session = Depends(get_db), user: User = Depends(require_worker)):
    matches = (
        db.query(Swipe)
        .filter(Swipe.worker_id == user.worker_profile.id, Swipe.direction == SwipeDirection.MATCH)
        .order_by(Swipe.created_at.desc())
        .all()
    )

    result = []
    for match in matches:
        result.append(
            MatchedListing(
                listing=match.listing,
                matched_at=match.created_at,
                employer_email=match.listing.employer.user.email,
            )
        )
    return result
