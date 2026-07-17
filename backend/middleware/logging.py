from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import logging
import time
import json

logger = logging.getLogger("devboard")
logger.setLevel(logging.INFO)

# Add a handler if none exists
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter(
        '%(asctime)s | %(levelname)s | %(name)s | %(message)s'
    ))
    logger.addHandler(handler)


class LoggingMiddleware(BaseHTTPMiddleware):
    """Structured logging middleware for request/response tracking."""

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        # Get request details
        method = request.method
        path = request.url.path
        query_params = dict(request.query_params)
        client_ip = request.client.host if request.client else "unknown"

        # Process the request
        try:
            response = await call_next(request)
            process_time = (time.time() - start_time) * 1000

            # Log request info
            log_data = {
                "method": method,
                "path": path,
                "status_code": response.status_code,
                "duration_ms": round(process_time, 2),
                "client_ip": client_ip,
                "query_params": query_params,
            }

            if response.status_code >= 500:
                logger.error(json.dumps(log_data))
            elif response.status_code >= 400:
                logger.warning(json.dumps(log_data))
            else:
                logger.info(json.dumps(log_data))

            response.headers["X-Process-Time-Ms"] = str(round(process_time, 2))
            return response

        except Exception as e:
            process_time = (time.time() - start_time) * 1000
            log_data = {
                "method": method,
                "path": path,
                "error": str(e),
                "duration_ms": round(process_time, 2),
                "client_ip": client_ip,
            }
            logger.error(json.dumps(log_data))
            raise
