# Please don't use **kwargs
# Keep the code clean and CLEAR

from pydantic import BaseModel, validator
from typing import List
from .form import QuestionType


class AnswerResponse(BaseModel):
    answerType: QuestionType
    iteration: int
    questionId: str
    value: str

    @validator("value", pre=True, always=True)
    def set_value(cls, value, values):
        atype = values['answerType']
        temp = []
        if atype == QuestionType.option:
            # code to restructure value
            value = value
        return value


class AnswerBase(BaseModel):
    dataPointId: str
    deviceId: str
    duration: int
    formId: str
    formVersion: float
    responses: List[AnswerResponse]
    submissionDate: int
    username: str
    uuid: str
