from fastapi import FastAPI, Request
from pydantic import BaseModel
from validators import syntactic, domain, mailbox

app = FastAPI()

class EmailRequest(BaseModel):
    email: str

@app.post("/validate")
async def validate_email(payload: EmailRequest):
    email = payload.email
    result = {
        "email": email,
        "syntax_valid": syntactic.check(email),
        "domain_valid": domain.check(email),
        "mailbox_valid": await mailbox.check(email),
    }
    return result
