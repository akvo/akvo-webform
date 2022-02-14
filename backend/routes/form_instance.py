from fastapi import Depends, Request, APIRouter, HTTPException
from typing import List
from sqlalchemy.orm import Session
import db.crud_form_instance as crud
from db.connection import get_session
from models.form_instance import FormInstanceBase, FormInstanceDict, FormInstance
import json

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
def get_by_id(req: Request, id: str, session: Session = Depends(get_session)):
    form_instance = crud.get_form_instance_by_id(session=session, id=id)
    return form_instance.serialize


@form_instance_route.post("/form_instance",
                          response_model=FormInstanceDict,
                          summary="add new form_instance",
                          name="form_instance:create",
                          tags=["FormInstance"])
def add_form_instance(req: Request, payload: dict,
                      session: Session = Depends(get_session)):
    if "formId" not in payload and "dataPointId" not in payload:
        raise HTTPException(status_code=400,
                            detail="formId and dataPointId are required")
    data = FormInstance(id=None, state=json.dumps(payload))
    result = crud.add_form_instance(session=session, data=data)
    return result.serialize
