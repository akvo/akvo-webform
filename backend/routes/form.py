import xmltodict
import json
import os
import httpx
from lxml import etree
from io import BytesIO
from zipfile import ZipFile
from fastapi import APIRouter, Request
from data.flow import xml_survey
from typing import List
from models.form import FormBase

form_route = APIRouter()


def readxml(xml_path: str):
    with open(xml_path) as survey:
        encoding = etree.parse(survey)
        encoding = encoding.docinfo.encoding
    with open(xml_path) as survey:
        survey = xmltodict.parse(survey.read(),
                                 encoding=encoding,
                                 attr_prefix='',
                                 cdata_key='text',
                                 force_list={
                                     'questionGroup', 'question', 'option',
                                     'level', 'altText'
                                 })
        survey = json.dumps(survey).replace('"true"', 'true').replace(
            '"false"', 'false').replace('"answer-value"', '"answerValue"')
        survey = json.loads(survey)
        response = survey['survey']
    return response


def download_cascade(cascade_list: List[str], ziploc: str) -> None:
    for cascade in cascade_list:
        cascade_file = ziploc + '/' + cascade.split('/surveys/')[1]
        cascade_file = cascade_file.replace('.zip', '')
        zip_url = httpx.get(cascade)
        z = ZipFile(BytesIO(zip_url.content))
        z.extractall(ziploc)


@form_route.get('/form/{instance:path}/{survey_id:path}',
                summary="get form",
                response_model=FormBase,
                response_model_exclude_none=True,
                tags=["Form"])
def form(req: Request, instance: str, survey_id: int):
    ziploc = f'./static/xml/{instance}'
    if not os.path.exists(ziploc):
        os.mkdir(ziploc)
    instance = xml_survey(instance)
    zip_url = httpx.get(f'{instance}/{survey_id}.zip')
    if zip_url.status_code == 403:
        return {"message": "Form is not available"}
    z = ZipFile(BytesIO(zip_url.content))
    z.extractall(ziploc)
    response = readxml(xml_path=f'{ziploc}/{survey_id}.xml')
    cascade_list = []
    for qg in response['questionGroup']:
        for q in qg['question']:
            if q['type'] == 'cascade':
                cascade_list.append(q['cascadeResource'])
    if len(cascade_list) > 0:
        cascade_list = [f'{instance}/{c}.zip' for c in cascade_list]
        download_cascade(cascade_list, ziploc)
    return response
