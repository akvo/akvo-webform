from fastapi import FastAPI
from routes.form import form_route
from routes.cascade import cascade_route

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

app.include_router(form_route)
app.include_router(cascade_route)


@app.get("/", tags=["Dev"])
def read_main():
    return "OK"


@app.get("/health-check", tags=["Dev"])
def health_check():
    return "OK"
