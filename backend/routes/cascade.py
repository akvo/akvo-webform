import pandas as pd
import os
import sqlite3
from fastapi import APIRouter, Request

cascade_route = APIRouter()


@cascade_route.get('/cascade/{instance:path}/{sqlite:path}/{level:path}',
                   summary="get cascade",
                   tags=["Cascade"])
def cascade(req: Request, instance: str, sqlite: str, level: int):
    location = f'./static/xml/{instance}/{sqlite}'
    if not os.path.exists(location):
        return {"code": "", "id": 1, "name": "ERROR", "parent": 0}
    conn = sqlite3.connect(location)
    table = pd.read_sql_query("SELECT * FROM nodes;", conn)
    result = table[table['parent'] == level]
    result = result.sort_values(by="name").to_dict('records')
    return result
