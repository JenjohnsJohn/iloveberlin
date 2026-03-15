from datetime import datetime, timezone

from openai import AsyncOpenAI

from config.settings import settings
from src.db.settings import get_setting, set_setting
from src.utils.logging import get_logger
from src.utils.rate_limiter import TokenBucketRateLimiter

log = get_logger("ai.client")

# Rate limit: ~2 requests/second to be safe with Kimi API
_rate_limiter = TokenBucketRateLimiter(rate=2.0, burst=3)


def get_ai_client() -> AsyncOpenAI:
    return AsyncOpenAI(
        api_key=settings.kimi_api_key,
        base_url=settings.kimi_base_url,
    )


async def _track_token_usage(prompt_tokens: int, completion_tokens: int):
    """Phase 5.1: track daily AI token usage in DB settings."""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    key = f"ai.tokens.{today}"
    current = await get_setting(key, "0:0")
    try:
        parts = current.split(":")
        old_prompt = int(parts[0])
        old_completion = int(parts[1]) if len(parts) > 1 else 0
    except (ValueError, IndexError):
        old_prompt, old_completion = 0, 0

    new_prompt = old_prompt + prompt_tokens
    new_completion = old_completion + completion_tokens
    await set_setting(
        key,
        f"{new_prompt}:{new_completion}",
        f"AI token usage for {today} (prompt:completion)",
    )


async def ai_generate(
    system_prompt: str,
    user_prompt: str,
    max_tokens: int = 4000,
) -> str:
    """Generate text using Kimi K2.5 via OpenAI-compatible API."""
    await _rate_limiter.acquire()
    client = get_ai_client()

    # Phase 3.4: read model from DB setting, fall back to env var
    model = await get_setting("ai.model", settings.kimi_model)

    try:
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=max_tokens,
        )

        # Phase 5.1: track token usage
        if response.usage:
            await _track_token_usage(
                response.usage.prompt_tokens or 0,
                response.usage.completion_tokens or 0,
            )

        return response.choices[0].message.content or ""
    except Exception as e:
        log.error("AI generation failed", error=str(e))
        raise
    finally:
        await client.close()
