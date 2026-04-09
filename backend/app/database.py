import os
from collections.abc import Generator

from sqlmodel import Session, create_engine

# 環境変数からDATABASE_URLを取得
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/db")

# PostgreSQLへの接続エンジンを作成
engine = create_engine(DATABASE_URL, echo=True)


def get_session() -> Generator[Session, None, None]:
    """FastAPIのDependency Injection用のセッションジェネレータ"""
    with Session(engine) as session:
        yield session
