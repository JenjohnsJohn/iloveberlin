"""Tests for admin authentication (Phase 1.1)."""

import hashlib

import pytest

from src.admin.auth import (
    _check_password,
    create_session_token,
    verify_session_token,
)


class TestAuth:
    def test_create_and_verify_session_token(self):
        token = create_session_token()
        assert isinstance(token, str)
        assert len(token) > 0
        assert verify_session_token(token) is True

    def test_invalid_token_fails(self):
        assert verify_session_token("invalid-token") is False

    def test_empty_token_fails(self):
        assert verify_session_token("") is False

    def test_sha256_password_check(self):
        """Test sha256: prefix password checking."""
        password = "test-password"
        hashed = "sha256:" + hashlib.sha256(password.encode()).hexdigest()

        # Monkeypatch settings
        import src.admin.auth as auth_module
        original = auth_module.settings.admin_password_hash
        auth_module.settings.admin_password_hash = hashed

        try:
            assert _check_password("test-password") is True
            assert _check_password("wrong-password") is False
        finally:
            auth_module.settings.admin_password_hash = original

    def test_empty_hash_denies_all(self):
        import src.admin.auth as auth_module
        original = auth_module.settings.admin_password_hash
        auth_module.settings.admin_password_hash = ""

        try:
            assert _check_password("anything") is False
        finally:
            auth_module.settings.admin_password_hash = original


class TestMaskValue:
    def test_masks_api_key(self):
        from src.admin.app import _mask_value
        result = _mask_value("kimi_api_key", "sk-1234567890")
        assert "sk-" not in result
        assert "\u2022" in result

    def test_masks_password(self):
        from src.admin.app import _mask_value
        result = _mask_value("admin_password", "secret123")
        assert "secret" not in result

    def test_masks_token(self):
        from src.admin.app import _mask_value
        result = _mask_value("auth_token", "bearer-xyz")
        assert "bearer" not in result

    def test_does_not_mask_normal_value(self):
        from src.admin.app import _mask_value
        result = _mask_value("ai.model", "kimi-k2.5")
        assert result == "kimi-k2.5"

    def test_does_not_mask_schedule(self):
        from src.admin.app import _mask_value
        result = _mask_value("schedule.articles_rss", "0 6 * * *")
        assert result == "0 6 * * *"
