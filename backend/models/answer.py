# Please don't use **kwargs
# Keep the code clean and CLEAR

from pydantic import BaseModel, validator
from typing import List, TypeVar, Optional
from typing_extensions import TypedDict
from .form import QuestionType, Option
from .cascade import CascadeBase
from datetime import datetime
import json
import uuid


class Geolocation(TypedDict):
    lat: float
    lng: float


class Image(TypedDict):
    blob: str
    filename: str
    id: str
    qid: str


ValueVar = TypeVar(
    "ValueVal",
    str,
    int,
    float,
    dict,
    List[str],
    Geolocation,
    Image,
    List[CascadeBase],
    List[Option],
)


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
                    if "name" in rc and "id" in rc:
                        temp.append(
                            {"code": str(rc["id"]), "name": rc["name"]}
                        )
                    elif "name" in rc and "code" in rc:
                        temp.append(
                            {"code": str(rc["code"]), "name": rc["name"]}
                        )
                    else:
                        temp.append({"code": "", "name": rc["name"]})
                res = json.dumps(temp)
            except TypeError:
                res = res
        # OPTION TYPE
        if atype == QuestionType.option.value:
            temp = []
            if type(value) is list:
                for rc in value:
                    if "text" in rc and "value" in rc:
                        it = {
                            "text": str(rc["text"]),
                            "code": str(rc["value"]),
                        }
                    else:
                        it = rc
                    temp.append(it)
                res = json.dumps(temp)
            else:
                res = json.dumps([value])
        # DATE TYPE
        if atype == QuestionType.date.value and value != "":
            try:
                try:
                    date_obj = datetime.strptime(value, "%Y-%m-%d")
                    res = int(datetime.timestamp(date_obj) * 1000)
                except ValueError:
                    res = res
            except TypeError:
                res = res
        # GEO TYPE
        if atype == QuestionType.geo.value:
            try:
                lat = res["lat"]
                lng = res["lng"]
                res = f"{lat}|{lng}|0"
            except TypeError:
                res = res
        if atype == QuestionType.free.value or atype == "value":
            res = str(value)
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
    duration: Optional[int] = None
    username: str
    uuid: Optional[str] = None
    instance: Optional[str] = None

    @validator("formId", pre=True, always=True)
    def convert_form_id_to_string(cls, value):
        return str(value)

    @validator("formVersion", pre=True, always=True)
    def set_form_version_to_float(cls, value):
        return float(value)

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
                int(values["submissionStart"]) / 1000
            )
            end_date = datetime.fromtimestamp(
                int(values["submissionStop"]) / 1000
            )
            duration = end_date - start_date
            duration = round(duration.total_seconds())
        if duration:
            # delete submissionStart and submissionStop from dict
            del values["submissionStart"]
            del values["submissionStop"]
        return int(duration)

    @validator("responses", pre=True, always=True)
    def append_meta_name(cls, value, values):
        meta_response = {
            "answerType": "META_NAME",
            "iteration": 0,
            "questionId": "-1",
            "value": values["dataPointName"],
        }
        if values["dataPointName"] and meta_response not in value:
            value.append(meta_response)
        if meta_response in value:
            # delete dataPointName from dict
            del values["dataPointName"]
        return value
