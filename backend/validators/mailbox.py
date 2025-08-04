import httpx
import random

# Optional: rotate through proxy pool
proxies = [
    # "http://your-proxy1:port",
    # "http://your-proxy2:port",
]

async def check(email: str) -> bool:
    domain = email.split("@")[1]
    url = f"http://{domain}"  # Dummy check for now

    try:
        async with httpx.AsyncClient(proxies=random.choice(proxies) if proxies else None, timeout=5) as client:
            resp = await client.get(url)
        return resp.status_code < 400
    except:
        return False
