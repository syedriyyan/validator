import re

def is_valid_syntax(email: str) -> bool:
    regex = r"^(?!\.)[\w\.-]+@[\w\.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(regex, email))
