from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session, declarative_base
from config import Settings

DATABASE_URL = Settings.DATABASE_URL

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    future=True, 
)

SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

# Declarative base para seus models (você precisará reescrever models para usar Base)
Base = declarative_base()

# Dependencia pro FastAPI
def get_db():
    """
    Yield a DB session and ensure it's closed.
    Use em endpoints: db = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
