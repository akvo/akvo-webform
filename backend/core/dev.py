from fastapi import APIRouter, Request
from fastapi.responses import PlainTextResponse
from os import environ, path
from util.util import Cipher

dev_route = APIRouter()


class Dev:
    def __init__(self):
        self.status = "DEV" in environ

    def get_cached(self, file):
        if self.status:
            return False
        if not path.exists(file):
            return False
        return file


@dev_route.get('/generate/{alias:path}/{fid:path}',
               summary="Get form url",
               response_class=PlainTextResponse,
               tags=["Dev"])
def generate(req: Request, alias: str, fid: int):
    return Cipher(f"{alias}-{fid}").encode()
