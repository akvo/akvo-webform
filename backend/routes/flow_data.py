import requests as r
import pandas as pd
from typing import Optional
from fastapi import APIRouter, Request, Header, HTTPException
from typing import List
from models.flow_data import FolderSurveyBase, FormBase
from util.flow import get_headers, get_page

flow_data_route = APIRouter()
flow_api = "https://api-auth0.akvo.org/flow/orgs"
flow_instances = pd.read_csv("./data/flow-survey-amazon-aws.csv")


@flow_data_route.get('/flow-data/folders/{instance_name:path}',
                     response_model=FolderSurveyBase,
                     summary="View Folders",
                     tags=["Flow Data"])
def get_folders(req: Request,
                instance_name: str,
                id: Optional[int] = None,
                refresh_token: str = Header(...)):
    headers = get_headers(refresh_token)
    instance = flow_instances[flow_instances.instances.eq(instance_name)]
    if not instance.shape[0]:
        raise HTTPException(status_code=404, detail="Instance Not Found")
    if not headers:
        raise HTTPException(status_code=401, detail="Authentication Failed")
    url = f"{flow_api}/{instance_name}"
    folder_url = f"{url}/folders?parent_id=0"
    survey_url = f"{url}/surveys?folder_id=0"
    if id:
        folder_url = f"{url}/folders?parent_id={id}"
        survey_url = f"{url}/surveys?folder_id={id}"
    folders = r.get(folder_url, headers=headers)
    folders = folders.json().get("folders")
    surveys = r.get(survey_url, headers=headers)
    surveys = surveys.json().get("surveys")
    return {"folders": folders, "surveys": surveys}


@flow_data_route.get('/flow-data/surveys/{instance_name:path}',
                     response_model=List[FormBase],
                     summary="View Forms",
                     tags=["Flow Data"])
def get_survey_forms(req: Request,
                     instance_name: str,
                     id: int,
                     refresh_token: str = Header(...)):
    url = f"{flow_api}/{instance_name}/surveys/{id}"
    headers = get_headers(refresh_token)
    if not headers:
        raise HTTPException(status_code=401, detail="")
    req = r.get(url, headers=headers)
    data = req.json().get("forms")
    [d.update({"surveyId": id}) for d in data]
    return data


@flow_data_route.get('/flow-data/data/{instance_name:path}',
                     summary="View JSON Data",
                     tags=["Flow Data"])
def get_form_data(req: Request,
                  survey_id: int,
                  form_id: int,
                  instance_name: str,
                  token: str = Header(...)):
    data = get_page(instance=instance_name,
                    survey_id=survey_id,
                    form_id=form_id,
                    token=token)
    return data
