from pydantic import BaseModel
from typing import List, Optional


class FolderBase(BaseModel):
    id: int
    name: str
    type: str = "folder"


class SurveyBase(BaseModel):
    id: int
    name: Optional[str] = "New Survey"
    type: str = "survey"


class FormBase(BaseModel):
    id: int
    name: str
    version: int
    surveyId: int
    type: str = "form"


class FolderSurveyBase(BaseModel):
    surveys: List[SurveyBase]
    folders: List[FolderBase]


class FolderSurveyResponse(BaseModel):
    id: int
    name: Optional[str] = "New Survey"
    url: str
    type: str
