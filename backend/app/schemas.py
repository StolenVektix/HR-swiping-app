from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from .models import Role, Location, PayUnit, ScheduleType, SwipeDirection


# ---- Auth ----


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=72)
    role: Role
    # employer fields
    company_name: Optional[str] = None
    description: Optional[str] = ""
    # worker fields
    full_name: Optional[str] = None
    phone: Optional[str] = ""
    bio: Optional[str] = ""


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: Role
    display_name: str


# ---- Listings ----


class ListingCreate(BaseModel):
    title: str
    description: str = ""
    pay_amount: float
    pay_unit: PayUnit
    schedule_type: ScheduleType
    schedule_detail: str = ""
    period_start: date
    period_end: date
    location: Location


class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    pay_amount: Optional[float] = None
    pay_unit: Optional[PayUnit] = None
    schedule_type: Optional[ScheduleType] = None
    schedule_detail: Optional[str] = None
    period_start: Optional[date] = None
    period_end: Optional[date] = None
    location: Optional[Location] = None
    is_active: Optional[bool] = None


class EmployerSummary(BaseModel):
    company_name: str
    location: Optional[Location] = None

    class Config:
        from_attributes = True


class ListingResponse(BaseModel):
    id: int
    title: str
    description: str
    pay_amount: float
    pay_unit: PayUnit
    schedule_type: ScheduleType
    schedule_detail: str
    period_start: date
    period_end: date
    location: Location
    is_active: bool
    created_at: datetime
    employer: EmployerSummary

    class Config:
        from_attributes = True


# ---- Worker filter ----


class WorkerFilterUpdate(BaseModel):
    location: Optional[Location] = None
    pay_min: Optional[float] = None
    schedule_type: Optional[ScheduleType] = None
    period_start: Optional[date] = None
    period_end: Optional[date] = None
    keywords: str = ""


class WorkerFilterResponse(WorkerFilterUpdate):
    class Config:
        from_attributes = True


# ---- Swipe ----


class SwipeRequest(BaseModel):
    listing_id: int
    direction: SwipeDirection


class SwipeResponse(BaseModel):
    listing_id: int
    direction: SwipeDirection
    is_match: bool


# ---- Matches ----


class MatchedWorker(BaseModel):
    full_name: str
    phone: str
    bio: str
    email: EmailStr
    matched_at: datetime


class MatchedListing(BaseModel):
    listing: ListingResponse
    matched_at: datetime
    employer_email: EmailStr
