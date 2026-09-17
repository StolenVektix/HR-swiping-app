import enum
from datetime import datetime, date

from sqlalchemy import (
    String,
    Float,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    Enum as SAEnum,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class Role(str, enum.Enum):
    EMPLOYER = "employer"
    WORKER = "worker"


class Location(str, enum.Enum):
    BORDEAUX = "bordeaux"
    PARIS = "paris"


class PayUnit(str, enum.Enum):
    HOUR = "hour"
    DAY = "day"
    MISSION = "mission"


class ScheduleType(str, enum.Enum):
    FULL_TIME = "full_time"
    PART_TIME = "part_time"


class SwipeDirection(str, enum.Enum):
    REJECT = "reject"
    MATCH = "match"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[Role] = mapped_column(SAEnum(Role), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    employer_profile: Mapped["EmployerProfile"] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    worker_profile: Mapped["WorkerProfile"] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )


class EmployerProfile(Base):
    __tablename__ = "employer_profiles"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(String(2000), default="")

    user: Mapped["User"] = relationship(back_populates="employer_profile")
    listings: Mapped[list["Listing"]] = relationship(back_populates="employer", cascade="all, delete-orphan")


class WorkerProfile(Base):
    __tablename__ = "worker_profiles"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(50), default="")
    bio: Mapped[str] = mapped_column(String(2000), default="")

    user: Mapped["User"] = relationship(back_populates="worker_profile")
    filter: Mapped["WorkerFilter"] = relationship(
        back_populates="worker", uselist=False, cascade="all, delete-orphan"
    )
    swipes: Mapped[list["Swipe"]] = relationship(back_populates="worker", cascade="all, delete-orphan")


class Listing(Base):
    __tablename__ = "listings"

    id: Mapped[int] = mapped_column(primary_key=True)
    employer_id: Mapped[int] = mapped_column(ForeignKey("employer_profiles.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(String(4000), default="")
    pay_amount: Mapped[float] = mapped_column(Float, nullable=False)
    pay_unit: Mapped[PayUnit] = mapped_column(SAEnum(PayUnit), nullable=False)
    schedule_type: Mapped[ScheduleType] = mapped_column(SAEnum(ScheduleType), nullable=False)
    schedule_detail: Mapped[str] = mapped_column(String(255), default="")
    period_start: Mapped[date] = mapped_column(Date, nullable=False)
    period_end: Mapped[date] = mapped_column(Date, nullable=False)
    location: Mapped[Location] = mapped_column(SAEnum(Location), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    employer: Mapped["EmployerProfile"] = relationship(back_populates="listings")
    swipes: Mapped[list["Swipe"]] = relationship(back_populates="listing", cascade="all, delete-orphan")


class WorkerFilter(Base):
    __tablename__ = "worker_filters"

    id: Mapped[int] = mapped_column(primary_key=True)
    worker_id: Mapped[int] = mapped_column(ForeignKey("worker_profiles.id"), unique=True, nullable=False)
    location: Mapped[Location | None] = mapped_column(SAEnum(Location), nullable=True)
    pay_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    schedule_type: Mapped[ScheduleType | None] = mapped_column(SAEnum(ScheduleType), nullable=True)
    period_start: Mapped[date | None] = mapped_column(Date, nullable=True)
    period_end: Mapped[date | None] = mapped_column(Date, nullable=True)
    keywords: Mapped[str] = mapped_column(String(255), default="")

    worker: Mapped["WorkerProfile"] = relationship(back_populates="filter")


class Swipe(Base):
    __tablename__ = "swipes"
    __table_args__ = (UniqueConstraint("worker_id", "listing_id", name="uq_worker_listing"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    worker_id: Mapped[int] = mapped_column(ForeignKey("worker_profiles.id"), nullable=False)
    listing_id: Mapped[int] = mapped_column(ForeignKey("listings.id"), nullable=False)
    direction: Mapped[SwipeDirection] = mapped_column(SAEnum(SwipeDirection), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    worker: Mapped["WorkerProfile"] = relationship(back_populates="swipes")
    listing: Mapped["Listing"] = relationship(back_populates="swipes")
