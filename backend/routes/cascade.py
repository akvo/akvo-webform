import pandas as pd
import os
import sqlite3
from fastapi import APIRouter, Request, HTTPException
from typing import List
from models.cascade import CascadeBase

cascade_route = APIRouter()


@cascade_route.get('/cascade/{instance:path}/{sqlite:path}/{level:path}',
                   response_model=List[CascadeBase],
                   response_model_exclude_none=True,
                   summary="Get Akvo Flow Form Cascade by Level",
                   tags=["Akvo Flow Webform"])
def cascade(req: Request, instance: str, sqlite: str, level: int):
    location = f'./static/xml/{instance}/{sqlite}'
    if not os.path.exists(location):
        raise HTTPException(status_code=404, detail="Not Found")
    table = pd.read_sql_query(
        f"""
        SELECT id, name FROM nodes
        WHERE parent = {level} ORDER BY name ASC;
        """, sqlite3.connect(location))
    return table.to_dict('records')
