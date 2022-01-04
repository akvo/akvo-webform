from enum import Enum
from typing import List, Optional
from typing_extensions import TypedDict
from pydantic import BaseModel, validator
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
    caddisfly = "caddisfly"
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
    altText: Optional[List[AltText]] = []
    text: Optional[str] = ""

    @validator("text", pre=True, always=True)
    def set_text(cls, text):
        return text or ""

    @validator("altText", pre=True, always=True)
    def set_alt_text(cls, altText):
        return altText or []


@optional('altText')
class Option(BaseModel):
    altText: Optional[List[AltText]] = []
    value: str
    text: str

    @validator("altText", pre=True, always=True)
    def set_alt_text(cls, altText):
        return altText or []


class Options(BaseModel):
    allowOther: bool
    allowMultiple: bool
    option: List[Option]


class DependencyQuestion(BaseModel):
    answerValue: str
    question: int


@optional('altText', 'cascadeResource', 'help', 'levels', 'validationRule',
          'options', 'dependency')
class Question(BaseModel):
    localeNameFlag: bool
    altText: Optional[List[AltText]] = []
    help: Optional[Help]
    cascadeResource: str
    id: int
    levels: Optional[Levels]
    mandatory: bool
    order: int
    text: str
    type: QuestionType
    dependency: DependencyQuestion
    options: Options
    validationRule: Optional[ValidationRule]

    @validator("altText", pre=True, always=True)
    def set_alt_text(cls, altText):
        return altText or []


@optional('altText')
class QuestionGroup(BaseModel):
    altText: Optional[List[AltText]] = []
    heading: str
    question: List[Question]
    repeatable: bool

    @validator("altText", pre=True, always=True)
    def set_alt_text(cls, altText):
        return altText or []


@optional('alias')
class FormBase(BaseModel):
    alias: str
    altText: Optional[List[AltText]] = []
    app: str
    defaultLanguageCode: str
    name: str
    questionGroup: List[QuestionGroup]
    surveyGroupId: int
    surveyGroupName: str
    surveyId: int
    version: float

    @validator("altText", pre=True, always=True)
    def set_alt_text(cls, altText):
        return altText or []
