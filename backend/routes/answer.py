from fastapi import APIRouter
from models.answer import AnswerBase

answer_route = APIRouter()


@answer_route.post('/submit-form',
                   response_model=AnswerBase,
                   summary="Submit form payload to Akvo Flow",
                   tags=["Akvo Flow Webform"])
def submit_form(data: AnswerBase):
    answers = data.responses
    return data
