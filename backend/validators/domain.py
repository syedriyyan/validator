import dns.resolver

def get_domain(email: str) -> str:
    return email.split('@')[1]

def is_valid_domain(domain: str) -> bool:
    try:
        answers = dns.resolver.resolve(domain, 'MX')
        return len(answers) > 0
    except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN,
            dns.resolver.Timeout, dns.resolver.NoNameservers,
            dns.exception.DNSException):
        return False
