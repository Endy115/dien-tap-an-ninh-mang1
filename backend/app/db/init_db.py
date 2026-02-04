from app.db.base import Base
from app.db.session import engine
from app import models  # import tất cả models

def init_db():
    Base.metadata.create_all(bind=engine)
