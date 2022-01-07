import os
import httpx
from io import BytesIO
from zipfile import ZipFile
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse
from data.flow import xml_survey
from typing import List
from models.form import FormBase
from util.util import readxml, Cipher
from util.odk import odk
from core.dev import Dev

dev = Dev()
form_route = APIRouter()


def download_sqlite_asset(cascade_list: List[str], ziploc: str) -> None:
    for cascade in cascade_list:
        cascade_file = ziploc + '/' + cascade.split('/surveys/')[1]
        cascade_file = cascade_file.replace('.zip', '')
        try:
            zip_url = httpx.get(cascade)
            zip_url.raise_for_status()
        except httpx.HTTPError as exc:
            raise HTTPException(
                status_code=exc.response.status_code,
                detail=f"Error while requesting {exc.request.url!r}.")
        z = ZipFile(BytesIO(zip_url.content))
        z.extractall(ziploc)


def download_form(ziploc: str, instance: str, survey_id: int):
    instance = xml_survey(instance)
    dev = Dev()
    xml_path = f"{ziploc}/{survey_id}.xml"
    if dev.get_cached(xml_path):
        return readxml(xml_path=xml_path)
    try:
        zip_url = httpx.get(f'{instance}/{survey_id}.zip')
        zip_url.raise_for_status()
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=f"Error while requesting {exc.request.url!r}.")
    if not os.path.exists(ziploc):
        os.mkdir(ziploc)
    z = ZipFile(BytesIO(zip_url.content))
    z.extractall(ziploc)
    response = readxml(xml_path=xml_path)
    cascade_list = []
    for qg in response['questionGroup']:
        for q in qg['question']:
            if q['type'] == 'cascade':
                cascade_list.append(q['cascadeResource'])
    if len(cascade_list) > 0:
        cascade_list = [f'{instance}/{c}.zip' for c in cascade_list]
        download_sqlite_asset(cascade_list, ziploc)
    return response


@form_route.get('/generate/{instance:path}/{fid:path}',
                summary="Get form url",
                response_model=str,
                tags=["Dev"])
def generate(req: Request, instance: str, fid: int):
    return Cipher(f"{instance}-{fid}").encode()


@form_route.get('/form/{id:path}',
                summary="Get Akvo Flow Webform Format",
                response_model=FormBase,
                response_model_exclude_none=True,
                tags=["Akvo Flow Webform"])
def form(req: Request, id: str):
    instance, survey_id = Cipher(id).decode()
    if instance is None:
        raise HTTPException(status_code=404, detail="Not Found")
    ziploc = f'./static/xml/{instance}'
    return download_form(ziploc, instance, survey_id)


@form_route.get('/xls-form/{id:path}',
                summary="Download XLS Form for ODK",
                response_class=FileResponse,
                tags=["Assets"])
def xls_form(req: Request, id: str):
    instance, survey_id = Cipher(id).decode()
    if instance is None:
        raise HTTPException(status_code=404, detail="Not Found")
    ziploc = f'./static/xml/{instance}'
    res = download_form(ziploc, instance, survey_id)
    file_path = f'{ziploc}/{survey_id}.xlsx'
    odk(res, file_path)
    ftype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    return FileResponse(path=file_path,
                        filename=f'{survey_id}.xlsx',
                        media_type=ftype)
