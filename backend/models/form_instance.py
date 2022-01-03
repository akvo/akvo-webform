# Please don't use **kwargs
# Keep the code clean and CLEAR

from pydantic import BaseModel
from typing_extensions import TypedDict
from sqlalchemy import Column, String, DateTime
from sqlalchemy import text
from db.connection import Base


class FormInstanceDict(TypedDict):
    id: str
    state: str


class FormInstance(Base):
    __tablename__ = "form_instance"
    id = Column(String,
                primary_key=True,
                server_default=text('gen_random_uuid()::varchar'))
    state = Column(String, nullable=False)
    created = Column(DateTime, nullable=False, server_default=text('now()'))
    updated = Column(DateTime, nullable=False, server_default=text('now()'))

    def __init__(self, id: str, state: str):
        self.id = id
        self.state = state

    def __repr__(self) -> int:
        return f"<FormInstance {self.id}>"

    @property
    def serialize(self) -> FormInstanceDict:
        return {"id": self.id, "state": self.state}


class FormInstanceBase(BaseModel):
    id: str
    state: str
