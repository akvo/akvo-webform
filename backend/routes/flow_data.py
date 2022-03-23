import requests as r
from typing import Optional
from fastapi import APIRouter, Request, Header, HTTPException
from typing import List
from models.flow_data import FolderSurveyBase, FormBase

flow_data_route = APIRouter()
flow_api = "https://api-auth0.akvo.org/flow/orgs"


def get_headers(token: str):
    login = {
        'client_id': 'S6Pm0WF4LHONRPRKjepPXZoX1muXm1JS',
        'grant_type': 'refresh_token',
        'refresh_token': token,
        'scope': 'openid email'
    }
    req = r.post("https://akvofoundation.eu.auth0.com/oauth/token", data=login)
    if req.status_code != 200:
        raise HTTPException(status_code=401, detail="")
    return {
        'User-Agent': 'curl/7.54.0',
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.akvo.flow.v2+json',
        'Authorization': 'Bearer {}'.format(req.json().get('id_token'))
    }


@flow_data_route.get('/flow-data/folders/{instance_name:path}',
                     response_model=FolderSurveyBase,
                     summary="View Folders",
                     tags=["Flow Data"])
def get_folders(req: Request,
                instance_name: str,
                parent_id: Optional[int] = None,
                refresh_token: str = Header(...)):
    url = f"{flow_api}/{instance_name}"
    folder_url = f"{url}/folders?parent_id=0"
    survey_url = f"{url}/surveys?folder_id=0"
    if parent_id:
        folder_url = f"{url}/folders?parent_id={parent_id}"
        survey_url = f"{url}/surveys?folder_id={parent_id}"
    headers = get_headers(refresh_token)
    folders = r.get(folder_url, headers=headers)
    surveys = r.get(survey_url, headers=headers)
    data = {
        "folders": folders.json().get("folders"),
        "surveys": surveys.json().get("surveys"),
    }
    return data


@flow_data_route.get('/flow-data/forms/{instance_name:path}/{survey_id:path}',
                     response_model=List[FormBase],
                     summary="View Forms",
                     tags=["Flow Data"])
def get_survey_forms(req: Request,
                     instance_name: str,
                     survey_id: int,
                     refresh_token: str = Header(...)):
    url = f"{flow_api}/{instance_name}/surveys/{survey_id}"
    headers = get_headers(refresh_token)
    req = r.get(url, headers=headers)
    data = req.json().get("forms")
    [d.update({"surveyId": survey_id}) for d in data]
    return data
