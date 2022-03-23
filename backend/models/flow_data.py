from pydantic import BaseModel
from typing import List, Optional


class FolderBase(BaseModel):
    id: int
    parentId: int
    name: str


class SurveyBase(BaseModel):
    id: int
    name: Optional[str] = "New Survey"
    folderId: int
    surveyUrl: str


class FolderSurveyBase(BaseModel):
    surveys: List[SurveyBase]
    folders: List[FolderBase]


class FormBase(BaseModel):
    id: int
    surveyId: int
    name: str
    version: int
