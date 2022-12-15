import requests as r
from sys import argv
from util.flow import auth_domain
from util.flow import export_spreadsheet

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
    results = export_spreadsheet(instance=argv[3],
                                 survey_id=argv[4],
                                 form_id=argv[5],
                                 token=token)
    print(results)
else:
    print("You don't have access to this instance")
