from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
import time
from collections import defaultdict

# In-memory rate limiting (for production, use Redis)
rate_limit_store: dict[str, list[float]] = defaultdict(list)

RATE_LIMIT_CONFIG = {
    "default": {"requests": 100, "window": 60},  # 100 requests per minute
    "/api/ai/": {"requests": 20, "window": 60},  # 20 AI requests per minute
    "/api/login": {"requests": 10, "window": 60},  # 10 login attempts per minute
    "/api/register": {"requests": 5, "window": 60},  # 5 registration attempts per minute
    "/api/forgot-password": {"requests": 3, "window": 300},  # 3 per 5 minutes
}


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple in-memory rate limiter middleware."""

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        path = request.url.path

        # Determine the rate limit config
        config = RATE_LIMIT_CONFIG["default"]
        for prefix, cfg in RATE_LIMIT_CONFIG.items():
            if path.startswith(prefix):
                config = cfg
                break

        # Check rate limit
        now = time.time()
        key = f"{client_ip}:{path}"
        window_start = now - config["window"]

        # Clean old entries
        rate_limit_store[key] = [
            t for t in rate_limit_store[key] if t > window_start
        ]

        # Check limit
        if len(rate_limit_store[key]) >= config["requests"]:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Try again in {config['window']} seconds.",
            )

        # Add current request
        rate_limit_store[key].append(now)

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(config["requests"])
        response.headers["X-RateLimit-Remaining"] = str(
            config["requests"] - len(rate_limit_store[key])
        )

        return response
