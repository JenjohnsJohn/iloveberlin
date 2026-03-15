"""Tests for AI JSON response parsing (Phase 1.3)."""

import pytest

from src.ai.enricher import _parse_json_response


class TestParseJsonResponse:
    """Test the multi-strategy JSON parser."""

    def test_valid_json_direct(self):
        text = '{"title": "Hello", "body": "World"}'
        result = _parse_json_response(text)
        assert result["title"] == "Hello"
        assert result["body"] == "World"

    def test_json_with_markdown_fences(self):
        text = '```json\n{"title": "Hello"}\n```'
        result = _parse_json_response(text)
        assert result["title"] == "Hello"

    def test_json_with_plain_fences(self):
        text = '```\n{"title": "Hello"}\n```'
        result = _parse_json_response(text)
        assert result["title"] == "Hello"

    def test_json_wrapped_in_prose(self):
        text = 'Here is the JSON response:\n{"title": "Hello", "body": "World"}\nI hope this helps!'
        result = _parse_json_response(text)
        assert result["title"] == "Hello"

    def test_json_with_trailing_comma(self):
        text = '{"title": "Hello", "body": "World",}'
        result = _parse_json_response(text)
        assert result["title"] == "Hello"

    def test_nested_json_extraction(self):
        text = 'Some text {"outer": {"inner": "value"}} more text'
        result = _parse_json_response(text)
        assert result["outer"]["inner"] == "value"

    def test_json_with_trailing_comma_in_array(self):
        text = '{"items": ["a", "b",]}'
        result = _parse_json_response(text)
        assert result["items"] == ["a", "b"]

    def test_whitespace_and_newlines(self):
        text = '\n\n  {"title": "Hello"}  \n\n'
        result = _parse_json_response(text)
        assert result["title"] == "Hello"

    def test_invalid_json_raises_with_context(self):
        text = "This is not JSON at all, just plain text"
        with pytest.raises(ValueError, match="Failed to parse JSON"):
            _parse_json_response(text)

    def test_empty_string_raises(self):
        with pytest.raises((ValueError, Exception)):
            _parse_json_response("")

    def test_json_with_strings_containing_braces(self):
        text = '{"body": "<p>Use {curly} braces</p>"}'
        result = _parse_json_response(text)
        assert "{curly}" in result["body"]

    def test_complex_nested_with_prose(self):
        text = '''Sure! Here's the article:

```json
{
  "title": "Berlin Coffee Guide",
  "subtitle": "The best cafes",
  "body": "<p>Berlin has great coffee.</p>",
  "seo_keywords": "berlin, coffee"
}
```

Let me know if you need changes!'''
        result = _parse_json_response(text)
        assert result["title"] == "Berlin Coffee Guide"
        assert result["seo_keywords"] == "berlin, coffee"
