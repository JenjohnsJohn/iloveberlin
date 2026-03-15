"""AI enrichment pipeline — transforms raw data into API-ready content."""

import json
import re

from src.ai.client import ai_generate
from src.ai import prompts
from src.utils.html import sanitize_html
from src.utils.logging import get_logger

log = get_logger("ai.enricher")


def _parse_json_response(text: str) -> dict:
    """Parse JSON from AI response with multi-strategy recovery.

    Strategies:
    (a) Try json.loads directly
    (b) Strip markdown code fences and retry
    (c) Regex-extract the first {...} block via brace-depth matching
    (d) Strip trailing commas and retry
    (e) On all failures, raise with the raw AI response for debugging
    """
    original = text
    text = text.strip()

    # Strategy (a): direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Strategy (b): strip markdown fences
    if text.startswith("```"):
        lines = text.split("\n")
        lines = [l for l in lines if not l.strip().startswith("```")]
        stripped = "\n".join(lines).strip()
        try:
            return json.loads(stripped)
        except json.JSONDecodeError:
            text = stripped

    # Strategy (c): extract first {...} block via brace-depth matching
    start = text.find("{")
    if start != -1:
        depth = 0
        in_string = False
        escape = False
        end = start
        for i in range(start, len(text)):
            c = text[i]
            if escape:
                escape = False
                continue
            if c == "\\":
                escape = True
                continue
            if c == '"' and not escape:
                in_string = not in_string
                continue
            if in_string:
                continue
            if c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0:
                    end = i
                    break

        if depth == 0 and end > start:
            block = text[start:end + 1]
            try:
                return json.loads(block)
            except json.JSONDecodeError:
                # Strategy (d): strip trailing commas before } or ]
                cleaned = re.sub(r",\s*([}\]])", r"\1", block)
                try:
                    return json.loads(cleaned)
                except json.JSONDecodeError:
                    pass

    # Strategy (d) on full text: strip trailing commas
    cleaned = re.sub(r",\s*([}\]])", r"\1", text)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # All strategies failed — raise with context for debugging
    raise ValueError(
        f"Failed to parse JSON from AI response. "
        f"Raw response (first 500 chars): {original[:500]}"
    )


async def enrich_article_from_rss(raw_data: dict) -> dict:
    """Enrich an RSS article into an original article."""
    user_prompt = prompts.ARTICLE_FROM_RSS_USER.format(
        feed_name=raw_data.get("feed_name", ""),
        title=raw_data.get("title", ""),
        summary=raw_data.get("summary", ""),
    )
    result = await ai_generate(prompts.ARTICLE_FROM_RSS_SYSTEM, user_prompt)
    data = _parse_json_response(result)
    data["body"] = sanitize_html(data.get("body", ""))
    return data


async def enrich_article_original(topic: str) -> dict:
    """Generate a fully original article on a topic."""
    user_prompt = prompts.ARTICLE_ORIGINAL_USER.format(topic=topic)
    result = await ai_generate(prompts.ARTICLE_ORIGINAL_SYSTEM, user_prompt)
    data = _parse_json_response(result)
    data["body"] = sanitize_html(data.get("body", ""))
    return data


async def enrich_event(raw_data: dict) -> dict:
    """Enrich a berlin.de event with a better description."""
    user_prompt = prompts.EVENT_ENRICH_USER.format(
        title=raw_data.get("title", ""),
        date=raw_data.get("date", raw_data.get("published", "")),
        location=raw_data.get("location", ""),
        description=raw_data.get("description", ""),
    )
    result = await ai_generate(prompts.EVENT_ENRICH_SYSTEM, user_prompt)
    data = _parse_json_response(result)
    data["description"] = sanitize_html(data.get("description", ""))
    return data


async def generate_event() -> dict:
    """Generate an original community event."""
    result = await ai_generate(prompts.EVENT_ORIGINAL_SYSTEM, prompts.EVENT_ORIGINAL_USER)
    data = _parse_json_response(result)
    data["description"] = sanitize_html(data.get("description", ""))
    return data


async def enrich_restaurant(raw_data: dict) -> dict:
    """Generate a description for a restaurant from OSM data."""
    user_prompt = prompts.RESTAURANT_ENRICH_USER.format(
        name=raw_data.get("name", ""),
        address=raw_data.get("address", ""),
        district=raw_data.get("district", ""),
        cuisines=", ".join(raw_data.get("cuisines", [])),
        opening_hours_raw=raw_data.get("opening_hours_raw", ""),
    )
    result = await ai_generate(prompts.RESTAURANT_ENRICH_SYSTEM, user_prompt)
    data = _parse_json_response(result)
    data["description"] = sanitize_html(data.get("description", ""))
    return data


async def generate_guide(topic: str, min_words: int = 800, max_words: int = 1500) -> dict:
    """Generate a comprehensive guide."""
    system = prompts.GUIDE_SYSTEM.format(min_words=min_words, max_words=max_words)
    user_prompt = prompts.GUIDE_USER.format(
        topic=topic, min_words=min_words, max_words=max_words
    )
    result = await ai_generate(system, user_prompt, max_tokens=6000)
    data = _parse_json_response(result)
    data["body"] = sanitize_html(data.get("body", ""))
    return data


async def generate_competition() -> dict:
    """Generate a competition/contest."""
    result = await ai_generate(prompts.COMPETITION_SYSTEM, prompts.COMPETITION_USER)
    data = _parse_json_response(result)
    data["description"] = sanitize_html(data.get("description", ""))
    return data
