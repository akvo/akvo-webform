import requests as r
import os
import json
from sys import argv
from util.flow import get_token, get_headers
from routes.flow_data import flow_api

if len(argv) < 4:
    print("wrong input")
    exit(1)

instance_name = argv[3]
login = get_token(username=argv[1], password=argv[2])


def create_folder(dir: str, dir_name: str):
    if dir_name:
        dir += f"/{dir_name}/"
    else:
        dir += "/untitled/"
    if not os.path.exists(dir):
        os.makedirs(dir)
    print(f"{dir} created")
    return dir


def flow_backup(headers: dict, survey_url: str, folder_url: str, dir: str):
    folders = r.get(folder_url, headers=headers)
    folders = folders.json().get("folders")
    surveys = r.get(survey_url, headers=headers)
    surveys = surveys.json().get("surveys")
    for folder in folders:
        dir_name = folder.get("name")
        new_dir = create_folder(dir=dir, dir_name=dir_name)
        print(f"{new_dir} created")
        survey_url = folder.get("surveysUrl")
        folder_url = folder.get("foldersUrl")
        flow_backup(headers=headers,
                    survey_url=folder.get("surveysUrl"),
                    folder_url=folder.get("foldersUrl"),
                    dir=new_dir)
    for survey in surveys:
        dir_name = survey.get("name")
        survey_dir = create_folder(dir=dir, dir_name=dir_name)
        json_object = json.dumps(survey, indent=4)
        # Writing to sample.json
        with open(f"{survey_dir}/{dir_name}.json", "w") as outfile:
            outfile.write(json_object)


if login:
    url = f"{flow_api}/{instance_name}"
    initial_folder = f"./tmp/data_backup/{instance_name}.akvoflow.org/"
    if not os.path.exists(initial_folder):
        os.makedirs(initial_folder)
    refresh_token = login.get("refresh_token")
    headers = get_headers(token=refresh_token)
    folder_url = f"{url}/folders?parent_id=0"
    survey_url = f"{url}/surveys?folder_id=0"
    flow_backup(headers=headers,
                folder_url=folder_url,
                survey_url=survey_url,
                dir=initial_folder)
else:
    print("You don't have access to this instance")
