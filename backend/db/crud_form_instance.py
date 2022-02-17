from fastapi import HTTPException
from typing import List, Optional
from sqlalchemy.orm import Session
from models.form_instance import FormInstance, FormInstanceDict
from datetime import datetime


def add_form_instance(session, data) -> FormInstanceDict:
    session.add(data)
    session.commit()
    session.flush()
    session.refresh(data)
    return data


def get_form_instance(session: Session) -> List[FormInstance]:
    return session.query(FormInstance).all()


def get_form_instance_by_id(session: Session, id: str) -> FormInstance:
    res = session.query(FormInstance).filter(FormInstance.id == id).first()
    if res is None:
        raise HTTPException(status_code=404,
                            detail="Instance {} not found".format(id))
    return res


def update_form_instance(session, id: str,
                         state: Optional[str] = None) -> FormInstanceDict:
    res = session.query(FormInstance).filter(FormInstance.id == id).first()
    if res is None:
        raise HTTPException(status_code=400,
                            detail="Instance {} not found".format(id))
    res.state = state
    res.updated = datetime.now()
    session.commit()
    session.flush()
    session.refresh(res)
    return res
