import requests as r
import pandas as pd
from collections import defaultdict
from fastapi import HTTPException
from pydantic import SecretStr
from models.auth import Oauth2Base

instance_base = 'https://api-auth0.akvo.org/flow/orgs/'
auth_domain = "https://akvofoundation.eu.auth0.com/oauth/token"


def def_value():
    return "Not Present"


def get_token(username: str, password: SecretStr) -> Oauth2Base:
    data = {
        "client_id": "S6Pm0WF4LHONRPRKjepPXZoX1muXm1JS",
        "username": username,
        "password": password.get_secret_value(),
        "grant_type": "password",
        "scope": "offline_access"
    }
    req = r.post(auth_domain, data=data)
    if req.status_code != 200:
        raise HTTPException(status_code=401, detail="")
    return req.json()


def get_headers(token: str):
    login = {
        'client_id': 'S6Pm0WF4LHONRPRKjepPXZoX1muXm1JS',
        'grant_type': 'refresh_token',
        'refresh_token': token,
        'scope': 'openid email'
    }
    req = r.post("https://akvofoundation.eu.auth0.com/oauth/token", data=login)
    if req.status_code != 200:
        return False
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.akvo.flow.v2+json',
        'Authorization': 'Bearer {}'.format(req.json().get('id_token'))
    }


def get_data(uri, auth):
    return r.get(uri, headers=auth).json()


def fetch_all(url, headers, formInstances=[]):
    data = get_data(url, headers)
    next_url = data.get('nextPageUrl')
    data = data.get('formInstances')
    if data:
        for d in data:
            formInstances.append(d)
        if next_url:
            fetch_all(next_url, headers, formInstances)
    return formInstances


def data_handler(data, qType):
    if data:
        if qType in [
                'FREE_TEXT', 'NUMBER', 'BARCODE', 'DATE', 'GEOSHAPE', 'SCAN',
                'CADDISFLY'
        ]:
            return data
        if qType == 'OPTION':
            return handle_list(data, "text")
        if qType == 'CASCADE':
            return handle_list(data, "name")
        if qType in ['PHOTO', 'VIDEO']:
            return data.get('filename', "")
        if qType == 'VIDEO':
            return data.get('filename', "")
        if qType == 'GEO':
            lat = data.get('long')
            long = data.get('lat')
            if lat and long:
                return f"{lat}|{long}"
        if qType == 'SIGNATURE':
            return data.get("name", "")
    return None


def handle_list(data, target):
    response = []
    for value in data:
        if value.get("code"):
            response.append("{}:{}".format(value.get("code"),
                                           value.get(target)))
        elif value.get(target):
            response.append(value.get(target))
        else:
            pass
    return "|".join(response)


def handle_repeat_group(form_definition: dict, collections: list):
    results = defaultdict(def_value)
    results["Raw Data"] = []
    for col in collections:
        meta = {}
        dt = {}
        for c in col:
            if c != "responses":
                if c not in ["dataPointId", "formId", "createdAt"]:
                    dt.update({c: col[c]})
                    meta.update({c: col[c]})
            else:
                for g in form_definition:
                    answers = col.get(c)
                    answers = answers.get(g['id']) if answers else [{}]
                    repeatable = g.get("repeatable")
                    if repeatable:
                        group_name = g.get("name")
                        if group_name not in results:
                            results[group_name] = []
                    if answers:
                        for ri, ans in enumerate(answers):
                            dr = meta
                            dr.update({"repeat": ri + 1})
                            for q in g['questions']:
                                a = ans.get(q['id'])
                                d = data_handler(a, q['type'])
                                n = {"{}|{}".format(q['id'], q['name']): d}
                                dr.update(n) if repeatable else dt.update(n)
                            if repeatable:
                                results[group_name].append(dr)
        results["Raw Data"].append(dt)
    return results


def get_page(instance: str,
             survey_id: int,
             form_id: int,
             token: str,
             repeat: bool = False):
    headers = get_headers(token)
    instance_uri = '{}{}'.format(instance_base, instance)
    form_instance_url = '{}/form_instances?survey_id={}&form_id={}'.format(
        instance_uri, survey_id, form_id)
    collections = fetch_all(form_instance_url, headers)
    form_definition = get_data('{}/surveys/{}'.format(instance_uri, survey_id),
                               headers)
    form_definition = form_definition.get('forms')
    form_definition = list(
        filter(lambda x: int(x['id']) == int(form_id),
               form_definition))[0].get('questionGroups')
    if repeat:
        return handle_repeat_group(form_definition=form_definition,
                                   collections=collections)
    results = []
    for col in collections:
        dt = {}
        for c in col:
            if c != 'responses':
                dt.update({c: col[c]})
            else:
                for g in form_definition:
                    answers = col.get(c)
                    answers = answers.get(g['id']) if answers else [{}]
                    for q in g['questions']:
                        d = None
                        if answers:
                            a = answers[0].get(q['id'])
                            d = data_handler(a, q['type'])
                        n = "{}|{}".format(q['id'], q['name'])
                        dt.update({n: d})
        results.append(dt)
    return results


def get_stats(instance: str, survey_id: int, form_id: int, question_id: int,
              token: str):
    stats_url = f"{instance_base}{instance}"
    stats_url = f"{stats_url}/stats?survey_id={survey_id}"
    stats_url = f"{stats_url}&form_id={form_id}&question_id={question_id}"
    headers = get_headers(token=token)
    data = get_data(uri=stats_url, auth=headers)
    return data


def export_spreadsheet(instance: str, survey_id: int, form_id: int,
                       token: str):
    file_location = f"./tmp/reports/DATA_CLEANING-{form_id}.xlsx"
    metadata = [
        "id", "identifier", "submissionDate", "modifiedAt", "submitter",
        "surveyalTime", "formVersion", "deviceIdentifier", "displayName"
    ]
    writter = pd.ExcelWriter(file_location, engine='xlsxwriter')
    data = get_page(instance=instance,
                    survey_id=survey_id,
                    form_id=form_id,
                    token=token,
                    repeat=True)
    for d in list(data):
        df = pd.DataFrame(data[d])
        questions = list(
            filter(lambda x: x not in metadata + ["repeat"], list(df)))
        if "repeat" in list(df):
            questions = ["id", "identifier", "displayName", "repeat"
                         ] + questions
        else:
            questions = metadata + questions
        df = df[questions]
        df.to_excel(writter, sheet_name=d, index=False)
    writter.save()
    return file_location
