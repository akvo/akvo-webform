import os
import time
import httpx
from io import BytesIO
from zipfile import ZipFile
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse, HTMLResponse
from data.flow import xml_survey
from typing import List, Optional
from models.form import FormBase
from util.util import readxml, Cipher
from util.odk import odk
from core.dev import Dev
from AkvoFormPrint.stylers.weasyprint_styler import WeasyPrintStyler
from AkvoFormPrint.stylers.docx_renderer import DocxRenderer
from starlette.background import BackgroundTask


dev = Dev()
form_route = APIRouter()


def remove_file(path: str):
    time.sleep(5)
    os.remove(path)


def download_sqlite_asset(cascade_list: List[str], ziploc: str) -> None:
    for cascade in cascade_list:
        cascade_file = cascade.split("/surveys/")[1]
        cascade_file = f"{ziploc}/{cascade_file}"
        cascade_file = cascade_file.replace(".zip", "")
        if not os.path.exists(cascade_file):
            try:
                zip_url = httpx.get(cascade)
                zip_url.raise_for_status()
                z = ZipFile(BytesIO(zip_url.content))
                z.extractall(ziploc)
            except httpx.HTTPError:
                pass
            # except httpx.HTTPError as exc:
            # raise HTTPException(
            #     status_code=exc.response.status_code,
            #     detail=f"Error while requesting {exc.request.url!r}.")


def download_form(ziploc: str, alias: str, survey_id: int):
    instance = xml_survey(alias)
    dev = Dev()
    xml_path = f"{ziploc}/{survey_id}.xml"
    if dev.get_cached(xml_path):
        return readxml(xml_path=xml_path, alias=alias)
    try:
        zip_url = httpx.get(f"{instance}/{survey_id}.zip")
        zip_url.raise_for_status()
    except httpx.HTTPError:
        return False
    # except httpx.HTTPError as exc:
    # raise HTTPException(
    #     status_code=exc.response.status_code,
    #     detail=f"Error while requesting {exc.request.url!r}.")
    if not os.path.exists(ziploc):
        os.mkdir(ziploc)
    z = ZipFile(BytesIO(zip_url.content))
    z.extractall(ziploc)
    response = readxml(xml_path=xml_path, alias=alias)
    cascade_list = []
    for qg in response["questionGroup"]:
        for q in qg.get("question", []):
            if q["type"] == "cascade":
                cascade_list.append(q["cascadeResource"])
    if len(cascade_list) > 0:
        cascade_list = [f"{instance}/{c}.zip" for c in cascade_list]
        download_sqlite_asset(cascade_list, ziploc)
    return response


@form_route.get(
    "/form/{id:path}/print",
    summary="Get Printable HTML or DOCX Version of Form",
    tags=["Akvo Flow Webform"],
)
async def form_print(
    req: Request,
    id: str,
    section_numbering: Optional[bool] = True,
    question_numbering: Optional[bool] = True,
    orientation: Optional[str] = "landscape",
    output_format: Optional[str] = "pdf",
):
    alias, survey_id = Cipher(id).decode()
    if alias is None:
        raise HTTPException(status_code=404, detail="Not Found")
    ziploc = f"./static/xml/{alias}"
    form_data = download_form(ziploc, alias, survey_id)
    if not form_data:
        raise HTTPException(status_code=404, detail="Not Found")

    try:
        # Initialize styler with Flow parser
        if output_format == "pdf":
            styler = WeasyPrintStyler(
                orientation=orientation,
                add_section_numbering=section_numbering,
                add_question_numbering=question_numbering,
                parser_type="flow",
                raw_json=form_data,
            )

            # Generate HTML
            html_content = styler.render_html()
            filename = f"form-{survey_id}.html"
            headers = {"Content-Disposition": f'inline; filename="{filename}"'}
            return HTMLResponse(
                content=html_content,
                media_type="text/html",
                headers=headers,
            )
        if output_format == "docx":
            filename = f"form-{survey_id}.docx"
            file_path = f"./tmp/{filename}"
            styler = DocxRenderer(
                orientation=orientation,
                add_section_numbering=section_numbering,
                add_question_numbering=question_numbering,
                parser_type="flow",
                raw_json=form_data,
                output_path=file_path,
            )
            # return a file to download
            styler.render_docx()

            with open(file_path, "rb") as f:
                print("DOCX size:", len(f.read()))

            return FileResponse(
                path=file_path,
                media_type="application/octet-stream",
                filename=filename,
                background=BackgroundTask(remove_file, path=file_path),
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@form_route.get(
    "/form/{id:path}",
    summary="Get Akvo Flow Webform Format",
    response_model=FormBase,
    response_model_exclude_none=True,
    tags=["Akvo Flow Webform"],
)
async def form(req: Request, id: str):
    alias, survey_id = Cipher(id).decode()
    if alias is None:
        raise HTTPException(status_code=404, detail="Not Found")
    ziploc = f"./static/xml/{alias}"
    form_data = download_form(ziploc, alias, survey_id)
    if not form_data:
        raise HTTPException(status_code=404, detail="Not Found")
    return form_data


@form_route.get(
    "/xls-form/{id:path}",
    summary="Download XLS Form for ODK",
    response_class=FileResponse,
    tags=["Assets"],
)
def xls_form(req: Request, id: str):
    alias, survey_id = Cipher(id).decode()
    if alias is None:
        raise HTTPException(status_code=404, detail="Not Found")
    ziploc = f"./static/xml/{alias}"
    res = download_form(ziploc, alias, survey_id)
    file_path = f"{ziploc}/{survey_id}.xlsx"
    odk(res, file_path)
    ftype = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    return FileResponse(
        path=file_path, filename=f"{survey_id}.xlsx", media_type=ftype
    )
