from pydantic import BaseModel


class FolderBase(BaseModel):
    id: int
    parentId: int
    name: str


class SurveyBase(BaseModel):
    id: int
    name: str
    folderId: int
    surveyUrl: str


class FormBase(BaseModel):
    id: int
    surveyId: int
    name: str
    version: int
