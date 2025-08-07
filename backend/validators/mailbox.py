import dns.resolver
import smtplib
from .domain import get_domain

from typing import Union

def check_email_existence(email: str, debug: bool = False) -> Union[str, bool]:
    domain = get_domain(email)
    try:
        mx_records = dns.resolver.resolve(domain, 'MX')
        sorted_mx = sorted(mx_records, key=lambda r: r.preference)
        mx_host = str(sorted_mx[0].exchange).rstrip('.')

        with smtplib.SMTP(mx_host, timeout=10) as server:
            if debug:
                server.set_debuglevel(1)

            server.ehlo('example.com')
            server.mail('check@example.com')
            code, message = server.rcpt(email)

            if code == 250:
                return True
            elif code == 550:
                return False
            else:
                return f"SMTP Response: {code} {message.decode()}"
    except smtplib.SMTPConnectError:
        return "SMTP Connection Error"
    except smtplib.SMTPServerDisconnected:
        return "SMTP Server Disconnected"
    except smtplib.SMTPException as e:
        return f"SMTP Error: {str(e)}"
    except Exception as e:
        return f"Unknown Error: {str(e)}"
