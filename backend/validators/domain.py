import dns.resolver

def check(email: str) -> bool:
    try:
        domain = email.split('@')[1]
        records = dns.resolver.resolve(domain, 'MX')
        return len(records) > 0
    except:
        return False
