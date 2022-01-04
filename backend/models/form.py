from enum import Enum
from typing import List, Optional
from typing_extensions import TypedDict


class QuestionType(Enum):
    cascade = "cascade"
    option = "option"
    free = "free"
    date = "date"


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


class Help(TypedDict):
    altText: Optional[altText] = None
    text: str


class Level(TypedDict):
    text: str


class Levels(TypedDict):
    level: List[Level]


class Question(TypedDict):
    altText: Optional[List[AltText]] = None
    help: Optional[Help] = None
    cascadeResource: str
    id: int
    levels: Optional[Levels] = None
    localeNameFlag: bool
    mandatory: bool
    order: int
    text: str
    type: QuestionType
    validationRule: Optional[ValidationRule] = None


class QuestionGroup(TypedDict):
    altText: Optional[List[altText]] = None
    heading: str
    question: List[Question]
    repeatable: bool


class Form(TypedDict):
    alias: str
    altText: Optional[AltText] = None
    app: str
    defaultLanguageCode: str
    name: str
    questionGroup: List[QuestionGroup]
    surveyGroupId: int
    surveyGroupName: str
    surveyId: int
    version: float
