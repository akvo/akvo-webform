import pandas as pd
import os
import sqlite3
from fastapi import APIRouter, Request, Query, HTTPException
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


@cascade_route.get('/cascade-path/{instance:path}/{sqlite:path}',
                   response_model=List[CascadeBase],
                   response_model_exclude_none=True,
                   summary="Get Akvo Flow Form Cascade by Path String",
                   tags=["Akvo Flow Webform"])
def search(req: Request,
           instance: str,
           sqlite: str,
           q: List[str] = Query(None)):
    location = f'./static/xml/{instance}/{sqlite}'
    if not os.path.exists(location):
        raise HTTPException(status_code=404, detail="Not Found")
    query_text = ['SELECT']
    for i, p in enumerate(q):
        query_text += [f"n{i}.name as n{i}_name,"]
        if i == len(q) - 1:
            query_text += [f"n{i}.id as n{i}_id"]
        else:
            query_text += [f"n{i}.id as n{i}_id, "]
    query_text += ['FROM nodes n0']
    for i, p in enumerate(q):
        if i > 0:
            prev_i = i - 1
            query_text += [
                f'LEFT JOIN nodes n{i} ON n{prev_i}.id = n{i}.parent'
            ]
    for i, p in enumerate(q):
        if i == 0:
            query_text += [f"WHERE n{i}.name = '{p}'"]
        if i > 0:
            query_text += [f"AND n{i}.name = '{p}'"]
    query_text = " ".join(query_text)
    table = pd.read_sql_query(query_text, sqlite3.connect(location))
    if table.shape[0] == 0:
        raise HTTPException(status_code=404, detail="Not Found")
    table = table.to_dict('records')[0]
    res = []
    for i, p in enumerate(q):
        res.append({
            "id": table.get(f"n{i}_id"),
            "name": table.get(f"n{i}_name")
        })
    return res
