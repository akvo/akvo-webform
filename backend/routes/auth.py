import requests as r
from fastapi import APIRouter, HTTPException, Request, Form
from models.auth import Oauth2Base, AuthBase, AuthDict
from pydantic import SecretStr

auth_route = APIRouter()
auth_domain = "https://akvofoundation.eu.auth0.com/oauth/token"


def get_token(username: str, password: SecretStr) -> Oauth2Base:
    data = {
        "client_id": "S6Pm0WF4LHONRPRKjepPXZoX1muXm1JS",
        "username": username,
        "password": password.get_secret_value(),
        "grant_type": "password",
        "scope": "offline_access"
    }
    req = r.post(auth_domain, data=data)
    if req.status_code != 200:
        raise HTTPException(
                status_code=401,
                detail="")
    return req.json()


@auth_route.post('/login',
                 response_model=Oauth2Base,
                 summary="SSO Login",
                 tags=["Auth"])
def login(
    req: Request, username: str = Form(...), password: SecretStr = Form(...)
) -> Oauth2Base:
    return get_token(username=username, password=password)


@auth_route.post('/login/{form_id:path}',
                 summary="submitter login",
                 response_model=AuthDict,
                 tags=["Auth"])
def form_login(req: Request, form_id: str, payload: AuthBase):
    default_password = "default"
    form_secret = {"boq26jv0vava0a6": "secret", "6h12auccv5cevp5": "password"}
    if form_id in form_secret:
        default_password = form_secret[form_id]
    if payload.password != default_password:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return {"is_login": True, "submitter": payload.submitter}
