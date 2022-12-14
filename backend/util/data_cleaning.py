import requests as r
from sys import argv
from util.flow import auth_domain
from util.flow import get_page
import pandas as pd

if len(argv) < 4:
    print("wrong input")
    exit(1)

login = {
    "client_id": "S6Pm0WF4LHONRPRKjepPXZoX1muXm1JS",
    "username": argv[1],
    "password": argv[2],
    "grant_type": "password",
    "scope": "offline_access"
}
req = r.post(auth_domain, data=login)
token = None
if req.status_code == 200:
    token = req.json().get("refresh_token")

if token:
    metadata = [
        "id", "identifier", "submissionDate", "modifiedAt", "submitter",
        "surveyalTime", "formVersion", "deviceIdentifier", "displayName"
    ]
    writter = pd.ExcelWriter(f"./tmp/reports/DATA_CLEANING-{argv[5]}.xlsx",
                             engine='xlsxwriter')
    data = get_page(instance=argv[3],
                    survey_id=argv[4],
                    form_id=argv[5],
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
else:
    print("You don't have access to this instance")
