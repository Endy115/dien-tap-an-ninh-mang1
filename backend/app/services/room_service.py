from sqlalchemy.orm import Session

from app.models.scenario import Scenario


def list_scenarios(db: Session) -> list[Scenario]:
    return Scenario.get_all(db)
