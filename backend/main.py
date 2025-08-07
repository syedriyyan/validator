from fastapi import FastAPI
from pydantic import BaseModel
from validators.syntactic import is_valid_syntax
from validators.domain import get_domain, is_valid_domain
from validators.mailbox import check_email_existence
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EmailRequest(BaseModel):
    email: str
    check_smtp: bool = False
    debug: bool = False

@app.post("/validate")
def validate_email(data: EmailRequest):
    email = data.email
    check_smtp = data.check_smtp
    debug = data.debug

    if not is_valid_syntax(email):
        return {"email": email, "status": "Invalid Syntax"}

    domain = get_domain(email)
    if not is_valid_domain(domain):
        return {"email": email, "status": "Invalid Domain"}

    if check_smtp:
        smtp_result = check_email_existence(email, debug)
        if smtp_result is True:
            return {"email": email, "status": "Valid (SMTP Accepted)"}
        elif smtp_result is False:
            return {"email": email, "status": "Invalid Mailbox"}
        else:
            return {"email": email, "status": smtp_result}

    return {"email": email, "status": "Valid (Syntax & Domain OK)"}
