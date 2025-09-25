from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import your validator functions here
from validators.syntactic import is_valid_syntax
from validators.domain import get_domain, is_valid_domain
from validators.mailbox import check_email_existence

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or your frontend URL(s)
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

    syntax_valid = is_valid_syntax(email)
    domain = get_domain(email) if syntax_valid else None
    domain_valid = is_valid_domain(domain) if domain else False

    smtp_valid = None
    if check_smtp and syntax_valid and domain_valid:
        smtp_result = check_email_existence(email, debug)
        if smtp_result is True:
            smtp_valid = True
        elif smtp_result is False:
            smtp_valid = False
        else:
            smtp_valid = None

    is_valid = syntax_valid and domain_valid and (smtp_valid if check_smtp else True)

    # Example logic for risk level:
    if not is_valid:
        risk_level = "high"
    else:
        risk_level = "low"

    # Example placeholders for other fields (update as per your logic)
    provider = domain.split(".")[0] if domain else ""
    is_disposable = False
    is_role_based = False
    breach_status = False

    return {
        "email": email,
        "status": "Valid" if is_valid else "Invalid",
        "is_valid": is_valid,
        "syntax_valid": syntax_valid,
        "domain_valid": domain_valid,
        "smtp_valid": smtp_valid,
        "risk_level": risk_level,
        "is_disposable": is_disposable,
        "is_role_based": is_role_based,
        "breach_status": breach_status,
        "domain": domain or "",
        "provider": provider,
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "version": "1.0.0"}
