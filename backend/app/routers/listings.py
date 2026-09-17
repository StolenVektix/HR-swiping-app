from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import require_employer
from ..database import get_db
from ..models import Listing, User
from ..schemas import ListingCreate, ListingResponse, ListingUpdate

router = APIRouter(prefix="/listings", tags=["listings"])


@router.get("", response_model=list[ListingResponse])
def list_my_listings(db: Session = Depends(get_db), user: User = Depends(require_employer)):
    return (
        db.query(Listing)
        .filter(Listing.employer_id == user.employer_profile.id)
        .order_by(Listing.created_at.desc())
        .all()
    )


@router.post("", response_model=ListingResponse)
def create_listing(payload: ListingCreate, db: Session = Depends(get_db), user: User = Depends(require_employer)):
    listing = Listing(employer_id=user.employer_profile.id, **payload.model_dump())
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing


def _get_owned_listing(listing_id: int, db: Session, user: User) -> Listing:
    listing = db.get(Listing, listing_id)
    if not listing or listing.employer_id != user.employer_profile.id:
        raise HTTPException(status_code=404, detail="Annonce introuvable")
    return listing


@router.patch("/{listing_id}", response_model=ListingResponse)
def update_listing(
    listing_id: int,
    payload: ListingUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_employer),
):
    listing = _get_owned_listing(listing_id, db, user)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(listing, field, value)
    db.commit()
    db.refresh(listing)
    return listing


@router.delete("/{listing_id}")
def delete_listing(listing_id: int, db: Session = Depends(get_db), user: User = Depends(require_employer)):
    listing = _get_owned_listing(listing_id, db, user)
    db.delete(listing)
    db.commit()
    return {"ok": True}
