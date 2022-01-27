# Please don't use **kwargs
# Keep the code clean and CLEAR

from pydantic import BaseModel, validator
from typing import List, TypeVar
from typing_extensions import TypedDict
from .form import QuestionType


class Cascade(TypedDict):
    id: int
    name: str


class Geolocation(TypedDict):
    lat: float
    lng: float


ValueVar = TypeVar('ValueVal', str, dict, List[Cascade],
                   Geolocation, List[str])


class AnswerResponse(TypedDict):
    answerType: QuestionType
    iteration: int
    questionId: str
    value: ValueVar

    @validator("value", pre=True, always=True)
    def set_value(cls, value, values):
        atype = values['answerType']
        # temp = []
        if atype == QuestionType.option:
            # code to restructure value
            value = value
        return value


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
