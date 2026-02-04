from __future__ import annotations

import os
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.db.session import SessionLocal  # noqa: E402
from app.models.user import User  # noqa: E402


def main() -> int:
    if not os.getenv("DATABASE_URL"):
        print("Missing DATABASE_URL in environment. Set it in .env or environment variables.")
        return 1

    db = SessionLocal()
    try:
        users = User.get_all(db)
        print(f"Total users: {len(users)}")
        for u in users:
            print(u.user_id, u.username)
    finally:
        db.close()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
