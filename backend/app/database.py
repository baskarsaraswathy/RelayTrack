import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

import urllib.parse
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set")

if "@" in DATABASE_URL:
    last_at = DATABASE_URL.rfind("@")
    user_pass = DATABASE_URL[:last_at]
    host_db = DATABASE_URL[last_at:]
    
    if "pooler.supabase.com" in host_db and ":5432" in host_db:
        host_db = host_db.replace(":5432", ":6543")

    scheme_up = user_pass.split("://", 1)
    if len(scheme_up) == 2:
        scheme, up = scheme_up
        if ":" in up:
            user, pwd = up.split(":", 1)
            pwd = urllib.parse.unquote(pwd)
            if pwd.startswith("[") and pwd.endswith("]"):
                pwd = pwd[1:-1]
            pwd = urllib.parse.quote(pwd, safe='')
            DATABASE_URL = f"{scheme}://{user}:{pwd}{host_db}"



engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

from fastapi import HTTPException
from sqlalchemy.exc import OperationalError
from sqlalchemy.sql import text

def get_db():
    db = SessionLocal()
    try:
        # Test connection
        db.execute(text("SELECT 1"))
        yield db
    except OperationalError as e:
        print("Database connection error:", str(e))
        raise HTTPException(status_code=503, detail="Database connection failed")
    finally:
        db.close()
