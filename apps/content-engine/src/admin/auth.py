"""Admin panel authentication — session-based with hashed password."""

import hashlib
import hmac
import secrets
from functools import wraps

from fastapi import Request
from fastapi.responses import RedirectResponse
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

from config.settings import settings

SESSION_COOKIE = "ce_session"
SESSION_MAX_AGE = 86400 * 7  # 7 days

_secret_key = settings.admin_password_hash or secrets.token_hex(32)
_serializer = URLSafeTimedSerializer(_secret_key)


def _check_password(password: str) -> bool:
    """Verify password against the stored hash.

    Supports two formats:
    - bcrypt: $2b$... (requires bcrypt package)
    - sha256: sha256:<hex> (simple fallback)
    """
    stored = settings.admin_password_hash
    if not stored:
        return False

    if stored.startswith("$2b$") or stored.startswith("$2a$"):
        try:
            import bcrypt
            return bcrypt.checkpw(password.encode(), stored.encode())
        except ImportError:
            return False
    elif stored.startswith("sha256:"):
        expected = stored[7:]
        actual = hashlib.sha256(password.encode()).hexdigest()
        return hmac.compare_digest(actual, expected)
    else:
        # Treat as plain sha256 hex
        actual = hashlib.sha256(password.encode()).hexdigest()
        return hmac.compare_digest(actual, stored)


def create_session_token() -> str:
    """Create a signed session token."""
    return _serializer.dumps({"authenticated": True})


def verify_session_token(token: str) -> bool:
    """Verify a session token is valid and not expired."""
    try:
        data = _serializer.loads(token, max_age=SESSION_MAX_AGE)
        return data.get("authenticated", False)
    except (BadSignature, SignatureExpired):
        return False


def is_authenticated(request: Request) -> bool:
    """Check if the current request has a valid session.

    Fail-secure: if no password is configured, deny access.
    """
    if not settings.admin_password_hash:
        return False  # No password configured = deny access (fail-secure)
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        return False
    return verify_session_token(token)


def require_auth(func):
    """Decorator to require authentication on admin routes."""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        request = None
        for arg in args:
            if isinstance(arg, Request):
                request = arg
                break
        if request is None:
            request = kwargs.get("request")

        if request and not is_authenticated(request):
            return RedirectResponse(url="/admin/login", status_code=303)

        return await func(*args, **kwargs)
    return wrapper
