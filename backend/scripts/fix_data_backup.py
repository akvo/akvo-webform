import pandas as pd
import os
from sys import argv
from shutil import copyfile

file_path = argv[1]
temp_path = file_path.replace(".xlsx", ".tmp.xlsx")
metadata = [
    "id", "identifier", "submissionDate", "modifiedAt", "submitter",
    "surveyalTime", "formVersion", "deviceIdentifier", "displayName", "repeat"
]

copyfile(file_path, temp_path)
os.remove(file_path)

writer = pd.ExcelWriter(file_path, engine='xlsxwriter')
tabs = pd.ExcelFile(temp_path).sheet_names
for tab in tabs:
    data = pd.read_excel(temp_path, sheet_name=tab)
    questions = list(filter(lambda x: x not in metadata, list(data)))
    data = data[~data[questions].isna().all(1)]
    data.to_excel(writer, sheet_name=tab, index=False)
writer.save()
writer.close()
os.remove(temp_path)
print(f"SUCCESS: {file_path}")
