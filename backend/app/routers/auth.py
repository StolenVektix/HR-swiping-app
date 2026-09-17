from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import create_access_token, hash_password, verify_password
from ..database import get_db
from ..models import EmployerProfile, Role, User, WorkerProfile
from ..schemas import LoginRequest, RegisterRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Un compte existe déjà avec cet email")

    if payload.role == Role.EMPLOYER and not payload.company_name:
        raise HTTPException(status_code=400, detail="Le nom de l'entreprise est requis")
    if payload.role == Role.WORKER and not payload.full_name:
        raise HTTPException(status_code=400, detail="Le nom complet est requis")

    user = User(email=payload.email, password_hash=hash_password(payload.password), role=payload.role)
    db.add(user)
    db.flush()

    display_name = payload.email
    if payload.role == Role.EMPLOYER:
        profile = EmployerProfile(
            user_id=user.id,
            company_name=payload.company_name,
            description=payload.description or "",
        )
        display_name = profile.company_name
        db.add(profile)
    else:
        profile = WorkerProfile(
            user_id=user.id,
            full_name=payload.full_name,
            phone=payload.phone or "",
            bio=payload.bio or "",
        )
        display_name = profile.full_name
        db.add(profile)

    db.commit()

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, role=user.role, display_name=display_name)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

    display_name = user.email
    if user.role == Role.EMPLOYER and user.employer_profile:
        display_name = user.employer_profile.company_name
    elif user.role == Role.WORKER and user.worker_profile:
        display_name = user.worker_profile.full_name

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, role=user.role, display_name=display_name)
