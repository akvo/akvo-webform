from typing_extensions import TypedDict
from pydantic import BaseModel


class AuthDict(TypedDict):
    is_login: bool
    submitter: str


class AuthBase(BaseModel):
    submitter: str
    password: str
