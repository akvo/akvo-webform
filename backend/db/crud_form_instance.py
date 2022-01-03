from typing import List
from sqlalchemy.orm import Session
from models.form_instance import FormInstance, FormInstanceDict


def add_form_instance(session, data) -> FormInstanceDict:
    session.add(data)
    session.commit()
    session.flush()
    session.refresh(data)
    return data


def get_form_instance(session: Session) -> List[FormInstance]:
    return session.query(FormInstance).all()


def get_form_instance_by_id(session: Session, id: int) -> FormInstance:
    return session.query(FormInstance).filter(FormInstance.id == id).first()
