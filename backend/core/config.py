from fastapi import FastAPI
from routes.form import form_route
from routes.cascade import cascade_route
from routes.answer import answer_route
from routes.auth import auth_route
from routes.flow_data import flow_data_route
from core.dev import Dev, dev_route

app = FastAPI(
    root_path="/api",
    title="Webform API",
    description="Webform API to support Akvo Flow",
    version="1.0.0",
    contact={
        "name": "Akvo",
        "url": "https://akvo.org",
        "email": "tech.consultancy@akvo.org",
    },
    license_info={
        "name": "AGPL3",
        "url": "https://www.gnu.org/licenses/agpl-3.0.en.html",
    },
)
dev = Dev()

app.include_router(auth_route)
app.include_router(form_route)
app.include_router(cascade_route)
app.include_router(answer_route)
app.include_router(flow_data_route)
app.include_router(dev_route)


@app.get("/", tags=["Dev"])
def read_main():
    return "OK"


@app.get("/health-check", tags=["Dev"])
def health_check():
    return "OK"


# if dev.status:
#     app.include_router(dev_route)
