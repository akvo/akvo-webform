from enum import Enum
from typing import List, Optional
from typing_extensions import TypedDict
from pydantic import BaseModel, Field, validator
from util.model import optional


class QuestionType(Enum):
    cascade = "cascade"
    caddisfly = "caddisfly"
    option = "option"
    free = "free"
    date = "date"
    photo = "photo"
    geo = "geo"
    geoshape = "geoshape"
    signature = "signature"


class ValidationType(Enum):
    numeric = "numeric"


class AltText(TypedDict):
    language: str
    text: str
    type: str


class Level(TypedDict):
    text: str


class Levels(TypedDict):
    level: List[Level]


@optional('maxVal', 'minVal')
class ValidationRule(BaseModel):
    allowDecimal: bool
    signed: bool
    maxVal: Optional[float] = None
    minVal: Optional[float] = None
    validationType: ValidationType


@optional('altText')
class Help(BaseModel):
    altText: Optional[List[AltText]] = []
    text: Optional[str] = ""

    @validator("text", pre=True, always=True)
    def set_text(cls, text):
        return text or ""

    @validator("altText", pre=True, always=True)
    def set_alt_text(cls, altText):
        if altText == [None]:
            return []
        return altText or []


@optional('altText')
class Option(BaseModel):
    altText: Optional[List[AltText]] = []
    value: str
    text: str

    @validator("altText", pre=True, always=True)
    def set_alt_text(cls, altText):
        if altText == [None]:
            return []
        return altText or []


class Options(BaseModel):
    allowOther: bool
    allowMultiple: bool
    option: Optional[List[Option]] = Field(default_factory=list)


class DependencyQuestion(BaseModel):
    answerValue: List[str]
    question: str

    @validator("question", pre=True, always=True)
    def set_question_value(cls, question):
        return f"Q{question}"

    @validator("answerValue", pre=True, always=True)
    def set_answer_value(cls, answerValue):
        if "|" in answerValue:
            return answerValue.split("|")
        return [answerValue]


@optional('altText', 'cascadeResource', 'help', 'levels', 'validationRule',
          'requireDoubleEntry', 'personalData', 'options', 'dependency',
          'answerStats')
class Question(BaseModel):
    localeNameFlag: bool
    altText: Optional[List[AltText]] = []
    help: Optional[Help]
    cascadeResource: str
    id: str
    levels: Optional[Levels]
    mandatory: bool
    order: int
    text: str
    type: QuestionType
    dependency: List[DependencyQuestion]
    options: Options
    validationRule: Optional[ValidationRule]
    personalData: Optional[bool] = None
    answerStats: Optional[bool] = None
    requireDoubleEntry: Optional[bool] = None

    @validator("id", pre=True, always=True)
    def set_id_value(cls, id):
        return f"Q{id}"

    @validator("altText", pre=True, always=True)
    def set_alt_text(cls, altText):
        if altText == [None]:
            return []
        return altText or []


@optional('altText', 'repeatable')
class QuestionGroup(BaseModel):
    altText: Optional[List[AltText]] = Field(default_factory=list)
    heading: str
    question: Optional[List[Question]] = Field(default_factory=list)
    repeatable: Optional[bool]

    @validator("altText", pre=True, always=True)
    def set_alt_text(cls, altText):
        return altText or []


@optional('altText', 'surveyId')
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
        if altText == [None]:
            return []
        return altText or []
