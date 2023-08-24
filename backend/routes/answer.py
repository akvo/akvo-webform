import json
import os
import base64
import uuid
import time
import pandas as pd
import requests as r
from fastapi import APIRouter, HTTPException
from fastapi import Request, Query
from models.answer import AnswerBase
from models.form import QuestionType
from zipfile import ZipFile, ZIP_DEFLATED
from datetime import datetime
from pydantic import Required
from util.flow import get_stats, get_token

instance_list = './data/flow-survey-amazon-aws.csv'
FLOW_SERVICE_URL = os.environ['FLOW_SERVICE_URL']
BASE_URL = "{}/upload".format(FLOW_SERVICE_URL)

answer_route = APIRouter()


def remove_tmp(zip_name, combined):
    # remove data
    if not os.path.exists('./tmp'):
        os.mkdir('./tmp')
    if os.path.isfile('data.json'):
        os.remove('data.json')
    if os.path.isfile(zip_name):
        os.remove(zip_name)
    if os.path.isfile(combined):
        os.rename(combined, './tmp/ ' + combined)


@answer_route.post(
    '/submit-form',
    response_model=AnswerBase,
    summary="Submit form payload to Akvo Flow",
    tags=["Akvo Flow Webform"])
def submit_form(data: AnswerBase):
    images = []
    responseTemp = []
    for rc in data.responses:
        atype = rc.answerType.lower()
        value = rc.value
        # PHOTO TYPE
        if atype == QuestionType.photo.value or atype == "image":
            try:
                images.append(value)
                rc.value = json.dumps({"filename": value["id"]})
            except TypeError:
                rc.value = value
        responseTemp.append(rc)
    data.responses = responseTemp

    _uuid = data.uuid
    instance_id = data.instance

    # delete not required payload
    if data.instance:
        del data.instance

    # zip process
    with open('data.json', 'w') as f:
        json.dump(json.loads(data.json()), f)
    zip_name = _uuid + '.zip'
    zip_file = ZipFile(zip_name, 'w')
    zip_file.write('data.json', compress_type=ZIP_DEFLATED)
    zip_file.close()
    os.rename(zip_name, zip_name)
    combined = "all-{}.zip".format(round(datetime.today().timestamp()))
    with ZipFile(combined, 'w') as all_zip:
        all_zip.write(zip_name)
        for image in images:
            if "id" in image:
                img_name = image["id"]
                img_blob = image["blob"]
                img_blob = img_blob[img_blob.find(",") + 1:]
                with open(f"./tmp/images/{img_name}", "wb") as fh:
                    fh.write(base64.b64decode(img_blob))
                if os.path.isfile('./tmp/images/' + img_name):
                    os.rename('./tmp/images/' + img_name, img_name)
                    all_zip.write(img_name)
                    os.remove(img_name)

    file_size = os.path.getsize(combined)
    uid = str(uuid.uuid4())
    params = {
        'resumableChunkNumber': 1,
        'resumableChunkSize': file_size,
        'resumableCurrentChunkSize': file_size,
        'resumableTotalSize': file_size,
        'resumableType': 'application/zip',
        'resumableIdentifier': uid,
        'resumableFilename': combined,
        'resumableRelativePath': combined,
        'resumableTotalChunks': 1
    }

    files = {'file': (combined, open(combined, 'rb'), 'application/zip')}
    result = r.post(BASE_URL, files=files, data=params)
    time.sleep(0.5)

    if (result.status_code == 200):
        instances = pd.read_csv(instance_list)
        dashboard = instances[instances['bucket'] == instance_id]
        dashboard = list(dashboard['instances'])[0]
        params = {
            'uniqueIdentifier': uid,
            'filename': combined,
            'baseURL': dashboard,
            'appId': instance_id,
            'uploadDomain': instance_id + '.s3.amazonaws.com',
            'complete': 'true'
        }
        result = r.post(BASE_URL, data=params)
        time.sleep(0.5)
        params = {
            "action": 'submit',
            "formID": data.formId,
            "fileName": zip_name,
            "devId": data.deviceId
        }
        result = r.get(
            f"https://{dashboard}.akvoflow.org/processor",
            params=params)
        remove_tmp(zip_name, combined)
    else:
        # error here
        remove_tmp(zip_name, combined)
        raise HTTPException(status_code=result.status_code, detail=result.text)

    return data


@answer_route.get(
    '/stats',
    response_model=dict,
    summary="Retrieving question statistics from Akvo Flow",
    tags=["Akvo Flow Webform"])
def get_stats_data(
    req: Request,
    instance_name: str = Query(default=Required),
    survey_id: int = Query(default=Required),
    form_id: int = Query(default=Required),
    question_id: int = Query(default=Required),
):
    USERNAME = os.environ['AUTH0_USER']
    res = get_token(username=USERNAME, password=os.environ['AUTH0_PWD'])
    data = get_stats(
        instance=instance_name, survey_id=survey_id,
        form_id=form_id, question_id=question_id,
        token=res.get('refresh_token'))
    return data or {}
