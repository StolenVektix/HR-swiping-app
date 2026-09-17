from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import auth, feed, filters, listings, matches

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Intérim Match API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(listings.router)
app.include_router(filters.router)
app.include_router(feed.router)
app.include_router(matches.router)


@app.get("/")
def root():
    return {"status": "ok"}
