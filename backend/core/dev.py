from fastapi import APIRouter, Request
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


@dev_route.get('/generate/{instance:path}/{fid:path}',
               summary="Get form url",
               response_model=str,
               tags=["Dev"])
def generate(req: Request, instance: str, fid: int):
    return Cipher(f"{instance}-{fid}").encode()
