from enum import Enum
from typing import List, Optional
from typing_extensions import TypedDict
from pydantic import BaseModel
import inspect


def optional(*fields):
    def dec(_cls):
        for field in fields:
            _cls.__fields__[field].required = False
        return _cls

    if fields and inspect.isclass(fields[0]) and issubclass(
            fields[0], BaseModel):
        cls = fields[0]
        fields = cls.__fields__
        return dec(cls)
    return dec


class QuestionType(Enum):
    cascade = "cascade"
    option = "option"
    free = "free"
    date = "date"
    photo = "photo"
    geo = "geo"


class ValidationType(Enum):
    numeric = "numeric"


class AltText(TypedDict):
    language: str
    text: str
    type: str


class ValidationRule(TypedDict):
    allowDecimal: bool
    signed: bool
    validationType: ValidationType


class Level(TypedDict):
    text: str


class Levels(TypedDict):
    level: List[Level]


@optional('altText')
class Help(BaseModel):
    altText: Optional[List[AltText]]
    text: Optional[str] = None


@optional('altText')
class Option(BaseModel):
    altText: Optional[List[AltText]]
    value: str
    text: str


class Options(BaseModel):
    allowOther: bool
    allowMultiple: bool
    option: List[Option]


@optional('altText', 'cascadeResource', 'help', 'levels', 'validationRule',
          'options')
class Question(BaseModel):
    altText: Optional[List[AltText]]
    help: Optional[Help]
    cascadeResource: str
    id: int
    levels: Optional[Levels]
    mandatory: bool
    order: int
    text: str
    type: QuestionType
    options: Options
    validationRule: Optional[ValidationRule]


@optional('altText')
class QuestionGroup(BaseModel):
    altText: Optional[List[AltText]]
    heading: str
    question: List[Question]
    repeatable: bool


@optional('alias')
class FormBase(BaseModel):
    alias: str
    altText: Optional[List[AltText]]
    app: str
    defaultLanguageCode: str
    name: str
    questionGroup: List[QuestionGroup]
    surveyGroupId: int
    surveyGroupName: str
    surveyId: int
    version: float
