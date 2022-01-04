import os
import httpx
from io import BytesIO
from zipfile import ZipFile
from fastapi import APIRouter, Request
from fastapi.responses import FileResponse
from data.flow import xml_survey
from typing import List
from models.form import FormBase
from util.util import readxml
from util.odk import odk

form_route = APIRouter()


def download_sqlite_asset(cascade_list: List[str], ziploc: str) -> None:
    for cascade in cascade_list:
        cascade_file = ziploc + '/' + cascade.split('/surveys/')[1]
        cascade_file = cascade_file.replace('.zip', '')
        zip_url = httpx.get(cascade)
        z = ZipFile(BytesIO(zip_url.content))
        z.extractall(ziploc)


def download_form(ziploc: str, instance: str, survey_id: int):
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
        download_sqlite_asset(cascade_list, ziploc)
    return response


@form_route.get('/form/{instance:path}/{survey_id:path}',
                summary="get form",
                response_model=FormBase,
                response_model_exclude_none=True,
                tags=["Form"])
def form(req: Request, instance: str, survey_id: int):
    ziploc = f'./static/xml/{instance}'
    return download_form(ziploc, instance, survey_id)


@form_route.get('/xls-form/{instance:path}/{survey_id:path}',
                summary="download xls form",
                tags=["Form"])
def xls_form(req: Request, instance: str, survey_id: int):
    ziploc = f'./static/xml/{instance}'
    res = download_form(ziploc, instance, survey_id)
    file_path = f'{ziploc}/{survey_id}.xlsx'
    odk(res, file_path)
    ftype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    return FileResponse(path=file_path,
                        filename=f'{survey_id}.xlsx',
                        media_type=ftype)
