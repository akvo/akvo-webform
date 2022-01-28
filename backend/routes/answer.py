from fastapi import APIRouter
from models.answer import AnswerBase
from models.form import QuestionType
from zipfile import ZipFile, ZIP_DEFLATED
from datetime import datetime
import json
import os
import base64
import uuid
import time
import pandas as pd
import requests as r

instance_list = './data/flow-survey-amazon-aws.csv'
FLOW_SERVICE_URL = os.environ['FLOW_SERVICE_URL']
BASE_URL = "{}/upload".format(FLOW_SERVICE_URL)

answer_route = APIRouter()


@answer_route.post('/submit-form',
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
                # check if already json
                json.loads(value)
                rc.value = value
            except:
                images.append(value)
                rc.value = json.dumps({"filename": value["id"]})
        responseTemp.append(rc)
    data.responses = responseTemp

    if data.submissionStart:
        del data.submissionStart
    if data.submissionStop:
        del data.submissionStop

    _uuid = data.uuid
    instance_id = data.instance
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
            img_name = image["id"]
            img_blob = image["blob"]
            img_blob = img_blob[img_blob.find(",")+1:]
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
    print(1, result, params)
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
        print(2, result, params)
    else:
        # error here
        pass

    # remove data
    if not os.path.exists('./tmp'):
        os.mkdir('./tmp')
    if os.path.isfile('data.json'):
        os.remove('data.json')
    if os.path.isfile(zip_name):
        os.remove(zip_name)
    if os.path.isfile(combined):
        os.rename(combined, './tmp/ ' + combined)

    return data
