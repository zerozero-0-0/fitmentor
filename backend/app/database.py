import os
from collections.abc import Generator

from sqlmodel import Session, create_engine

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is required")

# PostgreSQLへの接続エンジンを作成
engine = create_engine(DATABASE_URL, echo=True)


def get_session() -> Generator[Session, None, None]:
    """FastAPIのDependency Injection用のセッションジェネレータ"""
    with Session(engine) as session:
        yield session
