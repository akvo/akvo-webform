from fastapi import APIRouter, Request, HTTPException
from models.answer import AnswerBase, AnswerResponse
from typing import List

answer_route = APIRouter()


@answer_route.post('/submit-form',
                   response_model=AnswerBase,
                   summary="Submit form payload to Akvo Flow",
                   tags=["Akvo Flow Webform"])
def submit_form(data: AnswerBase):
    return data
