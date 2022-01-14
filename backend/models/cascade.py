from pydantic import BaseModel


class CascadeBase(BaseModel):
    id: int
    name: str
