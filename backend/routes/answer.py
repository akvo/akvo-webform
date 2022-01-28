from fastapi import APIRouter
from models.answer import AnswerBase
from models.form import QuestionType
import json

answer_route = APIRouter()


@answer_route.post('/submit-form',
                   response_model=AnswerBase,
                   summary="Submit form payload to Akvo Flow",
                   tags=["Akvo Flow Webform"])
def submit_form(data: AnswerBase):
    images = []
    responseTemp = []
    for rc in data.responses:
        atype = rc.answerType.lower()
        value = rc.value
        # PHOTO TYPE
        if atype == QuestionType.photo.value or atype == "image":
            try:
                # check if already json
                json.loads(value)
                rc.value = value
            except:
                images.append(value)
                rc.value = json.dumps({"filename": value["id"]})
        responseTemp.append(rc)
    data.responses = responseTemp
    return data
