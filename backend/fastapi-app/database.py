import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"postgresql+psycopg2://{os.getenv('USER', 'postgres')}@localhost:5432/msu_surplus_tracker",
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
