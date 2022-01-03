from fastapi import Depends, Request, APIRouter
from typing import List
from sqlalchemy.orm import Session
import db.crud_form_instance as crud
from db.connection import get_session
from models.form_instance import FormInstanceBase, FormInstanceDict

form_instance_route = APIRouter()


@form_instance_route.get("/form_instance",
                         response_model=List[FormInstanceBase],
                         summary="get all form_instances",
                         name="form_instance:get",
                         tags=["FormInstance"])
def get(req: Request, session: Session = Depends(get_session)):
    form_instances = crud.get_form_instance(session=session)
    if len(form_instances):
        return [f.serialize for f in form_instances]
    return []


@form_instance_route.get("/form_instance/{id:path}",
                         response_model=FormInstanceDict,
                         summary="get form_instance by id",
                         tags=["FormInstance"])
def get_by_id(req: Request, id: int, session: Session = Depends(get_session)):
    form_instance = crud.get_form_instance_by_id(session=session, id=id)
    return form_instance.serialize
