# Please don't use **kwargs
# Keep the code clean and CLEAR

from pydantic import BaseModel, validator, Json
from typing import List, TypeVar
from typing_extensions import TypedDict
from .form import QuestionType
from .cascade import CascadeBase
import json


class CascadeTransform(TypedDict):
    code: str
    name: str


class Geolocation(TypedDict):
    lat: float
    lng: float


ValueVar = TypeVar('ValueVal', str, List[str],
                   List[CascadeBase], Geolocation,
                   Json[List[CascadeTransform]])


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
        # OPTION TYPE
        if atype == QuestionType.option:
            if type(value) is list:
                temp = []
                for rc in value:
                    try:
                        temp.append({
                            "text": rc["text"],
                            "code": rc["value"]
                        })
                    except:
                        temp.append({"text": rc})
                res = json.dumps(temp)
            else :
                try:
                    # check if already json
                    json.loads(value)
                    res = res
                except:
                    res = json.dumps({"text": value})
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
