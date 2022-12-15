from sys import argv
from util.flow import get_token
from util.flow import export_spreadsheet

if len(argv) < 4:
    print("wrong input")
    exit(1)

login = get_token(username=argv[1], password=argv[2])

if login:
    refresh_token = login.get("refresh_token")
    results = export_spreadsheet(instance=argv[3],
                                 survey_id=argv[4],
                                 form_id=argv[5],
                                 token=refresh_token)
    print(results)
else:
    print("You don't have access to this instance")
