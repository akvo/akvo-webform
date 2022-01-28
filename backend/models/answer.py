# Please don't use **kwargs
# Keep the code clean and CLEAR

from pydantic import BaseModel, validator
from typing import List, TypeVar, Optional
from typing_extensions import TypedDict
from .form import QuestionType
from .cascade import CascadeBase
from datetime import datetime
import json

images = []


class CascadeTransform(TypedDict):
    code: str
    name: str


class Geolocation(TypedDict):
    lat: float
    lng: float


class Image(TypedDict):
    blob: str
    filename: str
    id: str
    qid: str


ValueVar = TypeVar('ValueVal', str, List[str],
                   List[CascadeBase], Geolocation,
                   Image)


class AnswerResponse(BaseModel):
    answerType: QuestionType
    iteration: int
    questionId: str
    value: ValueVar

    @validator("value", pre=True, always=True)
    def set_value(cls, value, values):
        res = value
        atype = values["answerType"]
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
        # PHOTO TYPE
        if atype == QuestionType.photo:
            try:
                # check if already json
                json.loads(value)
                res = res
            except:
                res = json.dumps({"filename": value["id"]})
                images.append(value)
        # DATE TYPE
        if atype == QuestionType.date:
            date_obj = datetime.strptime(value, "%Y-%m-%d")
            res = int(datetime.timestamp(date_obj) * 1000)
        return res


class AnswerBase(BaseModel):
    dataPointId: str
    deviceId: str
    dataPointName: Optional[str] = None
    formId: int
    formVersion: int
    responses: List[AnswerResponse]
    submissionDate: int
    username: str
    uuid: str
    instance: str

    @validator("responses", pre=True, always=True)
    def append_meta_name(cls, value, values):
        try:
            meta_response = {
                "answerType": QuestionType.meta_name,
                "iteration": 0,
                "questionId": "-1",
                "value": values["dataPointName"]
            }
            if meta_response not in value:
                value.append(meta_response)
            else:
                # delete dataPointName from dict
                del values["dataPointName"]
        except:
            pass
        return value
