"""Admin panel authentication — session-based with hashed password."""

import hashlib
import os
from functools import wraps

from fastapi import Request
from fastapi.responses import RedirectResponse
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

from config.settings import settings

SESSION_COOKIE = "ce_session"
SESSION_MAX_AGE = 86400 * 7  # 7 days


def _get_secret_key() -> str:
    """Derive a stable secret key for session signing.

    Priority:
    1. ADMIN_SECRET_KEY environment variable (explicit)
    2. HMAC-SHA256 of the admin password hash (stable, derived)
    Falls back to nothing — if neither is available, session signing
    will fail, which is fail-secure (no login possible).
    """
    env_key = os.environ.get("ADMIN_SECRET_KEY", "").strip()
    if env_key:
        return env_key
    if settings.admin_password_hash:
        return hashlib.sha256(
            f"session-secret:{settings.admin_password_hash}".encode()
        ).hexdigest()
    return ""


_secret_key = _get_secret_key()
_serializer = URLSafeTimedSerializer(_secret_key) if _secret_key else None


def _check_password(password: str) -> bool:
    """Verify password against the stored bcrypt hash."""
    stored = settings.admin_password_hash
    if not stored:
        return False

    if stored.startswith("$2b$") or stored.startswith("$2a$"):
        try:
            import bcrypt
            return bcrypt.checkpw(password.encode(), stored.encode())
        except ImportError:
            return False

    return False


def create_session_token() -> str:
    """Create a signed session token."""
    if not _serializer:
        return ""
    return _serializer.dumps({"authenticated": True})


def verify_session_token(token: str) -> bool:
    """Verify a session token is valid and not expired."""
    if not _serializer:
        return False
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
