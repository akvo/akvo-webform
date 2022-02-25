from fastapi import APIRouter, HTTPException, Request
from models.auth import AuthBase, AuthDict

auth_route = APIRouter()


@auth_route.post('/login/{form_id:path}',
                 summary="submitter login",
                 response_model=AuthDict,
                 tags=["Submitter Login"])
def login(req: Request, form_id: str, payload: AuthBase):
    default_password = "default"
    form_secret = {
        "boq26jv0vava0a6": "secret",
        "6h12auccv5cevp5": "password"
    }
    if form_id in form_secret:
        default_password = form_secret[form_id]
    if payload.password != default_password:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return {"is_login": True, "submitter": payload.submitter}
