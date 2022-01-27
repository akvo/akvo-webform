# Please don't use **kwargs
# Keep the code clean and CLEAR

from pydantic import BaseModel, validator, Json
from typing import List, TypeVar
from typing_extensions import TypedDict
from .form import QuestionType
import json


class CascadeValue(TypedDict):
    id: str
    name: str


class CascadeResponse(TypedDict):
    code: str
    name: str


class Geolocation(TypedDict):
    lat: float
    lng: float


ValueVar = TypeVar('ValueVal', str, List[str],
                   List[CascadeValue], Geolocation,
                   Json[List[CascadeResponse]])


class AnswerResponse(BaseModel):
    answerType: QuestionType
    iteration: int
    questionId: str
    value: ValueVar

    @validator("value", pre=True, always=True)
    def set_value(cls, value, values):
        res = value
        atype = values['answerType']
        # CASCADE TYPE
        if atype == QuestionType.cascade:
            temp = []
            try:
                for rc in value:
                    try:
                        temp.append({
                            "code": rc["id"],
                            "text": rc["name"]
                        })
                    except:
                        temp.append({
                            "code": "",
                            "text": rc["name"]
                        })
                res = json.dumps(temp)
            except:
                res = res
        return res


class AnswerBase(BaseModel):
    dataPointId: str
    deviceId: str
    # duration: float
    formId: int
    formVersion: int
    responses: List[AnswerResponse]
    submissionDate: int
    username: str
    uuid: str
    instance: str
