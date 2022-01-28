# Please don't use **kwargs
# Keep the code clean and CLEAR

from pydantic import BaseModel, validator
from typing import List, TypeVar, Optional
from typing_extensions import TypedDict
from .form import QuestionType
from .cascade import CascadeBase
from datetime import datetime
import json
import uuid


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
    answerType: str
    iteration: int
    questionId: str
    value: ValueVar

    @validator("answerType", pre=True, always=True)
    def update_answer_type(cls, value):
        if value == QuestionType.free.value:
            value = "VALUE"
        if value == QuestionType.photo.value:
            value = "IMAGE"
        if value == QuestionType.geo.value:
            value = "META-GEO"
        return value.upper()

    @validator("value", pre=True, always=True)
    def set_value(cls, value, values):
        res = value
        atype = values["answerType"].lower()
        # CASCADE TYPE
        if atype == QuestionType.cascade.value:
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
        if atype == QuestionType.option.value:
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
        # DATE TYPE
        if atype == QuestionType.date.value:
            date_obj = datetime.strptime(value, "%Y-%m-%d")
            res = int(datetime.timestamp(date_obj) * 1000)
        # GEO TYPE
        if atype == QuestionType.geo.value or atype == "meta-geo":
            try:
                lat = res["lat"]
                lng = res["lng"]
                res = f"{lat}|{lng}|0"
            except:
                res = res
        return res


class AnswerBase(BaseModel):
    dataPointId: str
    deviceId: str
    dataPointName: Optional[str] = None
    formId: str
    formVersion: float
    responses: List[AnswerResponse]
    submissionStart: Optional[int] = None
    submissionStop: Optional[int] = None
    submissionDate: Optional[int] = None
    duration: Optional[float] = None
    username: str
    uuid: Optional[str] = None
    instance: str

    @validator("uuid", pre=True, always=True)
    def set_uuid(cls, value):
        return str(uuid.uuid4())

    @validator("submissionDate", pre=True, always=True)
    def set_submission_date(cls, value, values):
        return values["submissionStop"]

    @validator("duration", pre=True, always=True)
    def set_duration(cls, value, values):
        duration = value
        if not duration:
            start_date = datetime.fromtimestamp(
                int(values["submissionStart"]) / 1000)
            end_date = datetime.fromtimestamp(
                int(values["submissionStop"]) / 1000)
            duration = end_date - start_date
            duration = round(duration.total_seconds())
        elif values["submissionDate"]:
            # delete submissionStart and submissionStop from dict
            del values["submissionStart"]
            del values["submissionStop"]
        else:
            pass
        return duration

    @validator("responses", pre=True, always=True)
    def append_meta_name(cls, value, values):
        try:
            meta_response = {
                "answerType": "META_NAME",
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
