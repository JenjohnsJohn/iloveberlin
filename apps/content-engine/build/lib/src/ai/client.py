from openai import AsyncOpenAI

from config.settings import settings
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


async def ai_generate(
    system_prompt: str,
    user_prompt: str,
    max_tokens: int = 4000,
) -> str:
    """Generate text using Kimi K2.5 via OpenAI-compatible API."""
    await _rate_limiter.acquire()
    client = get_ai_client()

    try:
        response = await client.chat.completions.create(
            model=settings.kimi_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content or ""
    except Exception as e:
        log.error("AI generation failed", error=str(e))
        raise
    finally:
        await client.close()
